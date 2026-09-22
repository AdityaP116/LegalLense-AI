"""Tests for AI service mock mode.

These tests always use mock mode regardless of the .env AI_SERVICE_MODE setting.
The conftest.py fixture patches get_settings() to return mock mode.
"""
import pytest
from unittest.mock import patch, MagicMock
from app.services import ai_service


@pytest.fixture(autouse=True)
def force_mock_mode():
    """Force AI_SERVICE_MODE=mock for all tests in this module."""
    mock_settings = MagicMock()
    mock_settings.ai_service_mode = "mock"
    with patch("app.services.ai_service.get_settings", return_value=mock_settings):
        # Also clear any module-level cache
        yield


def test_extract_clauses_mock():
    result = ai_service.extract_clauses("some text", "doc.pdf")
    assert isinstance(result, list)
    assert len(result) > 0
    assert "text" in result[0]
    assert "clauseType" in result[0]


def test_extract_dates_mock():
    result = ai_service.extract_dates("some text", "doc.pdf")
    assert isinstance(result, list)
    assert len(result) > 0
    assert "date" in result[0]


def test_answer_question_notice_period_mock():
    result = ai_service.answer_question(
        "What is the notice period?",
        [],
        situation="Employment dispute at TechCorp",
    )
    assert "answer" in result
    assert "status" in result
    assert result["status"] in ("FOUND_DIRECTLY", "DERIVED_FROM_DOCUMENTS", "NOT_FOUND", "NEEDS_REVIEW")


def test_generate_questions_mock():
    result = ai_service.generate_questions(
        {"situation": "I was terminated", "goals": ["understand rights"]},
        [],
        [],
    )
    assert isinstance(result, list)
    assert len(result) > 0
    assert "question" in result[0]


def test_generate_brief_mock():
    result = ai_service.generate_brief({"situation": "test"}, {})
    assert isinstance(result, list)
    assert len(result) > 0
    assert "title" in result[0]
    assert "content" in result[0]
