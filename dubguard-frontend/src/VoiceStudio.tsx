import React, { useState } from 'react';
import { Mic, Download, Loader2, Sparkles, Plus, Trash2, Users, Sliders } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { collection, addDoc } from 'firebase/firestore';
import { db } from './firebase';
import { useAuth } from './AuthContext';

interface SpeakerBlock {
  id: string;
  text: string;
  language: string;
  pitch: string;
  rate: string;
}

const LanguageSelect = ({ value, onChange }: { value: string, onChange: (val: string) => void }) => (
  <select 
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="text-input"
    style={{ minHeight: 'auto', padding: '0.85rem 1rem', cursor: 'pointer', maxWidth: '200px' }}
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
);

const ToneControls = ({ p, r, onPChange, onRChange }: { p: string, r: string, onPChange: (val: string) => void, onRChange: (val: string) => void }) => (
  <div style={{ display: 'flex', gap: '2rem', marginTop: '0.5rem', background: 'rgba(255,255,255,0.02)', padding: '1rem 1.5rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', flexWrap: 'wrap' }}>
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '150px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Sliders size={14} /> Pitch (Tone)</span>
        <span>{Number(p) > 0 ? '+' : ''}{p}Hz</span>
      </div>
      <input type="range" min="-50" max="50" value={p} onChange={(e) => onPChange(e.target.value)} style={{ width: '100%', accentColor: '#a855f7' }} />
    </div>
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '150px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Sliders size={14} /> Speed (Rate)</span>
        <span>{Number(r) > 0 ? '+' : ''}{r}%</span>
      </div>
      <input type="range" min="-50" max="50" value={r} onChange={(e) => onRChange(e.target.value)} style={{ width: '100%', accentColor: '#ec4899' }} />
    </div>
  </div>
);

