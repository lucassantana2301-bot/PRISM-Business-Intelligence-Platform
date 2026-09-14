/**
 * PRISM Insights & Anomaly Detection Layer Contracts
 * Strict structured schema for statistically discovered business signals.
 */

export type InsightSeverity = 'critical' | 'warning' | 'opportunity' | 'info';

export type InsightType =
  | 'Revenue Spike'
  | 'Revenue Drop'
  | 'Conversion Drop'
  | 'Traffic Spike'
  | 'ROAS Deterioration'
  | 'Margin Change'
  | 'Category Outperformance'
  | 'Regional Underperformance'
  | 'Device Performance Shift'
  | 'Product Breakout';

export interface BusinessInsight {
  id: string;
  type: InsightType;
  severity: InsightSeverity;
  title: string;
  metric: string;
  dimension?: string;
  segment?: string;
  period: string;
  baseline: number;
  observed_value: number;
  change: number; // percentage change, e.g. -34.2
  confidence: number; // 0.0 to 1.0
  evidence: string; // purely factual observation
  hypothesis?: string; // separated hypothetical driver
  recommended_follow_up: string;
  ask_query: string; // seed query for Ask PRISM
  detected_at: string;
}

export interface InsightsResponse {
  insights: BusinessInsight[];
  total_detected: number;
  critical_count: number;
  warning_count: number;
  opportunity_count: number;
  evaluated_period: string;
  generated_at: string;
}
