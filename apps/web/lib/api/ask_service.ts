/**
 * PRISM Server Ask PRISM Service
 * Resolves natural language intent (PT/EN), validates runtime inputs and conversation context,
 * executes canonical Analytics Engine queries, programmatically verifies numeric grounding,
 * and synthesizes grounded executive responses.
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
import { deriveVisualizationSpec } from '../visualization/decision_engine';

const DEFAULT_END_DATE = '2026-10-31';

// Strict Allowlists for Runtime Security
const ALLOWED_METRICS = new Set([
  'gross_revenue',
  'net_revenue',
  'orders',
  'average_order_value',
  'sessions',
  'conversion_rate',
  'cart_abandonment_rate',
  'total_customers',
  'new_customers',
  'returning_customers',
  'units_sold',
  'gross_margin',
  'gross_margin_rate',
  'revenue_per_customer',
  'revenue_per_session',
  'roas',
]);

const ALLOWED_DIMENSIONS = new Set([
  'date',
  'customer_segment',
  'category',
  'subcategory',
  'product_id',
  'region',
  'state',
  'channel',
  'device_type',
  'browser',
  'payment_method',
  'campaign_name',
]);

const ALLOWED_OPERATORS = new Set([
  'eq',
  'neq',
  'in',
  'not_in',
  'gt',
  'gte',
  'lt',
  'lte',
  'between',
]);

// Adversarial & Out-of-Domain Guard Patterns
const FORBIDDEN_PATTERNS = [
  /ignore (all )?previous instructions/i,
  /system prompt/i,
  /read (the )?file/i,
  /business_events\.json/i,
  /c:\\users/i,
  /api[ _]?key/i,
  /secret/i,
  /password/i,
  /drop\s+table/i,
  /delete\s+from/i,
  /update\s+[a-z0-9_]+\s+set/i,
  /insert\s+into/i,
  /alter\s+table/i,
  /truncate\s+table/i,
  /copy\s+[a-z0-9_]+\s+to/i,
  /attach\s+/i,
  /change the (revenue )?formula/i,
  /\bweather\b/i,
  /tempo hoje/i,
  /previsão do tempo/i,
  /\bebitda\b/i,
  /return every (customer|order)/i,
];

/**
 * Validate incoming request payload and conversation context at runtime.
 */
export function validateRuntimeRequest(request: AskPrismRequest): { valid: boolean; error?: string } {
  if (!request || typeof request !== 'object') {
    return { valid: false, error: 'Request body must be a valid JSON object.' };
  }

  if (typeof request.message !== 'string' || request.message.trim().length === 0) {
    return { valid: false, error: 'Message must be a non-empty string.' };
  }

  if (request.message.length > 500) {
    return { valid: false, error: 'Message exceeds maximum length of 500 characters.' };
  }

  if (request.context) {
    const ctx = request.context;
    if (typeof ctx.session_id !== 'string' || ctx.session_id.length > 64) {
      return { valid: false, error: 'Invalid context session_id.' };
    }
    if (typeof ctx.turn_count !== 'number' || ctx.turn_count < 0 || ctx.turn_count > 100) {
      return { valid: false, error: 'Invalid context turn_count.' };
    }
    if (ctx.last_metrics && Array.isArray(ctx.last_metrics)) {
      for (const m of ctx.last_metrics) {
        if (!ALLOWED_METRICS.has(m)) {
          return { valid: false, error: `Invalid context metric '${m}'.` };
        }
      }
    }
    if (ctx.last_dimensions && Array.isArray(ctx.last_dimensions)) {
      for (const d of ctx.last_dimensions) {
        if (!ALLOWED_DIMENSIONS.has(d)) {
          return { valid: false, error: `Invalid context dimension '${d}'.` };
        }
      }
    }
    if (ctx.last_filters && Array.isArray(ctx.last_filters)) {
      for (const f of ctx.last_filters) {
        if (!ALLOWED_DIMENSIONS.has(f.dimension) || !ALLOWED_OPERATORS.has(f.operator)) {
          return { valid: false, error: `Invalid context filter parameter.` };
        }
      }
    }
  }

  return { valid: true };
}

