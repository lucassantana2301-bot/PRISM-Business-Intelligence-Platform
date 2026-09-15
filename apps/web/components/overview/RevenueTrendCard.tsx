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
    <div className="flex flex-col justify-between p-6 sm:p-8 h-full">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <AnalyticalCoordinate dimension="monetary">EVD.02 · TREND</AnalyticalCoordinate>
          <h3 className="mt-1.5 text-lg font-bold tracking-tight text-slate-900">
            Receita e Trajetória de Crescimento
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Séries temporais canônicas agregadas por {grainLabels[timeGrain]}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <ToggleGroup
            ariaLabel="Granularidade temporal"
            value={timeGrain}
            onChange={onTimeGrainChange}
            options={[
              { id: 'day', label: 'Dia' },
              { id: 'week', label: 'Semana' },
              { id: 'month', label: 'Mês' },
            ]}
          />
          <ToggleGroup
            ariaLabel="Métrica exibida"
            value={metricView}
            onChange={setMetricView}
            options={[
              { id: 'revenue', label: 'Receita' },
              { id: 'orders', label: 'Pedidos' },
            ]}
          />
        </div>
      </div>

      <div className="h-72 w-full">
        {isLoading ? (
          <div className="h-full w-full flex items-center justify-center rounded-xl bg-slate-50 animate-pulse">
            <span className="text-xs text-slate-400">Carregando dados agregados...</span>
          </div>
        ) : data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-400">
            Nenhum dado de trajetória no período selecionado
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueTrendFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#5361ff" stopOpacity={0.16} />
                  <stop offset="100%" stopColor="#5361ff" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
                tickFormatter={formatAxisDate}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                width={48}
                tickFormatter={(val) =>
                  metricView === 'revenue' ? `$${(val / 1000).toFixed(1)}k` : `${val}`
                }
              />
              <Tooltip
                cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
                formatter={(val: any) => [
                  metricView === 'revenue' ? formatCurrency(Number(val)) : formatInteger(Number(val)),
                  metricView === 'revenue' ? 'Receita' : 'Pedidos',
                ]}
                labelFormatter={(l) => formatAxisDate(String(l))}
                contentStyle={{
                  backgroundColor: '#080c16',
                  border: '1px solid #1e293b',
                  borderRadius: '8px',
                  boxShadow: '0 12px 28px -8px rgba(0, 0, 0, 0.4)',
                  fontSize: '12px',
                  color: '#f8fafc',
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, monospace',
                  padding: '8px 12px',
                }}
                labelStyle={{ color: '#94a3b8', fontSize: '10px', marginBottom: '4px' }}
              />
              <Area
                type="monotone"
                dataKey={metricView === 'revenue' ? 'net_revenue' : 'orders'}
                stroke="#5361ff"
                strokeWidth={2.25}
                fillOpacity={1}
                fill="url(#revenueTrendFill)"
                activeDot={{ r: 4, fill: '#5361ff', stroke: '#FFFFFF', strokeWidth: 2 }}
                isAnimationActive={!isLoading}
                animationDuration={280}
                animationEasing="ease-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

