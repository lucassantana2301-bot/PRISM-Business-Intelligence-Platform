'use client';

import React from 'react';
import { Layers, Database, Shield, Cpu, Sparkles, Terminal, Check } from 'lucide-react';

interface ArchitectureSceneProps {
  actProgress: number;
}

export const ArchitectureScene: React.FC<ArchitectureSceneProps> = ({ actProgress }) => {
  const architecturalLayers = [
    {
      step: '01',
      title: 'Fontes de Dados & Ingestão',
      desc: 'Conectores agnósticos para PostgreSQL, Parquet e Data Marts transacionais.',
      icon: Database,
      tag: 'CANONICAL DATA MART',
    },
    {
      step: '02',
      title: 'Sandbox de Segurança AST',
      desc: 'Validação estrita em nível de árvore sintática (SELECT-only, sem DDL/DML, LIMIT compulsório).',
      icon: Shield,
      tag: 'AST VALIDATION',
    },
    {
      step: '03',
      title: 'DuckDB Embedded OLAP',
      desc: 'Motor de cálculo colunar ultrarrápido em memória local com latência submilisegundo.',
      icon: Cpu,
      tag: 'IN-MEMORY DUCKDB',
    },
    {
      step: '04',
      title: 'Camada Semântica Canônica',
      desc: 'Fórmulas analíticas unificadas para prevenir divergências entre equipes.',
      icon: Layers,
      tag: 'SEMANTIC METRIC CATALOG',
    },
    {
      step: '05',
      title: 'Inteligência Agnostica de Provedor',
      desc: 'Protocolos desacoplados compatíveis com Gemini, Claude e modelos locais.',
      icon: Sparkles,
      tag: 'LLM PROVIDER PROTOCOL',
    },
    {
      step: '06',
      title: 'Terminal Executivo de Decisão',
      desc: 'Interface de alta densidade projetada para velocidade e clareza cognitiva.',
      icon: Terminal,
      tag: 'HIGH-DENSITY PRESENTATION',
    },
  ];

  return (
    <section
      id="act-07-built-different"
      className="min-h-screen relative flex flex-col justify-center items-center px-6 py-20 select-none"
      aria-label="Act 7 — Built Different"
    >
      <div className="max-w-5xl w-full space-y-12 z-10">
        {/* Typographic Hero */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/50 border border-blue-800/40 text-blue-300 text-xs font-mono">
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            <span>ARQUITETURA DE ENGENHARIA</span>
          </div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white font-sans tracking-tight">
            BUILT FOR UNDERSTANDING.
          </h2>

          <p className="text-slate-400 font-sans text-base sm:text-lg max-w-xl mx-auto">
            Uma pilha de engenharia de dados construída para responder, raciocinar e decidir sem comprometer a segurança.
          </p>
        </div>

        {/* Dynamic Architectural Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {architecturalLayers.map((layer, idx) => {
            const Icon = layer.icon;
            const isHighlighted = actProgress > idx * 0.14;
            return (
              <div
                key={layer.step}
                className={`p-5 rounded-2xl border transition-all duration-300 backdrop-blur-md ${
                  isHighlighted
                    ? 'bg-slate-900/80 border-blue-500/40 shadow-lg shadow-blue-500/5'
                    : 'bg-slate-900/30 border-slate-800/60 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono text-blue-400 font-bold px-2 py-0.5 rounded bg-blue-950/60 border border-blue-800/40">
                    CAMADA {layer.step}
                  </span>
                  <span className="text-[9px] font-mono text-slate-400">{layer.tag}</span>
                </div>

                <div className="flex items-center gap-3 my-2">
                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-blue-400 shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-white font-sans">{layer.title}</h3>
                </div>

                <p className="text-xs text-slate-400 font-sans leading-relaxed mt-2">{layer.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Verified Principles Pill Bar */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          {[
            'FAST BY DESIGN',
            'LOCAL-FIRST ANALYTICS',
            'EXPLORABLE BY HUMANS',
            'QUERYABLE BY LANGUAGE',
            'BUILT FOR DECISIONS',
          ].map((principle) => (
            <span
              key={principle}
              className="px-3 py-1 rounded-full bg-slate-900/70 border border-slate-800 text-[11px] font-mono text-slate-300 flex items-center gap-1.5"
            >
              <Check className="w-3 h-3 text-emerald-400" />
              <span>{principle}</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};