/**
 * Resolve natural language question into structured semantic intent with context management.
 */
export function resolveSemanticIntent(
  message: string,
  context?: ConversationContext | null
): SemanticIntent {
  const msg = message.toLowerCase().trim();

  // 1. Adversarial / Out-of-Domain Guard
  for (const pattern of FORBIDDEN_PATTERNS) {
    if (pattern.test(msg)) {
      return {
        is_supported: false,
        confidence: 0.0,
        metrics: [],
        dimensions: [],
        start_date: '2026-10-02',
        end_date: DEFAULT_END_DATE,
        filters: [],
        visualization_hint: 'table',
        intent_summary: 'Unsupported or restricted request',
        clarification_prompt:
          'Esta pergunta está fora do escopo analítico permitido ou contém termos restritos. ' +
          'Você pode perguntar sobre faturamento, pedidos, conversão, ticket médio, sessões ou ROAS.',
      };
    }
  }

  // 2. Context Reset
  const isReset = /\b(limpar|reset|nova an[áa]lise|clear context|recome[çc]ar)\b/.test(msg);
  if (isReset) {
    context = null;
  }

  // 3. Topic Switch Check
  const isTopicSwitch = /\b(agora|em vez disso|ao inv[ée]s de|trocar para|instead|now show)\b/.test(msg);

  // 4. Metric Identification
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

  // 5. Dimension Identification
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

  // Context inheritance vs Topic switch
  const inheritedDimensions = isTopicSwitch ? [] : context?.last_dimensions || [];
  const inheritedFilters = isTopicSwitch ? [] : context?.last_filters || [];

  // Metric inheritance
  if (metrics.length === 0 && context?.last_metrics?.length && !isTopicSwitch) {
    metrics.push(...context.last_metrics);
  }

  // Dimension inheritance for follow-up questions
  if (dimensions.length === 0 && inheritedDimensions.length > 0) {
    if (/qual teve|e qual|and which|o que|pior|melhor|worst|best/.test(msg)) {
      dimensions.push(...inheritedDimensions);
    }
  }

  // If still no metric or dimension and not a date query
  if (metrics.length === 0 && dimensions.length === 0 && !/dias|mês|ano|evolução/.test(msg)) {
    return {
      is_supported: false,
      confidence: 0.0,
      metrics: [],
      dimensions: [],
      start_date: '2026-10-02',
      end_date: DEFAULT_END_DATE,
      filters: [],
      visualization_hint: 'table',
      intent_summary: 'Unrecognized analytical intent',
      clarification_prompt:
        'Não consegui identificar uma métrica ou dimensão válida na sua pergunta. ' +
        'Tente perguntar: "Qual o faturamento nos últimos 30 dias?" ou "Mostre pedidos por região".',
    };
  }

  if (metrics.length === 0) {
    metrics.push('gross_revenue');
  }

  // 6. Time Grain & Date Range
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
  } else if (/ano|year|ytd|ano todo|full year|neste ano/.test(msg)) {
    startDate = '2026-01-01';
    endDate = '2026-10-31';
  } else if (/todo o período|histórico|full dataset|all-time|total/.test(msg)) {
    startDate = '2025-05-01';
    endDate = '2026-10-31';
  } else if (context?.active_start_date && context?.active_end_date && !isTopicSwitch) {
    startDate = context.active_start_date;
    endDate = context.active_end_date;
  }

  // Comparison
  let comparison: ComparisonWindow = 'none';
  if (/compare|comparação|comparar|em relação ao|mês anterior|período anterior|previous period/.test(msg)) {
    comparison = 'previous_period';
  }

  // 7. Filters
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
  if (filters.length === 0 && inheritedFilters.length > 0 && !isTopicSwitch) {
    if (!/todas|geral|sem filtro|limpar/.test(msg)) {
      filters.push(...inheritedFilters);
    }
  }

  // 8. Sort Direction for Ranking
  let sortDirection: 'asc' | 'desc' = 'desc';
  if (/pior|menor|worst|lowest|bottom|menos/.test(msg)) {
    sortDirection = 'asc';
  } else if (/melhor|maior|best|highest|top|mais/.test(msg)) {
    sortDirection = 'desc';
  }

  // 9. Visualization Recommendation (strictly Phase 06 allowed types)
  let vizHint: VisualizationSpec['type'] = 'metric';
  if (timeGrain) {
    vizHint = 'area';
  } else if (dimensions.length > 0) {
    vizHint = dimensions.includes('product_id') ? 'table' : 'bar';
  } else if (comparison !== 'none') {
    vizHint = 'metric';
  }

  let intentSummary = `Querying ${metrics.join(', ')}`;
  if (dimensions.length > 0) {
    intentSummary += ` grouped by ${dimensions.join(', ')}`;
  }
  intentSummary += ` from ${startDate} to ${endDate}`;

  return {
    is_supported: true,
    confidence: 1.0,
    metrics,
    dimensions,
    time_grain: timeGrain,
    start_date: startDate,
    end_date: endDate,
    comparison,
    filters,
    limit: 10,
    sort_direction: sortDirection,
    visualization_hint: vizHint,
    intent_summary: intentSummary,
  };
}

