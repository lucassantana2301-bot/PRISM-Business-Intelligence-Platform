/**
 * PRISM Dynamic Visualization Engine Verification Suite
 * Phase 07 Quality Gate
 * Tests semantic decision rules, runtime spec validation, and analytical value preservation.
 */

import {
  deriveVisualizationSpec,
  validateVisualizationSpec,
} from '../lib/visualization/decision_engine';
import { executeAnalyticsQuery } from '../lib/api/analytics_service';
import { AnalyticsQueryResult } from '../lib/contracts/analytics';

async function runVisualizationSuite() {
  console.log('===============================================================');
  console.log('    PRISM PHASE 07 — DYNAMIC VISUALIZATION ENGINE TEST SUITE    ');
  console.log('===============================================================');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, msg: string) {
    if (condition) {
      console.log(`   ✓ ${msg}`);
      passed++;
    } else {
      console.error(`   ✗ FAIL: ${msg}`);
      failed++;
    }
  }

  // 1. Single Metric Decision Rule
  console.log('\n📊 [1/8] Testing Single Scalar Metric Decision Rule...');
  const metricResult: AnalyticsQueryResult = await executeAnalyticsQuery({
    metrics: ['gross_revenue'],
    start_date: '2026-10-01',
    end_date: '2026-10-31',
    comparison: 'previous_period',
  });
  const metricSpec = deriveVisualizationSpec(metricResult, {
    metrics: ['gross_revenue'],
    rowCount: 1,
    comparison: 'previous_period',
  });
  assert(metricSpec.type === 'metric', `Selected '${metricSpec.type}' (expected 'metric')`);
  assert(typeof metricSpec.metric_value === 'string' && metricSpec.metric_value.includes('$'), `Formatted metric value exists: ${metricSpec.metric_value}`);
  assert(Boolean(metricSpec.explanation?.includes('Metric card selected')), 'Explanation matches semantic rule');

  // 2. Time-series Trajectory Rule
  console.log('\n📈 [2/8] Testing Time-series Trajectory Decision Rule...');
  const timeResult: AnalyticsQueryResult = await executeAnalyticsQuery({
    metrics: ['gross_revenue'],
    dimensions: ['date'],
    time_grain: 'day',
    start_date: '2026-10-01',
    end_date: '2026-10-31',
  });
  const timeSpec = deriveVisualizationSpec(timeResult, {
    metrics: ['gross_revenue'],
    dimensions: ['date'],
    timeGrain: 'day',
    rowCount: timeResult.rows.length,
    rows: timeResult.rows,
  });
  assert(timeSpec.type === 'area', `Selected '${timeSpec.type}' for revenue time-series (expected 'area')`);
  assert(timeSpec.series !== null && (timeSpec.series?.length || 0) > 0, `Series populated with ${timeSpec.series?.length} points`);
  assert(Boolean(timeSpec.explanation?.includes('Area chart selected')), 'Explanation describes time-series provenance');

  // 3. Line Chart for Rates/Percentages
  console.log('\n📉 [3/8] Testing Line Chart Trajectory for Rates/Ratios...');
  const rateResult: AnalyticsQueryResult = await executeAnalyticsQuery({
    metrics: ['conversion_rate'],
    dimensions: ['date'],
    time_grain: 'week',
    start_date: '2026-06-01',
    end_date: '2026-10-31',
  });
  const rateSpec = deriveVisualizationSpec(rateResult, {
    metrics: ['conversion_rate'],
    dimensions: ['date'],
    timeGrain: 'week',
    rowCount: rateResult.rows.length,
    rows: rateResult.rows,
    formatType: 'percentage',
  });
  assert(rateSpec.type === 'line', `Selected '${rateSpec.type}' for conversion rate time-series (expected 'line')`);

  // 4. Categorical Comparison (Bar)
  console.log('\n📊 [4/8] Testing Categorical Comparison Decision Rule...');
  const barResult: AnalyticsQueryResult = await executeAnalyticsQuery({
    metrics: ['gross_revenue'],
    dimensions: ['region'],
    start_date: '2026-10-01',
    end_date: '2026-10-31',
  });
  const barSpec = deriveVisualizationSpec(barResult, {
    metrics: ['gross_revenue'],
    dimensions: ['region'],
    rowCount: barResult.rows.length,
    rows: barResult.rows,
  });
  assert(barSpec.type === 'bar' || barSpec.type === 'horizontal_bar', `Selected '${barSpec.type}' for regional comparison`);
  assert(barSpec.series?.length === barResult.rows.length, `Series contains all ${barResult.rows.length} regions`);

  // 5. Categorical Donut Composition (<= 5 segments)
  console.log('\n🍩 [5/8] Testing Small Categorical Composition (Donut)...');
  const donutResult: AnalyticsQueryResult = await executeAnalyticsQuery({
    metrics: ['sessions'],
    dimensions: ['channel'],
    start_date: '2026-10-01',
    end_date: '2026-10-31',
  });
  const donutSpec = deriveVisualizationSpec(donutResult, {
    metrics: ['sessions'],
    dimensions: ['channel'],
    rowCount: donutResult.rows.length,
    rows: donutResult.rows,
    formatType: 'integer',
  });
  assert(donutSpec.type === 'donut', `Selected '${donutSpec.type}' for channel composition (expected 'donut')`);
  assert(Boolean(donutSpec.explanation?.includes('Donut chart selected')), 'Donut provenance explanation verified');

  // 6. High Cardinality Table Rule
  console.log('\n📋 [6/8] Testing High-Cardinality Dataset Decision Rule (Table)...');
  const tableResult: AnalyticsQueryResult = await executeAnalyticsQuery({
    metrics: ['gross_revenue'],
    dimensions: ['product_id'],
    start_date: '2026-10-01',
    end_date: '2026-10-31',
    limit: 50,
  });
  const tableSpec = deriveVisualizationSpec(tableResult, {
    metrics: ['gross_revenue'],
    dimensions: ['product_id'],
    rowCount: tableResult.rows.length,
    rows: tableResult.rows,
  });
  assert(tableSpec.type === 'table', `Selected '${tableSpec.type}' for product_id high-cardinality query (expected 'table')`);
  assert((tableSpec.series?.length || 0) > 0, `Table series has ${tableSpec.series?.length} rows`);

  // 7. Runtime Spec Validation & Error Handling
  console.log('\n🛡️ [7/8] Testing Runtime Spec Validation & Defensive Error Gates...');
  const validCheck = validateVisualizationSpec(metricSpec);
  assert(validCheck.isValid && validCheck.errors.length === 0, 'Valid metric spec passes validation');

  const invalidTypeCheck = validateVisualizationSpec({ type: 'unsupported_chart_type', title: 'Invalid' });
  assert(!invalidTypeCheck.isValid && invalidTypeCheck.errors.some((e) => e.includes('Unsupported')), 'Caught unsupported chart type');

  const emptySeriesCheck = validateVisualizationSpec({ type: 'bar', title: 'Bar Chart', series: [] });
  assert(!emptySeriesCheck.isValid && emptySeriesCheck.errors.some((e) => e.includes('non-empty series')), 'Caught missing series for bar chart');

  const missingMetricCheck = validateVisualizationSpec({ type: 'metric', title: 'KPI' });
  assert(!missingMetricCheck.isValid && invalidTypeCheck.errors.length > 0, "Caught metric without 'metric_value'");

  // 8. Value Preservation (Ask Result === Visualization Result)
  console.log('\n⚖️ [8/8] Testing Exact Value Preservation across Engine and Visualization...');
  const rawSum = metricResult.metrics_summary['gross_revenue'].current_value;
  // Verify that visualization spec preserves numeric fidelity without drift
  const formattedExpected = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(rawSum);
  assert(metricSpec.metric_value === formattedExpected, `Value strictly preserved: '${metricSpec.metric_value}' === '${formattedExpected}'`);

  console.log('\n===============================================================');
  console.log(`   PRISM PHASE 07 TEST RESULTS: ${passed} PASSED, ${failed} FAILED   `);
  console.log('===============================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runVisualizationSuite().catch((err) => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
