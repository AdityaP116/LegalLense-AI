"""
Unified Storage Service — Cloud Storage with automatic local filesystem fallback.
"""

import os
import logging
import datetime as dt
from pathlib import Path
from typing import Optional

logger = logging.getLogger(__name__)

# Base directory for local file storage fallback
BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
UPLOADS_DIR = BACKEND_DIR / "uploads"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)


def upload_file_bytes(
    bucket,
    storage_path: str,
    file_bytes: bytes,
    content_type: str = "application/octet-stream",
) -> str:
    """
    Attempt to upload to Firebase Cloud Storage.
    If Cloud Storage fails (e.g. 404 Bucket Not Found or Network error),
    save to local disk fallback so document upload and analysis work reliably.
    """
    cloud_success = False
    if bucket:
        try:
            blob = bucket.blob(storage_path)
            blob.upload_from_string(file_bytes, content_type=content_type)
            cloud_success = True
            logger.info("Uploaded %s to Cloud Storage", storage_path)
        except Exception as e:
            logger.warning(
                "Cloud Storage upload failed (%s). Saving to local disk fallback: %s",
                e,
                storage_path,
            )

    # Always save to local fallback path
    local_path = UPLOADS_DIR / storage_path
    local_path.parent.mkdir(parents=True, exist_ok=True)
    local_path.write_bytes(file_bytes)

    return storage_path


def download_file_bytes(bucket, storage_path: str) -> bytes:
    """
    Read file bytes from local disk fallback or Cloud Storage.
    """
    local_path = UPLOADS_DIR / storage_path
    if local_path.exists():
        return local_path.read_bytes()

    if bucket:
        try:
            blob = bucket.blob(storage_path)
            return blob.download_as_bytes()
        except Exception as e:
            logger.error("Failed to download %s from Cloud Storage: %s", storage_path, e)

    raise FileNotFoundError(f"File not found in storage: {storage_path}")


def get_download_url(bucket, storage_path: str, filename: str) -> str:
    """
    Generate signed Cloud Storage URL or local file stream endpoint fallback.
    """
    if bucket:
        try:
            blob = bucket.blob(storage_path)
            signed_url = blob.generate_signed_url(
                expiration=dt.timedelta(minutes=60),
                method="GET",
                version="v4",
            )
            return signed_url
        except Exception as e:
            logger.warning("Could not generate Cloud Storage signed URL: %s", e)

    # Fallback endpoint URL
    return f"/api/documents/raw/{storage_path}"
