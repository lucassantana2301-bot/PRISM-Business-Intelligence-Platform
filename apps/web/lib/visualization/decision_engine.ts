/**
 * PRISM Dynamic Visualization Decision Engine
 * Deterministic selection of visualization types based on analytical semantics and data characteristics.
 * Strictly adheres to BI readability standards with zero dynamic code injection.
 */

import {
  VisualizationSpec,
  VisualizationRuleInput,
  SupportedVisualizationType,
} from '../contracts/visualization';
import { AnalyticsQueryResult, FormatType } from '../contracts/analytics';
import { formatMetricValue } from '../utils/formatters';

const COMPOSITION_DIMENSIONS = new Set(['customer_segment', 'channel', 'payment_method', 'device_type']);

/**
 * Validates a VisualizationSpec at runtime.
 */
export function validateVisualizationSpec(spec: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!spec || typeof spec !== 'object') {
    return { isValid: false, errors: ['VisualizationSpec must be a non-null object'] };
  }

  const validTypes: SupportedVisualizationType[] = [
    'metric',
    'line',
    'area',
    'bar',
    'horizontal_bar',
    'stacked_bar',
    'donut',
    'table',
  ];

  if (!validTypes.includes(spec.type)) {
    errors.push(`Unsupported visualization type: '${spec.type}'`);
  }

  if (!spec.title || typeof spec.title !== 'string') {
    errors.push('VisualizationSpec requires a non-empty title string');
  }

  if (spec.type !== 'metric' && (!Array.isArray(spec.series) || spec.series.length === 0)) {
    errors.push(`Visualization type '${spec.type}' requires a non-empty series array`);
  }

  if (spec.type === 'metric' && (spec.metric_value === undefined || spec.metric_value === null)) {
    errors.push("Metric visualization requires 'metric_value'");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Derives a deterministic VisualizationSpec from analytical query results and semantic intent.
 */
export function deriveVisualizationSpec(
  result: AnalyticsQueryResult,
  ruleInput: VisualizationRuleInput
): VisualizationSpec {
  const { metrics, dimensions = [], timeGrain, rowCount, rows = result.rows } = ruleInput;
  const primaryMetric = metrics[0] || 'gross_revenue';
  const primaryDim = dimensions[0];
  const summary = result.metrics_summary[primaryMetric];
  const formatType: FormatType = summary?.format_type || ruleInput.formatType || 'currency';

  // 1. Single aggregate metric without dimensional breakdown
  if (dimensions.length === 0 || (rowCount <= 1 && dimensions.length === 0 && !timeGrain)) {
    const rawVal = summary?.current_value ?? (rows[0] ? rows[0][primaryMetric] : 0);
    const prevVal = summary?.previous_value;
    const delta = summary?.percentage_delta ?? null;
    const isFavorable = summary?.is_favorable ?? null;

    return {
      type: 'metric',
      title: ruleInput.primaryMetricLabel || primaryMetric.replace(/_/g, ' ').toUpperCase(),
      metric: primaryMetric,
      metric_label: primaryMetric.replace(/_/g, ' '),
      metric_value: formatMetricValue(rawVal, formatType),
      comparison_label: prevVal !== undefined && prevVal !== null ? 'vs previous period' : undefined,
      delta,
      is_favorable: isFavorable,
      format_type: formatType,
      explanation: 'Metric card selected because query produced a single aggregate summary value.',
    };
  }

  // 2. Time-series trajectory
  if (timeGrain || primaryDim === 'date' || primaryDim === 'timestamp') {
    const isRateOrRatio = formatType === 'percentage' || formatType === 'ratio' || primaryMetric.includes('rate');
    const chartType: SupportedVisualizationType = isRateOrRatio ? 'line' : 'area';

    return {
      type: chartType,
      title: `${primaryMetric.replace(/_/g, ' ').toUpperCase()} Trajectory`,
      subtitle: `Aggregated by ${timeGrain || 'period'}`,
      metric: primaryMetric,
      dimension: primaryDim || 'date',
      x_axis: primaryDim || 'date',
      y_axis: primaryMetric,
      series: rows,
      format_type: formatType,
      explanation: `${chartType === 'area' ? 'Area' : 'Line'} chart selected to show trajectory across ${timeGrain || 'time'}.`,
    };
  }

  // 3. High cardinality dataset (> 10 items or specific high cardinality dimensions)
  if (rowCount > 10 || primaryDim === 'product_id' || (primaryDim === 'campaign_name' && rowCount > 8)) {
    return {
      type: 'table',
      title: `${primaryMetric.replace(/_/g, ' ').toUpperCase()} by ${primaryDim?.replace(/_/g, ' ').toUpperCase()}`,
      subtitle: `Showing top ${Math.min(rowCount, 20)} records`,
      metric: primaryMetric,
      dimension: primaryDim,
      series: rows.slice(0, 20),
      format_type: formatType,
      limit: 20,
      explanation: `Table selected to display high-cardinality data (${rowCount} items).`,
    };
  }

  // 4. Small categorical composition (<= 8 items strictly for composition dimensions)
  if (primaryDim && COMPOSITION_DIMENSIONS.has(primaryDim) && rowCount >= 2 && rowCount <= 8 && !ruleInput.isRanked) {
    return {
      type: 'donut',
      title: `${primaryMetric.replace(/_/g, ' ').toUpperCase()} Distribution`,
      subtitle: `Breakdown by ${primaryDim.replace(/_/g, ' ')}`,
      metric: primaryMetric,
      dimension: primaryDim,
      x_axis: primaryDim,
      y_axis: primaryMetric,
      series: rows,
      format_type: formatType,
      explanation: `Donut chart selected to display categorical distribution across ${primaryDim.replace(/_/g, ' ')}.`,
    };
  }

  // 5. Ranked categorical data (with explicit sort or top-n)
  if (ruleInput.isRanked || (rows.length > 8 && rows.length <= 12)) {
    return {
      type: 'horizontal_bar',
      title: `${primaryMetric.replace(/_/g, ' ').toUpperCase()} Ranking`,
      subtitle: `By ${primaryDim?.replace(/_/g, ' ') || 'Dimension'}`,
      metric: primaryMetric,
      dimension: primaryDim,
      x_axis: primaryDim,
      y_axis: primaryMetric,
      series: rows,
      format_type: formatType,
      orientation: 'horizontal',
      sort: ruleInput.isRanked ? 'desc' : undefined,
      explanation: `Horizontal bar chart selected to compare ranked performance across ${primaryDim?.replace(/_/g, ' ')}.`,
    };
  }

  // 6. Standard categorical comparison (<= 7 categories)
  return {
    type: 'bar',
    title: `${primaryMetric.replace(/_/g, ' ').toUpperCase()} by ${primaryDim?.replace(/_/g, ' ').toUpperCase() || 'Dimension'}`,
    subtitle: `Categorical breakdown`,
    metric: primaryMetric,
    dimension: primaryDim,
    x_axis: primaryDim,
    y_axis: primaryMetric,
    series: rows,
    format_type: formatType,
    orientation: 'vertical',
    explanation: `Bar chart selected because this query compares ${primaryMetric.replace(/_/g, ' ')} across ${primaryDim?.replace(/_/g, ' ')}.`,
  };
}
