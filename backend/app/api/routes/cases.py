from fastapi import APIRouter, Depends
from google.cloud.firestore import Client

from app.core.auth import get_current_user
from app.core.dependencies import get_firestore
from app.schemas.case import CaseCreate, CaseUpdate
from app.services import case_service

router = APIRouter(prefix="/cases", tags=["Cases"])


@router.post("", response_model=dict)
def create_case(
    body: CaseCreate,
    user: dict = Depends(get_current_user),
    db: Client = Depends(get_firestore),
):
    case_service.ensure_user_document(
        db, user["uid"], user["email"], user.get("name", "")
    )
    case = case_service.create_case(db, user["uid"], body.model_dump())
    return {"data": case, "message": "Case created."}


@router.get("", response_model=dict)
def list_cases(
    user: dict = Depends(get_current_user),
    db: Client = Depends(get_firestore),
):
    cases = case_service.list_cases(db, user["uid"])
    return {"data": cases}


@router.get("/{case_id}", response_model=dict)
def get_case(
    case_id: str,
    user: dict = Depends(get_current_user),
    db: Client = Depends(get_firestore),
):
    case = case_service.get_case(db, case_id, user["uid"])
    return {"data": case}


@router.patch("/{case_id}", response_model=dict)
def update_case(
    case_id: str,
    body: CaseUpdate,
    user: dict = Depends(get_current_user),
    db: Client = Depends(get_firestore),
):
    case = case_service.update_case(
        db, case_id, user["uid"], body.model_dump(exclude_none=True)
    )
    return {"data": case, "message": "Case updated."}


@router.delete("/{case_id}", response_model=dict)
def delete_case(
    case_id: str,
    user: dict = Depends(get_current_user),
    db: Client = Depends(get_firestore),
):
    case_service.delete_case(db, case_id, user["uid"])
    return {"message": "Case deleted."}
