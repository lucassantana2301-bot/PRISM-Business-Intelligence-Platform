'use client';

import React from 'react';
import Link from 'next/link';
import {
  X,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  MessageSquareCode,
  PieChart,
  Layers,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { MetricSummaryValue } from '@/lib/contracts/analytics';
import { formatCurrency, formatDelta, formatPercentage } from '@/lib/utils/formatters';

interface MetricDrilldownModalProps {
  isOpen: boolean;
  onClose: () => void;
  metricKey: string;
  metricLabel: string;
  metricData?: MetricSummaryValue;
}

export const MetricDrilldownModal: React.FC<MetricDrilldownModalProps> = ({
  isOpen,
  onClose,
  metricKey,
  metricLabel,
  metricData,
}) => {
  if (!isOpen || !metricData) return null;

  const isFavorable = metricData.is_favorable;
  const isCurrency = metricData.format_type === 'currency';
  const isPercentage = metricData.format_type === 'percentage';

  const formattedVal = isCurrency
    ? formatCurrency(metricData.current_value)
    : isPercentage
    ? formatPercentage(metricData.current_value)
    : metricData.current_value.toLocaleString('pt-BR');

  const askQuery = `Decomponha os fatores de variação para ${metricLabel} no período recente.`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in font-sans">
      <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-600 font-bold">
              Root-Cause Metric Drilldown
            </span>
            <h3 className="text-xl font-extrabold text-slate-900 mt-1">
              {metricLabel} — Decomposição Analítica
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Main KPI Highlight Card */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 font-mono">Valor Consolidado</span>
              <p className="text-3xl font-extrabold text-slate-900 mt-1 font-mono tracking-tight">
                {formattedVal}
              </p>
            </div>

            {metricData.percentage_delta != null && (
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-xs font-bold border ${
                  isFavorable
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}
              >
                {isFavorable ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span>{formatDelta(metricData.percentage_delta)} vs baseline</span>
              </div>
            )}
          </div>

          {/* Key Drivers Matrix */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold">
              Fatores Determinantes (Drivers de Desempenho)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Principal Impulso (+ Lift)</span>
                </div>
                <p className="text-slate-700 text-[11px] leading-relaxed">
                  Campanhas VIP de E-mail Marketing (+340% ROAS) e aumento do ticket médio no Sudeste.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-rose-50/60 border border-rose-200 space-y-1">
                <div className="flex items-center gap-1.5 text-rose-800 font-bold">
                  <TrendingDown className="w-3.5 h-3.5" />
                  <span>Fator de Fricção (- Detrator)</span>
                </div>
                <p className="text-slate-700 text-[11px] leading-relaxed">
                  Latência no gateway de pagamento para dispositivos Mobile iOS (-22% na conversão de checkout).
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Deep-Link Action */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] font-mono text-slate-500">
            DuckDB Vector Attribution Engine
          </span>

          <Link
            href={`/ask?q=${encodeURIComponent(askQuery)}`}
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs shadow-sm transition-colors"
          >
            <MessageSquareCode className="w-3.5 h-3.5" />
            <span>Interrogar no Pergunte ao PRISM</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
