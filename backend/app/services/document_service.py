"""
Document service — upload to Firebase Storage, store metadata in Firestore.
"""

import logging
import uuid
from datetime import datetime, timezone
from typing import Dict, List, Optional

from fastapi import HTTPException, UploadFile, status
from google.cloud.firestore import Client

from app.utils.file_validation import validate_upload
from app.services.case_service import get_case

logger = logging.getLogger(__name__)

CASES_COLLECTION = "cases"
DOCUMENTS_SUB = "documents"


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _assert_document_ownership(db: Client, document_id: str, uid: str) -> Dict:
    """Find document across all cases and verify ownership."""
    # Search by querying cases owned by user
    cases_query = (
        db.collection(CASES_COLLECTION).where("userId", "==", uid).stream()
    )
    for case_doc in cases_query:
        doc_ref = (
            db.collection(CASES_COLLECTION)
            .document(case_doc.id)
            .collection(DOCUMENTS_SUB)
            .document(document_id)
        )
        doc = doc_ref.get()
        if doc.exists:
            return {"id": doc.id, "caseId": case_doc.id, **doc.to_dict()}
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Document {document_id} not found.",
    )


async def upload_document(
    db: Client,
    bucket,
    case_id: str,
    uid: str,
    file: UploadFile,
) -> Dict:
    """Validate, upload to Storage, and create Firestore record."""
    # Verify case ownership first
    get_case(db, case_id, uid)

    file_bytes = await file.read()
    filename, mime_type = validate_upload(file.filename or "", file_bytes)

    document_id = str(uuid.uuid4())
    storage_path = (
        f"documents/{uid}/{case_id}/{document_id}/original/{filename}"
    )

    # Upload to Firebase Storage
    try:
        blob = bucket.blob(storage_path)
        blob.upload_from_string(file_bytes, content_type=mime_type)
    except Exception as e:
        logger.error("Storage upload failed: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="File upload to storage failed.",
        )

    now = _now_iso()
    doc_data = {
        "caseId": case_id,
        "filename": filename,
        "documentType": _infer_document_type(filename),
        "storagePath": storage_path,
        "mimeType": mime_type,
        "fileSize": len(file_bytes),
        "pageCount": None,
        "processingStatus": "uploaded",
        "processingError": None,
        "createdAt": now,
        "updatedAt": now,
    }

    db.collection(CASES_COLLECTION).document(case_id).collection(
        DOCUMENTS_SUB
    ).document(document_id).set(doc_data)

    return {"id": document_id, **doc_data}


def list_documents(db: Client, case_id: str, uid: str) -> List[Dict]:
    get_case(db, case_id, uid)
    docs = (
        db.collection(CASES_COLLECTION)
        .document(case_id)
        .collection(DOCUMENTS_SUB)
        .stream()
    )
    return [{"id": d.id, **d.to_dict()} for d in docs]


def get_document(db: Client, document_id: str, uid: str) -> Dict:
    return _assert_document_ownership(db, document_id, uid)


def delete_document(db: Client, bucket, document_id: str, uid: str) -> None:
    doc_data = _assert_document_ownership(db, document_id, uid)
    case_id = doc_data["caseId"]

    # Delete from Storage
    try:
        blob = bucket.blob(doc_data["storagePath"])
        blob.delete()
    except Exception as e:
        logger.warning("Could not delete Storage file (continuing): %s", e)

    db.collection(CASES_COLLECTION).document(case_id).collection(
        DOCUMENTS_SUB
    ).document(document_id).delete()


def update_processing_status(
    db: Client,
    case_id: str,
    document_id: str,
    status: str,
    page_count: Optional[int] = None,
    error: Optional[str] = None,
) -> None:
    update: Dict = {
        "processingStatus": status,
        "updatedAt": _now_iso(),
    }
    if page_count is not None:
        update["pageCount"] = page_count
    if error is not None:
        update["processingError"] = error

    db.collection(CASES_COLLECTION).document(case_id).collection(
        DOCUMENTS_SUB
    ).document(document_id).update(update)


def _infer_document_type(filename: str) -> str:
    name_lower = filename.lower()
    if "offer" in name_lower:
        return "Offer Letter"
    if (
        "employment" in name_lower
        or "agreement" in name_lower
        or "contract" in name_lower
    ):
        return "Employment Agreement"
    if "termination" in name_lower or "notice" in name_lower:
        return "Termination Notice"
    if (
        "handbook" in name_lower
        or "policy" in name_lower
        or "hr" in name_lower
    ):
        return "Policy Document"
    if "nda" in name_lower or "non-disclosure" in name_lower:
        return "NDA"
    return "Legal Document"
