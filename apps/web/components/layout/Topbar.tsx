'use client';

import React from 'react';
import {
  Search,
  Bell,
  Menu,
  Calendar,
  ChevronDown,
} from 'lucide-react';

export interface TopbarProps {
  onOpenCommandPalette: () => void;
  onMobileMenuToggle: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  onOpenCommandPalette,
  onMobileMenuToggle,
}) => {
  return (
    <header className="h-16 border-b border-slate-200/80 bg-white/95 backdrop-blur-md sticky top-0 z-30 px-6 flex items-center justify-between gap-4">
      {/* Left: Mobile hamburger */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMobileMenuToggle}
          className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          title="Alternar Navegação"
          aria-label="Alternar navegação"
        >
          <Menu className="w-4 h-4" />
        </button>
      </div>

      {/* Center: Search & Ask Input */}
      <div className="flex-1 max-w-xl mx-auto">
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 text-xs text-slate-500 hover:text-slate-700 transition-all group shadow-sm"
        >
          <div className="flex items-center gap-2.5">
            <Search className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
            <span className="font-sans text-xs">Pesquisar ou perguntar algo ao PRISM...</span>
          </div>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-[10px] font-mono text-slate-500 shadow-2xs font-semibold">
            <span>⌘</span>
            <span>K</span>
          </div>
        </button>
      </div>

      {/* Right: Date Range Dropdown, Notifications & User Avatar */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Date Preset Dropdown Pill */}
        <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 font-medium shadow-xs hover:border-slate-300 transition-colors cursor-pointer">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span>Últimos 30 dias</span>
          <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
        </div>

        {/* Notifications Icon Button */}
        <button
          type="button"
          aria-label="Notificações"
          title="Notificações"
          className="p-2 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900 transition-colors relative shadow-xs"
        >
          <Bell className="w-4 h-4" />
        </button>

        {/* User Avatar Circle */}
        <div className="h-9 w-9 rounded-full bg-[#0d1322] border border-slate-700 flex items-center justify-center text-white text-xs font-semibold shadow-xs">
          <span>A</span>
        </div>
      </div>
    </header>
  );
};

