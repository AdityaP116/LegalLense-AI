"""Tests for analysis API endpoints."""
import pytest
from unittest.mock import MagicMock, patch

from tests.conftest import MOCK_CASE_ID


@patch("app.api.routes.analysis.analysis_service")
@patch("app.api.routes.analysis.get_case")
def test_trigger_analysis(mock_get_case, mock_service, client):
    mock_service.create_analysis_job.return_value = "job123"
    
    response = client.post(f"/api/cases/{MOCK_CASE_ID}/analyze")
    assert response.status_code == 200
    assert response.json()["data"]["jobId"] == "job123"


@patch("app.api.routes.analysis.analysis_service")
@patch("app.api.routes.analysis.get_case")
def test_get_analysis_status(mock_get_case, mock_service, client):
    mock_service.get_latest_job.return_value = {"id": "job123", "status": "processing"}
    
    response = client.get(f"/api/cases/{MOCK_CASE_ID}/analysis/status")
    assert response.status_code == 200
    assert response.json()["data"]["status"] == "processing"


@patch("app.api.routes.analysis.analysis_service")
@patch("app.api.routes.analysis.get_case")
def test_get_analysis_status_none(mock_get_case, mock_service, client):
    mock_service.get_latest_job.return_value = None
    
    response = client.get(f"/api/cases/{MOCK_CASE_ID}/analysis/status")
    assert response.status_code == 200
    assert response.json()["data"] is None
