'use client';

import React from 'react';
import { Calendar, Inbox, ChevronDown } from 'lucide-react';
import clsx from 'clsx';

// ==================== SEGMENTED CONTROL ====================
export interface SegmentOption<T extends string = string> {
  id: T;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface SegmentedControlProps<T extends string = string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: 'sm' | 'md';
}

export function SegmentedControl<T extends string = string>({
  options,
  value,
  onChange,
  size = 'md',
}: SegmentedControlProps<T>) {
  return (
    <div className="inline-flex items-center p-0.5 rounded-lg bg-prism-bg-card border border-prism-border-subtle">
      {options.map((option) => {
        const isSelected = option.id === value;
        const Icon = option.icon;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={clsx(
              'inline-flex items-center gap-1.5 font-mono rounded-md transition-all duration-150',
              size === 'sm' ? 'px-2 py-1 text-[11px]' : 'px-3 py-1.5 text-xs',
              isSelected
                ? 'bg-prism-bg-elevated text-prism-text-primary shadow-sm border border-prism-border-subtle font-medium'
                : 'text-prism-text-muted hover:text-prism-text-secondary hover:bg-zinc-800/40 border border-transparent'
            )}
          >
            {Icon && <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />}
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ==================== DATE RANGE CONTROL ====================
export interface DateRangeControlProps {
  currentRange?: string;
  comparisonLabel?: string;
  onSelect?: (range: string) => void;
}

export const DateRangeControl: React.FC<DateRangeControlProps> = ({
  currentRange = 'Last 30 Days',
  comparisonLabel = 'vs Previous 30 Days',
  onSelect,
}) => {
  return (
    <button
      type="button"
      onClick={() => onSelect?.(currentRange)}
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-prism-bg-card border border-prism-border-subtle hover:border-prism-border-hover hover:bg-prism-bg-elevated text-xs font-mono text-prism-text-primary transition-colors group"
    >
      <Calendar className="w-3.5 h-3.5 text-prism-text-muted group-hover:text-prism-accent-blue transition-colors" />
      <span className="font-medium">{currentRange}</span>
      <span className="text-[11px] text-prism-text-muted hidden md:inline">({comparisonLabel})</span>
      <ChevronDown className="w-3 h-3 text-prism-text-muted group-hover:text-prism-text-secondary transition-colors" />
    </button>
  );
};

// ==================== SKELETON LOADER ====================
export interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => {
  return (
    <div
      className={clsx(
        'animate-pulse bg-prism-porcelain border border-prism-hairline',
        className
      )}
    />
  );
};

// ==================== EMPTY STATE ====================
export interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 rounded-lg border border-dashed border-prism-border-subtle bg-prism-bg-card/40 text-center">
      <div className="h-10 w-10 rounded-full bg-prism-bg-elevated border border-prism-border-subtle flex items-center justify-center text-prism-text-muted mb-3">
        <Icon className="w-5 h-5" />
      </div>
      <h4 className="text-sm font-medium text-prism-text-primary mb-1">{title}</h4>
      <p className="text-xs text-prism-text-muted max-w-sm mb-4 leading-relaxed">{description}</p>
      {actionLabel && (
        <button
          type="button"
          onClick={onAction}
          className="px-3 py-1.5 rounded bg-prism-bg-elevated border border-prism-border-subtle hover:border-prism-border-hover text-xs font-mono text-prism-text-primary transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
