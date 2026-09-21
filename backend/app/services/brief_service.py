"""
Brief service — assembles case data and generates a preparation brief.
"""

import logging
from datetime import datetime, timezone
from typing import Dict, Optional

from fastapi import HTTPException, status
from google.cloud.firestore import Client

logger = logging.getLogger(__name__)

CASES = "cases"
BRIEFS_SUB = "briefs"
DOCUMENTS_SUB = "documents"
EVIDENCE_SUB = "evidence"
CONFLICTS_SUB = "conflicts"
REFERENCES_SUB = "references"
TIMELINE_SUB = "timelineEvents"
QUESTIONS_SUB = "questions"

DISCLAIMER = (
    "This preparation brief is generated from the documents uploaded to your workspace. "
    "It is intended to help you prepare for a conversation with a qualified legal professional. "
    "It does not constitute legal advice and should not be relied upon as such. "
    "LegalLens identifies information found in your documents — "
    "it does not determine legal rights, outcomes, or which document is legally controlling. "
    "Please consult a qualified legal professional for advice specific to your situation."
)


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def get_brief(db: Client, case_id: str) -> Optional[Dict]:
    docs = (
        db.collection(CASES)
        .document(case_id)
        .collection(BRIEFS_SUB)
        .order_by("generatedAt", direction="DESCENDING")
        .limit(1)
        .stream()
    )
    docs_list = list(docs)
    if not docs_list:
        return None
    d = docs_list[0]
    return {"id": d.id, "caseId": case_id, **d.to_dict()}


def generate_brief(db: Client, case_id: str) -> Dict:
    """Assemble case data and generate a preparation brief."""
    from app.services import ai_service

    # Load case
    case_doc = db.collection(CASES).document(case_id).get()
    if not case_doc.exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Case not found."
        )
    case_data = case_doc.to_dict()

    # Load documents
    docs = list(
        db.collection(CASES)
        .document(case_id)
        .collection(DOCUMENTS_SUB)
        .stream()
    )
    documents = [{"id": d.id, **d.to_dict()} for d in docs]

    # Load conflicts
    conflict_docs = list(
        db.collection(CASES)
        .document(case_id)
        .collection(CONFLICTS_SUB)
        .stream()
    )
    conflicts = [d.to_dict() for d in conflict_docs]

    # Load missing references
    ref_docs = (
        db.collection(CASES)
        .document(case_id)
        .collection(REFERENCES_SUB)
        .where("status", "==", "MISSING_INFORMATION")
        .stream()
    )
    missing_refs = [d.to_dict() for d in ref_docs]

    # Load timeline
    timeline_docs = list(
        db.collection(CASES)
        .document(case_id)
        .collection(TIMELINE_SUB)
        .stream()
    )
    timeline = [d.to_dict() for d in timeline_docs]

    # Load questions
    question_docs = list(
        db.collection(CASES)
        .document(case_id)
        .collection(QUESTIONS_SUB)
        .stream()
    )
    questions = [d.to_dict() for d in question_docs]

    # Assemble context
    context = {
        **case_data,
        "documentsReviewed": [
            {"filename": d.get("filename"), "pageCount": d.get("pageCount")}
            for d in documents
        ],
        "conflicts": conflicts,
        "missingReferences": missing_refs,
        "timeline": timeline,
        "questions": [q.get("question") for q in questions],
    }

    evidence_summary = {
        "totalDocuments": len(documents),
        "conflicts": len(conflicts),
        "missingReferences": len(missing_refs),
        "timelineEvents": len(timeline),
    }

    # Generate via AI
    sections = ai_service.generate_brief(context, evidence_summary)

    now = _now_iso()
    brief_data = {
        "caseId": case_id,
        "sections": sections,
        "disclaimer": DISCLAIMER,
        "generatedAt": now,
    }

    _, ref = (
        db.collection(CASES)
        .document(case_id)
        .collection(BRIEFS_SUB)
        .add(brief_data)
    )
    return {"id": ref.id, **brief_data}
