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
    <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-xs flex flex-col justify-between">
      {/* Header with Title & Granularity / Metric Toggles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-base font-bold text-slate-900 font-sans">
            Receita e trajetória de crescimento
          </h3>
          <p className="text-xs text-slate-500 font-sans mt-0.5">
            Séries temporais canônicas agregadas por {grainLabels[timeGrain]}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Time Grain selector */}
          <div className="inline-flex p-1 rounded-xl bg-slate-100/80 border border-slate-200/60">
            {[
              { id: 'day', label: 'Dia' },
              { id: 'week', label: 'Semana' },
              { id: 'month', label: 'Mês' },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => onTimeGrainChange(opt.id as TimeGrain)}
                className={clsx(
                  'px-3 py-1 text-xs font-semibold rounded-lg transition-all',
                  timeGrain === opt.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Metric toggle */}
          <div className="inline-flex p-1 rounded-xl bg-slate-100/80 border border-slate-200/60">
            {[
              { id: 'revenue', label: 'Receita' },
              { id: 'orders', label: 'Pedidos' },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setMetricView(opt.id as 'revenue' | 'orders')}
                className={clsx(
                  'px-3 py-1 text-xs font-semibold rounded-lg transition-all',
                  metricView === opt.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart Area */}
      <div className="h-72 w-full">
        {isLoading ? (
          <div className="h-full w-full flex items-center justify-center animate-pulse bg-slate-50 rounded-xl">
            <span className="text-xs font-sans text-slate-400">Carregando dados agregados...</span>
          </div>
        ) : data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-400 font-sans">
            Nenhum dado de trajetória no período selecionado
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="execRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
                tickFormatter={(d) => {
                  if (!d) return '';
                  const parts = d.split('-');
                  if (parts.length === 3) {
                    const day = parseInt(parts[2], 10);
                    return `${day} out`;
                  }
                  return d;
                }}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
                tickFormatter={(val) =>
                  metricView === 'revenue' ? `$${(val / 1000).toFixed(1)}k` : `${val}`
                }
              />
              <Tooltip
                formatter={(val: any) => [
                  metricView === 'revenue' ? formatCurrency(Number(val)) : formatInteger(Number(val)),
                  metricView === 'revenue' ? 'Receita' : 'Pedidos',
                ]}
                labelFormatter={(l) => `${l}`}
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderColor: '#e2e8f0',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
                  fontSize: '12px',
                  color: '#0f172a',
                  fontWeight: '600',
                  padding: '8px 12px',
                }}
              />
              <Area
                type="monotone"
                dataKey={metricView === 'revenue' ? 'net_revenue' : 'orders'}
                stroke="#2563eb"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#execRevenueGradient)"
                activeDot={{ r: 6, fill: '#2563eb', stroke: '#ffffff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

