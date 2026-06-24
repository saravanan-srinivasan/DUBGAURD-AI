import React, { useState, useRef } from 'react';
import { Music, UploadCloud, Loader2, Play, Download } from 'lucide-react';
import axios from 'axios';

const VocalIsolator: React.FC = () => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [vocalsUrl, setVocalsUrl] = useState('');
  const [backgroundUrl, setBackgroundUrl] = useState('');
  const [error, setError] = useState('');

  const vocalsRef = useRef<HTMLAudioElement>(null);
  const backgroundRef = useRef<HTMLAudioElement>(null);

  const handleIsolate = async () => {
    if (!audioFile) return;
    setLoading(true);
    setError('');
    setVocalsUrl('');
    setBackgroundUrl('');

    try {
      const formData = new FormData();
      formData.append('audio', audioFile);

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await axios.post(`${apiUrl}/api/v1/isolator`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (response.data) {
        setVocalsUrl(`data:audio/wav;base64,${response.data.vocals_base64}`);
        setBackgroundUrl(`data:audio/wav;base64,${response.data.background_base64}`);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to isolate audio.');
    } finally {
      setLoading(false);
    }
  };

  const playTogether = () => {
    if (vocalsRef.current && backgroundRef.current) {
      vocalsRef.current.currentTime = 0;
      backgroundRef.current.currentTime = 0;
      vocalsRef.current.play();
      backgroundRef.current.play();
    }
  };

  return (
    <div className="app-container">
      <header className="header animate-fade-in">
        <div className="hero-badge"><Music size={14} /> Source Separation</div>
        <h1>Vocal <span className="gradient-text">Isolator</span></h1>
        <p>Extract pure vocals and background instrumentals from any audio track using DSP.</p>
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
              <button 
                onClick={handleIsolate} 
                disabled={loading || !audioFile}
                className="shimmer-btn"
                style={{ padding: '1rem', border: 'none', borderRadius: '8px', background: 'var(--accent)', color: 'white', fontWeight: 600, cursor: loading || !audioFile ? 'not-allowed' : 'pointer', opacity: loading || !audioFile ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                {loading ? <Loader2 className="spinner" size={20} /> : <Music size={20} />}
                {loading ? 'Splitting Tracks...' : 'Isolate Vocals'}
              </button>
            </div>
          </div>

          {(vocalsUrl || backgroundUrl) && (
            <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {vocalsUrl && (
                <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', borderLeft: '4px solid #8b5cf6' }}>
                  <h3 style={{ fontSize: '1.1rem', color: '#8b5cf6', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>🎤 Isolated Vocals</h3>
                  <audio ref={vocalsRef} controls src={vocalsUrl} style={{ width: '100%' }} />
                  <a href={vocalsUrl} download="vocals.wav" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}><Download size={16} /> Download Vocals</a>
                </div>
              )}

              {backgroundUrl && (
                <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', borderLeft: '4px solid #10b981' }}>
                  <h3 style={{ fontSize: '1.1rem', color: '#10b981', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>🥁 Instrumental / Beats</h3>
                  <audio ref={backgroundRef} controls src={backgroundUrl} style={{ width: '100%' }} />
                  <a href={backgroundUrl} download="instrumental.wav" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}><Download size={16} /> Download Instrumental</a>
                </div>
              )}

              <button onClick={playTogether} style={{ padding: '0.75rem', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', background: 'transparent', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <Play size={18} /> Play Together
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VocalIsolator;
