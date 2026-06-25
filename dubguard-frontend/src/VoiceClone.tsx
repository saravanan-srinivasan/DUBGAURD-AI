import React, { useState, useRef } from 'react';
import { UploadCloud, Play, Loader2, Sparkles, Download, Volume2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = 'http://localhost:8000'; // Will be proxied or overridden in prod

const VoiceClone: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState('');
  const [isCloning, setIsCloning] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error("File size must be under 10MB");
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleClone = async () => {
    if (!file) {
      toast.error('Please upload a reference audio file first.');
      return;
    }
    if (!text.trim()) {
      toast.error('Please enter some text to synthesize.');
      return;
    }

    setIsCloning(true);
    setAudioUrl(null);
    const toastId = toast.loading('Initializing Voice Clone Model (This can take 30-60s)...');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('text', text);
      formData.append('language', 'en'); // XTTSv2 supports multiple, keeping en default for now

      const response = await axios.post(`${API_URL}/api/v1/voice-clone`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.audio_base64) {
        const audioSrc = `data:audio/wav;base64,${response.data.audio_base64}`;
        setAudioUrl(audioSrc);
        toast.success('Voice Cloned Successfully!', { id: toastId });
      } else {
        throw new Error('No audio returned');
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.detail || 'Failed to clone voice', { id: toastId });
    } finally {
      setIsCloning(false);
    }
  };

  return (
    <div className="page-container fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 flex items-center gap-2">
            <Volume2 className="text-purple-400" size={32} />
            Custom Voice Cloning
          </h1>
          <p className="text-gray-400 mt-2">Upload a 5-10 second clip of anyone's voice and generate new speech.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Input */}
        <div className="glass-panel p-6 space-y-6">
          
          <div>
            <h3 className="text-lg font-medium mb-2 text-white flex items-center gap-2">
              <UploadCloud size={20} className="text-purple-400" />
              1. Upload Reference Audio
            </h3>
            <p className="text-sm text-gray-400 mb-4">Provide a clean, noise-free audio file (.wav or .mp3) under 10MB.</p>
            
            <div 
              className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center cursor-pointer hover:border-purple-400 transition-colors bg-gray-800/50"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="audio/*" 
                className="hidden" 
              />
              {file ? (
                <div className="text-green-400 font-medium flex items-center justify-center gap-2">
                  <Play size={20} />
                  {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </div>
              ) : (
                <div className="text-gray-400">
                  <UploadCloud size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Click or drag and drop to upload audio</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2 text-white flex items-center gap-2">
              <Sparkles size={20} className="text-purple-400" />
              2. Enter Text to Synthesize
            </h3>
            <textarea
              className="text-input"
              rows={5}
              placeholder="Type what you want the cloned voice to say..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>

          <button 
            className={`btn-primary w-full flex items-center justify-center gap-2 ${isCloning ? 'opacity-70 cursor-not-allowed' : ''}`}
            onClick={handleClone}
            disabled={isCloning}
          >
            {isCloning ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Cloning Voice...
              </>
            ) : (
              <>
                <Volume2 size={20} />
                Generate Voice Clone
              </>
            )}
          </button>
        </div>

        {/* Right Column: Output */}
        <div className="glass-panel p-6 flex flex-col justify-center items-center relative overflow-hidden min-h-[400px]">
          {/* Subtle background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none"></div>
          
          {audioUrl ? (
            <div className="w-full max-w-md space-y-6 z-10 text-center fade-in">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(168,85,247,0.4)] animate-pulse-slow">
                <Volume2 size={48} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white">Clone Complete!</h3>
              
              <div className="bg-gray-800/80 rounded-xl p-4 border border-gray-700">
                <audio controls className="w-full custom-audio-player" src={audioUrl}>
                  Your browser does not support the audio element.
                </audio>
              </div>
              
              <a 
                href={audioUrl} 
                download={`voice_clone_${new Date().getTime()}.wav`}
                className="btn-secondary w-full flex items-center justify-center gap-2"
              >
                <Download size={20} />
                Download Audio
              </a>
            </div>
          ) : (
            <div className="text-center text-gray-500 z-10 flex flex-col items-center">
              {isCloning ? (
                <>
                  <Loader2 size={48} className="animate-spin text-purple-400 mb-4" />
                  <p className="text-lg">Analyzing voice profile...</p>
                  <p className="text-sm mt-2 max-w-xs">This takes about 30 seconds on our free server tier.</p>
                </>
              ) : (
                <>
                  <Volume2 size={48} className="mb-4 opacity-30" />
                  <p className="text-lg">Your cloned audio will appear here</p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceClone;
