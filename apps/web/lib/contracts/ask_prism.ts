/**
 * Ask PRISM & Conversational Intelligence Contracts
 */

import { AnalyticsFilter, DimensionName, MetricName, TimeGrain } from './analytics';

export type VisualArchetype =
  | 'kpi_stat'
  | 'time_series_area'
  | 'comparative_line'
  | 'bar_distribution'
  | 'ranked_bar'
  | 'donut_breakdown'
  | 'matrix_heatmap'
  | 'tabular_records';

export interface SemanticIntent {
  intentType: 'metric_query' | 'comparative_analysis' | 'drill_down' | 'anomaly_inquiry' | 'general_question';
  primaryMetrics: MetricName[];
  dimensions: DimensionName[];
  filters: AnalyticsFilter[];
  timeGrain?: TimeGrain;
  startDate?: string;
  endDate?: string;
  comparisonTarget?: string;
  confidenceScore: number;
}

export interface ConversationTurn {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  intent?: SemanticIntent;
  visualPayload?: {
    archetype: VisualArchetype;
    data: unknown;
    title: string;
    caption?: string;
  };
  sqlAudit?: {
    generatedSql: string;
    executionTimeMs: number;
    rowCount: number;
  };
}

export interface AskPrismSession {
  sessionId: string;
  createdAt: string;
  updatedAt: string;
  turns: ConversationTurn[];
  activeContext: {
    activeDimensions: DimensionName[];
    activeFilters: AnalyticsFilter[];
    selectedTimeRange: string;
  };
}
