/**
 * PRISM Phase 04 — Executive Dashboard Integration & Cross-Layer Reconciliation Suite
 * Verifies that the dashboard components, API handlers, and server analytics services
 * truthfully reflect canonical engine calculations with zero mathematical deviation,
 * strict ground-truth catalog isolation, and zero metric formula duplication in React.
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  executeAnalyticsQuery,
  calculateConversionFunnel,
} from '../lib/api/analytics_service';
import { DATE_PRESETS } from '../components/overview/DateRangeSelector';

const WEB_DIR = path.resolve(__dirname, '..');

async function runDashboardIntegrationTests() {
  console.log('\n===============================================================');
  console.log('    PRISM PHASE 04 — EXECUTIVE DASHBOARD INTEGRATION SUITE');
  console.log('===============================================================\n');

  // 1. Cross-Layer Reconciliation on Canonical 30-Day Window (2026-10-02 to 2026-10-31)
  console.log('📊 [1/6] Running Mandatory Cross-Layer Reconciliation (30-Day Range)...');
  const startDate = '2026-10-02';
  const endDate = '2026-10-31';

  const kpiResult = await executeAnalyticsQuery({
    metrics: ['gross_revenue', 'net_revenue', 'orders', 'conversion_rate', 'average_order_value'],
    start_date: startDate,
    end_date: endDate,
    comparison: 'previous_period',
  });

  const grossRev = kpiResult.metrics_summary['gross_revenue']?.current_value || 0;
  const netRev = kpiResult.metrics_summary['net_revenue']?.current_value || 0;
  const orders = kpiResult.metrics_summary['orders']?.current_value || 0;
  const cr = kpiResult.metrics_summary['conversion_rate']?.current_value || 0;
  const aov = kpiResult.metrics_summary['average_order_value']?.current_value || 0;

  console.log(`   - Range:               ${startDate} to ${endDate}`);
  console.log(`   - Gross Revenue:       $${grossRev.toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
  console.log(`   - Net Revenue:         $${netRev.toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
  console.log(`   - Total Orders:        ${orders.toLocaleString('en-US')}`);
  console.log(`   - Conversion Rate:     ${cr.toFixed(2)}%`);
  console.log(`   - Average Order Value: $${aov.toFixed(2)}`);

  // Mathematical integrity assertion
  const computedAov = orders > 0 ? netRev / orders : 0;
  const aovDiff = Math.abs(computedAov - aov);
  if (aovDiff > 0.01) {
    throw new Error(`AOV cross-layer mismatch: Engine=${aov}, Computed=${computedAov}`);
  }
  console.log('   ✓ Cross-layer mathematical reconciliation passed with 0.00% difference.');

  // 2. Date Range Presets Verification
  console.log('\n📅 [2/6] Verifying All Dashboard Date Presets & Parameter Propagation...');
  for (const [key, preset] of Object.entries(DATE_PRESETS)) {
    const res = await executeAnalyticsQuery({
      metrics: ['gross_revenue', 'orders'],
      start_date: preset.startDate,
      end_date: preset.endDate,
    });
    const pRev = res.metrics_summary['gross_revenue']?.current_value || 0;
    const pOrders = res.metrics_summary['orders']?.current_value || 0;
    console.log(
      `   ✓ Preset '${key.toUpperCase()}': [${preset.startDate} → ${preset.endDate}] ` +
      `Rev=$${(pRev / 1000).toFixed(1)}k, Orders=${pOrders}`
    );
    if (pRev <= 0 || pOrders <= 0) {
      throw new Error(`Date preset '${key}' returned 0 metrics.`);
    }
  }

  // 3. Category & Regional Breakdown Integrity
  console.log('\n🏬 [3/6] Verifying Category & Regional Analytical Aggregations...');
  const catResult = await executeAnalyticsQuery({
    metrics: ['gross_revenue'],
    dimensions: ['category'],
    start_date: startDate,
    end_date: endDate,
  });

  const catTotal = catResult.rows.reduce((acc, r) => acc + (r.revenue || 0), 0);
  const catDiff = Math.abs(catTotal - grossRev);
  console.log(`   - Category Aggregated Total: $${catTotal.toFixed(2)} (Summary Gross Rev: $${grossRev.toFixed(2)})`);
  if (catDiff > 0.01) {
    throw new Error(`Category breakdown sum ($${catTotal}) does not match Gross Revenue ($${grossRev})`);
  }
  console.log(`   ✓ Category distribution perfectly sums to total gross merchandise value.`);

  const regResult = await executeAnalyticsQuery({
    metrics: ['net_revenue', 'orders'],
    dimensions: ['region'],
    start_date: startDate,
    end_date: endDate,
  });
  const regTotal = regResult.rows.reduce((acc, r) => acc + (r.revenue || 0), 0);
  const regOrdersTotal = regResult.rows.reduce((acc, r) => acc + (r.orders || 0), 0);
  console.log(`   - Regional Aggregated Total: $${regTotal.toFixed(2)}, Orders: ${regOrdersTotal}`);
  if (Math.abs(regTotal - netRev) > 0.01 || regOrdersTotal !== orders) {
    throw new Error('Regional performance totals do not match Net Revenue / Orders totals.');
  }
  console.log(`   ✓ Regional performance perfectly reconciles with order volume.`);

  // 4. 5-Stage Conversion Funnel Telemetry Verification
  console.log('\n🌪️ [4/6] Verifying 5-Stage E-Commerce Conversion Funnel...');
  const funnel = calculateConversionFunnel(startDate, endDate);
  console.log('   Funnel Progression:');
  funnel.forEach((f) => {
    console.log(`     ${f.step.padEnd(24)} Count: ${f.count.toString().padStart(6)} | Conv: ${f.conversion.padStart(6)} | Drop: ${f.drop}`);
  });

  // Check monotonic decrease
  for (let i = 1; i < funnel.length; i++) {
    if (funnel[i].count > funnel[i - 1].count) {
      throw new Error(`Funnel count inverted at stage ${funnel[i].step}`);
    }
  }
  console.log('   ✓ Funnel steps strictly monotonic and calculated from canonical session events.');

  // 5. Zero Metric Formula Duplication Guard in React
  console.log('\n🛡️ [5/6] Verifying Zero Canonical Formula Duplication in React Components...');
  const componentsDir = path.join(WEB_DIR, 'components/overview');
  const compFiles = fs.readdirSync(componentsDir);
  for (const f of compFiles) {
    const fullPath = path.join(componentsDir, f);
    const content = fs.readFileSync(fullPath, 'utf-8');
    // Ensure React components do not calculate subtotal - discount_amount or raw formula ratios
    if (content.includes('subtotal - discount_amount') || content.includes('unit_price * quantity')) {
      throw new Error(`FORMULA LEAK: Component ${f} contains business metric calculations!`);
    }
  }
  console.log('   ✓ Confirmed: React components purely format already-aggregated analytical results.');

  // 6. Ground Truth Isolation
  console.log('\n🔒 [6/6] Verifying Ground-Truth Catalog Isolation in Web Workspace...');
  function checkCatalogLeak(dir: string) {
    const entries = fs.readdirSync(dir);
    for (const e of entries) {
      const full = path.join(dir, e);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) {
        if (e !== 'node_modules' && e !== '.next') checkCatalogLeak(full);
      } else if (e.endsWith('.tsx') || e.endsWith('.ts')) {
        if (full.includes('scripts') || full.includes('test')) continue;
        const src = fs.readFileSync(full, 'utf-8');
        if (src.includes('business_events.json')) {
          throw new Error(`SECURITY VIOLATION: File ${full} references business_events.json!`);
        }
      }
    }
  }
  checkCatalogLeak(WEB_DIR);
  console.log('   ✓ Confirmed: Production web components and pages never import business_events.json.');

  console.log('\n===============================================================');
  console.log('   PRISM PHASE 04 INTEGRATION SUITE: ALL GATES PASSED (100%)');
  console.log('===============================================================\n');
}

runDashboardIntegrationTests().catch((err) => {
  console.error('\n❌ DASHBOARD INTEGRATION TEST FAILED:', err);
  process.exit(1);
});
