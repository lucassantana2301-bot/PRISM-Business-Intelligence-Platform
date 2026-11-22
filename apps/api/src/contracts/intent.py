"""
PRISM Ask PRISM — Conversational Intent & Visualization Contracts
Authoritative models for semantic intent interpretation, multi-turn context, and visual narration.
"""

from enum import Enum
from typing import Any

from pydantic import BaseModel, Field

from ..analytics.query_spec import (
    AnalyticsFilter,
    AnalyticsQuery,
    AnalyticsQueryResult,
    ComparisonWindow,
    TimeGrain,
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
    x_axis: str | None = None
    y_axis: str | None = None
    metric_label: str | None = None
    metric_value: str | None = None
    comparison_label: str | None = None
    delta: float | None = None
    is_favorable: bool | None = None
    series: list[dict[str, Any]] | None = None


class SemanticIntent(BaseModel):
    is_supported: bool = Field(default=True, description="Whether inquiry mapped to a valid canonical analytical intent")
    confidence: float = Field(default=1.0, ge=0.0, le=1.0, description="Confidence in intent interpretation")
    metrics: list[str] = Field(default_factory=list, description="Canonical metric IDs")
    dimensions: list[str] = Field(default_factory=list, description="Breakdown dimensions")
    time_grain: TimeGrain | None = None
    start_date: str = Field(..., description="Start date (YYYY-MM-DD)")
    end_date: str = Field(..., description="End date (YYYY-MM-DD)")
    comparison: ComparisonWindow | None = ComparisonWindow.NONE
    filters: list[AnalyticsFilter] = Field(default_factory=list)
    limit: int | None = Field(default=10, ge=1, le=100)
    sort_direction: str | None = Field(default="desc", description="Requested sort direction (asc or desc)")
    visualization_hint: VisualizationType = VisualizationType.TABLE
    intent_summary: str = Field(description="Short human summary of analytical intent")
    clarification_prompt: str | None = Field(default=None, description="Suggested clarification when unsupported")


class ConversationContext(BaseModel):
    session_id: str
    turn_count: int = 0
    last_intent: SemanticIntent | None = None
    last_query: AnalyticsQuery | None = None
    last_metrics: list[str] = Field(default_factory=list)
    last_dimensions: list[str] = Field(default_factory=list)
    last_filters: list[AnalyticsFilter] = Field(default_factory=list)
    active_start_date: str | None = None
    active_end_date: str | None = None
    active_time_grain: TimeGrain | None = None


# Alias for LLM provider contract backwards compatibility
ActiveContext = ConversationContext


class AskPrismRequest(BaseModel):
    message: str = Field(..., description="Natural language question in Portuguese or English")
    context: ConversationContext | None = None


class AskPrismResponse(BaseModel):
    answer: str
    is_supported: bool = True
    confidence: float = 1.0
    intent: SemanticIntent
    query: AnalyticsQuery | None = None
    result: AnalyticsQueryResult | None = None
    visualization: VisualizationSpec | None = None
    context: ConversationContext
    execution_time_ms: float
    request_id: str | None = None
    error_category: str | None = None
