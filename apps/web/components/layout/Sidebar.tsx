'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Database,
  Layers,
  MessageSquareCode,
  Sparkles,
  TrendingUp,
  Activity,
  Zap,
} from 'lucide-react';
import clsx from 'clsx';
import { Prism3DSphere } from '@/components/ui/Prism3DSphere';

export interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onMobileClose?: () => void;
}

const navigation = [
  { coordinate: '01', label: 'Visão Geral', detail: 'Executive Cockpit', href: '/dashboard', icon: TrendingUp },
  { coordinate: '02', label: 'Análises Dimensionais', detail: 'Channels & ROAS', href: '/analytics', icon: BarChart3 },
  { coordinate: '03', label: 'Explorador Canônico', detail: '369k+ Raw Mart', href: '/explorer', icon: Database },
  { coordinate: '04', label: 'Radar de Anomalias', detail: 'Proactive Insights', href: '/insights', icon: Sparkles },
  { coordinate: '05', label: 'Pergunte ao PRISM', detail: 'Semantic Refraction', href: '/ask', icon: MessageSquareCode },
  { coordinate: '06', label: 'Fontes & Telemetria', detail: 'DuckDB Engine', href: '/sources', icon: Layers },
];

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggleCollapse, onMobileClose }) => {
  const pathname = usePathname();

  return (
    <aside
      className={clsx(
        'relative flex h-screen flex-col border-r border-[#272c38] bg-[#161922] text-slate-300 transition-all duration-300 select-none overflow-x-hidden shadow-2xl',
        collapsed ? 'w-[4.75rem]' : 'w-68'
      )}
      style={{
        backgroundImage: 'radial-gradient(circle at 10% 0%, rgba(99, 102, 241, 0.08) 0%, transparent 60%), linear-gradient(180deg, #181b24 0%, #14171f 100%)',
      }}
    >
      {/* 1. Brand Header with 3D Sphere Orb */}
      <div className="flex h-17 shrink-0 items-center justify-between border-b border-[#272c38] px-4 bg-[#181b24]/90 backdrop-blur-xs">
        <Link
          href="/"
          onClick={onMobileClose}
          className="flex min-w-0 items-center gap-3.5 text-white group notranslate overflow-visible"
          translate="no"
        >
          <Prism3DSphere size={36} className="transition-transform duration-300 group-hover:scale-110 shrink-0" />
          {!collapsed && (
            <div className="min-w-0 animate-fade-in">
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-[0.2em] text-sm text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300 notranslate" translate="no">
                  PRISM
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/40 text-cyan-300 font-bold tracking-wider shadow-[0_0_8px_rgba(6,182,212,0.25)]">
                  v2.4
                </span>
              </div>
              <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-slate-400 font-medium">
                DECISION SYSTEM
              </p>
            </div>
          )}
        </Link>
        {!collapsed && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#2d3342] bg-[#1e232f] text-slate-400 hover:text-white hover:border-slate-500 transition-colors shadow-2xs"
            aria-label="Recolher navegação"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* 2. Navigation Stream */}
      <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-6" aria-label="Navegação principal">
        <div>
          {!collapsed && (
            <div className="flex items-center justify-between px-3 pb-3">
              <p className="font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-slate-400">
                Instrumentos Analíticos
              </p>
              <span className="flex h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
            </div>
          )}
          <div className="space-y-1.5">
            {navigation.map((item) => {
              const active =
                pathname === item.href || (item.href === '/dashboard' && pathname === '/');
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onMobileClose}
                  title={collapsed ? `${item.label} (${item.coordinate})` : undefined}
                  aria-current={active ? 'page' : undefined}
                  className={clsx(
                    'group relative flex min-h-[2.85rem] items-center gap-3.5 rounded-xl px-3 text-[13px] font-medium transition-all duration-200',
                    collapsed ? 'justify-center' : '',
                    active
                      ? 'bg-gradient-to-r from-indigo-500/25 via-indigo-500/10 to-transparent border-l-2 border-cyan-400 text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),0_0_16px_rgba(6,182,212,0.15)]'
                      : 'border-l-2 border-transparent text-slate-400 hover:bg-white/[0.06] hover:text-slate-100'
                  )}
                >
                  {/* Coordinate Monospace Index */}
                  {!collapsed && (
                    <span
                      className={clsx(
                        'w-4 font-mono text-[10px] tabular-nums font-semibold transition-colors',
                        active ? 'text-cyan-400 font-bold' : 'text-slate-500 group-hover:text-slate-300'
                      )}
                    >
                      {item.coordinate}
                    </span>
                  )}

                  {/* Icon */}
                  <Icon
                    className={clsx(
                      'h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-110',
                      active ? 'text-cyan-400 drop-shadow-[0_0_6px_rgba(6,182,212,0.6)]' : 'text-slate-400 group-hover:text-slate-200'
                    )}
                    strokeWidth={active ? 2 : 1.75}
                  />

                  {/* Label & Detail */}
                  {!collapsed && (
                    <div className="min-w-0 flex-1">
                      <span className="truncate block font-semibold leading-tight">{item.label}</span>
                      <span className="text-[10px] text-slate-400 truncate block font-mono font-normal">
                        {item.detail}
                      </span>
                    </div>
                  )}

                  {/* Active Indicator Pulse */}
                  {active && !collapsed && (
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#38bdf8]" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Quick Refraction Command Button in Sidebar */}
        {!collapsed && (
          <div className="px-1 pt-2">
            <Link
              href="/ask"
              onClick={onMobileClose}
              className="group flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-indigo-950/40 via-[#1d222e] to-[#181c26] border border-indigo-500/30 hover:border-indigo-400/60 transition-all duration-200 shadow-sm"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-indigo-600 text-white shadow-xs">
                  <Zap className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-200 block leading-none group-hover:text-white">
                    Refraction Query
                  </span>
                  <span className="text-[10px] font-mono text-indigo-300 block mt-0.5">
                    NL-to-SQL Ativo
                  </span>
                </div>
              </div>
              <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-black/30 border border-slate-700 text-slate-300">
                /ask
              </span>
            </Link>
          </div>
        )}
      </nav>

      {/* 3. Telemetry Control Room Footer */}
      <div className="shrink-0 border-t border-[#272c38] p-3.5 bg-[#13151c]/95 backdrop-blur-md">
        {!collapsed ? (
          <div className="space-y-3">
            {/* Workspace State */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-slate-400">
                  Instância Ativa
                </p>
                <p className="truncate text-xs font-bold text-slate-100">Acme E-Commerce</p>
              </div>
              <span className="flex items-center gap-1.5 font-mono text-[9px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold tracking-wider shadow-[0_0_8px_rgba(16,185,129,0.2)]">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                ONLINE
              </span>
            </div>

            {/* Telemetry Micro-grid */}
            <div className="border-t border-[#272c38] pt-2.5 grid grid-cols-2 gap-2 text-[10px] font-mono">
              <div className="bg-[#1b1f2a] p-2 rounded-lg border border-[#272c38] flex flex-col justify-between">
                <span className="text-slate-400 block text-[8px] uppercase tracking-wider flex items-center gap-1">
                  <Database className="w-2.5 h-2.5 text-indigo-400" />
                  Engine
                </span>
                <span className="text-slate-200 font-bold truncate block mt-0.5">DuckDB OLAP</span>
              </div>
              <div className="bg-[#1b1f2a] p-2 rounded-lg border border-[#272c38] flex flex-col justify-between">
                <span className="text-slate-400 block text-[8px] uppercase tracking-wider flex items-center gap-1">
                  <Activity className="w-2.5 h-2.5 text-cyan-400" />
                  Latência
                </span>
                <span className="text-cyan-300 font-bold truncate block mt-0.5">14ms Vector</span>
              </div>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#2d3342] bg-[#1e232f] text-slate-400 hover:text-white hover:border-slate-500 transition-colors mx-auto shadow-2xs"
            aria-label="Expandir navegação"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </aside>
  );
};
