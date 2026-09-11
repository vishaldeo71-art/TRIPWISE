import { NextRequest, NextResponse } from 'next/server';

/**
 * Next.js API Route: /api/admin/stats
 * Proxies admin dashboard stat requests to the Express backend.
 */
export async function GET(req: NextRequest) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

    const response = await fetch(`${backendUrl}/api/admin/stats`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: 'Unable to load admin dashboard stats right now.' },
      { status: 503 }
    );
  }
}
