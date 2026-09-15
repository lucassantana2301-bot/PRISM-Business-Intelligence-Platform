import React from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { InsightsFeed } from '@/components/insights/InsightsFeed';
import { detectBusinessInsights } from '@/lib/api/insights_service';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Percepções & Radar de Anomalias — PRISM',
  description: 'Sinais estatísticos proativos e detecção autônoma de anomalias derivadas dos dados canônicos.',
};

export default async function InsightsPage() {
  const data = await detectBusinessInsights();

  return (
    <div className="space-y-8 pb-16">
      <PageHeader
        coordinate="04 · PROACTIVE ANOMALY RADAR"
        dimension="behavioral"
        title="Percepções Proativas & Radar de Anomalias"
        description="Sinais estatísticos autônomos calculados sobre o histórico de vendas: gargalos de conversão, disparidades regionais e anomalias de faturamento."
        actions={
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 font-semibold">
              {data.critical_count} Anomalias Críticas
            </span>
            <span className="font-mono text-xs px-3 py-1.5 rounded-lg border border-slate-200/80 bg-white text-slate-700 font-semibold shadow-2xs">
              {data.total_detected} Sinais Detectados
            </span>
          </div>
        }
      />

      <InsightsFeed
        insights={data.insights}
        evaluatedPeriod={data.evaluated_period}
      />
    </div>
  );
}

