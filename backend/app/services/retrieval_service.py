"""
Retrieval service — keyword + metadata based retrieval for Q&A.

MVP uses keyword matching against stored chunks.
The interface is designed to be replaceable with vector search later.
"""

import logging
import re
from typing import Dict, List

from google.cloud.firestore import Client

logger = logging.getLogger(__name__)

CASES = "cases"
CHUNKS_SUB = "chunks"


def retrieve(
    db: Client, case_id: str, query: str, max_results: int = 8
) -> List[Dict]:
    """
    Retrieve the most relevant document chunks for a given query.

    Strategy:
    1. Score each chunk by keyword overlap with the query
    2. Return top-N results with source metadata
    """
    # Load all chunks for the case
    docs = (
        db.collection(CASES).document(case_id).collection(CHUNKS_SUB).stream()
    )
    chunks = [{"id": d.id, **d.to_dict()} for d in docs]

    if not chunks:
        return []

    # Keyword scoring
    query_words = set(re.findall(r"\b\w+\b", query.lower()))
    # Remove common stop words
    stop_words = {
        "the",
        "a",
        "an",
        "is",
        "in",
        "of",
        "and",
        "to",
        "my",
        "what",
        "how",
        "does",
    }
    query_words -= stop_words

    scored = []
    for chunk in chunks:
        text_lower = chunk.get("text", "").lower()
        score = sum(1 for word in query_words if word in text_lower)
        if score > 0:
            scored.append((score, chunk))

    # Sort by score descending
    scored.sort(key=lambda x: x[0], reverse=True)
    return [chunk for _, chunk in scored[:max_results]]
