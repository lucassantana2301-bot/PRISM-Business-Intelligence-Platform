'use client';

import React from 'react';
import { AlertTriangle, TrendingUp, BarChart2 } from 'lucide-react';
import clsx from 'clsx';

export type InsightSeverity = 'critical' | 'warning' | 'opportunity' | 'neutral';

export interface InsightCardProps {
  title: string;
  description: string;
  severity?: InsightSeverity;
  metricLabel?: string;
  metricValue?: string;
  timestamp?: string;
  className?: string;
}

export const InsightCard: React.FC<InsightCardProps> = ({
  title,
  description,
  severity = 'neutral',
  metricLabel,
  metricValue,
  timestamp = 'Consulta ao vivo',
  className,
}) => {
  const configs = {
    critical: {
      icon: AlertTriangle,
      badgeText: 'Alerta crítico',
      badgeClass: 'bg-rose-50 text-rose-600 border-rose-100',
    },
    warning: {
      icon: AlertTriangle,
      badgeText: 'Alerta de tendência',
      badgeClass: 'bg-rose-50 text-rose-600 border-rose-100',
    },
    opportunity: {
      icon: TrendingUp,
      badgeText: 'Pico de crescimento',
      badgeClass: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    },
    neutral: {
      icon: BarChart2,
      badgeText: 'Mudança Estatística',
      badgeClass: 'bg-blue-50 text-blue-600 border-blue-100',
    },
  };

  const config = configs[severity] || configs.neutral;
  const Icon = config.icon;

  return (
    <div
      className={clsx(
        'p-5 rounded-2xl bg-white border border-slate-100/90 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group',
        className
      )}
    >
      <div>
        {/* Header with Badge & Timestamp */}
        <div className="flex items-center justify-between mb-3">
          <span
            className={clsx(
              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border font-sans',
              config.badgeClass
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{config.badgeText}</span>
          </span>

          <span className="text-[11px] font-sans text-slate-400">
            {timestamp}
          </span>
        </div>

        {/* Title */}
        <h4 className="text-sm font-bold text-slate-900 mb-1.5 font-sans group-hover:text-blue-600 transition-colors">
          {title}
        </h4>

        {/* Description */}
        <p className="text-xs text-slate-500 leading-relaxed font-sans mb-4">
          {description}
        </p>
      </div>

      {/* Metric footer strip */}
      {metricLabel && metricValue && (
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-sans">
          <span className="text-slate-500 font-medium">{metricLabel}:</span>
          <span className="font-bold text-slate-800">{metricValue}</span>
        </div>
      )}
    </div>
  );
};

