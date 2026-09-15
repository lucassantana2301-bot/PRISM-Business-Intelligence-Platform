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
  ShieldCheck,
  Activity,
  Layers,
  Bot,
} from 'lucide-react';
import { BusinessInsight, InsightSeverity } from '@/lib/contracts/insights';
import { AnalyticalCoordinate } from '@/components/ui/AnalyticalCoordinate';
import { formatDelta } from '@/lib/utils/formatters';
import clsx from 'clsx';

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
          label: 'Anomalia Crítica',
          badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
          accentClass: 'border-l-rose-500',
        };
      case 'warning':
        return {
          icon: TrendingDown,
          label: 'Desaceleração',
          badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
          accentClass: 'border-l-amber-500',
        };
      case 'opportunity':
        return {
          icon: TrendingUp,
          label: 'Oportunidade de Crescimento',
          badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          accentClass: 'border-l-emerald-500',
        };
      default:
        return {
          icon: Sparkles,
          label: 'Sinal Estatístico',
          badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          accentClass: 'border-l-indigo-500',
        };
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. Header Filter & Summary Strip */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3.5 rounded-xl border border-slate-200/80 bg-white shadow-2xs">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-mono text-xs text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
            <Filter className="h-3.5 w-3.5 text-prism-indigo" />
            Severidade:
          </span>

          <div role="group" className="inline-flex p-0.5 rounded-lg border border-slate-200/80 bg-slate-50/80">
            {[
              { id: 'all', label: `Todos (${insights.length})` },
              { id: 'critical', label: `Críticos (${insights.filter((i) => i.severity === 'critical').length})` },
              { id: 'warning', label: `Avisos (${insights.filter((i) => i.severity === 'warning').length})` },
              { id: 'opportunity', label: `Oportunidades (${insights.filter((i) => i.severity === 'opportunity').length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterSeverity(tab.id)}
                className={clsx(
                  'px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-150',
                  filterSeverity === tab.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-slate-500">
          <Activity className="h-3.5 w-3.5 text-prism-indigo" />
          <span>Janela: <strong>{evaluatedPeriod}</strong></span>
        </div>
      </section>

      {/* 2. Insights Cards Feed */}
      <div className="grid grid-cols-1 gap-6">
        {filtered.map((insight, idx) => {
          const config = getSeverityBadge(insight.severity);
          const Icon = config.icon;

          return (
            <article
              key={insight.id || idx}
              className={clsx(
                'prism-panel-master p-6 sm:p-8 border-l-4 transition-all duration-150 hover:shadow-lg',
                config.accentClass
              )}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span
                    className={clsx(
                      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border',
                      config.badgeClass
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {config.label}
                  </span>

                  <AnalyticalCoordinate dimension={insight.severity === 'critical' ? 'monetary' : 'behavioral'}>
                    {`SIG.0${idx + 1}`}
                  </AnalyticalCoordinate>

                  {insight.dimension && (
                    <span className="font-mono text-xs text-slate-500 px-2 py-0.5 rounded bg-slate-100 border border-slate-200/60">
                      {insight.dimension}: {insight.segment || 'Geral'}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Confiança: <strong>{((insight.confidence || 0.95) * 100).toFixed(0)}%</strong></span>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <h3 className="text-xl font-bold tracking-tight text-slate-900 leading-snug">
                  {insight.title}
                </h3>
              </div>

              {/* Factual Observation Card */}
              <div className="mt-5 p-4 rounded-xl border border-slate-100 bg-[#fbfcfd] space-y-2">
                <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                  <Layers className="h-3.5 w-3.5 text-prism-indigo" />
                  <span>Evidência Observada (Fato Determinístico)</span>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed font-sans">
                  {insight.evidence}
                </p>
              </div>

              {/* Hypothesis */}
              {insight.hypothesis && (
                <div className="mt-3 p-3.5 rounded-xl border border-indigo-100/60 bg-indigo-50/30 text-xs text-slate-600 leading-relaxed">
                  <strong className="text-indigo-900 font-semibold font-mono">Hipótese Causal: </strong>
                  {insight.hypothesis}
                </div>
              )}

              {/* Quantitative Footer */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 font-mono text-xs tabular-nums">
                  <span className="text-slate-400">Variação:</span>
                  <span
                    className={clsx(
                      'font-bold px-2 py-0.5 rounded',
                      insight.change > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                    )}
                  >
                    {formatDelta(insight.change)}
                  </span>
                </div>

                <Link
                  href={`/ask?query=${encodeURIComponent(insight.ask_query || insight.title)}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-prism-indigo hover:text-prism-indigoDark transition-colors group"
                >
                  <Bot className="h-3.5 w-3.5" />
                  <span>Interrogar evidências com ASK PRISM</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};

