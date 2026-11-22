"""
PRISM Analytics Core Pydantic Contracts
"""

from enum import Enum

from pydantic import BaseModel, Field


class TimeGrain(str, Enum):
    HOUR = "hour"
    DAY = "day"
    WEEK = "week"
    MONTH = "month"
    QUARTER = "quarter"
    YEAR = "year"


class MetricName(str, Enum):
    GROSS_REVENUE = "gross_revenue"
    NET_REVENUE = "net_revenue"
    ORDERS = "orders"
    AVERAGE_ORDER_VALUE = "average_order_value"
    CONVERSION_RATE = "conversion_rate"
    CART_ABANDONMENT_RATE = "cart_abandonment_rate"
    TOTAL_CUSTOMERS = "total_customers"
    NEW_CUSTOMERS = "new_customers"
    RETURNING_CUSTOMERS = "returning_customers"
    SESSIONS = "sessions"


class DimensionName(str, Enum):
    DATE = "date"
    CUSTOMER_SEGMENT = "customer_segment"
    CATEGORY = "category"
    SUBCATEGORY = "subcategory"
    REGION = "region"
    STATE = "state"
    CHANNEL = "channel"
    DEVICE_TYPE = "device_type"
    CAMPAIGN_NAME = "campaign_name"


class FilterOperator(str, Enum):
    EQ = "eq"
    IN = "in"
    NEQ = "neq"
    GT = "gt"
    LT = "lt"
    BETWEEN = "between"


class AnalyticsFilter(BaseModel):
    dimension: DimensionName
    operator: FilterOperator
    value: str | int | float | list[str | int | float]


class MetricDelta(BaseModel):
    current_value: float
    comparison_value: float
    absolute_delta: float
    percentage_delta: float | None
    direction: str = Field(pattern="^(up|down|neutral)$")
    is_favorable: bool


class AnalyticsQueryRequest(BaseModel):
    metrics: list[MetricName]
    dimensions: list[DimensionName] | None = None
    time_grain: TimeGrain | None = TimeGrain.DAY
    start_date: str
    end_date: str
    comparison_window: str | None = "previous_period"
    filters: list[AnalyticsFilter] | None = None
    limit: int | None = Field(default=100, ge=1, le=1000)


class TimeSeriesPoint(BaseModel):
    timestamp: str
    metrics: dict[str, float]
    comparison_metrics: dict[str, float] | None = None


class AnalyticsQueryResponse(BaseModel):
    query_id: str
    execution_time_ms: float
    time_grain: TimeGrain
    points: list[TimeSeriesPoint]
    summary: dict[str, MetricDelta]
