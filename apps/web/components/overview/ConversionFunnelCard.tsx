'use client';

import React from 'react';
import { Filter, ArrowDown, TrendingDown, Sparkles } from 'lucide-react';
import { AnalyticalCoordinate } from '@/components/ui/AnalyticalCoordinate';
import { formatInteger } from '@/lib/utils/formatters';
import { FunnelStepData } from '@/lib/api/analytics_service';
import clsx from 'clsx';

interface ConversionFunnelCardProps {
  data: FunnelStepData[];
  isLoading?: boolean;
}

const FUNNEL_STEP_LABELS: Record<string, string> = {
  '1. Store Sessions': '1. Sessões da Loja',
  '2. Product Views': '2. Visualizações de Produto',
  '3. Add to Cart': '3. Adições ao Carrinho',
  '4. Checkout Started': '4. Checkouts Iniciados',
  '5. Completed Purchase': '5. Pedidos Concluídos',
};

export const ConversionFunnelCard: React.FC<ConversionFunnelCardProps> = ({
  data,
  isLoading = false,
}) => {
  const stepColors = [
    'from-indigo-600 to-indigo-500',
    'from-indigo-500 to-violet-500',
    'from-violet-500 to-purple-500',
    'from-purple-500 to-cyan-500',
    'from-cyan-500 to-emerald-500',
  ];

  return (
    <div className="prism-panel-master p-6 sm:p-8 flex flex-col justify-between">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <AnalyticalCoordinate dimension="behavioral">
              EVD.04 · BEHAVIORAL FUNNEL
            </AnalyticalCoordinate>
            <h3 className="mt-1.5 text-lg font-bold tracking-tight text-slate-900">
              Funil de Conversão E-Commerce
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Progressão canônica em 5 estágios calculada a partir de eventos de sessão
            </p>
          </div>
          <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-600 self-start sm:self-auto">
            Fluxo Estritamente Monotônico
          </span>
        </div>

        {isLoading ? (
          <div className="space-y-3 animate-shimmer">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-slate-100 rounded-xl" />
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-slate-100">
            Nenhuma telemetria de sessão registrada no período selecionado
          </div>
        ) : (
          <div className="space-y-3">
            {data.map((step, idx) => {
              const convVal = parseFloat(step.conversion.replace('%', '')) || 0;
              const dropVal = parseFloat(step.drop.replace('%', '')) || 0;
              const stepLabel = FUNNEL_STEP_LABELS[step.step] || step.step;

              return (
                <div
                  key={step.step}
                  className="group relative p-4 rounded-xl border border-slate-200/80 bg-gradient-to-r from-white via-slate-50/50 to-white hover:border-indigo-300 transition-all duration-200 hover-lift shadow-2xs"
                >
                  <div className="flex items-center justify-between text-xs mb-2.5">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-5.5 w-5.5 items-center justify-center rounded-full bg-indigo-600 text-white font-mono text-[10px] font-bold shadow-xs">
                        {idx + 1}
                      </span>
                      <span className="font-bold text-slate-800 text-sm group-hover:text-indigo-900 transition-colors">
                        {stepLabel}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 font-mono text-xs tabular-nums">
                      <span className="font-semibold text-slate-900">
                        {formatInteger(step.count)}{' '}
                        <span className="text-[10px] font-normal text-slate-400">sessões</span>
                      </span>
                      <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                        {step.conversion}
                      </span>
                      <span
                        className={clsx(
                          'text-[11px] font-bold px-2 py-0.5 rounded border shadow-2xs',
                          step.drop === '0.0%'
                            ? 'text-slate-400 bg-slate-50 border-slate-200'
                            : 'text-rose-700 bg-rose-50 border-rose-200'
                        )}
                      >
                        {step.drop === '0.0%' ? 'Baseline' : `-${step.drop}`}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar with Gradient */}
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 p-0.5 shadow-inner">
                    <div
                      className={clsx(
                        'h-full rounded-full bg-gradient-to-r transition-all duration-500 ease-out',
                        stepColors[idx] ?? 'from-indigo-600 to-cyan-500'
                      )}
                      style={{ width: `${Math.min(convVal, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

