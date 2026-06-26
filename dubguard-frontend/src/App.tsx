import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import { Toaster } from 'react-hot-toast';
import Login from './Login';
import Layout from './Layout';
import Landing from './Landing';
import History from './History';
import DubGuardApp from './DubGuardApp';
import VoiceStudio from './VoiceStudio';
import AudioTranslator from './AudioTranslator';
import PodcastSummarizer from './PodcastSummarizer';
import EmotionAnalyzer from './EmotionAnalyzer';
import VocalIsolator from './VocalIsolator';
import VoiceClone from './VoiceClone';
import './index.css';

import { VoiceProvider } from './VoiceContext';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <VoiceProvider>
        <BrowserRouter>
          <Toaster 
            position="bottom-right" 
            toastOptions={{ 
              style: { 
                background: '#0d1117', 
                color: '#fff', 
                border: '1px solid rgba(255,255,255,0.1)' 
              } 
            }} 
          />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              } 
            >
              <Route path="evaluate" element={<DubGuardApp />} />
              <Route path="history" element={<History />} />
              <Route path="voice-studio" element={<VoiceStudio />} />
              <Route path="translator" element={<AudioTranslator />} />
              <Route path="summarizer" element={<PodcastSummarizer />} />
              <Route path="emotion" element={<EmotionAnalyzer />} />
              <Route path="isolator" element={<VocalIsolator />} />
              <Route path="voice-clone" element={<VoiceClone />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </VoiceProvider>
    </AuthProvider>
  );
}

export default App;
