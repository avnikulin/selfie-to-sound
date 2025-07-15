'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image as ImageIcon, AlertCircle, CheckCircle2, Camera } from 'lucide-react';
import { validateImageFile, formatFileSize } from '@/lib/utils';
import { ImageUploadProps } from '@/types';
import WebcamCapture from './WebcamCapture';

type TabType = 'upload' | 'camera';

export default function ImageUpload({
  onImageUpload,
  isUploading = false,
  error = null,
  maxFileSize = 5000000,
  supportedFormats = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
}: ImageUploadProps) {
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('upload');

  const handleImageFromFile = useCallback((file: File) => {
    const validation = validateImageFile(file);
    if (validation.isValid) {
      setUploadedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      onImageUpload(file);
    }
  }, [onImageUpload]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      handleImageFromFile(file);
    }
  }, [handleImageFromFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
    },
    maxSize: maxFileSize,
    multiple: false,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
  });

  const removeImage = () => {
    setUploadedImage(null);
    setPreview(null);
    setDragActive(false);
  };

  const handleCameraCapture = (file: File) => {
    console.log('[ImageUpload] Camera captured file:', file.name, file.size);
    handleImageFromFile(file);
    // Optionally switch back to upload tab to show the result
    setActiveTab('upload');
  };

  const getStatusIcon = () => {
    if (error) return <AlertCircle className="w-5 h-5 text-red-500" />;
    if (isUploading) return <div className="loading-dots text-blue-500"></div>;
    if (uploadedImage) return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    return <Upload className="w-8 h-8 text-gray-400" />;
  };

  const getStatusText = () => {
    if (error) return error;
    if (isUploading) return 'Analyzing image...';
    if (uploadedImage) return `Uploaded: ${uploadedImage.name}`;
    return 'Drag & drop an image here, or click to select';
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="space-y-4">
        {/* Tab Navigation */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md font-medium transition-colors ${
              activeTab === 'upload'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Upload File</span>
          </button>
          <button
            onClick={() => setActiveTab('camera')}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md font-medium transition-colors ${
              activeTab === 'camera'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Take Photo</span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'upload' && (
          <>
            {/* Upload Area */}
            <div
              {...getRootProps()}
              className={`
                upload-area
                ${isDragActive || dragActive ? 'dragover' : ''}
                ${isUploading ? 'pointer-events-none opacity-50' : ''}
                ${error ? 'border-red-300 bg-red-50' : ''}
                ${uploadedImage ? 'border-green-300 bg-green-50' : ''}
              `}
            >
              <input {...getInputProps()} />
              
              <div className="flex flex-col items-center space-y-4">
                {preview ? (
                  <div className="relative">
                    <img
                      src={preview}
                      alt="Preview"
                      className="max-w-xs max-h-48 rounded-lg shadow-lg"
                    />
                    {!isUploading && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage();
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-2">
                    <div className="p-4 bg-gray-100 rounded-full">
                      <ImageIcon className="w-12 h-12 text-gray-400" />
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-medium text-gray-700">
                        Drop your image here
                      </p>
                      <p className="text-sm text-gray-500">
                        or click to browse files
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center justify-center space-x-2">
              {getStatusIcon()}
              <span className={`text-sm font-medium ${
                error ? 'text-red-600' : 
                uploadedImage ? 'text-green-600' : 
                'text-gray-600'
              }`}>
                {getStatusText()}
              </span>
            </div>

            {/* File Info */}
            {uploadedImage && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">File Details</span>
                  <span className="text-xs text-gray-500">
                    {formatFileSize(uploadedImage.size)}
                  </span>
                </div>
                <div className="text-xs text-gray-600">
                  <p><span className="font-medium">Name:</span> {uploadedImage.name}</p>
                  <p><span className="font-medium">Type:</span> {uploadedImage.type}</p>
                  <p><span className="font-medium">Size:</span> {formatFileSize(uploadedImage.size)}</p>
                </div>
              </div>
            )}

            {/* Format Info */}
            <div className="text-center text-xs text-gray-500">
              <p>Supported formats: {supportedFormats.join(', ')}</p>
              <p>Maximum file size: {formatFileSize(maxFileSize)}</p>
            </div>
          </>
        )}

        {activeTab === 'camera' && (
          <WebcamCapture 
            onPhotoCapture={handleCameraCapture}
            isDisabled={isUploading}
          />
        )}
      </div>
    </div>
  );
} 