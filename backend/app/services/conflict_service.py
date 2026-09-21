"""
Conflict detection service.

Extracts structured facts from evidence records, groups by topic,
compares values across documents, and stores conflict records.
"""

import logging
import re
from datetime import datetime, timezone
from typing import Dict, List, Optional

from google.cloud.firestore import Client

logger = logging.getLogger(__name__)

CASES = "cases"
EVIDENCE_SUB = "evidence"
CONFLICTS_SUB = "conflicts"

NOTICE_PERIOD_PATTERNS = [
    r"(\d+)\s*(?:day|days)",
    r"(\d+)\s*(?:week|weeks)",
    r"(\d+)\s*(?:month|months)",
]

NOTICE_KEYWORDS = [
    "notice",
    "notice period",
    "termination notice",
    "resignation",
]


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _extract_notice_days(text: str) -> Optional[int]:
    text_lower = text.lower()
    for pattern in NOTICE_PERIOD_PATTERNS:
        match = re.search(pattern, text_lower)
        if match:
            value = int(match.group(1))
            if "week" in text_lower:
                return value * 7
            if "month" in text_lower:
                return value * 30
            return value
    return None


def detect_conflicts_from_evidence(
    db: Client, case_id: str, documents: List[Dict]
) -> List[Dict]:
    """
    Pull evidence from Firestore, group by topic, compare across docs.
    Returns list of conflict dicts ready to be stored.
    """
    evidence_docs = list(
        db.collection(CASES)
        .document(case_id)
        .collection(EVIDENCE_SUB)
        .stream()
    )
    evidence_list = [{"id": d.id, **d.to_dict()} for d in evidence_docs]

    conflicts = []

    # ── Notice period conflict ──────────────────────────────────────────────
    notice_evidence = [
        e
        for e in evidence_list
        if any(kw in e.get("text", "").lower() for kw in NOTICE_KEYWORDS)
        or e.get("topic", "").lower() in ("termination", "notice_period")
    ]

    # Group by document
    notice_by_doc: Dict[str, List[Dict]] = {}
    for ev in notice_evidence:
        doc_id = ev.get("documentId", "")
        notice_by_doc.setdefault(doc_id, []).append(ev)

    # Compare notice values across docs
    notice_values = []
    for doc_id, evs in notice_by_doc.items():
        for ev in evs:
            days = _extract_notice_days(ev.get("text", ""))
            if days is not None:
                doc_name = ev.get("documentName", doc_id)
                notice_values.append(
                    {
                        "days": days,
                        "documentId": doc_id,
                        "documentName": doc_name,
                        "page": ev.get("page"),
                        "section": ev.get("section", ""),
                        "text": ev.get("text", ""),
                    }
                )

    # Find distinct notice values
    unique_values = {v["days"] for v in notice_values}
    if len(unique_values) > 1 and len(notice_values) >= 2:
        ev_a = notice_values[0]
        ev_b = next(
            (v for v in notice_values if v["days"] != ev_a["days"]), None
        )
        if ev_b:
            conflicts.append(
                {
                    "topic": "Notice Period",
                    "description": (
                        f"The uploaded documents contain different notice period values. "
                        f"One document states {ev_a['days']} days while another states "
                        f"{ev_b['days']} days. "
                        "Information differs across the uploaded documents — "
                        "this section may need review with a qualified legal professional."
                    ),
                    "status": "needs_review",
                    "evidence": [
                        {
                            "documentId": ev_a["documentId"],
                            "documentName": ev_a["documentName"],
                            "page": ev_a["page"],
                            "section": ev_a["section"],
                            "text": ev_a["text"],
                        },
                        {
                            "documentId": ev_b["documentId"],
                            "documentName": ev_b["documentName"],
                            "page": ev_b["page"],
                            "section": ev_b["section"],
                            "text": ev_b["text"],
                        },
                    ],
                    "createdAt": _now_iso(),
                }
            )

    return conflicts
