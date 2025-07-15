const weaviateLib = require('weaviate-ts-client');
const weaviate = weaviateLib.default;
require('dotenv').config({ path: '.env.local' });

async function checkObjects() {
  try {
    const weaviateUrl = process.env.WEAVIATE_URL || 'http://localhost:8080';
    const weaviateApiKey = process.env.WEAVIATE_API_KEY;
    const openaiApiKey = process.env.OPENAI_API_KEY;

    const clientConfig = {
      scheme: weaviateUrl.startsWith('https') ? 'https' : 'http',
      host: weaviateUrl.replace(/(https?:\/\/)/, ''),
      headers: {
        'X-OpenAI-Api-Key': openaiApiKey,
      },
    };

    if (weaviateApiKey) {
      clientConfig.apiKey = new weaviateLib.ApiKey(weaviateApiKey);
    }

    const client = weaviate.client(clientConfig);

    console.log('Fetching all SoundBite objects...');
    const objects = await client.graphql
      .get()
      .withClassName('SoundBite')
      .withFields('title description audioUrl')
      .do();

    const soundBites = objects.data?.Get?.SoundBite || [];
    console.log(`\nFound ${soundBites.length} SoundBite objects:`);
    
    soundBites.forEach((obj, index) => {
      console.log(`${index + 1}. Title: "${obj.title}"`);
      console.log(`   Description: "${obj.description}"`);
      console.log(`   Audio URL: "${obj.audioUrl}"`);
      console.log('');
    });

  } catch (error) {
    console.error('Error:', error);
  }
}

checkObjects(); 