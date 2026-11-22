"""
PRISM Analytics Engine — Query Specification Models
Authoritative Pydantic models for structured analytical queries and results.
"""

from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


class TimeGrain(str, Enum):
    DAY = "day"
    WEEK = "week"
    MONTH = "month"
    QUARTER = "quarter"
    YEAR = "year"


class ComparisonWindow(str, Enum):
    NONE = "none"
    PREVIOUS_PERIOD = "previous_period"
    PREVIOUS_YEAR = "previous_year"
    CUSTOM = "custom"


class FilterOperator(str, Enum):
    EQ = "eq"
    NEQ = "neq"
    IN = "in"
    NOT_IN = "not_in"
    GT = "gt"
    GTE = "gte"
    LT = "lt"
    LTE = "lte"
    BETWEEN = "between"


class AnalyticsFilter(BaseModel):
    dimension: str
    operator: FilterOperator = FilterOperator.EQ
    value: str | int | float | bool | list[str | int | float | bool]


class SortDirection(str, Enum):
    ASC = "asc"
    DESC = "desc"


class OrderByClause(BaseModel):
    field: str
    direction: SortDirection = SortDirection.DESC


class AnalyticsQuery(BaseModel):
    metrics: list[str] = Field(..., description="List of metric_ids from the semantic registry")
    dimensions: list[str] | None = Field(default_factory=list, description="List of breakdown dimensions")
    time_grain: TimeGrain | None = Field(default=None, description="Time bucketing grain (day, week, month, etc.)")
    start_date: str = Field(..., description="Start date (YYYY-MM-DD, inclusive)")
    end_date: str = Field(..., description="End date (YYYY-MM-DD, inclusive)")
    comparison: ComparisonWindow | None = Field(default=ComparisonWindow.NONE, description="Comparison window type")
    custom_comparison_start: str | None = Field(default=None, description="Custom comparison start date")
    custom_comparison_end: str | None = Field(default=None, description="Custom comparison end date")
    filters: list[AnalyticsFilter] | None = Field(default_factory=list, description="Filter expressions")
    order_by: list[OrderByClause] | None = Field(default_factory=list, description="Ordering rules")
    limit: int | None = Field(default=1000, ge=1, le=10000, description="Max rows to return")
    offset: int | None = Field(default=0, ge=0, description="Row offset for pagination")


class MetricSummaryValue(BaseModel):
    metric_id: str
    current_value: float
    previous_value: float | None = None
    absolute_delta: float | None = None
    percentage_delta: float | None = None
    format_type: str
    is_favorable_up: bool = True
    is_favorable: bool | None = None


class AnalyticsQueryResult(BaseModel):
    query: AnalyticsQuery
    metrics_summary: dict[str, MetricSummaryValue]
    rows: list[dict[str, Any]]
    row_count: int
    execution_time_ms: float
    compiled_sql: str | None = None
