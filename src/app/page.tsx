'use client';

import { useState } from 'react';
import { Headphones, Zap, Search, Upload as UploadIcon } from 'lucide-react';
import ImageUpload from '@/components/ImageUpload';
import SoundResults from '@/components/SoundResults';
import AudioPlayer from '@/components/AudioPlayer';
import { SoundBite, AppState } from '@/types';

export default function Home() {
  const [appState, setAppState] = useState<AppState>({
    uploadedImage: null,
    isAnalyzing: false,
    analysisResult: null,
    soundResults: [],
    isSearching: false,
    error: null,
    currentlyPlaying: null,
  });

  const [currentAudioPlayer, setCurrentAudioPlayer] = useState<{
    soundBite: SoundBite;
    isPlaying: boolean;
  } | null>(null);

  const [volume, setVolume] = useState(0.7);

  const handleImageUpload = async (file: File) => {
    setAppState(prev => ({
      ...prev,
      uploadedImage: { file, preview: URL.createObjectURL(file), status: 'analyzing' },
      isAnalyzing: true,
      analysisResult: null,
      soundResults: [],
      error: null,
    }));

    try {
      // Analyze image
      const formData = new FormData();
      formData.append('image', file);

      const analyzeResponse = await fetch('/api/analyze-image', {
        method: 'POST',
        body: formData,
      });

      if (!analyzeResponse.ok) {
        throw new Error('Failed to analyze image');
      }

      const analyzeResult = await analyzeResponse.json();
      
      if (!analyzeResult.success) {
        throw new Error(analyzeResult.error || 'Failed to analyze image');
      }

      setAppState(prev => ({
        ...prev,
        isAnalyzing: false,
        analysisResult: analyzeResult.description,
        isSearching: true,
      }));

      // Search for sounds
      const searchResponse = await fetch('/api/search-sounds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: analyzeResult.description,
          limit: 10,
          threshold: 0.5,
        }),
      });

      if (!searchResponse.ok) {
        throw new Error('Failed to search sounds');
      }

      const searchResult = await searchResponse.json();
      
      if (!searchResult.success) {
        throw new Error(searchResult.error || 'Failed to search sounds');
      }

      setAppState(prev => ({
        ...prev,
        isSearching: false,
        soundResults: searchResult.results || [],
      }));

    } catch (error) {
      console.error('Error:', error);
      setAppState(prev => ({
        ...prev,
        isAnalyzing: false,
        isSearching: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      }));
    }
  };

  const handlePlaySound = (soundId: string) => {
    const soundBite = appState.soundResults.find(s => s.id === soundId);
    if (!soundBite) return;

    if (appState.currentlyPlaying === soundId) {
      // Toggle play/pause for current sound
      if (currentAudioPlayer?.isPlaying) {
        setCurrentAudioPlayer(prev => prev ? { ...prev, isPlaying: false } : null);
      } else {
        setCurrentAudioPlayer(prev => prev ? { ...prev, isPlaying: true } : null);
      }
    } else {
      // Play new sound
      setAppState(prev => ({ ...prev, currentlyPlaying: soundId }));
      setCurrentAudioPlayer({
        soundBite,
        isPlaying: true,
      });
    }
  };

  const handleStopSound = () => {
    setAppState(prev => ({ ...prev, currentlyPlaying: null }));
    setCurrentAudioPlayer(null);
  };

  const handlePlayPause = () => {
    if (currentAudioPlayer) {
      setCurrentAudioPlayer(prev => prev ? { ...prev, isPlaying: !prev.isPlaying } : null);
    }
  };

  const isProcessing = appState.isAnalyzing || appState.isSearching;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg">
                <Headphones className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold gradient-text">VibSeek</h1>
                <p className="text-sm text-gray-600">Picture to Sound Discovery</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <UploadIcon className="w-4 h-4" />
                <span>Upload</span>
              </div>
              <div className="flex items-center space-x-1">
                <Zap className="w-4 h-4" />
                <span>Analyze</span>
              </div>
              <div className="flex items-center space-x-1">
                <Search className="w-4 h-4" />
                <span>Discover</span>
              </div>
              <a 
                href="/admin" 
                className="flex items-center space-x-1 hover:text-gray-900 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Admin</span>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold text-gray-800 mb-2">
              Transform Images into <span className="gradient-text">Sounds</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Upload any image and discover matching sounds using AI-powered analysis and semantic search
            </p>
          </div>

          {/* Image Upload Section */}
          <section className="space-y-6">
            <ImageUpload
              onImageUpload={handleImageUpload}
              isUploading={isProcessing}
              error={appState.error}
            />
            
            {/* Analysis Result */}
            {appState.analysisResult && (
              <div className="glass-effect p-6 max-w-3xl mx-auto">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  🎧 Audio Analysis
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {appState.analysisResult}
                </p>
              </div>
            )}
          </section>

          {/* Sound Results Section */}
          <section className="space-y-6">
            <SoundResults
              results={appState.soundResults}
              isLoading={appState.isSearching}
              onPlaySound={handlePlaySound}
              currentlyPlaying={appState.currentlyPlaying}
            />
          </section>

          {/* Audio Player Section */}
          {currentAudioPlayer && (
            <section className="fixed bottom-4 left-4 right-4 z-40">
              <div className="max-w-2xl mx-auto">
                <AudioPlayer
                  soundBite={currentAudioPlayer.soundBite}
                  isPlaying={currentAudioPlayer.isPlaying}
                  onPlay={handlePlayPause}
                  onPause={handlePlayPause}
                  onStop={handleStopSound}
                  volume={volume}
                  onVolumeChange={setVolume}
                />
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-8 mt-16">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg">
                <Headphones className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">VibSeek</span>
            </div>
            <p className="text-gray-600">
              Powered by OpenAI Vision API and Weaviate Vector Database
            </p>
            <div className="text-sm text-gray-500">
              <p>Upload an image to start your sound discovery journey</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 