import pytest
from app.services.audio_quality_analysis import AudioQualityAnalysisService
import numpy as np
import soundfile as sf

@pytest.fixture
def audio_quality_eval():
    return AudioQualityAnalysisService()

def test_missing_audio_file(audio_quality_eval):
    res = audio_quality_eval.analyze_quality("missing_audio.wav")
    assert res["status"] == "ERROR"
    assert "error" in res

def test_analyze_quality_valid(audio_quality_eval, tmp_path):
    # Create a dummy wav file
    test_file = tmp_path / "test.wav"
    audio_data = np.random.uniform(-0.1, 0.1, 16000).astype(np.float32)
    sf.write(str(test_file), audio_data, 16000)
    
    res = audio_quality_eval.analyze_quality(str(test_file))
    assert "snr_db" in res
    assert "clipping_ratio" in res
    assert "silence_ratio" in res
    assert res["status"] in ["PASS", "FAIL"]
