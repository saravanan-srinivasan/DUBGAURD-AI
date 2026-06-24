from pydantic import BaseModel
from typing import Dict, Any, List, Optional

class EvaluationResponse(BaseModel):
    overall_score: float
    status: str
    issues_detected: List[str]
    auto_correct_recommendations: List[str]
    detailed_metrics: Dict[str, Any]
    corrected_transcript: Optional[str] = None
    corrected_audio_path: Optional[str] = None
