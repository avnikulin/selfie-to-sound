'use client';

import { useState } from 'react';
import { Play, Pause, Volume2, Download, Tag, Clock, TrendingUp } from 'lucide-react';
import { SoundResultsProps, SoundBite } from '@/types';
import { formatDuration, formatConfidence, truncateText } from '@/lib/utils';

export default function SoundResults({
  results,
  isLoading = false,
  onPlaySound,
  currentlyPlaying = null,
}: SoundResultsProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="glass-effect p-6 animate-pulse">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="text-center py-12">
          <Volume2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">No sounds found</h3>
          <p className="text-gray-500">Try uploading an image to discover matching sounds</p>
        </div>
      </div>
    );
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600 bg-green-100';
    if (confidence >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 80) return '🎯';
    if (confidence >= 60) return '✨';
    return '💡';
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Matching Sounds
        </h2>
        <p className="text-gray-600">
          Found {results.length} sound{results.length !== 1 ? 's' : ''} that match your image
        </p>
      </div>

      <div className="space-y-4">
        {results.map((sound: SoundBite, index: number) => (
          <div
            key={sound.id}
            className={`
              glass-effect p-6 transition-all duration-200
              ${hoveredItem === sound.id ? 'scale-[1.02] shadow-xl' : ''}
              ${currentlyPlaying === sound.id ? 'ring-2 ring-primary-400' : ''}
            `}
            onMouseEnter={() => setHoveredItem(sound.id)}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <div className="flex items-start space-x-4">
              {/* Play Button */}
              <button
                onClick={() => onPlaySound(sound.id)}
                className={`
                  flex-shrink-0 w-12 h-12 rounded-full border-2 
                  flex items-center justify-center transition-all duration-200
                  ${currentlyPlaying === sound.id 
                    ? 'bg-primary-500 border-primary-500 text-white' 
                    : 'border-gray-300 hover:border-primary-400 hover:bg-primary-50'
                  }
                `}
              >
                {currentlyPlaying === sound.id ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5 ml-0.5" />
                )}
              </button>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 text-lg mb-1">
                      {sound.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {truncateText(sound.description, 150)}
                    </p>
                  </div>
                  
                  {/* Confidence Badge */}
                  <div className={`
                    flex items-center px-3 py-1 rounded-full text-xs font-medium
                    ${getConfidenceColor(sound.confidence || 0)}
                  `}>
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {formatConfidence(sound.confidence || 0)}
                  </div>
                </div>

                {/* Metadata */}
                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{formatDuration(sound.duration)}</span>
                  </div>
                  
                  {sound.tags && sound.tags.length > 0 && (
                    <div className="flex items-center space-x-1">
                      <Tag className="w-4 h-4" />
                      <span>{sound.tags.slice(0, 2).join(', ')}</span>
                      {sound.tags.length > 2 && <span>+{sound.tags.length - 2}</span>}
                    </div>
                  )}
                </div>

                {/* Tags */}
                {sound.tags && sound.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {sound.tags.slice(0, 5).map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                    {sound.tags.length > 5 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-md text-xs">
                        +{sound.tags.length - 5} more
                      </span>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center space-x-2 pt-2">
                  <button
                    onClick={() => onPlaySound(sound.id)}
                    className="text-xs bg-primary-500 text-white px-3 py-1 rounded-md hover:bg-primary-600 transition-colors"
                  >
                    {currentlyPlaying === sound.id ? 'Pause' : 'Play'}
                  </button>
                  
                  <a
                    href={sound.audioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs bg-gray-500 text-white px-3 py-1 rounded-md hover:bg-gray-600 transition-colors flex items-center space-x-1"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Match indicator */}
            <div className="mt-4 pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">
                  Match confidence: {getConfidenceIcon(sound.confidence || 0)} {formatConfidence(sound.confidence || 0)}
                </span>
                <span className="text-gray-400">
                  Result #{index + 1}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 