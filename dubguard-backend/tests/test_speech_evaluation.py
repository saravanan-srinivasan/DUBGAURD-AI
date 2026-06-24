import pytest
from app.services.speech_evaluation import SpeechEvaluationService

@pytest.fixture
def speech_eval():
    return SpeechEvaluationService()

def test_compute_wer(speech_eval):
    ref = "hello world"
    hyp = "hello word"
    wer = speech_eval.compute_wer(ref, hyp)
    assert wer > 0.0
    assert wer <= 1.0

def test_compute_cer(speech_eval):
    ref = "hello world"
    hyp = "hello word"
    cer = speech_eval.compute_cer(ref, hyp)
    assert cer > 0.0
    assert cer <= 1.0

def test_exact_match(speech_eval):
    ref = "perfect translation"
    hyp = "perfect translation"
    assert speech_eval.compute_wer(ref, hyp) == 0.0
    assert speech_eval.compute_cer(ref, hyp) == 0.0

def test_empty_string(speech_eval):
    ref = ""
    hyp = "something"
    assert speech_eval.compute_wer(ref, hyp) == 1.0
    assert speech_eval.compute_cer(ref, hyp) == 1.0
