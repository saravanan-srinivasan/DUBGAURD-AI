import React, { useState } from 'react';
import { Globe, UploadCloud, Loader2, FileAudio, Download, Sparkles } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { collection, addDoc } from 'firebase/firestore';
import { db } from './firebase';
import { useAuth } from './AuthContext';

const AudioTranslator: React.FC = () => {
  const { currentUser } = useAuth();
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [language, setLanguage] = useState('es');
  const [loading, setLoading] = useState(false);
  const [originalText, setOriginalText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!audioFile) return;
    setLoading(true);
    setOriginalText('');
    setTranslatedText('');
    setAudioUrl(null);

    try {
      const formData = new FormData();
      formData.append('audio', audioFile);
      formData.append('target_language', language);

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await axios.post(`${apiUrl}/api/v1/translator`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (response.data) {
        setOriginalText(response.data.original_text);
        setTranslatedText(response.data.translated_text);
        if (response.data.audio_base64) {
          const audioSrc = `data:audio/mp3;base64,${response.data.audio_base64}`;
          setAudioUrl(audioSrc);
          toast.success("Translation complete!");

          if (currentUser) {
            try {
              await addDoc(collection(db, 'generations'), {
                userId: currentUser.uid,
                type: 'translation',
                timestamp: Date.now(),
                data: {
                  language: language,
                  originalText: response.data.original_text,
                  translatedText: response.data.translated_text,
                  audioUrl: audioSrc
                }
              });
            } catch (e) {
              console.error("Failed to save to history", e);
            }
          }
        }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to translate audio.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header className="header animate-fade-in">
        <div className="hero-badge"><Globe size={14} /> Global Translation</div>
        <h1>Audio <span className="gradient-text">Translator</span></h1>
        <p>Upload any audio file, translate it into multiple languages, and generate a dubbed neural voice.</p>
      </header>

      <div className="upload-card glass-panel" style={{ padding: '2.5rem' }}>
        
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          
          <div style={{ flex: '1 1 350px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className={`upload-zone ${audioFile ? 'has-file' : ''}`}>
              <input 
                type="file" 
                accept="audio/*" 
                id="audio-upload" 
                style={{ display: 'none' }} 
                onChange={(e) => setAudioFile(e.target.files?.[0] || null)} 
              />
              <label htmlFor="audio-upload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', width: '100%' }}>
                <UploadCloud size={48} className="upload-icon" />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                  <span className="upload-title">{audioFile ? audioFile.name : 'Drag & drop audio or click to browse'}</span>
                  {!audioFile && <span className="upload-hint">Supports MP3, WAV, M4A up to 25MB</span>}
                </div>
              </label>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="text-input"
                style={{ minHeight: 'auto', padding: '0.85rem 1rem', cursor: 'pointer' }}
              >
                <option value="en">English (US)</option>
                <option value="es">Spanish (ES)</option>
                <option value="fr">French (FR)</option>
                <option value="de">German (DE)</option>
                <option value="it">Italian (IT)</option>
                <option value="ta">Tamil (IN)</option>
                <option value="te">Telugu (IN)</option>
                <option value="hi">Hindi (IN)</option>
              </select>

              <button 
                onClick={handleGenerate} 
                disabled={loading || !audioFile}
                className="submit-btn shimmer-btn"
              >
                {loading ? (
                  <>
                    <Loader2 className="spinner" size={20} />
                    Processing Audio...
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    Translate Audio
                  </>
                )}
              </button>
            </div>
          </div>

          {(originalText || audioUrl) && (
            <div style={{ flex: '1 1 450px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="animate-fade-in">
              
              {audioUrl && (
                <div className="corrected-output-section" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)' }}>
                  <h3><FileAudio size={20} color="#a855f7" /> Dubbed Audio</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
                    <audio src={audioUrl} controls style={{ flex: 1, height: '40px' }} />
                    <a 
                      href={audioUrl} 
                      download={`translated_${language}.mp3`} 
                      className="download-btn"
                      style={{ padding: '0.6rem 1rem' }}
                    >
                      <Download size={18} />
                    </a>
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {originalText && (
                  <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <h3 style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Original</h3>
                    <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--text-primary)' }}>{originalText}</p>
                  </div>
                )}

                {translatedText && (
                  <div style={{ padding: '1.5rem', background: 'rgba(99,102,241,0.05)', borderRadius: '12px', border: '1px solid rgba(99,102,241,0.2)' }}>
                    <h3 style={{ fontSize: '0.85rem', color: '#a5b4fc', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Translated</h3>
                    <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--text-primary)' }}>{translatedText}</p>
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AudioTranslator;
