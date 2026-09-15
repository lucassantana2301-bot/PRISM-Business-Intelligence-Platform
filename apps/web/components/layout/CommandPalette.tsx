'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, BarChart3, Database, MessageSquareCode, Sparkles, TrendingUp } from 'lucide-react';
import clsx from 'clsx';
import { AnalyticalCoordinate } from '@/components/ui/AnalyticalCoordinate';

export interface CommandPaletteProps { isOpen: boolean; onClose: () => void; }

const destinations = [
  { id: 'overview', label: 'Visão geral executiva', detail: 'Receita, instrumentos e sinais', icon: TrendingUp, href: '/dashboard', coordinate: 'NAV.01' },
  { id: 'analytics', label: 'Análises dimensionais', detail: 'Comparações e séries temporais', icon: BarChart3, href: '/analytics', coordinate: 'NAV.02' },
  { id: 'explorer', label: 'Explorador de dados', detail: 'Registros e filtros de coluna', icon: Database, href: '/explorer', coordinate: 'NAV.03' },
  { id: 'insights', label: 'Percepções', detail: 'Anomalias e padrões calculados', icon: Sparkles, href: '/insights', coordinate: 'NAV.04' },
  { id: 'ask', label: 'Refraction Query', detail: 'Análise em linguagem natural', icon: MessageSquareCode, href: '/ask', coordinate: 'NAV.05' },
];

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const dialogRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const filtered = useMemo(() => destinations.filter((item) => `${item.label} ${item.detail}`.toLowerCase().includes(query.toLowerCase())), [query]);

  useEffect(() => { setSelectedIndex(0); }, [query]);
  useEffect(() => {
    if (!isOpen) return;
    returnFocusRef.current = document.activeElement as HTMLElement;
    return () => returnFocusRef.current?.focus();
  }, [isOpen]);

  const askHref = `/ask${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ''}`;
  const execute = useCallback((href: string) => {
    router.push(href);
    onClose();
    setQuery('');
  }, [onClose, router]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;
      if (event.key === 'Escape') { event.preventDefault(); onClose(); return; }
      if (event.key === 'Tab') {
        const focusable = dialogRef.current?.querySelectorAll<HTMLElement>('input, button:not([disabled])');
        if (!focusable?.length) return;
        const first = focusable[0]; const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
      if (event.key === 'ArrowDown') { event.preventDefault(); setSelectedIndex((value) => (value + 1) % Math.max(filtered.length, 1)); }
      if (event.key === 'ArrowUp') { event.preventDefault(); setSelectedIndex((value) => (value - 1 + Math.max(filtered.length, 1)) % Math.max(filtered.length, 1)); }
      if (event.key === 'Enter') { event.preventDefault(); execute(filtered[selectedIndex]?.href ?? askHref); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [askHref, execute, filtered, isOpen, onClose, selectedIndex]);

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-prism-midnight/80 px-4 pt-16 sm:pt-24" onMouseDown={onClose}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="command-title" className="w-full max-w-2xl overflow-hidden rounded-2xl border border-[#2A3550] bg-white shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>
        <header className="border-b border-prism-hairline p-5 sm:p-7">
          <AnalyticalCoordinate dimension="monetary">SOURCE.Q · PRISM COMMAND</AnalyticalCoordinate>
          <h2 id="command-title" className="mt-2.5 text-xl font-semibold tracking-[-0.025em] text-prism-ink">O que você precisa entender?</h2>
          <div className="mt-5 flex items-center border-b-2 border-prism-indigo pb-3">
            <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Faça uma pergunta sobre o negócio…" className="min-w-0 flex-1 bg-transparent text-base text-prism-ink outline-none placeholder:text-prism-muted" aria-label="Pergunta ou comando" />
            <kbd className="ml-3 font-mono text-[9px] text-prism-muted">ESC</kbd>
          </div>
          {query.trim() && <button type="button" onClick={() => execute(askHref)} className="mt-4 flex w-full items-center justify-between rounded-lg border-l-2 border-prism-indigo bg-prism-porcelain px-4 py-3 text-left transition-colors duration-150 hover:bg-white hover:border-prism-hairlineHover"><span><strong className="block text-xs text-prism-ink">Analisar com PRISM</strong><small className="mt-1 block text-[11px] text-prism-muted">Abrir como fonte de uma Refraction Query</small></span><ArrowRight className="h-4 w-4 text-prism-indigo" /></button>}
        </header>
        <div className="max-h-[23rem] overflow-y-auto p-3 sm:p-4">
          <p className="px-3 pb-2 font-mono text-[9px] uppercase tracking-[0.16em] text-prism-muted">Analytical instruments</p>
          {filtered.map((item, index) => { const Icon = item.icon; return <button type="button" key={item.id} onClick={() => execute(item.href)} onMouseEnter={() => setSelectedIndex(index)} className={clsx('grid w-full grid-cols-[3.5rem_1.5rem_1fr_auto] items-center gap-3 rounded-lg border-l px-3 py-3 text-left transition-colors duration-150', index === selectedIndex ? 'border-prism-indigo bg-prism-porcelain' : 'border-transparent hover:bg-prism-porcelain')}><span className="font-mono text-[9px] text-prism-muted">{item.coordinate}</span><Icon className="h-4 w-4 text-prism-muted" strokeWidth={1.5} /><span><strong className="block text-xs font-medium text-prism-ink">{item.label}</strong><small className="mt-1 block text-[10px] text-prism-muted">{item.detail}</small></span><ArrowRight className="h-3.5 w-3.5 text-prism-muted" /></button>; })}
        </div>
      </div>
    </div>
  );
};
