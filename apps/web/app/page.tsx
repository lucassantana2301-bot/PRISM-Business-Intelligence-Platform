import React from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { OverviewDashboardClient } from '@/components/overview/OverviewDashboardClient';

export default function ExecutiveOverviewPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Executive Overview"
        description="High-level performance command center connected to the canonical DuckDB semantic analytics engine."
      />

      {/* Main Connected Dashboard Client Island */}
      <OverviewDashboardClient />
    </div>
  );
}
