'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowDown, ArrowRight, Sparkles } from 'lucide-react';

interface HeroSceneProps {
  onEnterDirectly: () => void;
  onScrollDown: () => void;
}

export const HeroScene: React.FC<HeroSceneProps> = ({ onEnterDirectly, onScrollDown }) => {
  return (
    <section
      id="act-01-the-prism"
      className="min-h-screen relative flex flex-col justify-between items-center px-6 py-12 sm:py-16 text-center select-none"
      aria-label="Act 1 — The PRISM"
    >
      {/* Top Header Tag & Direct Bypass */}
      <header className="w-full max-w-6xl flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-indigo-500 via-blue-500 to-purple-400 p-[1px] shadow-sm shadow-blue-500/30">
            <div className="h-full w-full bg-[#07090E] rounded-[6px] flex items-center justify-center">
              <span className="font-bold text-xs text-blue-400">▲</span>
            </div>
          </div>
          <span className="font-mono text-xs font-semibold tracking-widest text-slate-300 uppercase">
            PRISM // BI PLATFORM
          </span>
        </div>

        <button
          type="button"
          onClick={onEnterDirectly}
          className="group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-mono font-medium transition-all backdrop-blur-md"
        >
          <span>Acesso direto ao Dashboard</span>
          <ArrowRight className="w-3.5 h-3.5 text-blue-400 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </header>

      {/* Main Editorial Statement & Protagonist Anchor */}
      <div className="my-auto max-w-4xl space-y-6 z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/40 border border-blue-800/40 text-blue-400 text-xs font-mono tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>EXPERIÊNCIA INSTITUCIONAL COMPUTACIONAL</span>
        </div>

        <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter text-white font-sans uppercase">
          PRISM
        </h1>

        <div className="space-y-2">
          <p className="text-xs sm:text-sm font-mono uppercase tracking-[0.3em] text-slate-400">
            Business Intelligence Platform
          </p>
          <p className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-indigo-200 to-purple-300 font-sans">
            Ask. Understand. Decide.
          </p>
        </div>

        <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto font-sans leading-relaxed pt-2">
          Transformação de dados brutos e telemetria fragmentada em compreensão semântica e decisão executiva instantânea.
        </p>
      </div>

      {/* Bottom Scroll Prompt */}
      <div className="flex flex-col items-center gap-3 z-20 pt-8">
        <button
          type="button"
          onClick={onScrollDown}
          className="group flex flex-col items-center gap-2 text-slate-400 hover:text-white transition-colors cursor-pointer"
          aria-label="Rolar para compreender o próximo ato"
        >
          <span className="text-[11px] font-mono tracking-widest uppercase text-slate-400 group-hover:text-blue-400 transition-colors">
            ROLANDO PARA COMPREENDER
          </span>
          <div className="p-2 rounded-full border border-slate-800 group-hover:border-blue-500/50 group-hover:bg-blue-950/30 transition-all animate-bounce">
            <ArrowDown className="w-4 h-4 text-blue-400" />
          </div>
        </button>
      </div>
    </section>
  );
};
