import React, { useState } from 'react';
import { FileText, UploadCloud, Loader2, Sparkles, BookOpen } from 'lucide-react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

const PodcastSummarizer: React.FC = () => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [summary, setSummary] = useState('');
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!audioFile) return;
    setLoading(true);
    setError('');
    setTranscript('');
    setSummary('');

    try {
      const formData = new FormData();
      formData.append('audio', audioFile);

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await axios.post(`${apiUrl}/api/v1/summarizer`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (response.data) {
        setTranscript(response.data.transcript);
        setSummary(response.data.summary);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to summarize audio.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header className="header animate-fade-in">
        <div className="hero-badge"><FileText size={14} /> AI Summarization</div>
        <h1>Podcast <span className="gradient-text">Summarizer</span></h1>
        <p>Upload a long audio file and let our AI extract key insights and bullet points.</p>
      </header>

      <div className="upload-card glass-panel" style={{ padding: '2.5rem' }}>
        {error && (
          <div className="error-banner" style={{ marginBottom: '1.5rem' }}>
            <span>{error}</span>
          </div>
        )}
        
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
                    Generate Summary
                  </>
                )}
              </button>
            </div>
          </div>

          {(transcript || summary) && (
            <div style={{ flex: '1 1 450px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="animate-fade-in">
              
              {summary && (
                <div className="corrected-output-section" style={{ padding: '2rem', background: 'rgba(99,102,241,0.04)', borderRadius: '16px' }}>
                  <h3 style={{ marginBottom: '1.25rem', color: '#a5b4fc' }}>
                    <Sparkles size={20} color="#6366f1" /> Executive Summary
                  </h3>
                  <div className="markdown-content" style={{ fontSize: '0.95rem', lineHeight: '1.7', color: 'var(--text-primary)' }}>
                    <ReactMarkdown>{summary}</ReactMarkdown>
                  </div>
                </div>
              )}

              {transcript && (
                <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <h3 style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <BookOpen size={16} /> Full Transcript
                  </h3>
                  <div style={{ maxHeight: '350px', overflowY: 'auto', paddingRight: '1rem', fontSize: '0.95rem', lineHeight: '1.6', color: 'rgba(255,255,255,0.8)' }}>
                    {transcript}
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

export default PodcastSummarizer;
