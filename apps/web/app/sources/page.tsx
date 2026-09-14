import React from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/Badges';
import { DataSourcesView } from '@/components/sources/DataSourcesView';
import { DataProviderRegistry } from '@/lib/providers/data_provider';

export const dynamic = 'force-dynamic';

export default async function DataSourcesPage() {
  const registry = DataProviderRegistry.getInstance();
  const data = await registry.getAllSources();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Data Sources & Analytical Engines"
        description="Enterprise data provider management, active connection health, vectorized DuckDB OLAP engine, and schema allowlists."
        badge={
          <StatusBadge
            status="synced"
            label={`${data.sources.length} Configured Providers (${data.total_rows.toLocaleString()} Rows)`}
          />
        }
      />

      <DataSourcesView initialData={data} />
    </div>
  );
}
