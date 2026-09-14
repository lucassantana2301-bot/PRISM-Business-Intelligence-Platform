import { NextRequest, NextResponse } from 'next/server';
import { executeExplorerQuery } from '@/lib/api/explorer_service';
import { ExplorerQuery } from '@/lib/contracts/explorer';

export async function POST(req: NextRequest) {
  try {
    const query = (await req.json()) as ExplorerQuery;
    const result = await executeExplorerQuery(query);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Explorer query failed' }, { status: 400 });
  }
}
