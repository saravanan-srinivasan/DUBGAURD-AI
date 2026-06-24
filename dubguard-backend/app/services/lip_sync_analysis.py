import logging
import cv2
import librosa
import numpy as np
from scipy import signal

logger = logging.getLogger("dubguard.lipsync_eval")

class LipSyncAnalysisService:
    def __init__(self):
        self.mp_face_mesh = None

    def _load_model(self):
        if self.mp_face_mesh is None:
            logger.info("Loading MediaPipe Face Mesh model for SciPy Lip-Sync correlation...")
            try:
                import mediapipe as mp
                self.mp_face_mesh = mp.solutions.face_mesh.FaceMesh(
                    static_image_mode=False,
                    max_num_faces=1,
                    refine_landmarks=True,
                    min_detection_confidence=0.5,
                    min_tracking_confidence=0.5
                )
            except ImportError:
                logger.error("MediaPipe is not installed.")
                raise

    def extract_lip_aperture(self, video_path: str, fps: int = 30) -> tuple:
        """Extracts vertical distance between upper and lower lips per frame."""
        self._load_model()
        cap = cv2.VideoCapture(video_path)
        
        # Override fps if we can read it
        actual_fps = cap.get(cv2.CAP_PROP_FPS)
        if actual_fps > 0:
            fps = actual_fps
            
        lip_distances = []
        UPPER_LIP = 13
        LOWER_LIP = 14

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
                
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = self.mp_face_mesh.process(rgb_frame)
            
            if results.multi_face_landmarks:
                face_landmarks = results.multi_face_landmarks[0]
                upper = face_landmarks.landmark[UPPER_LIP]
                lower = face_landmarks.landmark[LOWER_LIP]
                distance = ((upper.x - lower.x)**2 + (upper.y - lower.y)**2)**0.5
                lip_distances.append(distance)
            else:
                lip_distances.append(0.0)
                
        cap.release()
        return np.array(lip_distances), fps

    def extract_audio_rms(self, video_path: str, target_fps: float) -> np.ndarray:
        """Extracts RMS energy envelope from the audio track at the same FPS as the video."""
        try:
            # We use the video_path as librosa will extract the audio track from the mp4
            y, sr = librosa.load(video_path, sr=16000)
            
            # Calculate hop length to match the video FPS
            hop_length = int(sr / target_fps)
            rms = librosa.feature.rms(y=y, hop_length=hop_length)[0]
            
            # Normalize RMS
            if np.max(rms) > 0:
                rms = rms / np.max(rms)
                
            return rms
        except Exception as e:
            logger.error(f"Failed to extract audio from video for RMS calculation: {e}")
            return np.array([])

    def analyze(self, video_path: str) -> dict:
        """
        Analyze lip sync using Audio RMS and Video Lip Aperture Cross-Correlation.
        """
        try:
            # 1. Extract Visual Signal
            lip_aperture, fps = self.extract_lip_aperture(video_path)
            if len(lip_aperture) == 0:
                return {"lip_sync_score": 0.0, "error": "No face detected in video."}
                
            # Normalize Lip Aperture
            if np.max(lip_aperture) > 0:
                lip_aperture = lip_aperture / np.max(lip_aperture)
                
            # 2. Extract Audio Signal
            audio_rms = self.extract_audio_rms(video_path, fps)
            if len(audio_rms) == 0:
                return {"lip_sync_score": 0.0, "error": "No audio track found in video."}
                
            # Make lengths match
            min_len = min(len(lip_aperture), len(audio_rms))
            lip_aperture = lip_aperture[:min_len]
            audio_rms = audio_rms[:min_len]
            
            # 3. Cross-Correlation
            # We cross-correlate the two 1D signals
            correlation = signal.correlate(lip_aperture - np.mean(lip_aperture), audio_rms - np.mean(audio_rms), mode='full')
            
            # Find the peak correlation (offset)
            lags = signal.correlation_lags(len(lip_aperture), len(audio_rms), mode='full')
            max_corr_idx = np.argmax(correlation)
            frame_offset = lags[max_corr_idx]
            
            # Convert frame offset to milliseconds
            ms_offset = (frame_offset / fps) * 1000.0
            
            # Normalize score based on correlation coefficient
            corr_coeff = np.corrcoef(lip_aperture, audio_rms)[0, 1]
            # Convert correlation (-1 to 1) to a 0-100 score. (0 to 1) -> (0 to 100)
            score = max(0.0, float(corr_coeff) * 100) if not np.isnan(corr_coeff) else 0.0
            
            return {
                "lip_sync_score": score,
                "frame_offset": int(frame_offset),
                "ms_offset_latency": round(ms_offset, 2),
                "details": f"Cross-Correlation computed. A/V Offset: {round(ms_offset, 2)}ms."
            }
        except Exception as e:
            logger.error(f"Lip-sync analysis failed: {e}")
            return {
                "lip_sync_score": 0.0,
                "error": str(e)
            }

lip_sync_service = LipSyncAnalysisService()
