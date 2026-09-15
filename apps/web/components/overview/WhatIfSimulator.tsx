'use client';

import React, { useState } from 'react';
import {
  Sliders,
  TrendingUp,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Calculator,
  DollarSign,
  Percent,
} from 'lucide-react';
import { formatCurrency, formatDelta, formatPercentage } from '@/lib/utils/formatters';

interface WhatIfSimulatorProps {
  baseRevenue?: number;
  baseConversion?: number;
  baseAov?: number;
  baseOrders?: number;
}

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({
  baseRevenue = 865262.5,
  baseConversion = 4.23,
  baseAov = 1092.46,
  baseOrders = 771,
}) => {
  // Simulator Sliders
  const [adSpendDelta, setAdSpendDelta] = useState<number>(0); // -50% to +100%
  const [convDelta, setConvDelta] = useState<number>(0); // -1.0% to +2.0%
  const [aovDelta, setAovDelta] = useState<number>(0); // -R$ 100 to +R$ 200

  // Calculations
  const simulatedConv = Math.max(0.5, +(baseConversion + convDelta).toFixed(2));
  const convMultiplier = simulatedConv / baseConversion;

  const simulatedAov = Math.max(100, Math.round(baseAov + aovDelta));
  const aovMultiplier = simulatedAov / baseAov;

  // Ad spend elasticity (~0.65 elasticity)
  const trafficMultiplier = 1 + (adSpendDelta / 100) * 0.65;

  const simulatedOrders = Math.round(baseOrders * convMultiplier * trafficMultiplier);
  const simulatedRevenue = Math.round(simulatedOrders * simulatedAov);
  const revenueDifference = simulatedRevenue - baseRevenue;
  const percentChange = (revenueDifference / baseRevenue) * 100;

  // Estimated profit assuming 42% gross margin and incremental ad costs
  const baseAdSpend = 96200;
  const newAdSpend = baseAdSpend * (1 + adSpendDelta / 100);
  const deltaAdSpend = newAdSpend - baseAdSpend;
  const estimatedProfitDelta = Math.round(revenueDifference * 0.42 - deltaAdSpend);

  const handleReset = () => {
    setAdSpendDelta(0);
    setConvDelta(0);
    setAovDelta(0);
  };

  const isPositive = revenueDifference >= 0;

  return (
    <div className="prism-panel-master p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-mono font-bold tracking-wider uppercase">
              <Calculator className="w-3 h-3 text-indigo-600" />
              What-If Forecasting Engine
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
              Projeção em Tempo Real
            </span>
          </div>
          <h3 className="mt-2 text-xl font-bold text-slate-900 tracking-tight">
            Simulador de Cenários Comerciais & Projeção &ldquo;E Se?&rdquo;
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Ajuste os controles deslizantes para simular o impacto de investimentos em mídia paga, otimização de conversão e ticket médio no faturamento consolidado.
          </p>
        </div>

        {(adSpendDelta !== 0 || convDelta !== 0 || aovDelta !== 0) && (
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white text-xs text-slate-600 font-medium transition-colors shadow-2xs self-start"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurar Padrão</span>
          </button>
        )}
      </div>

      {/* Sliders Grid & Result Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: 3 Interactive Sliders (7 cols) */}
        <div className="lg:col-span-7 space-y-5 p-5 rounded-2xl bg-slate-50/70 border border-slate-200">
          {/* Slider 1: Ad Spend */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-slate-900 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-indigo-600" />
                <span>Investimento em Ads (Mídia Paga)</span>
              </label>
              <span className="font-mono font-bold px-2 py-0.5 rounded bg-white border border-slate-200 text-indigo-700 shadow-2xs">
                {adSpendDelta >= 0 ? `+${adSpendDelta}%` : `${adSpendDelta}%`}
              </span>
            </div>
            <input
              type="range"
              min="-50"
              max="100"
              step="5"
              value={adSpendDelta}
              onChange={(e) => setAdSpendDelta(parseInt(e.target.value, 10))}
              className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>-50% (Corte)</span>
              <span>Baseline (0%)</span>
              <span>+100% (Dobro)</span>
            </div>
          </div>

          {/* Slider 2: Conversion Rate */}
          <div className="space-y-2 pt-2 border-t border-slate-200/80">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-slate-900 flex items-center gap-1.5">
                <Percent className="w-3.5 h-3.5 text-emerald-600" />
                <span>Taxa de Conversão da Loja</span>
              </label>
              <span className="font-mono font-bold px-2 py-0.5 rounded bg-white border border-slate-200 text-emerald-700 shadow-2xs">
                {simulatedConv.toFixed(2)}% ({convDelta >= 0 ? `+${convDelta.toFixed(1)}%` : `${convDelta.toFixed(1)}%`})
              </span>
            </div>
            <input
              type="range"
              min="-1.5"
              max="2.0"
              step="0.1"
              value={convDelta}
              onChange={(e) => setConvDelta(parseFloat(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>2.73% (-1.5%)</span>
              <span>4.23% (Atual)</span>
              <span>6.23% (+2.0%)</span>
            </div>
          </div>

          {/* Slider 3: Ticket Médio (AOV) */}
          <div className="space-y-2 pt-2 border-t border-slate-200/80">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-slate-900 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-cyan-600" />
                <span>Ticket Médio por Pedido</span>
              </label>
              <span className="font-mono font-bold px-2 py-0.5 rounded bg-white border border-slate-200 text-cyan-800 shadow-2xs">
                {formatCurrency(simulatedAov)} ({aovDelta >= 0 ? `+${formatCurrency(aovDelta)}` : formatCurrency(aovDelta)})
              </span>
            </div>
            <input
              type="range"
              min="-200"
              max="300"
              step="10"
              value={aovDelta}
              onChange={(e) => setAovDelta(parseInt(e.target.value, 10))}
              className="w-full accent-cyan-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>-R$ 200</span>
              <span>{formatCurrency(baseAov)} (Atual)</span>
              <span>+R$ 300</span>
            </div>
          </div>
        </div>

        {/* Right: Projected Outcome Display (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-gradient-to-br from-indigo-50/70 via-white to-slate-50 border border-indigo-200/80 shadow-2xs space-y-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-700 font-bold block">
              Resultado Simulado do Cenário
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <h4 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-mono tracking-tight tabular-nums">
                {formatCurrency(simulatedRevenue)}
              </h4>
            </div>

            <div className="mt-2 flex items-center gap-2 flex-wrap font-mono text-xs">
              <span
                className={`px-2.5 py-1 rounded-lg font-bold border ${
                  isPositive
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-rose-100 text-rose-800 border-rose-300'
                }`}
              >
                {formatDelta(percentChange)} ({isPositive ? `+${formatCurrency(revenueDifference)}` : formatCurrency(revenueDifference)})
              </span>
            </div>
          </div>

          <div className="divide-y divide-indigo-100 text-xs font-mono pt-2">
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-500 font-sans">Pedidos Projetados:</span>
              <strong className="text-slate-900 font-bold tabular-nums">{simulatedOrders.toLocaleString()} pedidos</strong>
            </div>

            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-500 font-sans">Lucro Incremental Líquido:</span>
              <strong className={`font-bold tabular-nums ${estimatedProfitDelta >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {estimatedProfitDelta >= 0 ? `+${formatCurrency(estimatedProfitDelta)}` : formatCurrency(estimatedProfitDelta)}
              </strong>
            </div>

            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-500 font-sans">Conversão Resultante:</span>
              <strong className="text-indigo-700 font-bold tabular-nums">{simulatedConv.toFixed(2)}%</strong>
            </div>
          </div>

          <p className="text-[10px] text-slate-400 font-mono pt-1">
            * Modelo matemático com elasticidade padrão DuckDB e margem bruta de 42%.
          </p>
        </div>
      </div>
    </div>
  );
};
