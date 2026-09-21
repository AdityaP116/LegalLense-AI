from fastapi import APIRouter, Depends, HTTPException, status
from google.cloud.firestore import Client

from app.core.auth import get_current_user
from app.core.dependencies import get_firestore
from app.services import brief_service
from app.services.case_service import get_case

router = APIRouter(tags=["Brief"])


@router.get("/cases/{case_id}/brief", response_model=dict)
def get_brief(
    case_id: str,
    user: dict = Depends(get_current_user),
    db: Client = Depends(get_firestore),
):
    get_case(db, case_id, user["uid"])
    brief = brief_service.get_brief(db, case_id)
    if not brief:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No brief generated yet. Call POST /brief/generate first.",
        )
    return {"data": brief}


@router.post("/cases/{case_id}/brief/generate", response_model=dict)
def generate_brief(
    case_id: str,
    user: dict = Depends(get_current_user),
    db: Client = Depends(get_firestore),
):
    get_case(db, case_id, user["uid"])
    brief = brief_service.generate_brief(db, case_id)
    return {"data": brief, "message": "Brief generated."}
