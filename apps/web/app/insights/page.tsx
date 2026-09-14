import React from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/Badges';
import { InsightsFeed } from '@/components/insights/InsightsFeed';
import { mockInsightsData } from '@/lib/mock/ecommerce';

export default function InsightsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Insights & Anomaly Feed"
        description="Autonomous statistical signals: detection of revenue spikes, conversion bottlenecks, and driver attribution (sample preview)."
        badge={<StatusBadge status="cached" label={`${mockInsightsData.length} Sample Signals`} />}
      />

      <InsightsFeed insights={mockInsightsData} />
    </div>
  );
}
