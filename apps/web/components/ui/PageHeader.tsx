'use client';

import React from 'react';
import { AnalyticalCoordinate } from './AnalyticalCoordinate';
import { StatusBadge } from './Badges';

export interface PageHeaderProps {
  title: string;
  description?: string;
  coordinate?: string;
  dimension?: 'monetary' | 'behavioral' | 'structural' | 'neutral';
  badge?: React.ReactNode;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  coordinate,
  dimension = 'neutral',
  badge,
  actions,
}) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-slate-200/80">
      <div className="max-w-3xl">
        <div className="flex items-center gap-2.5 flex-wrap">
          {coordinate && (
            <AnalyticalCoordinate dimension={dimension}>
              {coordinate}
            </AnalyticalCoordinate>
          )}
          {badge}
        </div>
        <h1 className="mt-2.5 text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
          {title}
        </h1>
        {description && (
          <p className="mt-2 text-sm sm:text-base text-slate-500 leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          {actions}
        </div>
      )}
    </div>
  );
};

