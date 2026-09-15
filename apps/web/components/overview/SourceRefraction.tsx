'use client';

import React from 'react';
import clsx from 'clsx';
import { ArrowUpRight, ArrowDownRight, Layers, Sparkles } from 'lucide-react';
import { Skeleton } from '@/components/ui/Controls';
import { AnalyticalCoordinate } from '@/components/ui/AnalyticalCoordinate';
import { MetricSummaryValue } from '@/lib/contracts/analytics';
import { TrendDataPoint } from './RevenueTrendCard';
import { formatCurrency, formatDelta, formatInteger, formatPercentage } from '@/lib/utils/formatters';

interface SourceRefractionProps {
  grossRevenue?: MetricSummaryValue;
  orders?: MetricSummaryValue;
  conversion?: MetricSummaryValue;
  averageOrderValue?: MetricSummaryValue;
  trend: TrendDataPoint[];
  periodLabel: string;
  comparisonLabel: string;
  isLoading: boolean;
}

interface InstrumentProps {
  coordinate: string;
  label: string;
  value: string;
  delta?: number | null;
  favorable?: boolean | null;
  dimension: 'monetary' | 'behavioral' | 'structural';
  comparisonLabel: string;
  progressPercent?: number;
}

const Instrument: React.FC<InstrumentProps> = ({
  coordinate,
  label,
  value,
  delta,
  favorable,
  dimension,
  comparisonLabel,
  progressPercent = 65,
}) => {
  const accentColor =
    dimension === 'monetary'
      ? 'bg-prism-indigo'
      : dimension === 'behavioral'
      ? 'bg-prism-violet'
      : 'bg-prism-cyan';

  return (
    <div className="relative flex flex-col justify-between p-5 rounded-xl border border-slate-100 bg-[#fbfcfd] hover:bg-white transition-all duration-150 group">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className={clsx('h-2 w-2 rounded-full', accentColor)} />
          <AnalyticalCoordinate dimension={dimension}>{coordinate}</AnalyticalCoordinate>
        </div>
        {delta != null && (
          <span
            className={clsx(
              'inline-flex items-center gap-0.5 font-mono text-[11px] font-semibold px-2 py-0.5 rounded tabular-nums',
              favorable === true && 'bg-emerald-50 text-emerald-700 border border-emerald-200/60',
              favorable === false && 'bg-rose-50 text-rose-700 border border-rose-200/60',
              favorable == null && 'bg-slate-50 text-slate-600 border border-slate-200/60'
            )}
          >
            {favorable === true && <ArrowUpRight className="h-3 w-3" />}
            {favorable === false && <ArrowDownRight className="h-3 w-3" />}
            {formatDelta(delta)}
          </span>
        )}
      </div>

      <div className="mt-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
          {label}
        </p>
        <p className="mt-1 text-2xl lg:text-[1.75rem] font-bold tracking-tight text-slate-900 tabular-nums">
          {value}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <span>{comparisonLabel}</span>
        <span className="font-mono text-[10px] text-slate-400">Canônico</span>
      </div>
    </div>
  );
};

