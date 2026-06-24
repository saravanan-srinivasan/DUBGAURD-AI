import os
import tempfile
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.api.models import EvaluationResponse
from app.services.speech_evaluation import speech_eval_service
from app.services.translation_evaluation import translation_eval_service
from app.services.pronunciation_verification import pronunciation_service
from app.services.emotion_analysis import emotion_service
from app.services.speaker_similarity import speaker_service
from app.services.lip_sync_analysis import lip_sync_service
from app.services.audio_quality_analysis import audio_quality_service
from app.services.auto_correction import auto_correction_service

router = APIRouter()

@router.post("/evaluate-dubbing", response_model=EvaluationResponse)
async def evaluate_dubbing(
    original_audio: UploadFile = File(...),
    dubbed_audio: UploadFile = File(...),
    dubbed_video: UploadFile = File(None),
    original_transcript: str = Form(None),
    translated_transcript: str = Form(None)
):
    try:
        # Save uploaded files temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as orig_audio_tmp:
            orig_audio_tmp.write(await original_audio.read())
            orig_audio_path = orig_audio_tmp.name
            
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as dubbed_audio_tmp:
            dubbed_audio_tmp.write(await dubbed_audio.read())
            dubbed_audio_path = dubbed_audio_tmp.name
            
        dubbed_video_path = None
        if dubbed_video:
            with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as dubbed_video_tmp:
                dubbed_video_tmp.write(await dubbed_video.read())
                dubbed_video_path = dubbed_video_tmp.name

        import asyncio
        
        # Zero-Click Auto-Transcription
        if not original_transcript or not original_transcript.strip():
            original_transcript = await asyncio.to_thread(speech_eval_service.transcribe, orig_audio_path)
            
        if not translated_transcript or not translated_transcript.strip():
            translated_transcript = await asyncio.to_thread(speech_eval_service.transcribe, dubbed_audio_path)
        
        # Run independent evaluations concurrently
        speech_eval, trans_eval, pronun_eval, emotion_eval, speaker_eval, audio_qual_eval = await asyncio.gather(
            asyncio.to_thread(speech_eval_service.evaluate, dubbed_audio_path, translated_transcript),
            asyncio.to_thread(translation_eval_service.evaluate, original_transcript, original_transcript, translated_transcript),
            asyncio.to_thread(pronunciation_service.verify_pronunciation, dubbed_audio_path, translated_transcript),
            asyncio.to_thread(emotion_service.compute_emotion_similarity, orig_audio_path, dubbed_audio_path),
            asyncio.to_thread(speaker_service.compute_similarity, orig_audio_path, dubbed_audio_path),
            asyncio.to_thread(audio_quality_service.analyze_quality, dubbed_audio_path)
        )
        
        # 7. Lip-Sync Analysis (Optional)
        lip_sync_eval = {}
        if dubbed_video_path:
            lip_sync_eval = await asyncio.to_thread(lip_sync_service.analyze, dubbed_video_path)

        # Clean up temp files
        os.remove(orig_audio_path)
        os.remove(dubbed_audio_path)
        if dubbed_video_path:
            os.remove(dubbed_video_path)

        # Aggregate Results
        detailed_metrics = {
            "speech_evaluation": speech_eval,
            "translation_evaluation": trans_eval,
            "pronunciation_verification": pronun_eval,
            "emotion_analysis": emotion_eval,
            "speaker_similarity": speaker_eval,
            "audio_quality": audio_qual_eval,
            "lip_sync_analysis": lip_sync_eval
        }
        
        # Auto-Correction Evaluation (Active Fixing)
        final_assessment = await auto_correction_service.evaluate_pipeline_results(
            results=detailed_metrics,
            original_transcript=original_transcript,
            translated_transcript=translated_transcript,
            orig_audio_path=orig_audio_path
        )
        
        return EvaluationResponse(
            overall_score=final_assessment["overall_score"],
            status=final_assessment["status"],
            issues_detected=final_assessment["issues_detected"],
            auto_correct_recommendations=final_assessment["auto_correct_recommendations"],
            detailed_metrics=detailed_metrics,
            corrected_transcript=final_assessment.get("corrected_transcript"),
            corrected_audio_path=final_assessment.get("corrected_audio_path")
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from fastapi.responses import FileResponse

@router.get("/download-corrected")
async def download_corrected_audio(path: str):
    import tempfile
    temp_dir = tempfile.gettempdir()
    
    # SECURITY FIX: Prevent Directory Traversal attacks
    requested_path = os.path.abspath(path)
    if not requested_path.startswith(os.path.abspath(temp_dir)):
        raise HTTPException(status_code=403, detail="Access denied.")
        
    if not os.path.exists(requested_path):
        raise HTTPException(status_code=404, detail="Corrected audio file not found.")
        
    return FileResponse(requested_path, media_type="audio/mpeg", filename="corrected_dub.mp3")

from pydantic import BaseModel
import base64

class VoiceStudioRequest(BaseModel):
    text: str
    language: str = "en"

@router.post("/voice-studio")
async def voice_studio(request: VoiceStudioRequest):
    try:
        audio_path, _ = auto_correction_service.generate_tts(request.text, target_lang=request.language)
        if not audio_path or not os.path.exists(audio_path):
            raise HTTPException(status_code=500, detail="Failed to generate audio.")
            
        with open(audio_path, "rb") as audio_file:
            audio_bytes = audio_file.read()
            base64_audio = base64.b64encode(audio_bytes).decode('utf-8')
            
        return {"audio_base64": base64_audio}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
