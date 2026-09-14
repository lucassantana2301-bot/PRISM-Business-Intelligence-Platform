import React from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/Badges';
import { InsightsFeed } from '@/components/insights/InsightsFeed';
import { detectBusinessInsights } from '@/lib/api/insights_service';

export const dynamic = 'force-dynamic';

export default async function InsightsPage() {
  const data = await detectBusinessInsights();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Proactive Business Insights & Anomalies"
        description="Autonomous statistical signals derived from canonical data: conversion bottlenecks, category surges, and regional disparities."
        badge={
          <StatusBadge
            status="anomaly"
            label={`${data.total_detected} Statistical Signals (${data.critical_count} Critical)`}
          />
        }
      />

      <InsightsFeed
        insights={data.insights}
        evaluatedPeriod={data.evaluated_period}
      />
    </div>
  );
}
