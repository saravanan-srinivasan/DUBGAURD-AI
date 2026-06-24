<div align="center">
  <h1>DubGuard AI 🛡️✨</h1>
  <p><strong>An advanced AI Dubbing Quality Assurance and Auto-Correction Engine.</strong></p>
</div>

## 🚀 Overview

DubGuard AI is a state-of-the-art evaluation pipeline that automatically analyzes AI-dubbed and translated videos for semantic accuracy, voice similarity, lip-sync precision, and emotion preservation. 

If the dubbing quality falls below a critical threshold, the **Active Auto-Correction Engine** takes over to actively fix bad translations and regenerate perfect audio on the fly.

## 🧠 Neural Architecture

This project runs **7 distinct neural networks** in a high-performance, asynchronous pipeline:

1. **`faster-whisper`**: Zero-click transcription of the original and dubbed audio.
2. **`all-MiniLM-L6-v2`**: Cross-lingual semantic embedding comparison for translation accuracy.
3. **`wav2vec2-large-robust`**: Phoneme-level acoustic scoring.
4. **`speechbrain/emotion-recognition`**: Classification of underlying vocal emotion.
5. **`speechbrain/spkrec-ecapa-voxceleb`**: Zero-shot voice cloning verification (Speaker ID).
6. **`LLaMA-3` (via Groq)**: Our intelligent agent that rewrites hallucinations and broken translations.
7. **`Edge-TTS` & `Demucs`**: Stem-mixing generation to rip the background music from the original file, synthesize the corrected TTS, and mix them together using `pydub`.

## ⚡ Performance

- **Pre-Loaded Models:** All HuggingFace Transformers are loaded into RAM upon the FastAPI server boot (`startup_event`), eliminating cold-start latency.
- **Asynchronous Execution:** Model inferences run concurrently using `asyncio.to_thread` for maximum CPU throughput.

## 💻 Tech Stack

- **Backend:** Python, FastAPI, HuggingFace Transformers, PyTorch
- **Frontend:** React, TypeScript, Vite
- **UI/UX:** Modern Glassmorphism, CSS Mesh Gradients, Lucide Icons, SVG Radial Progress Components

## 🛠️ Setup Instructions

### 1. Backend Setup
```bash
cd dubguard-backend
python -m venv venv
.\venv\Scripts\activate  # Windows
pip install -r requirements.txt
```
*Note: Make sure you have `ffmpeg` installed on your system PATH for pydub to process audio.*

### 2. Frontend Setup
```bash
cd dubguard-frontend
npm install
```

### 3. Running the Stack
Start the backend:
```bash
cd dubguard-backend
.\venv\Scripts\activate
uvicorn app.main:app --host 0.0.0.0 --port 8000
```
Start the frontend:
```bash
cd dubguard-frontend
npm run dev
```

## 🔒 Security
- Protected against Directory Traversal attacks.
- Environment paths safely sandboxed for cross-platform deployment on Linux (Render/Railway) or Windows.

---
*Built with React, FastAPI, and Next-Generation AI.*
