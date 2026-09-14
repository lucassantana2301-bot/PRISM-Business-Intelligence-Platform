"""
Ask PRISM Intent & Multi-Turn Context Contracts
"""

from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from .analytics import MetricName, DimensionName, AnalyticsFilter, TimeGrain


class IntentType(str, Enum):
    METRIC_QUERY = "metric_query"
    COMPARATIVE_ANALYSIS = "comparative_analysis"
    DRILL_DOWN = "drill_down"
    ANOMALY_INQUIRY = "anomaly_inquiry"
    GENERAL_QUESTION = "general_question"


class VisualArchetype(str, Enum):
    KPI_STAT = "kpi_stat"
    TIME_SERIES_AREA = "time_series_area"
    COMPARATIVE_LINE = "comparative_line"
    BAR_DISTRIBUTION = "bar_distribution"
    RANKED_BAR = "ranked_bar"
    DONUT_BREAKDOWN = "donut_breakdown"
    MATRIX_HEATMAP = "matrix_heatmap"
    TABULAR_RECORDS = "tabular_records"


class SemanticIntent(BaseModel):
    intent_type: IntentType
    primary_metrics: List[MetricName] = Field(default_factory=list)
    dimensions: List[DimensionName] = Field(default_factory=list)
    filters: List[AnalyticsFilter] = Field(default_factory=list)
    time_grain: Optional[TimeGrain] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    comparison_target: Optional[str] = None
    confidence_score: float = Field(default=1.0, ge=0.0, le=1.0)


class ConversationTurn(BaseModel):
    id: str
    role: str = Field(pattern="^(user|assistant)$")
    content: str
    timestamp: str
    intent: Optional[SemanticIntent] = None
    visual_payload: Optional[Dict[str, Any]] = None
    sql_audit: Optional[Dict[str, Any]] = None


class ActiveContext(BaseModel):
    active_dimensions: List[DimensionName] = Field(default_factory=list)
    active_filters: List[AnalyticsFilter] = Field(default_factory=list)
    selected_time_range: str = "last_30_days"
