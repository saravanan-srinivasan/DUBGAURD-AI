import os
from dotenv import load_dotenv
load_dotenv()
import platform
if platform.system() == "Windows" and os.path.exists("D:\\"):
    os.environ["HF_HOME"] = r"D:\AI_Cache\huggingface"

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.logging import logger
from app.api.endpoints import router as api_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins for dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)

from app.services.speech_evaluation import speech_eval_service
from app.services.translation_evaluation import translation_eval_service
from app.services.pronunciation_verification import pronunciation_service
from app.services.emotion_analysis import emotion_service
from app.services.speaker_similarity import speaker_service

@app.on_event("startup")
async def startup_event():
    logger.info(f"Starting up {settings.PROJECT_NAME}...")
    logger.info("Pre-loading AI models safely into memory...")
    try:
        # Load sequentially to prevent HuggingFace lazy-import thread collisions
        speech_eval_service._load_model()
        translation_eval_service._load_semantic_model()
        pronunciation_service._load_model()
        emotion_service._load_model()
        speaker_service._load_model()
        
        # Pre-load XTTS voice cloning model so it doesn't cause a 30s delay on the first API request
        from app.services.voice_cloning import voice_cloning_service
        voice_cloning_service._init_tts()
        
        logger.info("All AI models pre-loaded successfully!")
    except Exception as e:
        logger.error(f"Error pre-loading models: {e}")

@app.get("/")
def read_root():
    return {"message": f"Welcome to {settings.PROJECT_NAME} API"}
