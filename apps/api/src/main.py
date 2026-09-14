"""
PRISM Analytics API Gateway
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="PRISM Business Intelligence Core API",
    description="Analytics Engine, Semantic Layer, and Conversational Query Gateway",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    return {
        "status": "online",
        "service": "prism-api",
        "phase": "00-foundation",
        "protocol_version": "1.0",
    }
