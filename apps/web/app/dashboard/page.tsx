import React from 'react';
import { OverviewDashboardClient } from '@/components/overview/OverviewDashboardClient';

export const metadata = {
  title: 'Executive Overview — PRISM',
  description: 'Executive KPI central command and telemetry connected to DuckDB.',
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <OverviewDashboardClient />
    </div>
  );
}
