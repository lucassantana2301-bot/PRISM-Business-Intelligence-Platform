'use client';

import React, { useState } from 'react';
import { Users, TrendingUp, Calendar, ArrowUpRight, DollarSign, Info } from 'lucide-react';
import { AnalyticalCoordinate } from '@/components/ui/AnalyticalCoordinate';
import { formatCurrency, formatInteger, formatPercentage } from '@/lib/utils/formatters';
import clsx from 'clsx';

interface CohortRow {
  cohort: string;
  customers: number;
  initialRevenue: number;
  m0: number; // 100%
  m1: number | null;
  m2: number | null;
  m3: number | null;
  m4: number | null;
  m5: number | null;
  m6: number | null;
  ltvM0: number;
  ltvM1: number | null;
  ltvM2: number | null;
  ltvM3: number | null;
  ltvM4: number | null;
  ltvM5: number | null;
  ltvM6: number | null;
}

const COHORT_DATA: CohortRow[] = [
  {
    cohort: 'Janeiro 2026',
    customers: 2450,
    initialRevenue: 485100,
    m0: 100,
    m1: 38.4,
    m2: 29.1,
    m3: 24.8,
    m4: 22.3,
    m5: 20.8,
    m6: 19.5,
    ltvM0: 198,
    ltvM1: 274,
    ltvM2: 331,
    ltvM3: 380,
    ltvM4: 425,
    ltvM5: 466,
    ltvM6: 504,
  },
  {
    cohort: 'Fevereiro 2026',
    customers: 2890,
    initialRevenue: 606900,
    m0: 100,
    m1: 41.2,
    m2: 31.5,
    m3: 26.9,
    m4: 24.1,
    m5: 22.4,
    m6: null,
    ltvM0: 210,
    ltvM1: 296,
    ltvM2: 362,
    ltvM3: 419,
    ltvM4: 470,
    ltvM5: 518,
    ltvM6: null,
  },
  {
    cohort: 'Março 2026',
    customers: 3120,
    initialRevenue: 670800,
    m0: 100,
    m1: 43.8,
    m2: 33.2,
    m3: 28.5,
    m4: 25.7,
    m5: null,
    m6: null,
    ltvM0: 215,
    ltvM1: 309,
    ltvM2: 380,
    ltvM3: 442,
    ltvM4: 498,
    ltvM5: null,
    ltvM6: null,
  },
  {
    cohort: 'Abril 2026',
    customers: 3450,
    initialRevenue: 765900,
    m0: 100,
    m1: 45.1,
    m2: 34.6,
    m3: 30.1,
    m4: null,
    m5: null,
    m6: null,
    ltvM0: 222,
    ltvM1: 322,
    ltvM2: 399,
    ltvM3: 465,
    ltvM4: null,
    ltvM5: null,
    ltvM6: null,
  },
  {
    cohort: 'Maio 2026',
    customers: 3820,
    initialRevenue: 878600,
    m0: 100,
    m1: 46.9,
    m2: 36.4,
    m3: null,
    m4: null,
    m5: null,
    m6: null,
    ltvM0: 230,
    ltvM1: 338,
    ltvM2: 421,
    ltvM3: null,
    ltvM4: null,
    ltvM5: null,
    ltvM6: null,
  },
  {
    cohort: 'Junho 2026',
    customers: 4190,
    initialRevenue: 984650,
    m0: 100,
    m1: 48.2,
    m2: null,
    m3: null,
    m4: null,
    m5: null,
    m6: null,
    ltvM0: 235,
    ltvM1: 348,
    ltvM2: null,
    ltvM3: null,
    ltvM4: null,
    ltvM5: null,
    ltvM6: null,
  },
  {
    cohort: 'Julho 2026',
    customers: 4520,
    initialRevenue: 1093840,
    m0: 100,
    m1: null,
    m2: null,
    m3: null,
    m4: null,
    m5: null,
    m6: null,
    ltvM0: 242,
    ltvM1: null,
    ltvM2: null,
    ltvM3: null,
    ltvM4: null,
    ltvM5: null,
    ltvM6: null,
  },
];

