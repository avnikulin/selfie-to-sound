const weaviateLib = require('weaviate-ts-client');
const weaviate = weaviateLib.default;
require('dotenv').config({ path: '.env.local' });

// Initialize Weaviate client from environment
const weaviateUrl = process.env.WEAVIATE_URL || 'http://localhost:8080';
const weaviateApiKey = process.env.WEAVIATE_API_KEY;
const openaiApiKey = process.env.OPENAI_API_KEY;

if (!openaiApiKey) {
  console.error('❌ Error: OPENAI_API_KEY environment variable is required for vectorizer');
  process.exit(1);
}

console.log('🔗 Connecting to Weaviate at:', weaviateUrl);

const clientConfig = {
  scheme: weaviateUrl.startsWith('https') ? 'https' : 'http',
  host: weaviateUrl.replace(/(https?:\/\/)/, ''),
  headers: {
    'X-OpenAI-Api-Key': openaiApiKey, // Add OpenAI API key for vectorizer
  },
};

if (weaviateApiKey) {
  clientConfig.apiKey = new weaviateLib.ApiKey(weaviateApiKey);
  console.log('🔑 Using API key for authentication');
}

console.log('🔑 Using OpenAI API key for vectorizer');
const client = weaviate.client(clientConfig);

// SoundBite schema
const soundBiteSchema = {
  class: 'SoundBite',
  description: 'A sound bite with audio content and metadata',
  vectorizer: 'text2vec-openai',
  moduleConfig: {
    'text2vec-openai': {
      model: 'ada',
      modelVersion: '002',
      type: 'text',
    },
  },
  properties: [
    {
      dataType: ['string'],
      description: 'The title of the sound bite',
      name: 'title',
    },
    {
      dataType: ['text'],
      description: 'Detailed description of the sound',
      name: 'description',
    },
    {
      dataType: ['string'],
      description: 'URL to the audio file',
      name: 'audioUrl',
    },
    {
      dataType: ['string[]'],
      description: 'Tags associated with the sound',
      name: 'tags',
    },
    {
      dataType: ['number'],
      description: 'Duration of the sound in seconds',
      name: 'duration',
    },
  ],
};

// Sample sound data
const sampleSounds = [
  {
    title: "City Traffic Ambience",
    description: "Busy city street with cars passing, engines rumbling, distant horns, and urban background noise. Perfect for urban scenes and metropolitan environments.",
    audioUrl: "https://example.com/city-traffic.mp3",
    tags: ["urban", "traffic", "cars", "city", "ambient"],
    duration: 120
  },
  {
    title: "Forest Birds Chirping",
    description: "Peaceful forest soundscape with various bird species chirping, leaves rustling in gentle breeze, and natural woodland atmosphere.",
    audioUrl: "https://example.com/forest-birds.mp3",
    tags: ["nature", "birds", "forest", "peaceful", "ambient"],
    duration: 180
  },
  {
    title: "Ocean Waves on Beach",
    description: "Relaxing ocean waves washing against sandy beach, seagulls in distance, gentle sea breeze and coastal atmosphere.",
    audioUrl: "https://example.com/ocean-waves.mp3",
    tags: ["ocean", "waves", "beach", "water", "relaxing"],
    duration: 200
  },
  {
    title: "Rain on Roof",
    description: "Steady rainfall hitting roof tiles, gentle patter, occasional thunder rumble in distance, creating cozy indoor atmosphere.",
    audioUrl: "https://example.com/rain-roof.mp3",
    tags: ["rain", "weather", "roof", "cozy", "thunder"],
    duration: 300
  },
  {
    title: "Footsteps on Gravel",
    description: "Person walking on gravel path, steady rhythm, crunching stones, outdoor footsteps with natural reverb.",
    audioUrl: "https://example.com/footsteps-gravel.mp3",
    tags: ["footsteps", "walking", "gravel", "outdoor", "human"],
    duration: 45
  },
  {
    title: "Coffee Shop Ambience",
    description: "Busy coffee shop atmosphere with espresso machine hissing, customers chatting, cups clinking, and urban café vibe.",
    audioUrl: "https://example.com/coffee-shop.mp3",
    tags: ["coffee", "café", "social", "urban", "ambient"],
    duration: 240
  },
  {
    title: "Crackling Fireplace",
    description: "Warm fireplace with wood crackling, flames dancing, occasional pop of burning logs, cozy indoor atmosphere.",
    audioUrl: "https://example.com/fireplace.mp3",
    tags: ["fire", "fireplace", "warm", "cozy", "indoor"],
    duration: 360
  },
  {
    title: "Keyboard Typing",
    description: "Fast typing on mechanical keyboard, rapid key presses, office work sound, productive computer activity.",
    audioUrl: "https://example.com/typing.mp3",
    tags: ["typing", "keyboard", "office", "computer", "work"],
    duration: 30
  },
  {
    title: "Wind Through Trees",
    description: "Strong wind blowing through tree branches, leaves rustling intensely, natural outdoor wind sound.",
    audioUrl: "https://example.com/wind-trees.mp3",
    tags: ["wind", "trees", "nature", "outdoor", "weather"],
    duration: 150
  },
  {
    title: "Dog Barking",
    description: "Medium-sized dog barking repeatedly, alert and energetic, typical domestic dog sounds in neighborhood setting.",
    audioUrl: "https://example.com/dog-barking.mp3",
    tags: ["dog", "barking", "animal", "pet", "domestic"],
    duration: 25
  }
];

async function setupWeaviate() {
  try {
    console.log('🔄 Setting up Weaviate...');
    
    // Test connection
    console.log('🔗 Testing Weaviate connection...');
    const meta = await client.misc.metaGetter().do();
    console.log('✅ Connected to Weaviate version:', meta.version);
    
    // Check if schema already exists
    try {
      const schema = await client.schema.getter().do();
      const soundBiteExists = schema.classes?.some(cls => cls.class === 'SoundBite');
      
      if (soundBiteExists) {
        console.log('⚠️  SoundBite schema already exists. Deleting...');
        await client.schema.classDeleter().withClassName('SoundBite').do();
      }
    } catch (e) {
      console.log('📝 No existing schema found, creating new one...');
    }
    
    // Create schema
    console.log('📝 Creating SoundBite schema...');
    await client.schema.classCreator().withClass(soundBiteSchema).do();
    console.log('✅ Schema created successfully');
    
    // Add sample data
    console.log('📊 Adding sample sound data...');
    const batcher = client.batch.objectsBatcher();
    
    sampleSounds.forEach(sound => {
      batcher.withObject({
        class: 'SoundBite',
        properties: sound,
      });
    });
    
    const result = await batcher.do();
    console.log('✅ Added', sampleSounds.length, 'sample sounds');
    
    // Verify data was added
    const count = await client.graphql
      .aggregate()
      .withClassName('SoundBite')
      .withFields('meta { count }')
      .do();
    
    console.log('📊 Total sounds in database:', count.data.Aggregate.SoundBite[0].meta.count);
    console.log('🎉 Weaviate setup complete!');
    
  } catch (error) {
    console.error('❌ Error setting up Weaviate:', error);
    process.exit(1);
  }
}

setupWeaviate(); 