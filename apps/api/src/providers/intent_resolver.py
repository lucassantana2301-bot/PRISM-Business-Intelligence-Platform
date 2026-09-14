"""
PRISM Ask PRISM — Semantic Intent & Narration Engine
Bilingual (PT/EN) deterministic intent resolution, multi-turn context retention,
and strictly grounded narrative answer synthesis over canonical analytics results.
"""

import re
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
    FilterOperator,
    TimeGrain,
    ComparisonWindow,
)
from ..analytics.metrics import CANONICAL_METRIC_REGISTRY
from ..analytics.engine import AnalyticsEngine

# Canonical dataset end date baseline
DEFAULT_END_DATE = "2026-10-31"


class SemanticIntentResolver:
    """
    Bilingual intent resolver mapping natural language questions to canonical AnalyticsQuery specifications.
    """

    def resolve(self, message: str, context: Optional[ConversationContext] = None) -> SemanticIntent:
        msg = message.lower().strip()

        # 1. Determine Metrics
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

        # Contextual metric inheritance if follow-up
        if not metrics and context and context.last_metrics:
            metrics = context.last_metrics.copy()

        if not metrics:
            metrics = ["gross_revenue"]

        # 2. Determine Dimensions
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

        # Contextual dimension inheritance
        if not dimensions and context and context.last_dimensions:
            # Check if this is an explicit follow-up question (e.g., "E qual teve...", "And which one...")
            if any(w in msg for w in ["qual teve", "e qual", "and which", "o que", "pior", "melhor", "worst", "best"]):
                dimensions = context.last_dimensions.copy()

        # 3. Determine Time Grain & Date Range
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
        elif any(w in msg for w in ["ano", "year", "ytd", "ano todo", "full year"]):
            start_date = "2026-01-01"
            end_date = "2026-10-31"
        elif any(w in msg for w in ["todo o período", "histórico", "full dataset", "all-time", "total"]):
            start_date = "2025-05-01"
            end_date = "2026-10-31"
        elif context and context.active_start_date and context.active_end_date:
            start_date = context.active_start_date
            end_date = context.active_end_date

        # Comparison
        comparison = ComparisonWindow.NONE
        if any(w in msg for w in ["compare", "comparação", "comparar", "em relação ao", "mês anterior", "período anterior", "previous period"]):
            comparison = ComparisonWindow.PREVIOUS_PERIOD

        # 4. Filters
        filters = []
        if "são paulo" in msg or "sp" in msg:
            filters.append(AnalyticsFilter(dimension="state", operator=FilterOperator.EQ, value="SP"))
        if "sudeste" in msg or "southeast" in msg:
            filters.append(AnalyticsFilter(dimension="region", operator=FilterOperator.EQ, value="Southeast"))
        if "eletrônicos" in msg or "electronics" in msg:
            filters.append(AnalyticsFilter(dimension="category", operator=FilterOperator.EQ, value="Electronics"))
        if "mobile" in msg and "desktop" not in msg:
            filters.append(AnalyticsFilter(dimension="device_type", operator=FilterOperator.CONTAINS, value="Mobile"))

        # Contextual filter inheritance
        if not filters and context and context.last_filters:
            if not any(w in msg for w in ["todas", "geral", "sem filtro", "limpar"]):
                filters = context.last_filters.copy()

        # 5. Visualization Recommendation
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
            metrics=metrics,
            dimensions=dimensions,
            time_grain=time_grain,
            start_date=start_date,
            end_date=end_date,
            comparison=comparison,
            filters=filters,
            limit=10,
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
        context = request.context or ConversationContext(session_id="default-session", turn_count=0)

        # 1. Resolve Semantic Intent
        intent = self.resolver.resolve(request.message, context)

        # 2. Build AnalyticsQuery
        query = AnalyticsQuery(
            metrics=intent.metrics,
            dimensions=intent.dimensions,
            time_grain=intent.time_grain,
            start_date=intent.start_date,
            end_date=intent.end_date,
            comparison=intent.comparison,
            filters=intent.filters,
            limit=intent.limit,
        )

        # 3. Execute Canonical Analytics Engine
        result = self.analytics_engine.execute_query(query)

        # 4. Generate Grounded Narration & Visualization Spec
        is_pt = any(w in request.message.lower() for w in ["qual", "faturamento", "receita", "pedidos", "como", "mostre", "quantos", "este", "últimos"])
        answer, viz = self._synthesize_grounded_response(intent, query, result, is_pt)

        # 5. Update Conversation Context
        updated_context = ConversationContext(
            session_id=context.session_id,
            turn_count=context.turn_count + 1,
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
            intent=intent,
            query=query,
            result=result,
            visualization=viz,
            context=updated_context,
            execution_time_ms=exec_ms,
        )

    def _synthesize_grounded_response(
        self, intent: SemanticIntent, query: AnalyticsQuery, result: AnalyticsQueryResult, is_pt: bool
    ) -> Tuple[str, VisualizationSpec]:
        """Synthesize concise grounded narrative and visual specification."""
        first_metric = intent.metrics[0]
        m_summary = result.metrics_summary.get(first_metric)

        # A. Scalar Metric Response (No dimensions, no time grain)
        if not intent.dimensions and not intent.time_grain:
            curr = m_summary.current_value if m_summary else 0.0
            prev = m_summary.previous_value if m_summary else None
            delta_pct = m_summary.percentage_delta if m_summary else None

            if first_metric in ["gross_revenue", "net_revenue", "average_order_value"]:
                val_str = f"${curr:,.2f}"
            elif first_metric in ["conversion_rate", "cart_abandonment_rate", "gross_margin_rate"]:
                val_str = f"{curr:.2f}%"
            else:
                val_str = f"{int(curr):,}"

            if is_pt:
                answer = f"No período de **{intent.start_date}** a **{intent.end_date}**, o valor registrado para **{first_metric.replace('_', ' ').title()}** foi de **{val_str}**."
                if prev is not None and delta_pct is not None:
                    polarity = "aumento" if delta_pct >= 0 else "queda"
                    answer += f" Isso representa um {polarity} de **{delta_pct:+.1f}%** em relação ao período anterior."
            else:
                answer = f"For the period from **{intent.start_date}** to **{intent.end_date}**, the total **{first_metric.replace('_', ' ').title()}** is **{val_str}**."
                if prev is not None and delta_pct is not None:
                    direction = "increase" if delta_pct >= 0 else "decrease"
                    answer += f" This is a **{delta_pct:+.1f}%** {direction} compared to the previous period benchmark."

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

        # B. Dimensional Breakdown Response (e.g. Category, Region, Device)
        elif intent.dimensions:
            dim = intent.dimensions[0]
            rows = result.rows
            if not rows:
                ans = "Nenhum dado encontrado para os filtros selecionados." if is_pt else "No data found for the selected breakdown."
                return (ans, VisualizationSpec(type=VisualizationType.TABLE, title="Empty Result"))

            top_row = rows[0]
            top_dim_val = top_row.get(dim, "N/A")
            top_metric_val = top_row.get(first_metric, 0.0)

            if first_metric in ["gross_revenue", "net_revenue"]:
                top_metric_str = f"${top_metric_val:,.2f}"
            elif first_metric == "conversion_rate":
                top_metric_str = f"{top_metric_val:.2f}%"
            else:
                top_metric_str = f"{top_metric_val}"

            if is_pt:
                answer = (
                    f"Analisando por **{dim}** entre {intent.start_date} e {intent.end_date}, "
                    f"o principal destaque é **{top_dim_val}**, com **{top_metric_str}** em {first_metric.replace('_', ' ')}."
                )
            else:
                answer = (
                    f"Analyzing by **{dim}** from {intent.start_date} to {intent.end_date}, "
                    f"the leading segment is **{top_dim_val}**, producing **{top_metric_str}** in {first_metric.replace('_', ' ')}."
                )

            viz = VisualizationSpec(
                type=VisualizationType.BAR,
                title=f"{first_metric.replace('_', ' ').title()} by {dim.title()}",
                x_axis=dim,
                y_axis=first_metric,
                series=rows[:10],
            )
            return (answer, viz)

        # C. Time Series Response (Weekly, Daily, Monthly)
        elif intent.time_grain:
            rows = result.rows
            grain_name = intent.time_grain.value
            total_rev = sum(r.get(first_metric, 0) for r in rows)

            if is_pt:
                answer = (
                    f"A evolução {grain_name} de **{first_metric.replace('_', ' ').title()}** acumulou **${total_rev:,.2f}** "
                    f"ao longo de {len(rows)} intervalos entre {intent.start_date} e {intent.end_date}."
                )
            else:
                answer = (
                    f"The {grain_name} trajectory of **{first_metric.replace('_', ' ').title()}** totaled **${total_rev:,.2f}** "
                    f"across {len(rows)} periods from {intent.start_date} to {intent.end_date}."
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
