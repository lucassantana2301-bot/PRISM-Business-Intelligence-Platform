'use client';

import React, { useState } from 'react';
import { AlertTriangle, Sparkles, TrendingUp, TrendingDown, CheckCircle2, RefreshCw, Zap, ShieldAlert, ArrowRight } from 'lucide-react';
import { AnalyticalCoordinate } from '@/components/ui/AnalyticalCoordinate';
import { soundEffects } from '@/lib/utils/soundEffects';
import clsx from 'clsx';

export interface AnomalyItem {
  id: string;
  type: 'critical' | 'opportunity' | 'warning';
  title: string;
  metric: string;
  deviation: string; // e.g. +3.8σ
  confidence: string; // e.g. 99.8%
  timestamp: string;
  probableCause: string;
  recommendedAction: string;
  impactEstimate: string;
}

const DETECTED_ANOMALIES: AnomalyItem[] = [
  {
    id: 'anom-01',
    type: 'critical',
    title: 'Queda Anômala na Conclusão de Checkout (Mobile iOS)',
    metric: 'Taxa de Checkout Concluído',
    deviation: '-3.8σ',
    confidence: '99.8%',
    timestamp: 'Hoje, há 42 minutos',
    probableCause: 'Timeout intermitente no cálculo de frete via API de transportadora externa para CEPs do Sudeste.',
    recommendedAction: 'Acionar rota de fallback de contingência da tabela local de fretes.',
    impactEstimate: '-R$ 14.800 em pedidos retidos',
  },
  {
    id: 'anom-02',
    type: 'opportunity',
    title: 'Surto de Aceleração em Áudio & Fones de Ouvido',
    metric: 'Conversão por Categoria',
    deviation: '+4.1σ',
    confidence: '99.9%',
    timestamp: 'Hoje, há 1h 15m',
    probableCause: 'Menção orgânica em canal de influenciador tech gerou fluxo qualificado com 8.4% de conversão.',
    recommendedAction: 'Aumentar orçamento do anúncio de retargeting para sustentar o fluxo pelos próximos 3 dias.',
    impactEstimate: '+R$ 38.500 em GMV potencial',
  },
  {
    id: 'anom-03',
    type: 'warning',
    title: 'Aumento na Latência de Confirmação Pix (Bancos)',
    metric: 'Tempo de Resposta do Webhook',
    deviation: '+2.7σ',
    confidence: '97.4%',
    timestamp: 'Hoje, há 2h 05m',
    probableCause: 'Fila de compensação no gateway intermediário elevou tempo médio de 1.2s para 6.4s.',
    recommendedAction: 'Monitorar SLA de conciliação automática para evitar duplicidade de pedidos.',
    impactEstimate: 'Neutro (resolução automática)',
  },
];

