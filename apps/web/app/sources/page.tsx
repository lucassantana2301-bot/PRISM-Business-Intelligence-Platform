import React from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/Badges';
import { DataSourcesView } from '@/components/sources/DataSourcesView';
import { DataProviderRegistry } from '@/lib/providers/data_provider';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Fontes de Dados & Motores — PRISM',
  description: 'Gestão de infraestrutura analítica, telemetria de latência e governança de catálogo de dados DuckDB.',
};

export default async function DataSourcesPage() {
  const registry = DataProviderRegistry.getInstance();
  const data = await registry.getAllSources();

  return (
    <div className="space-y-8 pb-16">
      <PageHeader
        coordinate="06 · ENGINE TELEMETRY"
        dimension="structural"
        title="Fontes de Dados & Motores Analíticos"
        description="Gestão dos provedores analíticos, controle de latência, governança de consultas estritamente de leitura (AST) e catálogo canônico do DuckDB."
        badge={
          <StatusBadge
            status="synced"
            label={`${data.sources.length} Provedores Configurados (${data.total_rows.toLocaleString()} Registros)`}
          />
        }
        actions={
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-slate-500 px-3 py-1.5 rounded-lg border border-slate-200/80 bg-white shadow-2xs">
              OLAP Telemetry Active
            </span>
          </div>
        }
      />

      <DataSourcesView initialData={data} />
    </div>
  );
}
