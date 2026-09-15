'use client';

import React from 'react';
import { Database, Menu, Search, Sparkles } from 'lucide-react';

export interface TopbarProps {
  onOpenCommandPalette: () => void;
  onMobileMenuToggle: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onOpenCommandPalette, onMobileMenuToggle }) => (
  <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-prism-hairline bg-white/95 backdrop-blur-md px-6 lg:px-8 select-none">
    {/* Mobile Toggle & Left Context */}
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={onMobileMenuToggle}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-prism-hairline text-prism-ink hover:bg-prism-porcelain lg:hidden"
        aria-label="Abrir navegação"
      >
        <Menu className="h-4 w-4" />
      </button>
      <div className="hidden sm:flex items-center gap-2 text-xs text-prism-muted">
        <span className="font-semibold text-prism-ink">Acme Corp</span>
        <span className="text-prism-hairlineHover">/</span>
        <span className="font-medium text-prism-muted">Executive Telemetry</span>
      </div>
    </div>

    {/* Center Command Surface */}
    <div className="flex-1 max-w-xl mx-auto">
      <button
        type="button"
        onClick={onOpenCommandPalette}
        className="group relative flex h-10 w-full items-center justify-between rounded-lg border border-prism-hairline bg-[#f8f9fc] px-3.5 text-left transition-all duration-150 hover:border-prism-hairlineHover hover:bg-white hover:shadow-sm focus-visible:border-prism-indigo focus-visible:bg-white"
        aria-label="Abrir ASK PRISM e comandos"
      >
        <div className="flex items-center gap-2.5 min-w-0 notranslate" translate="no">
          <Sparkles className="h-3.5 w-3.5 text-prism-indigo shrink-0 transition-transform group-hover:scale-110" />
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-prism-indigo hidden md:inline notranslate" translate="no">
            ASK PRISM
          </span>
          <span className="text-xs text-prism-muted truncate">
            Interrogue seus dados com linguagem natural...
          </span>
        </div>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-prism-hairline bg-white px-2 py-0.5 font-mono text-[10px] font-medium text-prism-muted shadow-2xs">
          Ctrl K
        </kbd>
      </button>
    </div>

    {/* Right Telemetry & Profile */}
    <div className="flex items-center gap-3 shrink-0">
      <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-md border border-prism-hairline bg-[#f8f9fc] text-[11px] font-mono">
        <Database className="h-3.5 w-3.5 text-prism-cyanDark" />
        <span className="text-prism-muted">DuckDB</span>
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 prism-live-dot" />
      </div>

      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#080c16] text-xs font-bold text-white shadow-xs"
        aria-label="Usuário Admin"
      >
        AC
      </div>
    </div>
  </header>
);

