import { NextRequest, NextResponse } from 'next/server';
import { searchSounds } from '@/lib/weaviate';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, limit = 10, threshold = 0.7 } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Query is required and must be a string' },
        { status: 400 }
      );
    }

    if (query.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Query cannot be empty' },
        { status: 400 }
      );
    }

    const startTime = Date.now();

    // Search for sounds using Weaviate
    const results = await searchSounds(query, limit, threshold);

    const processingTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      results,
      totalCount: results.length,
      processingTime,
    });

  } catch (error) {
    console.error('Sound search error:', error);
    
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