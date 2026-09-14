'use client';

import React from 'react';
import { Calendar } from 'lucide-react';
import clsx from 'clsx';

export type DateRangePreset = '7d' | '30d' | '90d' | 'ytd' | 'full';

export interface DateRange {
  preset: DateRangePreset;
  startDate: string;
  endDate: string;
  label: string;
  comparisonLabel: string;
}

export const DATE_PRESETS: Record<DateRangePreset, DateRange> = {
  '7d': {
    preset: '7d',
    startDate: '2026-10-25',
    endDate: '2026-10-31',
    label: 'Últimos 7 dias',
    comparisonLabel: 'em comparação com os 7 dias anteriores',
  },
  '30d': {
    preset: '30d',
    startDate: '2026-10-02',
    endDate: '2026-10-31',
    label: 'Últimos 30 dias',
    comparisonLabel: 'em comparação com os 30 dias anteriores',
  },
  '90d': {
    preset: '90d',
    startDate: '2026-08-03',
    endDate: '2026-10-31',
    label: 'Últimos 90 dias',
    comparisonLabel: 'em comparação com os 90 dias anteriores',
  },
  ytd: {
    preset: 'ytd',
    startDate: '2026-01-01',
    endDate: '2026-10-31',
    label: 'No acumulado do ano',
    comparisonLabel: 'em comparação com o período anterior',
  },
  full: {
    preset: 'full',
    startDate: '2025-05-01',
    endDate: '2026-10-31',
    label: 'Conjunto de dados completo',
    comparisonLabel: 'em todo o período',
  },
};

interface DateRangeSelectorProps {
  selectedPreset: DateRangePreset;
  onSelectPreset: (preset: DateRangePreset) => void;
  disabled?: boolean;
}

export const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  selectedPreset,
  onSelectPreset,
  disabled = false,
}) => {
  const current = DATE_PRESETS[selectedPreset];

  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
      {/* Date Range Badge Pill */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-medium text-slate-700">
        <Calendar className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
        <span className="font-mono text-[11px]">
          {current.startDate} <span className="text-slate-400">→</span> {current.endDate}
        </span>
      </div>

      {/* Preset Buttons */}
      <div
        role="group"
        aria-label="Seletor de período"
        className="flex flex-wrap items-center gap-1.5"
      >
        {(Object.keys(DATE_PRESETS) as DateRangePreset[]).map((key) => {
          const item = DATE_PRESETS[key];
          const isSelected = selectedPreset === key;
          return (
            <button
              key={key}
              type="button"
              disabled={disabled}
              onClick={() => onSelectPreset(key)}
              aria-pressed={isSelected}
              className={clsx(
                'px-3 py-1.5 text-xs font-medium rounded-xl transition-all duration-150',
                isSelected
                  ? 'bg-blue-600 text-white shadow-xs font-semibold'
                  : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200/80 hover:border-slate-300'
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

