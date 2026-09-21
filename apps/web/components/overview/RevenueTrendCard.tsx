'use client';

import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { TimeGrain } from '@/lib/contracts/analytics';
import { AnalyticalCoordinate } from '@/components/ui/AnalyticalCoordinate';
import { formatCurrency, formatInteger } from '@/lib/utils/formatters';
import clsx from 'clsx';

export interface TrendDataPoint {
  timestamp: string;
  date: string;
  net_revenue: number;
  orders: number;
  current: number;
  previous?: number;
}

export interface RevenueTrendCardProps {
  data: TrendDataPoint[];
  timeGrain: TimeGrain;
  onTimeGrainChange: (grain: TimeGrain) => void;
  isLoading?: boolean;
}

const MONTH_ABBR_PT = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

function formatAxisDate(raw: string): string {
  if (!raw) return '';
  const parts = raw.split('-');
  if (parts.length === 3) {
    const day = parseInt(parts[2], 10);
    const month = MONTH_ABBR_PT[parseInt(parts[1], 10) - 1];
    return month ? `${day} ${month}` : raw;
  }
  if (parts.length === 2) {
    return MONTH_ABBR_PT[parseInt(parts[1], 10) - 1] ?? raw;
  }
  return raw;
}

interface ToggleGroupProps<T extends string> {
  options: { id: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
}

function ToggleGroup<T extends string>({ options, value, onChange, ariaLabel }: ToggleGroupProps<T>) {
  return (
    <div role="group" aria-label={ariaLabel} className="inline-flex overflow-hidden rounded-lg border border-slate-200/80 bg-slate-50/70 p-0.5">
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onChange(opt.id)}
          aria-pressed={value === opt.id}
          className={clsx(
            'px-2.5 py-1 text-xs font-medium rounded-md transition-all duration-150',
            value === opt.id
              ? 'bg-slate-900 text-white font-semibold shadow-xs'
              : 'text-slate-500 hover:text-slate-900'
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export const RevenueTrendCard: React.FC<RevenueTrendCardProps> = ({
  data,
  timeGrain,
  onTimeGrainChange,
  isLoading = false,
}) => {
  const [metricView, setMetricView] = useState<'revenue' | 'orders'>('revenue');

  const grainLabels: Record<TimeGrain, string> = {
    day: 'dia',
    week: 'semana',
    month: 'mês',
    quarter: 'trimestre',
    year: 'ano',
  };

  return (
    <div className="flex flex-col justify-between p-6 sm:p-8 h-full bg-gradient-to-br from-white via-white to-slate-50/50">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <AnalyticalCoordinate dimension="monetary">EVD.02 · TREND</AnalyticalCoordinate>
          <h3 className="mt-1.5 text-lg font-bold tracking-tight text-slate-900">
            Trajetória de {metricView === 'revenue' ? 'Receita Líquida' : 'Volume de Pedidos'}
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Série temporal canônica agregada por <strong className="text-slate-700">{grainLabels[timeGrain]}</strong> com comparação ao período anterior
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
          <ToggleGroup
            options={[
              { id: 'revenue', label: 'Receita (R$)' },
              { id: 'orders', label: 'Pedidos' },
            ]}
            value={metricView}
            onChange={setMetricView}
            ariaLabel="Seletor de métrica do gráfico"
          />

          <ToggleGroup
            options={[
              { id: 'day', label: 'D' },
              { id: 'week', label: 'S' },
              { id: 'month', label: 'M' },
            ]}
            value={timeGrain}
            onChange={onTimeGrainChange}
            ariaLabel="Grão temporal do gráfico"
          />
        </div>
      </div>

      <div className="h-[280px] w-full mt-2">
        {isLoading ? (
          <div className="h-full w-full flex items-center justify-center text-xs text-slate-400 bg-slate-50/50 rounded-xl animate-shimmer">
            Processando série temporal...
          </div>
        ) : data.length === 0 ? (
          <div className="h-full w-full flex items-center justify-center text-xs text-slate-400">
            Nenhum dado de tendência no período
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="trendRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#5361ff" stopOpacity={0.35} />
                  <stop offset="60%" stopColor="#7967ff" stopOpacity={0.10} />
                  <stop offset="100%" stopColor="#5361ff" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="trendOrdersGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.35} />
                  <stop offset="60%" stopColor="#38bdf8" stopOpacity={0.10} />
                  <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="trendPreviousGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#94a3b8" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#94a3b8" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="date"
                tickFormatter={formatAxisDate}
                tick={{ fontSize: 11, fill: '#64748b', fontFamily: 'monospace' }}
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(val) =>
                  metricView === 'revenue'
                    ? val >= 1000
                      ? `R$ ${(val / 1000).toFixed(0)}k`
                      : `R$ ${val}`
                    : formatInteger(val)
                }
                tick={{ fontSize: 11, fill: '#64748b', fontFamily: 'monospace' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload || !payload.length) return null;
                  const currentVal = payload[0]?.value as number;
                  const prevVal = payload[1]?.value as number | undefined;

                  return (
                    <div className="rounded-xl border border-slate-200/90 bg-white/95 backdrop-blur-md p-3.5 shadow-xl text-xs space-y-1.5 min-w-[170px]">
                      <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider block font-bold">
                        {String(label)}
                      </span>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-slate-600 font-medium">Período Atual:</span>
                        <strong className="text-slate-900 font-mono font-bold">
                          {metricView === 'revenue'
                            ? formatCurrency(currentVal)
                            : formatInteger(currentVal)}
                        </strong>
                      </div>
                      {prevVal != null && (
                        <div className="flex items-center justify-between gap-3 text-slate-400 pt-1 border-t border-slate-100">
                          <span>Anterior:</span>
                          <span className="font-mono">
                            {metricView === 'revenue'
                              ? formatCurrency(prevVal)
                              : formatInteger(prevVal)}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                }}
              />
              {data[0]?.previous !== undefined && (
                <Area
                  type="monotone"
                  dataKey="previous"
                  stroke="#cbd5e1"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  fill="url(#trendPreviousGradient)"
                />
              )}
              <Area
                type="monotone"
                dataKey={metricView === 'revenue' ? 'net_revenue' : 'orders'}
                stroke={metricView === 'revenue' ? '#5361ff' : '#0ea5e9'}
                strokeWidth={2.5}
                fill={metricView === 'revenue' ? 'url(#trendRevenueGradient)' : 'url(#trendOrdersGradient)'}
                dot={false}
                activeDot={{ r: 5, fill: metricView === 'revenue' ? '#5361ff' : '#0ea5e9', stroke: '#ffffff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

