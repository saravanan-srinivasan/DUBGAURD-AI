import os
import tempfile
import shutil
import uuid
import asyncio
import base64
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
from app.services.vocal_isolator import vocal_isolator_service
from app.services.voice_cloning import voice_cloning_service

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
    pitch: str = "+0Hz"
    rate: str = "+0%"

def format_edge_value(val: str, fallback: str) -> str:
    if not val:
        return fallback
    val = val.strip()
    if not val.startswith('+') and not val.startswith('-'):
        val = '+' + val
    return val

@router.post("/voice-studio")
async def voice_studio(
    text: str = Form(...),
    language: str = Form("en"),
    pitch: str = Form("+0Hz"),
    rate: str = Form("+0%"),
    custom_voice: UploadFile = File(None)
):
    try:
        supported_clone_langs = ['en', 'fr', 'pt']
        if custom_voice and language in supported_clone_langs:
            temp_dir = tempfile.gettempdir()
            ref_path = os.path.join(temp_dir, f"ref_studio_{uuid.uuid4().hex[:8]}.wav")
            
            with open(ref_path, "wb") as buffer:
                shutil.copyfileobj(custom_voice.file, buffer)
                
            loop = asyncio.get_event_loop()
            audio_path = await loop.run_in_executor(
                None, 
                voice_cloning_service.clone_voice, 
                text, ref_path, language
            )
            
            try:
                os.remove(ref_path)
            except:
                pass
        else:
            audio_path, _ = await auto_correction_service.generate_tts(
                text, 
                target_lang=language,
                pitch=format_edge_value(pitch, '+0Hz'),
                rate=format_edge_value(rate, '+0%')
            )
            
        if not audio_path or not os.path.exists(audio_path):
            raise HTTPException(status_code=500, detail="Failed to generate audio.")
            
        with open(audio_path, "rb") as audio_file:
            audio_bytes = audio_file.read()
            base64_audio = base64.b64encode(audio_bytes).decode('utf-8')
            
        return {"audio_base64": base64_audio}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/translator")
