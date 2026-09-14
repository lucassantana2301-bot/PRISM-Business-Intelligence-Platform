/**
 * PRISM Client Analytics API
 * Dispatches queries to server analytics endpoints.
 */

import { AnalyticsQuery, AnalyticsQueryResult, MetricSummaryValue, TimeGrain } from '@/lib/contracts/analytics';
import { FunnelStepData } from './analytics_service';

export interface OverviewDashboardData {
  startDate: string;
  endDate: string;
  timeGrain: TimeGrain;
  kpis: Record<string, MetricSummaryValue>;
  trend: { timestamp: string; date: string; net_revenue: number; orders: number; current: number; previous?: number }[];
  categories: { category: string; name: string; revenue: number; gross_revenue: number; share: number; color: string }[];
  regional: { region: string; revenue: number; net_revenue: number; orders: number; share: number; aov: number }[];
  funnel: FunnelStepData[];
  topProducts: { product_id: string; title: string; category: string; gross_revenue: number; revenue: number; units_sold: number }[];
  executionTimeMs: number;
}

export async function fetchAnalyticsQuery(query: AnalyticsQuery): Promise<AnalyticsQueryResult> {
  const res = await fetch('/api/analytics/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(query),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Query failed' }));
    throw new Error(err.error || `Analytics query failed with status ${res.status}`);
  }

  return res.json();
}

export async function fetchOverviewDashboardData(
  startDate: string,
  endDate: string,
  timeGrain: TimeGrain = 'day'
): Promise<OverviewDashboardData> {
  const params = new URLSearchParams({
    startDate,
    endDate,
    timeGrain,
  });

  const res = await fetch(`/api/analytics/overview?${params.toString()}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Overview data request failed' }));
    throw new Error(err.error || `Overview request failed with status ${res.status}`);
  }

  return res.json();
}
