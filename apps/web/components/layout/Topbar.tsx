'use client';

import React, { useState } from 'react';
import {
  Database,
  Menu,
  Search,
  Sparkles,
  Activity,
  Globe,
  ChevronDown,
  Terminal,
  ShieldCheck,
  Check,
  Zap,
} from 'lucide-react';
import { useRegion, REGIONS, ENVIRONMENTS } from '@/lib/context/RegionContext';

export interface TopbarProps {
  onOpenCommandPalette: () => void;
  onMobileMenuToggle: () => void;
  onOpenCloudShell?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  onOpenCommandPalette,
  onMobileMenuToggle,
  onOpenCloudShell,
}) => {
  const { activeRegion, setActiveRegion, activeEnv, setActiveEnv, cacheHitRate } = useRegion();
  const [showRegionMenu, setShowRegionMenu] = useState(false);
  const [showEnvMenu, setShowEnvMenu] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-17 items-center justify-between gap-3 border-b border-slate-200/80 bg-white/95 backdrop-blur-md px-4 sm:px-6 lg:px-8 select-none shadow-2xs">
      {/* 1. Mobile Toggle & AWS-Style Environment Selector */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMobileMenuToggle}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 lg:hidden shadow-2xs"
          aria-label="Abrir navegação"
        >
          <Menu className="h-4 w-4" />
        </button>

        {/* AWS Organization & Tenant Switcher Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowEnvMenu(!showEnvMenu)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50/80 hover:bg-white hover:border-slate-300 transition-all text-xs shadow-2xs"
          >
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900">{activeEnv.account}</span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-emerald-100 text-emerald-800 uppercase">
                {activeEnv.id}
              </span>
            </div>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showEnvMenu && (
            <div className="absolute top-full left-0 mt-1.5 w-64 rounded-xl bg-white border border-slate-200 p-1.5 shadow-xl z-50 space-y-1 animate-in zoom-in-95 duration-100 font-sans">
              <p className="px-2.5 py-1 text-[10px] font-mono uppercase text-slate-400 font-bold">
                Ambiente Corporativo
              </p>
              {ENVIRONMENTS.map((env) => (
                <button
                  key={env.id}
                  type="button"
                  onClick={() => {
                    setActiveEnv(env);
                    setShowEnvMenu(false);
                  }}
                  className={`w-full flex items-center justify-between p-2 rounded-lg text-xs text-left transition-colors ${
                    activeEnv.id === env.id ? 'bg-indigo-50 font-bold text-indigo-950' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div>
                    <span className="block">{env.name}</span>
                    <span className="block text-[10px] font-mono text-slate-400">{env.accountId}</span>
                  </div>
                  {activeEnv.id === env.id && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 2. Center Command & Search Dock */}
      <div className="flex-1 max-w-lg mx-auto">
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="group relative flex h-10 w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 text-left transition-all duration-200 hover:border-indigo-300 hover:bg-white hover:shadow-xs focus-visible:border-indigo-500 focus-visible:bg-white"
          aria-label="Abrir ASK PRISM e comandos"
        >
          <div className="flex items-center gap-2.5 min-w-0 notranslate" translate="no">
            <div className="p-1 rounded-md bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-indigo-600 hidden md:inline notranslate" translate="no">
              ASK PRISM
            </span>
            <span className="text-xs text-slate-500 truncate group-hover:text-slate-700 transition-colors">
              Consulte faturamento, canais, ROAS ou comandos…
            </span>
          </div>
          <kbd className="hidden sm:inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-0.5 font-mono text-[10px] font-bold text-slate-500 shadow-2xs group-hover:border-indigo-200 group-hover:text-indigo-600 transition-colors">
            Ctrl K
          </kbd>
        </button>
      </div>

      {/* 3. Right: AWS Multi-Region Switcher, CloudShell & Telemetry */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* AWS Global Region Selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowRegionMenu(!showRegionMenu)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200/80 bg-slate-50 hover:bg-white hover:border-slate-300 transition-all text-xs font-mono shadow-2xs"
          >
            <span className="text-sm leading-none">{activeRegion.flag}</span>
            <span className="font-bold text-slate-800 hidden sm:inline">{activeRegion.id}</span>
            <span className="text-[10px] text-cyan-600 font-semibold">({activeRegion.latencyMs}ms)</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showRegionMenu && (
            <div className="absolute top-full right-0 mt-1.5 w-64 rounded-xl bg-white border border-slate-200 p-1.5 shadow-xl z-50 space-y-1 animate-in zoom-in-95 duration-100 font-sans">
              <p className="px-2.5 py-1 text-[10px] font-mono uppercase text-slate-400 font-bold">
                Região Analítica Ativa
              </p>
              {REGIONS.map((reg) => (
                <button
                  key={reg.id}
                  type="button"
                  onClick={() => {
                    setActiveRegion(reg);
                    setShowRegionMenu(false);
                  }}
                  className={`w-full flex items-center justify-between p-2 rounded-lg text-xs text-left transition-colors font-mono ${
                    activeRegion.id === reg.id ? 'bg-indigo-50 font-bold text-indigo-950' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{reg.flag}</span>
                    <div>
                      <span className="block font-bold">{reg.id}</span>
                      <span className="block text-[10px] text-slate-500 font-sans">{reg.location}</span>
                    </div>
                  </div>
                  <span className="text-cyan-600 text-[10px] font-bold">{reg.latencyMs}ms</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Vector Cache Telemetry Badge */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200/80 bg-slate-50 text-[11px] font-mono shadow-2xs">
          <Zap className="w-3.5 h-3.5 text-emerald-600" />
          <span className="text-slate-600">Cache:</span>
          <strong className="text-emerald-700 font-bold">{cacheHitRate}%</strong>
        </div>

        {/* CloudShell Launcher Button */}
        {onOpenCloudShell && (
          <button
            type="button"
            onClick={onOpenCloudShell}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-mono font-bold transition-all shadow-xs"
            title="Abrir PRISM CloudShell Terminal"
          >
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">CloudShell</span>
          </button>
        )}
      </div>
    </header>
  );
};
