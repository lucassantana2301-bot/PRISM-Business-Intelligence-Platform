'use client';

import React from 'react';
import { ArrowRight, Sparkles, Shield, Cpu } from 'lucide-react';

interface EnterSceneProps {
  onEnter: () => void;
  isTransitioning: boolean;
}

export const EnterScene: React.FC<EnterSceneProps> = ({ onEnter, isTransitioning }) => {
  return (
    <section
      id="act-08-enter-prism"
      className="min-h-screen relative flex flex-col justify-center items-center px-6 py-20 text-center select-none"
      aria-label="Act 8 — Enter PRISM"
    >
      <div
        className={`max-w-3xl w-full space-y-8 z-10 transition-all duration-700 ${
          isTransitioning ? 'opacity-0 scale-90 blur-sm pointer-events-none' : 'opacity-100 scale-100'
        }`}
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-500/40 text-blue-300 text-xs font-mono shadow-md shadow-blue-500/10">
          <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
          <span>PORTAL DE INTELIGÊNCIA ATIVADO</span>
        </div>

        <div className="space-y-3">
          <h2 className="text-5xl sm:text-7xl md:text-8xl font-black text-white font-sans tracking-tight uppercase">
            PRISM
          </h2>
          <p className="text-lg sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-indigo-200 to-white font-sans">
            Ask. Understand. Decide.
          </p>
        </div>

        <p className="text-base sm:text-lg text-slate-400 font-sans max-w-xl mx-auto leading-relaxed">
          Transforme montanhas de dados desconexos em decisões executivas imediatas.
        </p>

        {/* Primary Cinematic CTA */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            type="button"
            onClick={onEnter}
            disabled={isTransitioning}
            className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 text-white font-sans font-bold text-base shadow-xl shadow-blue-600/30 hover:shadow-blue-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer overflow-hidden border border-blue-400/40"
          >
            {/* Shimmer light sweep */}
            <span className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />
            
            <span>ENTRAR NO PRISM</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Security & Engine Verification Tags */}
        <div className="flex items-center justify-center gap-6 pt-8 text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Sandbox AST Segura</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-blue-400" />
            <span>DuckDB OLAP 60fps</span>
          </div>
        </div>
      </div>
    </section>
  );
};
