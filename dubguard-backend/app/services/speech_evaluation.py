import jiwer
import logging

logger = logging.getLogger("dubguard.speech_eval")

class SpeechEvaluationService:
    def __init__(self, model_size="small"):
        pass

    def transcribe(self, audio_path: str) -> str:
        """Transcribe an audio file using Groq Whisper API (whisper-large-v3) for extreme accuracy."""
        from groq import Groq
        from app.core.config import settings
        logger.info(f"Transcribing {audio_path} using Groq Whisper API")
        try:
            client = Groq(api_key=settings.GROQ_API_KEY)
            with open(audio_path, "rb") as file:
                transcription = client.audio.transcriptions.create(
                    file=(audio_path, file.read()),
                    model="whisper-large-v3",
                    response_format="text"
                )
            return transcription.strip()
        except Exception as e:
            logger.error(f"Groq Whisper transcription failed: {e}")
            return ""

    def transcribe_with_timestamps(self, audio_path: str) -> list:
        """Transcribe audio and return timestamped segments for SRT generation."""
        from groq import Groq
        from app.core.config import settings
        try:
            client = Groq(api_key=settings.GROQ_API_KEY)
            with open(audio_path, "rb") as file:
                transcription = client.audio.transcriptions.create(
                    file=(audio_path, file.read()),
                    model="whisper-large-v3",
                    response_format="verbose_json"
                )
            # Depending on Groq's python client version, segments might be dicts or objects
            if hasattr(transcription, "segments"):
                return transcription.segments
            elif isinstance(transcription, dict) and "segments" in transcription:
                return transcription["segments"]
            return []
        except Exception as e:
            logger.error(f"Groq Whisper timestamp transcription failed: {e}")
            return []

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
