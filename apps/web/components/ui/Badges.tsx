import React from 'react';
import { TrendingUp, TrendingDown, Minus, Sparkles, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import clsx from 'clsx';

export interface TrendBadgeProps {
  delta: number | null;
  direction?: 'up' | 'down' | 'neutral';
  isFavorable?: boolean;
  size?: 'sm' | 'md';
  prefix?: string;
}

export const TrendBadge: React.FC<TrendBadgeProps> = ({
  delta,
  direction = 'neutral',
  isFavorable = true,
  size = 'md',
  prefix = '',
}) => {
  if (delta === null || isNaN(delta)) {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-mono bg-zinc-800/80 text-zinc-400 border border-zinc-700/50">
        <Minus className="w-3 h-3" />
        <span>N/A</span>
      </span>
    );
  }

  const isPositive = delta > 0;
  const isNeutral = delta === 0;

  // Determine sentiment color
  let colorClasses = 'bg-zinc-800 text-zinc-300 border-zinc-700/60';
  if (!isNeutral) {
    if ((isPositive && isFavorable) || (!isPositive && !isFavorable)) {
      colorClasses = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    } else {
      colorClasses = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    }
  }

  const formattedDelta = `${isPositive ? '+' : ''}${delta.toFixed(1)}%`;

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded font-mono font-medium border transition-colors',
        size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-[11px]',
        colorClasses
      )}
    >
      {isPositive ? (
        <TrendingUp className={size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
      ) : isNeutral ? (
        <Minus className={size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
      ) : (
        <TrendingDown className={size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
      )}
      <span>{prefix}{formattedDelta}</span>
    </span>
  );
};

export interface StatusBadgeProps {
  status: 'live' | 'cached' | 'anomaly' | 'warning' | 'synced' | 'processing';
  label?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label }) => {
  const configs = {
    live: {
      icon: CheckCircle,
      text: label || 'Live',
      classes: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      dotClass: 'bg-emerald-400',
    },
    cached: {
      icon: Clock,
      text: label || 'Cached',
      classes: 'bg-zinc-800 text-zinc-400 border-zinc-700/60',
      dotClass: 'bg-zinc-400',
    },
    anomaly: {
      icon: AlertTriangle,
      text: label || 'Anomaly',
      classes: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      dotClass: 'bg-rose-400',
    },
    warning: {
      icon: AlertTriangle,
      text: label || 'Warning',
      classes: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      dotClass: 'bg-amber-400',
    },
    synced: {
      icon: CheckCircle,
      text: label || 'Synced',
      classes: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      dotClass: 'bg-blue-400',
    },
    processing: {
      icon: Sparkles,
      text: label || 'Analyzing',
      classes: 'bg-purple-500/10 text-purple-400 border-purple-500/20 animate-pulse',
      dotClass: 'bg-purple-400',
    },
  };

  const config = configs[status];

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono border',
        config.classes
      )}
    >
      <span className={clsx('w-1.5 h-1.5 rounded-full', config.dotClass)} />
      <span>{config.text}</span>
    </span>
  );
};
