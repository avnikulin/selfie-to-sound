import { NextRequest, NextResponse } from 'next/server';
import { getWeaviateClient } from '@/lib/weaviate';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, audioUrl, tags, duration } = body;
    
    if (!title || !description || !audioUrl || !duration) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: title, description, audioUrl, duration' },
        { status: 400 }
      );
    }
    
    // Validate duration is a number
    const durationNum = parseFloat(duration);
    if (isNaN(durationNum) || durationNum <= 0) {
      return NextResponse.json(
        { success: false, error: 'Duration must be a positive number' },
        { status: 400 }
      );
    }
    
    // Parse tags - ensure it's an array
    let tagArray: string[] = [];
    if (tags) {
      if (typeof tags === 'string') {
        tagArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      } else if (Array.isArray(tags)) {
        tagArray = tags.map(tag => String(tag).trim()).filter(tag => tag.length > 0);
      }
    }
    
    const client = getWeaviateClient();
    
    // Create the sound bite object
    const soundBiteObject = {
      title,
      description,
      audioUrl,
      tags: tagArray,
      duration: durationNum,
    };
    
    // Insert into SoundBite class
    const result = await client.data
      .creator()
      .withClassName('SoundBite')
      .withProperties(soundBiteObject)
      .do();
    
    return NextResponse.json({
      success: true,
      data: {
        id: result.id,
        ...soundBiteObject,
      }
    });
  } catch (error) {
    console.error('Sound bite upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload sound bite' },
      { status: 500 }
    );
  }
} 