"""Tests for conflict detection logic."""
from app.services.conflict_service import _extract_notice_days


def test_extract_notice_days_days():
    assert _extract_notice_days("Either party shall give 30 days written notice") == 30


def test_extract_notice_days_weeks():
    assert _extract_notice_days("2 weeks notice required") == 14


def test_extract_notice_days_months():
    assert _extract_notice_days("notice period of 3 months") == 90


def test_extract_notice_days_none():
    assert _extract_notice_days("This clause has no time period") is None


def test_extract_notice_days_90():
    text = "§12.2 — Either party shall provide 90 days written notice prior to termination."
    assert _extract_notice_days(text) == 90
