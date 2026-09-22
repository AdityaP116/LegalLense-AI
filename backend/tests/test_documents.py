"""Tests for document upload and management."""
import pytest
from unittest.mock import MagicMock, AsyncMock, patch

from tests.conftest import MOCK_CASE_ID


@patch("app.api.routes.documents.document_service")
def test_upload_document(mock_service, client):
    # upload_document is async, so mock it with AsyncMock
    mock_service.upload_document = AsyncMock(
        return_value={"id": "doc123", "filename": "test.pdf"}
    )

    response = client.post(
        f"/api/cases/{MOCK_CASE_ID}/documents",
        files={"file": ("test.pdf", b"%PDF-1.4...", "application/pdf")},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["data"]["id"] == "doc123"
    assert "Processing started" in data["message"]


@patch("app.api.routes.documents.document_service")
def test_list_documents(mock_service, client):
    mock_service.list_documents.return_value = [{"id": "doc1"}]

    response = client.get(f"/api/cases/{MOCK_CASE_ID}/documents")
    assert response.status_code == 200
    assert len(response.json()["data"]) == 1


@patch("app.api.routes.documents.document_service")
def test_delete_document(mock_service, client):
    response = client.delete("/api/documents/doc123")
    assert response.status_code == 200
    mock_service.delete_document.assert_called_once()
