import { useState, useEffect } from 'react';
import axios from 'axios';
import { Upload, FileAudio, FileVideo, CheckCircle2, Wand2, AlertTriangle, ShieldCheck, Zap, BarChart2 } from 'lucide-react';
import './App.css';

// --- Radial Progress SVG ---
const RadialProgress = ({ score, status }: { score: number; status: string }) => {
  const [offset, setOffset] = useState(377);
  useEffect(() => {
    setTimeout(() => setOffset(377 - (377 * score) / 100), 100);
  }, [score]);
  return (
    <div className="radial-progress-container">
      <svg className="radial-progress-svg" viewBox="0 0 140 140">
        <circle className="radial-progress-bg" cx="70" cy="70" r="60" />
        <circle className={`radial-progress-bar ${status === 'PASS' ? 'pass' : 'fail'}`} cx="70" cy="70" r="60" strokeDasharray="377" strokeDashoffset={offset} />
      </svg>
      <div className={`radial-progress-text ${status === 'PASS' ? 'pass' : 'fail'}`}>{Math.round(score)}</div>
    </div>
  );
};

// --- Mini Metric Bar ---
const MetricBar = ({ value, max = 100, color }: { value: number; max?: number; color: string }) => {
  const [width, setWidth] = useState(0);
  useEffect(() => { setTimeout(() => setWidth((value / max) * 100), 150); }, [value, max]);
  return (
    <div className="metric-bar-track">
      <div className="metric-bar-fill" style={{ width: `${width}%`, background: color }} />
    </div>
  );
};

