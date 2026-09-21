"""
Reference detection service.
Stores and queries detected external document references.
"""

import logging
from typing import Dict, List
from google.cloud.firestore import Client

logger = logging.getLogger(__name__)

CASES = "cases"
REFERENCES_SUB = "references"


def list_references(db: Client, case_id: str) -> List[Dict]:
    docs = (
        db.collection(CASES)
        .document(case_id)
        .collection(REFERENCES_SUB)
        .stream()
    )
    return [{"id": d.id, "caseId": case_id, **d.to_dict()} for d in docs]


def get_missing_references(db: Client, case_id: str) -> List[Dict]:
    docs = (
        db.collection(CASES)
        .document(case_id)
        .collection(REFERENCES_SUB)
        .where("status", "==", "MISSING_INFORMATION")
        .stream()
    )
    return [{"id": d.id, "caseId": case_id, **d.to_dict()} for d in docs]
