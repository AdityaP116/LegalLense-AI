"""
Timeline service — collect dated events from evidence, sort chronologically.
"""

import logging
from datetime import datetime, timezone
from typing import Dict, List

from google.cloud.firestore import Client

logger = logging.getLogger(__name__)

CASES = "cases"
TIMELINE_SUB = "timelineEvents"


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def build_timeline(
    db: Client, case_id: str, evidence_list: List[Dict]
) -> None:
    """Build timeline events from date-type evidence and store in Firestore."""
    date_evidence = [
        e for e in evidence_list if e.get("evidenceType") == "date"
    ]

    for ev in date_evidence:
        event = {
            "caseId": case_id,
            "eventDate": ev.get("extractedDate"),
            "title": ev.get("text", "Event"),
            "description": ev.get("text", ""),
            "documentId": ev.get("documentId"),
            "documentName": ev.get("documentName", ""),
            "page": ev.get("page"),
            "status": (
                "confirmed" if ev.get("extractedDate") else "needs_review"
            ),
            "createdAt": _now_iso(),
        }
        db.collection(CASES).document(case_id).collection(TIMELINE_SUB).add(
            event
        )


def get_timeline(db: Client, case_id: str) -> List[Dict]:
    docs = (
        db.collection(CASES)
        .document(case_id)
        .collection(TIMELINE_SUB)
        .stream()
    )
    events = [{"id": d.id, "caseId": case_id, **d.to_dict()} for d in docs]

    # Sort: confirmed dates first, then needs_review; None dates at end
    def sort_key(ev):
        date_str = ev.get("eventDate")
        if date_str:
            try:
                return (
                    0,
                    datetime.fromisoformat(date_str.replace("Z", "+00:00")),
                )
            except ValueError:
                pass
        return (1, datetime.min.replace(tzinfo=timezone.utc))

    return sorted(events, key=sort_key)
