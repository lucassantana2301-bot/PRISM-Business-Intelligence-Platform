"""
PRISM Ask PRISM — Semantic Intent & Narration Engine
Bilingual (PT/EN) deterministic intent resolution, multi-turn context retention,
strict adversarial query rejection, and programmatically grounded narrative answer
synthesis over canonical analytics results.
"""

import re
import uuid
from datetime import datetime, date, timedelta
from typing import Dict, List, Optional, Any, Tuple

from ..contracts.intent import (
    SemanticIntent,
    ConversationContext,
    VisualizationSpec,
    VisualizationType,
    AskPrismRequest,
    AskPrismResponse,
)
from ..analytics.query_spec import (
    AnalyticsQuery,
    AnalyticsQueryResult,
    AnalyticsFilter,
    OrderByClause,
    SortDirection,
    FilterOperator,
    TimeGrain,
    ComparisonWindow,
)
from ..analytics.metrics import CANONICAL_METRIC_REGISTRY
from ..analytics.engine import AnalyticsEngine

# Canonical dataset end date baseline
DEFAULT_END_DATE = "2026-10-31"

# Adversarial & Out-of-Domain Keywords
FORBIDDEN_PROMPT_PATTERNS = [
    r"ignore (all )?previous instructions",
    r"system prompt",
    r"read (the )?file",
    r"business_events\.json",
    r"c:\\users",
    r"api[ _]?key",
    r"secret",
    r"password",
    r"drop table",
    r"delete from",
    r"attach (another )?database",
    r"change the (revenue )?formula",
    r"weather",
    r"tempo hoje",
    r"previsão do tempo",
    r"ebitda",
    r"return every (customer|order)",
]