export const AnomalyDetectionRadar: React.FC = () => {
  const [filterType, setFilterType] = useState<'all' | 'critical' | 'opportunity'>('all');
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);

  const filtered = DETECTED_ANOMALIES.filter(
    (a) => filterType === 'all' || a.type === filterType
  );

  const handleDiagnose = (id: string) => {
    soundEffects.playAlert();
    setAnalyzingId(id);
    setTimeout(() => {
      setAnalyzingId(null);
      soundEffects.playSuccess();
    }, 800);
  };

  return (
    <div className="prism-panel-master p-6 sm:p-8 lg:p-10 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <AnalyticalCoordinate dimension="behavioral">
            RADAR.01 · STATISTICAL ANOMALY ENGINE
          </AnalyticalCoordinate>
          <h2 className="mt-1.5 text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <ShieldAlert className="h-6 w-6 text-rose-600" />
            Radar Estatístico de Anomalias & Causa-Raiz (Z-Score)
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Detecção contínua de desvios padrão ($\pm 3\sigma$) calculados a partir da série temporal de telemetria
          </p>
        </div>

        {/* Severity Filters */}
        <div className="flex items-center gap-2">
          <div role="group" className="inline-flex p-0.5 rounded-lg border border-slate-200/80 bg-slate-50/80 text-xs font-medium">
            <button
              type="button"
              onClick={() => {
                soundEffects.playClick();
                setFilterType('all');
              }}
              className={clsx(
                'px-3 py-1.5 rounded-md transition-all',
                filterType === 'all'
                  ? 'bg-slate-900 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              Todas (3)
            </button>
            <button
              type="button"
              onClick={() => {
                soundEffects.playClick();
                setFilterType('critical');
              }}
              className={clsx(
                'px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5',
                filterType === 'critical'
                  ? 'bg-rose-600 text-white font-semibold shadow-xs'
                  : 'text-rose-700 hover:text-rose-900'
              )}
            >
              Críticas (1)
            </button>
            <button
              type="button"
              onClick={() => {
                soundEffects.playClick();
                setFilterType('opportunity');
              }}
              className={clsx(
                'px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5',
                filterType === 'opportunity'
                  ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                  : 'text-emerald-700 hover:text-emerald-900'
              )}
            >
              Oportunidades (1)
            </button>
          </div>
        </div>
      </div>

      {/* Anomaly Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {filtered.map((item) => {
          const isCritical = item.type === 'critical';
          const isOpportunity = item.type === 'opportunity';

          return (
            <div
              key={item.id}
              className={clsx(
                'p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between space-y-4 shadow-2xs',
                isCritical && 'border-rose-200 bg-gradient-to-b from-rose-50/60 to-white',
                isOpportunity && 'border-emerald-200 bg-gradient-to-b from-emerald-50/60 to-white',
                !isCritical && !isOpportunity && 'border-amber-200 bg-gradient-to-b from-amber-50/60 to-white'
              )}
            >
              {/* Card Header Badge & Deviation */}
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={clsx(
                      'px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold tracking-wider uppercase border',
                      isCritical && 'bg-rose-100 text-rose-800 border-rose-200',
                      isOpportunity && 'bg-emerald-100 text-emerald-800 border-emerald-200',
                      !isCritical && !isOpportunity && 'bg-amber-100 text-amber-800 border-amber-200'
                    )}
                  >
                    {isCritical ? '🚨 Anomalia Crítica' : isOpportunity ? '✨ Oportunidade' : '⚠️ Alerta de Sistema'}
                  </span>

                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-900 text-white">
                    {item.deviation}
                  </span>
                </div>

                <h3 className="mt-3 text-base font-bold text-slate-900 leading-snug">
                  {item.title}
                </h3>
                <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">
                  {item.timestamp} · Confiança: {item.confidence}
                </span>

                {/* Probable Cause & Recommended Action */}
                <div className="mt-4 space-y-2.5 text-xs text-slate-600 bg-white/80 p-3.5 rounded-xl border border-slate-200/60 font-sans">
                  <div>
                    <strong className="text-slate-800 font-semibold block text-[11px] uppercase font-mono">
                      Causa Provável:
                    </strong>
                    <p className="mt-0.5 leading-relaxed text-slate-600">{item.probableCause}</p>
                  </div>
                  <div className="pt-2 border-t border-slate-100">
                    <strong className="text-indigo-900 font-semibold block text-[11px] uppercase font-mono">
                      Ação Recomendada:
                    </strong>
                    <p className="mt-0.5 leading-relaxed text-slate-600">{item.recommendedAction}</p>
                  </div>
                </div>
              </div>

              {/* Footer Impact & Action Trigger */}
              <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-slate-800">
                  {item.impactEstimate}
                </span>

                <button
                  type="button"
                  onClick={() => handleDiagnose(item.id)}
                  disabled={analyzingId === item.id}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-all flex items-center gap-1.5 shadow-xs"
                >
                  {analyzingId === item.id ? (
                    <>
                      <RefreshCw className="h-3 w-3 animate-spin" />
                      <span>Diagnosticando...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="h-3 w-3 text-amber-400" />
                      <span>Diagnóstico AST</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
