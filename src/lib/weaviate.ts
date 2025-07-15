import weaviate, { WeaviateClient } from 'weaviate-ts-client';
import { getEnvVar } from './utils';
import { SoundBite, WeaviateSearchResult, WeaviateQueryResponse } from '@/types';
import { calculateConfidence } from './utils';

// Initialize Weaviate client
let client: WeaviateClient;

export function getWeaviateClient(): WeaviateClient {
  // Always create a fresh client to avoid caching issues
  const weaviateUrl = getEnvVar('WEAVIATE_URL');
  const weaviateApiKey = process.env.WEAVIATE_API_KEY;
  const openaiApiKey = getEnvVar('OPENAI_API_KEY');
  
  if (!openaiApiKey) {
    throw new Error('OPENAI_API_KEY environment variable is required for Weaviate vectorizer');
  }

  const clientConfig = {
    scheme: weaviateUrl.startsWith('https') ? 'https' : 'http',
    host: weaviateUrl.replace(/(https?:\/\/)/, ''),
    headers: {
      'X-OpenAI-Api-Key': openaiApiKey, // Add OpenAI API key for vectorizer
    },
  };

  if (weaviateApiKey) {
    return weaviate.client({
      ...clientConfig,
      apiKey: new weaviate.ApiKey(weaviateApiKey),
    });
  } else {
    return weaviate.client(clientConfig);
  }
}

// Search for sounds using semantic similarity
export async function searchSounds(
  query: string,
  limit: number = 10,
  threshold: number = 0.7
): Promise<SoundBite[]> {
  try {
    const client = getWeaviateClient();
    
    const result = await client.graphql
      .get()
      .withClassName('SoundBite')
      .withFields('title description audioUrl tags duration _additional { distance certainty id }')
      .withNearText({ concepts: [query] })
      .withLimit(limit)
      .do();

    const searchResults = result.data?.Get?.SoundBite || [];
    
    // Convert Weaviate results to SoundBite format
    const soundBites: SoundBite[] = searchResults
      .filter((item: WeaviateSearchResult) => {
        const confidence = calculateConfidence(item._additional.distance);
        return confidence >= threshold * 100;
      })
      .map((item: WeaviateSearchResult) => ({
        id: item._additional.id,
        title: item.title,
        description: item.description,
        audioUrl: item.audioUrl,
        tags: item.tags || [],
        duration: item.duration,
        confidence: calculateConfidence(item._additional.distance),
      }))
      .sort((a: SoundBite, b: SoundBite) => (b.confidence || 0) - (a.confidence || 0));

    return soundBites;
  } catch (error) {
    console.error('Weaviate search error:', error);
    throw new Error(`Failed to search sounds: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Create SoundBite schema in Weaviate
export async function createSoundBiteSchema(): Promise<void> {
  try {
    const client = getWeaviateClient();
    
    const schemaConfig = {
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

    await client.schema.classCreator().withClass(schemaConfig).do();
  } catch (error) {
    console.error('Schema creation error:', error);
    throw new Error(`Failed to create schema: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Add a sound bite to Weaviate
export async function addSoundBite(soundBite: Omit<SoundBite, 'id' | 'confidence'>): Promise<string> {
  try {
    const client = getWeaviateClient();
    
    const result = await client.data
      .creator()
      .withClassName('SoundBite')
      .withProperties(soundBite)
      .do();

    return result.id || '';
  } catch (error) {
    console.error('Add sound bite error:', error);
    throw new Error(`Failed to add sound bite: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Batch import sound bites
export async function batchImportSoundBites(soundBites: Omit<SoundBite, 'id' | 'confidence'>[]): Promise<void> {
  try {
    const client = getWeaviateClient();
    
    const batcher = client.batch.objectsBatcher();
    
    soundBites.forEach(soundBite => {
      batcher.withObject({
        class: 'SoundBite',
        properties: soundBite,
      });
    });

    await batcher.do();
  } catch (error) {
    console.error('Batch import error:', error);
    throw new Error(`Failed to batch import: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Test Weaviate connection
export async function testWeaviateConnection(): Promise<boolean> {
  try {
    const client = getWeaviateClient();
    await client.misc.metaGetter().do();
    return true;
  } catch {
    return false;
  }
}

// Get Weaviate schema
export async function getWeaviateSchema(): Promise<any> {
  try {
    const client = getWeaviateClient();
    return await client.schema.getter().do();
  } catch (error) {
    console.error('Get schema error:', error);
    throw new Error(`Failed to get schema: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Check if SoundBite class exists
export async function soundBiteSchemaExists(): Promise<boolean> {
  try {
    const schema = await getWeaviateSchema();
    return schema.classes?.some((cls: any) => cls.class === 'SoundBite') || false;
  } catch {
    return false;
  }
}

// Delete all sound bites (for testing)
export async function clearSoundBites(): Promise<void> {
  try {
    const client = getWeaviateClient();
    await client.schema.classDeleter().withClassName('SoundBite').do();
  } catch (error) {
    console.error('Clear sound bites error:', error);
    throw new Error(`Failed to clear sound bites: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
} 