'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Camera, StopCircle, AlertCircle, CheckCircle2 } from 'lucide-react';

interface WebcamCaptureProps {
  onPhotoCapture: (file: File) => void;
  isDisabled?: boolean;
}

export default function WebcamCapture({ onPhotoCapture, isDisabled = false }: WebcamCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const photoRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPhoto, setHasPhoto] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  // Debug logging function
  const addDebugLog = (message: string) => {
    console.log(`[WebcamCapture] ${message}`);
    setDebugInfo(prev => [...prev.slice(-4), `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    const enableStream = async () => {
      addDebugLog('Attempting to access webcam...');
      setIsLoading(true);
      setError(null);

      try {
        // Check if getUserMedia is supported
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('getUserMedia is not supported in this browser');
        }

        addDebugLog('Requesting camera permissions...');
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user' // Front camera for selfies
          } 
        });
        
        addDebugLog(`Stream obtained: ${mediaStream.getVideoTracks().length} video tracks`);
        setStream(mediaStream);
        
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          addDebugLog('Video element source set');
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error("Error accessing webcam:", err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error accessing webcam';
        setError(errorMessage);
        addDebugLog(`Error: ${errorMessage}`);
        setIsLoading(false);
      }
    };

    enableStream();

    // Cleanup function to stop the stream when the component unmounts
    return () => {
      addDebugLog('Cleaning up webcam stream...');
      if (stream) {
        stream.getTracks().forEach(track => {
          track.stop();
          addDebugLog(`Stopped track: ${track.kind}`);
        });
      }
    };
  }, []); // Remove stream from dependency array to avoid infinite loop

  const takePhoto = () => {
    addDebugLog('Taking photo...');
    
    if (!videoRef.current || !canvasRef.current) {
      addDebugLog('Error: Video or canvas ref not available');
      setError('Camera not properly initialized');
      return;
    }

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (!context) {
        throw new Error('Could not get canvas context');
      }

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      
      addDebugLog(`Canvas size: ${canvas.width}x${canvas.height}`);
      addDebugLog(`Video size: ${video.videoWidth}x${video.videoHeight}`);

      // Draw the video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert to data URL and display
      const dataURL = canvas.toDataURL('image/jpeg', 0.8);
      addDebugLog(`Photo captured, data URL length: ${dataURL.length}`);
      
      if (photoRef.current) {
        photoRef.current.src = dataURL;
        setHasPhoto(true);
        addDebugLog('Photo displayed in img element');
      }

      // Convert to File object for upload
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `webcam-photo-${Date.now()}.jpg`, { 
            type: 'image/jpeg',
            lastModified: Date.now()
          });
          addDebugLog(`File created: ${file.name}, size: ${file.size} bytes`);
          onPhotoCapture(file);
        } else {
          addDebugLog('Error: Failed to create blob from canvas');
          setError('Failed to create image file');
        }
      }, 'image/jpeg', 0.8);

    } catch (err) {
      console.error('Error taking photo:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error taking photo';
      setError(errorMessage);
      addDebugLog(`Photo capture error: ${errorMessage}`);
    }
  };

  const stopCamera = () => {
    addDebugLog('Stopping camera...');
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
        addDebugLog(`Stopped ${track.kind} track`);
      });
      setStream(null);
    }
    setHasPhoto(false);
    if (photoRef.current) {
      photoRef.current.src = '';
    }
  };

  const retakePhoto = () => {
    addDebugLog('Retaking photo...');
    setHasPhoto(false);
    if (photoRef.current) {
      photoRef.current.src = '';
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* Status indicators */}
      <div className="flex items-center justify-center space-x-2 text-sm">
        {isLoading && (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-blue-600">Initializing camera...</span>
          </>
        )}
        {error && (
          <>
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="text-red-600">{error}</span>
          </>
        )}
        {stream && !error && !isLoading && (
          <>
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span className="text-green-600">Camera ready</span>
          </>
        )}
      </div>

      {/* Video preview */}
      <div className="relative bg-black rounded-lg overflow-hidden">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline
          muted
          className="w-full h-auto"
          onLoadedMetadata={() => addDebugLog('Video metadata loaded')}
          onCanPlay={() => addDebugLog('Video can play')}
        />
      </div>

      {/* Photo preview */}
      {hasPhoto && (
        <div className="relative bg-gray-100 rounded-lg overflow-hidden">
          <img 
            ref={photoRef} 
            alt="Captured Photo" 
            className="w-full h-auto rounded-lg"
          />
        </div>
      )}

      {/* Controls */}
      <div className="flex justify-center space-x-4">
        {!hasPhoto ? (
          <>
            <button
              onClick={takePhoto}
              disabled={isDisabled || isLoading || !stream || !!error}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <Camera className="w-5 h-5" />
              <span>📸 Capture Photo</span>
            </button>
            <button
              onClick={stopCamera}
              disabled={isDisabled || !stream}
              className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <StopCircle className="w-5 h-5" />
              <span>🛑 Stop Camera</span>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={retakePhoto}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <Camera className="w-5 h-5" />
              <span>🔄 Retake</span>
            </button>
          </>
        )}
      </div>

      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Debug information */}
      {debugInfo.length > 0 && (
        <div className="bg-gray-100 rounded-lg p-4 space-y-1">
          <h4 className="text-sm font-medium text-gray-700">Debug Log:</h4>
          {debugInfo.map((log, index) => (
            <p key={index} className="text-xs text-gray-600 font-mono">
              {log}
            </p>
          ))}
        </div>
      )}
    </div>
  );
} 