'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  TrendingUp,
  BarChart3,
  Database,
  Sparkles,
  MessageSquareCode,
  ArrowRight,
  Command,
} from 'lucide-react';
import clsx from 'clsx';

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const dialogRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const navigationItems = [
    {
      id: 'overview',
      label: 'Executive Overview',
      subtitle: 'KPI command center & revenue summary',
      icon: TrendingUp,
      href: '/',
      category: 'Navigation',
    },
    {
      id: 'analytics',
      label: 'Dimensional Analytics',
      subtitle: 'Multi-axis dimensional slicing & trends',
      icon: BarChart3,
      href: '/analytics',
      category: 'Navigation',
    },
    {
      id: 'explorer',
      label: 'Data Explorer',
      subtitle: 'Raw tabular exploration & column filters',
      icon: Database,
      href: '/explorer',
      category: 'Navigation',
    },
    {
      id: 'insights',
      label: 'Insights & Anomalies',
      subtitle: 'Algorithmic drift & revenue driver detection',
      icon: Sparkles,
      href: '/insights',
      category: 'Navigation',
    },
    {
      id: 'ask',
      label: 'Ask PRISM (NL-to-SQL)',
      subtitle: 'Conversational natural language data query',
      icon: MessageSquareCode,
      href: '/ask',
      category: 'Navigation',
    },
  ];

  const filteredItems = navigationItems.filter(
    (item) =>
      item.label.toLowerCase().includes(query.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (!isOpen) return;
    returnFocusRef.current = document.activeElement as HTMLElement;
    return () => returnFocusRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'Tab') {
        const focusable = dialogRef.current?.querySelectorAll<HTMLElement>('input, button:not([disabled])');
        if (!focusable?.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (filteredItems.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % (filteredItems.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = filteredItems[selectedIndex];
        if (selected) {
          router.push(selected.href);
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, router, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-28 px-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150" onMouseDown={onClose}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Search and navigation"
        className="w-full max-w-xl rounded-xl bg-prism-bg-card border border-prism-border-hover shadow-2xl shadow-black/80 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-prism-border-subtle bg-prism-bg-elevated/40">
          <Search className="w-4 h-4 text-prism-text-muted mr-3 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or navigate to..."
            className="flex-1 bg-transparent text-sm font-sans text-prism-text-primary placeholder:text-prism-text-muted focus:outline-none"
          />
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-prism-bg-card border border-prism-border-subtle text-prism-text-muted rounded">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-[340px] overflow-y-auto p-2 divide-y divide-prism-border-subtle/30">
          {filteredItems.length === 0 ? (
            <div className="py-8 text-center text-xs font-mono text-prism-text-muted">
              No matching commands or routes found
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => {
                    router.push(item.href);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={clsx(
                    'w-full text-left flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors',
                    isSelected
                      ? 'bg-prism-bg-elevated text-prism-text-primary border border-prism-border-subtle'
                      : 'text-prism-text-secondary hover:bg-prism-bg-hover/50 border border-transparent'
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={clsx(
                        'p-2 rounded-md border flex items-center justify-center shrink-0',
                        isSelected
                          ? 'bg-prism-accent-blue/15 border-prism-accent-blue/40 text-prism-accent-blue'
                          : 'bg-prism-bg-card border-prism-border-subtle text-prism-text-muted'
                      )}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-prism-text-primary truncate">
                        {item.label}
                      </div>
                      <div className="text-[11px] text-prism-text-muted truncate">
                        {item.subtitle}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 pl-2">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-prism-bg-card border border-prism-border-subtle text-prism-text-muted">
                      {item.category}
                    </span>
                    {isSelected && (
                      <ArrowRight className="w-3.5 h-3.5 text-prism-accent-blue" />
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-prism-bg-canvas border-t border-prism-border-subtle flex items-center justify-between text-[11px] font-mono text-prism-text-muted">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
          </div>
          <div className="flex items-center gap-1">
            <Command className="w-3 h-3" />
            <span>PRISM Global Command</span>
          </div>
        </div>
      </div>
    </div>
  );
};
