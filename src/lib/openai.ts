import OpenAI from 'openai';
import { getEnvVar } from './utils';

// Initialize OpenAI client lazily
let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openai) {
    openai = new OpenAI({
      apiKey: getEnvVar('OPENAI_API_KEY'),
    });
  }
  return openai;
}

// Audio-focused prompt for image analysis
const AUDIO_ANALYSIS_PROMPT = `
This GPT analyzes a user's facial expression from a selfie and delivers a short, funny one-liner that corresponds to their expression, followed by a matching sound strictly chosen from a fixed set of 20 known meme audio clips. Each sound has predefined tags that determine when it should be selected. The one-liner is no longer a fixed punchline but should be freshly generated each time to match the sound's mood and the user's expression. The GPT must still select from only these 10 sounds using the exact matching hashtags and cannot invent or vary the tag lists. The tone remains humorous, light, and brief.
`;

export async function analyzeImageForAudio(imageBase64: string): Promise<string> {
  try {
    const client = getOpenAIClient();
    const response = await client.chat.completions.create({
      model: 'chatgpt-4o-latest',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: AUDIO_ANALYSIS_PROMPT,
            },
            {
              type: 'image_url',
              image_url: {
                url: imageBase64,
              },
            },
          ],
        },
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const description = response.choices[0]?.message?.content;
    if (!description) {
      throw new Error('No description generated from OpenAI');
    }

    return description;
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error(`Failed to analyze image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Note: Image to base64 conversion is now handled server-side in API routes
// to avoid browser-specific APIs like FileReader in Node.js environment

// Validate OpenAI API key
export function validateOpenAIConfig(): boolean {
  try {
    const apiKey = getEnvVar('OPENAI_API_KEY');
    return apiKey.startsWith('sk-') && apiKey.length > 20;
  } catch {
    return false;
  }
}

// Test OpenAI connection
export async function testOpenAIConnection(): Promise<boolean> {
  try {
    const client = getOpenAIClient();
    await client.models.list();
    return true;
  } catch {
    return false;
  }
} 