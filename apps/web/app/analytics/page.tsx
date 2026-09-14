import React from 'react';
import { Download } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/Badges';
import { AnalyticsWorkspace } from '@/components/analytics/AnalyticsWorkspace';
import { mockChannelData, mockDeviceData } from '@/lib/mock/ecommerce';

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dimensional Analytics"
        description="Multi-axis dimensional slicing across Marketing Channels, Device Types, and Customer Cohorts (sample data preview)."
        badge={<StatusBadge status="cached" label="Sample data" />}
        actions={
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-prism-bg-card border border-prism-border-subtle hover:border-prism-border-hover text-xs font-mono text-prism-text-secondary transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-prism-text-muted" aria-hidden="true" />
            <span>Export View</span>
          </button>
        }
      />

      <AnalyticsWorkspace
        channelData={mockChannelData}
        deviceData={mockDeviceData}
      />
    </div>
  );
}
