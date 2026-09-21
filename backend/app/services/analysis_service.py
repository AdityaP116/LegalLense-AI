"""
Analysis service — orchestrates the full document processing pipeline.

Pipeline:
  Upload (done by document_service)
    ↓
  Extract text (extraction_service)
    ↓
  Chunk pages
    ↓
  Store chunks in Firestore
    ↓
  Extract clauses/dates/entities via AI
    ↓
  Store evidence
    ↓
  Detect references
    ↓
  Detect conflicts
    ↓
  Build timeline
    ↓
  Mark job completed
"""

import logging
import uuid
from datetime import datetime, timezone
from typing import Dict, List, Optional

from google.cloud.firestore import Client

logger = logging.getLogger(__name__)

CASES = "cases"
ANALYSIS_JOBS = "analysisJobs"
DOCUMENTS_SUB = "documents"
CHUNKS_SUB = "chunks"
EVIDENCE_SUB = "evidence"
CONFLICTS_SUB = "conflicts"
REFERENCES_SUB = "references"
TIMELINE_SUB = "timelineEvents"


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _update_job(db: Client, case_id: str, job_id: str, **kwargs) -> None:
    db.collection(CASES).document(case_id).collection(ANALYSIS_JOBS).document(
        job_id
    ).update({"updatedAt": _now_iso(), **kwargs})


def create_analysis_job(db: Client, case_id: str) -> str:
    job_id = str(uuid.uuid4())
    db.collection(CASES).document(case_id).collection(ANALYSIS_JOBS).document(
        job_id
    ).set(
        {
            "caseId": case_id,
            "status": "pending",
            "progress": 0,
            "currentStep": "Initializing",
            "error": None,
            "createdAt": _now_iso(),
            "completedAt": None,
        }
    )
    return job_id


def get_latest_job(db: Client, case_id: str) -> Optional[Dict]:
    query = (
        db.collection(CASES)
        .document(case_id)
        .collection(ANALYSIS_JOBS)
        .order_by("createdAt", direction="DESCENDING")
        .limit(1)
    )
    docs = list(query.stream())
    if not docs:
        return None
    return {"id": docs[0].id, **docs[0].to_dict()}


