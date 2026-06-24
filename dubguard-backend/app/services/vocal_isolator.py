import os
import tempfile
import base64
import logging
import librosa
import soundfile as sf

logger = logging.getLogger("dubguard.vocal_isolator")

class VocalIsolatorService:
    def isolate(self, audio_path: str) -> dict:
        """
        Separates audio into Harmonic (vocals/melody) and Percussive (beats/background).
        Returns base64 encoded strings for both.
        """
        try:
            logger.info("Loading audio for separation...")
            y, sr = librosa.load(audio_path, sr=22050)
            
            logger.info("Applying HPSS separation...")
            # Harmonic-Percussive Source Separation
            y_harmonic, y_percussive = librosa.effects.hpss(y)
            
            # Save to temp files
            with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as harm_file:
                harm_path = harm_file.name
            with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as perc_file:
                perc_path = perc_file.name
                
            sf.write(harm_path, y_harmonic, sr)
            sf.write(perc_path, y_percussive, sr)
            
            # Encode to base64
            with open(harm_path, "rb") as f:
                vocals_b64 = base64.b64encode(f.read()).decode('utf-8')
                
            with open(perc_path, "rb") as f:
                background_b64 = base64.b64encode(f.read()).decode('utf-8')
                
            # Cleanup
            os.remove(harm_path)
            os.remove(perc_path)
            
            return {
                "vocals_base64": vocals_b64,
                "background_base64": background_b64
            }
            
        except Exception as e:
            logger.error(f"Vocal isolation failed: {e}")
            raise

vocal_isolator_service = VocalIsolatorService()
