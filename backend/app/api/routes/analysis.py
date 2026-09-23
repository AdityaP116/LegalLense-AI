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
    from concurrent.futures import ThreadPoolExecutor

    get_case(db, case_id, user["uid"])
    job = analysis_service.get_latest_job(db, case_id)

    def count_sub(sub: str) -> int:
        try:
            res = db.collection("cases").document(case_id).collection(sub).count().get()
            return res[0][0].value
        except Exception:
            return len(
                list(
                    db.collection("cases")
                    .document(case_id)
                    .collection(sub)
                    .stream()
                )
            )

    def count_missing_refs() -> int:
        try:
            res = (
                db.collection("cases")
                .document(case_id)
                .collection("references")
                .where("status", "==", "MISSING_INFORMATION")
                .count()
                .get()
            )
            return res[0][0].value
        except Exception:
            return len(
                [
                    d
                    for d in db.collection("cases")
                    .document(case_id)
                    .collection("references")
                    .stream()
                    if d.to_dict().get("status") == "MISSING_INFORMATION"
                ]
            )

    with ThreadPoolExecutor(max_workers=5) as executor:
        f_docs = executor.submit(count_sub, "documents")
        f_ev = executor.submit(count_sub, "evidence")
        f_conf = executor.submit(count_sub, "conflicts")
        f_refs = executor.submit(count_missing_refs)
        f_time = executor.submit(count_sub, "timelineEvents")

        result = {
            "caseId": case_id,
            "documentsAnalyzed": f_docs.result(),
            "clausesExtracted": f_ev.result(),
            "conflictsFound": f_conf.result(),
            "missingReferences": f_refs.result(),
            "timelineEvents": f_time.result(),
            "latestJobId": job["id"] if job else None,
        }

    return {"data": result}

