'use client';

import React from 'react';
import { MessageSquareCode, ArrowDown, Check, Terminal, Cpu, Search, Sparkles } from 'lucide-react';

interface AskSceneProps {
  actProgress: number;
}

export const AskScene: React.FC<AskSceneProps> = ({ actProgress }) => {
  const pipelineSteps = [
    {
      id: 'step-1',
      label: 'PERGUNTA HUMANA',
      sub: '"Por que a receita caiu no período?"',
      icon: MessageSquareCode,
      status: 'active',
      time: '0.0ms',
    },
    {
      id: 'step-2',
      label: 'RESOLUÇÃO DE CONTEXTO',
      sub: 'Mapeamento de 30D, Canal E-commerce & Tabela Orders',
      icon: Search,
      status: actProgress > 0.25 ? 'active' : 'pending',
      time: '12.4ms',
    },
    {
      id: 'step-3',
      label: 'PARSER SEMÂNTICO & AST',
      sub: 'Geração de AST SQL strictly read-only com LIMIT 100',
      icon: Terminal,
      status: actProgress > 0.5 ? 'active' : 'pending',
      time: '34.8ms',
    },
    {
      id: 'step-4',
      label: 'COMPUTAÇÃO DUCKDB',
      sub: 'Varredura colunar de 18.5k sessões e 771 pedidos',
      icon: Cpu,
      status: actProgress > 0.75 ? 'active' : 'pending',
      time: '48.1ms',
    },
  ];

  return (
    <section
      id="act-04-ask"
      className="min-h-screen relative flex flex-col justify-center items-center px-6 py-20 select-none"
      aria-label="Act 4 — Ask"
    >
      <div className="max-w-4xl w-full space-y-10 z-10">
        {/* Typographic Hero */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/50 border border-blue-800/40 text-blue-300 text-xs font-mono">
            <MessageSquareCode className="w-3.5 h-3.5 text-blue-400" />
            <span>LINGUAGEM NATURAL // NL-TO-SQL CANÔNICO</span>
          </div>

          <h2 className="text-5xl sm:text-6xl md:text-7xl font-black text-white font-sans tracking-tight">
            ASK.
          </h2>

          <p className="text-slate-400 font-sans text-base sm:text-lg max-w-lg mx-auto">
            Interaja com sua base de dados na linguagem do seu negócio. O PRISM decompõe a intenção com rigor matemático.
          </p>
        </div>

        {/* Simulated Prompt Terminal Box */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl p-5 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              <span className="text-xs font-mono text-slate-400 ml-2">PRISM // PIPELINE CONVERSACIONAL</span>
            </div>
            <span className="text-[10px] font-mono text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/50">
              AST VERIFICADO
            </span>
          </div>

          {/* User Query Simulation */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-blue-400 shrink-0 animate-pulse" />
              <span className="text-sm font-sans font-medium text-white">
                {'"Qual foi a causa principal da oscilação de receita no último trimestre?"'}
              </span>
            </div>
            <span className="text-xs font-mono text-slate-400 hidden sm:inline">Ctrl+K</span>
          </div>

          {/* 4-Stage Execution Pipeline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {pipelineSteps.map((step) => {
              const Icon = step.icon;
              const isDone = step.status === 'active';
              return (
                <div
                  key={step.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isDone
                      ? 'bg-slate-950/80 border-blue-500/40 text-slate-200'
                      : 'bg-slate-950/30 border-slate-800/50 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-3.5 h-3.5 ${isDone ? 'text-blue-400' : 'text-slate-400'}`} />
                      <span className="text-[11px] font-mono font-bold tracking-wider">{step.label}</span>
                    </div>
                    {isDone && (
                      <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        {step.time}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 font-sans">{step.sub}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
