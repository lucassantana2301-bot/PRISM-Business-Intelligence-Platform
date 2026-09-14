'use client';

import React from 'react';
import { Package } from 'lucide-react';
import { formatCurrency, formatInteger } from '@/lib/utils/formatters';

export interface TopProductRow {
  product_id: string;
  title: string;
  category: string;
  gross_revenue: number;
  revenue: number;
  units_sold: number;
}

interface TopProductsCardProps {
  data: TopProductRow[];
  isLoading?: boolean;
}

export const TopProductsCard: React.FC<TopProductsCardProps> = ({ data, isLoading = false }) => {
  return (
    <div className="p-5 rounded-lg bg-prism-bg-card border border-prism-border-subtle flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-medium text-prism-text-primary flex items-center gap-1.5">
              <Package className="w-4 h-4 text-emerald-400" aria-hidden="true" />
              Top Products by Gross Revenue
            </h3>
            <p className="text-xs text-prism-text-muted mt-0.5">
              Leading items by merchandise sales volume in selected date window
            </p>
          </div>
          <span className="text-xs font-mono text-prism-text-muted">Top 5 Items</span>
        </div>

        {isLoading ? (
          <div className="divide-y divide-prism-border-subtle/40 animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="py-2.5 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="h-3 bg-prism-bg-elevated rounded w-36" />
                  <div className="h-2 bg-prism-bg-elevated rounded w-20" />
                </div>
                <div className="h-3 bg-prism-bg-elevated rounded w-20" />
              </div>
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="py-8 text-center text-xs text-prism-text-muted">
            No item sales recorded in selected date range
          </div>
        ) : (
          <div className="divide-y divide-prism-border-subtle/60">
            {data.map((prod, idx) => (
              <div
                key={prod.product_id}
                className="py-2.5 flex items-center justify-between font-mono text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-4">
                  <span className="text-prism-text-muted font-mono w-4">{idx + 1}.</span>
                  <div className="min-w-0">
                    <p className="text-prism-text-primary font-sans font-medium truncate">
                      {prod.title}
                    </p>
                    <p className="text-[11px] text-prism-text-muted">{prod.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <span className="text-prism-text-muted">{formatInteger(prod.units_sold)} units</span>
                  <span className="text-prism-text-primary font-medium w-20 text-right">
                    {formatCurrency(prod.revenue, true)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
