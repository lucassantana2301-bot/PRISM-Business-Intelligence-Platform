'use client';

import React from 'react';
import { ArrowRight, Activity, Zap, CheckCircle2 } from 'lucide-react';

interface SignalSceneProps {
  actProgress: number;
}

export const SignalScene: React.FC<SignalSceneProps> = ({ actProgress }) => {
  const rawSources = [
    { label: 'Transações Brutas', value: '771 ord', rate: '2.4ms' },
    { label: 'Sessões Clickstream', value: '18,510 sess', rate: '0.8ms' },
    { label: 'Catálogo de Produtos', value: '25 skus', rate: '1.1ms' },
    { label: 'Histórico Temporal', value: '2025-2026', rate: '3.0ms' },
  ];

  const distilledSignals = [
    { label: 'Receita Bruta (GMV)', value: '$865.3K', delta: '+9.6%', color: 'text-blue-400 border-blue-500/30' },
    { label: 'Taxa de Conversão', value: '4.23%', delta: '+3.9%', color: 'text-emerald-400 border-emerald-500/30' },
    { label: 'Ticket Médio (AOV)', value: '$1,092.46', delta: '-1.4%', color: 'text-indigo-400 border-indigo-500/30' },
    { label: 'Saúde do Funil', value: '99.98%', delta: 'Ótimo', color: 'text-purple-400 border-purple-500/30' },
  ];

  return (
    <section
      id="act-03-noise-to-signal"
      className="min-h-screen relative flex flex-col justify-center items-center px-6 py-20 select-none"
      aria-label="Act 3 — From Noise to Signal"
    >
      <div className="max-w-5xl w-full space-y-12 z-10">
        {/* Section Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/50 border border-indigo-800/40 text-indigo-300 text-xs font-mono">
            <Activity className="w-3.5 h-3.5 text-indigo-400" />
            <span>CONVERGÊNCIA SEMÂNTICA</span>
          </div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white font-sans tracking-tight">
            DO RUÍDO AO SINAL.
          </h2>

          <p className="text-lg sm:text-xl font-medium text-slate-400 font-sans max-w-xl mx-auto">
            Dados brutos são dispersão. A convergência pelo PRISM gera clareza executiva.
          </p>
        </div>

        {/* Spatial Transformation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
          {/* Left: Raw Inputs */}
          <div className="md:col-span-4 space-y-2.5">
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 px-1 font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
              <span>ENTRADAS DESORDENADAS</span>
            </div>
            {rawSources.map((s, idx) => (
              <div
                key={s.label}
                className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between font-mono text-xs text-slate-300 backdrop-blur-xs transition-all hover:border-slate-700"
                style={{
                  transform: `translateX(${(1 - Math.min(actProgress * 1.5, 1)) * (idx % 2 === 0 ? -12 : 12)}px)`,
                }}
              >
                <div>
                  <div className="text-slate-300 font-sans font-medium text-xs">{s.label}</div>
                  <div className="text-[10px] text-slate-400">{s.value}</div>
                </div>
                <span className="text-[10px] text-slate-400">{s.rate}</span>
              </div>
            ))}
          </div>

          {/* Center: PRISM Transformation Core Beacon */}
          <div className="md:col-span-3 flex flex-col items-center justify-center p-4 text-center space-y-2">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-500 p-[1px] shadow-lg shadow-blue-500/25 animate-pulse">
              <div className="h-full w-full bg-[#07090E] rounded-[15px] flex items-center justify-center">
                <Zap className="w-6 h-6 text-blue-400" />
              </div>
            </div>
            <div className="text-xs font-mono font-bold text-white tracking-wider">PRISM CORE</div>
            <div className="text-[10px] font-mono text-blue-400 tracking-tight">DUCKDB + AST CANONICAL</div>
          </div>

          {/* Right: Pure Synthesized Signals */}
          <div className="md:col-span-4 space-y-2.5">
            <div className="text-[11px] font-mono uppercase tracking-wider text-blue-400 px-1 font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              <span>SINAIS SEMÂNTICOS DIRECIONADOS</span>
            </div>
            {distilledSignals.map((sig) => (
              <div
                key={sig.label}
                className={`p-3 rounded-xl bg-slate-900/80 border ${sig.color} flex items-center justify-between font-mono text-xs backdrop-blur-md shadow-sm`}
              >
                <div>
                  <div className="text-slate-300 font-sans font-medium text-xs">{sig.label}</div>
                  <div className="text-white font-bold text-sm mt-0.5">{sig.value}</div>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] font-semibold text-slate-200">
                    {sig.delta}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Narrative Epigram */}
        <div className="text-center pt-4">
          <p className="text-sm font-mono uppercase tracking-[0.25em] text-slate-400">
            DADOS NÃO SÃO A RESPOSTA. <span className="text-white font-bold">COMPREENSÃO É.</span>
          </p>
        </div>
      </div>
    </section>
  );
};
