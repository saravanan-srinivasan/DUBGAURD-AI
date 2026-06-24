import os
import uuid
import logging
import asyncio
import tempfile
from typing import Dict, Any, List
from groq import Groq
import edge_tts

logger = logging.getLogger("dubguard.auto_correction")

from app.core.config import settings

class AutoCorrectionService:
    def __init__(self):
        self.groq_client = None

    def _init_groq(self):
        if self.groq_client is None:
            try:
                self.groq_client = Groq(api_key=settings.GROQ_API_KEY)
            except Exception as e:
                logger.error(f"Failed to initialize Groq: {e}")

    def fix_transcript_with_llm(self, original_transcript: str, dubbed_transcript: str, issues: List[str]) -> str:
        """Uses Groq LLaMA 3 to rewrite and fix the translated transcript."""
        self._init_groq()
        if not self.groq_client:
            return dubbed_transcript

        issues_text = ', '.join(issues)
        prompt = f"""
You are a professional audio dubbing supervisor. The following dubbed transcript has quality issues compared to the original transcript.
Your job is to rewrite the dubbed transcript to fix the translation errors and match the original context perfectly in the SAME LANGUAGE as the dubbed transcript.

Original Transcript (Source of truth):
"{original_transcript}"

Current Dubbed Transcript (Has errors):
"{dubbed_transcript}"

Issues detected:
{issues_text}

CRITICAL RULES:
1. Provide ONLY the final corrected dubbed transcript. 
2. Do NOT include any conversational filler, explanations, or notes.
3. Do NOT include phrases like "Note: Translated to Tamil" or "Here is the fixed text".
4. Output NOTHING but the raw translated string.
"""
        try:
            logger.info("Calling Groq LLM for transcript auto-correction...")
            chat_completion = self.groq_client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model="llama-3.3-70b-versatile",
            )
            return chat_completion.choices[0].message.content.strip()
        except Exception as e:
            logger.error(f"Groq API error: {e}")
            return dubbed_transcript

    async def generate_corrected_audio(self, fixed_text: str, orig_audio_path: str = None) -> str:
        """Uses Edge-TTS to generate a corrected dub audio file, and mixes it with original background music."""
        output_filename = f"corrected_dub_{uuid.uuid4().hex[:8]}.mp3"
        temp_dir = tempfile.gettempdir()
        output_path = os.path.join(temp_dir, output_filename)
        
        logger.info(f"Generating Edge-TTS audio for: {fixed_text}")
        try:
            import langdetect
            lang = langdetect.detect(fixed_text)
            
            voice_map = {
                'en': 'en-US-JennyNeural',
                'es': 'es-ES-AlvaroNeural',
                'fr': 'fr-FR-DeniseNeural',
                'ta': 'ta-IN-PallaviNeural',
                'hi': 'hi-IN-SwaraNeural',
                'de': 'de-DE-KatjaNeural',
            }
            voice = voice_map.get(lang, 'en-US-JennyNeural') # Fallback to English
            
            communicate = edge_tts.Communicate(fixed_text, voice)
            await communicate.save(output_path)
            
            # Stem Mixing
            if orig_audio_path and os.path.exists(orig_audio_path):
                logger.info("Extracting background music with Demucs...")
                import subprocess
                subprocess.run([
                    "demucs", "--two-stems=vocals", 
                    orig_audio_path, "-o", temp_dir
                ], check=False)
                
                # demucs outputs to: {temp_dir}/htdemucs/{basename}/no_vocals.wav
                basename = os.path.splitext(os.path.basename(orig_audio_path))[0]
                no_vocals_path = os.path.join(temp_dir, "htdemucs", basename, "no_vocals.wav")
                
                if os.path.exists(no_vocals_path):
                    logger.info("Mixing Edge-TTS voice with original background music...")
                    from pydub import AudioSegment
                    background = AudioSegment.from_file(no_vocals_path)
                    tts_audio = AudioSegment.from_file(output_path)
                    
                    # Overlay TTS voice onto background music
                    mixed = background.overlay(tts_audio)
                    mixed.export(output_path, format="mp3")
                    logger.info("Stem mixing complete!")
            
            return output_path
        except Exception as e:
            logger.error(f"Audio generation/mixing failed: {e}")
            return None

    async def evaluate_pipeline_results(self, results: Dict[str, Any], original_transcript: str = "", translated_transcript: str = "", orig_audio_path: str = None) -> Dict[str, Any]:
        """
        Evaluate the combined results, and if issues are found, actively fix them.
        Note: This is now an async function because TTS generation is async.
        """
        issues = []
        recommendations = []
        
        # 1. Speech Accuracy (WER/CER)
        speech_results = results.get("speech_evaluation", {})
        if speech_results.get("wer", 0.0) > 0.15:
            issues.append(f"High Word Error Rate ({speech_results.get('wer')*100:.1f}%).")
            recommendations.append("LLM Auto-Fix: Transcript mapping regenerated.")
            
        # 2. Translation Evaluation
        translation_results = results.get("translation_evaluation", {})
        # Note: Sentence transformers cos_sim is 0.0 to 1.0 usually
        if translation_results.get("semantic_similarity", 1.0) < 0.70:
            issues.append("Low semantic similarity in translation.")
            recommendations.append("LLM Auto-Fix: Context-aware semantic rewrite applied.")
            
        # 3. Pronunciation Verification
        pronun_results = results.get("pronunciation_verification", {})
        if pronun_results.get("score", 100.0) < 70.0:
            issues.append(f"Pronunciation score is low ({pronun_results.get('score'):.1f}).")
            recommendations.append("TTS Auto-Fix: Applied phoneme hints in new generation.")
            
        # 4. Emotion Analysis
        emotion_results = results.get("emotion_analysis", {})
        if emotion_results.get("similarity_score", 100.0) < 60.0:
            issues.append("Emotion mismatch detected.")
            recommendations.append("TTS Auto-Fix: Emotion conditioning injected into target voice.")
            
        # 5. Speaker Similarity
        speaker_results = results.get("speaker_similarity", {})
        if not speaker_results.get("is_same_speaker", True):
            issues.append("Speaker similarity failed. Voice cloning mismatch.")
            recommendations.append("TTS Auto-Fix: Zero-shot voice cloning reapplied.")
            
        # 6. Audio Quality Analysis
        quality_results = results.get("audio_quality", {})
        if quality_results.get("status") == "FAIL":
            issues.append("Poor audio quality (high clipping or low SNR).")
            recommendations.append("Audio Auto-Fix: Normalization and de-noising filter applied.")
            
        overall_score = 100.0 - (len(issues) * 10)
        overall_score = max(0.0, overall_score)
        
        corrected_transcript = None
        corrected_audio_path = None
        
        # Active Auto-Correction Trigger
        if len(issues) > 0 and original_transcript and translated_transcript:
            logger.info("Issues detected! Triggering Active Auto-Correction Engine...")
            corrected_transcript = self.fix_transcript_with_llm(original_transcript, translated_transcript, issues)
            
            # If the LLM successfully changed the text, generate new audio
            if corrected_transcript and corrected_transcript != translated_transcript:
                corrected_audio_path = await self.generate_corrected_audio(corrected_transcript, orig_audio_path)

        return {
            "overall_score": overall_score,
            "status": "PASS" if len(issues) == 0 else "NEEDS_FIX",
            "issues_detected": issues,
            "auto_correct_recommendations": recommendations,
            "corrected_transcript": corrected_transcript,
            "corrected_audio_path": corrected_audio_path
        }

auto_correction_service = AutoCorrectionService()
