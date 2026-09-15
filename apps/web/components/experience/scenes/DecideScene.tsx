'use client';

import React from 'react';
import { Target, CheckCircle2, TrendingUp, Sparkles, ArrowRight } from 'lucide-react';

interface DecideSceneProps {
  actProgress: number;
}

export const DecideScene: React.FC<DecideSceneProps> = ({ actProgress }) => {
  return (
    <section
      id="act-06-decide"
      className="min-h-screen relative flex flex-col justify-center items-center px-6 py-20 select-none"
      aria-label="Act 6 — Decide"
    >
      <div className="max-w-4xl w-full space-y-12 text-center z-10">
        {/* Typographic Hero */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/50 border border-emerald-800/40 text-emerald-400 text-xs font-mono">
            <Target className="w-3.5 h-3.5" />
            <span>SÍNTESE EXECUTIVA // DECISÃO ACIONÁVEL</span>
          </div>

          <h2 className="text-5xl sm:text-6xl md:text-7xl font-black text-white font-sans tracking-tight">
            DECIDE.
          </h2>

          <p className="text-slate-400 font-sans text-base sm:text-lg max-w-lg mx-auto">
            A complexidade analítica colapsa em direcionamento executivo direto.
          </p>
        </div>

        {/* Executive Clarity Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          {/* Executive Direct Insight 1 */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-blue-950/40 border border-blue-500/40 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-blue-400 tracking-wider">DIRETRIZ DE CRESCIMENTO</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[11px] font-mono font-bold">
                +9.6% DELTA
              </span>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-mono font-bold text-white">$865.3K</div>
              <div className="text-xs text-slate-400 font-sans">Receita Bruta Gerada (Período de 30 Dias)</div>
            </div>
            <p className="text-xs text-slate-300 font-sans leading-relaxed border-t border-slate-800/80 pt-3">
              A categoria líder Eletrônicos concentrou 58.4% do volume. Recomendada manutenção de estoque para o próximo ciclo de demanda.
            </p>
          </div>

          {/* Executive Direct Insight 2 */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-emerald-950/40 border border-emerald-500/40 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-emerald-400 tracking-wider">EFICIÊNCIA DE FUNIL</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[11px] font-mono font-bold">
                4.23% TAXA
              </span>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-mono font-bold text-white">18,510 Sessões</div>
              <div className="text-xs text-slate-400 font-sans">Conversão Acima da Média do Setor</div>
            </div>
            <p className="text-xs text-slate-300 font-sans leading-relaxed border-t border-slate-800/80 pt-3">
              Fluxo de checkout apresentou 52.8% de conversão no carrinho. Desempenho saudável sem necessidade de intervenção imediata.
            </p>
          </div>
        </div>

        {/* Narrative Epigram */}
        <div className="pt-4 space-y-2">
          <p className="text-xs font-mono uppercase tracking-[0.3em] text-slate-400">
            MILHÕES DE PONTOS DE DADOS.
          </p>
          <p className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-200 to-emerald-300 font-sans">
            Uma decisão incontestável.
          </p>
        </div>
      </div>
    </section>
  );
};
