"""
PRISM Analytics API Gateway
FastAPI entrypoint exposing the Semantic Metric Registry, Analytics Engine,
Data Explorer, and Ask PRISM Conversational endpoints.
"""

import uuid
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, HTTPException, Response, Request
from fastapi.middleware.cors import CORSMiddleware

from .analytics.metrics import CANONICAL_METRIC_REGISTRY, DEFERRED_METRICS, MetricDefinition
from .analytics.query_spec import AnalyticsQuery, AnalyticsQueryResult
from .analytics.engine import AnalyticsEngine
from .explorer.registry import DATASET_REGISTRY, DatasetMetadata
from .explorer.query_spec import ExplorerQuery, ExplorerQueryResult, ExplorerExportQuery
from .explorer.service import ExplorerService
from .contracts.intent import AskPrismRequest, AskPrismResponse
from .providers.intent_resolver import AskPrismEngine

app = FastAPI(
    title="PRISM Business Intelligence Core API",
    description="Analytics Engine, Semantic Layer, Data Explorer, and Ask PRISM Gateway",
    version="0.6.5",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Singletons
engine: Optional[AnalyticsEngine] = None
explorer_service: Optional[ExplorerService] = None
ask_engine: Optional[AskPrismEngine] = None


def get_engine() -> AnalyticsEngine:
    global engine
    if engine is None:
        engine = AnalyticsEngine()
    return engine


def get_explorer_service() -> ExplorerService:
    global explorer_service
    if explorer_service is None:
        explorer_service = ExplorerService(get_engine())
    return explorer_service


def get_ask_engine() -> AskPrismEngine:
    global ask_engine
    if ask_engine is None:
        ask_engine = AskPrismEngine(get_engine())
    return ask_engine


@app.get("/health")
async def health_check():
    return {
        "status": "online",
        "service": "prism-api",
        "phase": "06.5-canonicalization-hardening",
        "protocol_version": "1.0",
        "canonical_metrics_count": len(CANONICAL_METRIC_REGISTRY),
        "allowlisted_datasets_count": len(DATASET_REGISTRY),
    }


# ==================== ANALYTICS ENDPOINTS ====================

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
        req_id = f"err-{uuid.uuid4().hex[:8]}"
        raise HTTPException(status_code=500, detail=f"Internal analytics error [ID: {req_id}]")


# ==================== ASK PRISM CONVERSATIONAL ENDPOINT ====================

@app.post("/api/ask/query", response_model=AskPrismResponse)
async def ask_prism_query(request: AskPrismRequest):
    """Execute natural language conversational analytics with semantic intent resolution and grounded narration."""
    try:
        ask_svc = get_ask_engine()
        response = ask_svc.process_query(request)
        return response
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        req_id = f"err-{uuid.uuid4().hex[:8]}"
        raise HTTPException(status_code=500, detail=f"Ask PRISM processing error [ID: {req_id}]")


# ==================== DATA EXPLORER ENDPOINTS ====================

@app.get("/api/explorer/datasets")
async def get_explorer_datasets():
    """List all registered and allowlisted datasets."""
    try:
        svc = get_explorer_service()
        return svc.get_datasets()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch datasets: {str(e)}")


@app.get("/api/explorer/schema/{dataset}", response_model=DatasetMetadata)
async def get_explorer_schema(dataset: str):
    """Retrieve full column schema and metadata for an allowlisted dataset."""
    try:
        svc = get_explorer_service()
        return svc.get_schema(dataset)
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch schema: {str(e)}")


@app.post("/api/explorer/query", response_model=ExplorerQueryResult)
async def query_explorer(query: ExplorerQuery):
    """Execute server-side paginated, sorted, and filtered query on an allowlisted dataset."""
    try:
        svc = get_explorer_service()
        return svc.execute_query(query)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        req_id = f"err-{uuid.uuid4().hex[:8]}"
        raise HTTPException(status_code=500, detail=f"Data Explorer query error [ID: {req_id}]")


@app.post("/api/explorer/export")
async def export_explorer_csv(query: ExplorerExportQuery):
    """Export filtered dataset to sanitized CSV with formula injection protection."""
    try:
        svc = get_explorer_service()
        csv_content = svc.export_csv(query)
        return Response(
            content=csv_content,
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={query.dataset}_export.csv"},
        )
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        req_id = f"err-{uuid.uuid4().hex[:8]}"
        raise HTTPException(status_code=500, detail=f"Export error [ID: {req_id}]")
