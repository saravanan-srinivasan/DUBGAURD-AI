import pytest
from app.services.translation_evaluation import TranslationEvaluationService

@pytest.fixture
def translation_eval():
    return TranslationEvaluationService()

def test_compute_bleu(translation_eval):
    ref = "The quick brown fox jumps over the lazy dog."
    hyp = "A fast brown fox jumps over the lazy dog."
    bleu_score = translation_eval.compute_bleu(ref, hyp)
    assert bleu_score >= 0.0

def test_exact_match_bleu(translation_eval):
    ref = "This is a perfect translation that has more than four words."
    hyp = "This is a perfect translation that has more than four words."
    bleu_score = translation_eval.compute_bleu(ref, hyp)
    assert bleu_score > 90.0  # SacreBLEU scale is 0-100

def test_empty_string(translation_eval):
    assert translation_eval.compute_bleu("", "something") == 0.0
    assert translation_eval.compute_semantic_similarity("", "something") == 0.0
    assert translation_eval.compute_comet("", "hyp", "ref") == 0.0
