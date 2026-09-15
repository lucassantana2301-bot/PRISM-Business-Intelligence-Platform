import React, { Suspense } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataExplorerClient } from '@/components/explorer/DataExplorerClient';

export const metadata = {
  title: 'Explorador de Dados — PRISM',
  description: 'Exploração granular, filtros multidimensionais e exportação segura de registros analíticos canônicos.',
};

export default function DataExplorerPage() {
  return (
    <div className="space-y-8 pb-16">
      <PageHeader
        coordinate="03 · CANONICAL DATASETS"
        dimension="structural"
        title="Explorador de Dados"
        description="Navegação em nível de registro sobre os conjuntos de dados de pedidos, clientes e sessões. Paginação do lado do servidor, filtros tipados e exportação com limite de segurança."
        actions={
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-slate-500 px-3 py-1.5 rounded-lg border border-slate-200/80 bg-white shadow-2xs">
              DuckDB Vectorized Stream
            </span>
          </div>
        }
      />

      <Suspense
        fallback={
          <div className="p-16 text-center text-xs font-mono text-slate-400 bg-white rounded-2xl border border-slate-200/80">
            Inicializando registro do explorador de dados…
          </div>
        }
      >
        <DataExplorerClient />
      </Suspense>
    </div>
  );
}
