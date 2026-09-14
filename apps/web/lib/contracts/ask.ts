/**
 * PRISM Ask PRISM — Conversational BI Domain Contracts
 * Authoritative TypeScript definitions mirroring apps/api/src/contracts/intent.py
 */

import {
  AnalyticsQuery,
  AnalyticsQueryResult,
  AnalyticsFilter,
  TimeGrain,
  ComparisonWindow,
} from './analytics';

export type VisualizationType = 'metric' | 'bar' | 'line' | 'area' | 'table';

export interface VisualizationSpec {
  type: VisualizationType;
  title: string;
  x_axis?: string;
  y_axis?: string;
  metric_label?: string;
  metric_value?: string;
  comparison_label?: string;
  delta?: number | null;
  is_favorable?: boolean | null;
  series?: Record<string, any>[];
}

export interface SemanticIntent {
  metrics: string[];
  dimensions: string[];
  time_grain?: TimeGrain | null;
  start_date: string;
  end_date: string;
  comparison?: ComparisonWindow;
  filters: AnalyticsFilter[];
  limit?: number;
  visualization_hint: VisualizationType;
  intent_summary: string;
}

export interface ConversationContext {
  session_id: string;
  turn_count: number;
  last_intent?: SemanticIntent | null;
  last_query?: AnalyticsQuery | null;
  last_metrics: string[];
  last_dimensions: string[];
  last_filters: AnalyticsFilter[];
  active_start_date?: string | null;
  active_end_date?: string | null;
  active_time_grain?: TimeGrain | null;
}

export interface AskPrismRequest {
  message: string;
  context?: ConversationContext | null;
}

export interface AskPrismResponse {
  answer: string;
  intent: SemanticIntent;
  query: AnalyticsQuery;
  result: AnalyticsQueryResult;
  visualization: VisualizationSpec;
  context: ConversationContext;
  execution_time_ms: number;
}
