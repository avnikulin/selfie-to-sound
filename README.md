# VibSeek - Picture to Sound Discovery

A Next.js web application that transforms uploaded images into matching sound files using AI-powered analysis and semantic search.

## 🎯 Features

- **Image Upload**: Modern drag & drop interface with image preview
- **AI Analysis**: Uses OpenAI GPT-4 Vision API to analyze images for audio content
- **Semantic Search**: Leverages Weaviate vector database for finding similar sounds
- **Audio Playback**: Full-featured audio player with controls
- **Responsive Design**: Beautiful, modern UI with glassmorphism effects
- **Real-time Processing**: Live status updates during analysis and search

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- OpenAI API key
- Weaviate instance (local or cloud)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd vibseek
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Edit `.env.local` with your configuration:
   ```env
   OPENAI_API_KEY=sk-your-openai-api-key-here
   WEAVIATE_URL=http://localhost:8080
   WEAVIATE_API_KEY=your-weaviate-api-key-here
   NEXT_PUBLIC_MAX_FILE_SIZE=5000000
   NEXT_PUBLIC_SUPPORTED_FORMATS=image/jpeg,image/png,image/webp,image/gif
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3002](http://localhost:3002)

## 🏗️ Architecture

### Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS with custom components
- **AI Integration**: OpenAI GPT-4 Vision API
- **Vector Database**: Weaviate
- **File Upload**: react-dropzone
- **Icons**: Lucide React

### Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── analyze-image/route.ts    # OpenAI Vision API integration
│   │   └── search-sounds/route.ts    # Weaviate search endpoint
│   ├── layout.tsx                    # Root layout
│   ├── page.tsx                      # Main application page
│   └── globals.css                   # Global styles
├── components/
│   ├── ImageUpload.tsx               # Drag & drop upload component
│   ├── SoundResults.tsx              # Sound results display
│   └── AudioPlayer.tsx               # Audio playback component
├── lib/
│   ├── openai.ts                     # OpenAI client configuration
│   ├── weaviate.ts                   # Weaviate client and operations
│   └── utils.ts                      # Utility functions
└── types/
    └── index.ts                      # TypeScript type definitions
```

## 🔧 Configuration

### OpenAI Setup

1. Get an API key from [OpenAI](https://platform.openai.com/api-keys)
2. Add it to your `.env.local` file
3. The app uses GPT-4 Vision for image analysis

### Weaviate Setup

**Option 1: Local Weaviate (Docker)**
```bash
docker run -d \
  --name weaviate \
  -p 8080:8080 \
  -e AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED=true \
  -e PERSISTENCE_DATA_PATH=/var/lib/weaviate \
  -e DEFAULT_VECTORIZER_MODULE=text2vec-openai \
  -e ENABLE_MODULES=text2vec-openai \
  -e OPENAI_APIKEY=your-openai-key \
  semitechnologies/weaviate:latest
```

**Option 2: Weaviate Cloud Service**
1. Sign up at [Weaviate Cloud](https://console.weaviate.cloud/)
2. Create a cluster
3. Use the provided URL and API key

### Data Population

The app expects a Weaviate schema with the following structure:

```json
{
  "class": "SoundBite",
  "properties": [
    { "name": "title", "dataType": ["string"] },
    { "name": "description", "dataType": ["text"] },
    { "name": "audioUrl", "dataType": ["string"] },
    { "name": "tags", "dataType": ["string[]"] },
    { "name": "duration", "dataType": ["number"] }
  ],
  "vectorizer": "text2vec-openai"
}
```

## 🎨 UI Components

### ImageUpload Component
- Drag & drop functionality
- File validation
- Image preview
- Upload progress

### SoundResults Component
- Grid layout with sound items
- Confidence scores
- Play/pause buttons
- Sound metadata display

### AudioPlayer Component
- Full audio controls
- Progress bar
- Volume control
- Skip forward/backward

## 🔄 API Endpoints

### POST /api/analyze-image
Analyzes uploaded images using OpenAI Vision API.

**Request**: FormData with image file
**Response**:
```json
{
  "success": true,
  "description": "Audio-focused description of the image",
  "processingTime": 1234
}
```

### POST /api/search-sounds
Searches for matching sounds using Weaviate.

**Request**:
```json
{
  "query": "Audio description text",
  "limit": 10,
  "threshold": 0.7
}
```

**Response**:
```json
{
  "success": true,
  "results": [
    {
      "id": "sound-id",
      "title": "Sound Title",
      "description": "Sound description",
      "audioUrl": "https://example.com/sound.mp3",
      "tags": ["tag1", "tag2"],
      "duration": 30,
      "confidence": 85
    }
  ]
}
```

## 🧪 Testing

Run the development server and test the complete flow:

1. Upload an image
2. Wait for AI analysis
3. Review sound results
4. Play audio files

## 📱 Responsive Design

The app is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones

## 🔒 Security

- File upload validation
- API key protection
- Input sanitization
- Rate limiting ready

## 📝 Development Notes

### Key Features Implemented

✅ Next.js 14 with App Router
✅ TypeScript throughout
✅ Tailwind CSS styling
✅ OpenAI Vision API integration
✅ Weaviate vector search
✅ Drag & drop file upload
✅ Audio player with controls
✅ Responsive design
✅ Error handling
✅ Loading states

### Future Enhancements

- [ ] User authentication
- [ ] Sound favorites/bookmarks
- [ ] Batch image processing
- [ ] Audio visualization
- [ ] Search history
- [ ] Mobile app version

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- OpenAI for the Vision API
- Weaviate for the vector database
- Next.js team for the framework
- Tailwind CSS for the styling system 