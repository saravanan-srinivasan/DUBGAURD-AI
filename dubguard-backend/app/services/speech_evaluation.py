import jiwer
import logging

logger = logging.getLogger("dubguard.speech_eval")

class SpeechEvaluationService:
    def __init__(self, model_size="base"):
        self.model_size = model_size
        self.model = None

    def _load_model(self):
        if self.model is None:
            logger.info(f"Loading Faster-Whisper model ({self.model_size})...")
            try:
                from faster_whisper import WhisperModel
                self.model = WhisperModel(self.model_size, device="cpu", compute_type="int8")
            except ImportError:
                logger.error("faster-whisper is not installed.")
                raise

    def transcribe(self, audio_path: str) -> str:
        """Transcribe an audio file using faster-whisper."""
        self._load_model()
        logger.info(f"Transcribing {audio_path}")
        segments, info = self.model.transcribe(
            audio_path, 
            beam_size=5,
            vad_filter=True,
            condition_on_previous_text=False
        )
        transcript = " ".join([segment.text.strip() for segment in segments])
        return transcript

    def compute_wer(self, reference: str, hypothesis: str) -> float:
        """Compute Word Error Rate (WER)."""
        if not reference.strip() or not hypothesis.strip():
            return 1.0
        return jiwer.wer(reference, hypothesis)

    def compute_cer(self, reference: str, hypothesis: str) -> float:
        """Compute Character Error Rate (CER)."""
        if not reference.strip() or not hypothesis.strip():
            return 1.0
        return jiwer.cer(reference, hypothesis)

    def evaluate(self, audio_path: str, reference_transcript: str) -> dict:
        """Transcribe audio and compare with reference transcript."""
        hypothesis = self.transcribe(audio_path)
        wer = self.compute_wer(reference_transcript, hypothesis)
        cer = self.compute_cer(reference_transcript, hypothesis)
        
        return {
            "hypothesis": hypothesis,
            "reference": reference_transcript,
            "wer": wer,
            "cer": cer
        }

speech_eval_service = SpeechEvaluationService()