const HighPrecisionTrajectory: React.FC<{ data: TrendDataPoint[] }> = ({ data }) => {
  const values = data.map((point) => point.net_revenue);
  if (values.length < 2) {
    return (
      <div className="flex h-44 items-center justify-center text-xs text-slate-400 bg-slate-50/50 rounded-xl border border-slate-100">
        Trajetória de receita em processamento...
      </div>
    );
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const padding = 12;
  const height = 140;
  const width = 600;

  const points = values.map((value, index) => {
    const x = (index / (values.length - 1)) * width;
    const y = height - padding - ((value - min) / range) * (height - padding * 2);
    return { x, y };
  });

  const pathD = points.reduce((acc, point, i, arr) => {
    if (i === 0) return `M ${point.x} ${point.y}`;
    const prev = arr[i - 1];
    const cx = (prev.x + point.x) / 2;
    return `${acc} C ${cx} ${prev.y}, ${cx} ${point.y}, ${point.x} ${point.y}`;
  }, '');

  const areaD = `${pathD} L ${width} ${height} L 0 ${height} Z`;
  const lastPoint = points[points.length - 1];

  return (
    <div className="mt-6 pt-5 border-t border-slate-100">
      <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
        <span className="font-medium flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-prism-indigo" />
          Trajetória contínua da receita líquida
        </span>
        <span className="font-mono text-[11px] font-semibold text-slate-800 tabular-nums">
          Último: {formatCurrency(values[values.length - 1])}
        </span>
      </div>

      <div className="relative h-36 w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          className="h-full w-full overflow-visible"
        >
          <defs>
            <linearGradient id="flagshipAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5361ff" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#5361ff" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="flagshipLineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="50%" stopColor="#5361ff" />
              <stop offset="100%" stopColor="#7967ff" />
            </linearGradient>
          </defs>

          {/* Baseline Grid */}
          <line
            x1="0"
            y1={height - padding}
            x2={width}
            y2={height - padding}
            stroke="#e2e8f0"
            strokeWidth="1"
            strokeDasharray="4 4"
          />

          {/* Area Fill */}
          <path d={areaD} fill="url(#flagshipAreaGradient)" />

          {/* Smooth Gradient Curve */}
          <path
            d={pathD}
            fill="none"
            stroke="url(#flagshipLineGradient)"
            strokeWidth="2.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Endpoint Pulse */}
          <circle cx={lastPoint.x} cy={lastPoint.y} r="4.5" fill="#5361ff" className="prism-live-dot" />
          <circle cx={lastPoint.x} cy={lastPoint.y} r="2" fill="#ffffff" />
        </svg>
      </div>
    </div>
  );
};

export const SourceRefraction: React.FC<SourceRefractionProps> = ({
  grossRevenue,
  orders,
  conversion,
  averageOrderValue,
  trend,
  periodLabel,
  comparisonLabel,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <section className="prism-panel-master p-8 lg:p-10" aria-label="Carregando métricas executivas">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-6">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-16 w-80" />
            <Skeleton className="h-40 w-full" />
          </div>
          <div className="lg:col-span-5 space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-28 w-full" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="prism-panel-master p-6 sm:p-8 lg:p-10 relative overflow-hidden"
      aria-labelledby="source-station-title"
    >
      {/* Subtle spectral accent bar at top */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-prism-cyan via-prism-indigo to-prism-violet" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
        {/* LEFT / PRIMARY: SRC.01 GROSS REVENUE (60% width) */}
        <div className="lg:col-span-7 flex flex-col justify-between pr-0 lg:pr-6 lg:border-r lg:border-slate-100">
          <div>
            <div className="flex items-center justify-between gap-4">
              <AnalyticalCoordinate dimension="monetary">SRC.01 · PRIMARY SOURCE</AnalyticalCoordinate>
              <span className="font-mono text-xs font-medium text-slate-500 px-2.5 py-1 rounded-md bg-slate-100/70 border border-slate-200/50">
                {periodLabel}
              </span>
            </div>

            <div className="mt-6">
              <h2
                id="source-station-title"
                className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500"
              >
                Receita Bruta Total
              </h2>

              <div className="mt-2.5 flex flex-wrap items-baseline gap-x-5 gap-y-2">
                <span className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 tabular-nums">
                  {formatCurrency(grossRevenue?.current_value ?? 0)}
                </span>
                {grossRevenue?.percentage_delta != null && (
                  <span
                    className={clsx(
                      'inline-flex items-center gap-1 font-mono text-sm font-semibold px-2.5 py-1 rounded-md tabular-nums',
                      grossRevenue.is_favorable
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                        : 'bg-rose-50 text-rose-700 border border-rose-200/60'
                    )}
                  >
                    {grossRevenue.is_favorable ? (
                      <ArrowUpRight className="h-4 w-4" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4" />
                    )}
                    {formatDelta(grossRevenue.percentage_delta)}
                  </span>
                )}
              </div>

              <p className="mt-3 text-xs leading-5 text-slate-500 max-w-lg">
                Volume financeiro bruto consolidado do período, processado via DuckDB Analytics Core
                com reconciliação em tempo real.
              </p>
            </div>
          </div>

          {/* Integrated High-Precision Trajectory */}
          <HighPrecisionTrajectory data={trend} />
        </div>

        {/* RIGHT / SUPPORTING: DRV.01 - DRV.03 DERIVED INSTRUMENTS (40% width) */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <AnalyticalCoordinate>REFRACTION · DERIVED READINGS</AnalyticalCoordinate>
            <span className="text-[11px] font-mono text-slate-400">3 Instrumentos</span>
          </div>

          <div className="grid grid-cols-1 gap-3.5 flex-1">
            <Instrument
              coordinate="DRV.01"
              label="Volume de Pedidos"
              value={formatInteger(orders?.current_value ?? 0)}
              delta={orders?.percentage_delta}
              favorable={orders?.is_favorable}
              dimension="monetary"
              comparisonLabel={comparisonLabel}
            />

            <Instrument
              coordinate="DRV.02"
              label="Taxa de Conversão"
              value={formatPercentage(conversion?.current_value ?? 0)}
              delta={conversion?.percentage_delta}
              favorable={conversion?.is_favorable}
              dimension="behavioral"
              comparisonLabel={comparisonLabel}
            />

            <Instrument
              coordinate="DRV.03"
              label="Ticket Médio (AOV)"
              value={formatCurrency(averageOrderValue?.current_value ?? 0)}
              delta={averageOrderValue?.percentage_delta}
              favorable={averageOrderValue?.is_favorable}
              dimension="structural"
              comparisonLabel={comparisonLabel}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
