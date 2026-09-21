from fastapi import APIRouter, Depends
from google.cloud.firestore import Client

from app.core.auth import get_current_user
from app.core.dependencies import get_firestore
from app.schemas.question import QuestionCreate, QuestionUpdate
from app.services import question_service
from app.services.case_service import get_case

router = APIRouter(tags=["Questions"])


@router.get("/cases/{case_id}/questions", response_model=dict)
def list_questions(
    case_id: str,
    user: dict = Depends(get_current_user),
    db: Client = Depends(get_firestore),
):
    get_case(db, case_id, user["uid"])
    questions = question_service.list_questions(db, case_id)
    return {"data": questions}


@router.post("/cases/{case_id}/questions", response_model=dict)
def create_question(
    case_id: str,
    body: QuestionCreate,
    user: dict = Depends(get_current_user),
    db: Client = Depends(get_firestore),
):
    get_case(db, case_id, user["uid"])
    q = question_service.create_question(db, case_id, body.model_dump())
    return {"data": q, "message": "Question added."}


@router.patch("/questions/{question_id}", response_model=dict)
def update_question(
    question_id: str,
    body: QuestionUpdate,
    case_id: str,  # passed as query param
    user: dict = Depends(get_current_user),
    db: Client = Depends(get_firestore),
):
    q = question_service.update_question(
        db,
        case_id,
        question_id,
        user["uid"],
        body.model_dump(exclude_none=True),
    )
    return {"data": q, "message": "Question updated."}


@router.delete("/questions/{question_id}", response_model=dict)
def delete_question(
    question_id: str,
    case_id: str,  # passed as query param
    user: dict = Depends(get_current_user),
    db: Client = Depends(get_firestore),
):
    question_service.delete_question(db, case_id, question_id, user["uid"])
    return {"message": "Question deleted."}


@router.post("/cases/{case_id}/questions/generate", response_model=dict)
def generate_questions(
    case_id: str,
    user: dict = Depends(get_current_user),
    db: Client = Depends(get_firestore),
):
    get_case(db, case_id, user["uid"])
    questions = question_service.generate_questions(db, case_id)
    return {
        "data": questions,
        "message": f"{len(questions)} questions generated.",
    }
