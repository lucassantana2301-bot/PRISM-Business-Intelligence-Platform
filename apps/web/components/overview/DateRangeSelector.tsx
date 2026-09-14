'use client';

import React from 'react';
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
    label: 'Last 7 Days',
    comparisonLabel: 'vs. prev 7 days',
  },
  '30d': {
    preset: '30d',
    startDate: '2026-10-02',
    endDate: '2026-10-31',
    label: 'Last 30 Days',
    comparisonLabel: 'vs. prev 30 days',
  },
  '90d': {
    preset: '90d',
    startDate: '2026-08-03',
    endDate: '2026-10-31',
    label: 'Last 90 Days',
    comparisonLabel: 'vs. prev 90 days',
  },
  ytd: {
    preset: 'ytd',
    startDate: '2026-01-01',
    endDate: '2026-10-31',
    label: 'Year to Date',
    comparisonLabel: 'vs. prior period',
  },
  full: {
    preset: 'full',
    startDate: '2025-05-01',
    endDate: '2026-10-31',
    label: 'Full Dataset',
    comparisonLabel: 'all-time',
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
    <div className="flex flex-wrap items-center gap-3">
      {/* Visual date range display tag */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-prism-bg-card border border-prism-border-subtle text-xs font-mono text-prism-text-secondary">
        <Calendar className="w-3.5 h-3.5 text-prism-accent-blue" aria-hidden="true" />
        <span>
          {current.startDate} <span className="text-prism-text-muted">→</span> {current.endDate}
        </span>
      </div>

      {/* Preset Buttons */}
      <div
        role="group"
        aria-label="Date range selector"
        className="inline-flex p-0.5 rounded-lg bg-prism-bg-base border border-prism-border-subtle"
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
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                isSelected
                  ? 'bg-prism-bg-elevated text-prism-text-primary shadow-sm border border-prism-border-subtle'
                  : 'text-prism-text-secondary hover:text-prism-text-primary hover:bg-prism-bg-card/40'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
