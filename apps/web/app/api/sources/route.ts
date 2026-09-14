import { NextResponse } from 'next/server';
import { DataProviderRegistry } from '@/lib/providers/data_provider';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const registry = DataProviderRegistry.getInstance();
    const data = await registry.getAllSources();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to inspect data sources', message: error.message },
      { status: 500 }
    );
  }
}
