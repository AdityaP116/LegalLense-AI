from fastapi import APIRouter, BackgroundTasks, Depends
from google.cloud.firestore import Client

from app.core.auth import get_current_user
from app.core.dependencies import get_firestore, get_storage_bucket
from app.services import analysis_service
from app.services.case_service import get_case

router = APIRouter(tags=["Analysis"])


@router.post("/cases/{case_id}/analyze", response_model=dict)
def trigger_analysis(
    case_id: str,
    background_tasks: BackgroundTasks,
    user: dict = Depends(get_current_user),
    db: Client = Depends(get_firestore),
    bucket=Depends(get_storage_bucket),
):
    get_case(db, case_id, user["uid"])  # ownership check
    job_id = analysis_service.create_analysis_job(db, case_id)
    background_tasks.add_task(
        analysis_service.run_analysis, db, bucket, case_id, job_id
    )
    return {"data": {"jobId": job_id}, "message": "Analysis started."}


@router.get("/cases/{case_id}/analysis/status", response_model=dict)
def get_analysis_status(
    case_id: str,
    user: dict = Depends(get_current_user),
    db: Client = Depends(get_firestore),
):
    get_case(db, case_id, user["uid"])
    job = analysis_service.get_latest_job(db, case_id)
    if not job:
        return {"data": None, "message": "No analysis job found."}
    return {"data": job}


@router.get("/cases/{case_id}/analysis", response_model=dict)
def get_analysis_result(
    case_id: str,
    user: dict = Depends(get_current_user),
    db: Client = Depends(get_firestore),
):
    get_case(db, case_id, user["uid"])
    job = analysis_service.get_latest_job(db, case_id)

    # Count sub-collections
    def count(sub):
        return len(
            list(
                db.collection("cases")
                .document(case_id)
                .collection(sub)
                .stream()
            )
        )

    result = {
        "caseId": case_id,
        "documentsAnalyzed": count("documents"),
        "clausesExtracted": count("evidence"),
        "conflictsFound": count("conflicts"),
        "missingReferences": len(
            [
                d
                for d in db.collection("cases")
                .document(case_id)
                .collection("references")
                .stream()
                if d.to_dict().get("status") == "MISSING_INFORMATION"
            ]
        ),
        "timelineEvents": count("timelineEvents"),
        "latestJobId": job["id"] if job else None,
    }
    return {"data": result}
