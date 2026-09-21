"""
File validation utilities — extension, MIME type, size, empty/corrupted checks.
"""

import logging
import re
from typing import Tuple

from fastapi import HTTPException, status

logger = logging.getLogger(__name__)

ALLOWED_EXTENSIONS = {".pdf", ".docx"}

MIME_WHITELIST = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
    "application/octet-stream",  # some systems send this for DOCX
}

EXTENSION_TO_MIME = {
    ".pdf": "application/pdf",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}

MAX_FILENAME_LENGTH = 200


def _sanitize_filename(filename: str) -> str:
    """Remove path traversal and unsafe characters from filename."""
    # Keep only the basename
    filename = filename.replace("\\", "/").split("/")[-1]
    # Remove characters that are not alphanumeric, dot, dash, underscore, or space
    filename = re.sub(r"[^\w\s\-\.]", "", filename).strip()
    if not filename:
        filename = "document"
    return filename[:MAX_FILENAME_LENGTH]


def _get_extension(filename: str) -> str:
    parts = filename.rsplit(".", 1)
    if len(parts) < 2:
        return ""
    return "." + parts[-1].lower()


def validate_upload(filename: str, file_bytes: bytes) -> Tuple[str, str]:
    """
    Validate an uploaded file.

    Returns (clean_filename, mime_type) on success.
    Raises HTTPException on any validation failure.
    """
    from app.core.config import get_settings

    settings = get_settings()

    # 1. Empty file check
    if not file_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty.",
        )

    # 2. Size check
    if len(file_bytes) > settings.max_upload_size_bytes:
        max_mb = settings.max_upload_size_mb
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File exceeds maximum allowed size of {max_mb} MB.",
        )

    # 3. Filename sanitization
    clean_filename = _sanitize_filename(filename)

    # 4. Extension check
    ext = _get_extension(clean_filename)
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"File type '{ext}' is not supported. Allowed: {', '.join(ALLOWED_EXTENSIONS)}",
        )

    # 5. Magic bytes check (basic corruption / format verification)
    mime_type = EXTENSION_TO_MIME[ext]
    if ext == ".pdf":
        if not file_bytes.startswith(b"%PDF"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File does not appear to be a valid PDF (missing PDF header).",
            )
    elif ext == ".docx":
        # DOCX is a ZIP format
        if not file_bytes.startswith(b"PK\x03\x04"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File does not appear to be a valid DOCX (missing ZIP header).",
            )

    return clean_filename, mime_type
