import { NextRequest, NextResponse } from 'next/server';

/**
 * Next.js API Route: /api/ai/ask
 * Proxies AI assistant requests to the Express backend.
 * This keeps the Gemini API key secure on the backend server.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

    const response = await fetch(`${backendUrl}/api/ai/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: 'TripWise AI is temporarily unavailable. Your itinerary is still available.' },
      { status: 503 }
    );
  }
}