def run_analysis(db: Client, bucket, case_id: str, job_id: str) -> None:
    """
    Synchronous analysis pipeline. In production you would run this in a
    background task (FastAPI BackgroundTasks) or Cloud Tasks queue.
    """
    from app.services import (
        extraction_service,
        conflict_service,
        timeline_service,
    )
    from app.services import ai_service

    try:
        _update_job(
            db,
            case_id,
            job_id,
            status="processing",
            progress=5,
            currentStep="Loading documents",
        )

        # ── Step 1: Load all documents ─────────────────────────────────────
        docs_query = (
            db.collection(CASES)
            .document(case_id)
            .collection(DOCUMENTS_SUB)
            .stream()
        )
        documents = [{"id": d.id, **d.to_dict()} for d in docs_query]

        if not documents:
            _update_job(
                db,
                case_id,
                job_id,
                status="failed",
                error="No documents uploaded.",
            )
            return

        _update_job(
            db, case_id, job_id, progress=10, currentStep="Extracting text"
        )

        all_pages = []
        all_chunks = []

        for doc_meta in documents:
            doc_id = doc_meta["id"]
            storage_path = doc_meta.get("storagePath", "")
            filename = doc_meta.get("filename", "")
            mime_type = doc_meta.get("mimeType", "")

            # Download from Storage
            try:
                blob = bucket.blob(storage_path)
                file_bytes = blob.download_as_bytes()
            except Exception as e:
                logger.error("Could not download %s: %s", storage_path, e)
                continue

            # Extract text
            if mime_type == "application/pdf" or filename.lower().endswith(
                ".pdf"
            ):
                pages = extraction_service.extract_pdf(
                    file_bytes, doc_id, filename
                )
                page_count = extraction_service.get_pdf_page_count(file_bytes)
            else:
                pages = extraction_service.extract_docx(
                    file_bytes, doc_id, filename
                )
                page_count = len(pages)

            # Update page count
            from app.services.document_service import update_processing_status

            update_processing_status(
                db, case_id, doc_id, "processing", page_count=page_count
            )

            all_pages.extend(pages)

            # Chunk
            chunks = extraction_service.chunk_pages(pages)
            all_chunks.extend(chunks)

            # Store chunks in Firestore
            chunk_batch = db.batch()
            for chunk in chunks:
                ref = (
                    db.collection(CASES)
                    .document(case_id)
                    .collection(CHUNKS_SUB)
                    .document()
                )
                chunk_batch.set(ref, chunk)
            chunk_batch.commit()

        _update_job(
            db, case_id, job_id, progress=30, currentStep="Extracting clauses"
        )

        # ── Step 2: AI Extraction ──────────────────────────────────────────
        all_evidence = []

        for doc_meta in documents:
            doc_id = doc_meta["id"]
            filename = doc_meta.get("filename", "")
            doc_pages = [p for p in all_pages if p["documentId"] == doc_id]
            full_text = "\n".join(p["text"] for p in doc_pages)

            # Clauses
            clauses = ai_service.extract_clauses(full_text, filename)
            for clause in clauses:
                ev = {
                    "documentId": doc_id,
                    "documentName": filename,
                    "page": clause.get("page"),
                    "section": clause.get("section", ""),
                    "text": clause.get("text", ""),
                    "evidenceType": "clause",
                    "status": "FOUND_DIRECTLY",
                    "topic": clause.get("clauseType", ""),
                    "createdAt": _now_iso(),
                }
                all_evidence.append(ev)

            # Dates
            dates = ai_service.extract_dates(full_text, filename)
            for date_item in dates:
                ev = {
                    "documentId": doc_id,
                    "documentName": filename,
                    "page": date_item.get("page"),
                    "section": "",
                    "text": date_item.get("description", ""),
                    "evidenceType": "date",
                    "status": "FOUND_DIRECTLY",
                    "topic": "date",
                    "extractedDate": date_item.get("date"),
                    "createdAt": _now_iso(),
                }
                all_evidence.append(ev)

        # Store evidence
        evidence_batch = db.batch()
        for ev in all_evidence:
            ref = (
                db.collection(CASES)
                .document(case_id)
                .collection(EVIDENCE_SUB)
                .document()
            )
            evidence_batch.set(ref, ev)
        evidence_batch.commit()

        _update_job(
            db,
            case_id,
            job_id,
            progress=50,
            currentStep="Detecting references",
        )

        # ── Step 3: Reference Detection ────────────────────────────────────
        for doc_meta in documents:
            doc_id = doc_meta["id"]
            filename = doc_meta.get("filename", "")
            doc_pages = [p for p in all_pages if p["documentId"] == doc_id]
            full_text = "\n".join(p["text"] for p in doc_pages)

            references = ai_service.detect_references(full_text, filename)
            for ref_item in references:
                ref_name = ref_item.get("referencedItem", "")
                # Check if referenced document is in workspace
                found = _check_reference_in_workspace(documents, ref_name)
                ref_doc = {
                    "referencedItem": ref_name,
                    "referencingDocId": doc_id,
                    "referencingDocName": filename,
                    "sourcePage": ref_item.get("page"),
                    "sourceSection": ref_item.get("section", ""),
                    "sourceText": ref_item.get("sourceText", ""),
                    "status": "FOUND" if found else "MISSING_INFORMATION",
                    "createdAt": _now_iso(),
                }
                db.collection(CASES).document(case_id).collection(
                    REFERENCES_SUB
                ).add(ref_doc)

        _update_job(
            db, case_id, job_id, progress=65, currentStep="Detecting conflicts"
        )

        # ── Step 4: Conflict Detection ─────────────────────────────────────
        conflicts = conflict_service.detect_conflicts_from_evidence(
            db, case_id, documents
        )
        for conflict in conflicts:
            db.collection(CASES).document(case_id).collection(
                CONFLICTS_SUB
            ).add(conflict)

        _update_job(
            db, case_id, job_id, progress=80, currentStep="Building timeline"
        )

        # ── Step 5: Timeline ───────────────────────────────────────────────
        timeline_service.build_timeline(db, case_id, all_evidence)

        _update_job(db, case_id, job_id, progress=95, currentStep="Finalizing")

        # Mark all documents as completed
        from app.services.document_service import update_processing_status

        for doc_meta in documents:
            update_processing_status(db, case_id, doc_meta["id"], "completed")

        _update_job(
            db,
            case_id,
            job_id,
            status="completed",
            progress=100,
            currentStep="Completed",
            completedAt=_now_iso(),
        )

    except Exception as e:
        logger.error("Analysis pipeline failed for case %s: %s", case_id, e)
        _update_job(
            db,
            case_id,
            job_id,
            status="failed",
            error=str(e),
            currentStep="Failed",
        )
        # Mark documents as failed
        try:
            docs_query = (
                db.collection(CASES)
                .document(case_id)
                .collection(DOCUMENTS_SUB)
                .stream()
            )
            for d in docs_query:
                if d.to_dict().get("processingStatus") == "processing":
                    from app.services.document_service import (
                        update_processing_status,
                    )

                    update_processing_status(
                        db, case_id, d.id, "failed", error=str(e)
                    )
        except Exception:
            pass


def _check_reference_in_workspace(
    documents: List[Dict], ref_name: str
) -> bool:
    ref_lower = ref_name.lower()
    for doc in documents:
        filename_lower = doc.get("filename", "").lower()
        doc_type_lower = doc.get("documentType", "").lower()
        if any(
            word in filename_lower or word in doc_type_lower
            for word in ref_lower.split()
        ):
            return True
    return False
