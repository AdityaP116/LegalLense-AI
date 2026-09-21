"""Tests for file validation utilities."""
import pytest
from app.utils.file_validation import validate_upload, _sanitize_filename, _get_extension


def test_sanitize_filename_removes_path_traversal():
    assert _sanitize_filename("../../etc/passwd") == "passwd"
    assert _sanitize_filename("../secret.pdf") == "secret.pdf"


def test_sanitize_filename_removes_special_chars():
    result = _sanitize_filename("file<>:\"/\\|?*.pdf")
    assert "<" not in result
    assert ">" not in result


def test_get_extension():
    assert _get_extension("document.pdf") == ".pdf"
    assert _get_extension("agreement.DOCX") == ".docx"
    assert _get_extension("noextension") == ""


def test_validate_pdf_magic_bytes():
    """Valid PDF should pass."""
    fake_pdf = b"%PDF-1.4 fake content"
    name, mime = validate_upload("doc.pdf", fake_pdf)
    assert name == "doc.pdf"
    assert mime == "application/pdf"


def test_validate_pdf_bad_magic_bytes():
    """PDF with wrong header should fail."""
    from fastapi import HTTPException
    with pytest.raises(HTTPException) as exc:
        validate_upload("doc.pdf", b"NOT A PDF CONTENT")
    assert exc.value.status_code == 400


def test_validate_unsupported_extension():
    from fastapi import HTTPException
    with pytest.raises(HTTPException) as exc:
        validate_upload("malware.exe", b"content")
    assert exc.value.status_code == 415


def test_validate_empty_file():
    from fastapi import HTTPException
    with pytest.raises(HTTPException) as exc:
        validate_upload("empty.pdf", b"")
    assert exc.value.status_code == 400


def test_validate_docx_magic_bytes():
    """DOCX (ZIP) with correct header should pass."""
    fake_docx = b"PK\x03\x04" + b"\x00" * 100
    name, mime = validate_upload("contract.docx", fake_docx)
    assert "wordprocessingml" in mime
