'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Terminal,
  X,
  Minimize2,
  Maximize2,
  Play,
  Trash2,
  Database,
  Cpu,
  CheckCircle2,
  ChevronRight,
  HardDrive,
} from 'lucide-react';

interface CloudShellDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

interface CommandHistoryItem {
  id: string;
  command: string;
  output: string;
  isError?: boolean;
  time: string;
}

export const CloudShellDrawer: React.FC<CloudShellDrawerProps> = ({
  isOpen,
  onClose,
  initialQuery = '',
}) => {
  const [history, setHistory] = useState<CommandHistoryItem[]>([
    {
      id: 'init-1',
      command: 'prism --version',
      output: 'PRISM Decision System v2.4 (DuckDB Engine v1.0.0-vector)\nCluster: sa-east-1 (São Paulo) · 8 SIMD Cores active.\nType "help" to view available diagnostic commands.',
      time: '15:00:00',
    },
  ]);
  const [input, setInput] = useState(initialQuery);
  const [isExpanded, setIsExpanded] = useState(false);
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialQuery) {
      setInput(initialQuery);
    }
  }, [initialQuery]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
      terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, history]);

  if (!isOpen) return null;

  const handleRunCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = input.trim();
    if (!cmd) return;

    const time = new Date().toLocaleTimeString('pt-BR');
    let out = '';
    let isErr = false;

    const lower = cmd.toLowerCase();

    if (lower === 'clear' || lower === 'cls') {
      setHistory([]);
      setInput('');
      return;
    } else if (lower === 'help') {
      out = `COMANDOS DISPONÍVEIS:
  • show tables                  -> Lista conjuntos de dados canônicos
  • status                       -> Diagnóstico de latência e nós DuckDB
  • select ...                   -> Executa consulta analítica interativa
  • explain <query>              -> Gera árvore de execução AST
  • cluster                      -> Exibe topologia e região ativa
  • clear                        -> Limpa o terminal`;
    } else if (lower === 'show tables' || lower === 'tables') {
      out = `+---------------+-------------------+-----------------------+
| TABLE_NAME    | ESTIMATED_ROWS    | FORMAT                |
+---------------+-------------------+-----------------------+
| orders        | 15,277            | Parquet Columnar      |
| order_items   | 23,313            | Parquet Columnar      |
| sessions      | 369,066           | Parquet Columnar      |
| products      | 363               | In-Memory Cache       |
| customers     | 10,000            | In-Memory Cache       |
| campaigns     | 14                | In-Memory Cache       |
+---------------+-------------------+-----------------------+`;
    } else if (lower === 'status') {
      out = `PRISM CLUSTER TELEMETRY:
  Region:         sa-east-1 (São Paulo, BR)
  Engine:         DuckDB Vectorized Mart v1.0.0
  Memory Pool:    256 MB Allocated (2.4 MB Used)
  Cache Hit:      99.4% SIMD Hit Rate
  AST Sandbox:    ENFORCED (Strict Read-Only)`;
    } else if (lower === 'cluster') {
      out = `ACTIVE NODES:
  • Ingestion:   S3 Parquet Lake [ONLINE - 42.8 MB/s]
  • Processor:   DuckDB Vector Engine [ONLINE - 0.24ms avg]
  • Semantics:   AST Refraction Guard [ONLINE - 850 ops/sec]
  • Delivery:    Executive Cockpit & Voice AI [ONLINE]`;
    } else if (lower.startsWith('select')) {
      out = `+-------------+------------------+---------------+--------------+
| ORDER_ID    | TOTAL_REVENUE    | STATUS        | CHANNEL      |
+-------------+------------------+---------------+--------------+
| ORD-8921    | $349.00          | Completed     | Organic      |
| ORD-8920    | $129.50          | Completed     | Paid Search  |
| ORD-8918    | $899.00          | Completed     | Direct       |
+-------------+------------------+---------------+--------------+
3 rows returned in 0.18ms. Buffer scanned: 15,277 records.`;
    } else {
      out = `Comando executado: "${cmd}".\nResultado computado com sucesso em 0.22ms no cluster local DuckDB.`;
    }

    setHistory((prev) => [
      ...prev,
      {
        id: `cmd-${Date.now()}`,
        command: cmd,
        output: out,
        isError: isErr,
        time,
      },
    ]);
    setInput('');
  };

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-50 bg-[#0a0d14] border-t border-[#232a3b] shadow-2xl transition-all duration-200 flex flex-col font-mono text-xs ${
        isExpanded ? 'h-[75vh]' : 'h-80 sm:h-96'
      }`}
    >
      {/* Terminal Bar Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#10141f] border-b border-[#232a3b] text-slate-300 select-none">
        <div className="flex items-center gap-2.5">
          <div className="p-1 rounded bg-indigo-500/20 text-indigo-400">
            <Terminal className="w-4 h-4" />
          </div>
          <span className="font-bold text-white tracking-wide">PRISM CloudShell</span>
          <span className="px-2 py-0.2 rounded text-[10px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
            sa-east-1 · DuckDB Live
          </span>
        </div>

        <div className="flex items-center gap-2 text-slate-400">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Expandir terminal"
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Fechar terminal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Terminal Stream Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-[11px] leading-relaxed">
        {history.map((item) => (
          <div key={item.id} className="space-y-1">
            <div className="flex items-center gap-2 text-slate-400">
              <span className="text-cyan-400 font-bold">prism@sa-east-1:~$</span>
              <span className="text-white font-bold">{item.command}</span>
              <span className="text-[10px] text-slate-600 ml-auto">{item.time}</span>
            </div>
            <pre className="text-emerald-400 whitespace-pre-wrap pl-4 border-l border-slate-800">
              {item.output}
            </pre>
          </div>
        ))}
        <div ref={terminalEndRef} />
      </div>

      {/* Terminal Input Form */}
      <form
        onSubmit={handleRunCommand}
        className="flex items-center gap-2 p-3 bg-[#0e121c] border-t border-[#232a3b]"
      >
        <span className="text-cyan-400 font-bold shrink-0 flex items-center gap-1">
          <span>prism@sa-east-1:~$</span>
        </span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='Digite um comando ou query (ex: "show tables", "status", "select * from orders")...'
          className="flex-1 bg-transparent text-white placeholder:text-slate-600 focus:outline-none text-[11px]"
        />
        <button
          type="submit"
          className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] flex items-center gap-1 transition-colors"
        >
          <Play className="w-3 h-3 fill-current" />
          <span>Executar</span>
        </button>
      </form>
    </div>
  );
};
