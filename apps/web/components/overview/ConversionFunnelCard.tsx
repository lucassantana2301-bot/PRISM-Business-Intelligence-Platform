'use client';

import React from 'react';
import { Filter } from 'lucide-react';
import { formatInteger } from '@/lib/utils/formatters';
import { FunnelStepData } from '@/lib/api/analytics_service';

interface ConversionFunnelCardProps {
  data: FunnelStepData[];
  isLoading?: boolean;
}

export const ConversionFunnelCard: React.FC<ConversionFunnelCardProps> = ({
  data,
  isLoading = false,
}) => {
  return (
    <div className="p-5 rounded-lg bg-prism-bg-card border border-prism-border-subtle flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-medium text-prism-text-primary flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-prism-accent-purple" aria-hidden="true" />
              Conversion Funnel
            </h3>
            <p className="text-xs text-prism-text-muted mt-0.5">
              Canonical 5-stage session conversion telemetry
            </p>
          </div>
          <span className="text-xs font-mono text-prism-text-muted">
            Strict Session Flow
          </span>
        </div>

        {isLoading ? (
          <div className="space-y-2 animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 bg-prism-bg-elevated/60 rounded" />
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="py-8 text-center text-xs text-prism-text-muted">
            No session telemetry recorded in selected date range
          </div>
        ) : (
          <div className="space-y-2 font-mono text-xs">
            {data.map((f) => (
              <div
                key={f.step}
                className="p-2 rounded bg-prism-bg-elevated/60 border border-prism-border-subtle/50 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span className="text-prism-text-primary font-sans text-xs font-medium">
                    {f.step}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-prism-text-secondary">{formatInteger(f.count)}</span>
                  <span className="text-prism-accent-blue font-medium w-14 text-right">
                    {f.conversion}
                  </span>
                  <span
                    className={`text-[11px] w-14 text-right ${
                      f.drop === '0.0%' ? 'text-prism-text-muted' : 'text-rose-400'
                    }`}
                  >
                    {f.drop}
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
