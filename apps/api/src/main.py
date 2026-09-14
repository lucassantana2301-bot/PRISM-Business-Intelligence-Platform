"""
PRISM Analytics API Gateway
FastAPI entrypoint exposing the Semantic Metric Registry and Analytics Engine endpoints.
"""

from typing import Dict, Any, List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .analytics.metrics import CANONICAL_METRIC_REGISTRY, DEFERRED_METRICS, MetricDefinition
from .analytics.query_spec import AnalyticsQuery, AnalyticsQueryResult
from .analytics.engine import AnalyticsEngine

app = FastAPI(
    title="PRISM Business Intelligence Core API",
    description="Analytics Engine, Semantic Layer, and Conversational Query Gateway",
    version="0.3.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Engine singleton instance
engine: Optional[AnalyticsEngine] = None


def get_engine() -> AnalyticsEngine:
    global engine
    if engine is None:
        engine = AnalyticsEngine()
    return engine


@app.get("/health")
async def health_check():
    return {
        "status": "online",
        "service": "prism-api",
        "phase": "03-analytics-engine",
        "protocol_version": "1.0",
        "canonical_metrics_count": len(CANONICAL_METRIC_REGISTRY),
    }


@app.get("/api/analytics/metrics")
async def get_metrics():
    """Retrieve all authoritative canonical metric definitions and deferred metric notes."""
    return {
        "count": len(CANONICAL_METRIC_REGISTRY),
        "metrics": {k: v.model_dump() for k, v in CANONICAL_METRIC_REGISTRY.items()},
        "deferred_metrics": DEFERRED_METRICS,
    }


@app.post("/api/analytics/query", response_model=AnalyticsQueryResult)
async def query_analytics(query: AnalyticsQuery):
    """Execute a structured semantic analytics query with variance comparison and dimensional breakdown."""
    try:
        eng = get_engine()
        result = eng.execute_query(query)
        return result
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal analytics error: {str(e)}")
