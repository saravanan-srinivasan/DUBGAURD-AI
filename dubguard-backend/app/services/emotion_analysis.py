import logging
import torch
import torch.nn.functional as F

logger = logging.getLogger("dubguard.emotion_eval")

class EmotionAnalysisService:
    def __init__(self):
        self.processor = None
        self.model = None

    def _load_model(self):
        if self.model is None:
            logger.info("Loading Wav2Vec2 Emotion Recognition model...")
            from transformers import Wav2Vec2FeatureExtractor, AutoModelForAudioClassification
            model_id = "ehcalabres/wav2vec2-lg-xlsr-en-speech-emotion-recognition"
            try:
                self.processor = Wav2Vec2FeatureExtractor.from_pretrained(model_id)
                self.model = AutoModelForAudioClassification.from_pretrained(model_id)
                self.model.eval()
            except Exception as e:
                logger.error(f"Could not load emotion model: {e}")
                raise

    def _read_audio(self, audio_path: str):
        import librosa
        speech, _ = librosa.load(audio_path, sr=16000)
        return speech

    def extract_emotions(self, audio_path: str) -> torch.Tensor:
        """Returns emotion probability distribution for an audio file."""
        self._load_model()
        speech = self._read_audio(audio_path)
        inputs = self.processor(speech, sampling_rate=16000, return_tensors="pt", padding=True)
        
        with torch.no_grad():
            logits = self.model(inputs.input_values).logits
            
        return F.softmax(logits, dim=-1)

    def compute_emotion_similarity(self, original_audio: str, dubbed_audio: str) -> dict:
        """
        Compare the emotion of the original and dubbed audio.
        Returns a similarity score (0-100).
        """
        try:
            orig_probs = self.extract_emotions(original_audio)
            dub_probs = self.extract_emotions(dubbed_audio)
            
            # Compute cosine similarity between emotion probability distributions
            from sentence_transformers.util import cos_sim
            similarity = cos_sim(orig_probs, dub_probs).item()
            
            score = max(0.0, min(100.0, similarity * 100))
            
            return {
                "similarity_score": score,
                "original_emotion_probs": orig_probs.tolist()[0],
                "dubbed_emotion_probs": dub_probs.tolist()[0]
            }
        except Exception as e:
            logger.error(f"Emotion analysis failed: {e}")
            return {
                "similarity_score": 0.0,
                "error": str(e)
            }

emotion_service = EmotionAnalysisService()