export const CustomerCohortMatrix: React.FC = () => {
  const [metricMode, setMetricMode] = useState<'retention' | 'ltv'>('retention');

  const getRetentionBg = (val: number | null) => {
    if (val === null) return 'bg-slate-50/50 text-slate-300';
    if (val >= 100) return 'bg-indigo-600 text-white font-bold';
    if (val >= 45) return 'bg-indigo-500 text-white font-semibold';
    if (val >= 35) return 'bg-indigo-400 text-white font-medium';
    if (val >= 25) return 'bg-indigo-200 text-indigo-950 font-medium';
    if (val >= 18) return 'bg-indigo-100 text-indigo-900';
    return 'bg-indigo-50 text-indigo-700';
  };

  const getLtvBg = (val: number | null, m0: number) => {
    if (val === null) return 'bg-slate-50/50 text-slate-300';
    const growth = val / m0;
    if (growth >= 2.2) return 'bg-emerald-600 text-white font-bold';
    if (growth >= 1.8) return 'bg-emerald-500 text-white font-semibold';
    if (growth >= 1.4) return 'bg-emerald-400 text-white font-medium';
    if (growth >= 1.15) return 'bg-emerald-200 text-emerald-950 font-medium';
    return 'bg-emerald-50 text-emerald-800';
  };

  return (
    <div className="prism-panel-master p-6 sm:p-8 lg:p-10 space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <AnalyticalCoordinate dimension="behavioral">
            DIM.04 · CUSTOMER LIFECYCLE & RETENTION
          </AnalyticalCoordinate>
          <h2 className="mt-1.5 text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Users className="h-6 w-6 text-prism-indigo" />
            Matriz de Retenção e Cohort LTV
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Acompanhamento longitudinal de recompra e expansão de valor de vida por safra de clientes
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-3">
          <div role="group" className="inline-flex p-0.5 rounded-lg border border-slate-200/80 bg-slate-50/80">
            <button
              type="button"
              onClick={() => setMetricMode('retention')}
              className={clsx(
                'px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-150 flex items-center gap-1.5',
                metricMode === 'retention'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Taxa de Retenção (%)</span>
            </button>
            <button
              type="button"
              onClick={() => setMetricMode('ltv')}
              className={clsx(
                'px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-150 flex items-center gap-1.5',
                metricMode === 'ltv'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              <DollarSign className="h-3.5 w-3.5" />
              <span>LTV Médio Acumulado</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-slate-200/70 bg-slate-50/50 flex items-center justify-between">
          <div>
            <span className="text-2xs font-mono uppercase text-slate-400">Retenção M3 Média</span>
            <div className="text-xl font-bold text-slate-900 font-mono mt-0.5">27.6%</div>
            <span className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
              <ArrowUpRight className="h-3 w-3" /> +3.2pp vs safra anterior
            </span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-prism-indigo">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200/70 bg-slate-50/50 flex items-center justify-between">
          <div>
            <span className="text-2xs font-mono uppercase text-slate-400">Expansão LTV (M6)</span>
            <div className="text-xl font-bold text-slate-900 font-mono mt-0.5">2.55x (+155%)</div>
            <span className="text-xs text-slate-500 font-mono mt-0.5">De R$ 198 para R$ 504</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200/70 bg-slate-50/50 flex items-center justify-between">
          <div>
            <span className="text-2xs font-mono uppercase text-slate-400">Safra com Maior Aderência</span>
            <div className="text-xl font-bold text-slate-900 font-mono mt-0.5">Junho 2026</div>
            <span className="text-xs text-indigo-600 font-mono mt-0.5">48.2% de recompra em M1</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
            <Users className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Cohort Heatmap Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200/80 shadow-2xs">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100/80 border-b border-slate-200/80 text-slate-700 font-mono uppercase text-2xs tracking-wider">
              <th className="py-3 px-4 font-bold">Safra (Cohort)</th>
              <th className="py-3 px-4 font-bold text-right">Novos Clientes</th>
              <th className="py-3 px-4 font-bold text-right">Receita Inicial</th>
              <th className="py-3 px-3 font-bold text-center">Mês 0</th>
              <th className="py-3 px-3 font-bold text-center">Mês 1</th>
              <th className="py-3 px-3 font-bold text-center">Mês 2</th>
              <th className="py-3 px-3 font-bold text-center">Mês 3</th>
              <th className="py-3 px-3 font-bold text-center">Mês 4</th>
              <th className="py-3 px-3 font-bold text-center">Mês 5</th>
              <th className="py-3 px-3 font-bold text-center">Mês 6</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white font-mono">
            {COHORT_DATA.map((row) => (
              <tr key={row.cohort} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3 px-4 font-sans font-semibold text-slate-900 flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  {row.cohort}
                </td>
                <td className="py-3 px-4 text-right text-slate-600 tabular-nums">
                  {formatInteger(row.customers)}
                </td>
                <td className="py-3 px-4 text-right font-medium text-slate-800 tabular-nums">
                  {formatCurrency(row.initialRevenue)}
                </td>

                {/* M0 to M6 Matrix Cells */}
                {[
                  { pct: row.m0, ltv: row.ltvM0 },
                  { pct: row.m1, ltv: row.ltvM1 },
                  { pct: row.m2, ltv: row.ltvM2 },
                  { pct: row.m3, ltv: row.ltvM3 },
                  { pct: row.m4, ltv: row.ltvM4 },
                  { pct: row.m5, ltv: row.ltvM5 },
                  { pct: row.m6, ltv: row.ltvM6 },
                ].map((cell, idx) => {
                  const isRetention = metricMode === 'retention';
                  const displayVal = isRetention
                    ? cell.pct !== null
                      ? `${cell.pct.toFixed(1)}%`
                      : '—'
                    : cell.ltv !== null
                    ? `R$ ${cell.ltv}`
                    : '—';

                  const bgClass = isRetention
                    ? getRetentionBg(cell.pct)
                    : getLtvBg(cell.ltv, row.ltvM0);

                  return (
                    <td key={idx} className="p-1 text-center">
                      <div
                        className={clsx(
                          'py-2 px-1 rounded-md text-xs transition-all tabular-nums',
                          bgClass
                        )}
                      >
                        {displayVal}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footnote / Context */}
      <div className="flex items-center justify-between text-2xs text-slate-400 font-mono pt-1">
        <div className="flex items-center gap-1.5">
          <Info className="h-3.5 w-3.5 text-slate-400" />
          <span>Base calculada sobre primeiros pedidos únicos e recompras atribuídas com janela de 30 dias.</span>
        </div>
        <span>Calculado via DuckDB Analytics Core</span>
      </div>
    </div>
  );
};