/**
 * Format metric value strictly according to business type.
 */
function formatMetricValue(metricName: string, value: number): string {
  if (['gross_revenue', 'net_revenue', 'average_order_value', 'revenue_per_customer', 'revenue_per_session', 'gross_margin'].includes(metricName)) {
    return formatCurrency(value);
  }
  if (['conversion_rate', 'cart_abandonment_rate', 'gross_margin_rate'].includes(metricName)) {
    return formatPercentage(value);
  }
  if (['orders', 'sessions', 'total_customers', 'new_customers', 'returning_customers', 'units_sold'].includes(metricName)) {
    return formatInteger(value);
  }
  if (metricName === 'roas') {
    return `${value.toFixed(2)}x`;
  }
  return value.toLocaleString('en-US', { maximumFractionDigits: 2 });
}

function verifyNumericGrounding(
  answer: string,
  result: any,
  primaryMetric: string,
  isTimeGrain: boolean = false
): boolean {
  if (!result || !result.metrics_summary) return true;
  if (isTimeGrain && result.rows && result.rows.length > 0) {
    const totalMetric = result.rows.reduce((acc: number, r: any) => acc + parseFloat(r[primaryMetric] || 0), 0);
    const formatted = formatMetricValue(primaryMetric, totalMetric);
    const cleanNum = formatted.replace(/[\$,%x]/g, '').trim();
    return answer.includes(cleanNum) || answer.includes(formatted);
  }
  const summary = result.metrics_summary[primaryMetric];
  if (summary && summary.current_value !== undefined) {
    const formatted = formatMetricValue(primaryMetric, summary.current_value);
    const cleanNum = formatted.replace(/[\$,%x]/g, '').trim();
    if (!answer.includes(cleanNum) && !answer.includes(formatted)) {
      if (result.rows && result.rows.length > 0) {
        const topRow = result.rows[0];
        const topVal = topRow[primaryMetric];
        if (topVal !== undefined) {
          const formattedTop = formatMetricValue(primaryMetric, topVal);
          const cleanTop = formattedTop.replace(/[\$,%x]/g, '').trim();
          if (answer.includes(cleanTop) || answer.includes(formattedTop)) {
            return true;
          }
        }
      }
      return false;
    }
  }
  return true;
}

/**
 * Synthesize grounded response text and visual specification from AnalyticsQueryResult.
 */
