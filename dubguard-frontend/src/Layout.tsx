import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { ShieldCheck, LogOut, Mic, Globe, FileText, Activity, Music, Menu, X, Clock, Volume2 } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from './firebase';
import { useVoiceContext } from './VoiceContext';
import './Layout.css';

const Layout: React.FC = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);
  const { globalVoiceEnabled, setGlobalVoiceEnabled, globalVoiceFile, setGlobalVoiceFile } = useVoiceContext();

  const navLinks = [
    { path: '/evaluate', label: 'Evaluate', icon: <ShieldCheck size={16} /> },
    { path: '/history', label: 'History', icon: <Clock size={16} /> },
    { path: '/voice-studio', label: 'Voice Studio', icon: <Mic size={16} /> },
    { path: '/voice-clone', label: 'Voice Clone', icon: <Volume2 size={16} /> },
    { path: '/translator', label: 'Translator', icon: <Globe size={16} /> },
    { path: '/summarizer', label: 'Summarizer', icon: <FileText size={16} /> },
    { path: '/emotion', label: 'Emotion', icon: <Activity size={16} /> },
    { path: '/isolator', label: 'Isolator', icon: <Music size={16} /> },
  ];

  return (
    <>
      <nav className="navbar">
        <div className="navbar-brand">
          <ShieldCheck size={28} className="navbar-icon" />
          <span className="brand-name">DubGuard<span className="brand-ai"> AI</span></span>
          <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        
        <div className={`navbar-center-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          {navLinks.map((link) => (
            <Link 
              key={link.path} 
              to={link.path} 
              className={`nav-link-item ${location.pathname === link.path ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.icon}
              <span className="nav-link-text">{link.label}</span>
            </Link>
          ))}
          <button 
            onClick={() => setVoiceModalOpen(true)}
            className="nav-link-item"
            style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--accent)' }}
          >
            <Mic size={16} /> <span className="nav-link-text">My Voice (Beta)</span>
          </button>
          <button 
            onClick={() => signOut(auth)}
            className="logout-btn mobile-logout-btn"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>

        <div className="navbar-links">
          <button 
            onClick={() => setVoiceModalOpen(true)}
            className="logout-btn desktop-logout-btn"
            style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.3)' }}
          >
            <Mic size={16} /> My Voice (Beta)
          </button>
          <button 
            onClick={() => signOut(auth)}
            className="logout-btn desktop-logout-btn"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </nav>

      {voiceModalOpen && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-content glass-panel" style={{ width: '90%', maxWidth: '400px', padding: '2rem', position: 'relative' }}>
            <button onClick={() => setVoiceModalOpen(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
              <X size={20} />
            </button>
            <h3 style={{ marginTop: 0, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Mic size={20} color="#a855f7" /> My Custom Voice
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              Upload a 5-10 second clear clip of your voice. When enabled, supported features (Translator, Voice Studio) will output audio in your cloned voice!
            </p>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>Enable Global Voice</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div 
                  onClick={() => setGlobalVoiceEnabled(!globalVoiceEnabled)}
                  style={{ width: '50px', height: '26px', borderRadius: '13px', background: globalVoiceEnabled ? '#a855f7' : 'rgba(255,255,255,0.2)', cursor: 'pointer', position: 'relative', transition: 'background 0.3s' }}
                >
                  <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'white', position: 'absolute', top: '2px', left: globalVoiceEnabled ? '26px' : '2px', transition: 'left 0.3s' }} />
                </div>
                <span style={{ fontSize: '0.85rem', color: globalVoiceEnabled ? '#10b981' : 'rgba(255,255,255,0.5)' }}>
                  {globalVoiceEnabled ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>Master Voice File</label>
              <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px dashed rgba(255,255,255,0.2)', borderRadius: '8px', padding: '1rem', textAlign: 'center' }}>
                <input 
                  type="file" 
                  accept="audio/*" 
                  id="master-voice-upload" 
                  style={{ display: 'none' }}
                  onChange={(e) => setGlobalVoiceFile(e.target.files?.[0] || null)}
                />
                <label htmlFor="master-voice-upload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <Volume2 size={24} color={globalVoiceFile ? "#10b981" : "rgba(255,255,255,0.5)"} />
                  <span style={{ fontSize: '0.85rem' }}>{globalVoiceFile ? globalVoiceFile.name : 'Click to select audio file'}</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="app-content">
        <Outlet />
      </div>
    </>
  );
};

export default Layout;
