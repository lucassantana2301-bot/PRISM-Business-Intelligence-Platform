'use client';

import React, { useState } from 'react';
import {
  X,
  Terminal,
  Database,
  Layers,
  Copy,
  Check,
  Zap,
  Activity,
  Cpu,
  Clock,
  ArrowRight,
  Code2,
  HardDrive,
  FileCode,
} from 'lucide-react';

export interface QueryInspectorData {
  title?: string;
  sql?: string;
  executionTimeMs?: number;
  rowsProcessed?: number;
  memoryUsedMb?: number;
  cacheHit?: boolean;
  partitionPruned?: boolean;
  ast?: Record<string, any>;
  explainPlan?: Array<{
    node: string;
    type: string;
    cost: string;
    rows: number;
    description: string;
  }>;
}

interface QueryInspectorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  data?: QueryInspectorData | null;
  onOpenInCloudShell?: (sql: string) => void;
}

const defaultData: QueryInspectorData = {
  title: 'Executive Revenue Mart Aggregation',
  sql: `SELECT 
    DATE_TRUNC('day', o.order_date) AS metric_date,
    SUM(o.total_revenue) AS gross_revenue,
    SUM(o.total_revenue - o.discount_amount) AS net_revenue,
    COUNT(DISTINCT o.order_id) AS total_orders,
    AVG(o.total_revenue) AS aov,
    (COUNT(DISTINCT CASE WHEN s.is_converted THEN s.session_id END)::DOUBLE / NULLIF(COUNT(DISTINCT s.session_id), 0)) * 100 AS conversion_rate
FROM orders o
JOIN sessions s ON o.session_id = s.session_id
WHERE o.order_date >= '2026-10-02' AND o.order_date <= '2026-10-31'
  AND o.status = 'Completed'
GROUP BY 1
ORDER BY 1 ASC;`,
  executionTimeMs: 0.24,
  rowsProcessed: 15277,
  memoryUsedMb: 2.4,
  cacheHit: true,
  partitionPruned: true,
  ast: {
    type: 'SelectStatement',
    target: 'AnalyticalMart',
    time_window: { start: '2026-10-02', end: '2026-10-31', grain: 'day' },
    metrics: ['gross_revenue', 'net_revenue', 'total_orders', 'aov', 'conversion_rate'],
    filters: [{ column: 'status', op: 'eq', value: 'Completed' }],
    security_sandbox: { read_only: true, ast_validated: true, limit_applied: true },
  },
  explainPlan: [
    { node: '04 · PROJECTION', type: 'Result', cost: '0.01ms', rows: 30, description: 'Format metric decimals and timezone alignments' },
    { node: '03 · HASH AGGREGATE', type: 'Aggregate', cost: '0.08ms', rows: 30, description: 'Group by DATE_TRUNC(day) with parallel SIMD sum' },
    { node: '02 · FILTER & JOIN', type: 'HashJoin', cost: '0.10ms', rows: 771, description: 'HashJoin orders (Completed) with session telemetry' },
    { node: '01 · VECTORIZED SCAN', type: 'ParquetScan', cost: '0.05ms', rows: 15277, description: 'Columnar scan on DuckDB buffer pool with partition pruning' },
  ],
};

