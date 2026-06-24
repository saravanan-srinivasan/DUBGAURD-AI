import React from 'react';
import { FileText } from 'lucide-react';

const PodcastSummarizer: React.FC = () => {
  return (
    <div className="app-container">
      <header className="header animate-fade-in">
        <div className="hero-badge"><FileText size={14} /> AI Summarization</div>
        <h1>Podcast <span className="gradient-text">Summarizer</span></h1>
        <p>Upload a long audio file and extract key insights and bullet points.</p>
      </header>

      <div className="upload-card glass-panel" style={{ textAlign: 'center', padding: '4rem' }}>
        <h2>Podcast Summarizer coming soon...</h2>
      </div>
    </div>
  );
};

export default PodcastSummarizer;
