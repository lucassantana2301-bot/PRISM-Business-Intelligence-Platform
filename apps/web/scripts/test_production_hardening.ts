/**
 * PRISM Production Hardening & Performance Benchmark Suite
 * Phase 11 Quality Gate
 * Evaluates latency benchmarks, AST injection security, memory reliability,
 * accessibility tokens, and healthcheck status.
 */

import { executeAnalyticsQuery } from '../lib/api/analytics_service';
import { executeAskPrismQuery } from '../lib/api/ask_service';
import { detectBusinessInsights } from '../lib/api/insights_service';
import { executeExplorerQuery } from '../lib/api/explorer_service';
import { DataProviderRegistry } from '../lib/providers/data_provider';

async function runHardeningSuite() {
  console.log('===============================================================');
  console.log('   PRISM PHASE 11 — PRODUCTION HARDENING & BENCHMARK SUITE     ');
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

  // 0. Warmup Call (Pre-populates disk dataset cache)
  await executeAnalyticsQuery({
    metrics: ['gross_revenue'],
    start_date: '2026-10-01',
    end_date: '2026-10-31',
  });

  // 1. Performance Latency Benchmarks
  console.log('\n⚡ [1/5] Running Performance Latency Benchmarks...');

  // A. Executive KPI Calculation
  const t0_overview = performance.now();
  const kpiResult = await executeAnalyticsQuery({
    metrics: ['gross_revenue', 'net_revenue', 'orders', 'conversion_rate', 'average_order_value'],
    start_date: '2026-10-02',
    end_date: '2026-10-31',
    comparison: 'previous_period',
  });
  const d_overview = performance.now() - t0_overview;
  assert(d_overview < 500, `Executive Overview calculated in ${d_overview.toFixed(1)}ms (< 500ms target)`);
  assert(Object.keys(kpiResult.metrics_summary).length >= 4, `4+ Executive KPI metrics calculated accurately`);

  // B. Analytics Engine Semantic Query
  const t0_analytics = performance.now();
  const analyticsRes = await executeAnalyticsQuery({
    metrics: ['gross_revenue', 'conversion_rate'],
    dimensions: ['category'],
    start_date: '2026-10-01',
    end_date: '2026-10-31',
  });
  const d_analytics = performance.now() - t0_analytics;
  assert(d_analytics < 200, `Analytics query executed in ${d_analytics.toFixed(1)}ms (< 200ms target)`);
  assert(analyticsRes.rows.length > 0, `Returned ${analyticsRes.rows.length} rows`);

  // C. Ask PRISM Intent & Response Generation
  const t0_ask = performance.now();
  const askRes = await executeAskPrismQuery({
    message: 'Qual região teve maior faturamento nos últimos 30 dias?',
  });
  const d_ask = performance.now() - t0_ask;
  assert(d_ask < 250, `Ask PRISM processed in ${d_ask.toFixed(1)}ms (< 250ms target)`);
  assert(askRes.is_supported, 'Ask query resolved successfully');

  // D. Autonomous Insight Detection
  const t0_insights = performance.now();
  const insightsRes = await detectBusinessInsights();
  const d_insights = performance.now() - t0_insights;
  assert(d_insights < 400, `Insights detection completed in ${d_insights.toFixed(1)}ms (< 400ms target)`);
  assert(insightsRes.total_detected > 0, `Discovered ${insightsRes.total_detected} anomalies`);

  // E. Data Explorer Server Pagination
  const t0_explorer = performance.now();
  const explorerRes = await executeExplorerQuery({
    dataset: 'orders',
    page: 1,
    page_size: 50,
    sort_by: 'total_revenue',
    sort_direction: 'desc',
  });
  const d_explorer = performance.now() - t0_explorer;
  assert(d_explorer < 150, `Data Explorer paginated 50 rows in ${d_explorer.toFixed(1)}ms (< 150ms target)`);
  assert(explorerRes.rows.length === 50, `Returned exact page size of 50 records`);

  // 2. Security Injection Hardening
  console.log('\n🛡️ [2/5] Verifying Strict Read-Only Security & Adversarial Injection Barriers...');
  const adversarialAttacks = [
    'DROP TABLE orders;',
    'ALTER TABLE customers ADD COLUMN hack VARCHAR;',
    'DELETE FROM sessions WHERE 1=1;',
    'UPDATE products SET base_price = 0;',
    'SELECT * FROM "private_keys";',
    'ATTACH "/tmp/malicious.db" AS mal;',
    'COPY orders TO \'/tmp/orders_dump.csv\';',
    'INSERT INTO campaigns VALUES (\'hacked\');',
  ];

  for (const attack of adversarialAttacks) {
    const res = await executeAskPrismQuery({ message: attack });
    assert(!res.is_supported, `Strictly rejected DDL/DML injection probe: "${attack}"`);
  }

  // 3. Healthcheck & Engine State Verification
  console.log('\n🩺 [3/5] Verifying Healthcheck & Provider Engine State...');
  const registry = DataProviderRegistry.getInstance();
  const sourcesData = await registry.getAllSources();
  assert(sourcesData.active_source.status === 'connected', 'Active engine reports healthy connected state');
  assert(sourcesData.total_tables === 6, 'All 6 canonical tables active and available');
  assert(sourcesData.active_source.governance.read_only_enforced, 'Read-only mode strictly enforced');
  assert(sourcesData.active_source.governance.ast_validation, 'AST query validation active');

  // 4. Memory & Resource Reliability
  console.log('\n🧠 [4/5] Inspecting Node Memory & Execution Stability...');
  const mem = process.memoryUsage();
  const heapUsedMB = (mem.heapUsed / 1024 / 1024).toFixed(1);
  assert(mem.heapUsed < 400 * 1024 * 1024, `Heap memory usage is stable at ${heapUsedMB}MB (< 400MB threshold)`);

  // 5. Zero-State & Resiliency Handling
  console.log('\n🧘 [5/5] Verifying Graceful Handling of Empty & Out-of-Range Filters...');
  const emptyFilterRes = await executeAnalyticsQuery({
    metrics: ['gross_revenue'],
    start_date: '2020-01-01',
    end_date: '2020-01-31',
  });
  assert(emptyFilterRes.row_count === 1 || emptyFilterRes.rows.length === 0, 'Gracefully handled out-of-range date window');
  assert(emptyFilterRes.metrics_summary['gross_revenue'].current_value === 0, 'Metric summary safely defaults to 0.00 without throwing exceptions');

  console.log('\n===============================================================');
  console.log(`   PRISM PHASE 11 TEST RESULTS: ${passed} PASSED, ${failed} FAILED   `);
  console.log('===============================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runHardeningSuite().catch((err) => {
  console.error('Hardening test suite failed:', err);
  process.exit(1);
});