class SemanticIntentResolver:
    """
    Bilingual intent resolver mapping natural language questions to canonical AnalyticsQuery specifications.
    """

    def resolve(self, message: str, context: Optional[ConversationContext] = None) -> SemanticIntent:
        msg = message.lower().strip()

        # 1. Adversarial & Out-of-Domain Guard
        for pattern in FORBIDDEN_PROMPT_PATTERNS:
            if re.search(pattern, msg, re.IGNORECASE):
                return SemanticIntent(
                    is_supported=False,
                    confidence=0.0,
                    metrics=[],
                    dimensions=[],
                    start_date="2026-10-02",
                    end_date=DEFAULT_END_DATE,
                    intent_summary="Unsupported or restricted request",
                    clarification_prompt=(
                        "Esta pergunta está fora do escopo analítico permitido ou contém termos restritos. "
                        "Você pode perguntar sobre faturamento, pedidos, conversão, ticket médio, sessões ou ROAS."
                    ),
                )

        # 2. Context Reset Commands
        is_reset = bool(re.search(r"\b(limpar|reset|nova an[áa]lise|clear context|recome[çc]ar)\b", msg))
        if is_reset:
            context = None

        # 3. Topic Switch Check
        is_topic_switch = bool(re.search(r"\b(agora|em vez disso|ao inv[ée]s de|trocar para|instead|now show)\b", msg))

        # 4. Metric Identification
        metrics = []
        if any(w in msg for w in ["faturamento", "receita", "revenue", "gross revenue", "sales", "vendas"]):
            metrics.append("gross_revenue")
        if any(w in msg for w in ["pedidos", "orders", "compras", "transações", "volume de vendas"]):
            if "gross_revenue" not in metrics:
                metrics.append("orders")
        if any(w in msg for w in ["conversão", "conversion", "taxa de conversão", "conversion rate"]):
            metrics.append("conversion_rate")
        if any(w in msg for w in ["ticket médio", "aov", "average order value", "gasto médio"]):
            metrics.append("average_order_value")
        if any(w in msg for w in ["sessões", "sessions", "visitas", "tráfego", "traffic"]):
            metrics.append("sessions")
        if any(w in msg for w in ["abandono", "cart abandonment"]):
            metrics.append("cart_abandonment_rate")
        if any(w in msg for w in ["roas", "retorno sobre ad", "retorno de anúncio"]):
            metrics.append("roas")
        if any(w in msg for w in ["margem", "margin", "lucro bruto", "gross margin"]):
            metrics.append("gross_margin_rate")
        if any(w in msg for w in ["unidades", "units", "itens vendidos"]):
            metrics.append("units_sold")

        # 5. Dimension Identification
        dimensions = []
        if any(w in msg for w in ["região", "region", "regiões", "geografia", "sudeste", "nordeste"]):
            dimensions.append("region")
        if any(w in msg for w in ["categoria", "category", "categorias", "departamento", "departamentos"]):
            dimensions.append("category")
        if any(w in msg for w in ["subcategoria", "subcategory"]):
            dimensions.append("subcategory")
        if any(w in msg for w in ["dispositivo", "device", "dispositivos", "mobile", "desktop", "aparelho"]):
            dimensions.append("device_type")
        if any(w in msg for w in ["canal", "channel", "canais", "origem"]):
            dimensions.append("channel")
        if any(w in msg for w in ["campanha", "campaign", "campanhas"]):
            dimensions.append("campaign_name")
        if any(w in msg for w in ["produto", "product", "produtos", "items", "itens"]):
            dimensions.append("product_id")

        # 6. Context Inheritance vs Reset
        if is_topic_switch:
            # Drop old dimensions and filters on topic switch
            inherited_dimensions = []
            inherited_filters = []
        else:
            inherited_dimensions = (context.last_dimensions.copy() if context and context.last_dimensions else [])
            inherited_filters = (context.last_filters.copy() if context and context.last_filters else [])

        # Contextual metric inheritance
        if not metrics and context and context.last_metrics and not is_topic_switch:
            metrics = context.last_metrics.copy()

        # Contextual dimension inheritance for follow-up questions
        if not dimensions and inherited_dimensions:
            if any(w in msg for w in ["qual teve", "e qual", "and which", "o que", "pior", "melhor", "worst", "best"]):
                dimensions = inherited_dimensions

        # If still no analytical metric or dimension is identified and not a date query
        if not metrics and not dimensions and not any(w in msg for w in ["dias", "mês", "ano", "evolução"]):
            return SemanticIntent(
                is_supported=False,
                confidence=0.0,
                metrics=[],
                dimensions=[],
                start_date="2026-10-02",
                end_date=DEFAULT_END_DATE,
                intent_summary="Unrecognized analytical intent",
                clarification_prompt=(
                    "Não consegui identificar uma métrica ou dimensão válida na sua pergunta. "
                    "Tente perguntar: 'Qual o faturamento nos últimos 30 dias?' ou 'Mostre pedidos por região'."
                ),
            )

        if not metrics:
            metrics = ["gross_revenue"]

        # 7. Time Grain & Date Range
        time_grain = None
        if any(w in msg for w in ["semanal", "weekly", "evolução semanal", "por semana"]):
            time_grain = TimeGrain.WEEK
        elif any(w in msg for w in ["diário", "daily", "por dia", "evolução diária"]):
            time_grain = TimeGrain.DAY
        elif any(w in msg for w in ["mensal", "monthly", "por mês", "evolução mensal"]):
            time_grain = TimeGrain.MONTH

        # Date Range detection
        start_date = "2026-10-02"
        end_date = DEFAULT_END_DATE

        if any(w in msg for w in ["7 dias", "7 days", "última semana", "last week"]):
            start_date = "2026-10-25"
            end_date = "2026-10-31"
        elif any(w in msg for w in ["30 dias", "30 days", "último mês", "last month"]):
            start_date = "2026-10-02"
            end_date = "2026-10-31"
        elif any(w in msg for w in ["90 dias", "90 days", "trimestre", "quarter"]):
            start_date = "2026-08-03"
            end_date = "2026-10-31"
        elif any(w in msg for w in ["este mês", "this month", "outubro", "october"]):
            start_date = "2026-10-01"
            end_date = "2026-10-31"
        elif any(w in msg for w in ["ano", "year", "ytd", "ano todo", "full year", "neste ano"]):
            start_date = "2026-01-01"
            end_date = "2026-10-31"
        elif any(w in msg for w in ["todo o período", "histórico", "full dataset", "all-time", "total"]):
            start_date = "2025-05-01"
            end_date = "2026-10-31"
        elif context and context.active_start_date and context.active_end_date and not is_topic_switch:
            start_date = context.active_start_date
            end_date = context.active_end_date

        # Comparison Window
        comparison = ComparisonWindow.NONE
        if any(w in msg for w in ["compare", "comparação", "comparar", "em relação ao", "mês anterior", "período anterior", "previous period"]):
            comparison = ComparisonWindow.PREVIOUS_PERIOD

        # 8. Filters
        filters = []
        if "são paulo" in msg or "sp" in msg:
            filters.append(AnalyticsFilter(dimension="state", operator=FilterOperator.EQ, value="SP"))
        if "sudeste" in msg or "southeast" in msg:
            filters.append(AnalyticsFilter(dimension="region", operator=FilterOperator.EQ, value="Southeast"))
        if "eletrônicos" in msg or "electronics" in msg:
            filters.append(AnalyticsFilter(dimension="category", operator=FilterOperator.EQ, value="Electronics"))
        if "mobile" in msg and "desktop" not in msg:
            filters.append(AnalyticsFilter(dimension="device_type", operator=FilterOperator.IN, value=["Mobile iOS", "Mobile Android"]))

        # Inherit contextual filters if not explicitly overridden
        if not filters and inherited_filters and not is_topic_switch:
            if not any(w in msg for w in ["todas", "geral", "sem filtro", "limpar"]):
                filters = inherited_filters

        # 9. Sort Direction for Ranking
        sort_direction = "desc"
        if any(w in msg for w in ["pior", "menor", "worst", "lowest", "bottom", "menos"]):
            sort_direction = "asc"
        elif any(w in msg for w in ["melhor", "maior", "best", "highest", "top", "mais"]):
            sort_direction = "desc"

        # 10. Visualization Recommendation (strictly Phase 06 allowed types: metric, bar, area, table)
        viz_hint = VisualizationType.METRIC
        if time_grain:
            viz_hint = VisualizationType.AREA
        elif dimensions:
            if "product_id" in dimensions:
                viz_hint = VisualizationType.TABLE
            else:
                viz_hint = VisualizationType.BAR
        elif comparison != ComparisonWindow.NONE:
            viz_hint = VisualizationType.METRIC

        intent_summary = f"Querying {', '.join(metrics)}"
        if dimensions:
            intent_summary += f" grouped by {', '.join(dimensions)}"
        intent_summary += f" from {start_date} to {end_date}"

        return SemanticIntent(
            is_supported=True,
            confidence=1.0,
            metrics=metrics,
            dimensions=dimensions,
            time_grain=time_grain,
            start_date=start_date,
            end_date=end_date,
            comparison=comparison,
            filters=filters,
            limit=10,
            sort_direction=sort_direction,
            visualization_hint=viz_hint,
            intent_summary=intent_summary,
        )


