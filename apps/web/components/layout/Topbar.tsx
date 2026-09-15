'use client';

import React from 'react';
import { Database, Menu, Search, Sparkles, Activity, ShieldCheck } from 'lucide-react';

export interface TopbarProps {
  onOpenCommandPalette: () => void;
  onMobileMenuToggle: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onOpenCommandPalette, onMobileMenuToggle }) => (
  <header className="sticky top-0 z-30 flex h-17 items-center justify-between gap-4 border-b border-slate-200/80 bg-white/90 backdrop-blur-md px-6 lg:px-10 select-none shadow-2xs">
    {/* Mobile Toggle & Left Context */}
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={onMobileMenuToggle}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 lg:hidden shadow-2xs"
        aria-label="Abrir navegação"
      >
        <Menu className="h-4 w-4" />
      </button>
      <div className="hidden sm:flex items-center gap-2.5 text-xs text-slate-500">
        <span className="font-bold text-slate-900">Acme E-Commerce</span>
        <span className="text-slate-300 font-mono">/</span>
        <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
          Executive Workspace
        </span>
      </div>
    </div>

    {/* Center Command Surface */}
    <div className="flex-1 max-w-xl mx-auto">
      <button
        type="button"
        onClick={onOpenCommandPalette}
        className="group relative flex h-10 w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50/80 px-4 text-left transition-all duration-200 hover:border-indigo-300 hover:bg-white hover:shadow-xs focus-visible:border-indigo-500 focus-visible:bg-white"
        aria-label="Abrir ASK PRISM e comandos"
      >
        <div className="flex items-center gap-3 min-w-0 notranslate" translate="no">
          <div className="p-1 rounded-md bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-indigo-600 hidden md:inline notranslate" translate="no">
            ASK PRISM
          </span>
          <span className="text-xs text-slate-500 truncate group-hover:text-slate-700 transition-colors">
            Consulte métricas, ticket, anomalias ou comandos…
          </span>
        </div>
        <kbd className="hidden sm:inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-0.5 font-mono text-[10px] font-bold text-slate-500 shadow-2xs group-hover:border-indigo-200 group-hover:text-indigo-600 transition-colors">
          Ctrl K
        </kbd>
      </button>
    </div>

    {/* Right Telemetry & Profile */}
    <div className="flex items-center gap-3 shrink-0">
      <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200/80 bg-slate-50 text-xs font-mono shadow-2xs">
        <Database className="h-3.5 w-3.5 text-indigo-600" />
        <span className="text-slate-700 font-semibold">DuckDB Mart</span>
        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_#10b981]" />
      </div>

      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-xs font-bold text-white shadow-xs ring-2 ring-slate-100"
        aria-label="Usuário Admin"
      >
        AC
      </div>
    </div>
  </header>
);
