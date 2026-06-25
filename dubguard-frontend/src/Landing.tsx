import React from 'react';
import { ShieldCheck, Zap, ArrowRight, Play, Globe, Mic, FileText, Activity, Music } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const Landing: React.FC = () => {
  const { currentUser } = useAuth();

  // If user is already logged in, redirect to their dashboard
  if (currentUser) {
    return <Navigate to="/evaluate" replace />;
  }

  const features = [
    { icon: <Mic size={24} className="text-accent" />, title: 'Voice Studio', desc: 'Generate high-quality neural speech in 8 languages instantly.' },
    { icon: <Globe size={24} className="text-accent" />, title: 'Audio Translator', desc: 'Dub your audio into any language with native-sounding voices.' },
    { icon: <FileText size={24} className="text-accent" />, title: 'Podcast Summarizer', desc: 'Extract key insights and summaries from long-form audio.' },
    { icon: <Activity size={24} className="text-accent" />, title: 'Emotion Analyzer', desc: 'Detect the underlying emotional sentiment from spoken audio.' },
    { icon: <Music size={24} className="text-accent" />, title: 'Vocal Isolator', desc: 'Extract pure vocals and instrumentals from any track using DSP.' }
  ];

  return (
    <div className="landing-page" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Navbar */}
      <nav className="navbar" style={{ position: 'relative', zIndex: 10 }}>
        <div className="navbar-brand">
          <ShieldCheck size={28} className="navbar-icon" />
          <span>DubGuard <span className="brand-ai">AI</span></span>
        </div>
        <div className="navbar-links">
          <Link to="/login" className="nav-link" style={{ fontWeight: 600 }}>Login</Link>
          <Link to="/login" className="submit-btn shimmer-btn" style={{ padding: '0.5rem 1.5rem', borderRadius: '8px', fontSize: '0.9rem' }}>
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '6rem 1.5rem', textAlign: 'center', zIndex: 10 }}>
        <div className="hero-badge animate-fade-in" style={{ marginBottom: '1.5rem' }}>
          <Zap size={14} /> The Ultimate Audio AI Suite
        </div>
        
        <h1 className="animate-fade-in" style={{ fontSize: 'clamp(2.5rem, 6vw, 4.8rem)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.1, maxWidth: '900px', marginBottom: '1.5rem', animationDelay: '0.1s', animationFillMode: 'both' }}>
          Your Audio, <br/>
          <span className="gradient-text">Supercharged by AI.</span>
        </h1>
        
        <p className="animate-fade-in" style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: '600px', marginBottom: '3rem', animationDelay: '0.2s', animationFillMode: 'both' }}>
          Translate, summarize, isolate, and generate human-like voices in seconds. Join the next generation of audio creators.
        </p>

        <div className="animate-fade-in" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', animationDelay: '0.3s', animationFillMode: 'both' }}>
          <Link to="/login" className="submit-btn shimmer-btn" style={{ padding: '0.9rem 2.2rem', whiteSpace: 'nowrap' }}>
            Start for Free <ArrowRight size={18} />
          </Link>
          <a href="#features" className="submit-btn" style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', boxShadow: 'none', whiteSpace: 'nowrap' }}>
            <Play size={18} /> See Features
          </a>
        </div>
      </main>

      {/* Features Grid */}
      <section id="features" style={{ padding: '6rem 2rem', background: 'rgba(0,0,0,0.4)', zIndex: 10 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '4rem' }}>Powerful <span className="gradient-text">Neural Models</span></h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            {features.map((f, idx) => (
              <div key={idx} className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', transition: 'transform 0.3s' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8' }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: '1.25rem', margin: 0 }}>{f.title}</h3>
                <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.95rem' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="footer" style={{ zIndex: 10 }}>
        <p>© 2026 DubGuard AI. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Landing;
