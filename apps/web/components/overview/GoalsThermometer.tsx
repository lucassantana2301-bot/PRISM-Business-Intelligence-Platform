'use client';

import React, { useState } from 'react';
import { Target, CheckCircle2, TrendingUp, AlertCircle, Calendar, Sparkles } from 'lucide-react';
import { formatCurrency, formatPercentage } from '@/lib/utils/formatters';

interface GoalsThermometerProps {
  currentRevenue?: number;
  periodLabel?: string;
}

export const GoalsThermometer: React.FC<GoalsThermometerProps> = ({
  currentRevenue = 865262.5,
  periodLabel = 'Outubro 2026',
}) => {
  const [targetGoal, setTargetGoal] = useState<number>(1000000); // R$ 1.000.000 target
  const percentAchieved = Math.min(100, +(currentRevenue / targetGoal * 100).toFixed(1));
  const remaining = Math.max(0, targetGoal - currentRevenue);

  // Time elapsed in month (assumes day 26 of 31)
  const daysElapsed = 26;
  const totalDaysInMonth = 31;
  const daysRemaining = totalDaysInMonth - daysElapsed;
  const expectedPacingPercent = (daysElapsed / totalDaysInMonth) * 100; // ~83.8%
  const pacingRatio = (percentAchieved / expectedPacingPercent) * 100; // ~103.2%
  const isAheadOfPace = pacingRatio >= 100;

  const requiredDailySales = daysRemaining > 0 ? remaining / daysRemaining : 0;

  return (
    <div className="prism-panel-master p-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 shadow-2xs">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-base font-bold text-slate-900 tracking-tight">
                Termômetro de Metas Comerciais & OKRs ({periodLabel})
              </h4>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                  isAheadOfPace
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}
              >
                {isAheadOfPace ? 'No Ritmo (+103%)' : 'Abaixo do Ritmo'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Acompanhamento de fechamento mensal em tempo real com cálculo de velocidade de vendas.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-400">Meta:</span>
          <strong className="text-slate-900 font-bold px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 shadow-2xs">
            {formatCurrency(targetGoal)}
          </strong>
        </div>
      </div>

      {/* Progress Bar with Milestone Markers */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-indigo-700 font-bold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            {percentAchieved}% Realizado ({formatCurrency(currentRevenue)})
          </span>
          <span className="text-slate-400">
            Faltam: <strong className="text-slate-700">{formatCurrency(remaining)}</strong> ({daysRemaining} dias restantes)
          </span>
        </div>

        {/* Thermometer Bar */}
        <div className="relative h-4 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200 shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 via-indigo-600 to-indigo-700 rounded-full transition-all duration-500 shadow-sm"
            style={{ width: `${percentAchieved}%` }}
          />
          {/* Expected Pace Marker */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-amber-400 z-10 shadow-[0_0_4px_#f59e0b]"
            style={{ left: `${expectedPacingPercent}%` }}
            title={`Ritmo esperado para o dia ${daysElapsed}: ${expectedPacingPercent.toFixed(1)}%`}
          />
        </div>
      </div>

      {/* Pacing Metrics Micro-grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs font-mono">
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
          <span className="text-slate-400 text-[10px] block uppercase">Ritmo Atual (Run-Rate)</span>
          <strong className="text-emerald-700 font-bold block mt-0.5 text-sm">
            {pacingRatio.toFixed(1)}% da Velocidade
          </strong>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
          <span className="text-slate-400 text-[10px] block uppercase">Necessário p/ Bater Meta</span>
          <strong className="text-slate-800 font-bold block mt-0.5 text-sm">
            {formatCurrency(requiredDailySales)} / dia
          </strong>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
          <span className="text-slate-400 text-[10px] block uppercase">Projeção de Fechamento</span>
          <strong className="text-indigo-700 font-bold block mt-0.5 text-sm">
            {formatCurrency(Math.round((currentRevenue / daysElapsed) * totalDaysInMonth))}
          </strong>
        </div>
      </div>
    </div>
  );
};
