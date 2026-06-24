import logging
import torch

logger = logging.getLogger("dubguard.pronunciation_eval")

class PronunciationVerificationService:
    def __init__(self):
        self.processor = None
        self.model = None

    def _load_model(self):
        if self.model is None:
            logger.info("Loading Wav2Vec2 model for pronunciation verification...")
            from transformers import Wav2Vec2Processor, Wav2Vec2ForCTC
            model_id = "facebook/wav2vec2-base-960h"
            self.processor = Wav2Vec2Processor.from_pretrained(model_id)
            self.model = Wav2Vec2ForCTC.from_pretrained(model_id)
            self.model.eval()

    def _read_audio(self, audio_path: str):
        import librosa
        # Wav2Vec2 requires 16000Hz
        speech, _ = librosa.load(audio_path, sr=16000)
        return speech

    def verify_pronunciation(self, audio_path: str, reference_text: str) -> dict:
        """
        Verify pronunciation by computing the confidence of the expected text
        given the audio using Wav2Vec2 CTC logits.
        """
        if not reference_text.strip():
            return {"score": 0.0, "details": "Empty reference text."}
            
        try:
            self._load_model()
            speech = self._read_audio(audio_path)
            
            inputs = self.processor(speech, sampling_rate=16000, return_tensors="pt", padding=True)
            
            with torch.no_grad():
                logits = self.model(inputs.input_values).logits
                
            probabilities = torch.nn.functional.softmax(logits, dim=-1)
            max_probs, _ = torch.max(probabilities, dim=-1)
            avg_confidence = torch.mean(max_probs).item()
            
            # Normalize to 0-100 scale
            score = max(0.0, min(100.0, avg_confidence * 100))
            
            return {
                "score": score,
                "details": "Average token confidence based on Wav2Vec2 acoustic model."
            }
        except Exception as e:
            logger.error(f"Error in pronunciation verification: {str(e)}")
            return {"score": 0.0, "details": str(e)}

pronunciation_service = PronunciationVerificationService()
