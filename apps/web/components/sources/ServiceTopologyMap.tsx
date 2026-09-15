'use client';

import React, { useState } from 'react';
import {
  Database,
  Server,
  Cloud,
  Layers,
  Cpu,
  Zap,
  Activity,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Radio,
  Sparkles,
  Bot,
  BarChart3,
  HardDrive,
} from 'lucide-react';

interface TopologyNode {
  id: string;
  title: string;
  subtitle: string;
  type: 'source' | 'engine' | 'semantic' | 'consumer';
  icon: any;
  status: 'healthy' | 'warning' | 'standby';
  throughput: string;
  latency: string;
  details: Record<string, string>;
}

const nodes: TopologyNode[] = [
  {
    id: 's3_lake',
    title: 'S3 Parquet Lake',
    subtitle: 'Canonical Raw Ingestion',
    type: 'source',
    icon: Cloud,
    status: 'healthy',
    throughput: '42.8 MB/s',
    latency: '8ms',
    details: {
      'Storage Format': 'Apache Parquet v2.0',
      'Compression': 'Snappy Columnar',
      'Partitions': 'date_key=2026-10',
      'Total Volume': '369,066 Records',
    },
  },
  {
    id: 'duckdb_olap',
    title: 'DuckDB Vector OLAP',
    subtitle: 'In-Memory SIMD Core',
    type: 'engine',
    icon: Database,
    status: 'healthy',
    throughput: '1.2 GB/s Scan',
    latency: '0.24ms',
    details: {
      'Execution Model': 'Vectorized Morsel-Driven',
      'Buffer Pool': '256 MB Allocated',
      'Concurrency': '8 Parallel SIMD Threads',
      'Cache Hit': '99.4% Memory Hit Rate',
    },
  },
  {
    id: 'semantic_ast',
    title: 'Semantic Refraction AST',
    subtitle: 'Pydantic & Intent Sandbox',
    type: 'semantic',
    icon: ShieldCheck,
    status: 'healthy',
    throughput: '850 ops/sec',
    latency: '1.2ms',
    details: {
      'Governance': 'Strict Read-Only Sandbox',
      'Validation': 'AST Allowlist Filtering',
      'Timeout Guard': '5,000ms Auto-Kill',
      'Row Hard-Limit': '1,000 Rows per Turn',
    },
  },
  {
    id: 'bi_cockpit',
    title: 'Executive Cockpit',
    subtitle: 'Next.js Interactive Mart',
    type: 'consumer',
    icon: BarChart3,
    status: 'healthy',
    throughput: '60 FPS UI',
    latency: '14ms E2E',
    details: {
      'Renderer': 'Recharts & Metric Cards',
      'State Sync': 'Zustand + Next.js App Router',
      'Reconciliation': '0.00% Formula Delta',
    },
  },
  {
    id: 'voice_ai',
    title: 'PRISM Voice & NL-AI',
    subtitle: 'Speech & Decision Agent',
    type: 'consumer',
    icon: Bot,
    status: 'healthy',
    throughput: 'Live WebSocket',
    latency: '180ms TTS',
    details: {
      'Speech Synthesis': 'Web Audio API Native',
      'Audio Waveform': 'Dynamic Analyzer',
      'Confidence': '96% Decision Accuracy',
    },
  },
];

