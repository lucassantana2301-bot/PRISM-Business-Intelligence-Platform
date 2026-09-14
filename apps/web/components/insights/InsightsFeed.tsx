'use client';

import React, { useState } from 'react';
import { Filter } from 'lucide-react';
import { InsightCard, InsightSeverity } from '@/components/ui/InsightCard';
import { SegmentedControl } from '@/components/ui/Controls';
import { InsightItem } from '@/lib/mock/ecommerce';

export interface InsightsFeedProps {
  insights: InsightItem[];
}

export const InsightsFeed: React.FC<InsightsFeedProps> = ({ insights }) => {
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'critical' | 'warning' | 'opportunity'>('all');

  const filtered = insights.filter((item) => {
    if (filterSeverity === 'all') return true;
    return item.severity === filterSeverity;
  });

  return (
    <div className="space-y-6">
      {/* Severity Filter Strip */}
      <div className="p-3 rounded-lg bg-prism-bg-card border border-prism-border-subtle flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-prism-text-muted flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" aria-hidden="true" />
            Filter Severity:
          </span>

          <SegmentedControl
            options={[
              { id: 'all', label: `All Signals (${insights.length})` },
              { id: 'critical', label: 'Critical' },
              { id: 'warning', label: 'Warnings' },
              { id: 'opportunity', label: 'Opportunities' },
            ]}
            value={filterSeverity}
            onChange={(val) => setFilterSeverity(val as any)}
            size="sm"
          />
        </div>

        <span className="text-xs font-mono text-prism-text-muted hidden sm:inline">
          Sample statistical anomalies
        </span>
      </div>

      {/* Insights Feed Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((insight) => (
          <InsightCard
            key={insight.id}
            title={insight.title}
            description={insight.description}
            severity={insight.severity}
            metricLabel={insight.metricLabel}
            metricValue={insight.metricValue}
            impact={insight.impact}
            timestamp={insight.timestamp}
          />
        ))}
      </div>
    </div>
  );
};
