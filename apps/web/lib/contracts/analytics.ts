/**
 * PRISM Analytics & Semantic Layer Domain Contracts
 * Authoritative TypeScript definitions mirroring apps/api/src/analytics/*
 */

export type TimeGrain = 'day' | 'week' | 'month' | 'quarter' | 'year';

export type DimensionName =
  | 'date'
  | 'customer_segment'
  | 'category'
  | 'subcategory'
  | 'product_id'
  | 'region'
  | 'state'
  | 'channel'
  | 'device_type'
  | 'browser'
  | 'payment_method'
  | 'campaign_name';

export type MetricName =
  | 'gross_revenue'
  | 'net_revenue'
  | 'orders'
  | 'average_order_value'
  | 'sessions'
  | 'conversion_rate'
  | 'cart_abandonment_rate'
  | 'total_customers'
  | 'new_customers'
  | 'returning_customers'
  | 'units_sold'
  | 'gross_margin'
  | 'gross_margin_rate'
  | 'revenue_per_customer'
  | 'revenue_per_session'
  | 'roas';

export type MetricCategory = 'monetization' | 'volume' | 'conversion' | 'customers' | 'marketing';
export type FormatType = 'currency' | 'integer' | 'percentage' | 'ratio' | 'decimal';

export interface MetricDefinition {
  metricId: MetricName;
  displayName: string;
  description: string;
  category: MetricCategory;
  formulaSql: string;
  sourceEntities: string[];
  aggregationType: string;
  supportedDimensions: DimensionName[];
  supportedGrains: TimeGrain[];
  formatType: FormatType;
  isFavorableUp: boolean;
  safeZeroDenominator: boolean;
}

export type FilterOperator = 'eq' | 'neq' | 'in' | 'not_in' | 'gt' | 'gte' | 'lt' | 'lte' | 'between';

export interface AnalyticsFilter {
  dimension: DimensionName | string;
  operator: FilterOperator;
  value: string | number | boolean | (string | number | boolean)[];
}

export type ComparisonWindow = 'none' | 'previous_period' | 'previous_year' | 'custom';

export interface OrderByClause {
  field: string;
  direction: 'asc' | 'desc';
}

export interface AnalyticsQuery {
  metrics: MetricName[];
  dimensions?: (DimensionName | string)[];
  time_grain?: TimeGrain;
  start_date: string;
  end_date: string;
  comparison?: ComparisonWindow;
  custom_comparison_start?: string;
  custom_comparison_end?: string;
  filters?: AnalyticsFilter[];
  order_by?: OrderByClause[];
  limit?: number;
  offset?: number;
}

export interface MetricSummaryValue {
  metric_id: MetricName | string;
  current_value: number;
  previous_value?: number | null;
  absolute_delta?: number | null;
  percentage_delta?: number | null;
  format_type: FormatType;
  is_favorable_up: boolean;
  is_favorable?: boolean | null;
}

export interface AnalyticsQueryResult {
  query: AnalyticsQuery;
  metrics_summary: Record<string, MetricSummaryValue>;
  rows: Record<string, any>[];
  row_count: number;
  execution_time_ms: number;
  compiled_sql?: string;
}

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
