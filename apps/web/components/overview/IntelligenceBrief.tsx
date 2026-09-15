'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import clsx from 'clsx';
import { AnalyticalCoordinate } from '@/components/ui/AnalyticalCoordinate';

export interface IntelligenceSignal {
  id: string;
  coordinate: string;
  finding: string;
  evidence: string;
  metricLabel: string;
  metricValue: string;
  dimension: 'monetary' | 'behavioral' | 'structural';
  favorable?: boolean | null;
}

export const IntelligenceBrief: React.FC<{ signals: IntelligenceSignal[] }> = ({ signals }) => (
  <section
    className="prism-panel-master p-6 sm:p-8 lg:p-10 relative overflow-hidden"
    aria-labelledby="brief-section-title"
  >
    {/* Header */}
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-100">
      <div>
        <div className="flex items-center gap-2">
          <AnalyticalCoordinate dimension="behavioral">SIGNALS · EXECUTIVE BRIEF</AnalyticalCoordinate>
          <span className="inline-flex items-center gap-1 font-mono text-[9px] px-2 py-0.5 rounded bg-indigo-50 border border-indigo-100 text-indigo-700 font-semibold">
            <Sparkles className="h-3 w-3" />
            SYNTHESIS
          </span>
        </div>
        <h2
          id="brief-section-title"
          className="mt-2 text-2xl lg:text-3xl font-bold tracking-tight text-slate-900"
        >
          Intelligence Brief
        </h2>
        <p className="mt-1 text-sm text-slate-500 max-w-2xl">
          Síntese determinística dos principais vetores de desempenho e anomalias computadas para a janela ativa.
        </p>
      </div>

      <Link
        href="/insights"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-prism-indigo hover:text-prism-indigoDark transition-colors group"
      >
        <span>Acessar painel completo de evidências</span>
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </div>

    {/* 3-Column Editorial Grid */}
    <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100 mt-6">
      {signals.map((signal, index) => (
        <article
          key={signal.id}
          className={clsx(
            'flex flex-col justify-between py-6 md:py-0',
            index === 0 && 'md:pr-8',
            index === 1 && 'md:px-8',
            index === 2 && 'md:pl-8'
          )}
        >
          <div>
            <div className="flex items-center justify-between">
              <AnalyticalCoordinate dimension={signal.dimension}>
                {signal.coordinate}
              </AnalyticalCoordinate>
              <span className="font-mono text-[10px] text-slate-400">
                0{index + 1} / 0{signals.length}
              </span>
            </div>

            <h3 className="mt-4 text-base lg:text-lg font-bold tracking-tight text-slate-900 leading-snug">
              {signal.finding}
            </h3>

            <p className="mt-2.5 text-xs lg:text-[13px] leading-relaxed text-slate-500">
              {signal.evidence}
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                {signal.metricLabel}
              </p>
              <p
                className={clsx(
                  'mt-0.5 font-mono text-xl font-bold tabular-nums',
                  signal.favorable === true && 'text-emerald-600',
                  signal.favorable === false && 'text-rose-600',
                  signal.favorable == null && 'text-slate-900'
                )}
              >
                {signal.metricValue}
              </p>
            </div>

            <div className="h-8 w-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
        </article>
      ))}
    </div>
  </section>
);

