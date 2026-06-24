import pytest
from app.services.pronunciation_verification import PronunciationVerificationService

@pytest.fixture
def pronun_eval():
    return PronunciationVerificationService()

def test_empty_reference(pronun_eval):
    res = pronun_eval.verify_pronunciation("dummy.wav", "")
    assert res["score"] == 0.0

def test_missing_audio_file(pronun_eval):
    # Should catch exception and return 0.0
    res = pronun_eval.verify_pronunciation("non_existent.wav", "Hello world")
    assert res["score"] == 0.0
    assert "Error" in res["details"] or "No such file" in res["details"] or "SystemError" in res["details"]
