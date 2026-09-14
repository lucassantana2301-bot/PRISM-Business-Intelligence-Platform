"""
PRISM Canonical Semantic Metric Registry
Authoritative definitions, source entities, formulas, and supported dimensions.
"""

from enum import Enum
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field


class MetricCategory(str, Enum):
    MONETIZATION = "monetization"
    VOLUME = "volume"
    CONVERSION = "conversion"
    CUSTOMERS = "customers"
    MARKETING = "marketing"


class MetricDefinition(BaseModel):
    metric_id: str
    display_name: str
    description: str
    category: MetricCategory
    formula_sql: str
    source_entities: List[str]
    aggregation_type: str = Field(description="sum, count, ratio, avg, count_distinct")
    supported_dimensions: List[str]
    supported_grains: List[str] = ["day", "week", "month", "quarter", "year"]
    format_type: str = Field(description="currency, integer, percentage, ratio, decimal")
    is_favorable_up: bool = True
    safe_zero_denominator: bool = True


# ==================== CANONICAL METRIC REGISTRY ====================
CANONICAL_METRIC_REGISTRY: Dict[str, MetricDefinition] = {
    # 1. Gross Revenue
    "gross_revenue": MetricDefinition(
        metric_id="gross_revenue",
        display_name="Gross Revenue",
        description="Total monetary value of merchandise sold before discounts, shipping, and taxes.",
        category=MetricCategory.MONETIZATION,
        formula_sql="SUM(oi.total_item_revenue)",
        source_entities=["order_items", "orders"],
        aggregation_type="sum",
        supported_dimensions=["date", "category", "subcategory", "region", "state", "channel", "device_type", "campaign_name"],
        format_type="currency",
        is_favorable_up=True,
    ),

    # 2. Net Revenue
    "net_revenue": MetricDefinition(
        metric_id="net_revenue",
        display_name="Net Revenue",
        description="Total realized revenue calculated as order subtotal minus discounts for completed orders.",
        category=MetricCategory.MONETIZATION,
        formula_sql="SUM(o.subtotal - o.discount_amount)",
        source_entities=["orders"],
        aggregation_type="sum",
        supported_dimensions=["date", "region", "state", "channel", "device_type", "payment_method", "campaign_name"],
        format_type="currency",
        is_favorable_up=True,
    ),

    # 3. Orders
    "orders": MetricDefinition(
        metric_id="orders",
        display_name="Total Orders",
        description="Count of successfully placed and completed customer orders.",
        category=MetricCategory.VOLUME,
        formula_sql="COUNT(CASE WHEN o.status = 'Completed' THEN 1 END)",
        source_entities=["orders"],
        aggregation_type="count",
        supported_dimensions=["date", "region", "state", "channel", "device_type", "payment_method", "campaign_name"],
        format_type="integer",
        is_favorable_up=True,
    ),

    # 4. Average Order Value (AOV)
    "average_order_value": MetricDefinition(
        metric_id="average_order_value",
        display_name="Average Order Value (AOV)",
        description="Average net monetary value per completed order.",
        category=MetricCategory.MONETIZATION,
        formula_sql="CASE WHEN COUNT(CASE WHEN o.status = 'Completed' THEN 1 END) > 0 THEN SUM(CASE WHEN o.status = 'Completed' THEN o.subtotal - o.discount_amount ELSE 0 END) / COUNT(CASE WHEN o.status = 'Completed' THEN 1 END) ELSE 0.0 END",
        source_entities=["orders"],
        aggregation_type="ratio",
        supported_dimensions=["date", "region", "state", "channel", "device_type", "payment_method", "campaign_name"],
        format_type="currency",
        is_favorable_up=True,
        safe_zero_denominator=True,
    ),

    # 5. Sessions
    "sessions": MetricDefinition(
        metric_id="sessions",
        display_name="Total Sessions",
        description="Total user browsing sessions initiated across web and mobile touchpoints.",
        category=MetricCategory.VOLUME,
        formula_sql="COUNT(s.session_id)",
        source_entities=["sessions"],
        aggregation_type="count",
        supported_dimensions=["date", "region", "state", "channel", "device_type", "browser", "campaign_name"],
        format_type="integer",
        is_favorable_up=True,
    ),

    # 6. Conversion Rate
    "conversion_rate": MetricDefinition(
        metric_id="conversion_rate",
        display_name="Conversion Rate",
        description="Percentage of user browsing sessions that resulted in a completed order.",
        category=MetricCategory.CONVERSION,
        formula_sql="CASE WHEN COUNT(s.session_id) > 0 THEN (COUNT(CASE WHEN s.is_converted THEN 1 END) * 100.0) / COUNT(s.session_id) ELSE 0.0 END",
        source_entities=["sessions"],
        aggregation_type="ratio",
        supported_dimensions=["date", "region", "state", "channel", "device_type", "browser", "campaign_name"],
        format_type="percentage",
        is_favorable_up=True,
        safe_zero_denominator=True,
    ),

    # 7. Cart Abandonment Rate
    "cart_abandonment_rate": MetricDefinition(
        metric_id="cart_abandonment_rate",
        display_name="Cart Abandonment Rate",
        description="Percentage of sessions where items were added to cart but no purchase was finalized.",
        category=MetricCategory.CONVERSION,
        formula_sql="CASE WHEN COUNT(CASE WHEN s.has_cart_add THEN 1 END) > 0 THEN ((COUNT(CASE WHEN s.has_cart_add THEN 1 END) - COUNT(CASE WHEN s.is_converted THEN 1 END)) * 100.0) / COUNT(CASE WHEN s.has_cart_add THEN 1 END) ELSE 0.0 END",
        source_entities=["sessions"],
        aggregation_type="ratio",
        supported_dimensions=["date", "region", "state", "channel", "device_type", "browser", "campaign_name"],
        format_type="percentage",
        is_favorable_up=False,
        safe_zero_denominator=True,
    ),

    # 8. Total Active Customers
    "total_customers": MetricDefinition(
        metric_id="total_customers",
        display_name="Active Customers",
        description="Count of distinct customers who placed at least one completed order within the period.",
        category=MetricCategory.CUSTOMERS,
        formula_sql="COUNT(DISTINCT CASE WHEN o.status = 'Completed' THEN o.customer_id END)",
        source_entities=["orders"],
        aggregation_type="count_distinct",
        supported_dimensions=["date", "region", "state", "channel", "device_type", "customer_segment"],
        format_type="integer",
        is_favorable_up=True,
    ),

    # 9. New Customers
    "new_customers": MetricDefinition(
        metric_id="new_customers",
        display_name="New Customers",
        description="Count of distinct customers whose first lifetime completed order occurred in the selected date range.",
        category=MetricCategory.CUSTOMERS,
        formula_sql="COUNT(DISTINCT nc.customer_id)",
        source_entities=["customers", "orders"],
        aggregation_type="count_distinct",
        supported_dimensions=["date", "region", "state", "channel", "customer_segment"],
        format_type="integer",
        is_favorable_up=True,
    ),

    # 10. Returning Customers
    "returning_customers": MetricDefinition(
        metric_id="returning_customers",
        display_name="Returning Customers",
        description="Count of distinct customers ordering in the period who had a prior completed order before period start.",
        category=MetricCategory.CUSTOMERS,
        formula_sql="COUNT(DISTINCT rc.customer_id)",
        source_entities=["customers", "orders"],
        aggregation_type="count_distinct",
        supported_dimensions=["date", "region", "state", "channel", "customer_segment"],
        format_type="integer",
        is_favorable_up=True,
    ),

    # 11. Units Sold
    "units_sold": MetricDefinition(
        metric_id="units_sold",
        display_name="Units Sold",
        description="Total quantity of individual items sold across completed orders.",
        category=MetricCategory.VOLUME,
        formula_sql="SUM(CASE WHEN o.status = 'Completed' THEN oi.quantity ELSE 0 END)",
        source_entities=["order_items", "orders"],
        aggregation_type="sum",
        supported_dimensions=["date", "category", "subcategory", "product_id", "region", "state", "channel"],
        format_type="integer",
        is_favorable_up=True,
    ),

    # 12. Gross Margin (Monetary)
    "gross_margin": MetricDefinition(
        metric_id="gross_margin",
        display_name="Gross Profit Margin ($)",
        description="Total gross monetary profit (item revenue minus product cost).",
        category=MetricCategory.MONETIZATION,
        formula_sql="SUM(CASE WHEN o.status = 'Completed' THEN oi.total_item_revenue - oi.total_item_cost ELSE 0 END)",
        source_entities=["order_items", "orders"],
        aggregation_type="sum",
        supported_dimensions=["date", "category", "subcategory", "product_id", "region", "channel"],
        format_type="currency",
        is_favorable_up=True,
    ),

    # 13. Gross Margin Rate (%)
    "gross_margin_rate": MetricDefinition(
        metric_id="gross_margin_rate",
        display_name="Gross Margin Rate (%)",
        description="Gross profit expressed as a percentage of gross merchandise revenue.",
        category=MetricCategory.MONETIZATION,
        formula_sql="CASE WHEN SUM(CASE WHEN o.status = 'Completed' THEN oi.total_item_revenue ELSE 0 END) > 0 THEN (SUM(CASE WHEN o.status = 'Completed' THEN oi.total_item_revenue - oi.total_item_cost ELSE 0 END) * 100.0) / SUM(CASE WHEN o.status = 'Completed' THEN oi.total_item_revenue ELSE 0 END) ELSE 0.0 END",
        source_entities=["order_items", "orders"],
        aggregation_type="ratio",
        supported_dimensions=["date", "category", "subcategory", "product_id", "region", "channel"],
        format_type="percentage",
        is_favorable_up=True,
        safe_zero_denominator=True,
    ),

    # 14. Revenue per Customer
    "revenue_per_customer": MetricDefinition(
        metric_id="revenue_per_customer",
        display_name="Revenue per Active Customer",
        description="Average net revenue generated per purchasing customer in the period.",
        category=MetricCategory.CUSTOMERS,
        formula_sql="CASE WHEN COUNT(DISTINCT CASE WHEN o.status = 'Completed' THEN o.customer_id END) > 0 THEN SUM(CASE WHEN o.status = 'Completed' THEN o.subtotal - o.discount_amount ELSE 0 END) / COUNT(DISTINCT CASE WHEN o.status = 'Completed' THEN o.customer_id END) ELSE 0.0 END",
        source_entities=["orders"],
        aggregation_type="ratio",
        supported_dimensions=["date", "region", "state", "channel", "customer_segment"],
        format_type="currency",
        is_favorable_up=True,
        safe_zero_denominator=True,
    ),

    # 15. Revenue per Session
    "revenue_per_session": MetricDefinition(
        metric_id="revenue_per_session",
        display_name="Revenue per Session",
        description="Average monetary value produced per store session (Visitor Monetization Rate).",
        category=MetricCategory.MONETIZATION,
        formula_sql="CASE WHEN COUNT(s.session_id) > 0 THEN SUM(CASE WHEN o.status = 'Completed' THEN o.subtotal - o.discount_amount ELSE 0 END) / COUNT(s.session_id) ELSE 0.0 END",
        source_entities=["sessions", "orders"],
        aggregation_type="ratio",
        supported_dimensions=["date", "region", "state", "channel", "device_type"],
        format_type="currency",
        is_favorable_up=True,
        safe_zero_denominator=True,
    ),

    # 16. Return on Ad Spend (ROAS)
    "roas": MetricDefinition(
        metric_id="roas",
        display_name="Return on Ad Spend (ROAS)",
        description="Ratio of attributed completed order revenue to realized advertising spend.",
        category=MetricCategory.MARKETING,
        formula_sql="CASE WHEN SUM(c.actual_spend) > 0 THEN SUM(CASE WHEN o.status = 'Completed' THEN o.subtotal - o.discount_amount ELSE 0 END) / SUM(c.actual_spend) ELSE NULL END",
        source_entities=["campaigns", "orders"],
        aggregation_type="ratio",
        supported_dimensions=["date", "campaign_name", "channel"],
        format_type="ratio",
        is_favorable_up=True,
        safe_zero_denominator=True,
    ),
}

# ==================== DEFERRED METRICS DOCUMENTATION ====================
# Per Section 4 of Phase 03 requirements:
# LTV is explicitly deferred until formalization of retention horizon, margin vs revenue basis, and observation window.
DEFERRED_METRICS = {
    "ltv": {
        "status": "DEFERRED — canonical definition required",
        "reason": "Requires customer cohort horizon definition (90d vs 360d vs lifetime), gross profit vs net revenue basis, and churn cutoff definition."
    }
}
