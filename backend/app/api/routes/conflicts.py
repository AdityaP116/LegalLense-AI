from fastapi import APIRouter, Depends
from google.cloud.firestore import Client

from app.core.auth import get_current_user
from app.core.dependencies import get_firestore
from app.services.case_service import get_case

router = APIRouter(tags=["Conflicts"])


@router.get("/cases/{case_id}/conflicts", response_model=dict)
def list_conflicts(
    case_id: str,
    user: dict = Depends(get_current_user),
    db: Client = Depends(get_firestore),
):
    get_case(db, case_id, user["uid"])
    docs = (
        db.collection("cases")
        .document(case_id)
        .collection("conflicts")
        .stream()
    )
    conflicts = [{"id": d.id, "caseId": case_id, **d.to_dict()} for d in docs]
    return {"data": conflicts}
