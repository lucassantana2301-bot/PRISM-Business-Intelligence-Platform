from __future__ import annotations

import pytest

from src.analytics.query_spec import AnalyticsQuery, ComparisonWindow, OrderByClause, SortDirection, TimeGrain

YEAR = {"start_date": "2025-01-01", "end_date": "2025-12-31"}


def test_summary_of_order_and_session_metrics(engine) -> None:
    result = engine.execute_query(AnalyticsQuery(metrics=["orders", "net_revenue", "conversion_rate"], **YEAR))
    assert result.metrics_summary["orders"].current_value > 0
    assert result.metrics_summary["net_revenue"].current_value > 0
    assert 0 < result.metrics_summary["conversion_rate"].current_value < 100


def test_time_grain_mixing_order_and_session_metrics(engine) -> None:
    """Regressão: o SQL agrupado referenciava a tabela de sessões sem join."""
    result = engine.execute_query(
        AnalyticsQuery(
            metrics=["net_revenue", "orders", "conversion_rate"],
            start_date="2025-10-01",
            end_date="2025-12-31",
            time_grain=TimeGrain.WEEK,
        )
    )
    assert result.row_count >= 13
    timestamps = [row["timestamp"] for row in result.rows]
    assert timestamps == sorted(timestamps)
    assert all(row["conversion_rate"] is not None for row in result.rows)


def test_breakdown_with_ordering(engine) -> None:
    result = engine.execute_query(
        AnalyticsQuery(
            metrics=["gross_revenue", "units_sold"],
            dimensions=["category"],
            order_by=[OrderByClause(field="gross_revenue", direction=SortDirection.DESC)],
            **YEAR,
        )
    )
    revenues = [row["gross_revenue"] for row in result.rows]
    assert revenues == sorted(revenues, reverse=True)


def test_previous_period_comparison(engine) -> None:
    result = engine.execute_query(
        AnalyticsQuery(
            metrics=["gross_revenue"],
            start_date="2025-11-01",
            end_date="2025-11-30",
            comparison=ComparisonWindow.PREVIOUS_PERIOD,
        )
    )
    summary = result.metrics_summary["gross_revenue"]
    assert summary.previous_value is not None and summary.percentage_delta is not None


def test_order_by_only_accepts_selected_columns(engine) -> None:
    """O campo de ordenação vai direto para o SQL: precisa ser uma coluna da própria consulta."""
    with pytest.raises(ValueError, match="Cannot order by"):
        engine.execute_query(
            AnalyticsQuery(
                metrics=["gross_revenue"],
                dimensions=["category"],
                order_by=[OrderByClause(field="(SELECT 1)", direction=SortDirection.DESC)],
                **YEAR,
            )
        )


def test_unsupported_combinations_fail_with_clear_errors(engine) -> None:
    with pytest.raises(ValueError, match="does not support"):
        engine.execute_query(AnalyticsQuery(metrics=["roas"], time_grain=TimeGrain.MONTH, **YEAR))
    with pytest.raises(ValueError, match="cannot combine"):
        engine.execute_query(AnalyticsQuery(metrics=["orders", "sessions"], dimensions=["category"], **YEAR))
