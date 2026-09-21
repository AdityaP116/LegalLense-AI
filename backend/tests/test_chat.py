"""Tests for chat Q&A endpoint."""
import pytest
from unittest.mock import MagicMock, patch

from tests.conftest import MOCK_CASE_ID


@patch("app.api.routes.chat.retrieval_service")
@patch("app.api.routes.chat.ai_service")
@patch("app.api.routes.chat.get_case")
def test_chat(mock_get_case, mock_ai, mock_retrieval, client):
    mock_get_case.return_value = {"situation": "Dispute"}
    
    # Mock retrieval results
    mock_retrieval.retrieve.return_value = [
        {"documentId": "doc1", "documentName": "test.pdf", "text": "This is a contract."}
    ]
    
    # Mock AI response
    mock_ai.answer_question.return_value = {
        "answer": "Yes, it is a contract.",
        "status": "FOUND_DIRECTLY"
    }
    
    response = client.post(
        f"/api/cases/{MOCK_CASE_ID}/chat", 
        json={"question": "Is this a contract?"}
    )
    
    assert response.status_code == 200
    data = response.json()["data"]
    assert data["answer"] == "Yes, it is a contract."
    assert data["status"] == "FOUND_DIRECTLY"
    assert len(data["sources"]) == 1
    assert data["sources"][0]["documentId"] == "doc1"


def test_chat_validation_error(client):
    """Empty question should fail."""
    response = client.post(
        f"/api/cases/{MOCK_CASE_ID}/chat", 
        json={"question": ""}
    )
    assert response.status_code == 422
