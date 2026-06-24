import logging
import numpy as np

logger = logging.getLogger("dubguard.audio_quality")

class AudioQualityAnalysisService:
    def _read_audio(self, audio_path: str):
        import librosa
        speech, sr = librosa.load(audio_path, sr=None)
        return speech, sr

    def analyze_quality(self, audio_path: str) -> dict:
        """
        Analyze basic audio quality metrics: SNR, clipping, and silence ratio.
        """
        try:
            speech, sr = self._read_audio(audio_path)
            
            if len(speech) == 0:
                raise ValueError("Empty audio file")
            
            # Detect clipping (values maxed out at 1.0 or -1.0)
            clipping_threshold = 0.99
            clipped_samples = np.sum(np.abs(speech) >= clipping_threshold)
            clipping_ratio = clipped_samples / len(speech)
            
            # Detect silence
            import librosa
            non_mute_intervals = librosa.effects.split(speech, top_db=40)
            non_mute_samples = sum([end - start for start, end in non_mute_intervals])
            silence_ratio = 1.0 - (non_mute_samples / len(speech))
            
            # Approximate SNR
            signal_power = np.mean(speech**2)
            noise_power = 0.0
            
            if silence_ratio > 0.0:
                noise_mask = np.ones(len(speech), dtype=bool)
                for start, end in non_mute_intervals:
                    noise_mask[start:end] = False
                noise = speech[noise_mask]
                noise_power = np.mean(noise**2)
            
            if noise_power > 0 and signal_power > 0:
                snr_db = 10 * np.log10(signal_power / noise_power)
            else:
                snr_db = 40.0
            
            return {
                "snr_db": float(snr_db),
                "clipping_ratio": float(clipping_ratio),
                "silence_ratio": float(silence_ratio),
                "status": "PASS" if (snr_db > 20 and clipping_ratio < 0.01) else "FAIL"
            }
        except Exception as e:
            logger.error(f"Audio quality analysis failed: {e}")
            return {
                "snr_db": 0.0,
                "clipping_ratio": 0.0,
                "silence_ratio": 0.0,
                "status": "ERROR",
                "error": str(e)
            }

audio_quality_service = AudioQualityAnalysisService()
