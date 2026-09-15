'use client';

import React from 'react';
import { Database, TrendingUp, Layers, GitFork, Cpu, ShieldCheck } from 'lucide-react';

interface UnderstandSceneProps {
  actProgress: number;
}

export const UnderstandScene: React.FC<UnderstandSceneProps> = ({ actProgress }) => {
  const engineNodes = [
    {
      title: 'DuckDB In-Memory OLAP',
      desc: 'Execução colunar ultrarrápida diretamente em memória local.',
      icon: Database,
      active: true,
    },
    {
      title: 'Catálogo de Métricas Semântico',
      desc: 'Fórmulas canônicas imutáveis para GMV, AOV, Conversão e LTV.',
      icon: Layers,
      active: actProgress > 0.3,
    },
    {
      title: 'Detecção de Anomalias & Drift',
      desc: 'Análise estatística contínua de desvios e telemetria de funil.',
      icon: GitFork,
      active: actProgress > 0.6,
    },
  ];

  return (
    <section
      id="act-05-understand"
      className="min-h-screen relative flex flex-col justify-center items-center px-6 py-20 select-none"
      aria-label="Act 5 — Understand"
    >
      <div className="max-w-5xl w-full space-y-12 z-10">
        {/* Typographic Hero */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 text-xs font-mono">
            <Cpu className="w-3.5 h-3.5" />
            <span>MECANISMO ANALÍTICO CANÔNICO</span>
          </div>

          <h2 className="text-5xl sm:text-6xl md:text-7xl font-black text-white font-sans tracking-tight">
            UNDERSTAND.
          </h2>

          <p className="text-slate-400 font-sans text-base sm:text-lg max-w-lg mx-auto">
            O PRISM não apenas plota gráficos. Ele reconcilia fluxos relacionais em modelos analíticos consistentes.
          </p>
        </div>

        {/* Spatial Architecture Mesh */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {engineNodes.map((node, idx) => {
            const Icon = node.icon;
            return (
              <div
                key={node.title}
                className={`p-6 rounded-2xl border transition-all duration-500 backdrop-blur-md ${
                  node.active
                    ? 'bg-slate-900/80 border-indigo-500/40 shadow-xl shadow-indigo-500/10'
                    : 'bg-slate-900/30 border-slate-800/60 opacity-60'
                }`}
              >
                <div className="h-10 w-10 rounded-xl bg-indigo-950/80 border border-indigo-700/50 flex items-center justify-center text-indigo-400 mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white font-sans">{node.title}</h3>
                <p className="text-xs text-slate-400 font-sans leading-relaxed mt-2">{node.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Real Analytical Metrics Showcase */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>RECONCILIAÇÃO CANÔNICA EM TEMPO REAL (MÊS CORRENTE)</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">DUCKDB ENGINE 0.9+</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <div className="text-[10px] font-mono text-slate-400 uppercase">RECEITA BRUTA (GMV)</div>
              <div className="text-xl sm:text-2xl font-mono font-bold text-white mt-1">$865,262.50</div>
              <div className="text-[10px] font-mono text-emerald-400 mt-0.5">+9.6% MoM</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <div className="text-[10px] font-mono text-slate-400 uppercase">PEDIDOS CONFIRMADOS</div>
              <div className="text-xl sm:text-2xl font-mono font-bold text-white mt-1">771</div>
              <div className="text-[10px] font-mono text-emerald-400 mt-0.5">+5.8% MoM</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <div className="text-[10px] font-mono text-slate-400 uppercase">TAXA DE CONVERSÃO</div>
              <div className="text-xl sm:text-2xl font-mono font-bold text-white mt-1">4.23%</div>
              <div className="text-[10px] font-mono text-emerald-400 mt-0.5">+3.9% MoM</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <div className="text-[10px] font-mono text-slate-400 uppercase">VALOR MÉDIO (AOV)</div>
              <div className="text-xl sm:text-2xl font-mono font-bold text-white mt-1">$1,092.46</div>
              <div className="text-[10px] font-mono text-slate-400 mt-0.5">Estável</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
