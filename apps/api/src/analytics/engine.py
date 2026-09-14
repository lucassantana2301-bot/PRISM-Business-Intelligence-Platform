"""
PRISM Analytics Engine — Core Semantic Execution Engine
DuckDB-powered analytical execution layer with canonical metric compilation,
dimensional breakdowns, time-grain aggregation, AST SQL validation, and comparison variance analysis.
"""

import time
import os
import re
from datetime import datetime, date, timedelta
from typing import Dict, List, Optional, Any, Tuple, Set
import duckdb

from .metrics import CANONICAL_METRIC_REGISTRY, MetricDefinition
from .query_spec import (
    AnalyticsQuery,
    AnalyticsQueryResult,
    MetricSummaryValue,
    TimeGrain,
    ComparisonWindow,
    FilterOperator,
    AnalyticsFilter,
)
from ..security.query_validator import validate_sql_query, SQLValidationError


# Strict Allowlists for Semantic Layer Security
ALLOWED_DIMENSIONS: Set[str] = {
    "date",
    "customer_segment",
    "category",
    "subcategory",
    "product_id",
    "region",
    "state",
    "channel",
    "device_type",
    "browser",
    "payment_method",
    "campaign_name",
}

ALLOWED_GRAINS: Set[str] = {"day", "week", "month", "quarter", "year"}
ALLOWED_COMPARISONS: Set[str] = {"none", "previous_period", "previous_year", "custom"}
ALLOWED_OPERATORS: Set[str] = {"eq", "neq", "in", "not_in", "gt", "gte", "lt", "lte", "between"}
ALLOWED_TABLE_ALIASES: Set[str] = {"", "o", "oi", "p", "c", "s", "first_orders", "current_orders", "prior_orders"}


