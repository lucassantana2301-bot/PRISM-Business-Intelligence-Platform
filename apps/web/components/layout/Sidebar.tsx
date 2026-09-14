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
  Store,
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
      label: 'Overview',
      href: '/',
      icon: TrendingUp,
    },
    {
      label: 'Analytics',
      href: '/analytics',
      icon: BarChart3,
    },
    {
      label: 'Data Explorer',
      href: '/explorer',
      icon: Database,
    },
    {
      label: 'Insights',
      href: '/insights',
      icon: Sparkles,
      badge: '5',
    },
    {
      label: 'Ask PRISM',
      href: '/ask',
      icon: MessageSquareCode,
      highlight: true,
    },
    {
      label: 'Data Sources',
      href: '/sources',
      icon: Database,
    },
  ];

  return (
    <aside
      className={clsx(
        'h-screen bg-prism-bg-canvas border-r border-prism-border-subtle flex flex-col justify-between transition-all duration-200 z-40 select-none',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Top Header & Workspace Switcher */}
      <div>
        {/* Brand Header */}
        <div className="h-14 px-4 border-b border-prism-border-subtle flex items-center justify-between">
          <Link
            href="/"
            onClick={onMobileClose}
            className="flex items-center gap-2.5 overflow-hidden group"
          >
            <div className="h-7 w-7 rounded bg-prism-accent-blue/15 border border-prism-accent-blue/30 flex items-center justify-center shrink-0 group-hover:border-prism-accent-blue transition-colors">
              <span className="font-mono font-bold text-xs text-prism-accent-blue">P</span>
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-semibold tracking-tight text-sm text-prism-text-primary leading-tight">
                  PRISM
                </span>
                <span className="text-[10px] font-mono text-prism-text-muted leading-tight">
                  Ask. Understand. Decide.
                </span>
              </div>
            )}
          </Link>

          {!collapsed && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="p-1 rounded bg-prism-bg-card border border-prism-border-subtle hover:border-prism-border-hover text-prism-text-muted hover:text-prism-text-secondary transition-colors"
              title="Collapse sidebar"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Workspace Switcher Pill */}
        <div className="p-3">
          <div
            className={clsx(
              'rounded-lg bg-prism-bg-card border border-prism-border-subtle p-2 flex items-center gap-2.5 transition-colors',
              collapsed ? 'justify-center' : 'justify-between'
            )}
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="h-6 w-6 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <Store className="w-3.5 h-3.5" />
              </div>
              {!collapsed && (
                <div className="min-w-0">
                  <div className="text-xs font-medium text-prism-text-primary truncate">
                    Acme E-Commerce
                  </div>
                  <div className="text-[10px] font-mono text-prism-text-muted truncate">
                    E-com Data Mart • v1
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Primary Navigation List */}
        <div className="px-3 py-2 space-y-1">
          {!collapsed && (
            <div className="px-2 pb-1.5 text-[10px] uppercase font-mono tracking-wider text-prism-text-muted font-medium">
              Platform Core
            </div>
          )}
          {primaryNav.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={onMobileClose}
                className={clsx(
                  'flex items-center gap-3 px-2.5 py-2 rounded-lg text-xs font-medium transition-all group relative',
                  collapsed ? 'justify-center' : 'justify-between',
                  isActive
                    ? 'bg-prism-bg-elevated text-prism-text-primary border border-prism-border-subtle shadow-sm'
                    : 'text-prism-text-secondary hover:text-prism-text-primary hover:bg-zinc-800/40 border border-transparent'
                )}
                title={collapsed ? item.label : undefined}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon
                    className={clsx(
                      'w-4 h-4 shrink-0 transition-colors',
                      isActive
                        ? item.highlight ? 'text-prism-accent-blue' : 'text-prism-text-primary'
                        : 'text-prism-text-muted group-hover:text-prism-text-secondary'
                    )}
                  />
                  {!collapsed && (
                    <span className="truncate">{item.label}</span>
                  )}
                </div>

                {!collapsed && item.badge && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-rose-500/15 border border-rose-500/30 text-rose-400 font-semibold">
                    {item.badge}
                  </span>
                )}

                {/* Active indicator bar */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-prism-accent-blue rounded-r" />
                )}
              </Link>
            );
          })}
        </div>
      </div>

      <div>
        {/* Collapse button on bottom if already collapsed */}
        {collapsed && (
          <div className="p-3 border-t border-prism-border-subtle flex justify-center">
            <button
              type="button"
              onClick={onToggleCollapse}
              className="p-1.5 rounded bg-prism-bg-card border border-prism-border-subtle hover:border-prism-border-hover text-prism-text-muted hover:text-prism-text-secondary transition-colors"
              title="Expand sidebar"
              aria-label="Expand sidebar"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
