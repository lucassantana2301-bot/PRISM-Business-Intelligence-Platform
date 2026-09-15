'use client';

import React from 'react';
import { Database, AlertTriangle, Cpu, Layers } from 'lucide-react';

interface ProblemSceneProps {
  actProgress: number;
}

export const ProblemScene: React.FC<ProblemSceneProps> = ({ actProgress }) => {
  const isFrozen = actProgress > 0.55;

  return (
    <section
      id="act-02-the-problem"
      className="min-h-screen relative flex flex-col justify-center items-center px-6 py-20 overflow-hidden select-none"
      aria-label="Act 2 — The Problem"
    >
      {/* Floating Disordered Data Noise Cloud */}
      <div
        className={`absolute inset-0 pointer-events-none transition-all duration-700 ${
          isFrozen ? 'opacity-20 blur-[1px]' : 'opacity-70'
        }`}
        aria-hidden="true"
      >
        {/* Floating JSON & SQL Snippets */}
        <div className="absolute top-[12%] left-[8%] p-3 rounded-lg bg-slate-900/70 border border-slate-800/80 font-mono text-[10px] text-slate-400 font-normal shadow-xl backdrop-blur-xs max-w-[240px] animate-pulse">
          <code>{`{ "event": "order_pending", "amount": 1092.46, "user_id": "usr_99812", "lat": 44.12 }`}</code>
        </div>

        <div className="absolute top-[22%] right-[10%] p-3 rounded-lg bg-slate-900/70 border border-slate-800/80 font-mono text-[10px] text-slate-400 font-normal shadow-xl backdrop-blur-xs max-w-[220px]">
          <code>{`SELECT sum(subtotal) FROM raw_events WHERE status = 'err';`}</code>
        </div>

        <div className="absolute bottom-[18%] left-[12%] p-3 rounded-lg bg-slate-900/70 border border-slate-800/80 font-mono text-[10px] text-amber-400/80 font-normal shadow-xl backdrop-blur-xs max-w-[260px]">
          <code>{`[WARN] 18,510 sessions: 32.5% drop-off at catalog_browse_index`}</code>
        </div>

        <div className="absolute bottom-[25%] right-[8%] p-3 rounded-lg bg-slate-900/70 border border-slate-800/80 font-mono text-[10px] text-slate-400 font-normal shadow-xl backdrop-blur-xs max-w-[200px]">
          <code>{`[METRICS] GMV $865.2k | conv 4.23% | aov $1,092.46 | drift +3.9%`}</code>
        </div>

        {/* Scattered Raw Data Stream Badges */}
        <div className="absolute top-[48%] left-[4%] hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-slate-400">
          <Database className="w-3 h-3 text-slate-400" />
          <span>PostgreSQL: 1,498,200 rows</span>
        </div>

        <div className="absolute top-[52%] right-[4%] hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-slate-400">
          <Cpu className="w-3 h-3 text-slate-400" />
          <span>Clickstream Buffer: 48,290 eps</span>
        </div>
      </div>

      {/* Narrative Editorial Hierarchy */}
      <div className="relative z-10 max-w-4xl text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950/40 border border-rose-800/40 text-rose-400 text-xs font-mono">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>O DILEMA DA INFORMAÇÃO</span>
        </div>

        <div className="space-y-4">
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-slate-300 font-sans tracking-tight">
            Empresas não sofrem por <span className="text-white">falta de dados</span>.
          </h2>

          <div
            className={`transition-all duration-1000 ${
              isFrozen
                ? 'opacity-100 translate-y-0 scale-100'
                : 'opacity-40 translate-y-4 scale-95'
            }`}
          >
            <p className="text-4xl sm:text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-white font-sans tracking-tight pt-2">
              Elas sofrem por falta de clareza.
            </p>
          </div>
        </div>

        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto font-sans leading-relaxed">
          Tabelas infinitas, dashboards desconexos e métricas isoladas criam sobrecarga cognitiva. O ruído esconde a decisão.
        </p>

        {isFrozen && (
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-950/60 border border-blue-500/40 text-blue-300 text-xs font-mono animate-fade-in shadow-lg shadow-blue-500/10">
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            <span>RUÍDO CONGELADO // NÚCLEO PRISM ATIVADO</span>
          </div>
        )}
      </div>
    </section>
  );
};
