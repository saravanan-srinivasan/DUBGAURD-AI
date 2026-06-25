FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libsndfile1 \
    libgl1 \
    libglib2.0-0 \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Pre-download YourTTS (only ~100MB, CPU-friendly voice cloning model)
ENV COQUI_TOS_AGREED=1
RUN python -c "\
import os; \
os.environ['COQUI_TOS_AGREED'] = '1'; \
from TTS.api import TTS; \
TTS('tts_models/multilingual/multi-dataset/your_tts', gpu=False); \
print('YourTTS downloaded successfully!')"

ENV PYTHONPATH=/app

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]
