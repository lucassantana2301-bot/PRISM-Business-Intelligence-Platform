import React from 'react';
import { OverviewDashboardClient } from '@/components/overview/OverviewDashboardClient';

export const metadata = {
  title: 'Executive Overview — PRISM',
  description: 'Ask. Understand. Decide. Modern business data intelligence platform connected to DuckDB.',
};

export default function HomePage() {
  return (
    <div className="space-y-6">
      <OverviewDashboardClient />
    </div>
  );
}
