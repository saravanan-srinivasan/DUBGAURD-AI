import React, { useState } from 'react';
import { Activity, UploadCloud, Loader2 } from 'lucide-react';
import axios from 'axios';

const EmotionAnalyzer: React.FC = () => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [primaryEmotion, setPrimaryEmotion] = useState('');
  const [emotions, setEmotions] = useState<Record<string, number>>({});
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!audioFile) return;
    setLoading(true);
    setError('');
    setPrimaryEmotion('');
    setEmotions({});

    try {
      const formData = new FormData();
      formData.append('audio', audioFile);

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await axios.post(`${apiUrl}/api/v1/emotion`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (response.data) {
        setPrimaryEmotion(response.data.primary_emotion);
        setEmotions(response.data.emotions || {});
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to analyze audio.');
    } finally {
      setLoading(false);
    }
  };

  const getEmotionColor = (emotion: string) => {
    switch(emotion.toLowerCase()) {
      case 'happy': return '#10b981';
      case 'sad': return '#3b82f6';
      case 'angry': return '#ef4444';
      case 'fearful': return '#f59e0b';
      case 'disgust': return '#8b5cf6';
      case 'surprised': return '#ec4899';
      case 'calm': return '#06b6d4';
      default: return '#6366f1'; // Neutral or others
    }
  };

  const getEmotionEmoji = (emotion: string) => {
    switch(emotion.toLowerCase()) {
      case 'happy': return '😊';
      case 'sad': return '😢';
      case 'angry': return '😠';
      case 'fearful': return '😨';
      case 'disgust': return '🤢';
      case 'surprised': return '😲';
      case 'calm': return '😌';
      case 'neutral': return '😐';
      default: return '🤔';
    }
  };

  return (
    <div className="app-container">
      <header className="header animate-fade-in">
        <div className="hero-badge"><Activity size={14} /> Acoustic Analysis</div>
        <h1>Emotion <span className="gradient-text">Analyzer</span></h1>
        <p>Upload a voice recording to detect its primary emotional tone using AI.</p>
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
                onClick={handleAnalyze} 
                disabled={loading || !audioFile}
                className="shimmer-btn"
                style={{ padding: '1rem', border: 'none', borderRadius: '8px', background: 'var(--accent)', color: 'white', fontWeight: 600, cursor: loading || !audioFile ? 'not-allowed' : 'pointer', opacity: loading || !audioFile ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                {loading ? <Loader2 className="spinner" size={20} /> : <Activity size={20} />}
                {loading ? 'Analyzing Tones...' : 'Analyze Emotion'}
              </button>
            </div>
          </div>

          {(primaryEmotion) && (
            <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              <div style={{ padding: '2rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', textAlign: 'center', border: `2px solid ${getEmotionColor(primaryEmotion)}` }}>
                <div style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>{getEmotionEmoji(primaryEmotion)}</div>
                <h3 style={{ fontSize: '1.5rem', color: getEmotionColor(primaryEmotion), textTransform: 'capitalize' }}>
                  {primaryEmotion} Tone Detected
                </h3>
              </div>

              {Object.keys(emotions).length > 0 && (
                <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                  <h3 style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', marginBottom: '1rem' }}>Emotion Breakdown</h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {Object.entries(emotions).sort((a, b) => b[1] - a[1]).map(([emo, prob]) => (
                      <div key={emo} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '80px', textTransform: 'capitalize', fontSize: '0.85rem' }}>{emo}</div>
                        <div style={{ flex: 1, height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${prob}%`, background: getEmotionColor(emo), transition: 'width 1s ease-in-out' }}></div>
                        </div>
                        <div style={{ width: '40px', textAlign: 'right', fontSize: '0.85rem', fontWeight: 600 }}>{prob}%</div>
                      </div>
                    ))}
                  </div>

                </div>
              )}

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmotionAnalyzer;
