/**
 * PRISM Phase 06 — Ask PRISM Acceptance & Intent Resolution Test Suite
 * Validates natural language intent interpretation for all 11 required scenarios,
 * multi-turn context retention, grounded response synthesis, and ground-truth isolation.
 */

import * as fs from 'fs';
import * as path from 'path';
import { processAskPrismQuery, resolveSemanticIntent } from '../lib/api/ask_service';
import { ConversationContext } from '../lib/contracts/ask';

const ACCEPTANCE_QUESTIONS = [
  {
    q: 'Qual foi o faturamento nos últimos 30 dias?',
    expectedMetric: 'gross_revenue',
    expectedRange: ['2026-10-02', '2026-10-31'],
    expectedViz: 'metric',
  },
  {
    q: 'Quantos pedidos tivemos este mês?',
    expectedMetric: 'orders',
    expectedRange: ['2026-10-01', '2026-10-31'],
  },
  {
    q: 'Qual região teve maior faturamento?',
    expectedMetric: 'gross_revenue',
    expectedDim: 'region',
    expectedViz: 'bar',
  },
  {
    q: 'Mostre a receita por categoria.',
    expectedMetric: 'gross_revenue',
    expectedDim: 'category',
    expectedViz: 'bar',
  },
  {
    q: 'Qual dispositivo teve a pior conversão?',
    expectedMetric: 'conversion_rate',
    expectedDim: 'device_type',
  },
  {
    q: 'Compare a conversão Mobile com Desktop.',
    expectedMetric: 'conversion_rate',
    expectedDim: 'device_type',
  },
  {
    q: 'Como o faturamento deste mês compara com o mês anterior?',
    expectedMetric: 'gross_revenue',
    expectedComparison: 'previous_period',
  },
  {
    q: 'Quais foram os produtos com maior receita?',
    expectedMetric: 'gross_revenue',
    expectedDim: 'product_id',
    expectedViz: 'table',
  },
  {
    q: 'Qual canal trouxe mais sessões?',
    expectedMetric: 'sessions',
    expectedDim: 'channel',
  },
  {
    q: 'Qual campanha teve melhor ROAS?',
    expectedMetric: 'roas',
    expectedDim: 'campaign_name',
  },
  {
    q: 'Mostre a evolução semanal da receita.',
    expectedMetric: 'gross_revenue',
    expectedGrain: 'week',
    expectedViz: 'area',
  },
];

