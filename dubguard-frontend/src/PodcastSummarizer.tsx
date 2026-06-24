import React, { useState } from 'react';
import { FileText, UploadCloud, Loader2 } from 'lucide-react';
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
        <p>Upload a long audio file and extract key insights and bullet points.</p>
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
                onClick={handleGenerate} 
                disabled={loading || !audioFile}
                className="shimmer-btn"
                style={{ padding: '1rem', border: 'none', borderRadius: '8px', background: 'var(--accent)', color: 'white', fontWeight: 600, cursor: loading || !audioFile ? 'not-allowed' : 'pointer', opacity: loading || !audioFile ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                {loading ? <Loader2 className="spinner" size={20} /> : <FileText size={20} />}
                {loading ? 'Transcribing & Summarizing...' : 'Generate Summary'}
              </button>
            </div>
          </div>

          {(transcript || summary) && (
            <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              {summary && (
                <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', borderTop: '3px solid var(--accent)' }}>
                  <h3 style={{ fontSize: '1rem', color: 'var(--accent)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FileText size={18} /> Executive Summary</h3>
                  <div className="markdown-content" style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
                    <ReactMarkdown>{summary}</ReactMarkdown>
                  </div>
                </div>
              )}

              {transcript && (
                <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                  <h3 style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', marginBottom: '0.5rem' }}>Full Transcript</h3>
                  <div style={{ maxHeight: '300px', overflowY: 'auto', paddingRight: '1rem', fontSize: '0.9rem', lineHeight: '1.6' }}>
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
