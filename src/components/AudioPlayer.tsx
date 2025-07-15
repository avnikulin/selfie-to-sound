'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Square, Volume2, VolumeX, SkipBack, SkipForward } from 'lucide-react';
import { AudioPlayerProps } from '@/types';
import { formatDuration, normalizeVolume } from '@/lib/utils';

export default function AudioPlayer({
  soundBite,
  isPlaying,
  onPlay,
  onPause,
  onStop,
  volume = 0.7,
  onVolumeChange,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previousVolume, setPreviousVolume] = useState(volume);

  // Update audio element when isPlaying changes
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch((err) => {
          console.error('Audio play error:', err);
          setError('Failed to play audio');
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  // Update volume when volume prop changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = normalizeVolume(volume);
    }
  }, [volume]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      setIsLoading(false);
    }
  };

  const handleLoadStart = () => {
    setIsLoading(true);
    setError(null);
  };

  const handleError = () => {
    setError('Failed to load audio');
    setIsLoading(false);
  };

  const handleEnded = () => {
    setCurrentTime(0);
    onStop();
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    if (onVolumeChange) {
      onVolumeChange(newVolume);
    }
    if (audioRef.current) {
      audioRef.current.volume = normalizeVolume(newVolume);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = normalizeVolume(previousVolume);
        if (onVolumeChange) {
          onVolumeChange(previousVolume);
        }
        setIsMuted(false);
      } else {
        setPreviousVolume(volume);
        audioRef.current.volume = 0;
        if (onVolumeChange) {
          onVolumeChange(0);
        }
        setIsMuted(true);
      }
    }
  };

  const skipForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(audioRef.current.currentTime + 10, duration);
    }
  };

  const skipBackward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(audioRef.current.currentTime - 10, 0);
    }
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
      <audio
        ref={audioRef}
        src={soundBite.audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onLoadStart={handleLoadStart}
        onError={handleError}
        onEnded={handleEnded}
        preload="metadata"
      />

      {/* Track Info */}
      <div className="mb-4">
        <h3 className="font-semibold text-gray-800 text-lg mb-1">
          {soundBite.title}
        </h3>
        <p className="text-gray-600 text-sm">
          {soundBite.description}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
          <span>{formatDuration(currentTime)}</span>
          <span>{formatDuration(duration)}</span>
        </div>
        <div className="relative">
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-400 to-primary-600 transition-all duration-100"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="absolute top-0 left-0 w-full h-2 opacity-0 cursor-pointer"
            disabled={isLoading || Boolean(error)}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {/* Skip Backward */}
          <button
            onClick={skipBackward}
            disabled={isLoading || Boolean(error)}
            className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <SkipBack className="w-5 h-5 text-gray-600" />
          </button>

          {/* Play/Pause */}
          <button
            onClick={isPlaying ? onPause : onPlay}
            disabled={isLoading || Boolean(error)}
            className={`
              p-3 rounded-full border-2 transition-all duration-200
              ${isPlaying 
                ? 'bg-primary-500 border-primary-500 text-white hover:bg-primary-600' 
                : 'border-primary-500 text-primary-500 hover:bg-primary-50'
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6 ml-0.5" />
            )}
          </button>

          {/* Stop */}
          <button
            onClick={onStop}
            disabled={isLoading || Boolean(error)}
            className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Square className="w-5 h-5 text-gray-600" />
          </button>

          {/* Skip Forward */}
          <button
            onClick={skipForward}
            disabled={isLoading || Boolean(error)}
            className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <SkipForward className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Volume Control */}
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleMute}
            className="p-1 rounded hover:bg-gray-100 transition-colors"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-5 h-5 text-gray-600" />
            ) : (
              <Volume2 className="w-5 h-5 text-gray-600" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-20 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${(isMuted ? 0 : volume) * 100}%, #E5E7EB ${(isMuted ? 0 : volume) * 100}%, #E5E7EB 100%)`,
            }}
          />
          <span className="text-sm text-gray-500 w-8">
            {Math.round((isMuted ? 0 : volume) * 100)}%
          </span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-600">Loading audio...</p>
        </div>
      )}
    </div>
  );
} 