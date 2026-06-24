import React from 'react';
import { Music } from 'lucide-react';

const VocalIsolator: React.FC = () => {
  return (
    <div className="app-container">
      <header className="header animate-fade-in">
        <div className="hero-badge"><Music size={14} /> Audio Processing</div>
        <h1>Vocal <span className="gradient-text">Isolator</span></h1>
        <p>Separate human voices from background noise and music.</p>
      </header>

      <div className="upload-card glass-panel" style={{ textAlign: 'center', padding: '4rem' }}>
        <h2>Vocal Isolator coming soon...</h2>
      </div>
    </div>
  );
};

export default VocalIsolator;
