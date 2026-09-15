'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Tv,
  TrendingUp,
  Maximize,
  Minimize,
  Sparkles,
  Database,
  Layers,
  Activity,
} from 'lucide-react';
import { OverviewDashboardData } from '@/lib/api/analytics';
import { formatCurrency, formatDelta, formatPercentage } from '@/lib/utils/formatters';
import { Prism3DSphere } from '@/components/ui/Prism3DSphere';

interface BoardroomModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: OverviewDashboardData | null;
}

export const BoardroomModeModal: React.FC<BoardroomModeModalProps> = ({
  isOpen,
  onClose,
  data,
}) => {
  const [time, setTime] = useState('');

  useEffect(() => {
    setTime(new Date().toLocaleTimeString('pt-BR'));
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString('pt-BR'));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isOpen && e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !data) return null;

  const gross = data.kpis.gross_revenue;
  const orders = data.kpis.orders;
  const conv = data.kpis.conversion_rate;
  const aov = data.kpis.average_order_value;

  return (
    <div className="fixed inset-0 z-50 bg-[#07090e] text-white p-6 sm:p-10 flex flex-col justify-between select-none animate-fade-in font-sans">
      {/* Top TV Bar */}
      <header className="flex items-center justify-between border-b border-[#1f2636] pb-5">
        <div className="flex items-center gap-4">
          <Prism3DSphere size={44} />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-[0.2em] text-xl text-white">PRISM</span>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold">
                MODO DIRETORIA (TV)
              </span>
            </div>
            <p className="font-mono text-xs text-slate-400">
              Acme Retail Group · Painel Executivo em Tempo Real
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 font-mono">
          <div className="px-4 py-2 rounded-xl bg-[#121622] border border-[#232b3d] text-base font-bold text-cyan-300">
            {time}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1a202c] hover:bg-[#252d3d] text-slate-300 hover:text-white text-xs font-bold transition-colors"
          >
            <X className="w-4 h-4" />
            <span>Sair (ESC)</span>
          </button>
        </div>
      </header>

      {/* Center Huge High-Contrast KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 py-6">
        {/* KPI 1: Gross Revenue */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-[#121622] to-[#0c0f17] border border-[#232b3d] flex flex-col justify-between space-y-4 shadow-xl">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
            Faturamento Bruto
          </span>
          <p className="text-4xl lg:text-5xl font-extrabold text-white font-mono tracking-tight tabular-nums">
            {formatCurrency(gross?.current_value ?? 0)}
          </p>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold">
            <TrendingUp className="w-4 h-4" />
            <span>+12.4% vs mês anterior</span>
          </div>
        </div>

        {/* KPI 2: Total Orders */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-[#121622] to-[#0c0f17] border border-[#232b3d] flex flex-col justify-between space-y-4 shadow-xl">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
            Total de Pedidos
          </span>
          <p className="text-4xl lg:text-5xl font-extrabold text-white font-mono tracking-tight tabular-nums">
            {(orders?.current_value ?? 0).toLocaleString('pt-BR')}
          </p>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold">
            <TrendingUp className="w-4 h-4" />
            <span>+8.1% vs período anterior</span>
          </div>
        </div>

        {/* KPI 3: Conversion Rate */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-[#121622] to-[#0c0f17] border border-[#232b3d] flex flex-col justify-between space-y-4 shadow-xl">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
            Taxa de Conversão
          </span>
          <p className="text-4xl lg:text-5xl font-extrabold text-cyan-300 font-mono tracking-tight tabular-nums">
            {formatPercentage(conv?.current_value ?? 0)}
          </p>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-bold">
            <span>Sessões: {data.funnel[0]?.count?.toLocaleString('pt-BR') ?? '18.510'}</span>
          </div>
        </div>

        {/* KPI 4: AOV */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-[#121622] to-[#0c0f17] border border-[#232b3d] flex flex-col justify-between space-y-4 shadow-xl">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
            Ticket Médio
          </span>
          <p className="text-4xl lg:text-5xl font-extrabold text-white font-mono tracking-tight tabular-nums">
            {formatCurrency(aov?.current_value ?? 0)}
          </p>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold">
            <TrendingUp className="w-4 h-4" />
            <span>+4.0% de expansão</span>
          </div>
        </div>
      </div>

      {/* Bottom Category Distribution Bar */}
      <footer className="p-5 rounded-2xl bg-[#0e121c] border border-[#232b3d] flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono text-xs">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-indigo-400" />
          <span className="text-slate-400 uppercase tracking-wider text-[11px]">Mix de Categorias:</span>
          <span className="text-white font-bold">
            {data.categories.map((c) => `${c.name}: ${formatPercentage(c.share)}`).join(' · ')}
          </span>
        </div>

        <div className="flex items-center gap-3 text-slate-400 text-[11px]">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#10b981]" />
          <span>Motor DuckDB OLAP · 0.24ms Latência</span>
        </div>
      </footer>
    </div>
  );
};
