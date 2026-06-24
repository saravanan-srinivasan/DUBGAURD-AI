import React, { useState } from 'react';
import { Globe, UploadCloud, Play, Loader2, Download, FileAudio } from 'lucide-react';
import axios from 'axios';

const AudioTranslator: React.FC = () => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [language, setLanguage] = useState('en');
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [originalText, setOriginalText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!audioFile) return;
    setLoading(true);
    setError('');
    setAudioUrl(null);
    setOriginalText('');
    setTranslatedText('');

    try {
      const formData = new FormData();
      formData.append('audio', audioFile);
      formData.append('target_lang', language);

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await axios.post(`${apiUrl}/api/translator`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (response.data) {
        setOriginalText(response.data.original_transcript);
        setTranslatedText(response.data.translated_transcript);
        if (response.data.audio_base64) {
          setAudioUrl(`data:audio/mp3;base64,${response.data.audio_base64}`);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to translate audio.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header className="header animate-fade-in">
        <div className="hero-badge"><Globe size={14} /> One-Click Translation</div>
        <h1>Audio <span className="gradient-text">Translator</span></h1>
        <p>Upload an audio file in any language and instantly translate it to English.</p>
      </header>

      <div className="upload-card glass-panel" style={{ padding: '2rem' }}>
        {error && <div className="error-message" style={{ color: 'var(--error)', marginBottom: '1rem', background: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: '8px' }}>{error}</div>}
        
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          
          <div style={{ flex: '1 1 300px' }}>
            <div className="upload-box" style={{ padding: '2rem', textAlign: 'center', border: '2px dashed rgba(255,255,255,0.2)', borderRadius: '12px', cursor: 'pointer' }}>
              <input type="file" accept="audio/*" id="audio-upload" style={{ display: 'none' }} onChange={(e) => setAudioFile(e.target.files?.[0] || null)} />
              <label htmlFor="audio-upload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                <UploadCloud size={40} style={{ color: 'var(--accent)' }} />
                <span>{audioFile ? audioFile.name : 'Click to select audio file'}</span>
              </label>
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <label style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>Target Language:</label>
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                style={{ padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="it">Italian</option>
                <option value="ta">Tamil</option>
                <option value="te">Telugu</option>
                <option value="hi">Hindi</option>
              </select>

              <button 
                onClick={handleGenerate} 
                disabled={loading || !audioFile}
                className="shimmer-btn"
                style={{ padding: '1rem', border: 'none', borderRadius: '8px', background: 'var(--accent)', color: 'white', fontWeight: 600, cursor: loading || !audioFile ? 'not-allowed' : 'pointer', opacity: loading || !audioFile ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                {loading ? <Loader2 className="spinner" size={20} /> : <Globe size={20} />}
                {loading ? 'Translating & Synthesizing...' : 'Translate Audio'}
              </button>
            </div>
          </div>

          {(originalText || audioUrl) && (
            <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              {audioUrl && (
                <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <FileAudio size={24} style={{ color: 'var(--accent)' }} />
                  <audio src={audioUrl} controls style={{ flex: 1, height: '40px' }} />
                  <a href={audioUrl} download={`translated_${language}.mp3`} style={{ color: 'white' }}>
                    <Download size={20} />
                  </a>
                </div>
              )}

              {originalText && (
                <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                  <h3 style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', marginBottom: '0.5rem' }}>Original Transcript</h3>
                  <p style={{ fontSize: '0.95rem', lineHeight: '1.5' }}>{originalText}</p>
                </div>
              )}

              {translatedText && (
                <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', borderLeft: '3px solid var(--accent)' }}>
                  <h3 style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', marginBottom: '0.5rem' }}>Translated Transcript</h3>
                  <p style={{ fontSize: '0.95rem', lineHeight: '1.5' }}>{translatedText}</p>
                </div>
              )}

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AudioTranslator;
