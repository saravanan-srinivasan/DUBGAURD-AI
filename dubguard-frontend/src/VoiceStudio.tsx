import React, { useState } from 'react';
import { Mic, Download, Loader2, Sparkles } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { collection, addDoc } from 'firebase/firestore';
import { db } from './firebase';
import { useAuth } from './AuthContext';

const VoiceStudio: React.FC = () => {
  const { currentUser } = useAuth();
  const [text, setText] = useState('');
  const [language, setLanguage] = useState('en');
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setAudioUrl(null);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await axios.post(`${apiUrl}/api/v1/voice-studio`, {
        text,
        language
      });
      
      if (response.data && response.data.audio_base64) {
        const audioSrc = `data:audio/mp3;base64,${response.data.audio_base64}`;
        setAudioUrl(audioSrc);
        toast.success("Voice generated successfully!");

        if (currentUser) {
          try {
            await addDoc(collection(db, 'generations'), {
              userId: currentUser.uid,
              type: 'voice',
              timestamp: Date.now(),
              data: {
                text: text,
                language: language,
                audioUrl: audioSrc
              }
            });
          } catch (e) {
            console.error("Failed to save to history", e);
          }
        }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to generate voice.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header className="header animate-fade-in">
        <div className="hero-badge"><Mic size={14} /> Text-to-Speech</div>
        <h1>AI Voice <span className="gradient-text">Studio</span></h1>
        <p>Type any text and instantly generate high-quality neural speech in multiple languages.</p>
      </header>

      <div className="upload-card glass-panel" style={{ padding: '2.5rem', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <textarea 
            placeholder="Enter text to synthesize into speech..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="text-input"
            style={{ minHeight: '180px', fontSize: '1rem', lineHeight: '1.6' }}
          />
          
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
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
            </div>

            <button 
              onClick={handleGenerate} 
              disabled={loading || !text.trim()}
              className="submit-btn shimmer-btn"
              style={{ width: 'auto', minWidth: '200px' }}
            >
              {loading ? (
                <>
                  <Loader2 className="spinner" size={20} />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  Generate Voice
                </>
              )}
            </button>
          </div>
        </div>

        {audioUrl && (
          <div className="corrected-output-section animate-fade-in" style={{ marginTop: '2.5rem' }}>
            <h3><Mic size={20} color="#a855f7" /> Generated Audio</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', background: 'rgba(0,0,0,0.2)', padding: '1rem 1.5rem', borderRadius: '12px', flexWrap: 'wrap' }}>
              <audio src={audioUrl} controls style={{ flex: 1, minWidth: '250px', height: '40px' }} />
              <a 
                href={audioUrl} 
                download={`voice_studio_${language}.mp3`}
                className="download-btn"
              >
                <Download size={18} /> Download Audio
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceStudio;
