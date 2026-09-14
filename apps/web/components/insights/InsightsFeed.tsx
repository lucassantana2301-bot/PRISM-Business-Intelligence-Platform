'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Filter,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Sparkles,
  ArrowRight,
  Bot,
  Activity,
  Layers,
} from 'lucide-react';
import { BusinessInsight, InsightSeverity } from '@/lib/contracts/insights';
import { formatDelta } from '@/lib/utils/formatters';

export interface InsightsFeedProps {
  insights: BusinessInsight[];
  evaluatedPeriod?: string;
}

export const InsightsFeed: React.FC<InsightsFeedProps> = ({
  insights,
  evaluatedPeriod = '2026-08-01 → 2026-10-31',
}) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  const filtered = insights.filter((item) => {
    if (filterSeverity === 'all') return true;
    return item.severity === filterSeverity;
  });

  const getSeverityBadge = (severity: InsightSeverity) => {
    switch (severity) {
      case 'critical':
        return {
          icon: AlertCircle,
          label: 'Critical Anomaly',
          className: 'bg-rose-950/60 text-rose-400 border-rose-800/50',
          accent: 'border-l-rose-500',
        };
      case 'warning':
        return {
          icon: TrendingDown,
          label: 'Performance Lag',
          className: 'bg-amber-950/60 text-amber-400 border-amber-800/50',
          accent: 'border-l-amber-500',
        };
      case 'opportunity':
        return {
          icon: TrendingUp,
          label: 'Growth Surge',
          className: 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50',
          accent: 'border-l-emerald-500',
        };
      default:
        return {
          icon: Sparkles,
          label: 'Statistical Signal',
          className: 'bg-blue-950/60 text-blue-400 border-blue-800/50',
          accent: 'border-l-blue-500',
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Filter & Summary Strip */}
      <div className="p-3.5 rounded-xl bg-prism-bg-card border border-prism-border-subtle flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-mono text-prism-text-muted flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-prism-accent-blue" aria-hidden="true" />
            Severity:
          </span>

          <div className="flex items-center gap-1 bg-prism-bg-base p-1 rounded-lg border border-prism-border-subtle">
            {[
              { id: 'all', label: `All (${insights.length})` },
              { id: 'critical', label: `Critical (${insights.filter((i) => i.severity === 'critical').length})` },
              { id: 'warning', label: `Warnings (${insights.filter((i) => i.severity === 'warning').length})` },
              { id: 'opportunity', label: `Opportunities (${insights.filter((i) => i.severity === 'opportunity').length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterSeverity(tab.id)}
                className={`px-3 py-1 rounded-md text-xs font-mono transition-all ${
                  filterSeverity === tab.id
                    ? 'bg-prism-bg-elevated text-prism-text-primary font-medium border border-prism-border-strong shadow-sm'
                    : 'text-prism-text-secondary hover:text-prism-text-primary hover:bg-prism-bg-elevated/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-prism-text-muted">
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          <span>Window: {evaluatedPeriod}</span>
        </div>
      </div>

      {/* 2. Insights Cards Feed */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((insight) => {
          const badge = getSeverityBadge(insight.severity);
          const Icon = badge.icon;

          return (
            <div
              key={insight.id}
              className={`p-4 rounded-xl bg-prism-bg-card border border-prism-border-subtle hover:border-prism-border-strong border-l-4 ${badge.accent} transition-all space-y-3 flex flex-col justify-between`}
            >
              <div className="space-y-2.5">
                {/* Top Badge & Metric Meta */}
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono border font-medium ${badge.className}`}>
                    <Icon className="w-3 h-3" />
                    <span>{badge.label}</span>
                  </span>

                  <div className="flex items-center gap-1.5 font-mono text-xs">
                    <span className="text-prism-text-muted">Delta:</span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[11px] font-semibold ${
                        insight.change > 0 ? 'text-emerald-400 bg-emerald-950/60' : 'text-rose-400 bg-rose-950/60'
                      }`}
                    >
                      {formatDelta(insight.change)}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h4 className="text-sm font-semibold text-prism-text-primary">
                  {insight.title}
                </h4>

                {/* Observation Evidence (Fact) */}
                <div className="p-2.5 rounded-lg bg-prism-bg-base/80 border border-prism-border-subtle/70 text-xs space-y-1">
                  <div className="text-[10px] font-mono uppercase text-prism-text-muted tracking-wider flex items-center gap-1">
                    <Layers className="w-3 h-3 text-prism-accent-blue" />
                    <span>Empirical Observation</span>
                  </div>
                  <p className="text-prism-text-secondary leading-relaxed font-sans text-xs">
                    {insight.evidence}
                  </p>
                </div>

                {/* Hypothesis (Clearly Separated) */}
                {insight.hypothesis && (
                  <div className="text-[11px] text-prism-text-muted leading-relaxed font-sans italic">
                    <strong className="text-prism-text-secondary font-mono not-italic font-normal">Hypothesis: </strong>
                    {insight.hypothesis}
                  </div>
                )}
              </div>

              {/* Action Footer: Investigate with PRISM */}
              <div className="pt-3 border-t border-prism-border-subtle/60 flex items-center justify-between gap-2">
                <div className="text-[10px] font-mono text-prism-text-muted truncate max-w-[200px]">
                  Conf: {(insight.confidence * 100).toFixed(0)}% • {insight.dimension}: {insight.segment}
                </div>

                <Link
                  href={`/ask`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-prism-accent-blue/10 hover:bg-prism-accent-blue/20 text-prism-accent-blue hover:text-blue-300 border border-prism-accent-blue/30 text-xs font-mono transition-colors"
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>Investigate with PRISM</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
