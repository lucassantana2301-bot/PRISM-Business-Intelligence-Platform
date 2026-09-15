import React from 'react';
import { Download, Layers } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { AnalyticsWorkspace } from '@/components/analytics/AnalyticsWorkspace';
import { mockChannelData, mockDeviceData } from '@/lib/mock/ecommerce';

export const metadata = {
  title: 'Análises Dimensionais — PRISM',
  description: 'Matriz analítica multi-eixo de canais de marketing, dispositivos e atribuição de receita.',
};

export default function AnalyticsPage() {
  return (
    <div className="space-y-8 pb-16">
      <PageHeader
        coordinate="02 · ANALYTICAL MATRIX"
        dimension="monetary"
        title="Análises Dimensionais & Canais"
        description="Fatiamento analítico multi-eixo entre canais de aquisição, tipos de dispositivo e eficiência de retorno sobre investimento (ROAS)."
        actions={
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-slate-500 px-3 py-1.5 rounded-lg border border-slate-200/80 bg-white shadow-2xs">
              DuckDB Analytics Mart
            </span>
          </div>
        }
      />

      <AnalyticsWorkspace
        channelData={mockChannelData}
        deviceData={mockDeviceData}
      />
    </div>
  );
}

