"""
Ask PRISM Security & AST Validation Schemas
"""


from pydantic import BaseModel, Field


class QueryValidationResult(BaseModel):
    is_safe: bool
    sanitized_sql: str | None = None
    violation_reasons: list[str] = Field(default_factory=list)
    ast_node_count: int = 0
    enforced_limit: int = 100
    statement_timeout_ms: int = 3000


class QueryExecutionAuditLog(BaseModel):
    query_id: str
    raw_query: str
    validated_query: str
    execution_time_ms: float
    rows_returned: int
    user_id: str | None = None
    session_id: str
    status: str
