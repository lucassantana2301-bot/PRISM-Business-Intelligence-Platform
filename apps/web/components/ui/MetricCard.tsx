import React from 'react';
import { TrendBadge } from './Badges';
import { Skeleton } from './Controls';

export interface MetricCardProps {
  label: string;
  value: string;
  delta?: number | null;
  comparisonLabel?: string;
  isFavorable?: boolean;
  sparklineData?: number[];
  loading?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  prefix?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  delta = null,
  comparisonLabel = 'vs previous period',
  isFavorable = true,
  sparklineData = [35, 42, 38, 48, 45, 56, 52, 64, 58, 70],
  loading = false,
  icon: Icon,
}) => {
  if (loading) {
    return (
      <div className="p-5 rounded-lg bg-prism-bg-card border border-prism-border-subtle space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-5 w-5 rounded-full" />
        </div>
        <Skeleton className="h-8 w-32" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    );
  }

  // Generate lightweight SVG path for sparkline
  const min = Math.min(...sparklineData);
  const max = Math.max(...sparklineData);
  const range = max - min || 1;
  const width = 100;
  const height = 28;
  const step = width / (sparklineData.length - 1);

  const points = sparklineData
    .map((val, idx) => {
      const x = (idx * step).toFixed(1);
      const y = (height - ((val - min) / range) * (height - 6) - 3).toFixed(1);
      return `${x},${y}`;
    })
    .join(' ');

  const strokeColor = delta !== null && delta < 0 && isFavorable
    ? '#EF4444' // red
    : '#3B82F6'; // prism blue

  return (
    <div className="p-5 rounded-xl bg-prism-bg-card border border-prism-border-subtle hover:border-prism-border-hover transition-all duration-200 relative overflow-hidden group shadow-prism-card hover:shadow-prism-elevated">
      {/* Top row: Label & Icon */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-prism-text-secondary tracking-wide uppercase font-mono">
          {label}
        </span>
        {Icon && (
          <div className="p-1.5 rounded-lg bg-prism-bg-elevated border border-prism-border-subtle text-prism-text-muted group-hover:text-prism-text-primary group-hover:border-prism-border-hover transition-all" aria-hidden="true">
            <Icon className="w-3.5 h-3.5" />
          </div>
        )}
      </div>

      {/* Primary Value */}
      <div className="flex items-baseline justify-between mb-3">
        <span className="text-2xl sm:text-3xl font-mono font-semibold tracking-tight text-prism-text-primary">
          {value}
        </span>
      </div>

      {/* Bottom row: Trend Delta + Sparkline */}
      <div className="flex items-center justify-between pt-2 border-t border-prism-border-subtle/50">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          {delta !== null && (
            <TrendBadge
              delta={delta}
              isFavorable={isFavorable}
              size="sm"
            />
          )}
          <span className="text-[11px] text-prism-text-muted font-mono truncate">
            {comparisonLabel}
          </span>
        </div>

        {/* Micro Sparkline */}
        <div className="w-20 h-7 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity" aria-hidden="true">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id={`grad-${label.replace(/\s+/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={strokeColor} stopOpacity="0.25" />
                <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <polyline
              fill="none"
              stroke={strokeColor}
              strokeWidth="2"
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