// --- Loading Overlay ---
const LoadingOverlay = () => (
  <div className="loading-overlay">
    <div className="loading-card">
      <div className="loading-ring" />
      <h3>Running QA Pipeline</h3>
      <p>7 neural networks are analyzing your audio...</p>
      <div className="loading-steps">
        {['Transcribing Audio', 'Evaluating Translation', 'Checking Pronunciation', 'Analyzing Emotion', 'Verifying Speaker', 'Scoring Lip-Sync', 'Auto-Correction Engine'].map((s, i) => (
          <div key={i} className="loading-step" style={{ animationDelay: `${i * 0.4}s` }}>
            <Zap size={14} /> <span>{s}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

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

  const API_BASE = import.meta.env.VITE_API_URL || 'https://shravan2020-dubguard-backend.hf.space';

  const handleSubmit = async () => {
    if (!originalAudio || !dubbedAudio) { setError('Please upload both original and dubbed audio files.'); return; }
    setLoading(true); setError(null); setResults(null);
    const formData = new FormData();
    formData.append('original_audio', originalAudio);
    formData.append('dubbed_audio', dubbedAudio);
    if (dubbedVideo) formData.append('dubbed_video', dubbedVideo);
    formData.append('original_transcript', originalTranscript);
    formData.append('translated_transcript', translatedTranscript);
    try {
      const response = await axios.post(`${API_BASE}/api/v1/evaluate-dubbing`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setResults(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'An error occurred. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResults(null);
    setOriginalAudio(null);
    setDubbedAudio(null);
    setDubbedVideo(null);
    setOriginalTranscript('');
    setTranslatedTranscript('');
    setError(null);
  };

  return (
    <>
      {loading && <LoadingOverlay />}

      {/* ─── NAVBAR ─── */}
      <nav className="navbar">
        <div className="navbar-brand">
          <ShieldCheck size={28} className="navbar-icon" />
          <span>DubGuard <span className="brand-ai">AI</span></span>
        </div>
        <div className="navbar-links">
          <span className="nav-badge"><Zap size={13} /> 7 Neural Models</span>
        </div>
      </nav>

      <div className="app-container">

        {/* ─── HERO ─── */}
        {!results && (
          <header className="header animate-fade-in">
            <div className="hero-badge"><BarChart2 size={14} /> AI Dubbing Quality Assurance</div>
            <h1>DubGuard <span className="gradient-text">AI</span></h1>
            <p>Detect translation errors, voice mismatches & lip-sync drift with 7 neural evaluation models. Powered by auto-correction.</p>
          </header>
        )}

        {/* ─── UPLOAD CARDS ─── */}
        {!results && (
          <div className="upload-section animate-fade-in">
            {/* Original */}
            <div className="upload-card glass-panel">
              <div className="card-header">
                <FileAudio size={20} className="card-icon original" />
                <h3>Original Assets</h3>
              </div>
              <div className="file-input-wrapper">
                <button className={`btn-upload ${originalAudio ? 'has-file' : ''}`}>
                  <Upload size={26} />
                  <span>{originalAudio ? originalAudio.name : 'Upload Original Audio (WAV/MP3)'}</span>
                  {!originalAudio && <small>Click or drag & drop</small>}
                </button>
                <input type="file" accept="audio/*" onChange={(e) => setOriginalAudio(e.target.files?.[0] || null)} />
              </div>
              <textarea className="text-input" placeholder="Optional: Paste source transcript (or leave blank for AI auto-transcription)" value={originalTranscript} onChange={(e) => setOriginalTranscript(e.target.value)} />
            </div>

            {/* Dubbed */}
            <div className="upload-card glass-panel">
              <div className="card-header">
                <Wand2 size={20} className="card-icon dubbed" />
                <h3>Dubbed Assets</h3>
              </div>
              <div className="file-input-wrapper">
                <button className={`btn-upload ${dubbedAudio ? 'has-file' : ''}`}>
                  <Upload size={26} />
                  <span>{dubbedAudio ? dubbedAudio.name : 'Upload Dubbed Audio (WAV/MP3)'}</span>
                  {!dubbedAudio && <small>Click or drag & drop</small>}
                </button>
                <input type="file" accept="audio/*" onChange={(e) => setDubbedAudio(e.target.files?.[0] || null)} />
              </div>
              <div className="file-input-wrapper">
                <button className={`btn-upload ${dubbedVideo ? 'has-file' : ''}`}>
                  <FileVideo size={26} />
                  <span>{dubbedVideo ? dubbedVideo.name : 'Upload Dubbed Video (Optional for Lip-Sync)'}</span>
                  {!dubbedVideo && <small>Enables lip-sync analysis</small>}
                </button>
                <input type="file" accept="video/*" onChange={(e) => setDubbedVideo(e.target.files?.[0] || null)} />
              </div>
              <textarea className="text-input" placeholder="Optional: Paste translated transcript (or leave blank for AI auto-transcription)" value={translatedTranscript} onChange={(e) => setTranslatedTranscript(e.target.value)} />
            </div>
          </div>
        )}

        {/* ─── SUBMIT BUTTON ─── */}
        {!results && (
          <div className="submit-wrapper">
            <button className="submit-btn shimmer-btn" onClick={handleSubmit} disabled={loading || !originalAudio || !dubbedAudio}>
              <ShieldCheck size={22} /> Run Quality Evaluation
            </button>
            {(!originalAudio || !dubbedAudio) && <p className="submit-hint">Upload both audio files to begin</p>}
          </div>
        )}

        {/* ─── ERROR ─── */}
        {error && (
          <div className="glass-panel error-banner">
            <AlertTriangle size={20} /> {error}
          </div>
        )}

        {/* ─── RESULTS ─── */}
        {results && (
          <div className="results-container animate-fade-in">

            {/* Score Banner */}
            <div className={`score-banner glass-panel ${results.status === 'PASS' ? 'pass' : 'fail'}`}>
              <div className="score-info">
                <div className={`status-pill ${results.status === 'PASS' ? 'pass' : 'fail'}`}>
                  {results.status === 'PASS' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                  {results.status === 'PASS' ? 'Quality Approved' : 'Issues Detected'}
                </div>
                <h2>{results.status === 'PASS' ? 'Dubbing Passed QA Check' : 'Dubbing Needs Attention'}</h2>
                <p>Analyzed across 7 neural evaluation models simultaneously.</p>
              </div>
              <RadialProgress score={results.overall_score} status={results.status} />
            </div>

            {/* Audio Comparison */}
            <div className="audio-comparison glass-panel">
              <h4 className="section-label">🎧 Live Audio Comparison</h4>
              <div className="audio-players">
                <div className="audio-player-item">
                  <span>Original</span>
                  {originalAudio && <audio controls src={URL.createObjectURL(originalAudio)} />}
                </div>
                <div className="audio-divider">vs</div>
                <div className="audio-player-item">
                  <span>Dubbed</span>
                  {dubbedAudio && <audio controls src={URL.createObjectURL(dubbedAudio)} />}
                </div>
              </div>
            </div>

            {/* Metric Cards */}
            <div className="details-grid">
              {[
                { label: 'Speech Accuracy (WER)', value: (results.detailed_metrics.speech_evaluation.wer * 100).toFixed(1), sub: 'Word Error Rate vs Reference', color: '#6366f1', raw: results.detailed_metrics.speech_evaluation.wer * 100 },
                { label: 'Translation Match', value: results.detailed_metrics.translation_evaluation.semantic_similarity.toFixed(1), sub: 'Semantic Similarity Score', color: '#8b5cf6', raw: results.detailed_metrics.translation_evaluation.semantic_similarity },
                { label: 'Speaker Preservation', value: `${results.detailed_metrics.speaker_similarity.similarity_score.toFixed(1)}%`, sub: 'Voice Cloning Similarity', color: results.detailed_metrics.speaker_similarity.is_same_speaker ? '#10b981' : '#ef4444', raw: results.detailed_metrics.speaker_similarity.similarity_score },
                { label: 'Emotion Preservation', value: `${results.detailed_metrics.emotion_analysis.similarity_score.toFixed(1)}%`, sub: 'Emotion Distribution Match', color: '#f59e0b', raw: results.detailed_metrics.emotion_analysis.similarity_score },
              ].map((m, i) => (
                <div key={i} className="detail-card glass-panel">
                  <h4>{m.label}</h4>
                  <div className="detail-value" style={{ color: m.color }}>{m.value}</div>
                  <MetricBar value={m.raw} color={m.color} />
                  <div className="detail-sub">{m.sub}</div>
                </div>
              ))}
              {results.detailed_metrics.lip_sync_analysis?.lip_sync_score !== undefined && (
                <div className="detail-card glass-panel">
                  <h4>Lip-Sync Precision</h4>
                  <div className="detail-value" style={{ color: results.detailed_metrics.lip_sync_analysis.lip_sync_score > 70 ? '#10b981' : '#ef4444' }}>
                    {results.detailed_metrics.lip_sync_analysis.lip_sync_score.toFixed(1)}%
                  </div>
                  <MetricBar value={results.detailed_metrics.lip_sync_analysis.lip_sync_score} color={results.detailed_metrics.lip_sync_analysis.lip_sync_score > 70 ? '#10b981' : '#ef4444'} />
                  <div className="detail-sub">A/V Latency: {results.detailed_metrics.lip_sync_analysis.ms_offset_latency}ms</div>
                </div>
              )}
            </div>

            {/* Issues & Recs */}
            <div className="issues-container">
              <div className="issues-list glass-panel">
                <h3><AlertTriangle size={20} /> Issues Detected</h3>
                {results.issues_detected.length > 0 ? (
                  <ul>{results.issues_detected.map((issue, i) => <li key={i}>{issue}</li>)}</ul>
                ) : (
                  <p className="empty-state"><CheckCircle2 size={16} /> No quality issues detected — production ready!</p>
                )}
              </div>
              <div className="recs-list glass-panel">
                <h3><CheckCircle2 size={20} /> Auto-Correction Engine</h3>
                {results.auto_correct_recommendations.length > 0 ? (
                  <ul>{results.auto_correct_recommendations.map((rec, i) => <li key={i}>{rec}</li>)}</ul>
                ) : (
                  <p className="empty-state">No corrections needed.</p>
                )}
              </div>
            </div>

            {/* Corrected Output */}
            {(results.corrected_transcript || results.corrected_audio_path) && (
              <div className="corrected-output-section glass-panel">
                <h3><Wand2 size={22} /> Active Auto-Correction Results</h3>
                {results.corrected_transcript && (
                  <div className="corrected-block">
                    <strong>LLM Rewritten Transcript</strong>
                    <p>{results.corrected_transcript}</p>
                  </div>
                )}
                {results.corrected_audio_path && (
                  <div className="corrected-block">
                    <strong>Regenerated TTS Audio</strong>
                    <div className="audio-download-row">
                      <audio controls src={`${API_BASE}/api/v1/download-corrected?path=${encodeURIComponent(results.corrected_audio_path)}`} />
                      <a href={`${API_BASE}/api/v1/download-corrected?path=${encodeURIComponent(results.corrected_audio_path)}`} download="corrected_dub.mp3" className="download-btn">
                        ⬇ Download Fix
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )}

            <button className="submit-btn shimmer-btn" style={{ marginTop: '2rem' }} onClick={handleReset}>
              ← Evaluate Another File
            </button>
          </div>
        )}
      </div>

      {/* ─── FOOTER ─── */}
      <footer className="footer">
        <p>DubGuard AI — Built with React, FastAPI & 7 Neural Networks</p>
        <p className="footer-sub">© 2026 Saravanan Srinivasan</p>
      </footer>
    </>
  );
}

export default App;
