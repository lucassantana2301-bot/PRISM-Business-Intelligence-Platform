'use client';

import React from 'react';
import clsx from 'clsx';

export interface ChartCardProps {
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  footer?: React.ReactNode;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  badge,
  actions,
  children,
  className,
  footer,
}) => {
  return (
    <div
      className={clsx(
        'p-5 rounded-xl bg-prism-bg-card border border-prism-border-subtle hover:border-prism-border-hover shadow-prism-card hover:shadow-prism-elevated transition-all duration-200 flex flex-col',
        className
      )}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-prism-text-primary tracking-tight">
              {title}
            </h3>
            {badge}
          </div>
          {subtitle && (
            <p className="text-xs text-prism-text-muted mt-0.5 font-sans">
              {subtitle}
            </p>
          )}
        </div>

        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>

      {/* Chart Canvas Area */}
      <div className="flex-1 w-full min-h-[220px]">
        {children}
      </div>

      {/* Optional Footer */}
      {footer && (
        <div className="mt-4 pt-3 border-t border-prism-border-subtle/60 text-xs text-prism-text-muted font-mono flex items-center justify-between">
          {footer}
        </div>
      )}
    </div>
  );
};
