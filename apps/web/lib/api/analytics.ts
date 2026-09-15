/**
 * PRISM Client Analytics API
 * Dispatches queries to server analytics endpoints with in-memory caching and pre-warming.
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

// In-memory Client Cache for 0ms Instant Tab Switching
const overviewCache = new Map<string, OverviewDashboardData>();
const inFlightRequests = new Map<string, Promise<OverviewDashboardData>>();

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
  timeGrain: TimeGrain = 'day',
  forceRefresh = false
): Promise<OverviewDashboardData> {
  const cacheKey = `${startDate}_${endDate}_${timeGrain}`;

  // 1. Return cached result immediately (0ms response)
  if (!forceRefresh && overviewCache.has(cacheKey)) {
    return overviewCache.get(cacheKey)!;
  }

  // 2. De-duplicate in-flight requests
  if (inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey)!;
  }

  const params = new URLSearchParams({
    startDate,
    endDate,
    timeGrain,
  });

  const requestPromise = (async () => {
    try {
      const res = await fetch(`/api/analytics/overview?${params.toString()}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Overview data request failed' }));
        throw new Error(err.error || `Overview request failed with status ${res.status}`);
      }

      const data: OverviewDashboardData = await res.json();
      // Cache indefinitely during session
      overviewCache.set(cacheKey, data);
      return data;
    } finally {
      inFlightRequests.delete(cacheKey);
    }
  })();

  inFlightRequests.set(cacheKey, requestPromise);
  return requestPromise;
}

/**
 * Pre-warms the cache in background for all canonical presets
 */
export function prewarmOverviewCache(presets: Array<{ startDate: string; endDate: string; timeGrain?: TimeGrain }>) {
  if (typeof window === 'undefined') return;
  // Use requestIdleCallback or setTimeout to warm up in background without blocking main thread
  setTimeout(() => {
    presets.forEach((p) => {
      void fetchOverviewDashboardData(p.startDate, p.endDate, p.timeGrain || 'day');
    });
  }, 100);
}
