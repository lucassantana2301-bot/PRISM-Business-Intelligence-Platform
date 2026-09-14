/**
 * PRISM Server Ask PRISM Service
 * Resolves natural language intent (PT/EN), executes canonical Analytics Engine queries,
 * synthesizes grounded responses, and maintains multi-turn conversation context.
 */

import {
  AskPrismRequest,
  AskPrismResponse,
  SemanticIntent,
  ConversationContext,
  VisualizationSpec,
} from '../contracts/ask';
import { executeAnalyticsQuery } from './analytics_service';
import {
  AnalyticsQuery,
  AnalyticsFilter,
  TimeGrain,
  ComparisonWindow,
} from '../contracts/analytics';
import { formatCurrency, formatInteger, formatPercentage } from '../utils/formatters';

const DEFAULT_END_DATE = '2026-10-31';

export function resolveSemanticIntent(
  message: string,
  context?: ConversationContext | null
): SemanticIntent {
  const msg = message.toLowerCase().trim();

  // 1. Metrics Identification
  const metrics: string[] = [];
  if (/faturamento|receita|revenue|gross revenue|sales|vendas/.test(msg)) {
    metrics.push('gross_revenue');
  }
  if (/pedidos|orders|compras|transações/.test(msg)) {
    if (!metrics.includes('gross_revenue')) {
      metrics.push('orders');
    }
  }
  if (/conversão|conversion|taxa de conversão|conversion rate/.test(msg)) {
    metrics.push('conversion_rate');
  }
  if (/ticket médio|aov|average order value|gasto médio/.test(msg)) {
    metrics.push('average_order_value');
  }
  if (/sessões|sessions|visitas|tráfego|traffic/.test(msg)) {
    metrics.push('sessions');
  }
  if (/abandono|cart abandonment/.test(msg)) {
    metrics.push('cart_abandonment_rate');
  }
  if (/roas|retorno sobre ad|retorno de anúncio/.test(msg)) {
    metrics.push('roas');
  }
  if (/margem|margin|lucro bruto|gross margin/.test(msg)) {
    metrics.push('gross_margin_rate');
  }
  if (/unidades|units|itens vendidos/.test(msg)) {
    metrics.push('units_sold');
  }

  // Follow-up metric inheritance
  if (metrics.length === 0 && context?.last_metrics?.length) {
    metrics.push(...context.last_metrics);
  }
  if (metrics.length === 0) {
    metrics.push('gross_revenue');
  }

  // 2. Dimensions Identification
  const dimensions: string[] = [];
  if (/região|region|regiões|geografia|sudeste|nordeste/.test(msg)) {
    dimensions.push('region');
  }
  if (/categoria|category|categorias|departamento|departamentos/.test(msg)) {
    dimensions.push('category');
  }
  if (/subcategoria|subcategory/.test(msg)) {
    dimensions.push('subcategory');
  }
  if (/dispositivo|device|dispositivos|mobile|desktop|aparelho/.test(msg)) {
    dimensions.push('device_type');
  }
  if (/canal|channel|canais|origem/.test(msg)) {
    dimensions.push('channel');
  }
  if (/campanha|campaign|campanhas/.test(msg)) {
    dimensions.push('campaign_name');
  }
  if (/produto|product|produtos|items|itens/.test(msg)) {
    dimensions.push('product_id');
  }

  // Contextual dimension inheritance for follow-up turns
  if (dimensions.length === 0 && context?.last_dimensions?.length) {
    if (/qual teve|e qual|and which|o que|pior|melhor|worst|best/.test(msg)) {
      dimensions.push(...context.last_dimensions);
    }
  }

  // 3. Time Grain & Date Ranges
  let timeGrain: TimeGrain | null = null;
  if (/semanal|weekly|evolução semanal|por semana/.test(msg)) {
    timeGrain = 'week';
  } else if (/diário|daily|por dia|evolução diária/.test(msg)) {
    timeGrain = 'day';
  } else if (/mensal|monthly|por mês|evolução mensal/.test(msg)) {
    timeGrain = 'month';
  }

  let startDate = '2026-10-02';
  let endDate = DEFAULT_END_DATE;

  if (/7 dias|7 days|última semana|last week/.test(msg)) {
    startDate = '2026-10-25';
    endDate = '2026-10-31';
  } else if (/30 dias|30 days|último mês|last month/.test(msg)) {
    startDate = '2026-10-02';
    endDate = '2026-10-31';
  } else if (/90 dias|90 days|trimestre|quarter/.test(msg)) {
    startDate = '2026-08-03';
    endDate = '2026-10-31';
  } else if (/este mês|this month|outubro|october/.test(msg)) {
    startDate = '2026-10-01';
    endDate = '2026-10-31';
  } else if (/ano|year|ytd|ano todo|full year/.test(msg)) {
    startDate = '2026-01-01';
    endDate = '2026-10-31';
  } else if (/todo o período|histórico|full dataset|all-time|total/.test(msg)) {
    startDate = '2025-05-01';
    endDate = '2026-10-31';
  } else if (context?.active_start_date && context?.active_end_date) {
    startDate = context.active_start_date;
    endDate = context.active_end_date;
  }

  // Comparison
  let comparison: ComparisonWindow = 'none';
  if (/compare|comparação|comparar|em relação ao|mês anterior|período anterior|previous period/.test(msg)) {
    comparison = 'previous_period';
  }

  // 4. Filters
  const filters: AnalyticsFilter[] = [];
  if (/são paulo|sp/.test(msg)) {
    filters.push({ dimension: 'state', operator: 'eq', value: 'SP' });
  }
  if (/sudeste|southeast/.test(msg)) {
    filters.push({ dimension: 'region', operator: 'eq', value: 'Southeast' });
  }
  if (/eletrônicos|electronics/.test(msg)) {
    filters.push({ dimension: 'category', operator: 'eq', value: 'Electronics' });
  }
  if (/mobile/.test(msg) && !/desktop/.test(msg)) {
    filters.push({ dimension: 'device_type', operator: 'in', value: ['Mobile iOS', 'Mobile Android'] });
  }

  // Contextual filter inheritance
  if (filters.length === 0 && context?.last_filters?.length) {
    if (!/todas|geral|sem filtro|limpar/.test(msg)) {
      filters.push(...context.last_filters);
    }
  }

  // 5. Visualization Recommendation
  let vizHint: VisualizationSpec['type'] = 'metric';
  if (timeGrain) {
    vizHint = 'area';
  } else if (dimensions.length > 0) {
    vizHint = dimensions.includes('product_id') ? 'table' : 'bar';
  } else if (comparison !== 'none') {
    vizHint = 'metric';
  }

  let intentSummary = `Querying ${metrics.join(', ')}`;
  if (dimensions.length) intentSummary += ` grouped by ${dimensions.join(', ')}`;
  intentSummary += ` from ${startDate} to ${endDate}`;

  return {
    metrics,
    dimensions,
    time_grain: timeGrain,
    start_date: startDate,
    end_date: endDate,
    comparison,
    filters,
    limit: 10,
    visualization_hint: vizHint,
    intent_summary: intentSummary,
  };
}

