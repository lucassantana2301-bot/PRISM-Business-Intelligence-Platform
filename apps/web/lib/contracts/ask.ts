/**
 * PRISM Ask PRISM — Conversational Analytics Contracts
 * Authoritative TypeScript definitions mirroring apps/api/src/contracts/intent.py
 */

import {
  AnalyticsQuery,
  AnalyticsQueryResult,
  AnalyticsFilter,
  TimeGrain,
  ComparisonWindow,
} from './analytics';
import { VisualizationSpec, SupportedVisualizationType } from './visualization';

export type VisualizationType = SupportedVisualizationType;
export type { VisualizationSpec };

export interface SemanticIntent {
  is_supported: boolean;
  confidence: number;
  metrics: string[];
  dimensions: string[];
  time_grain?: TimeGrain | null;
  start_date: string;
  end_date: string;
  comparison?: ComparisonWindow | null;
  filters: AnalyticsFilter[];
  limit?: number;
  sort_direction?: 'asc' | 'desc';
  visualization_hint: VisualizationType;
  intent_summary: string;
  clarification_prompt?: string | null;
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
  is_supported: boolean;
  confidence: number;
  intent: SemanticIntent;
  query?: AnalyticsQuery | null;
  result?: AnalyticsQueryResult | null;
  visualization?: VisualizationSpec | null;
  context: ConversationContext;
  execution_time_ms: float;
  request_id?: string;
  error_category?: string;
}

type float = number;
