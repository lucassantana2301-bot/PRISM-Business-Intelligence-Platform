'use client';

import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Skeleton } from './Controls';
import clsx from 'clsx';

export interface MetricCardProps {
  label: string;
  value: string;
  delta?: number | null;
  comparisonLabel?: string;
  isFavorable?: boolean;
  sparklineData?: number[];
  sparklineColor?: string;
  iconColor?: string;
  iconBg?: string;
  loading?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  delta = null,
  comparisonLabel = 'em comparação com os 30 dias anteriores',
  isFavorable = true,
  sparklineData = [20, 32, 28, 45, 36, 52, 48, 65, 58, 72],
  sparklineColor,
  iconColor = 'text-blue-600',
  iconBg = 'bg-blue-50',
  loading = false,
  icon: Icon,
}) => {
  if (loading) {
    return (
      <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-28 bg-slate-100" />
          <Skeleton className="h-8 w-8 rounded-xl bg-slate-100" />
        </div>
        <Skeleton className="h-9 w-40 bg-slate-100" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-5 w-20 rounded-md bg-slate-100" />
          <Skeleton className="h-6 w-20 bg-slate-100" />
        </div>
      </div>
    );
  }

  // Generate smooth SVG polyline/path for sparkline
  const min = Math.min(...sparklineData);
  const max = Math.max(...sparklineData);
  const range = max - min || 1;
  const width = 110;
  const height = 36;
  const step = width / (sparklineData.length - 1);

  const points = sparklineData
    .map((val, idx) => {
      const x = (idx * step).toFixed(1);
      const y = (height - ((val - min) / range) * (height - 8) - 4).toFixed(1);
      return `${x},${y}`;
    })
    .join(' ');

  const isPositive = delta !== null && delta >= 0;
  const effectiveStrokeColor = sparklineColor || (isPositive ? '#8b5cf6' : '#f59e0b');

  return (
    <div className="p-6 rounded-2xl bg-white border border-slate-100/90 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
      <div>
        {/* Top row: Label & Colored Icon */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold text-slate-500 tracking-wider uppercase font-sans">
            {label}
          </span>
          {Icon && (
            <div className={clsx('p-2 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105', iconBg, iconColor)}>
              <Icon className="w-4 h-4" />
            </div>
          )}
        </div>

        {/* Primary Value */}
        <div className="mb-4">
          <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-sans">
            {value}
          </span>
        </div>
      </div>

      {/* Bottom row: Delta Pill & Sparkline */}
      <div className="flex items-end justify-between gap-2 pt-2">
        <div className="space-y-1.5 min-w-0">
          {delta !== null && (
            <div
              className={clsx(
                'inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold font-sans',
                isPositive
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                  : 'bg-rose-50 text-rose-600 border border-rose-100'
              )}
            >
              {isPositive ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5" />
              )}
              <span>{isPositive ? `+${delta.toFixed(1)}%` : `${delta.toFixed(1)}%`}</span>
            </div>
          )}
          <div className="text-[10px] text-slate-400 font-sans truncate">
            {comparisonLabel}
          </div>
        </div>

        {/* Dynamic Micro Sparkline */}
        <div className="w-24 h-9 shrink-0" aria-hidden="true">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
            <polyline
              fill="none"
              stroke={effectiveStrokeColor}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={points}
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

