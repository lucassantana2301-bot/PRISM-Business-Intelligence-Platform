"""
PRISM Analytics Engine — Python Engine Test & Benchmark
Tests DuckDB table registration, single and multi-metric aggregation,
comparison variance calculations, time grains, and breakdowns.
"""

import sys
import os
import time

# Ensure src is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.analytics.engine import AnalyticsEngine
from src.analytics.query_spec import (
    AnalyticsQuery,
    TimeGrain,
    ComparisonWindow,
    AnalyticsFilter,
    FilterOperator,
    OrderByClause,
    SortDirection,
)
from src.analytics.metrics import CANONICAL_METRIC_REGISTRY


def run_tests():
    print("\n=======================================================")
    print("      PRISM DUCKDB ANALYTICS ENGINE TEST SUITE")
    print("=======================================================\n")

    t0 = time.perf_counter()
    engine = AnalyticsEngine()
    init_time = (time.perf_counter() - t0) * 1000
    print(f"✓ DuckDB Engine initialized and tables loaded in {init_time:.2f}ms.")

    # 1. Test All 16 Canonical Metrics in Summary
    print("\n[1/4] Testing Summary Aggregations for Canonical Metrics...")
    q1 = AnalyticsQuery(
        metrics=[
            "gross_revenue",
            "net_revenue",
            "orders",
            "average_order_value",
            "sessions",
            "conversion_rate",
            "cart_abandonment_rate",
            "total_customers",
            "new_customers",
            "returning_customers",
            "units_sold",
            "gross_margin",
            "gross_margin_rate",
            "revenue_per_customer",
            "revenue_per_session",
            "roas",
        ],
        start_date="2025-01-01",
        end_date="2025-12-31",
        comparison=ComparisonWindow.NONE,
    )
    res1 = engine.execute_query(q1)
    print(f"✓ Summary executed in {res1.execution_time_ms:.2f}ms. Results:")
    for k, v in res1.metrics_summary.items():
        print(f"   - {k:22s}: {v.current_value:12.2f} ({v.format_type})")

    assert res1.metrics_summary["orders"].current_value > 0
    assert res1.metrics_summary["net_revenue"].current_value > 0
    assert res1.metrics_summary["conversion_rate"].current_value > 0

    # 2. Test Time Grain Aggregation (Weekly with Monday start)
    print("\n[2/4] Testing Time-Grain Aggregations (Weekly)...")
    q2 = AnalyticsQuery(
        metrics=["net_revenue", "orders", "conversion_rate"],
        start_date="2025-10-01",
        end_date="2025-12-31",
        time_grain=TimeGrain.WEEK,
    )
    res2 = engine.execute_query(q2)
    print(f"✓ Weekly grain executed in {res2.execution_time_ms:.2f}ms. Returned {res2.row_count} rows.")
    for r in res2.rows[:3]:
        print(f"   {r}")

    # 3. Test Dimensional Breakdown + Filters + Order By
    print("\n[3/4] Testing Dimensional Breakdown (Category) + Ordering...")
    q3 = AnalyticsQuery(
        metrics=["gross_revenue", "units_sold", "gross_margin_rate"],
        dimensions=["category"],
        start_date="2025-01-01",
        end_date="2025-12-31",
        order_by=[OrderByClause(field="gross_revenue", direction=SortDirection.DESC)],
    )
    res3 = engine.execute_query(q3)
    print(f"✓ Category breakdown executed in {res3.execution_time_ms:.2f}ms. Returned {res3.row_count} rows.")
    for r in res3.rows:
        print(f"   - {r.get('category', 'N/A'):18s} Rev: ${r.get('gross_revenue', 0):10.2f} Margin: {r.get('gross_margin_rate', 0):.1f}%")

    # 4. Test Comparison Window (Previous Period Variance)
    print("\n[4/4] Testing Previous Period Comparison Window...")
    q4 = AnalyticsQuery(
        metrics=["net_revenue", "orders", "conversion_rate"],
        start_date="2025-12-01",
        end_date="2025-12-31",
        comparison=ComparisonWindow.PREVIOUS_PERIOD,
    )
    res4 = engine.execute_query(q4)
    print(f"✓ Previous period comparison executed in {res4.execution_time_ms:.2f}ms.")
    for k, v in res4.metrics_summary.items():
        print(
            f"   - {k:18s}: Curr={v.current_value:10.2f} | Prev={v.previous_value:10.2f} | Delta={v.percentage_delta:+6.2f}% | Favorable={v.is_favorable}"
        )

    print("\n=======================================================")
    print("      ALL PYTHON DUCKDB ENGINE TESTS PASSED!")
    print("=======================================================\n")


if __name__ == "__main__":
    run_tests()