class AskPrismEngine:
    """
    Complete conversational engine that orchestrates Intent Resolution,
    Analytics Execution, Grounded Narration, and Context Management.
    """

    def __init__(self, analytics_engine: Optional[AnalyticsEngine] = None):
        self.analytics_engine = analytics_engine or AnalyticsEngine()
        self.resolver = SemanticIntentResolver()

    def process_query(self, request: AskPrismRequest) -> AskPrismResponse:
        t0 = datetime.now()
        req_id = f"req-{uuid.uuid4().hex[:8]}"
        context = request.context or ConversationContext(session_id="default-session", turn_count=0)

        # 1. Resolve Semantic Intent
        intent = self.resolver.resolve(request.message, context)

        # 2. Handle Unsupported Inquiries Gracefully
        if not intent.is_supported:
            exec_ms = round((datetime.now() - t0).total_seconds() * 1000.0, 2)
            return AskPrismResponse(
                answer=intent.clarification_prompt or "Pergunta fora do escopo analítico suportado.",
                is_supported=False,
                confidence=0.0,
                intent=intent,
                query=None,
                result=None,
                visualization=None,
                context=context,
                execution_time_ms=exec_ms,
                request_id=req_id,
                error_category="UNSUPPORTED_INTENT",
            )

        # 3. Build AnalyticsQuery with OrderBy for Ranking
        order_by = []
        if intent.dimensions:
            first_metric = intent.metrics[0]
            direction = SortDirection.ASC if intent.sort_direction == "asc" else SortDirection.DESC
            order_by.append(OrderByClause(field=first_metric, direction=direction))

        query = AnalyticsQuery(
            metrics=intent.metrics,
            dimensions=intent.dimensions,
            time_grain=intent.time_grain,
            start_date=intent.start_date,
            end_date=intent.end_date,
            comparison=intent.comparison,
            filters=intent.filters,
            limit=intent.limit,
            order_by=order_by,
        )

        # 4. Execute Canonical Analytics Engine
        result = self.analytics_engine.execute_query(query)

        # 5. Generate Grounded Narration & Visualization Spec
        is_pt = any(w in request.message.lower() for w in ["qual", "faturamento", "receita", "pedidos", "como", "mostre", "quantos", "este", "últimos", "pior", "melhor", "por que", "porque"])
        answer, viz = self._synthesize_grounded_response(intent, query, result, is_pt)

        # 6. Update Conversation Context
        updated_context = ConversationContext(
            session_id=context.session_id,
            turn_count=min(context.turn_count + 1, 50),
            last_intent=intent,
            last_query=query,
            last_metrics=intent.metrics,
            last_dimensions=intent.dimensions,
            last_filters=intent.filters,
            active_start_date=intent.start_date,
            active_end_date=intent.end_date,
            active_time_grain=intent.time_grain,
        )

        exec_ms = round((datetime.now() - t0).total_seconds() * 1000.0, 2)

        return AskPrismResponse(
            answer=answer,
            is_supported=True,
            confidence=1.0,
            intent=intent,
            query=query,
            result=result,
            visualization=viz,
            context=updated_context,
            execution_time_ms=exec_ms,
            request_id=req_id,
        )

    def _format_metric_val(self, metric_name: str, val: float) -> str:
        """Format metric value according to canonical registry format type."""
        m_def = CANONICAL_METRIC_REGISTRY.get(metric_name)
        fmt = m_def.format_type if m_def else "decimal"

        if fmt == "currency":
            return f"${val:,.2f}"
        elif fmt == "percentage":
            return f"{val:.2f}%"
        elif fmt == "integer":
            return f"{int(val):,}"
        elif fmt == "ratio":
            return f"{val:.2f}x"
        else:
            return f"{val:,.2f}"

    def _synthesize_grounded_response(
        self, intent: SemanticIntent, query: AnalyticsQuery, result: AnalyticsQueryResult, is_pt: bool
    ) -> Tuple[str, VisualizationSpec]:
        """Synthesize concise grounded narrative and visual specification."""
        first_metric = intent.metrics[0]
        m_summary = result.metrics_summary.get(first_metric)

        # A. Scalar Metric Response
        if not intent.dimensions and not intent.time_grain:
            curr = m_summary.current_value if m_summary else 0.0
            prev = m_summary.previous_value if m_summary else None
            delta_pct = m_summary.percentage_delta if m_summary else None
            val_str = self._format_metric_val(first_metric, curr)

            if is_pt:
                answer = f"No período de **{intent.start_date}** a **{intent.end_date}**, o total de **{first_metric.replace('_', ' ').upper()}** foi de **{val_str}**."
                if prev is not None and delta_pct is not None:
                    polarity = "aumento" if delta_pct >= 0 else "queda"
                    prev_str = self._format_metric_val(first_metric, prev)
                    answer += f" Isso representa uma {polarity} de **{delta_pct:+.2f}%** em comparação com o período anterior ({prev_str})."
            else:
                answer = f"For the period from **{intent.start_date}** to **{intent.end_date}**, the total **{first_metric.replace('_', ' ').upper()}** was **{val_str}**."
                if prev is not None and delta_pct is not None:
                    direction = "increase" if delta_pct >= 0 else "decrease"
                    prev_str = self._format_metric_val(first_metric, prev)
                    answer += f" This represents a **{delta_pct:+.2f}%** {direction} compared to the previous period ({prev_str})."

            viz = VisualizationSpec(
                type=VisualizationType.METRIC,
                title=f"{first_metric.replace('_', ' ').title()} Overview",
                metric_label=first_metric.replace('_', ' ').title(),
                metric_value=val_str,
                comparison_label="vs previous period" if prev is not None else None,
                delta=delta_pct,
                is_favorable=m_summary.is_favorable if m_summary else True,
            )
            return (answer, viz)

        # B. Dimensional Breakdown Response
        elif intent.dimensions:
            dim = intent.dimensions[0]
            rows = result.rows
            if not rows:
                ans = "Nenhum dado encontrado para os filtros selecionados." if is_pt else "No data found for the selected breakdown."
                return (ans, VisualizationSpec(type=VisualizationType.TABLE, title="Empty Result"))

            # Top row reflects requested sort direction
            top_row = rows[0]
            top_dim_val = top_row.get(dim, "N/A")
            top_metric_val = float(top_row.get(first_metric, 0.0))
            top_metric_str = self._format_metric_val(first_metric, top_metric_val)

            is_worst = (intent.sort_direction == "asc")

            if is_pt:
                descriptor = "a pior marca foi de" if is_worst else "o principal destaque é"
                answer = (
                    f"Analisando por **{dim}** de {intent.start_date} a {intent.end_date}, "
                    f"{descriptor} **{top_dim_val}**, com **{top_metric_str}** em {first_metric.replace('_', ' ')}."
                )
            else:
                descriptor = "lowest performer was" if is_worst else "leading segment is"
                answer = (
                    f"Analyzing by **{dim}** from {intent.start_date} to {intent.end_date}, "
                    f"the {descriptor} **{top_dim_val}**, with **{top_metric_str}** in {first_metric.replace('_', ' ')}."
                )

            viz_type = VisualizationType.TABLE if dim == "product_id" else VisualizationType.BAR
            viz = VisualizationSpec(
                type=viz_type,
                title=f"{first_metric.replace('_', ' ').title()} by {dim.title()}",
                x_axis=dim,
                y_axis=first_metric,
                series=rows[:10],
            )
            return (answer, viz)

        # C. Time Series Response
        elif intent.time_grain:
            rows = result.rows
            grain_name = intent.time_grain.value
            total_metric = sum(float(r.get(first_metric, 0.0)) for r in rows)
            total_metric_str = self._format_metric_val(first_metric, total_metric)

            if is_pt:
                answer = (
                    f"A evolução **{grain_name}** de **{first_metric.replace('_', ' ').upper()}** somou **{total_metric_str}** "
                    f"ao longo de {len(rows)} intervalos de tempo entre {intent.start_date} e {intent.end_date}."
                )
            else:
                answer = (
                    f"The **{grain_name}** evolution of **{first_metric.replace('_', ' ').upper()}** totaled **{total_metric_str}** "
                    f"across {len(rows)} time intervals from {intent.start_date} to {intent.end_date}."
                )

            viz = VisualizationSpec(
                type=VisualizationType.AREA,
                title=f"{grain_name.title()} Trajectory of {first_metric.replace('_', ' ').title()}",
                x_axis="timestamp",
                y_axis=first_metric,
                series=rows,
            )
            return (answer, viz)

        return ("Consulta executada com sucesso.", VisualizationSpec(type=VisualizationType.TABLE, title="Result"))