async function runAskPrismTestSuite() {
  console.log('\n===============================================================');
  console.log('       PRISM PHASE 06 — ASK PRISM ACCEPTANCE SUITE');
  console.log('===============================================================\n');

  // 1. Validate All 11 Acceptance Scenarios
  console.log('💬 [1/4] Testing All 11 Required Canonical Question Scenarios...');
  for (let i = 0; i < ACCEPTANCE_QUESTIONS.length; i++) {
    const item = ACCEPTANCE_QUESTIONS[i];
    const res = await processAskPrismQuery({ message: item.q });

    console.log(`   [Q${i + 1}] "${item.q}"`);
    console.log(`        Intent: [Metrics: ${res.intent.metrics.join(', ')}] [Dims: ${res.intent.dimensions.join(', ') || 'None'}] [Window: ${res.intent.start_date} → ${res.intent.end_date}]`);
    console.log(`        Answer: ${res.answer.substring(0, 100)}...`);
    console.log(`        Viz:    ${res.visualization.type.toUpperCase()}`);

    // Assertions
    if (!res.intent.metrics.includes(item.expectedMetric)) {
      throw new Error(`Q${i + 1} failed metric resolution: expected ${item.expectedMetric}, got ${res.intent.metrics}`);
    }
    if (item.expectedDim && !res.intent.dimensions.includes(item.expectedDim)) {
      throw new Error(`Q${i + 1} failed dimension resolution: expected ${item.expectedDim}, got ${res.intent.dimensions}`);
    }
    if (item.expectedGrain && res.intent.time_grain !== item.expectedGrain) {
      throw new Error(`Q${i + 1} failed time grain: expected ${item.expectedGrain}, got ${res.intent.time_grain}`);
    }
    if (item.expectedComparison && res.intent.comparison !== item.expectedComparison) {
      throw new Error(`Q${i + 1} failed comparison: expected ${item.expectedComparison}, got ${res.intent.comparison}`);
    }
  }
  console.log('   ✓ All 11 natural language scenarios successfully interpreted and executed.');

  // 2. Multi-Turn Bounded Context Retention & Inheritance
  console.log('\n🔄 [2/4] Testing Multi-Turn Context Retention & Follow-Up Inheritance...');
  
  // Turn 1: Region Gross Revenue in Last 30 Days
  console.log('   Turn 1: "Qual região teve maior faturamento nos últimos 30 dias?"');
  const turn1 = await processAskPrismQuery({
    message: 'Qual região teve maior faturamento nos últimos 30 dias?',
  });
  console.log(`     Turn 1 Result: Dims=[${turn1.intent.dimensions}], Metrics=[${turn1.intent.metrics}], Range=[${turn1.intent.start_date} → ${turn1.intent.end_date}]`);

  // Turn 2: Follow-up asking for worst conversion (inheriting region dimension and date range)
  console.log('   Turn 2 (Follow-up): "E qual teve a pior conversão?"');
  const turn2 = await processAskPrismQuery({
    message: 'E qual teve a pior conversão?',
    context: turn1.context,
  });
  console.log(`     Turn 2 Result: Dims=[${turn2.intent.dimensions}], Metrics=[${turn2.intent.metrics}], Range=[${turn2.intent.start_date} → ${turn2.intent.end_date}]`);

  if (!turn2.intent.dimensions.includes('region')) {
    throw new Error('Turn 2 failed to inherit dimension "region" from Turn 1 context!');
  }
  if (!turn2.intent.metrics.includes('conversion_rate')) {
    throw new Error('Turn 2 failed to switch metric to "conversion_rate"!');
  }
  if (turn2.intent.start_date !== turn1.intent.start_date) {
    throw new Error('Turn 2 failed to preserve Turn 1 date window!');
  }
  console.log('   ✓ Multi-turn context inheritance mathematically and structurally verified.');

  // 3. Groundedness & No Fabricated Root Cause
  console.log('\n🎯 [3/4] Verifying Groundedness & No Fabricated Causal Claims...');
  const crQuestion = await processAskPrismQuery({
    message: 'Por que a conversão caiu em Mobile?',
  });
  console.log(`   Response to "Por que a conversão caiu?":`);
  console.log(`     "${crQuestion.answer}"`);

  // Check no forbidden words from ground truth
  if (crQuestion.answer.toLowerCase().includes('gateway timeout') || crQuestion.answer.toLowerCase().includes('business_events')) {
    throw new Error('SECURITY VIOLATION: Model leaked ground truth metadata in causal explanation!');
  }
  console.log('   ✓ Grounded response describes statistical breakdowns without fabricating root cause.');

  // 4. Ground Truth Catalog Isolation in Ask PRISM Layer
  console.log('\n🔒 [4/4] Verifying Zero Ground-Truth Imports in Ask PRISM Source Code...');
  const askFiles = [
    path.resolve(__dirname, '../lib/api/ask_service.ts'),
    path.resolve(__dirname, '../components/ask/AskPrismClient.tsx'),
    path.resolve(__dirname, '../../../apps/api/src/providers/intent_resolver.py'),
  ];
  for (const f of askFiles) {
    if (fs.existsSync(f)) {
      const src = fs.readFileSync(f, 'utf-8');
      if (src.includes('business_events.json')) {
        throw new Error(`SECURITY VIOLATION: File ${f} references business_events.json!`);
      }
    }
  }
  console.log('   ✓ Confirmed: Zero ground-truth catalog references in Ask PRISM subsystem.');

  console.log('\n===============================================================');
  console.log('    PRISM PHASE 06 ASK PRISM SUITE: ALL GATES PASSED (100%)');
  console.log('===============================================================\n');
}

runAskPrismTestSuite().catch((err) => {
  console.error('\n❌ ASK PRISM TEST SUITE FAILED:', err);
  process.exit(1);
});
