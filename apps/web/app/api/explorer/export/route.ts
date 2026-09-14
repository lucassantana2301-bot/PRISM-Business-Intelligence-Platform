import { NextRequest, NextResponse } from 'next/server';
import { exportExplorerCsv } from '@/lib/api/explorer_service';
import { ExplorerExportQuery } from '@/lib/contracts/explorer';

export async function POST(req: NextRequest) {
  try {
    const query = (await req.json()) as ExplorerExportQuery;
    const csvContent = exportExplorerCsv(query);

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${query.dataset}_export.csv"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'CSV export failed' }, { status: 400 });
  }
}
