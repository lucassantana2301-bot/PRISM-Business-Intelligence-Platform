'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, BarChart3, Database, MessageSquareCode, Sparkles, TrendingUp, Search, Radio, Compass } from 'lucide-react';
import clsx from 'clsx';
import { AnalyticalCoordinate } from '@/components/ui/AnalyticalCoordinate';

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

const destinations = [
  {
    id: 'overview',
    label: 'Visão Geral Executiva',
    detail: 'Métricas de receita, ticket médio, conversão e alertas vitais',
    icon: TrendingUp,
    href: '/dashboard',
    coordinate: '01 · EXEC',
  },
  {
    id: 'analytics',
    label: 'Análises Dimensionais & Canais',
    detail: 'Matriz ROAS de marketing, fatiamento por dispositivo e séries temporais',
    icon: BarChart3,
    href: '/analytics',
    coordinate: '02 · ANL',
  },
  {
    id: 'explorer',
    label: 'Explorador de Dados',
    detail: 'Registros canônicos de pedidos, clientes e sessões com paginação DuckDB',
    icon: Database,
    href: '/explorer',
    coordinate: '03 · EXP',
  },
  {
    id: 'insights',
    label: 'Radar de Anomalias & Insights',
    detail: 'Detecção estatística de desvios, causas-raiz e síntese executiva',
    icon: Sparkles,
    href: '/insights',
    coordinate: '04 · INS',
  },
  {
    id: 'ask',
    label: 'Pergunte ao PRISM (Refraction Query)',
    detail: 'Consultas analíticas em linguagem natural com validação AST de leitura',
    icon: MessageSquareCode,
    href: '/ask',
    coordinate: '05 · ASK',
  },
  {
    id: 'sources',
    label: 'Fontes de Dados & Telemetria OLAP',
    detail: 'Status da conexão DuckDB, governança de dados e catálogo de esquemas',
    icon: Radio,
    href: '/sources',
    coordinate: '06 · SRC',
  },
];

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const dialogRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filtered = useMemo(
    () =>
      destinations.filter((item) =>
        `${item.label} ${item.detail} ${item.coordinate}`.toLowerCase().includes(query.toLowerCase())
      ),
    [query]
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (!isOpen) return;
    returnFocusRef.current = document.activeElement as HTMLElement;
    return () => returnFocusRef.current?.focus();
  }, [isOpen]);

  const askHref = `/ask${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ''}`;
  const execute = useCallback(
    (href: string) => {
      router.push(href);
      onClose();
      setQuery('');
    },
    [onClose, router]
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key === 'Tab') {
        const focusable = dialogRef.current?.querySelectorAll<HTMLElement>('input, button:not([disabled])');
        if (!focusable?.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        }
        if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setSelectedIndex((value) => (value + 1) % Math.max(filtered.length, 1));
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setSelectedIndex((value) => (value - 1 + Math.max(filtered.length, 1)) % Math.max(filtered.length, 1));
      }
      if (event.key === 'Enter') {
        event.preventDefault();
        execute(filtered[selectedIndex]?.href ?? askHref);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [askHref, execute, filtered, isOpen, onClose, selectedIndex]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/60 backdrop-blur-xs px-4 pt-16 sm:pt-24 animate-fade-in"
      onMouseDown={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="command-title"
        className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl animate-in zoom-in-95 duration-150"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="border-b border-slate-100 p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <AnalyticalCoordinate dimension="monetary">PRISM · COMMAND REFRACTION</AnalyticalCoordinate>
            <div className="flex items-center gap-1.5 font-mono text-[10px] text-slate-400">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600 font-bold">ESC</kbd>
              <span>para fechar</span>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
            <Search className="h-4 w-4 text-slate-400 shrink-0" />
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Digite um comando, navegue ou faça uma pergunta analítica…"
              className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              aria-label="Pergunta ou comando"
            />
          </div>

          {query.trim() && (
            <button
              type="button"
              onClick={() => execute(askHref)}
              className="mt-3 flex w-full items-center justify-between rounded-xl border border-indigo-200 bg-indigo-50/70 p-3.5 text-left transition-colors hover:bg-indigo-50 hover:border-indigo-300 shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-600 text-white">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <strong className="block text-xs font-bold text-indigo-950">Perguntar ao PRISM: &ldquo;{query}&rdquo;</strong>
                  <small className="block text-[11px] text-indigo-600 font-mono">Disparar Refraction Query com decomposição AST</small>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-indigo-600" />
            </button>
          )}
        </header>

        <div className="max-h-[22rem] overflow-y-auto p-3 sm:p-4 space-y-1">
          <p className="px-3 pb-2 font-mono text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
            Instrumentos & Módulos da Plataforma
          </p>

          {filtered.map((item, index) => {
            const Icon = item.icon;
            const isSelected = index === selectedIndex;
            return (
              <button
                type="button"
                key={item.id}
                onClick={() => execute(item.href)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={clsx(
                  'flex w-full items-center justify-between gap-3 rounded-xl px-3.5 py-3 text-left transition-all duration-150',
                  isSelected
                    ? 'bg-indigo-50/80 border border-indigo-200/80 shadow-2xs'
                    : 'border border-transparent hover:bg-slate-50'
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={clsx(
                      'p-2 rounded-lg transition-colors',
                      isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
                    )}
                  >
                    <Icon className="h-4 w-4" strokeWidth={1.75} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <strong className="text-xs font-bold text-slate-900 truncate">{item.label}</strong>
                      <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-500 font-medium">
                        {item.coordinate}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">{item.detail}</p>
                  </div>
                </div>
                <ArrowRight
                  className={clsx('h-4 w-4 shrink-0 transition-opacity', isSelected ? 'text-indigo-600 opacity-100' : 'opacity-0')}
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
