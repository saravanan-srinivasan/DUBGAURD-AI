import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Upload, FileAudio, FileVideo, CheckCircle2, Wand2, Loader2, AlertTriangle, ShieldCheck } from 'lucide-react';
import './App.css';

// SVG Radial Progress Component
const RadialProgress = ({ score, status }: { score: number, status: string }) => {
  const [offset, setOffset] = useState(377); // 2 * Math.PI * 60
  
  useEffect(() => {
    // Animate the stroke when the component mounts
    setTimeout(() => {
      const progressOffset = 377 - (377 * score) / 100;
      setOffset(progressOffset);
    }, 100);
  }, [score]);

  return (
    <div className="radial-progress-container">
      <svg className="radial-progress-svg" viewBox="0 0 140 140">
        <circle className="radial-progress-bg" cx="70" cy="70" r="60" />
        <circle 
          className={`radial-progress-bar ${status === 'PASS' ? 'pass' : 'fail'}`}
          cx="70" cy="70" r="60" 
          strokeDasharray="377" 
          strokeDashoffset={offset} 
        />
      </svg>
      <div className={`radial-progress-text ${status === 'PASS' ? 'pass' : 'fail'}`}>
        {Math.round(score)}
      </div>
    </div>
  );
};

interface EvaluationResponse {
  overall_score: number;
  status: string;
  issues_detected: string[];
  auto_correct_recommendations: string[];
  detailed_metrics: any;
  corrected_transcript?: string;
  corrected_audio_path?: string;
}

