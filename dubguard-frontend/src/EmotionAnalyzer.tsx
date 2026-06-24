import React from 'react';
import { Activity } from 'lucide-react';

const EmotionAnalyzer: React.FC = () => {
  return (
    <div className="app-container">
      <header className="header animate-fade-in">
        <div className="hero-badge"><Activity size={14} /> Acoustic Profiling</div>
        <h1>Emotion <span className="gradient-text">Analyzer</span></h1>
        <p>Upload audio to detect the primary emotions and sentiment of the speaker.</p>
      </header>

      <div className="upload-card glass-panel" style={{ textAlign: 'center', padding: '4rem' }}>
        <h2>Emotion Analyzer coming soon...</h2>
      </div>
    </div>
  );
};

export default EmotionAnalyzer;