export const ServiceTopologyMap: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<TopologyNode>(nodes[1]);

  return (
    <div className="prism-panel-master p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-mono font-bold tracking-wider uppercase">
              <Activity className="w-3 h-3 text-indigo-600" />
              AWS Resource Topology
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
              <CheckCircle2 className="w-3 h-3" />
              5/5 Nodes Healthy
            </span>
          </div>
          <h3 className="mt-2 text-xl font-bold text-slate-900 tracking-tight">
            Mapa Topológico de Infraestrutura & Pipeline Analítico
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Visualização de ponta a ponta dos nós do sistema: da ingestão colunar em Parquet ao processamento SIMD e entrega para a IA.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
          <span className="px-3 py-1 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs">
            Throughput Geral: <strong className="text-slate-900">1.2 GB/s</strong>
          </span>
        </div>
      </div>

      {/* Interactive Topology Graph Flow */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-[#0c101a] via-[#101524] to-[#0a0d16] border border-[#242b3b] shadow-inner text-white space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
          {/* Node 1: S3 Parquet Lake */}
          <div
            onClick={() => setSelectedNode(nodes[0])}
            className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
              selectedNode.id === 's3_lake'
                ? 'bg-indigo-950/60 border-indigo-400 ring-2 ring-indigo-500/30 shadow-lg'
                : 'bg-[#141926]/90 border-[#242b3b] hover:border-slate-500'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <Cloud className="w-4 h-4" />
              </div>
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#10b981]" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-cyan-400 block font-semibold">STAGE 01 · SOURCE</span>
              <h4 className="text-sm font-bold text-white mt-0.5">S3 Parquet Lake</h4>
              <p className="text-[11px] text-slate-400 font-mono mt-1">369k canonical rows</p>
            </div>
            <div className="pt-2 border-t border-[#242b3b] flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>{nodes[0].throughput}</span>
              <span className="text-cyan-300">{nodes[0].latency}</span>
            </div>
          </div>

          {/* Node 2: DuckDB OLAP Engine */}
          <div
            onClick={() => setSelectedNode(nodes[1])}
            className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
              selectedNode.id === 'duckdb_olap'
                ? 'bg-indigo-950/60 border-indigo-400 ring-2 ring-indigo-500/30 shadow-lg'
                : 'bg-[#141926]/90 border-[#242b3b] hover:border-slate-500'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
                <Database className="w-4 h-4" />
              </div>
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#10b981]" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-indigo-400 block font-semibold">STAGE 02 · OLAP ENGINE</span>
              <h4 className="text-sm font-bold text-white mt-0.5">DuckDB Vector Core</h4>
              <p className="text-[11px] text-slate-400 font-mono mt-1">SIMD Vectorized Mart</p>
            </div>
            <div className="pt-2 border-t border-[#242b3b] flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>{nodes[1].throughput}</span>
              <span className="text-indigo-300 font-bold">{nodes[1].latency}</span>
            </div>
          </div>

          {/* Node 3: Semantic Refraction AST */}
          <div
            onClick={() => setSelectedNode(nodes[2])}
            className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
              selectedNode.id === 'semantic_ast'
                ? 'bg-indigo-950/60 border-indigo-400 ring-2 ring-indigo-500/30 shadow-lg'
                : 'bg-[#141926]/90 border-[#242b3b] hover:border-slate-500'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#10b981]" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-purple-400 block font-semibold">STAGE 03 · SEMANTICS</span>
              <h4 className="text-sm font-bold text-white mt-0.5">Refraction AST</h4>
              <p className="text-[11px] text-slate-400 font-mono mt-1">Read-Only Sandbox</p>
            </div>
            <div className="pt-2 border-t border-[#242b3b] flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>{nodes[2].throughput}</span>
              <span className="text-purple-300">{nodes[2].latency}</span>
            </div>
          </div>

          {/* Node 4: Consumers (BI & Voice AI) */}
          <div
            onClick={() => setSelectedNode(nodes[3])}
            className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
              selectedNode.id === 'bi_cockpit' || selectedNode.id === 'voice_ai'
                ? 'bg-indigo-950/60 border-indigo-400 ring-2 ring-indigo-500/30 shadow-lg'
                : 'bg-[#141926]/90 border-[#242b3b] hover:border-slate-500'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#10b981]" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-emerald-400 block font-semibold">STAGE 04 · CONSUMERS</span>
              <h4 className="text-sm font-bold text-white mt-0.5">Dashboard & Voice AI</h4>
              <p className="text-[11px] text-slate-400 font-mono mt-1">Executive Delivery</p>
            </div>
            <div className="pt-2 border-t border-[#242b3b] flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>Zero Drop</span>
              <span className="text-emerald-300">{nodes[3].latency}</span>
            </div>
          </div>
        </div>

        {/* Selected Node Telemetry Deep-Dive */}
        <div className="p-5 rounded-xl bg-[#141926] border border-[#242b3b] space-y-4 animate-fade-in">
          <div className="flex items-center justify-between border-b border-[#242b3b] pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
                <selectedNode.icon className="w-4 h-4" />
              </div>
              <div>
                <h5 className="text-sm font-bold text-white">{selectedNode.title} — Especificação Detalhada</h5>
                <span className="text-[10px] font-mono text-slate-400">{selectedNode.subtitle}</span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
              STATUS: OPERACIONAL
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            {Object.entries(selectedNode.details).map(([key, val]) => (
              <div key={key} className="p-3 rounded-lg bg-[#0e121c] border border-[#242b3b]">
                <span className="text-slate-500 text-[10px] block uppercase">{key}</span>
                <span className="text-slate-200 font-semibold block mt-1">{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
