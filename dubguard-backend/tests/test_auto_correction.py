import pytest
from app.services.auto_correction import AutoCorrectionService

@pytest.fixture
def auto_correct():
    return AutoCorrectionService()

def test_evaluate_pipeline_results_perfect(auto_correct):
    results = {
        "speech_evaluation": {"wer": 0.05, "cer": 0.02},
        "translation_evaluation": {"semantic_similarity": 95.0, "bleu": 40.0},
        "pronunciation_verification": {"score": 90.0},
        "emotion_analysis": {"similarity_score": 85.0},
        "speaker_similarity": {"is_same_speaker": True},
        "audio_quality": {"status": "PASS"}
    }
    res = auto_correct.evaluate_pipeline_results(results)
    assert res["status"] == "PASS"
    assert res["overall_score"] == 100.0
    assert len(res["issues_detected"]) == 0

def test_evaluate_pipeline_results_bad(auto_correct):
    results = {
        "speech_evaluation": {"wer": 0.50},
        "audio_quality": {"status": "FAIL"}
    }
    res = auto_correct.evaluate_pipeline_results(results)
    assert res["status"] == "NEEDS_FIX"
    assert res["overall_score"] < 100.0
    assert len(res["issues_detected"]) >= 2
