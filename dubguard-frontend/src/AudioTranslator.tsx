import React from 'react';
import { Globe } from 'lucide-react';

const AudioTranslator: React.FC = () => {
  return (
    <div className="app-container">
      <header className="header animate-fade-in">
        <div className="hero-badge"><Globe size={14} /> One-Click Translation</div>
        <h1>Audio <span className="gradient-text">Translator</span></h1>
        <p>Upload an audio file in any language and instantly translate it to English.</p>
      </header>

      <div className="upload-card glass-panel" style={{ textAlign: 'center', padding: '4rem' }}>
        <h2>Audio Translator coming soon...</h2>
      </div>
    </div>
  );
};

export default AudioTranslator;
