"""
Test fixtures and mock Firebase setup.
"""
import pytest
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient


# Mock Firebase token payload
MOCK_USER = {"uid": "test-uid-123", "email": "test@example.com", "name": "Test User"}
MOCK_CASE_ID = "test-case-abc"


@pytest.fixture
def mock_auth():
    """Override Firebase auth dependency to return a test user."""
    from app.core.auth import get_current_user
    from app.main import app

    app.dependency_overrides[get_current_user] = lambda: MOCK_USER
    yield
    app.dependency_overrides.clear()


@pytest.fixture
def mock_firestore():
    """Return a MagicMock Firestore client."""
    return MagicMock()


@pytest.fixture
def mock_bucket():
    """Return a MagicMock storage bucket."""
    return MagicMock()


@pytest.fixture
def client(mock_auth, mock_firestore, mock_bucket):
    """TestClient with auth and Firestore mocked."""
    from app.core.dependencies import get_firestore, get_storage_bucket
    from app.main import app

    app.dependency_overrides[get_firestore] = lambda: mock_firestore
    app.dependency_overrides[get_storage_bucket] = lambda: mock_bucket

    with TestClient(app) as c:
        yield c

    app.dependency_overrides.clear()
