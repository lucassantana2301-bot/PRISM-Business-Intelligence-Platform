"""
Ask PRISM Security & AST Validation Schemas
"""

from typing import List, Optional
from pydantic import BaseModel, Field


class QueryValidationResult(BaseModel):
    is_safe: bool
    sanitized_sql: Optional[str] = None
    violation_reasons: List[str] = Field(default_factory=list)
    ast_node_count: int = 0
    enforced_limit: int = 100
    statement_timeout_ms: int = 3000


class QueryExecutionAuditLog(BaseModel):
    query_id: str
    raw_query: str
    validated_query: str
    execution_time_ms: float
    rows_returned: int
    user_id: Optional[str] = None
    session_id: str
    status: str