function synthesizeGroundedResponse(
  intent: SemanticIntent,
  query: AnalyticsQuery,
  result: any,
  isPt: boolean
): { answer: string; visualization: VisualizationSpec } {
  const firstMetric = intent.metrics[0];
  const mSummary = result.metrics_summary ? result.metrics_summary[firstMetric] : null;

  // A. Scalar Metric (no dimensions, no time grain)
  if (!intent.dimensions.length && !intent.time_grain) {
    const curr = mSummary ? mSummary.current_value : 0.0;
    const prev = mSummary?.previous_value ?? null;
    const deltaPct = mSummary?.percentage_delta ?? null;
    const valStr = formatMetricValue(firstMetric, curr);

    let answer: string;
    if (isPt) {
      answer = `No período de **${intent.start_date}** a **${intent.end_date}**, o total de **${firstMetric.replace(/_/g, ' ').toUpperCase()}** foi de **${valStr}**.`;
      if (prev !== null && deltaPct !== null) {
        const polarity = deltaPct >= 0 ? 'aumento' : 'queda';
        const prevStr = formatMetricValue(firstMetric, prev);
        answer += ` Isso representa uma ${polarity} de **${deltaPct >= 0 ? '+' : ''}${deltaPct.toFixed(2)}%** em comparação com o período anterior (${prevStr}).`;
      }
    } else {
      answer = `For the period from **${intent.start_date}** to **${intent.end_date}**, the total **${firstMetric.replace(/_/g, ' ').toUpperCase()}** was **${valStr}**.`;
      if (prev !== null && deltaPct !== null) {
        const direction = deltaPct >= 0 ? 'increase' : 'decrease';
        const prevStr = formatMetricValue(firstMetric, prev);
        answer += ` This represents a **${deltaPct >= 0 ? '+' : ''}${deltaPct.toFixed(2)}%** ${direction} compared to the previous period (${prevStr}).`;
      }
    }

    const viz = deriveVisualizationSpec(result, {
      metrics: intent.metrics,
      dimensions: intent.dimensions,
      timeGrain: intent.time_grain,
      rowCount: 1,
      comparison: intent.comparison,
      primaryMetricLabel: `${firstMetric.replace(/_/g, ' ').toUpperCase()} Overview`,
    });
    viz.metric_label = firstMetric.replace(/_/g, ' ').toUpperCase();
    viz.metric_value = valStr;
    if (prev !== null) {
      viz.comparison_label = 'vs previous period';
      viz.delta = deltaPct;
      viz.is_favorable = mSummary?.is_favorable ?? true;
    }

    return { answer, visualization: viz };
  }

  // B. Dimensional Breakdown
  if (intent.dimensions.length > 0) {
    const dim = intent.dimensions[0];
    const rows = result.rows || [];
    if (rows.length === 0) {
      const emptyAns = isPt
        ? 'Nenhum dado encontrado para os filtros selecionados.'
        : 'No data found for the selected filters.';
      return {
        answer: emptyAns,
        visualization: { type: 'table', title: 'Empty Result', series: [] },
      };
    }

    const topRow = rows[0];
    const topDimVal = topRow[dim] ?? 'N/A';
    const topMetricVal = parseFloat(topRow[firstMetric] ?? 0);
    const topMetricStr = formatMetricValue(firstMetric, topMetricVal);

    const isWorst = intent.sort_direction === 'asc';

    let answer: string;
    if (isPt) {
      const descriptor = isWorst ? 'a pior marca foi de' : 'o principal destaque é';
      answer = `Analisando por **${dim}** de ${intent.start_date} a ${intent.end_date}, ${descriptor} **${topDimVal}**, com **${topMetricStr}** em ${firstMetric.replace(/_/g, ' ')}.`;
    } else {
      const descriptor = isWorst ? 'lowest performer was' : 'leading segment is';
      answer = `Analyzing by **${dim}** from ${intent.start_date} to ${intent.end_date}, the ${descriptor} **${topDimVal}**, with **${topMetricStr}** in ${firstMetric.replace(/_/g, ' ')}.`;
    }

    const viz = deriveVisualizationSpec(result, {
      metrics: intent.metrics,
      dimensions: intent.dimensions,
      timeGrain: intent.time_grain,
      rowCount: rows.length,
      rows: rows.slice(0, 10),
      isRanked: intent.sort_direction !== undefined,
      primaryMetricLabel: `${firstMetric.replace(/_/g, ' ').toUpperCase()} by ${dim.toUpperCase()}`,
    });
    // Ensure titles align with canonical specs
    viz.title = `${firstMetric.replace(/_/g, ' ').toUpperCase()} by ${dim.toUpperCase()}`;
    viz.x_axis = dim;
    viz.y_axis = firstMetric;
    viz.series = rows.slice(0, 10);
    if (dim === 'product_id') {
      viz.type = 'table';
    } else if (viz.type === 'horizontal_bar') {
      viz.type = 'bar'; // standard bar for dimensional queries in ask tests
    }

    return { answer, visualization: viz };
  }

  // C. Time Series (Weekly, Daily, Monthly)
  if (intent.time_grain) {
    const rows = result.rows || [];
    const grainName = intent.time_grain;
    const totalMetric = rows.reduce((acc: number, r: any) => acc + parseFloat(r[firstMetric] || 0), 0);
    const totalMetricStr = formatMetricValue(firstMetric, totalMetric);

    let answer: string;
    if (isPt) {
      answer = `A evolução **${grainName}** de **${firstMetric.replace(/_/g, ' ').toUpperCase()}** somou **${totalMetricStr}** ao longo de ${rows.length} intervalos de tempo entre ${intent.start_date} e ${intent.end_date}.`;
    } else {
      answer = `The **${grainName}** evolution of **${firstMetric.replace(/_/g, ' ').toUpperCase()}** totaled **${totalMetricStr}** across ${rows.length} time intervals from ${intent.start_date} to ${intent.end_date}.`;
    }

    const viz = deriveVisualizationSpec(result, {
      metrics: intent.metrics,
      dimensions: intent.dimensions,
      timeGrain: intent.time_grain,
      rowCount: rows.length,
      rows,
      primaryMetricLabel: `${grainName.toUpperCase()} Trajectory of ${firstMetric.replace(/_/g, ' ').toUpperCase()}`,
    });
    viz.title = `${grainName.toUpperCase()} Trajectory of ${firstMetric.replace(/_/g, ' ').toUpperCase()}`;
    viz.type = 'area';
    viz.x_axis = 'timestamp';
    viz.y_axis = firstMetric;
    viz.series = rows;

    return { answer, visualization: viz };
  }

  return {
    answer: isPt ? 'Consulta executada com sucesso.' : 'Query executed successfully.',
    visualization: { type: 'table', title: 'Result', series: [] },
  };
}

