"""Tests for authentication dependency."""
import pytest
from fastapi import HTTPException
from unittest.mock import patch, MagicMock, AsyncMock


# These tests exercise get_current_user directly via the HTTP client, not by calling
# the async function directly, because the dependency uses HTTPBearer internally.
# We test the behavior through the TestClient (via test_cases.py / conftest).


def test_auth_no_token_returns_401(client):
    """Unauthenticated request to a protected route returns 401."""
    from app.core.auth import get_current_user
    from app.core.dependencies import get_firestore
    from app.main import app

    # Remove the mock auth override to test real auth rejection
    app.dependency_overrides.pop(get_current_user, None)
    try:
        from fastapi.testclient import TestClient
        c = TestClient(app, raise_server_exceptions=False)
        response = c.get("/api/cases")
        assert response.status_code in (401, 403)
    finally:
        app.dependency_overrides[get_current_user] = lambda: {
            "uid": "test-uid-123", "email": "test@example.com", "name": "Test User"
        }


def test_auth_invalid_token_returns_401(client):
    """Request with an invalid bearer token should return 401."""
    from app.core.auth import get_current_user
    from app.main import app

    app.dependency_overrides.pop(get_current_user, None)
    try:
        from fastapi.testclient import TestClient
        c = TestClient(app, raise_server_exceptions=False)
        response = c.get(
            "/api/cases",
            headers={"Authorization": "Bearer not_a_real_token"},
        )
        assert response.status_code in (401, 403)
    finally:
        app.dependency_overrides[get_current_user] = lambda: {
            "uid": "test-uid-123", "email": "test@example.com", "name": "Test User"
        }


def test_auth_valid_override_returns_200(client):
    """Mocked auth (via conftest dependency override) should allow access."""
    response = client.get("/api/cases")
    # Should not return 401/403 — returns 200 with empty list or data
    assert response.status_code == 200

