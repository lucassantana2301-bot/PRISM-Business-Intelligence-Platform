'use client';

import React from 'react';
import { AlertCircle, TrendingUp, TrendingDown, ArrowRight, Zap, Sparkles } from 'lucide-react';
import clsx from 'clsx';

export type InsightSeverity = 'critical' | 'warning' | 'opportunity' | 'neutral';

export interface InsightCardProps {
  title: string;
  description: string;
  severity?: InsightSeverity;
  metricLabel?: string;
  metricValue?: string;
  impact?: string;
  timestamp?: string;
  onExplore?: () => void;
  className?: string;
}

export const InsightCard: React.FC<InsightCardProps> = ({
  title,
  description,
  severity = 'neutral',
  metricLabel,
  metricValue,
  impact,
  timestamp = 'Detected 12m ago',
  onExplore,
  className,
}) => {
  const configs = {
    critical: {
      icon: AlertCircle,
      badgeText: 'Anomaly Drop',
      badgeClass: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      borderAccent: 'border-l-rose-500',
    },
    warning: {
      icon: TrendingDown,
      badgeText: 'Trend Warning',
      badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      borderAccent: 'border-l-amber-500',
    },
    opportunity: {
      icon: TrendingUp,
      badgeText: 'Growth Spike',
      badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      borderAccent: 'border-l-emerald-500',
    },
    neutral: {
      icon: Sparkles,
      badgeText: 'Statistical Shift',
      badgeClass: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      borderAccent: 'border-l-blue-500',
    },
  };

  const config = configs[severity];
  const Icon = config.icon;

  return (
    <div
      className={clsx(
        'p-4 rounded-lg bg-prism-bg-card border border-prism-border-subtle hover:border-prism-border-hover border-l-2 transition-all group flex flex-col justify-between',
        config.borderAccent,
        className
      )}
    >
      <div>
        {/* Header with Badge & Timestamp */}
        <div className="flex items-center justify-between mb-2">
          <span
            className={clsx(
              'inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono border font-medium',
              config.badgeClass
            )}
          >
            <Icon className="w-3 h-3" />
            <span>{config.badgeText}</span>
          </span>

          <span className="text-[11px] font-mono text-prism-text-secondary">
            {timestamp}
          </span>
        </div>

        {/* Title */}
        <h4 className="text-sm font-medium text-prism-text-primary mb-1 group-hover:text-prism-accent-blue transition-colors">
          {title}
        </h4>

        {/* Description */}
        <p className="text-xs text-prism-text-secondary leading-relaxed mb-3">
          {description}
        </p>
      </div>

      {/* Impact & Metric strip */}
      <div className="pt-2 border-t border-prism-border-subtle/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {metricLabel && metricValue && (
            <div className="text-xs font-mono">
              <span className="text-prism-text-muted">{metricLabel}: </span>
              <span className="font-semibold text-prism-text-primary">{metricValue}</span>
            </div>
          )}
          {impact && (
            <span className="text-[11px] font-mono px-1.5 py-0.2 rounded bg-prism-bg-elevated text-prism-text-secondary">
              {impact}
            </span>
          )}
        </div>

        {onExplore && (
          <button
            type="button"
            onClick={onExplore}
            className="inline-flex items-center gap-1 text-xs font-mono text-prism-text-muted hover:text-prism-accent-blue transition-colors"
          >
            <span>Analyze</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
};
