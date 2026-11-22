"""
PRISM Data Explorer — Query Specification Models
Authoritative Pydantic models for structured dataset queries, pagination, sorting, and filtering.
"""

from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


class ExplorerFilterOperator(str, Enum):
    EQ = "eq"
    NEQ = "neq"
    CONTAINS = "contains"
    IN = "in"
    NOT_IN = "not_in"
    GT = "gt"
    GTE = "gte"
    LT = "lt"
    LTE = "lte"
    BETWEEN = "between"


class ExplorerFilter(BaseModel):
    column: str
    operator: ExplorerFilterOperator = ExplorerFilterOperator.EQ
    value: str | int | float | bool | list[str | int | float | bool]


class SortDirection(str, Enum):
    ASC = "asc"
    DESC = "desc"


class ExplorerQuery(BaseModel):
    dataset: str = Field(..., description="Allowlisted dataset identifier (orders, products, etc.)")
    columns: list[str] | None = Field(default=None, description="Subset of columns to project")
    search: str | None = Field(default=None, description="Controlled text search on searchable columns")
    filters: list[ExplorerFilter] | None = Field(default_factory=list, description="Structured filters")
    sort_by: str | None = Field(default=None, description="Sort column identifier")
    sort_direction: SortDirection | None = Field(default=SortDirection.DESC, description="Sort direction")
    page: int = Field(default=1, ge=1, description="1-indexed page number")
    page_size: int = Field(default=25, ge=1, le=100, description="Page size (25, 50, 100)")


class ExplorerQueryResult(BaseModel):
    dataset: str
    rows: list[dict[str, Any]]
    page: int
    page_size: int
    total_rows: int
    total_pages: int
    execution_time_ms: float


class ExplorerExportQuery(BaseModel):
    dataset: str
    columns: list[str] | None = None
    search: str | None = None
    filters: list[ExplorerFilter] | None = None
    sort_by: str | None = None
    sort_direction: SortDirection | None = SortDirection.DESC
    limit: int = Field(default=5000, ge=1, le=5000, description="Max rows for safe CSV export")
