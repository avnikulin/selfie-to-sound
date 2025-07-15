// Image and upload types
export interface ImageUpload {
  file: File;
  preview: string;
  status: 'uploading' | 'analyzing' | 'complete' | 'error';
}

export interface ImageAnalysisRequest {
  imageData: string; // base64 encoded image
  fileName: string;
  mimeType: string;
}

export interface ImageAnalysisResponse {
  success: boolean;
  description?: string;
  error?: string;
  processingTime?: number;
}

// Sound and audio types
export interface SoundBite {
  id: string;
  title: string;
  description: string;
  audioUrl: string;
  tags: string[];
  duration: number;
  confidence?: number;
}

export interface SoundSearchRequest {
  query: string;
  limit?: number;
  threshold?: number;
}

export interface SoundSearchResponse {
  success: boolean;
  results?: SoundBite[];
  totalCount?: number;
  error?: string;
  processingTime?: number;
}

// Weaviate types
export interface WeaviateSearchResult {
  _additional: {
    distance: number;
    certainty: number;
    id: string;
  };
  title: string;
  description: string;
  audioUrl: string;
  tags: string[];
  duration: number;
}

export interface WeaviateQueryResponse {
  data: {
    Get: {
      SoundBite: WeaviateSearchResult[];
    };
  };
}

// OpenAI types
export interface OpenAIVisionRequest {
  model: string;
  messages: {
    role: 'user' | 'system';
    content: Array<{
      type: 'text' | 'image_url';
      text?: string;
      image_url?: {
        url: string;
      };
    }>;
  }[];
  max_tokens: number;
}

export interface OpenAIVisionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// UI State types
export interface AppState {
  uploadedImage: ImageUpload | null;
  isAnalyzing: boolean;
  analysisResult: string | null;
  soundResults: SoundBite[];
  isSearching: boolean;
  error: string | null;
  currentlyPlaying: string | null;
}

export interface AudioPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isLoading: boolean;
  error: string | null;
}

// Configuration types
export interface AppConfig {
  maxFileSize: number;
  supportedFormats: string[];
  apiEndpoints: {
    analyzeImage: string;
    searchSounds: string;
  };
  weaviate: {
    url: string;
    apiKey?: string;
  };
  openai: {
    apiKey: string;
    model: string;
  };
}

// Error types
export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export interface ValidationError {
  field: string;
  message: string;
}

// Utility types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface ProcessingStep {
  name: string;
  status: LoadingState;
  message?: string;
  duration?: number;
}

// Component prop types
export interface ImageUploadProps {
  onImageUpload: (file: File) => void;
  isUploading?: boolean;
  error?: string | null;
  maxFileSize?: number;
  supportedFormats?: string[];
}

export interface SoundResultsProps {
  results: SoundBite[];
  isLoading?: boolean;
  onPlaySound: (soundId: string) => void;
  currentlyPlaying?: string | null;
}

export interface AudioPlayerProps {
  soundBite: SoundBite;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  volume?: number;
  onVolumeChange?: (volume: number) => void;
} 