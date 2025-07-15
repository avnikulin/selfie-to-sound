'use client';

import { useState, useEffect } from 'react';
import { Upload, Database, FileText, Tag, Clock, HardDrive } from 'lucide-react';

interface SchemaProperty {
  name: string;
  dataType: string[];
  description: string;
}

interface SchemaClass {
  class: string;
  description: string;
  vectorizer: string;
  properties: SchemaProperty[];
  objectCount: number;
  moduleConfig?: any;
}

interface Schema {
  classes: SchemaClass[];
}

export default function AdminPage() {
  const [schema, setSchema] = useState<Schema | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [tags, setTags] = useState('');
  const [duration, setDuration] = useState('');

  useEffect(() => {
    fetchSchema();
  }, []);

  const fetchSchema = async () => {
    try {
      const response = await fetch('/api/schema');
      const data = await response.json();
      if (data.success) {
        setSchema(data.schema);
      }
    } catch (error) {
      console.error('Failed to fetch schema:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!title || !description || !audioUrl || !duration) {
      setUploadStatus({ type: 'error', message: 'Please fill in all required fields' });
      return;
    }

    setUploadLoading(true);
    setUploadStatus(null);

    try {
      const response = await fetch('/api/upload-sound', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          audioUrl,
          tags,
          duration: parseFloat(duration),
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setUploadStatus({ type: 'success', message: 'Sound bite uploaded successfully!' });
        // Reset form
        setTitle('');
        setDescription('');
        setAudioUrl('');
        setTags('');
        setDuration('');
        // Refresh schema to update counts
        fetchSchema();
      } else {
        setUploadStatus({ type: 'error', message: data.error || 'Upload failed' });
      }
    } catch (error) {
      setUploadStatus({ type: 'error', message: 'Upload failed' });
    } finally {
      setUploadLoading(false);
    }
  };

  const getDataTypeIcon = (dataType: string[]) => {
    const type = dataType[0];
    switch (type) {
      case 'string':
      case 'text':
        return <FileText className="w-4 h-4" />;
      case 'string[]':
        return <Tag className="w-4 h-4" />;
      case 'number':
        return <HardDrive className="w-4 h-4" />;
      case 'blob':
        return <FileText className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading schema...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-3">
            <Database className="w-10 h-10" />
            Weaviate Admin
          </h1>
          <p className="text-purple-200">Schema Management & Image Upload</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Schema Display */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
              <Database className="w-6 h-6" />
              Schema Overview
            </h2>
            
            {schema?.classes?.map((schemaClass) => (
              <div key={schemaClass.class} className="mb-6 bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-semibold text-white">{schemaClass.class}</h3>
                  <div className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm">
                    {schemaClass.objectCount} objects
                  </div>
                </div>
                
                <p className="text-purple-200 mb-3">{schemaClass.description}</p>
                
                <div className="mb-3">
                  <span className="text-sm text-purple-300">Vectorizer: </span>
                  <span className="text-white">{schemaClass.vectorizer}</span>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-purple-300 mb-2">Properties:</h4>
                  {schemaClass.properties.map((prop) => (
                    <div key={prop.name} className="flex items-center gap-2 bg-white/5 rounded-lg p-2">
                      {getDataTypeIcon(prop.dataType)}
                      <span className="text-white font-medium">{prop.name}</span>
                      <span className="text-purple-300 text-sm">({prop.dataType.join(', ')})</span>
                      <span className="text-purple-200 text-sm ml-auto">{prop.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Sound Bite Upload */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
              <Upload className="w-6 h-6" />
              Upload Sound Bite
            </h2>

            <form onSubmit={handleUpload} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-purple-400 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter sound bite title"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  Description *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-white/10 border border-purple-400 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Detailed description of the sound"
                />
              </div>

              {/* Audio URL */}
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  Audio URL *
                </label>
                <input
                  type="text"
                  value={audioUrl}
                  onChange={(e) => setAudioUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-purple-400 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="/audio/confused-clumsy.wav or https://example.com/audio.mp3"
                />
                <p className="text-xs text-purple-300 mt-1">
                  For local files: Put files in <code className="bg-white/10 px-1 rounded">public/audio/</code> folder and use <code className="bg-white/10 px-1 rounded">/audio/filename.wav</code>
                </p>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  Duration (seconds) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-purple-400 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="120.5"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-purple-400 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="ambient, nature, peaceful"
                />
              </div>

              {/* Status Message */}
              {uploadStatus && (
                <div className={`p-3 rounded-lg ${
                  uploadStatus.type === 'success' 
                    ? 'bg-green-500/20 text-green-200 border border-green-500/30' 
                    : 'bg-red-500/20 text-red-200 border border-red-500/30'
                }`}>
                  {uploadStatus.message}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={uploadLoading}
                className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploadLoading ? 'Uploading...' : 'Upload Sound Bite'}
              </button>
            </form>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 text-center">
          <a
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-md rounded-lg text-white hover:bg-white/20 transition-colors"
          >
            ← Back to VibSeek
          </a>
        </div>
      </div>
    </div>
  );
} 