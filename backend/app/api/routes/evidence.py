from fastapi import APIRouter, Depends
from google.cloud.firestore import Client

from app.core.auth import get_current_user
from app.core.dependencies import get_firestore
from app.services import evidence_service
from app.services.case_service import get_case

router = APIRouter(tags=["Evidence"])


@router.get("/cases/{case_id}/evidence", response_model=dict)
def list_evidence(
    case_id: str,
    user: dict = Depends(get_current_user),
    db: Client = Depends(get_firestore),
):
    get_case(db, case_id, user["uid"])
    items = evidence_service.list_evidence(db, case_id)
    return {"data": items}


@router.get("/evidence/{evidence_id}", response_model=dict)
def get_evidence(
    evidence_id: str,
    user: dict = Depends(get_current_user),
    db: Client = Depends(get_firestore),
):
    item = evidence_service.get_evidence_item(db, evidence_id, user["uid"])
    return {"data": item}
