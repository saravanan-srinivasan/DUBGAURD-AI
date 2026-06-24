import React, { useState } from 'react';
import { Mic, Play, Download, Loader2 } from 'lucide-react';
import axios from 'axios';

const VoiceStudio: React.FC = () => {
  const [text, setText] = useState('');
  const [language, setLanguage] = useState('en');
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError('');
    setAudioUrl(null);

    try {
      // Assuming backend is running on same host in prod or localhost:8000 in dev
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await axios.post(`${apiUrl}/api/v1/voice-studio`, {
        text,
        language
      });
      
      if (response.data && response.data.audio_base64) {
        setAudioUrl(`data:audio/mp3;base64,${response.data.audio_base64}`);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to generate voice. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header className="header animate-fade-in">
        <div className="hero-badge"><Mic size={14} /> Text-to-Speech</div>
        <h1>AI Voice <span className="gradient-text">Studio</span></h1>
        <p>Type any text and instantly generate high-quality neural speech.</p>
      </header>

      <div className="upload-card glass-panel" style={{ padding: '2rem' }}>
        {error && <div className="error-message" style={{ color: 'var(--error)', marginBottom: '1rem', background: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: '8px' }}>{error}</div>}
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <textarea 
            placeholder="Enter text to synthesize..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            style={{ width: '100%', height: '150px', padding: '1rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', resize: 'vertical' }}
          />
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              style={{ padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', flex: 1 }}
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
              disabled={loading || !text.trim()}
              className="shimmer-btn"
              style={{ padding: '0.8rem 2rem', border: 'none', borderRadius: '8px', background: 'var(--accent)', color: 'white', fontWeight: 600, cursor: loading || !text.trim() ? 'not-allowed' : 'pointer', opacity: loading || !text.trim() ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              {loading ? <Loader2 className="spinner" size={20} /> : <Play size={20} />}
              {loading ? 'Generating...' : 'Generate Voice'}
            </button>
          </div>
        </div>

        {audioUrl && (
          <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <audio src={audioUrl} controls style={{ flex: 1, height: '40px' }} />
            <a 
              href={audioUrl} 
              download={`voice_studio_${language}.mp3`}
              style={{ padding: '0.6rem 1rem', background: 'rgba(255,255,255,0.1)', color: 'white', textDecoration: 'none', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}
            >
              <Download size={16} /> Download
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceStudio;
