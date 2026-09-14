import React from 'react';
import { DateRangeControl } from './Controls';
import { StatusBadge } from './Badges';

export interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  showDateRange?: boolean;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  badge,
  actions,
  showDateRange = false,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-prism-border-subtle">
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-prism-text-primary">
            {title}
          </h1>
          {badge || <StatusBadge status="cached" label="Sample data" />}
        </div>
        {description && (
          <p className="text-xs sm:text-sm text-prism-text-secondary mt-1 font-normal max-w-2xl">
            {description}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2.5 flex-wrap">
        {showDateRange && <DateRangeControl />}
        {actions}
      </div>
    </div>
  );
};
