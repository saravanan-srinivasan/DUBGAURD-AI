import logging
import torch

logger = logging.getLogger("dubguard.speaker_eval")

class SpeakerSimilarityService:
    def __init__(self):
        self.model = None

    def _load_model(self):
        if self.model is None:
            logger.info("Loading SpeechBrain ECAPA-TDNN model for Speaker Verification...")
            try:
                from speechbrain.inference.speaker import SpeakerRecognition
                self.model = SpeakerRecognition.from_hparams(
                    source="speechbrain/spkrec-ecapa-voxceleb", 
                    savedir="tmpdir"
                )
            except ImportError:
                logger.error("SpeechBrain is not installed.")
                raise

    def compute_similarity(self, original_audio_path: str, dubbed_audio_path: str) -> dict:
        """
        Compare the speaker identity between original and dubbed audio.
        Returns a similarity score between 0 and 100.
        """
        try:
            self._load_model()
            
            # verify_files returns (score, prediction)
            # score is a tensor containing cosine distance
            score_tensor, prediction = self.model.verify_files(original_audio_path, dubbed_audio_path)
            raw_score = score_tensor.item()
            
            # Normalize [-1, 1] cosine score to [0, 100]
            normalized_score = max(0.0, min(100.0, ((raw_score + 1.0) / 2.0) * 100))
            
            return {
                "similarity_score": normalized_score,
                "is_same_speaker": bool(prediction.item()),
                "raw_cosine_score": raw_score
            }
        except Exception as e:
            logger.error(f"Speaker similarity analysis failed: {e}")
            return {
                "similarity_score": 0.0,
                "is_same_speaker": False,
                "error": str(e)
            }

speaker_service = SpeakerSimilarityService()
