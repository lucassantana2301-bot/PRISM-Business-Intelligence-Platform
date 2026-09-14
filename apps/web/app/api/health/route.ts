import { NextResponse } from 'next/server';
import { DataProviderRegistry } from '@/lib/providers/data_provider';

export const dynamic = 'force-dynamic';

export async function GET() {
  const t0 = performance.now();
  const registry = DataProviderRegistry.getInstance();
  const sourcesData = await registry.getAllSources();
  const latency = Number((performance.now() - t0).toFixed(2));

  return NextResponse.json({
    status: 'healthy',
    environment: process.env.NODE_ENV || 'production',
    service: 'prism-analytics-platform',
    version: '1.0.0',
    uptime_seconds: process.uptime(),
    memory_usage: process.memoryUsage(),
    engine: {
      active_source: sourcesData.active_source.name,
      type: sourcesData.active_source.type,
      latency_ms: sourcesData.active_source.latency_ms,
      cataloged_tables: sourcesData.total_tables,
      total_rows: sourcesData.total_rows,
      read_only_enforced: true,
      ast_validation: true,
    },
    system_latency_ms: latency,
    timestamp: new Date().toISOString(),
  });
}
