import React, { createContext, useContext, useState } from 'react';

interface VoiceContextType {
  globalVoiceEnabled: boolean;
  setGlobalVoiceEnabled: (enabled: boolean) => void;
  globalVoiceFile: File | null;
  setGlobalVoiceFile: (file: File | null) => void;
}

const VoiceContext = createContext<VoiceContextType>({
  globalVoiceEnabled: false,
  setGlobalVoiceEnabled: () => {},
  globalVoiceFile: null,
  setGlobalVoiceFile: () => {}
});

export const useVoiceContext = () => useContext(VoiceContext);

export const VoiceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [globalVoiceEnabled, setGlobalVoiceEnabled] = useState(false);
  const [globalVoiceFile, setGlobalVoiceFile] = useState<File | null>(null);

  return (
    <VoiceContext.Provider value={{ globalVoiceEnabled, setGlobalVoiceEnabled, globalVoiceFile, setGlobalVoiceFile }}>
      {children}
    </VoiceContext.Provider>
  );
};
