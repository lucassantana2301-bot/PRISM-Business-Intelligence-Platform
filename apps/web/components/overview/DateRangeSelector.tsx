'use client';

import React from 'react';
import clsx from 'clsx';
import { Calendar } from 'lucide-react';

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
    label: '7D',
    comparisonLabel: 'vs 7 dias anteriores',
  },
  '30d': {
    preset: '30d',
    startDate: '2026-10-02',
    endDate: '2026-10-31',
    label: '30D',
    comparisonLabel: 'vs 30 dias anteriores',
  },
  '90d': {
    preset: '90d',
    startDate: '2026-08-03',
    endDate: '2026-10-31',
    label: '90D',
    comparisonLabel: 'vs 90 dias anteriores',
  },
  ytd: {
    preset: 'ytd',
    startDate: '2026-01-01',
    endDate: '2026-10-31',
    label: 'YTD',
    comparisonLabel: 'vs ano anterior',
  },
  full: {
    preset: 'full',
    startDate: '2025-05-01',
    endDate: '2026-10-31',
    label: 'Todo o Histórico',
    comparisonLabel: 'vs histórico',
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
  const presets = Object.keys(DATE_PRESETS) as DateRangePreset[];

  return (
    <div className="flex flex-wrap items-center gap-3 select-none">
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200/80 bg-white shadow-2xs font-mono text-xs text-slate-600">
        <Calendar className="h-3.5 w-3.5 text-prism-indigo" />
        <span className="font-semibold text-slate-800">{current.startDate}</span>
        <span className="text-slate-300">→</span>
        <span className="font-semibold text-slate-800">{current.endDate}</span>
      </div>

      <div
        role="group"
        aria-label="Seletor de período"
        className="inline-flex items-center p-0.5 rounded-lg border border-slate-200/80 bg-slate-50/80"
      >
        {presets.map((key) => {
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
                'px-2.5 py-1 text-xs font-semibold rounded-md transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50',
                isSelected
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
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

