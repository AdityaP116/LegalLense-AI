"""
Case service — Firestore CRUD with ownership enforcement.
"""

import logging
from datetime import datetime, timezone
from typing import Dict, List

from google.cloud.firestore import Client

logger = logging.getLogger(__name__)

CASES_COLLECTION = "cases"
USERS_COLLECTION = "users"


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _assert_ownership(case_data: Dict, uid: str) -> None:
    if case_data.get("userId") != uid:
        from fastapi import HTTPException, status

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this case.",
        )


def _not_found(case_id: str):
    from fastapi import HTTPException, status

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Case {case_id} not found.",
    )


# ── User document ──────────────────────────────────────────────────────────


def ensure_user_document(
    db: Client, uid: str, email: str, name: str = ""
) -> None:
    """Create or update the users/{uid} document on login."""
    ref = db.collection(USERS_COLLECTION).document(uid)
    doc = ref.get()
    if not doc.exists:
        ref.set(
            {
                "uid": uid,
                "email": email,
                "name": name,
                "createdAt": _now_iso(),
                "updatedAt": _now_iso(),
            }
        )
    else:
        ref.update({"updatedAt": _now_iso(), "email": email})


# ── Cases ──────────────────────────────────────────────────────────────────


def create_case(db: Client, uid: str, data: Dict) -> Dict:
    now = _now_iso()
    case_data = {
        "userId": uid,
        "title": data["title"],
        "category": data["category"],
        "situation": data["situation"],
        "goals": data.get("goals", []),
        "status": "active",
        "createdAt": now,
        "updatedAt": now,
    }
    _, ref = db.collection(CASES_COLLECTION).add(case_data)
    return {"id": ref.id, **case_data}


def list_cases(db: Client, uid: str) -> List[Dict]:
    query = (
        db.collection(CASES_COLLECTION)
        .where("userId", "==", uid)
        .order_by("createdAt", direction="DESCENDING")
    )
    docs = query.stream()
    return [{"id": doc.id, **doc.to_dict()} for doc in docs]


def get_case(db: Client, case_id: str, uid: str) -> Dict:
    ref = db.collection(CASES_COLLECTION).document(case_id)
    doc = ref.get()
    if not doc.exists:
        _not_found(case_id)
    data = doc.to_dict()
    _assert_ownership(data, uid)
    return {"id": doc.id, **data}


def update_case(db: Client, case_id: str, uid: str, updates: Dict) -> Dict:
    ref = db.collection(CASES_COLLECTION).document(case_id)
    doc = ref.get()
    if not doc.exists:
        _not_found(case_id)
    _assert_ownership(doc.to_dict(), uid)

    allowed_keys = {"title", "category", "situation", "goals", "status"}
    clean = {
        k: v for k, v in updates.items() if k in allowed_keys and v is not None
    }
    clean["updatedAt"] = _now_iso()
    ref.update(clean)

    updated = ref.get().to_dict()
    return {"id": case_id, **updated}


def delete_case(db: Client, case_id: str, uid: str) -> None:
    ref = db.collection(CASES_COLLECTION).document(case_id)
    doc = ref.get()
    if not doc.exists:
        _not_found(case_id)
    _assert_ownership(doc.to_dict(), uid)
    ref.delete()
