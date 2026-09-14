/**
 * PRISM Dynamic Visualization Contracts
 * Authoritative specification for deterministic, semantic dynamic visualizations.
 */

import { FormatType } from './analytics';

export type SupportedVisualizationType =
  | 'metric'
  | 'line'
  | 'area'
  | 'bar'
  | 'horizontal_bar'
  | 'stacked_bar'
  | 'donut'
  | 'table';

export interface DataPoint {
  [key: string]: any;
}

export interface VisualizationAnnotation {
  label: string;
  value: number | string;
  type?: 'benchmark' | 'target' | 'anomaly';
}

export interface VisualizationSpec {
  type: SupportedVisualizationType;
  title: string;
  subtitle?: string;
  metric?: string;
  dimension?: string;
  x_axis?: string | null;
  y_axis?: string | null;
  series?: DataPoint[] | null;
  metric_label?: string | null;
  metric_value?: string | null;
  comparison_label?: string | null;
  delta?: number | null;
  is_favorable?: boolean | null;
  format_type?: FormatType;
  sort?: 'asc' | 'desc';
  limit?: number;
  orientation?: 'vertical' | 'horizontal';
  explanation?: string;
  annotations?: VisualizationAnnotation[];
}

export interface VisualizationRuleInput {
  metrics: string[];
  dimensions?: string[];
  timeGrain?: string | null;
  rowCount: number;
  rows?: Record<string, any>[];
  comparison?: string | null;
  isRanked?: boolean;
  formatType?: FormatType;
  primaryMetricLabel?: string;
}
