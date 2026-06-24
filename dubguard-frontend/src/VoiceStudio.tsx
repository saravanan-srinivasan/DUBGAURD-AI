import React from 'react';
import { Mic } from 'lucide-react';

const VoiceStudio: React.FC = () => {
  return (
    <div className="app-container">
      <header className="header animate-fade-in">
        <div className="hero-badge"><Mic size={14} /> Text-to-Speech</div>
        <h1>AI Voice <span className="gradient-text">Studio</span></h1>
        <p>Type any text and instantly generate high-quality neural speech.</p>
      </header>

      <div className="upload-card glass-panel" style={{ textAlign: 'center', padding: '4rem' }}>
        <h2>Voice Studio coming soon...</h2>
      </div>
    </div>
  );
};

export default VoiceStudio;