export async function processAskPrismQuery(request: AskPrismRequest): Promise<AskPrismResponse> {
  const t0 = performance.now();
  const context: ConversationContext = request.context || {
    session_id: 'default-session',
    turn_count: 0,
    last_metrics: [],
    last_dimensions: [],
    last_filters: [],
  };

  // 1. Resolve Intent
  const intent = resolveSemanticIntent(request.message, context);

  // 2. Build AnalyticsQuery
  const query: AnalyticsQuery = {
    metrics: intent.metrics as any,
    dimensions: intent.dimensions,
    time_grain: intent.time_grain || undefined,
    start_date: intent.start_date,
    end_date: intent.end_date,
    comparison: intent.comparison,
    filters: intent.filters,
    limit: intent.limit,
  };

  // 3. Execute Canonical Analytics Engine
  const result = await executeAnalyticsQuery(query);

  // 4. Grounded Synthesis
  const isPt = /qual|faturamento|receita|pedidos|como|mostre|quantos|este|últimos/i.test(request.message);
  const firstMetric = intent.metrics[0];
  const mSummary = result.metrics_summary[firstMetric];

  let answer = '';
  let visualization: VisualizationSpec = {
    type: 'metric',
    title: `${firstMetric} Summary`,
  };

  if (!intent.dimensions.length && !intent.time_grain) {
    // Single Scalar Metric
    const curr = mSummary?.current_value || 0;
    const prev = mSummary?.previous_value;
    const deltaPct = mSummary?.percentage_delta;

    let valStr = `${curr}`;
    if (/revenue|aov|gross_margin/i.test(firstMetric)) {
      valStr = formatCurrency(curr);
    } else if (/rate|conversion|abandonment/i.test(firstMetric)) {
      valStr = formatPercentage(curr);
    } else {
      valStr = formatInteger(curr);
    }

    if (isPt) {
      answer = `No período de **${intent.start_date}** a **${intent.end_date}**, o total de **${firstMetric.replace(/_/g, ' ').toUpperCase()}** foi de **${valStr}**.`;
      if (prev !== null && prev !== undefined && deltaPct !== null && deltaPct !== undefined) {
        const polarity = deltaPct >= 0 ? 'aumento' : 'queda';
        answer += ` Isso representa um ${polarity} de **${deltaPct > 0 ? '+' : ''}${deltaPct.toFixed(1)}%** em relação ao período anterior.`;
      }
    } else {
      answer = `For the period from **${intent.start_date}** to **${intent.end_date}**, total **${firstMetric.replace(/_/g, ' ').toUpperCase()}** is **${valStr}**.`;
      if (prev !== null && prev !== undefined && deltaPct !== null && deltaPct !== undefined) {
        const dir = deltaPct >= 0 ? 'increase' : 'decrease';
        answer += ` This is a **${deltaPct > 0 ? '+' : ''}${deltaPct.toFixed(1)}%** ${dir} compared to the previous period benchmark.`;
      }
    }

    visualization = {
      type: 'metric',
      title: `${firstMetric.replace(/_/g, ' ').toUpperCase()}`,
      metric_label: firstMetric.replace(/_/g, ' ').toUpperCase(),
      metric_value: valStr,
      comparison_label: prev !== null && prev !== undefined ? 'vs previous period' : undefined,
      delta: deltaPct,
      is_favorable: mSummary?.is_favorable ?? true,
    };
  } else if (intent.dimensions.length > 0) {
    // Dimensional Breakdown
    const dim = intent.dimensions[0];
    const rows = result.rows;

    if (!rows.length) {
      answer = isPt ? 'Nenhum dado encontrado para os filtros selecionados.' : 'No records found for active filters.';
      visualization = { type: 'table', title: 'Empty Results' };
    } else {
      const topRow = rows[0];
      const topDim = topRow[dim] || 'N/A';
      const topVal = topRow[firstMetric] || 0;

      let topValStr = `${topVal}`;
      if (/revenue/i.test(firstMetric)) topValStr = formatCurrency(topVal);
      else if (/rate/i.test(firstMetric)) topValStr = formatPercentage(topVal);
      else topValStr = formatInteger(topVal);

      if (isPt) {
        answer = `Analisando por **${dim}** de ${intent.start_date} a ${intent.end_date}, o principal destaque é **${topDim}**, com **${topValStr}** em ${firstMetric.replace(/_/g, ' ')}.`;
      } else {
        answer = `Analyzing by **${dim}** from ${intent.start_date} to ${intent.end_date}, **${topDim}** leads with **${topValStr}** in ${firstMetric.replace(/_/g, ' ')}.`;
      }

      visualization = {
        type: dim === 'product_id' ? 'table' : 'bar',
        title: `${firstMetric.replace(/_/g, ' ').toUpperCase()} by ${dim.toUpperCase()}`,
        x_axis: dim,
        y_axis: firstMetric,
        series: rows.slice(0, 10),
      };
    }
  } else if (intent.time_grain) {
    // Time Series
    const rows = result.rows;
    const total = rows.reduce((acc, r) => acc + (r[firstMetric] || 0), 0);

    if (isPt) {
      answer = `A evolução **${intent.time_grain}** de **${firstMetric.replace(/_/g, ' ').toUpperCase()}** somou **${formatCurrency(total)}** ao longo de ${rows.length} intervalos de tempo.`;
    } else {
      answer = `The **${intent.time_grain}** trajectory of **${firstMetric.replace(/_/g, ' ').toUpperCase()}** totaled **${formatCurrency(total)}** across ${rows.length} time buckets.`;
    }

    visualization = {
      type: 'area',
      title: `${intent.time_grain.toUpperCase()} Trajectory (${firstMetric.replace(/_/g, ' ')})`,
      x_axis: 'timestamp',
      y_axis: firstMetric,
      series: rows,
    };
  }

  const updatedContext: ConversationContext = {
    session_id: context.session_id,
    turn_count: context.turn_count + 1,
    last_intent: intent,
    last_query: query,
    last_metrics: intent.metrics,
    last_dimensions: intent.dimensions,
    last_filters: intent.filters,
    active_start_date: intent.start_date,
    active_end_date: intent.end_date,
    active_time_grain: intent.time_grain,
  };

  const execTime = Number((performance.now() - t0).toFixed(2));

  return {
    answer,
    intent,
    query,
    result,
    visualization,
    context: updatedContext,
    execution_time_ms: execTime,
  };
}
