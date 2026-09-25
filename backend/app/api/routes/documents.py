import logging
from fastapi import APIRouter, BackgroundTasks, Depends, UploadFile, File
from google.cloud.firestore import Client

from app.core.auth import get_current_user
from app.core.dependencies import get_firestore, get_storage_bucket
from app.services import document_service

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Documents"])


@router.post("/cases/{case_id}/documents", response_model=dict)
async def upload_document(
    case_id: str,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    user: dict = Depends(get_current_user),
    db: Client = Depends(get_firestore),
    bucket=Depends(get_storage_bucket),
):
    doc = await document_service.upload_document(
        db, bucket, case_id, user["uid"], file
    )
    # Auto-trigger processing in background
    background_tasks.add_task(
        _process_document, db, bucket, case_id, doc["id"]
    )
    return {"data": doc, "message": "Document uploaded. Processing started."}


def _process_document(db: Client, bucket, case_id: str, document_id: str):
    """Background task: extract text and update Firestore."""
    from app.services.extraction_service import (
        extract_pdf,
        extract_docx,
        chunk_pages,
        get_pdf_page_count,
    )
    from app.services.document_service import update_processing_status
    from datetime import datetime, timezone

    def now_iso():
        return datetime.now(timezone.utc).isoformat()

    try:
        doc_ref = (
            db.collection("cases")
            .document(case_id)
            .collection("documents")
            .document(document_id)
        )
        doc_snap = doc_ref.get()
        if not doc_snap.exists:
            return
        doc_data = doc_snap.to_dict()
        storage_path = doc_data.get("storagePath", "")
        filename = doc_data.get("filename", "")
        mime_type = doc_data.get("mimeType", "")

        update_processing_status(db, case_id, document_id, "processing")

        from app.services import storage_service
        file_bytes = storage_service.download_file_bytes(bucket, storage_path)

        if mime_type == "application/pdf" or filename.lower().endswith(".pdf"):
            pages = extract_pdf(file_bytes, document_id, filename)
            page_count = get_pdf_page_count(file_bytes)
        else:
            pages = extract_docx(file_bytes, document_id, filename)
            page_count = len(pages)

        chunks = chunk_pages(pages)
        batch = db.batch()
        for chunk in chunks:
            ref = (
                db.collection("cases")
                .document(case_id)
                .collection("chunks")
                .document()
            )
            batch.set(ref, chunk)
        batch.commit()

        update_processing_status(
            db, case_id, document_id, "completed", page_count=page_count
        )

    except Exception as e:
        logger.error("Background doc processing failed: %s", e)
        update_processing_status(
            db, case_id, document_id, "failed", error=str(e)
        )


@router.get("/cases/{case_id}/documents", response_model=dict)
def list_documents(
    case_id: str,
    user: dict = Depends(get_current_user),
    db: Client = Depends(get_firestore),
):
    docs = document_service.list_documents(db, case_id, user["uid"])
    return {"data": docs}


@router.get("/documents/{document_id}", response_model=dict)
def get_document(
    document_id: str,
    user: dict = Depends(get_current_user),
    db: Client = Depends(get_firestore),
):
    doc = document_service.get_document(db, document_id, user["uid"])
    return {"data": doc}


@router.delete("/documents/{document_id}", response_model=dict)
def delete_document(
    document_id: str,
    user: dict = Depends(get_current_user),
    db: Client = Depends(get_firestore),
    bucket=Depends(get_storage_bucket),
):
    document_service.delete_document(db, bucket, document_id, user["uid"])
    return {"message": "Document deleted."}


@router.get("/documents/{document_id}/download-url", response_model=dict)
def get_download_url(
    document_id: str,
    user: dict = Depends(get_current_user),
    db: Client = Depends(get_firestore),
    bucket=Depends(get_storage_bucket),
):
    """Return a signed URL or local fallback URL for direct browser viewing."""
    from app.services import storage_service

    doc = document_service.get_document(db, document_id, user["uid"])
    storage_path = doc.get("storagePath", "")
    filename = doc.get("filename", "")
    if not storage_path:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Storage path not found for document.")

    url = storage_service.get_download_url(bucket, storage_path, filename)
    return {"data": {"url": url, "filename": filename}}


from fastapi.responses import Response

@router.get("/documents/raw/{storage_path:path}")
def get_raw_document(
    storage_path: str,
    bucket=Depends(get_storage_bucket),
):
    """Stream document bytes directly from local storage fallback."""
    from app.services import storage_service
    try:
        data = storage_service.download_file_bytes(bucket, storage_path)
        content_type = "application/pdf" if storage_path.endswith(".pdf") else "application/octet-stream"
        return Response(content=data, media_type=content_type)
    except Exception as e:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/documents/{document_id}/process", response_model=dict)
def reprocess_document(
    document_id: str,
    background_tasks: BackgroundTasks,
    user: dict = Depends(get_current_user),
    db: Client = Depends(get_firestore),
    bucket=Depends(get_storage_bucket),
):
    doc = document_service.get_document(db, document_id, user["uid"])
    case_id = doc.get("caseId", "")
    background_tasks.add_task(
        _process_document, db, bucket, case_id, document_id
    )
    return {"message": "Reprocessing started."}
