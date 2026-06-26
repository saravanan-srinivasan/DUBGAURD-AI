import os
import uuid
import tempfile
import logging
from typing import Optional

# Automatically agree to Coqui TTS terms of service so it doesn't block the API
os.environ["COQUI_TOS_AGREED"] = "1"

logger = logging.getLogger("dubguard.voice_cloning")

class VoiceCloningService:
    def __init__(self):
        self.tts = None
        self.is_loading = False

    def _init_tts(self):
        if self.tts is None and not self.is_loading:
            self.is_loading = True
            logger.info("Initializing YourTTS Voice Cloning Model...")
            try:
                from TTS.api import TTS
                # YourTTS: ~100MB, supports zero-shot voice cloning, runs on CPU reliably
                self.tts = TTS("tts_models/multilingual/multi-dataset/your_tts", gpu=False)
                logger.info("YourTTS loaded successfully.")
            except Exception as e:
                logger.error(f"Failed to load YourTTS: {e}")
                self.tts = None
            finally:
                self.is_loading = False

    def clone_voice(self, text: str, reference_audio_path: str, language: str = "en") -> Optional[str]:
        """
        Clones a voice from the reference audio and speaks the provided text.
        Uses YourTTS for fast, lightweight voice cloning.
        """
        # Ensure the model is loaded
        if self.tts is None:
            self._init_tts()

        if self.tts is None:
            logger.error("TTS Model could not be loaded.")
            return None

        # Output path
        temp_dir = tempfile.gettempdir()
        output_filename = f"cloned_{uuid.uuid4().hex[:8]}.wav"
        output_path = os.path.join(temp_dir, output_filename)

        from app.services.auto_correction import auto_correction_service
        
        logger.info(f"Translating text for voice clone to {language}...")
        final_text = auto_correction_service.translate_with_llm(text, language)

        logger.info(f"Generating cloned voice with YourTTS... (Text length: {len(final_text)})")
        try:
            self.tts.tts_to_file(
                text=final_text,
                file_path=output_path,
                speaker_wav=reference_audio_path,
                language="en"  # YourTTS supports en, fr, de, pt, pl
            )
            logger.info(f"Cloned audio saved to {output_path}")
            return output_path
        except Exception as e:
            logger.error(f"Failed to generate voice clone: {e}")
            return None

voice_cloning_service = VoiceCloningService()
