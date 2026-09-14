'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  TrendingUp,
  BarChart3,
  Database,
  Sparkles,
  MessageSquareCode,
  ChevronLeft,
  ChevronRight,
  Settings,
  HelpCircle,
} from 'lucide-react';
import clsx from 'clsx';

export interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onMobileClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggleCollapse,
  onMobileClose,
}) => {
  const pathname = usePathname();

  const primaryNav = [
    {
      label: 'Visão geral',
      href: '/',
      icon: TrendingUp,
    },
    {
      label: 'Análises',
      href: '/analytics',
      icon: BarChart3,
    },
    {
      label: 'Explorador de Dados',
      href: '/explorer',
      icon: Database,
    },
    {
      label: 'Percepções',
      href: '/insights',
      icon: Sparkles,
      badge: '5',
    },
    {
      label: 'Pergunte ao PRISM',
      href: '/ask',
      icon: MessageSquareCode,
    },
    {
      label: 'Fontes de dados',
      href: '/sources',
      icon: Database,
    },
  ];

  return (
    <aside
      className={clsx(
        'h-screen bg-[#0d1322] border-r border-[#1a2236] flex flex-col justify-between transition-all duration-200 z-40 select-none text-slate-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Top Header & Navigation */}
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-[#1a2236] flex items-center justify-between shrink-0">
          <Link
            href="/"
            onClick={onMobileClose}
            className="flex items-center gap-3 overflow-hidden group"
          >
            {/* PRISM Gradient Logo Icon */}
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-indigo-500 via-blue-500 to-purple-400 p-[1px] shadow-md shadow-blue-500/20 shrink-0">
              <div className="h-full w-full bg-[#0d1322] rounded-[7px] flex items-center justify-center">
                <span className="font-bold text-sm bg-gradient-to-tr from-blue-400 to-purple-300 bg-clip-text text-transparent">
                  ▲
                </span>
              </div>
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-bold tracking-tight text-base text-white leading-tight font-sans">
                  PRISM
                </span>
                <span className="text-[10px] text-slate-400 leading-tight">
                  Pergunte. Compreenda. Decida.
                </span>
              </div>
            )}
          </Link>

          {!collapsed && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="p-1 rounded bg-[#131b2e] border border-[#1e293b] hover:border-slate-700 text-slate-400 hover:text-white transition-colors"
              title="Recolher barra lateral"
              aria-label="Recolher barra lateral"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Primary Navigation List */}
        <div className="px-3 py-4 space-y-1">
          {!collapsed && (
            <div className="px-3 pb-2 text-[10px] uppercase font-mono tracking-wider text-slate-400 font-semibold">
              NÚCLEO DA PLATAFORMA
            </div>
          )}
          {primaryNav.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onMobileClose}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all group relative',
                  collapsed ? 'justify-center' : 'justify-between',
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/25 font-semibold'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-[#131b2e]'
                )}
                title={collapsed ? item.label : undefined}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={clsx(
                      'w-4 h-4 shrink-0 transition-colors',
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                    )}
                  />
                  {!collapsed && (
                    <span className="truncate">{item.label}</span>
                  )}
                </div>

                {!collapsed && item.badge && (
                  <span className={clsx(
                    'px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold leading-none',
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-indigo-600/30 border border-indigo-500/40 text-indigo-300'
                  )}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Bottom Tenant Info, Settings & Cosmic Card */}
      <div className="p-3 border-t border-[#1a2236] space-y-3 shrink-0">
        {/* Workspace Tenant Switcher Pill */}
        <div
          className={clsx(
            'rounded-xl bg-[#131b2e] border border-[#1e293b] p-2 flex items-center gap-2.5',
            collapsed ? 'justify-center' : 'justify-between'
          )}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-7 w-7 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-xs shrink-0">
              A
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <div className="text-xs font-medium text-white truncate">
                  Acme E-Commerce
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  E-com Data Mart • v1
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Settings & Help Links */}
        {!collapsed && (
          <div className="space-y-0.5 px-1">
            <button
              type="button"
              className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-[#131b2e] transition-colors"
            >
              <Settings className="w-3.5 h-3.5 text-slate-400" />
              <span>Configurações</span>
            </button>
            <button
              type="button"
              className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-[#131b2e] transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
              <span>Ajuda</span>
            </button>
          </div>
        )}

        {/* Cosmic Impact Card with Gradient Wave */}
        {!collapsed && (
          <div className="relative overflow-hidden rounded-xl p-3.5 bg-gradient-to-b from-[#131b2e] to-[#0d1322] border border-[#1e293b] shadow-lg group">
            {/* Ambient Background Wave */}
            <div className="absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-blue-600 via-indigo-900 to-transparent pointer-events-none" />
            <svg
              className="absolute -bottom-2 -right-2 w-28 h-20 opacity-30 text-blue-400 pointer-events-none"
              viewBox="0 0 100 60"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0 30 C 20 10, 40 50, 70 20 C 85 5, 95 40, 100 30 L 100 60 L 0 60 Z"
                fill="url(#wave-gradient)"
              />
              <defs>
                <linearGradient id="wave-gradient" x1="0" y1="0" x2="1" y2="1">
                  <stop stopColor="#3b82f6" />
                  <stop offset="1" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>

            <div className="relative z-10">
              <div className="text-xs font-semibold text-white leading-tight">
                Dados
              </div>
              <div className="text-[11px] text-slate-400 leading-tight mt-0.5">
                em decisões.
              </div>
              <div className="text-[10px] text-slate-400 leading-tight mt-1">
                Ideias em resultados.
              </div>
            </div>
          </div>
        )}

        {/* Expand button if collapsed */}
        {collapsed && (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={onToggleCollapse}
              className="p-1.5 rounded bg-[#131b2e] border border-[#1e293b] hover:border-slate-700 text-slate-400 hover:text-white transition-colors"
              title="Expandir barra lateral"
              aria-label="Expandir barra lateral"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

