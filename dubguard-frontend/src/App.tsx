import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import Login from './Login';
import Layout from './Layout';
import DubGuardApp from './DubGuardApp';
import VoiceStudio from './VoiceStudio';
import AudioTranslator from './AudioTranslator';
import PodcastSummarizer from './PodcastSummarizer';
import EmotionAnalyzer from './EmotionAnalyzer';
import VocalIsolator from './VocalIsolator';
import './index.css';

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
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            } 
          >
            <Route index element={<DubGuardApp />} />
            <Route path="voice-studio" element={<VoiceStudio />} />
            <Route path="translator" element={<AudioTranslator />} />
            <Route path="summarizer" element={<PodcastSummarizer />} />
            <Route path="emotion" element={<EmotionAnalyzer />} />
            <Route path="isolator" element={<VocalIsolator />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
