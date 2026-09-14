"""
PRISM Ask PRISM — Conversational Intent & Visualization Contracts
Authoritative models for semantic intent interpretation, multi-turn context, and visual narration.
"""

from enum import Enum
from typing import Dict, List, Optional, Any, Union
from pydantic import BaseModel, Field

from ..analytics.query_spec import (
    AnalyticsQuery,
    AnalyticsQueryResult,
    AnalyticsFilter,
    TimeGrain,
    ComparisonWindow,
)


class VisualizationType(str, Enum):
    METRIC = "metric"
    BAR = "bar"
    LINE = "line"
    AREA = "area"
    TABLE = "table"


class VisualizationSpec(BaseModel):
    type: VisualizationType
    title: str
    x_axis: Optional[str] = None
    y_axis: Optional[str] = None
    metric_label: Optional[str] = None
    metric_value: Optional[str] = None
    comparison_label: Optional[str] = None
    delta: Optional[float] = None
    is_favorable: Optional[bool] = None
    series: Optional[List[Dict[str, Any]]] = None


class SemanticIntent(BaseModel):
    metrics: List[str] = Field(..., description="Canonical metric IDs")
    dimensions: List[str] = Field(default_factory=list, description="Breakdown dimensions")
    time_grain: Optional[TimeGrain] = None
    start_date: str = Field(..., description="Start date (YYYY-MM-DD)")
    end_date: str = Field(..., description="End date (YYYY-MM-DD)")
    comparison: Optional[ComparisonWindow] = ComparisonWindow.NONE
    filters: List[AnalyticsFilter] = Field(default_factory=list)
    limit: Optional[int] = Field(default=10, ge=1, le=100)
    visualization_hint: VisualizationType = VisualizationType.TABLE
    intent_summary: str = Field(description="Short human summary of analytical intent")


class ConversationContext(BaseModel):
    session_id: str
    turn_count: int = 0
    last_intent: Optional[SemanticIntent] = None
    last_query: Optional[AnalyticsQuery] = None
    last_metrics: List[str] = Field(default_factory=list)
    last_dimensions: List[str] = Field(default_factory=list)
    last_filters: List[AnalyticsFilter] = Field(default_factory=list)
    active_start_date: Optional[str] = None
    active_end_date: Optional[str] = None
    active_time_grain: Optional[TimeGrain] = None


class AskPrismRequest(BaseModel):
    message: str = Field(..., description="Natural language question in Portuguese or English")
    context: Optional[ConversationContext] = None


class AskPrismResponse(BaseModel):
    answer: str
    intent: SemanticIntent
    query: AnalyticsQuery
    result: AnalyticsQueryResult
    visualization: VisualizationSpec
    context: ConversationContext
    execution_time_ms: float
