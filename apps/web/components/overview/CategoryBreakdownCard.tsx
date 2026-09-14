'use client';

import React from 'react';
import { ChartCard } from '@/components/ui/ChartCard';
import { formatCurrency } from '@/lib/utils/formatters';

export interface CategoryDataRow {
  category: string;
  name: string;
  revenue: number;
  gross_revenue: number;
  share: number;
  color?: string;
}

interface CategoryBreakdownCardProps {
  data: CategoryDataRow[];
  isLoading?: boolean;
}

export const CategoryBreakdownCard: React.FC<CategoryBreakdownCardProps> = ({
  data,
  isLoading = false,
}) => {
  const topCategory = data.length > 0 ? data[0] : null;

  return (
    <ChartCard
      title="Revenue by Category"
      subtitle="Canonical gross revenue distribution across departments"
      footer={
        topCategory ? (
          <div className="flex items-center justify-between w-full text-xs">
            <span>
              Top: <strong className="text-prism-text-primary">{topCategory.name}</strong> (
              {formatCurrency(topCategory.revenue, true)})
            </span>
            <span className="text-prism-accent-blue font-mono">{topCategory.share}% share</span>
          </div>
        ) : (
          <span>No category data available</span>
        )
      }
    >
      <div className="h-64 w-full flex flex-col justify-between">
        {isLoading ? (
          <div className="space-y-4 pt-3 animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="space-y-1.5">
                <div className="h-3 bg-prism-bg-elevated rounded w-1/3" />
                <div className="h-2 bg-prism-bg-elevated rounded w-full" />
              </div>
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-prism-text-muted">
            No category revenue in selected range
          </div>
        ) : (
          <div className="space-y-3 pt-1 overflow-y-auto pr-1">
            {data.map((cat) => (
              <div key={cat.category} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-prism-text-secondary truncate">{cat.name}</span>
                  <span className="text-prism-text-primary font-medium">
                    {formatCurrency(cat.revenue, true)} ({cat.share}%)
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-prism-bg-elevated overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(cat.share, 100)}%`,
                      backgroundColor: cat.color || '#3B82F6',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ChartCard>
  );
};
