/**
 * PRISM Analytics & Semantic Layer Domain Contracts
 */

export type TimeGrain = 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';

export type DimensionName =
  | 'date'
  | 'customer_segment'
  | 'category'
  | 'subcategory'
  | 'region'
  | 'state'
  | 'channel'
  | 'device_type'
  | 'campaign_name';

export type MetricName =
  | 'gross_revenue'
  | 'net_revenue'
  | 'orders'
  | 'average_order_value'
  | 'conversion_rate'
  | 'cart_abandonment_rate'
  | 'total_customers'
  | 'new_customers'
  | 'returning_customers'
  | 'sessions';

export interface MetricDelta {
  currentValue: number;
  comparisonValue: number;
  absoluteDelta: number;
  percentageDelta: number | null;
  direction: 'up' | 'down' | 'neutral';
  isFavorable: boolean;
}

export interface KPICardData {
  metricId: MetricName;
  label: string;
  formattedValue: string;
  rawDelta: MetricDelta;
  sparklineData: { timestamp: string; value: number }[];
  timeframeLabel: string;
}

export interface AnalyticsFilter {
  dimension: DimensionName;
  operator: 'eq' | 'in' | 'neq' | 'gt' | 'lt' | 'between';
  value: string | number | (string | number)[];
}

export interface AnalyticsQueryPayload {
  metrics: MetricName[];
  dimensions?: DimensionName[];
  timeGrain?: TimeGrain;
  startDate: string;
  endDate: string;
  comparisonWindow?: 'previous_period' | 'same_period_last_year' | 'custom';
  filters?: AnalyticsFilter[];
  limit?: number;
}

export interface AnalyticsTimeSeriesPoint {
  timestamp: string;
  metrics: Record<string, number>;
  comparisonMetrics?: Record<string, number>;
}

export interface AnalyticsQueryResult {
  queryId: string;
  executionTimeMs: number;
  timeGrain: TimeGrain;
  points: AnalyticsTimeSeriesPoint[];
  summary: Record<string, MetricDelta>;
}