export const QueryInspectorDrawer: React.FC<QueryInspectorDrawerProps> = ({
  isOpen,
  onClose,
  data = defaultData,
  onOpenInCloudShell,
}) => {
  const currentData = data || defaultData;
  const [activeTab, setActiveTab] = useState<'sql' | 'plan' | 'ast' | 'telemetry'>('sql');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    const textToCopy =
      activeTab === 'sql'
        ? currentData.sql || ''
        : JSON.stringify(activeTab === 'ast' ? currentData.ast : currentData.explainPlan, null, 2);
    void navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex justify-end animate-fade-in">
      <div className="w-full max-w-2xl bg-[#0e121b] border-l border-[#242b3b] h-full flex flex-col justify-between shadow-2xl text-slate-200 animate-in slide-in-from-right duration-200 font-sans">
        {/* Drawer Header */}
        <div className="p-5 sm:p-6 border-b border-[#242b3b] bg-[#121722] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 shadow-2xs">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Query Execution Plan & AST Inspector
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
                  EXPLAIN VALIDATED
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {currentData.title || 'DuckDB Vector Execution Engine'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Fechar inspetor"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Telemetry Micro-Bar (AWS Athena Style) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-[#242b3b] border-b border-[#242b3b] text-xs font-mono">
          <div className="p-3 bg-[#111622]">
            <span className="text-slate-500 block text-[9px] uppercase tracking-wider flex items-center gap-1">
              <Clock className="w-2.5 h-2.5 text-cyan-400" />
              Tempo de Execução
            </span>
            <span className="text-white font-bold block mt-1">
              {currentData.executionTimeMs || 0.24}ms
            </span>
          </div>

          <div className="p-3 bg-[#111622]">
            <span className="text-slate-500 block text-[9px] uppercase tracking-wider flex items-center gap-1">
              <Layers className="w-2.5 h-2.5 text-indigo-400" />
              Linhas Processadas
            </span>
            <span className="text-white font-bold block mt-1">
              {(currentData.rowsProcessed || 15277).toLocaleString()}
            </span>
          </div>

          <div className="p-3 bg-[#111622]">
            <span className="text-slate-500 block text-[9px] uppercase tracking-wider flex items-center gap-1">
              <HardDrive className="w-2.5 h-2.5 text-purple-400" />
              Memória Alocada
            </span>
            <span className="text-white font-bold block mt-1">
              {currentData.memoryUsedMb || 2.4} MB
            </span>
          </div>

          <div className="p-3 bg-[#111622]">
            <span className="text-slate-500 block text-[9px] uppercase tracking-wider flex items-center gap-1">
              <Zap className="w-2.5 h-2.5 text-emerald-400" />
              Vector Cache
            </span>
            <span className="text-emerald-400 font-bold block mt-1">
              {currentData.cacheHit ? 'HIT (100%)' : 'MISS'}
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-[#242b3b] bg-[#0e121b]">
          <button
            type="button"
            onClick={() => setActiveTab('sql')}
            className={`pb-3 text-xs font-mono font-medium flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'sql'
                ? 'border-indigo-500 text-white font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>SQL Canônico</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('plan')}
            className={`pb-3 text-xs font-mono font-medium flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'plan'
                ? 'border-indigo-500 text-white font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Árvore EXPLAIN</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ast')}
            className={`pb-3 text-xs font-mono font-medium flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'ast'
                ? 'border-indigo-500 text-white font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>AST Semântico</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 font-mono text-xs">
          {/* Tab 1: SQL */}
          {activeTab === 'sql' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[11px]">Query gerada e validada pelo AST Allowlist Sandbox:</span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#1c2230] hover:bg-[#252d40] text-slate-300 transition-colors text-[10px]"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copiado!' : 'Copiar SQL'}</span>
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-[#080a10] border border-[#242b3b] text-cyan-300 overflow-x-auto leading-relaxed text-[11px] shadow-inner selection:bg-indigo-500 selection:text-white">
                {currentData.sql}
              </pre>
            </div>
          )}

          {/* Tab 2: Execution Plan Tree */}
          {activeTab === 'plan' && (
            <div className="space-y-3">
              <p className="text-slate-400 text-[11px]">
                Plano de execução física com particionamento columnar e SIMD hash aggregation:
              </p>

              <div className="space-y-2.5 pt-2">
                {currentData.explainPlan?.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-[#121622] border border-[#242b3b] flex items-start justify-between gap-4 transition-all hover:border-slate-600"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs">{step.node}</span>
                        <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[9px]">
                          {step.type}
                        </span>
                      </div>
                      <p className="text-slate-400 font-sans text-xs leading-normal">
                        {step.description}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-bold text-emerald-400 block">{step.cost}</span>
                      <span className="text-[10px] text-slate-500 block">{step.rows} linhas</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: AST Semântico */}
          {activeTab === 'ast' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[11px]">Árvore de Sintaxe Abstrata tipada (Pydantic / TypeScript):</span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#1c2230] hover:bg-[#252d40] text-slate-300 transition-colors text-[10px]"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copiado!' : 'Copiar JSON'}</span>
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-[#080a10] border border-[#242b3b] text-indigo-300 overflow-x-auto leading-relaxed text-[11px] shadow-inner">
                {JSON.stringify(currentData.ast, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#242b3b] bg-[#121722] flex items-center justify-between">
          <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-cyan-400" />
            DuckDB Core v1.0.0 · Vector Engine
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-xs font-mono text-slate-400 hover:text-white"
            >
              Fechar
            </button>

            {onOpenInCloudShell && (
              <button
                type="button"
                onClick={() => {
                  onOpenInCloudShell(currentData.sql || '');
                  onClose();
                }}
                className="px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 shadow-sm"
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Abrir no CloudShell</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
