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
} from 'lucide-react';
import clsx from 'clsx';

export interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onMobileClose?: () => void;
}

const navigation = [
  { coordinate: '01', label: 'Visão geral', href: '/dashboard', icon: TrendingUp },
  { coordinate: '02', label: 'Análises', href: '/analytics', icon: BarChart3 },
  { coordinate: '03', label: 'Explorador de dados', href: '/explorer', icon: Database },
  { coordinate: '04', label: 'Percepções', href: '/insights', icon: Sparkles },
  { coordinate: '05', label: 'Pergunte ao PRISM', href: '/ask', icon: MessageSquareCode },
  { coordinate: '06', label: 'Fontes de dados', href: '/sources', icon: Layers },
];

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggleCollapse, onMobileClose }) => {
  const pathname = usePathname();

  return (
    <aside
      className={clsx(
        'flex h-screen flex-col border-r border-[#1a2234] bg-[#080c16] text-slate-400 transition-[width] duration-200 select-none',
        collapsed ? 'w-[4.5rem]' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-[#1a2234] px-4">
        <Link
          href="/"
          onClick={onMobileClose}
          className="flex min-w-0 items-center gap-3 text-white group notranslate"
          translate="no"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 border border-indigo-500/40 text-xs font-bold text-prism-cyan font-mono transition-transform duration-150 group-hover:scale-105">
            P
          </div>
          {!collapsed && (
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold tracking-[0.16em] text-sm text-white notranslate" translate="no">PRISM</span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-medium">v2.4</span>
              </div>
              <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-slate-500">
                Decision System
              </p>
            </div>
          )}
        </Link>
        {!collapsed && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="rail-icon-button"
            aria-label="Recolher navegação"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-6" aria-label="Navegação principal">
        <div>
          {!collapsed && (
            <p className="px-3 pb-2.5 font-mono text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              Analytical Coordinates
            </p>
          )}
          <div className="space-y-1">
            {navigation.map((item) => {
              const active =
                pathname === item.href || (item.href === '/dashboard' && pathname === '/');
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onMobileClose}
                  title={collapsed ? item.label : undefined}
                  aria-current={active ? 'page' : undefined}
                  className={clsx(
                    'group relative flex min-h-[2.625rem] items-center gap-3 rounded-md px-3 text-[13px] font-medium transition-all duration-150',
                    collapsed ? 'justify-center' : '',
                    active
                      ? 'bg-white/[0.08] text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]'
                      : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
                  )}
                >
                  {active && (
                    <span
                      className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r bg-prism-indigo"
                      aria-hidden="true"
                    />
                  )}
                  {!collapsed && (
                    <span
                      className={clsx(
                        'w-4 font-mono text-[10px] tabular-nums',
                        active ? 'text-prism-cyan font-semibold' : 'text-slate-600 group-hover:text-slate-500'
                      )}
                    >
                      {item.coordinate}
                    </span>
                  )}
                  <Icon
                    className={clsx(
                      'h-4 w-4 shrink-0 transition-colors',
                      active ? 'text-prism-cyan' : 'text-slate-400 group-hover:text-slate-300'
                    )}
                    strokeWidth={1.75}
                  />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Footer / Telemetry status */}
      <div className="shrink-0 border-t border-[#1a2234] p-3.5 bg-[#060910]">
        {!collapsed ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-slate-500">
                  Workspace
                </p>
                <p className="truncate text-xs font-semibold text-slate-200">Acme E-Commerce</p>
              </div>
              <span className="flex items-center gap-1.5 font-mono text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 prism-live-dot" />
                ONLINE
              </span>
            </div>

            <div className="border-t border-[#1a2234] pt-2.5 grid grid-cols-2 gap-2 text-[10px] font-mono">
              <div className="bg-[#0b101c] p-1.5 rounded border border-[#1a2234]">
                <span className="text-slate-500 block text-[8px] uppercase">Engine</span>
                <span className="text-slate-300 font-semibold truncate block">DuckDB 1.0</span>
              </div>
              <div className="bg-[#0b101c] p-1.5 rounded border border-[#1a2234]">
                <span className="text-slate-500 block text-[8px] uppercase">Latency</span>
                <span className="text-slate-300 font-semibold truncate block">14ms</span>
              </div>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="rail-icon-button mx-auto"
            aria-label="Expandir navegação"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </aside>
  );
};

