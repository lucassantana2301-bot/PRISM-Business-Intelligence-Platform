"""
PRISM Analytics Engine — Query Specification Models
Authoritative Pydantic models for structured analytical queries and results.
"""

from enum import Enum
from typing import Dict, List, Optional, Any, Union
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
    value: Union[str, int, float, bool, List[Union[str, int, float, bool]]]


class SortDirection(str, Enum):
    ASC = "asc"
    DESC = "desc"


class OrderByClause(BaseModel):
    field: str
    direction: SortDirection = SortDirection.DESC


class AnalyticsQuery(BaseModel):
    metrics: List[str] = Field(..., description="List of metric_ids from the semantic registry")
    dimensions: Optional[List[str]] = Field(default_factory=list, description="List of breakdown dimensions")
    time_grain: Optional[TimeGrain] = Field(default=None, description="Time bucketing grain (day, week, month, etc.)")
    start_date: str = Field(..., description="Start date (YYYY-MM-DD, inclusive)")
    end_date: str = Field(..., description="End date (YYYY-MM-DD, inclusive)")
    comparison: Optional[ComparisonWindow] = Field(default=ComparisonWindow.NONE, description="Comparison window type")
    custom_comparison_start: Optional[str] = Field(default=None, description="Custom comparison start date")
    custom_comparison_end: Optional[str] = Field(default=None, description="Custom comparison end date")
    filters: Optional[List[AnalyticsFilter]] = Field(default_factory=list, description="Filter expressions")
    order_by: Optional[List[OrderByClause]] = Field(default_factory=list, description="Ordering rules")
    limit: Optional[int] = Field(default=1000, ge=1, le=10000, description="Max rows to return")
    offset: Optional[int] = Field(default=0, ge=0, description="Row offset for pagination")


class MetricSummaryValue(BaseModel):
    metric_id: str
    current_value: float
    previous_value: Optional[float] = None
    absolute_delta: Optional[float] = None
    percentage_delta: Optional[float] = None
    format_type: str
    is_favorable_up: bool = True
    is_favorable: Optional[bool] = None


class AnalyticsQueryResult(BaseModel):
    query: AnalyticsQuery
    metrics_summary: Dict[str, MetricSummaryValue]
    rows: List[Dict[str, Any]]
    row_count: int
    execution_time_ms: float
    compiled_sql: Optional[str] = None
