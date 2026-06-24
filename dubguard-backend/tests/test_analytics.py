import pytest
from app.services.analytics import AnalyticsService

@pytest.fixture
def analytics():
    return AnalyticsService()

def test_empty_report(analytics):
    res = analytics.generate_project_report([])
    assert res["status"] == "NO_DATA"

def test_generate_report(analytics):
    evaluations = [
        {"overall_score": 100.0, "status": "PASS", "issues_detected": []},
        {"overall_score": 80.0, "status": "NEEDS_FIX", "issues_detected": ["High Word Error Rate (20.0%).", "Emotion mismatch detected."]},
        {"overall_score": 90.0, "status": "NEEDS_FIX", "issues_detected": ["Emotion mismatch detected."]}
    ]
    res = analytics.generate_project_report(evaluations)
    assert res["status"] == "SUCCESS"
    assert res["total_clips_evaluated"] == 3
    assert res["average_quality_score"] == 90.0
    assert res["pass_rate_percentage"] == 33.33
    assert res["most_common_issues"]["Emotion mismatch detected."] == 2
