import { NextRequest, NextResponse } from 'next/server';
import { analyzeImageForAudio } from '@/lib/openai';
import { validateImageFile } from '@/lib/utils';

// Server-side function to convert file to base64
async function fileToBase64(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const base64 = buffer.toString('base64');
  return `data:${file.type};base64,${base64}`;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No image file provided' },
        { status: 400 }
      );
    }

    // Validate the uploaded file
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    const startTime = Date.now();

    // Convert file to base64 on server side
    const imageBase64 = await fileToBase64(file);

    // Analyze image for audio content
    const description = await analyzeImageForAudio(imageBase64);

    const processingTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      description,
      processingTime,
    });

  } catch (error) {
    console.error('Image analysis error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

// Handle preflight requests
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
} 