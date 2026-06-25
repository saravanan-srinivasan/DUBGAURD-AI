import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { ShieldCheck, Zap, LogOut, Mic, Globe, FileText, Activity, Music, Menu, X, Clock, Volume2 } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from './firebase';
import './Layout.css';

const Layout: React.FC = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
            onClick={() => signOut(auth)}
            className="logout-btn mobile-logout-btn"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>

        <div className="navbar-links">
          <span className="nav-badge"><Zap size={13} /> 7 Neural Models</span>
          <button 
            onClick={() => signOut(auth)}
            className="logout-btn desktop-logout-btn"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </nav>

      <div className="app-content">
        <Outlet />
      </div>
    </>
  );
};

export default Layout;