function App() {
  const [originalAudio, setOriginalAudio] = useState<File | null>(null);
  const [dubbedAudio, setDubbedAudio] = useState<File | null>(null);
  const [dubbedVideo, setDubbedVideo] = useState<File | null>(null);
  const [originalTranscript, setOriginalTranscript] = useState('');
  const [translatedTranscript, setTranslatedTranscript] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<EvaluationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!originalAudio || !dubbedAudio) {
      setError('Please provide all required audio files.');
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    const formData = new FormData();
    formData.append('original_audio', originalAudio);
    formData.append('dubbed_audio', dubbedAudio);
    if (dubbedVideo) formData.append('dubbed_video', dubbedVideo);
    formData.append('original_transcript', originalTranscript);
    formData.append('translated_transcript', translatedTranscript);

    try {
      // Dynamically detect if we are on localhost or a local network IP (for mobile testing)
      const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:8000' : `http://${window.location.hostname}:8000`;
      
      const response = await axios.post(`${API_BASE}/api/v1/evaluate-dubbing`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResults(response.data);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || 'An error occurred during evaluation. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header className="header animate-fade-in">
        <h1>DubGuard AI</h1>
        <p>Intelligent Dubbing Quality Assurance & Auto-Correction Platform</p>
      </header>

      {!results && (
        <div className="upload-section animate-fade-in">
          <div className="upload-card glass-panel">
            <h3><FileAudio size={24} /> Original Assets</h3>
            
            <div className="file-input-wrapper">
              <button className={`btn-upload ${originalAudio ? 'has-file' : ''}`}>
                <Upload size={28} />
                <span>{originalAudio ? originalAudio.name : 'Upload Original Audio (WAV/MP3)'}</span>
              </button>
              <input type="file" accept="audio/*" onChange={(e) => setOriginalAudio(e.target.files?.[0] || null)} />
            </div>

            <textarea 
              className="text-input" 
              placeholder="Optional: Paste original source transcript here (Leave blank for AI Auto-Transcription)"
              value={originalTranscript}
              onChange={(e) => setOriginalTranscript(e.target.value)}
            />
          </div>

          <div className="upload-card glass-panel">
            <h3><Wand2 size={24} /> Dubbed Assets</h3>
            
            <div className="file-input-wrapper">
              <button className={`btn-upload ${dubbedAudio ? 'has-file' : ''}`}>
                <Upload size={28} />
                <span>{dubbedAudio ? dubbedAudio.name : 'Upload Dubbed Audio (WAV/MP3)'}</span>
              </button>
              <input type="file" accept="audio/*" onChange={(e) => setDubbedAudio(e.target.files?.[0] || null)} />
            </div>

            <div className="file-input-wrapper">
              <button className={`btn-upload ${dubbedVideo ? 'has-file' : ''}`}>
                <FileVideo size={28} />
                <span>{dubbedVideo ? dubbedVideo.name : 'Upload Dubbed Video (Optional for Lip-Sync)'}</span>
              </button>
              <input type="file" accept="video/*" onChange={(e) => setDubbedVideo(e.target.files?.[0] || null)} />
            </div>

            <textarea 
              className="text-input" 
              placeholder="Optional: Paste translated target transcript here (Leave blank for AI Auto-Transcription)"
              value={translatedTranscript}
              onChange={(e) => setTranslatedTranscript(e.target.value)}
            />
          </div>
        </div>
      )}

      {!results && (
        <button 
          className="submit-btn" 
          onClick={handleSubmit} 
          disabled={loading || !originalAudio || !dubbedAudio}
        >
          {loading ? <><Loader2 className="loader" size={24}/> Processing QA Pipeline...</> : <><ShieldCheck size={24}/> Run Quality Evaluation</>}
        </button>
      )}

      {error && (
        <div className="glass-panel" style={{ padding: '1rem', color: 'var(--error)', textAlign: 'center', borderColor: 'var(--error)' }}>
          {error}
        </div>
      )}

      {results && (
        <div className="results-container animate-fade-in">
          <div className={`score-banner glass-panel ${results.status === 'PASS' ? 'pass' : 'fail'}`}>
            <div className="score-info">
              <h2>{results.status === 'PASS' ? 'Quality Check Passed' : 'Quality Issues Detected'}</h2>
              <p>DubGuard AI has completed the analysis across 7 neural evaluation models.</p>
            </div>
            <RadialProgress score={results.overall_score} status={results.status} />
          </div>

          <div className="audio-comparison glass-panel" style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ textAlign: 'center' }}>
              <h4 style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>Original Audio</h4>
              {originalAudio && <audio controls src={URL.createObjectURL(originalAudio)} style={{ height: '40px', outline: 'none' }} />}
            </div>
            <div style={{ textAlign: 'center' }}>
              <h4 style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>Dubbed Audio</h4>
              {dubbedAudio && <audio controls src={URL.createObjectURL(dubbedAudio)} style={{ height: '40px', outline: 'none' }} />}
            </div>
          </div>

          <div className="details-grid">
            <div className="detail-card glass-panel">
              <h4>Speech Accuracy (WER)</h4>
              <div className="detail-value">
                {(results.detailed_metrics.speech_evaluation.wer * 100).toFixed(1)}%
              </div>
              <div className="detail-sub">Word Error Rate vs Reference</div>
            </div>

            <div className="detail-card glass-panel">
              <h4>Translation Match</h4>
              <div className="detail-value">
                {results.detailed_metrics.translation_evaluation.semantic_similarity.toFixed(1)}
              </div>
              <div className="detail-sub">Semantic Similarity (1-100)</div>
            </div>

            <div className="detail-card glass-panel">
              <h4>Speaker Preservation</h4>
              <div className="detail-value" style={{color: results.detailed_metrics.speaker_similarity.is_same_speaker ? 'var(--success)' : 'var(--error)'}}>
                {results.detailed_metrics.speaker_similarity.similarity_score.toFixed(1)}%
              </div>
              <div className="detail-sub">Voice Cloning Similarity Match</div>
            </div>

            <div className="detail-card glass-panel">
              <h4>Emotion Preservation</h4>
              <div className="detail-value">
                {results.detailed_metrics.emotion_analysis.similarity_score.toFixed(1)}%
              </div>
              <div className="detail-sub">Emotion Distribution Match</div>
            </div>

            {results.detailed_metrics.lip_sync_analysis?.lip_sync_score !== undefined && (
              <div className="detail-card glass-panel">
                <h4>Lip-Sync Precision</h4>
                <div className="detail-value" style={{color: results.detailed_metrics.lip_sync_analysis.lip_sync_score > 70 ? 'var(--success)' : 'var(--error)'}}>
                  {results.detailed_metrics.lip_sync_analysis.lip_sync_score.toFixed(1)}%
                </div>
                <div className="detail-sub">
                  A/V Latency: {results.detailed_metrics.lip_sync_analysis.ms_offset_latency}ms
                </div>
              </div>
            )}
          </div>

          <div className="issues-container">
            <div className="issues-list glass-panel">
              <h3><AlertTriangle size={24} /> Issues Detected</h3>
              {results.issues_detected.length > 0 ? (
                <ul>
                  {results.issues_detected.map((issue, i) => <li key={i}>{issue}</li>)}
                </ul>
              ) : (
                <p style={{ color: 'var(--text-secondary)' }}>No quality issues detected. The dubbing is production-ready!</p>
              )}
            </div>

            <div className="recs-list glass-panel">
              <h3><CheckCircle2 size={24} /> Auto-Correction Engine</h3>
              {results.auto_correct_recommendations.length > 0 ? (
                <ul>
                  {results.auto_correct_recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
                </ul>
              ) : (
                <p style={{ color: 'var(--text-secondary)' }}>No corrections needed.</p>
              )}
            </div>
          </div>

          {(results.corrected_transcript || results.corrected_audio_path) && (
            <div className="corrected-output-section glass-panel" style={{ marginTop: '1.5rem', padding: '2rem', borderLeft: '4px solid var(--accent)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: 0, color: 'var(--warning)', fontSize: '1.3rem' }}><Wand2 size={24} /> Active Auto-Correction Results</h3>
              {results.corrected_transcript && (
                <div>
                  <strong style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.85rem' }}>LLM Rewritten Transcript</strong>
                  <p style={{ marginTop: '0.5rem', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>
                    {results.corrected_transcript}
                  </p>
                </div>
              )}
              {results.corrected_audio_path && (
                <div>
                  <strong>Regenerated TTS Audio:</strong>
                  <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                    <audio controls src={`${window.location.hostname === 'localhost' ? 'http://localhost:8000' : `http://${window.location.hostname}:8000`}/api/v1/download-corrected?path=${encodeURIComponent(results.corrected_audio_path)}`} style={{ height: '40px', outline: 'none' }} />
                    <a 
                      href={`${window.location.hostname === 'localhost' ? 'http://localhost:8000' : `http://${window.location.hostname}:8000`}/api/v1/download-corrected?path=${encodeURIComponent(results.corrected_audio_path)}`}
                      download="corrected_dub.mp3"
                      className="submit-btn"
                      style={{ padding: '0 1.5rem', width: 'auto', height: '40px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: 0 }}
                    >
                      Download Fix
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}

          <button className="submit-btn" style={{marginTop: '3rem'}} onClick={() => setResults(null)}>
            Evaluate Another File
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