const VoiceStudio: React.FC = () => {
  const { currentUser } = useAuth();
  const [isMultiSpeaker, setIsMultiSpeaker] = useState(false);
  
  // Single Speaker State
  const [text, setText] = useState('');
  const [language, setLanguage] = useState('en');
  const [pitch, setPitch] = useState('0');
  const [rate, setRate] = useState('0');
  
  // Multi Speaker State
  const [blocks, setBlocks] = useState<SpeakerBlock[]>([
    { id: '1', text: '', language: 'en', pitch: '0', rate: '0' },
    { id: '2', text: '', language: 'en', pitch: '0', rate: '0' }
  ]);

  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const formatEdgeValue = (val: string, unit: string) => {
    const num = Number(val);
    return `${num >= 0 ? '+' : ''}${num}${unit}`;
  };

  const handleGenerateSingle = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setAudioUrl(null);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await axios.post(`${apiUrl}/api/v1/voice-studio`, {
        text,
        language,
        pitch: formatEdgeValue(pitch, 'Hz'),
        rate: formatEdgeValue(rate, '%')
      });
      
      if (response.data && response.data.audio_base64) {
        const audioSrc = `data:audio/mp3;base64,${response.data.audio_base64}`;
        setAudioUrl(audioSrc);
        toast.success("Voice generated successfully!");

        if (currentUser) {
          addDoc(collection(db, 'generations'), {
            userId: currentUser.uid,
            type: 'voice',
            timestamp: Date.now(),
            data: { text, language, pitch, rate, audioUrl: audioSrc }
          }).catch((e) => console.error("Failed to save to history", e));
        }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to generate voice.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateMulti = async () => {
    const validBlocks = blocks.filter(b => b.text.trim().length > 0);
    if (validBlocks.length === 0) {
      toast.error("Please add some text to at least one dialogue block.");
      return;
    }
    setLoading(true);
    setAudioUrl(null);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await axios.post(`${apiUrl}/api/v1/voice-studio-multi`, {
        blocks: validBlocks.map(b => ({ 
          text: b.text, 
          language: b.language,
          pitch: formatEdgeValue(b.pitch, 'Hz'),
          rate: formatEdgeValue(b.rate, '%')
        }))
      });
      
      if (response.data && response.data.audio_base64) {
        const audioSrc = `data:audio/mp3;base64,${response.data.audio_base64}`;
        setAudioUrl(audioSrc);
        toast.success("Podcast generated successfully!");

        if (currentUser) {
          addDoc(collection(db, 'generations'), {
            userId: currentUser.uid,
            type: 'voice-multi',
            timestamp: Date.now(),
            data: { blocks: validBlocks, audioUrl: audioSrc }
          }).catch((e) => console.error("Failed to save to history", e));
        }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to generate podcast.');
    } finally {
      setLoading(false);
    }
  };

  const addBlock = () => {
    setBlocks([...blocks, { id: Date.now().toString(), text: '', language: 'en', pitch: '0', rate: '0' }]);
  };

  const removeBlock = (id: string) => {
    if (blocks.length <= 1) return;
    setBlocks(blocks.filter(b => b.id !== id));
  };

  const updateBlock = (id: string, field: 'text' | 'language' | 'pitch' | 'rate', value: string) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, [field]: value } : b));
  };



  return (
    <div className="app-container">
      <header className="header animate-fade-in">
        <div className="hero-badge"><Mic size={14} /> Text-to-Speech</div>
        <h1>AI Voice <span className="gradient-text">Studio</span></h1>
        <p>Synthesize high-quality neural speech or generate full multi-speaker podcast conversations.</p>
      </header>

      <div className="upload-card glass-panel" style={{ padding: '2.5rem', width: '100%' }}>
        
        {/* Toggle Mode */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', background: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: '12px' }}>
          <button 
            onClick={() => setIsMultiSpeaker(false)}
            style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s', background: !isMultiSpeaker ? 'var(--accent)' : 'transparent', color: !isMultiSpeaker ? 'white' : 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            <Mic size={18} /> Single Speaker
          </button>
          <button 
            onClick={() => setIsMultiSpeaker(true)}
            style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s', background: isMultiSpeaker ? 'var(--accent)' : 'transparent', color: isMultiSpeaker ? 'white' : 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            <Users size={18} /> Multi-Speaker Podcast
          </button>
        </div>

        {!isMultiSpeaker ? (
          /* Single Speaker UI - 2 column grid */
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem', animation: 'fadeIn 0.3s ease-out', alignItems: 'start' }}>
            {/* Left: Text input */}
            <textarea 
              placeholder="Enter text to synthesize into speech..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="text-input"
              style={{ minHeight: '260px', fontSize: '1rem', lineHeight: '1.6', height: '100%', boxSizing: 'border-box' }}
            />
            
            {/* Right: Controls */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <ToneControls p={pitch} r={rate} onPChange={setPitch} onRChange={setRate} />
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <LanguageSelect value={language} onChange={setLanguage} />
                <button 
                  onClick={handleGenerateSingle} 
                  disabled={loading || !text.trim()}
                  className="submit-btn shimmer-btn"
                  style={{ width: '100%' }}
                >
                  {loading ? <><Loader2 className="spinner" size={20} /> Generating...</> : <><Sparkles size={20} /> Generate Voice</>}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Multi-Speaker UI */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.3s ease-out' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {blocks.map((block, index) => (
                <div key={block.id} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', flexWrap: 'wrap' }}>
                  <div style={{ flexShrink: 0, padding: '0.85rem 0', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>#{index + 1}</div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                      <LanguageSelect value={block.language} onChange={(val) => updateBlock(block.id, 'language', val)} />
                      <button onClick={() => removeBlock(block.id)} disabled={blocks.length <= 1} style={{ background: 'transparent', border: 'none', color: blocks.length > 1 ? '#ef4444' : 'rgba(255,255,255,0.2)', cursor: blocks.length > 1 ? 'pointer' : 'not-allowed', padding: '0.5rem' }}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <textarea 
                      placeholder={`Speaker ${index + 1} dialogue...`}
                      value={block.text}
                      onChange={(e) => updateBlock(block.id, 'text', e.target.value)}
                      className="text-input"
                      style={{ minHeight: '80px', fontSize: '0.95rem' }}
                    />
                    <ToneControls 
                      p={block.pitch} 
                      r={block.rate} 
                      onPChange={(val) => updateBlock(block.id, 'pitch', val)} 
                      onRChange={(val) => updateBlock(block.id, 'rate', val)} 
                    />
                  </div>
                </div>
              ))}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
              <button onClick={addBlock} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500, transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'} onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}>
                <Plus size={18} /> Add Dialogue Block
              </button>
              
              <button 
                onClick={handleGenerateMulti} 
                disabled={loading}
                className="submit-btn shimmer-btn"
                style={{ width: 'auto', minWidth: '220px' }}
              >
                {loading ? <><Loader2 className="spinner" size={20} /> Generating Podcast...</> : <><Users size={20} /> Generate Podcast</>}
              </button>
            </div>
          </div>
        )}

        {audioUrl && (
          <div className="corrected-output-section animate-fade-in" style={{ marginTop: '2.5rem' }}>
            <h3><Mic size={20} color="#a855f7" /> Generated Audio</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', background: 'rgba(0,0,0,0.2)', padding: '1rem 1.5rem', borderRadius: '12px', flexWrap: 'wrap' }}>
              <audio src={audioUrl} controls style={{ flex: 1, minWidth: '250px', height: '40px' }} />
              <a 
                href={audioUrl} 
                download={`voice_studio_${isMultiSpeaker ? 'podcast' : language}.mp3`}
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
