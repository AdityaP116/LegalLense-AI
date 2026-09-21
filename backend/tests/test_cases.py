"""Tests for case CRUD endpoints."""
from unittest.mock import MagicMock, patch
from datetime import datetime, timezone


def _now():
    return datetime.now(timezone.utc).isoformat()


def test_create_case(client, mock_firestore):
    mock_ref = MagicMock()
    mock_ref.id = "new-case-id"
    mock_firestore.collection.return_value.add.return_value = (None, mock_ref)
    mock_firestore.collection.return_value.document.return_value.get.return_value.exists = False

    payload = {
        "title": "TechCorp Dispute",
        "category": "Employment",
        "situation": "I received a termination notice after 8 months at TechCorp.",
        "goals": ["Understand my rights", "Review notice period"],
    }
    response = client.post("/api/cases", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "data" in data


def test_list_cases_unauthorized():
    """Without auth token, expect 403 or 401."""
    from fastapi.testclient import TestClient
    from app.main import app

    with TestClient(app) as c:
        response = c.get("/api/cases")
    assert response.status_code in (401, 403)


def test_case_fields_required(client, mock_firestore):
    """Missing required fields should return 422."""
    response = client.post("/api/cases", json={"title": "test"})
    assert response.status_code == 422
