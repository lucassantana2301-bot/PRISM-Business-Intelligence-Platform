import React from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { AskPrismClient } from '@/components/ask/AskPrismClient';

export const metadata = {
  title: 'Pergunte ao PRISM — Natural Language Intelligence',
  description: 'Motor conversacional de inteligência e refração semântica com decomposição de intenção, validação AST e síntese analítica.',
};

export default function AskPrismPage() {
  return (
    <div className="space-y-8 pb-16">
      <PageHeader
        coordinate="05 · REFRACTION QUERY"
        dimension="behavioral"
        title="Pergunte ao PRISM"
        description="Consulte métricas e padrões analíticos em linguagem natural. Cada consulta é decomposta em AST tipado, executada com segurança no motor DuckDB e sintetizada em evidências claras."
        actions={
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-slate-500 px-3 py-1.5 rounded-lg border border-slate-200/80 bg-white shadow-2xs">
              NL-to-SQL AST Sandbox
            </span>
          </div>
        }
      />

      <AskPrismClient />
    </div>
  );
}
