"""
Evidence service — read evidence records with source metadata.
"""

import logging
from typing import Dict, List

from fastapi import HTTPException, status
from google.cloud.firestore import Client

logger = logging.getLogger(__name__)

CASES = "cases"
EVIDENCE_SUB = "evidence"


def list_evidence(db: Client, case_id: str) -> List[Dict]:
    docs = (
        db.collection(CASES)
        .document(case_id)
        .collection(EVIDENCE_SUB)
        .stream()
    )
    return [{"id": d.id, "caseId": case_id, **d.to_dict()} for d in docs]


def get_evidence_item(db: Client, evidence_id: str, uid: str) -> Dict:
    """
    Find a single evidence record by ID, confirming the owning case belongs to uid.
    """
    from app.services.case_service import CASES_COLLECTION

    cases_query = (
        db.collection(CASES_COLLECTION).where("userId", "==", uid).stream()
    )
    for case_doc in cases_query:
        ref = (
            db.collection(CASES)
            .document(case_doc.id)
            .collection(EVIDENCE_SUB)
            .document(evidence_id)
        )
        doc = ref.get()
        if doc.exists:
            return {"id": doc.id, "caseId": case_doc.id, **doc.to_dict()}

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Evidence {evidence_id} not found.",
    )
