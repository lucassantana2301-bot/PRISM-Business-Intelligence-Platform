import { NextRequest, NextResponse } from 'next/server';
import { executeAnalyticsQuery } from '@/lib/api/analytics_service';
import { AnalyticsQuery } from '@/lib/contracts/analytics';

export async function POST(req: NextRequest) {
  try {
    const query = (await req.json()) as AnalyticsQuery;
    const result = await executeAnalyticsQuery(query);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Analytics query failed' }, { status: 500 });
  }
}
