"""
Question service — CRUD + AI-based question generation.
"""

import logging
from datetime import datetime, timezone
from typing import Dict, List

from fastapi import HTTPException, status
from google.cloud.firestore import Client

logger = logging.getLogger(__name__)

CASES = "cases"
QUESTIONS_SUB = "questions"
CONFLICTS_SUB = "conflicts"
REFERENCES_SUB = "references"


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _not_found(question_id: str):
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Question {question_id} not found.",
    )


def list_questions(db: Client, case_id: str) -> List[Dict]:
    docs = (
        db.collection(CASES)
        .document(case_id)
        .collection(QUESTIONS_SUB)
        .stream()
    )
    return [{"id": d.id, "caseId": case_id, **d.to_dict()} for d in docs]


def create_question(db: Client, case_id: str, data: Dict) -> Dict:
    now = _now_iso()
    q_data = {
        "caseId": case_id,
        "question": data["question"],
        "category": data.get("category"),
        "rationale": data.get("rationale"),
        "status": "open",
        "sources": data.get("sources", []),
        "origin": "user_added",
        "createdAt": now,
        "updatedAt": now,
    }
    _, ref = (
        db.collection(CASES)
        .document(case_id)
        .collection(QUESTIONS_SUB)
        .add(q_data)
    )
    return {"id": ref.id, **q_data}


def update_question(
    db: Client, case_id: str, question_id: str, uid: str, updates: Dict
) -> Dict:
    # Verify case ownership
    from app.services.case_service import get_case

    get_case(db, case_id, uid)

    ref = (
        db.collection(CASES)
        .document(case_id)
        .collection(QUESTIONS_SUB)
        .document(question_id)
    )
    doc = ref.get()
    if not doc.exists:
        _not_found(question_id)

    allowed = {"question", "category", "rationale", "status"}
    clean = {
        k: v for k, v in updates.items() if k in allowed and v is not None
    }
    clean["updatedAt"] = _now_iso()
    ref.update(clean)

    return {"id": question_id, "caseId": case_id, **ref.get().to_dict()}


def delete_question(
    db: Client, case_id: str, question_id: str, uid: str
) -> None:
    from app.services.case_service import get_case

    get_case(db, case_id, uid)

    ref = (
        db.collection(CASES)
        .document(case_id)
        .collection(QUESTIONS_SUB)
        .document(question_id)
    )
    if not ref.get().exists:
        _not_found(question_id)
    ref.delete()


def generate_questions(db: Client, case_id: str) -> List[Dict]:
    """Generate questions based on case analysis (conflicts + missing refs)."""
    from app.services import ai_service

    # Get case context
    case_doc = db.collection(CASES).document(case_id).get()
    if not case_doc.exists:
        return []
    case_data = case_doc.to_dict()

    # Get conflicts
    conflict_docs = (
        db.collection(CASES)
        .document(case_id)
        .collection(CONFLICTS_SUB)
        .stream()
    )
    conflicts = [d.to_dict() for d in conflict_docs]

    # Get missing references
    ref_docs = (
        db.collection(CASES)
        .document(case_id)
        .collection(REFERENCES_SUB)
        .where("status", "==", "MISSING_INFORMATION")
        .stream()
    )
    missing_refs = [d.to_dict() for d in ref_docs]

    # Generate via AI
    generated = ai_service.generate_questions(
        case_data, conflicts, missing_refs
    )

    # Store in Firestore
    now = _now_iso()
    stored = []
    for q in generated:
        q_data = {
            "caseId": case_id,
            "question": q.get("question", ""),
            "category": q.get("category"),
            "rationale": q.get("rationale"),
            "status": "open",
            "sources": [],
            "origin": "generated",
            "createdAt": now,
            "updatedAt": now,
        }
        _, ref = (
            db.collection(CASES)
            .document(case_id)
            .collection(QUESTIONS_SUB)
            .add(q_data)
        )
        stored.append({"id": ref.id, **q_data})

    return stored
