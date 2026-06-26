import React, { useState, useRef } from 'react';
import { Music, UploadCloud, Loader2, Play, Download, Sparkles, Mic, Radio } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const VocalIsolator: React.FC = () => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [vocalsUrl, setVocalsUrl] = useState('');
  const [backgroundUrl, setBackgroundUrl] = useState('');

  const vocalsRef = useRef<HTMLAudioElement>(null);
  const backgroundRef = useRef<HTMLAudioElement>(null);

  const handleIsolate = async () => {
    if (!audioFile) return;
    setLoading(true);
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
        toast.success("Tracks isolated successfully!");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to isolate audio.');
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
        <p>Extract pure vocals and background instrumentals from any audio track using advanced DSP algorithms.</p>
      </header>

      <div className="upload-card glass-panel" style={{ padding: '2.5rem' }}>
        
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          
          <div style={{ flex: '1 1 min(100%, 350px)', display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: 0 }}>
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
              <button 
                onClick={handleIsolate} 
                disabled={loading || !audioFile}
                className="submit-btn shimmer-btn"
              >
                {loading ? (
                  <>
                    <Loader2 className="spinner" size={20} />
                    Splitting Audio Tracks...
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    Isolate Vocals
                  </>
                )}
              </button>
            </div>
          </div>

          {(vocalsUrl || backgroundUrl) && (
            <div style={{ flex: '1 1 min(100%, 450px)', display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: 0 }} className="animate-fade-in">
              
              {vocalsUrl && (
                <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', borderLeft: '4px solid #a855f7' }}>
                  <h3 style={{ fontSize: '1.1rem', color: '#a855f7', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 1rem 0' }}>
                    <Mic size={18} /> Isolated Vocals
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <audio ref={vocalsRef} controls src={vocalsUrl} style={{ flex: 1, height: '40px' }} />
                    <a href={vocalsUrl} download="vocals.wav" className="download-btn" style={{ padding: '0.6rem 1rem', background: 'rgba(255,255,255,0.1)', boxShadow: 'none' }}>
                      <Download size={18} />
                    </a>
                  </div>
                </div>
              )}

              {backgroundUrl && (
                <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', borderLeft: '4px solid #10b981' }}>
                  <h3 style={{ fontSize: '1.1rem', color: '#10b981', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 1rem 0' }}>
                    <Radio size={18} /> Instrumental / Beats
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <audio ref={backgroundRef} controls src={backgroundUrl} style={{ flex: 1, height: '40px' }} />
                    <a href={backgroundUrl} download="instrumental.wav" className="download-btn" style={{ padding: '0.6rem 1rem', background: 'rgba(255,255,255,0.1)', boxShadow: 'none' }}>
                      <Download size={18} />
                    </a>
                  </div>
                </div>
              )}

              <button 
                onClick={playTogether} 
                style={{ 
                  padding: '1rem', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', 
                  background: 'rgba(255,255,255,0.05)', color: 'white', display: 'flex', 
                  alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer',
                  fontWeight: 600, transition: 'all 0.2s', marginTop: '0.5rem'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              >
                <Play size={18} /> Play Both Tracks Together
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VocalIsolator;
