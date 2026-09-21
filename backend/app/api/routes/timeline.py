from fastapi import APIRouter, BackgroundTasks, Depends
from google.cloud.firestore import Client

from app.core.auth import get_current_user
from app.core.dependencies import get_firestore
from app.services import timeline_service
from app.services.case_service import get_case

router = APIRouter(tags=["Timeline"])


@router.get("/cases/{case_id}/timeline", response_model=dict)
def get_timeline(
    case_id: str,
    user: dict = Depends(get_current_user),
    db: Client = Depends(get_firestore),
):
    get_case(db, case_id, user["uid"])
    events = timeline_service.get_timeline(db, case_id)
    return {"data": events}


@router.post("/cases/{case_id}/timeline/generate", response_model=dict)
def generate_timeline(
    case_id: str,
    background_tasks: BackgroundTasks,
    user: dict = Depends(get_current_user),
    db: Client = Depends(get_firestore),
):
    get_case(db, case_id, user["uid"])
    # Rebuild from stored evidence
    evidence_docs = (
        db.collection("cases")
        .document(case_id)
        .collection("evidence")
        .stream()
    )
    evidence_list = [d.to_dict() for d in evidence_docs]
    background_tasks.add_task(
        timeline_service.build_timeline, db, case_id, evidence_list
    )
    return {"message": "Timeline generation started."}