async def audio_translator(
    audio: UploadFile = File(...),
    target_language: str = Form("en"),
    custom_voice: UploadFile = File(None)
):
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as temp_audio:
            content = await audio.read()
            temp_audio.write(content)
            temp_audio_path = temp_audio.name

        original_transcript = speech_eval_service.transcribe(temp_audio_path)
        if not original_transcript:
            raise HTTPException(status_code=500, detail="Transcription failed.")

        translated_text = auto_correction_service.translate_with_llm(original_transcript, target_language)

        supported_clone_langs = ['en', 'fr', 'pt']
        if custom_voice and target_language in supported_clone_langs:
            temp_dir = tempfile.gettempdir()
            ref_path = os.path.join(temp_dir, f"ref_trans_{uuid.uuid4().hex[:8]}.wav")
            
            with open(ref_path, "wb") as buffer:
                shutil.copyfileobj(custom_voice.file, buffer)
                
            loop = asyncio.get_event_loop()
            tts_path = await loop.run_in_executor(
                None, 
                voice_cloning_service.clone_voice, 
                translated_text, ref_path, target_language
            )
            
            try:
                os.remove(ref_path)
            except:
                pass
        else:
            tts_path, _ = await auto_correction_service.generate_tts(translated_text, target_lang=target_language)
            
        if not tts_path or not os.path.exists(tts_path):
            raise HTTPException(status_code=500, detail="Failed to generate translated audio.")
            
        with open(tts_path, "rb") as f:
            audio_bytes = f.read()
            base64_audio = base64.b64encode(audio_bytes).decode('utf-8')
            
        return {
            "original_text": original_transcript,
            "translated_text": translated_text,
            "audio_base64": base64_audio
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/summarizer")
async def podcast_summarizer(
    audio: UploadFile = File(...)
):
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as temp_audio:
            content = await audio.read()
            temp_audio.write(content)
            temp_audio_path = temp_audio.name

        original_transcript = speech_eval_service.transcribe(temp_audio_path)
        if not original_transcript:
            raise HTTPException(status_code=500, detail="Transcription failed.")

        summary = auto_correction_service.summarize_podcast(original_transcript)

        return {
            "transcript": original_transcript,
            "summary": summary
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/emotion")
async def emotion_analyzer(
    audio: UploadFile = File(...)
):
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as temp_audio:
            content = await audio.read()
            temp_audio.write(content)
            temp_audio_path = temp_audio.name

        analysis = emotion_service.analyze_audio(temp_audio_path)
        
        # Clean up temp file
        if os.path.exists(temp_audio_path):
            os.remove(temp_audio_path)

        return analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/isolator")
async def vocal_isolator(
    audio: UploadFile = File(...)
):
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_audio:
            content = await audio.read()
            temp_audio.write(content)
            temp_audio_path = temp_audio.name

        result = vocal_isolator_service.isolate(temp_audio_path)
        
        # Clean up temp file
        if os.path.exists(temp_audio_path):
            os.remove(temp_audio_path)

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def format_timestamp(seconds: float) -> str:
    """Format seconds into SRT timestamp format (HH:MM:SS,mmm)"""
    import math
    hours = math.floor(seconds / 3600)
    minutes = math.floor((seconds % 3600) / 60)
    secs = math.floor(seconds % 60)
    msec = math.floor((seconds - math.floor(seconds)) * 1000)
    return f"{hours:02d}:{minutes:02d}:{secs:02d},{msec:03d}"

@router.post("/subtitles")
async def generate_subtitles(
    audio: UploadFile = File(...)
):
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as temp_audio:
            content = await audio.read()
            temp_audio.write(content)
            temp_audio_path = temp_audio.name

        segments = speech_eval_service.transcribe_with_timestamps(temp_audio_path)
        
        if os.path.exists(temp_audio_path):
            os.remove(temp_audio_path)
            
        if not segments:
            raise HTTPException(status_code=500, detail="Failed to generate subtitle segments.")
            
        srt_lines = []
        for i, segment in enumerate(segments):
            start_time = format_timestamp(segment.get('start', 0))
            end_time = format_timestamp(segment.get('end', 0))
            text = segment.get('text', '').strip()
            
            srt_lines.append(str(i + 1))
            srt_lines.append(f"{start_time} --> {end_time}")
            srt_lines.append(text)
            srt_lines.append("") # blank line between segments
            
        srt_content = "\n".join(srt_lines)
        
        return {"srt_content": srt_content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/youtube-seo")
async def youtube_seo(
    transcript: str = Form(...)
):
    try:
        if not transcript.strip():
            raise HTTPException(status_code=400, detail="Transcript is empty")
            
        metadata = auto_correction_service.generate_youtube_metadata(transcript)
        return metadata
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from typing import List

class MultiSpeakerBlock(BaseModel):
    text: str
    language: str
    pitch: str = "+0Hz"
    rate: str = "+0%"

class MultiSpeakerRequest(BaseModel):
    blocks: List[MultiSpeakerBlock]

@router.post("/voice-studio-multi")
async def voice_studio_multi(request: MultiSpeakerRequest):
    try:
        blocks_dict = [{"text": b.text, "language": b.language, "pitch": format_edge_value(b.pitch, '+0Hz'), "rate": format_edge_value(b.rate, '+0%')} for b in request.blocks]
        audio_path = await auto_correction_service.generate_multi_speaker_tts(blocks_dict)
        
        if not audio_path or not os.path.exists(audio_path):
            raise HTTPException(status_code=500, detail="Failed to generate multi-speaker audio.")
            
        with open(audio_path, "rb") as audio_file:
            audio_bytes = audio_file.read()
            base64_audio = base64.b64encode(audio_bytes).decode('utf-8')
            
        if os.path.exists(audio_path):
            os.remove(audio_path)
            
        return {"audio_base64": base64_audio}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from app.services.voice_cloning import voice_cloning_service

@router.post("/voice-clone")
async def voice_clone(
    text: str = Form(...),
    language: str = Form("en"),
    file: UploadFile = File(...)
):
    try:
        import tempfile
        import shutil
        import uuid
        import asyncio
        
        temp_dir = tempfile.gettempdir()
        ref_path = os.path.join(temp_dir, f"ref_{uuid.uuid4().hex[:8]}.wav")
        
        with open(ref_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        loop = asyncio.get_event_loop()
        audio_path = await loop.run_in_executor(
            None, 
            voice_cloning_service.clone_voice, 
            text, ref_path, language
        )

        try:
            os.remove(ref_path)
        except:
            pass

        if not audio_path or not os.path.exists(audio_path):
            raise HTTPException(status_code=500, detail="Failed to generate cloned voice.")
            
        with open(audio_path, "rb") as audio_file:
            audio_base64 = base64.b64encode(audio_file.read()).decode('utf-8')
            
        try:
            os.remove(audio_path)
        except:
            pass
            
        return {"status": "success", "audio_base64": audio_base64}
        
    except Exception as e:
        logger.error(f"Voice clone endpoint error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/logs")
async def get_logs():
    try:
        import sys
        # Check if HF spaces logs are accessible, or just return something
        return {"status": "ok", "message": "Log reading not supported directly, but endpoint is alive."}
    except Exception as e:
        return {"error": str(e)}

@router.get("/test-tts")
async def test_tts():
    import traceback
    try:
        import os
        model_path = "/app/xtts_v2_model"
        files = os.listdir(model_path) if os.path.exists(model_path) else []
        
        from app.services.voice_cloning import voice_cloning_service
        voice_cloning_service._init_tts()
        
        return {
            "status": "success", 
            "message": "TTS initialized successfully",
            "model_dir_exists": os.path.exists(model_path),
            "model_files": files,
            "tts_loaded": voice_cloning_service.tts is not None
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "traceback": traceback.format_exc(),
            "model_dir_exists": os.path.exists("/app/xtts_v2_model"),
            "model_files": os.listdir("/app/xtts_v2_model") if os.path.exists("/app/xtts_v2_model") else []
        }
