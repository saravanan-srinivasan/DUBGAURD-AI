import pytest
from app.services.lip_sync_analysis import LipSyncAnalysisService

@pytest.fixture
def lip_sync_eval():
    return LipSyncAnalysisService()

def test_missing_video_file(lip_sync_eval):
    res = lip_sync_eval.analyze("missing_video.mp4")
    assert res["lip_sync_score"] == 0.0
    assert res["frames_analyzed"] == 0

def test_extract_lip_movements_empty(lip_sync_eval):
    distances = lip_sync_eval.extract_lip_movements("missing_video.mp4")
    assert distances == []
