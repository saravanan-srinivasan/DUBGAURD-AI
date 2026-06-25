import React, { useState, useRef } from 'react';
import { UploadCloud, Play, Loader2, Sparkles, Download, Volume2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const VoiceClone: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState('');
  const [isCloning, setIsCloning] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error("File size must be under 10MB");
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleClone = async () => {
    if (!file) {
      toast.error('Please upload a reference audio file first.');
      return;
    }
    if (!text.trim()) {
      toast.error('Please enter some text to synthesize.');
      return;
    }

    setIsCloning(true);
    setAudioUrl(null);
    const toastId = toast.loading('Initializing Voice Clone Model (This can take 30-60s)...');

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://shravan2020-dubguard-backend.hf.space';
      const formData = new FormData();
      formData.append('file', file);
      formData.append('text', text);
      formData.append('language', 'en'); 

      const response = await axios.post(`${apiUrl}/api/v1/voice-clone`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.audio_base64) {
        const audioSrc = `data:audio/wav;base64,${response.data.audio_base64}`;
        setAudioUrl(audioSrc);
        toast.success('Voice Cloned Successfully!', { id: toastId });
      } else {
        throw new Error('No audio returned');
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.detail || 'Failed to clone voice', { id: toastId });
    } finally {
      setIsCloning(false);
    }
  };

  return (
    <div className="app-container">
      <header className="header animate-fade-in">
        <div className="hero-badge"><Volume2 size={14} /> Voice Cloning</div>
        <h1>Custom Voice <span className="gradient-text">Cloning</span></h1>
        <p>Upload a 5-10 second clip of anyone's voice and generate new speech.</p>
      </header>

      <div className="upload-card glass-panel" style={{ padding: '2.5rem', maxWidth: '800px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        <div>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'white', fontSize: '1.2rem' }}>
            <UploadCloud size={20} style={{ color: 'var(--accent)' }} />
            1. Upload Reference Audio
          </h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}>Provide a clean, noise-free audio file (.wav or .mp3) under 10MB.</p>
          
          <div 
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            style={{ border: '2px dashed rgba(255,255,255,0.2)', borderRadius: '12px', padding: '3rem 2rem', textAlign: 'center', cursor: 'pointer', transition: 'all 0.3s', background: 'rgba(255,255,255,0.02)' }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="audio/*" 
              style={{ display: 'none' }} 
            />
            {file ? (
              <div style={{ color: '#4ade80', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <Play size={20} />
                {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </div>
            ) : (
              <div style={{ color: 'var(--text-secondary)' }}>
                <UploadCloud size={48} style={{ margin: '0 auto 1rem auto', opacity: 0.5 }} />
                <p>Click or drag and drop to upload audio</p>
              </div>
            )}
          </div>
        </div>

        <div>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'white', fontSize: '1.2rem' }}>
            <Sparkles size={20} style={{ color: 'var(--accent)' }} />
            2. Enter Text to Synthesize
          </h3>
          <textarea
            className="text-input"
            rows={5}
            placeholder="Type what you want the cloned voice to say..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            style={{ width: '100%', resize: 'vertical' }}
          />
        </div>

        <button 
          className="generate-btn"
          onClick={handleClone}
          disabled={isCloning}
          style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem', opacity: isCloning ? 0.7 : 1, cursor: isCloning ? 'not-allowed' : 'pointer' }}
        >
          {isCloning ? (
            <>
              <Loader2 size={20} className="spin" />
              Cloning Voice...
            </>
          ) : (
            <>
              <Volume2 size={20} />
              Generate Voice Clone
            </>
          )}
        </button>

        {audioUrl && (
          <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'center', animation: 'fadeIn 0.5s ease-out' }}>
            <h3 style={{ color: 'white', fontSize: '1.5rem', marginBottom: '1.5rem' }}>Clone Complete!</h3>
            
            <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '12px', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '1.5rem' }}>
              <audio controls src={audioUrl} style={{ width: '100%' }}>
                Your browser does not support the audio element.
              </audio>
            </div>
            
            <a 
              href={audioUrl} 
              download={`voice_clone_${new Date().getTime()}.wav`}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.1)', color: 'white', padding: '0.8rem 1.5rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, transition: 'all 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            >
              <Download size={20} />
              Download Audio
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceClone;
