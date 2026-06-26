import React, { useState } from 'react';
import { Activity, UploadCloud, Loader2, Sparkles } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const EmotionAnalyzer: React.FC = () => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [primaryEmotion, setPrimaryEmotion] = useState('');
  const [emotions, setEmotions] = useState<Record<string, number>>({});

  const handleAnalyze = async () => {
    if (!audioFile) return;
    setLoading(true);
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
        setEmotions(response.data.emotions);
        toast.success("Emotion analysis complete!");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to analyze emotion.');
    } finally {
      setLoading(false);
    }
  };

  const getEmotionEmoji = (emo: string) => {
    const e = emo.toLowerCase();
    if (e.includes('angry')) return '😠';
    if (e.includes('calm')) return '😌';
    if (e.includes('disgust')) return '🤢';
    if (e.includes('fear')) return '😨';
    if (e.includes('happy')) return '😊';
    if (e.includes('neutral')) return '😐';
    if (e.includes('sad')) return '😢';
    if (e.includes('surprise')) return '😲';
    return '🤔';
  };

  const getEmotionColor = (emo: string) => {
    const e = emo.toLowerCase();
    if (e.includes('angry') || e.includes('disgust')) return '#ef4444'; // red
    if (e.includes('fear') || e.includes('sad')) return '#8b5cf6'; // purple
    if (e.includes('happy') || e.includes('surprise')) return '#10b981'; // green
    if (e.includes('calm') || e.includes('neutral')) return '#3b82f6'; // blue
    return '#6366f1';
  };

  return (
    <div className="app-container">
      <header className="header animate-fade-in">
        <div className="hero-badge"><Activity size={14} /> Tonal Analysis</div>
        <h1>Emotion <span className="gradient-text">Analyzer</span></h1>
        <p>Detect the underlying emotional sentiment and tone from any spoken audio.</p>
      </header>

      <div className="upload-card glass-panel main-panel">
        
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
                onClick={handleAnalyze} 
                disabled={loading || !audioFile}
                className="submit-btn shimmer-btn"
              >
                {loading ? (
                  <>
                    <Loader2 className="spinner" size={20} />
                    Analyzing Tonal Pitch...
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    Analyze Emotion
                  </>
                )}
              </button>
            </div>
          </div>

          {(primaryEmotion || Object.keys(emotions).length > 0) && (
            <div style={{ flex: '1 1 min(100%, 450px)', display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: 0 }} className="animate-fade-in">
              
              <div style={{ padding: '2rem', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', textAlign: 'center', border: `1px solid ${getEmotionColor(primaryEmotion)}40` }}>
                <div style={{ fontSize: '4.5rem', marginBottom: '0.75rem', animation: 'fadeInUp 0.6s ease' }}>{getEmotionEmoji(primaryEmotion)}</div>
                <h3 style={{ fontSize: '1.8rem', color: getEmotionColor(primaryEmotion), textTransform: 'capitalize', margin: 0, fontFamily: 'Outfit' }}>
                  {primaryEmotion}
                </h3>
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '0.95rem' }}>Primary Tone Detected</p>
              </div>

              {Object.keys(emotions).length > 0 && (
                <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <h3 style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', marginBottom: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Emotion Breakdown</h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {Object.entries(emotions).sort((a, b) => b[1] - a[1]).map(([emo, prob]) => (
                      <div key={emo} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '80px', textTransform: 'capitalize', fontSize: '0.9rem', fontWeight: 500 }}>{emo}</div>
                        <div style={{ flex: 1, height: '10px', background: 'rgba(255,255,255,0.06)', borderRadius: '999px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${prob}%`, background: getEmotionColor(emo), transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)', borderRadius: '999px' }}></div>
                        </div>
                        <div style={{ width: '45px', textAlign: 'right', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{prob}%</div>
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
