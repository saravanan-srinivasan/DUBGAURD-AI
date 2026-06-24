import pytest
from app.services.speaker_similarity import SpeakerSimilarityService

@pytest.fixture
def speaker_eval():
    return SpeakerSimilarityService()

def test_missing_audio_files(speaker_eval):
    res = speaker_eval.compute_similarity("missing1.wav", "missing2.wav")
    assert res["similarity_score"] == 0.0
    assert res["is_same_speaker"] is False
    assert "error" in res
