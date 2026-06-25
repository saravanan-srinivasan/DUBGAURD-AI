# DubGuard AI — Project Memory
> Last Updated: 2026-06-25
> Read this FIRST before doing anything on this project.

---

## 🌐 Live URLs
| Service | URL |
|---|---|
| **Frontend (Vercel)** | https://dubgaurd-ai.vercel.app |
| **Backend (HuggingFace Space)** | https://shravan2020-dubguard-backend.hf.space |
| **HuggingFace Space Dashboard** | https://huggingface.co/spaces/Shravan2020/dubguard-backend |
| **GitHub Repo** | https://github.com/saravanan-srinivasan/DUBGAURD-AI |

---

## 📁 Local Project Structure
```
D:\COMPLETED WORKING PROJECTS\TTS PROJECT\
├── dubguard-frontend\        ← React + TypeScript (deployed to Vercel)
├── dubguard-backend\         ← FastAPI Python (source of truth)
├── hf_space_temp\            ← Git clone of HuggingFace Space (used to deploy backend)
├── .agents\
│   ├── AGENTS.md             ← Agent rules (never fill C: drive)
│   └── PROJECT_MEMORY.md     ← This file
```

---

## ⚠️ CRITICAL RULES (Read before every session)
1. **NEVER fill the C: drive.** Always keep 7.5 GB free. Route all AI model downloads to `D:\AI_Cache`.
2. **To deploy backend changes**, you MUST copy files to `hf_space_temp\` and git push from there:
   ```powershell
   Copy-Item -Path "dubguard-backend\app\..." -Destination "hf_space_temp\app\..." -Force
   cd hf_space_temp
   git add .; git commit -m "message"; git push
   ```
3. **Also push to GitHub** separately from the root project folder.
4. HuggingFace Space takes 2-3 minutes to rebuild after each push.

---

## 🏗️ Tech Stack
| Layer | Technology |
|---|---|
| Frontend | React + TypeScript + Vite |
| Styling | Vanilla CSS (dark theme, glassmorphism) |
| Frontend Hosting | Vercel (auto-deploys from GitHub on push) |
| Backend | FastAPI (Python) |
| Backend Hosting | HuggingFace Spaces (Docker) |
| Auth | Firebase Google Login |
| TTS | Edge-TTS (Microsoft Neural Voices) |
| Transcription | Faster-Whisper |
| Translation/AI | Groq API — model: `llama-3.3-70b-versatile` |
| Audio Separation | Librosa HPSS |
| Emotion Analysis | PyTorch model |

---

## ✅ All 6 Features & Their Status
| Feature | Route | Backend Endpoint | Status |
|---|---|---|---|
| DubGuard Evaluator | `/` | `POST /api/v1/evaluate-dubbing` | ✅ Working |
| AI Voice Studio | `/voice-studio` | `POST /api/v1/voice-studio` | ✅ Working |
| Audio Translator | `/translator` | `POST /api/v1/translator` | ✅ Working |
| Podcast Summarizer | `/summarizer` | `POST /api/v1/summarizer` | ✅ Working |
| Emotion Analyzer | `/emotion` | `POST /api/v1/emotion` | ✅ Working |
| Vocal Isolator | `/isolator` | `POST /api/v1/isolator` | ✅ Working |

---

## 🔑 Environment Variables & Secrets
### HuggingFace Space Secrets (already set in HF dashboard)
- `GROQ_API_KEY` = *(set in HuggingFace Space Settings → Secrets — do NOT commit the actual key)*

### Vercel Environment Variables (already set)
- `VITE_API_URL` = `https://shravan2020-dubguard-backend.hf.space`

### Local .env (dubguard-backend\.env and hf_space_temp\.env)
- `GROQ_API_KEY=<your-key-is-in-your-local-.env-file-do-not-commit>`
- `HF_HOME=D:\AI_Cache\huggingface`

---

## 🐛 Major Bugs Fixed (History)
| Bug | Root Cause | Fix Applied |
|---|---|---|
| "Not Found" on all 5 features | `VITE_API_URL` env var missing in Vercel build | Created `.env.production` with HF URL |
| Translation returning English always | Groq model `llama3-70b-8192` was **decommissioned** | Changed to `llama-3.3-70b-versatile` |
| Voice output in English despite Tamil selected | LLM prompt used language code `'ta'` not name `'Tamil'` | Added `LANG_NAMES` map, use full name in prompt |
| `generate_tts` method not found | Wrong function name in endpoints.py | Added proper `generate_tts` method in auto_correction.py |
| HuggingFace Space not updating | Space was NOT auto-synced to GitHub | Clone HF Space to `hf_space_temp\` and push directly |

---

## 📦 Key Files to Know
| File | Purpose |
|---|---|
| `dubguard-backend/app/api/endpoints.py` | All API route handlers |
| `dubguard-backend/app/services/auto_correction.py` | Groq translation, TTS generation, summarization |
| `dubguard-backend/app/services/vocal_isolator.py` | Librosa HPSS audio separation |
| `dubguard-backend/app/services/emotion_analysis.py` | PyTorch emotion detection |
| `dubguard-frontend/src/VoiceStudio.tsx` | Voice Studio UI |
| `dubguard-frontend/src/AudioTranslator.tsx` | Audio Translator UI |
| `dubguard-frontend/src/PodcastSummarizer.tsx` | Podcast Summarizer UI |
| `dubguard-frontend/src/EmotionAnalyzer.tsx` | Emotion Analyzer UI |
| `dubguard-frontend/src/VocalIsolator.tsx` | Vocal Isolator UI |
| `dubguard-frontend/.env.production` | Sets `VITE_API_URL` for Vercel builds |

---

## 🗣️ Voice Map (Edge-TTS)
```python
VOICE_MAP = {
    'en': 'en-US-JennyNeural',
    'ta': 'ta-IN-PallaviNeural',
    'te': 'te-IN-ShrutiNeural',
    'hi': 'hi-IN-SwaraNeural',
    'es': 'es-ES-AlvaroNeural',
    'fr': 'fr-FR-DeniseNeural',
    'de': 'de-DE-KatjaNeural',
    'it': 'it-IT-ElsaNeural',
}
```

---

## 🔐 Firebase Auth
- Auth is already set up with Google Login
- Firebase project is linked to the production Vercel domain
- Login works correctly on `https://dubgaurd-ai.vercel.app`

---

## 📝 How to Deploy Changes

### Backend change:
```powershell
# 1. Edit dubguard-backend\app\...
# 2. Copy to HF space and push
Copy-Item -Path "dubguard-backend\app\services\xyz.py" -Destination "hf_space_temp\app\services\xyz.py" -Force
cd hf_space_temp
git add .; git commit -m "your message"; git push
# 3. Also push to GitHub
cd ..
git add .; git commit -m "your message"; git push origin main
```

### Frontend change:
```powershell
# 1. Edit dubguard-frontend\src\...
# 2. Push to GitHub → Vercel auto-deploys
git add .; git commit -m "your message"; git push origin main
```
