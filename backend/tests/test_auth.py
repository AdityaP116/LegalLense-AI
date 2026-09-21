"""Tests for authentication dependency."""
import pytest
from fastapi import HTTPException
from unittest.mock import patch, MagicMock

from app.core.auth import get_current_user


def test_get_current_user_no_auth_header():
    mock_request = MagicMock()
    mock_request.headers = {}
    
    with pytest.raises(HTTPException) as exc:
        get_current_user(mock_request)
    assert exc.value.status_code == 401
    assert "Authorization header missing" in exc.value.detail


def test_get_current_user_invalid_scheme():
    mock_request = MagicMock()
    mock_request.headers = {"Authorization": "Basic something"}
    
    with pytest.raises(HTTPException) as exc:
        get_current_user(mock_request)
    assert exc.value.status_code == 401
    assert "Bearer" in exc.value.detail


@patch("app.core.auth.auth")
def test_get_current_user_valid(mock_auth):
    mock_request = MagicMock()
    mock_request.headers = {"Authorization": "Bearer valid_token"}
    mock_auth.verify_id_token.return_value = {"uid": "user123"}
    
    user = get_current_user(mock_request)
    assert user["uid"] == "user123"


@patch("app.core.auth.auth")
def test_get_current_user_invalid_token(mock_auth):
    mock_request = MagicMock()
    mock_request.headers = {"Authorization": "Bearer invalid_token"}
    mock_auth.verify_id_token.side_effect = Exception("Expired")
    
    with pytest.raises(HTTPException) as exc:
        get_current_user(mock_request)
    assert exc.value.status_code == 403
    assert "Invalid or expired token" in exc.value.detail
