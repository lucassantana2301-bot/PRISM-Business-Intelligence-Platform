import { NextResponse } from 'next/server';
import { getDatasetList } from '@/lib/api/explorer_service';

export async function GET() {
  try {
    const datasets = getDatasetList();
    return NextResponse.json(datasets);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch dataset list' }, { status: 500 });
  }
}
