'use client';

import React from 'react';
import { TrendingUp, MapPin } from 'lucide-react';
import { formatCurrency, formatInteger } from '@/lib/utils/formatters';

export interface RegionalDataRow {
  region: string;
  revenue: number;
  net_revenue: number;
  orders: number;
  share: number;
  aov: number;
}

interface RegionalPerformanceCardProps {
  data: RegionalDataRow[];
  isLoading?: boolean;
}

export const RegionalPerformanceCard: React.FC<RegionalPerformanceCardProps> = ({
  data,
  isLoading = false,
}) => {
  const topRegion = data.length > 0 ? data[0] : null;

  return (
    <div className="p-5 rounded-lg bg-prism-bg-card border border-prism-border-subtle flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-medium text-prism-text-primary flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-prism-accent-blue" aria-hidden="true" />
              Regional Performance
            </h3>
            <p className="text-xs text-prism-text-muted mt-0.5">
              Geographic net revenue and order distribution
            </p>
          </div>
          {topRegion && (
            <span className="text-xs font-mono text-prism-accent-blue flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Top: {topRegion.region}</span>
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="divide-y divide-prism-border-subtle/40 animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="py-2.5 flex items-center justify-between">
                <div className="h-3 bg-prism-bg-elevated rounded w-20" />
                <div className="h-3 bg-prism-bg-elevated rounded w-28" />
              </div>
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="py-8 text-center text-xs text-prism-text-muted">
            No regional order activity in selected date range
          </div>
        ) : (
          <div className="divide-y divide-prism-border-subtle/60">
            {data.map((reg) => (
              <div
                key={reg.region}
                className="py-2.5 flex items-center justify-between font-mono text-xs"
              >
                <div className="text-prism-text-primary font-sans font-medium">{reg.region}</div>
                <div className="flex items-center gap-4">
                  <span className="text-prism-text-secondary">
                    {formatCurrency(reg.revenue, true)}
                  </span>
                  <span className="text-prism-text-muted w-14 text-right">
                    {formatInteger(reg.orders)} ord
                  </span>
                  <span className="text-prism-accent-blue w-12 text-right font-medium">
                    {reg.share}%
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
