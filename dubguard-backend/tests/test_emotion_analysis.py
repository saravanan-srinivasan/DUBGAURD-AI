import pytest
from app.services.emotion_analysis import EmotionAnalysisService

@pytest.fixture
def emotion_eval():
    return EmotionAnalysisService()

def test_missing_audio_files(emotion_eval):
    res = emotion_eval.compute_emotion_similarity("missing1.wav", "missing2.wav")
    assert res["similarity_score"] == 0.0
    assert "error" in res

def test_extract_emotions_missing_file(emotion_eval):
    with pytest.raises(Exception):
        emotion_eval.extract_emotions("does_not_exist.wav")
