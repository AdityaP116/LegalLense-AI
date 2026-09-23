"""
Conflict detection service — LLM-based generalized conflict detection.

Extracts all evidence from Firestore, groups by topic, and passes the
structured facts to the Gemini AI model to identify contradictions across
any topic — not just notice periods.
"""

import logging
from datetime import datetime, timezone
from typing import Dict, List

from google.cloud.firestore import Client

logger = logging.getLogger(__name__)

CASES = "cases"
EVIDENCE_SUB = "evidence"
CONFLICTS_SUB = "conflicts"


import re
from typing import Dict, List, Optional

def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _extract_notice_days(text: str) -> Optional[int]:
    """Helper function to extract notice period in days from text."""
    if not text:
        return None
    match_days = re.search(r"(\d+)\s*days?", text, re.IGNORECASE)
    if match_days:
        return int(match_days.group(1))
    match_weeks = re.search(r"(\d+)\s*weeks?", text, re.IGNORECASE)
    if match_weeks:
        return int(match_weeks.group(1)) * 7
    match_months = re.search(r"(\d+)\s*months?", text, re.IGNORECASE)
    if match_months:
        return int(match_months.group(1)) * 30
    return None



def _build_facts_by_topic(evidence_list: List[Dict]) -> Dict[str, List[Dict]]:
    """
    Group evidence records by their topic field, building a dict of:
      { "topic_name": [{ value, doc, page, section, documentId }, ...], ... }

    Only include topics that have evidence from more than one document,
    as single-document topics cannot have cross-document conflicts.
    """
    # First pass: group by topic
    raw: Dict[str, List[Dict]] = {}
    for ev in evidence_list:
        topic = (ev.get("topic") or ev.get("section") or "general").strip().lower()
        if not topic or topic == "date":
            # Skip date evidence — dates don't conflict in the same way
            continue
        raw.setdefault(topic, []).append({
            "value": ev.get("text", ""),
            "documentId": ev.get("documentId", ""),
            "documentName": ev.get("documentName", ""),
            "page": ev.get("page"),
            "section": ev.get("section", ""),
        })

    # Second pass: only keep topics with evidence from multiple documents
    multi_doc: Dict[str, List[Dict]] = {}
    for topic, facts in raw.items():
        doc_ids = {f["documentId"] for f in facts}
        if len(doc_ids) > 1:
            multi_doc[topic] = facts

    return multi_doc


def _normalize_conflict(conflict: Dict, case_id: str) -> Dict:
    """
    Normalize LLM-returned conflict to the Firestore schema.
    LLM returns evidenceA/evidenceB; schema expects evidence: [...]
    """
    evidence = conflict.get("evidence", [])

    # Handle LLM returning evidenceA / evidenceB format
    if not evidence:
        ev_a = conflict.get("evidenceA")
        ev_b = conflict.get("evidenceB")
        if ev_a:
            evidence.append(ev_a)
        if ev_b:
            evidence.append(ev_b)

    return {
        "caseId": case_id,
        "topic": conflict.get("topic", "Unknown"),
        "description": conflict.get("description", ""),
        "status": conflict.get("status", "needs_review"),
        "evidence": evidence,
        "createdAt": _now_iso(),
    }


def detect_conflicts_from_evidence(
    db: Client, case_id: str, documents: List[Dict]
) -> List[Dict]:
    """
    Pull evidence from Firestore, group by topic, then use the LLM to
    detect contradictions across all topics.

    Returns a list of conflict dicts ready to be stored in Firestore.
    """
    from app.services import ai_service

    # Load all evidence for the case
    evidence_docs = list(
        db.collection(CASES)
        .document(case_id)
        .collection(EVIDENCE_SUB)
        .stream()
    )
    evidence_list = [{"id": d.id, **d.to_dict()} for d in evidence_docs]

    if not evidence_list:
        logger.info("No evidence found for case %s — skipping conflict detection", case_id)
        return []

    # Build structured facts grouped by topic
    facts_by_topic = _build_facts_by_topic(evidence_list)

    if not facts_by_topic:
        logger.info(
            "No multi-document evidence topics found for case %s — no conflicts possible",
            case_id,
        )
        return []

    logger.info(
        "Detecting conflicts for case %s across %d topics: %s",
        case_id,
        len(facts_by_topic),
        list(facts_by_topic.keys()),
    )

    # Call the LLM-based conflict detector
    raw_conflicts = ai_service.detect_conflicts(facts_by_topic)

    # Normalize and return
    normalized = [_normalize_conflict(c, case_id) for c in raw_conflicts]
    logger.info(
        "Found %d conflict(s) for case %s", len(normalized), case_id
    )
    return normalized