class AnalyticsEngine:
    def __init__(self, data_dir: Optional[str] = None, db_path: str = ":memory:"):
        """
        Initialize Analytics Engine with DuckDB.
        Loads CSV files from data_dir into DuckDB views.
        """
        self.con = duckdb.connect(db_path)
        self.data_dir = data_dir or os.path.abspath(
            os.path.join(os.path.dirname(__file__), "../../../../data/generated/csv")
        )
        self._init_tables()

    def _init_tables(self):
        """Register CSV data sources as typed DuckDB tables with standardized column aliases."""
        csv_dir = self.data_dir.replace("\\", "/")
        
        if os.path.exists(os.path.join(self.data_dir, "orders.csv")):
            self.con.execute(f"""
                CREATE OR REPLACE TABLE orders AS 
                SELECT 
                    order_id,
                    customer_id,
                    campaign_id,
                    status,
                    CAST(subtotal AS DOUBLE) AS subtotal,
                    CAST(discount_amount AS DOUBLE) AS discount_amount,
                    CAST(tax_amount AS DOUBLE) AS tax_amount,
                    CAST(shipping_amount AS DOUBLE) AS shipping_amount,
                    CAST(total_revenue AS DOUBLE) AS total_revenue,
                    payment_method,
                    channel,
                    device_type,
                    CAST(order_date AS TIMESTAMP) AS created_at
                FROM read_csv_auto('{csv_dir}/orders.csv');
            """)

        if os.path.exists(os.path.join(self.data_dir, "order_items.csv")):
            self.con.execute(f"""
                CREATE OR REPLACE TABLE order_items AS 
                SELECT 
                    item_id,
                    order_id,
                    product_id,
                    CAST(quantity AS INTEGER) AS quantity,
                    CAST(unit_price AS DOUBLE) AS unit_price,
                    CAST(unit_cost AS DOUBLE) AS unit_cost,
                    CAST(total_item_revenue AS DOUBLE) AS total_item_revenue,
                    CAST(total_item_cost AS DOUBLE) AS total_item_cost
                FROM read_csv_auto('{csv_dir}/order_items.csv');
            """)

        if os.path.exists(os.path.join(self.data_dir, "products.csv")):
            self.con.execute(f"""
                CREATE OR REPLACE TABLE products AS 
                SELECT 
                    product_id,
                    sku,
                    title AS name,
                    category,
                    subcategory,
                    CAST(base_price AS DOUBLE) AS base_price,
                    CAST(unit_cost AS DOUBLE) AS unit_cost,
                    CAST(margin_rate AS DOUBLE) AS margin_rate,
                    CAST(is_active AS BOOLEAN) AS is_active
                FROM read_csv_auto('{csv_dir}/products.csv');
            """)

        if os.path.exists(os.path.join(self.data_dir, "customers.csv")):
            self.con.execute(f"""
                CREATE OR REPLACE TABLE customers AS 
                SELECT 
                    customer_id,
                    full_name,
                    email,
                    region,
                    state,
                    city,
                    customer_segment,
                    CAST(created_at AS TIMESTAMP) AS created_at
                FROM read_csv_auto('{csv_dir}/customers.csv');
            """)

        if os.path.exists(os.path.join(self.data_dir, "sessions.csv")):
            self.con.execute(f"""
                CREATE OR REPLACE TABLE sessions AS 
                SELECT 
                    session_id,
                    customer_id,
                    campaign_id,
                    device_type,
                    browser,
                    channel,
                    region,
                    state,
                    CAST(duration_seconds AS INTEGER) AS duration_seconds,
                    CAST(page_views AS INTEGER) AS page_views,
                    CAST(has_product_view AS BOOLEAN) AS has_product_view,
                    CAST(has_cart_add AS BOOLEAN) AS has_cart_add,
                    CAST(has_checkout_start AS BOOLEAN) AS has_checkout_start,
                    CAST(is_converted AS BOOLEAN) AS is_converted,
                    order_id,
                    CAST(session_start AS TIMESTAMP) AS started_at
                FROM read_csv_auto('{csv_dir}/sessions.csv');
            """)

        if os.path.exists(os.path.join(self.data_dir, "campaigns.csv")):
            self.con.execute(f"""
                CREATE OR REPLACE TABLE campaigns AS 
                SELECT 
                    campaign_id,
                    campaign_name AS name,
                    channel,
                    campaign_type,
                    CAST(budget AS DOUBLE) AS budget,
                    CAST(actual_spend AS DOUBLE) AS actual_spend,
                    target_category,
                    CAST(start_date AS DATE) AS start_date,
                    CAST(end_date AS DATE) AS end_date
                FROM read_csv_auto('{csv_dir}/campaigns.csv');
            """)

    def _validate_date_str(self, date_str: str) -> str:
        """Enforce strict YYYY-MM-DD date format."""
        if not re.match(r"^\d{4}-\d{2}-\d{2}$", date_str):
            raise ValueError(f"Invalid date format '{date_str}'. Expected 'YYYY-MM-DD'.")
        try:
            datetime.strptime(date_str, "%Y-%m-%d")
        except ValueError:
            raise ValueError(f"Invalid calendar date '{date_str}'.")
        return date_str

    def _compute_comparison_dates(
        self, start_date: str, end_date: str, comparison: ComparisonWindow,
        custom_start: Optional[str] = None, custom_end: Optional[str] = None
    ) -> Optional[Tuple[str, str]]:
        """Calculate comparison window date bounds."""
        if comparison == ComparisonWindow.NONE or not comparison:
            return None

        d_start = datetime.strptime(start_date, "%Y-%m-%d").date()
        d_end = datetime.strptime(end_date, "%Y-%m-%d").date()
        duration_days = (d_end - d_start).days + 1

        if comparison == ComparisonWindow.PREVIOUS_PERIOD:
            comp_end = d_start - timedelta(days=1)
            comp_start = comp_end - timedelta(days=duration_days - 1)
            return (comp_start.strftime("%Y-%m-%d"), comp_end.strftime("%Y-%m-%d"))

        elif comparison == ComparisonWindow.PREVIOUS_YEAR:
            try:
                comp_start = d_start.replace(year=d_start.year - 1)
            except ValueError:
                comp_start = d_start.replace(year=d_start.year - 1, day=28)
            try:
                comp_end = d_end.replace(year=d_end.year - 1)
            except ValueError:
                comp_end = d_end.replace(year=d_end.year - 1, day=28)
            return (comp_start.strftime("%Y-%m-%d"), comp_end.strftime("%Y-%m-%d"))

        elif comparison == ComparisonWindow.CUSTOM:
            if custom_start and custom_end:
                self._validate_date_str(custom_start)
                self._validate_date_str(custom_end)
                return (custom_start, custom_end)

        return None

    def _sanitize_val(self, val: Any) -> str:
        """Sanitize literal value to prevent SQL injection."""
        if isinstance(val, str):
            escaped = val.replace("'", "''")
            return f"'{escaped}'"
        elif isinstance(val, bool):
            return "TRUE" if val else "FALSE"
        elif isinstance(val, (int, float)):
            return str(val)
        else:
            escaped = str(val).replace("'", "''")
            return f"'{escaped}'"

    def _build_filter_sql(self, filters: List[AnalyticsFilter], table_alias: str = "") -> str:
        """Construct parameterized, allowlisted SQL WHERE clause from AnalyticsFilter list."""
        if not filters:
            return ""

        if table_alias and table_alias not in ALLOWED_TABLE_ALIASES:
            raise ValueError(f"Disallowed table alias '{table_alias}'.")

        clauses = []
        prefix = f"{table_alias}." if table_alias else ""

        for f in filters:
            if f.dimension not in ALLOWED_DIMENSIONS:
                raise ValueError(f"Dimension '{f.dimension}' is not allowlisted for filtering.")

            col = f"{prefix}{f.dimension}"
            op = f.operator
            val = f.value

            if op == FilterOperator.EQ:
                clauses.append(f"{col} = {self._sanitize_val(val)}")
            elif op == FilterOperator.NEQ:
                clauses.append(f"{col} != {self._sanitize_val(val)}")
            elif op == FilterOperator.IN:
                if isinstance(val, list) and len(val) > 0:
                    items = ", ".join([self._sanitize_val(v) for v in val])
                    clauses.append(f"{col} IN ({items})")
                else:
                    clauses.append(f"{col} = {self._sanitize_val(val)}")
            elif op == FilterOperator.NOT_IN:
                if isinstance(val, list) and len(val) > 0:
                    items = ", ".join([self._sanitize_val(v) for v in val])
                    clauses.append(f"{col} NOT IN ({items})")
            elif op == FilterOperator.GT:
                clauses.append(f"{col} > {self._sanitize_val(val)}")
            elif op == FilterOperator.GTE:
                clauses.append(f"{col} >= {self._sanitize_val(val)}")
            elif op == FilterOperator.LT:
                clauses.append(f"{col} < {self._sanitize_val(val)}")
            elif op == FilterOperator.LTE:
                clauses.append(f"{col} <= {self._sanitize_val(val)}")
            elif op == FilterOperator.BETWEEN:
                if isinstance(val, list) and len(val) == 2:
                    clauses.append(f"{col} BETWEEN {self._sanitize_val(val[0])} AND {self._sanitize_val(val[1])}")

        return " AND " + " AND ".join(clauses) if clauses else ""

    def _execute_single_metric_aggregate(
        self, metric_id: str, start_date: str, end_date: str, filters: List[AnalyticsFilter]
    ) -> float:
        """Calculate a single scalar metric aggregate over a date window."""
        self._validate_date_str(start_date)
        self._validate_date_str(end_date)

        metric_def = CANONICAL_METRIC_REGISTRY.get(metric_id)
        if not metric_def:
            raise ValueError(f"Unknown metric '{metric_id}'. Not in canonical registry.")

        if metric_id in ["gross_revenue", "units_sold", "gross_margin", "gross_margin_rate"]:
            filter_sql = self._build_filter_sql(filters, "")
            query = f"""
                SELECT 
                    {metric_def.formula_sql} AS val
                FROM order_items oi
                JOIN orders o ON oi.order_id = o.order_id
                JOIN products p ON oi.product_id = p.product_id
                WHERE o.created_at >= '{start_date} 00:00:00' 
                  AND o.created_at <= '{end_date} 23:59:59'
                  {filter_sql};
            """
            validate_sql_query(query)
            res = self.con.execute(query).fetchone()
            val = res[0] if res and res[0] is not None else 0.0
            return float(val)

        elif metric_id in ["net_revenue", "orders", "average_order_value", "total_customers", "revenue_per_customer"]:
            filter_sql = self._build_filter_sql(filters, "o")
            query = f"""
                SELECT 
                    {metric_def.formula_sql} AS val
                FROM orders o
                LEFT JOIN customers c ON o.customer_id = c.customer_id
                WHERE o.created_at >= '{start_date} 00:00:00' 
                  AND o.created_at <= '{end_date} 23:59:59'
                  {filter_sql};
            """
            validate_sql_query(query)
            res = self.con.execute(query).fetchone()
            val = res[0] if res and res[0] is not None else 0.0
            return float(val)

        elif metric_id in ["sessions", "conversion_rate", "cart_abandonment_rate"]:
            filter_sql = self._build_filter_sql(filters, "s")
            query = f"""
                SELECT 
                    {metric_def.formula_sql} AS val
                FROM sessions s
                WHERE s.started_at >= '{start_date} 00:00:00' 
                  AND s.started_at <= '{end_date} 23:59:59'
                  {filter_sql};
            """
            validate_sql_query(query)
            res = self.con.execute(query).fetchone()
            val = res[0] if res and res[0] is not None else 0.0
            return float(val)

        elif metric_id == "revenue_per_session":
            filter_sql = self._build_filter_sql(filters, "")
            query = f"""
                WITH session_cnt AS (
                    SELECT COUNT(session_id) as total_sessions
                    FROM sessions s
                    WHERE s.started_at >= '{start_date} 00:00:00' AND s.started_at <= '{end_date} 23:59:59'
                ),
                rev AS (
                    SELECT SUM(subtotal - discount_amount) as total_rev
                    FROM orders o
                    WHERE o.status = 'Completed'
                      AND o.created_at >= '{start_date} 00:00:00' AND o.created_at <= '{end_date} 23:59:59'
                )
                SELECT 
                    CASE WHEN session_cnt.total_sessions > 0 
                         THEN COALESCE(rev.total_rev, 0.0) / session_cnt.total_sessions 
                         ELSE 0.0 
                    END AS val
                FROM session_cnt, rev;
            """
            validate_sql_query(query)
            res = self.con.execute(query).fetchone()
            val = res[0] if res and res[0] is not None else 0.0
            return float(val)

        elif metric_id == "new_customers":
            filter_sql = self._build_filter_sql(filters, "first_orders")
            query = f"""
                WITH first_orders AS (
                    SELECT customer_id, MIN(created_at) as first_order_date
                    FROM orders
                    WHERE status = 'Completed'
                    GROUP BY customer_id
                )
                SELECT COUNT(DISTINCT customer_id) as val
                FROM first_orders
                WHERE first_order_date >= '{start_date} 00:00:00'
                  AND first_order_date <= '{end_date} 23:59:59'
                  {filter_sql};
            """
            validate_sql_query(query)
            res = self.con.execute(query).fetchone()
            val = res[0] if res and res[0] is not None else 0.0
            return float(val)

        elif metric_id == "returning_customers":
            filter_sql = self._build_filter_sql(filters, "current_orders")
            query = f"""
                WITH current_orders AS (
                    SELECT DISTINCT customer_id
                    FROM orders
                    WHERE status = 'Completed'
                      AND created_at >= '{start_date} 00:00:00'
                      AND created_at <= '{end_date} 23:59:59'
                ),
                prior_orders AS (
                    SELECT DISTINCT customer_id
                    FROM orders
                    WHERE status = 'Completed'
                      AND created_at < '{start_date} 00:00:00'
                )
                SELECT COUNT(DISTINCT c.customer_id) as val
                FROM current_orders c
                JOIN prior_orders p ON c.customer_id = p.customer_id;
            """
            validate_sql_query(query)
            res = self.con.execute(query).fetchone()
            val = res[0] if res and res[0] is not None else 0.0
            return float(val)

        elif metric_id == "roas":
            query = f"""
                WITH campaign_rev AS (
                    SELECT 
                        SUM(o.subtotal - o.discount_amount) as attr_revenue
                    FROM orders o
                    WHERE o.status = 'Completed'
                      AND o.campaign_id IS NOT NULL AND o.campaign_id != ''
                      AND o.created_at >= '{start_date} 00:00:00'
                      AND o.created_at <= '{end_date} 23:59:59'
                ),
                campaign_cost AS (
                    SELECT SUM(actual_spend) as total_spend
                    FROM campaigns
                    WHERE start_date <= '{end_date}' AND end_date >= '{start_date}'
                )
                SELECT 
                    CASE WHEN campaign_cost.total_spend > 0 
                         THEN COALESCE(campaign_rev.attr_revenue, 0.0) / campaign_cost.total_spend 
                         ELSE 0.0 
                    END AS val
                FROM campaign_rev, campaign_cost;
            """
            validate_sql_query(query)
            res = self.con.execute(query).fetchone()
            val = res[0] if res and res[0] is not None else 0.0
            return float(val)

        return 0.0

    def execute_query(self, query: AnalyticsQuery) -> AnalyticsQueryResult:
        """
        Execute structured analytical query, calculating metrics summary and breakdown rows.
        """
        start_time = time.perf_counter()

        self._validate_date_str(query.start_date)
        self._validate_date_str(query.end_date)

        for m in query.metrics:
            if m not in CANONICAL_METRIC_REGISTRY:
                raise ValueError(f"Unknown metric '{m}'. Not registered in canonical registry.")

        if query.dimensions:
            for dim in query.dimensions:
                if dim not in ALLOWED_DIMENSIONS:
                    raise ValueError(f"Dimension '{dim}' is not allowlisted.")

        if query.time_grain and query.time_grain.value not in ALLOWED_GRAINS:
            raise ValueError(f"Time grain '{query.time_grain}' is not allowlisted.")

        if query.comparison and query.comparison.value not in ALLOWED_COMPARISONS:
            raise ValueError(f"Comparison '{query.comparison}' is not allowlisted.")

        # 1. Compute Overall Metrics Summary (with Comparison if requested)
        comp_dates = self._compute_comparison_dates(
            query.start_date, query.end_date, query.comparison,
            query.custom_comparison_start, query.custom_comparison_end
        )

        metrics_summary: Dict[str, MetricSummaryValue] = {}
        for m in query.metrics:
            m_def = CANONICAL_METRIC_REGISTRY[m]
            curr_val = self._execute_single_metric_aggregate(m, query.start_date, query.end_date, query.filters or [])
            
            prev_val = None
            abs_delta = None
            pct_delta = None
            is_favorable = None

            if comp_dates:
                prev_val = self._execute_single_metric_aggregate(m, comp_dates[0], comp_dates[1], query.filters or [])
                abs_delta = round(curr_val - prev_val, 4)
                if prev_val > 0:
                    pct_delta = round(((curr_val - prev_val) / prev_val) * 100.0, 2)
                else:
                    pct_delta = 100.0 if curr_val > 0 else 0.0

                if m_def.is_favorable_up:
                    is_favorable = (curr_val >= prev_val)
                else:
                    is_favorable = (curr_val <= prev_val)

            metrics_summary[m] = MetricSummaryValue(
                metric_id=m,
                current_value=round(curr_val, 4),
                previous_value=round(prev_val, 4) if prev_val is not None else None,
                absolute_delta=abs_delta,
                percentage_delta=pct_delta,
                format_type=m_def.format_type,
                is_favorable_up=m_def.is_favorable_up,
                is_favorable=is_favorable,
            )

        # 2. Build Multi-dimensional / Time-grain Query Rows
        rows: List[Dict[str, Any]] = []
        compiled_sql = None

        time_grain = query.time_grain
        dimensions = query.dimensions or []

        if time_grain or dimensions:
            select_cols = []
            group_by_cols = []
            order_by_cols = []

            # Determine primary source table based on metrics and dimensions
            is_sessions_query = all(m in ["sessions", "conversion_rate", "cart_abandonment_rate"] for m in query.metrics)
            is_campaign_query = "campaign_name" in dimensions or "roas" in query.metrics

            if time_grain:
                ts_col = "s.started_at" if is_sessions_query else "o.created_at"
                if time_grain == TimeGrain.DAY:
                    grain_expr = f"CAST(DATE_TRUNC('day', {ts_col}) AS VARCHAR)"
                elif time_grain == TimeGrain.WEEK:
                    grain_expr = f"CAST(DATE_TRUNC('week', {ts_col}) AS VARCHAR)"
                elif time_grain == TimeGrain.MONTH:
                    grain_expr = f"CAST(DATE_TRUNC('month', {ts_col}) AS VARCHAR)"
                elif time_grain == TimeGrain.QUARTER:
                    grain_expr = f"CAST(DATE_TRUNC('quarter', {ts_col}) AS VARCHAR)"
                elif time_grain == TimeGrain.YEAR:
                    grain_expr = f"CAST(DATE_TRUNC('year', {ts_col}) AS VARCHAR)"

                select_cols.append(f"{grain_expr} AS timestamp")
                group_by_cols.append("timestamp")
                order_by_cols.append("timestamp ASC")

            for dim in dimensions:
                if dim in ["category", "subcategory"]:
                    col_expr = f"p.{dim}"
                elif dim in ["customer_segment", "region", "state"]:
                    col_expr = f"c.{dim}" if not is_sessions_query else f"s.{dim}"
                elif dim == "campaign_name":
                    col_expr = "camp.name AS campaign_name"
                elif dim == "product_id":
                    col_expr = "oi.product_id"
                else:
                    col_expr = f"s.{dim}" if is_sessions_query else f"o.{dim}"
                select_cols.append(f"{col_expr} AS {dim}")
                group_by_cols.append(dim)

            metric_selects = []
            for m in query.metrics:
                m_def = CANONICAL_METRIC_REGISTRY[m]
                metric_selects.append(f"{m_def.formula_sql} AS {m}")

            select_clause = ", ".join(select_cols + metric_selects)
            group_clause = ", ".join(group_by_cols)

            if is_sessions_query:
                filter_sql = self._build_filter_sql(query.filters or [], "s")
                compiled_sql = f"""
                    SELECT 
                        {select_clause}
                    FROM sessions s
                    WHERE s.started_at >= '{query.start_date} 00:00:00'
                      AND s.started_at <= '{query.end_date} 23:59:59'
                      {filter_sql}
                    GROUP BY {group_clause}
                """
            else:
                filter_sql = self._build_filter_sql(query.filters or [], "")
                campaign_join = "LEFT JOIN campaigns camp ON o.campaign_id = camp.campaign_id" if is_campaign_query else ""
                compiled_sql = f"""
                    SELECT 
                        {select_clause}
                    FROM orders o
                    LEFT JOIN order_items oi ON o.order_id = oi.order_id
                    LEFT JOIN products p ON oi.product_id = p.product_id
                    LEFT JOIN customers c ON o.customer_id = c.customer_id
                    {campaign_join}
                    WHERE o.created_at >= '{query.start_date} 00:00:00'
                      AND o.created_at <= '{query.end_date} 23:59:59'
                      {filter_sql}
                    GROUP BY {group_clause}
                """

            if query.order_by:
                custom_orders = []
                for o in query.order_by:
                    dir_str = "ASC" if o.direction.value == "asc" else "DESC"
                    custom_orders.append(f"{o.field} {dir_str}")
                compiled_sql += f" ORDER BY {', '.join(custom_orders)}"
            elif order_by_cols:
                compiled_sql += f" ORDER BY {', '.join(order_by_cols)}"

            # Bounded limit enforcement (max 100)
            limit_val = min(max(query.limit or 10, 1), 100) if query.limit else 50
            compiled_sql += f" LIMIT {limit_val}"

            if query.offset:
                offset_val = max(query.offset, 0)
                compiled_sql += f" OFFSET {offset_val}"

            compiled_sql += ";"

            validate_sql_query(compiled_sql)
            df = self.con.execute(compiled_sql).df()
            rows = df.to_dict(orient="records")

        execution_time_ms = round((time.perf_counter() - start_time) * 1000.0, 2)

        return AnalyticsQueryResult(
            query=query,
            metrics_summary=metrics_summary,
            rows=rows,
            row_count=len(rows),
            execution_time_ms=execution_time_ms,
            compiled_sql=compiled_sql,
        )
