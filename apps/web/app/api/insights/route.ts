import { NextResponse } from 'next/server';
import { detectBusinessInsights } from '@/lib/api/insights_service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await detectBusinessInsights();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to compute statistical insights', message: error.message },
      { status: 500 }
    );
  }
}
