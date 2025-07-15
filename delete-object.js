const weaviateLib = require('weaviate-ts-client');
const weaviate = weaviateLib.default;
require('dotenv').config({ path: '.env.local' });

async function deleteObject() {
  try {
    const objectId = '032b652e-df23-4c49-b7e1-a2b7f4530211';
    
    console.log(`Attempting to delete object with ID: ${objectId}`);
    
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

    // First, check if the object exists and get its details
    console.log('\n1. Checking if object exists...');
    try {
      const object = await client.data
        .getterById()
        .withId(objectId)
        .do();
      
      console.log('Found object:');
      console.log(`- Class: ${object.class}`);
      console.log(`- Title: ${object.properties?.title || 'N/A'}`);
      console.log(`- Description: ${object.properties?.description || 'N/A'}`);
    } catch (error) {
      console.log('Object not found or error retrieving:', error.message);
      return;
    }

    // Delete the object
    console.log('\n2. Deleting object...');
    const result = await client.data
      .deleter()
      .withId(objectId)
      .do();

    console.log('Delete result:', result);
    console.log('✅ Object deleted successfully!');

    // Verify deletion
    console.log('\n3. Verifying deletion...');
    try {
      await client.data
        .getterById()
        .withId(objectId)
        .do();
      console.log('⚠️  Object still exists (unexpected)');
    } catch (error) {
      console.log('✅ Confirmed: Object no longer exists');
    }

    // Count remaining objects
    console.log('\n4. Counting remaining SoundBite objects...');
    const objects = await client.graphql
      .get()
      .withClassName('SoundBite')
      .withFields('title')
      .do();

    const soundBites = objects.data?.Get?.SoundBite || [];
    console.log(`Remaining SoundBite objects: ${soundBites.length}`);
    
    soundBites.forEach((obj, index) => {
      console.log(`${index + 1}. "${obj.title}"`);
    });

  } catch (error) {
    console.error('Error deleting object:', error);
  }
}

deleteObject(); 