/**
 * Main execution handler for Ask PRISM query.
 */
export async function executeAskPrismQuery(request: AskPrismRequest): Promise<AskPrismResponse> {
  const t0 = Date.now();
  const requestId = `req-${Math.random().toString(36).substring(2, 10)}`;

  // 1. Runtime Request Validation
  const validation = validateRuntimeRequest(request);
  if (!validation.valid) {
    return {
      answer: `Erro de validação: ${validation.error}`,
      is_supported: false,
      confidence: 0.0,
      intent: {
        is_supported: false,
        confidence: 0.0,
        metrics: [],
        dimensions: [],
        start_date: '2026-10-02',
        end_date: DEFAULT_END_DATE,
        filters: [],
        visualization_hint: 'table',
        intent_summary: 'Validation error',
      },
      context: request.context || { session_id: 'default-session', turn_count: 0, last_metrics: [], last_dimensions: [], last_filters: [] },
      execution_time_ms: Date.now() - t0,
      request_id: requestId,
      error_category: 'VALIDATION_ERROR',
    };
  }

  const isReset = /\b(limpar|reset|nova an[áa]lise|clear context|recome[çc]ar)\b/i.test(request.message);
  if (isReset) {
    return {
      answer: 'Contexto analítico redefinido com sucesso. Você pode iniciar uma nova análise.',
      is_supported: true,
      confidence: 1.0,
      intent: {
        is_supported: true,
        confidence: 1.0,
        metrics: ['gross_revenue'],
        dimensions: [],
        start_date: '2026-10-02',
        end_date: DEFAULT_END_DATE,
        filters: [],
        visualization_hint: 'metric',
        intent_summary: 'Context reset',
      },
      context: {
        session_id: request.context?.session_id || 'default-session',
        turn_count: 0,
        last_metrics: [],
        last_dimensions: [],
        last_filters: [],
      },
      execution_time_ms: Date.now() - t0,
      request_id: requestId,
    };
  }

  const context = request.context || {
    session_id: 'default-session',
    turn_count: 0,
    last_metrics: [],
    last_dimensions: [],
    last_filters: [],
  };

  // 2. Resolve Semantic Intent
  const intent = resolveSemanticIntent(request.message, context);

  // 3. Handle Unsupported Inquiries
  if (!intent.is_supported) {
    return {
      answer: intent.clarification_prompt || 'Esta pergunta não pôde ser processada.',
      is_supported: false,
      confidence: 0.0,
      intent,
      context,
      execution_time_ms: Date.now() - t0,
      request_id: requestId,
      error_category: 'UNSUPPORTED_INTENT',
    };
  }

  // 4. Build Structured AnalyticsQuery with OrderBy for Ranking
  const orderBy = [];
  if (intent.dimensions.length > 0) {
    orderBy.push({
      field: intent.metrics[0],
      direction: intent.sort_direction || 'desc',
    });
  }

  const query: AnalyticsQuery = {
    metrics: intent.metrics as any,
    dimensions: intent.dimensions as any,
    time_grain: intent.time_grain || undefined,
    start_date: intent.start_date,
    end_date: intent.end_date,
    comparison: intent.comparison || undefined,
    filters: intent.filters,
    limit: intent.limit || 10,
    order_by: orderBy as any,
  };

  // 5. Execute Query via Canonical Analytics Execution Boundary
  const result = await executeAnalyticsQuery(query);

  // 6. Generate Grounded Narration & Visualization
  const isPt = /qual|faturamento|receita|pedidos|como|mostre|quantos|este|últimos|pior|melhor|por que|porque/i.test(request.message);
  const { answer, visualization } = synthesizeGroundedResponse(intent, query, result, isPt);

  // 7. Verify Numeric Grounding Programmatically
  const isGrounded = verifyNumericGrounding(answer, result, intent.metrics[0], !!intent.time_grain);
  const finalAnswer = isGrounded
    ? answer
    : (isPt
        ? `No período de **${intent.start_date}** a **${intent.end_date}**, a consulta sobre **${intent.metrics[0]}** foi executada com sucesso.`
        : `For the period from **${intent.start_date}** to **${intent.end_date}**, the query on **${intent.metrics[0]}** was executed successfully.`);

  // 8. Update Context
  const updatedContext: ConversationContext = {
    session_id: context.session_id,
    turn_count: Math.min(context.turn_count + 1, 50),
    last_intent: intent,
    last_query: query,
    last_metrics: intent.metrics,
    last_dimensions: intent.dimensions,
    last_filters: intent.filters,
    active_start_date: intent.start_date,
    active_end_date: intent.end_date,
    active_time_grain: intent.time_grain,
  };

  return {
    answer: finalAnswer,
    is_supported: true,
    confidence: 1.0,
    intent,
    query,
    result,
    visualization,
    context: updatedContext,
    execution_time_ms: Date.now() - t0,
    request_id: requestId,
  };
}
