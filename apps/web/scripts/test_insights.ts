/**
 * PRISM Proactive Insights & Anomaly Detection Verification Suite
 * Phase 09 Quality Gate
 * Evaluates statistically discovered insights against hidden ground-truth events,
 * and proves strict runtime isolation (zero runtime references to business_events.json).
 */

import * as fs from 'fs';
import * as path from 'path';
import { detectBusinessInsights } from '../lib/api/insights_service';

async function runInsightsSuite() {
  console.log('===============================================================');
  console.log('   PRISM PHASE 09 — PROACTIVE INSIGHTS & ANOMALIES TEST SUITE   ');
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

  // 1. Run Statistical Detection Engine
  console.log('\n🔍 [1/5] Executing Autonomous Statistical Anomaly Detection...');
  const response = await detectBusinessInsights();
  assert(response.total_detected > 0, `Detected ${response.total_detected} statistical business insights`);
  assert(response.critical_count > 0, `Identified ${response.critical_count} critical anomalies`);

  // 2. Ground-Truth Evaluation: Mobile iOS Conversion Drop
  console.log('\n📱 [2/5] Evaluating Detection of Intentional Mobile iOS Conversion Decline...');
  const iosAnomaly = response.insights.find(
    (i) => i.dimension === 'device_type' && i.segment === 'Mobile iOS' && i.type === 'Conversion Drop'
  );
  assert(Boolean(iosAnomaly), 'Found statistically detected Mobile iOS conversion drop');
  if (iosAnomaly) {
    assert(iosAnomaly.severity === 'critical', `Severity is '${iosAnomaly.severity}' (expected 'critical')`);
    assert(iosAnomaly.change < -20, `Observed change is ${iosAnomaly.change}% (statistically severe decline)`);
    assert(iosAnomaly.confidence >= 0.9, `Confidence score is ${(iosAnomaly.confidence * 100).toFixed(0)}%`);
    assert(Boolean(iosAnomaly.evidence && iosAnomaly.evidence.length > 20), 'Evidence contains detailed factual observation');
    assert(Boolean(iosAnomaly.hypothesis && !iosAnomaly.evidence.includes('checkout deployment caused')), 'Observation is strictly separated from hypothesis');
  }

  // 3. Ground-Truth Evaluation: Electronics Revenue Surge
  console.log('\n⚡ [3/5] Evaluating Detection of Category Outperformance (Electronics Surge)...');
  const elecSurge = response.insights.find(
    (i) => i.dimension === 'category' && i.segment === 'Electronics'
  );
  assert(Boolean(elecSurge), 'Found statistically detected Electronics category revenue surge');
  if (elecSurge) {
    assert(elecSurge.type === 'Category Outperformance', `Type is '${elecSurge.type}'`);
    assert(elecSurge.severity === 'opportunity', `Severity is '${elecSurge.severity}'`);
    assert(elecSurge.change > 20, `Revenue growth is +${elecSurge.change}% over baseline`);
  }

  // 4. Insight Priority Ranking Verification
  console.log('\n🥇 [4/5] Verifying Multi-Factor Priority Ranking & Ordering...');
  const severities = response.insights.map((i) => i.severity);
  const criticalIndex = severities.indexOf('critical');
  const opportunityIndex = severities.indexOf('opportunity');
  assert(criticalIndex === 0, 'Top ranked insight is Critical severity (highest business impact)');
  assert(opportunityIndex >= 0, 'Opportunities present in priority feed');

  // 5. Strict Ground-Truth Isolation Verification (Runtime Source Audit)
  console.log('\n🔒 [5/5] Auditing Runtime Source Code for Zero Ground-Truth References...');
  const forbiddenString = 'business_events.json';
  const runtimeDirs = [
    path.resolve(process.cwd(), 'apps/web/lib'),
    path.resolve(process.cwd(), 'apps/web/app'),
    path.resolve(process.cwd(), 'apps/web/components'),
    path.resolve(process.cwd(), 'apps/api/src/analytics'),
    path.resolve(process.cwd(), 'apps/api/src/providers'),
    path.resolve(process.cwd(), 'apps/api/src/security'),
    path.resolve(process.cwd(), 'apps/api/src/contracts'),
  ];

  let leakedFiles: string[] = [];

  function scanDir(dir: string) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        scanDir(fullPath);
      } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx') || entry.name.endsWith('.py'))) {
        const content = fs.readFileSync(fullPath, 'utf8');
        if (content.includes(forbiddenString)) {
          leakedFiles.push(fullPath);
        }
      }
    }
  }

  runtimeDirs.forEach(scanDir);
  assert(leakedFiles.length === 0, `Zero references to '${forbiddenString}' across all runtime code`);
  if (leakedFiles.length > 0) {
    console.error('Leaked files:', leakedFiles);
  }

  console.log('\n===============================================================');
  console.log(`   PRISM PHASE 09 TEST RESULTS: ${passed} PASSED, ${failed} FAILED   `);
  console.log('===============================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runInsightsSuite().catch((err) => {
  console.error('Insights test suite failed:', err);
  process.exit(1);
});
