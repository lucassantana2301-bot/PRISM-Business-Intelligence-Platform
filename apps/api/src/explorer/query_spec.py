"""
PRISM Data Explorer — Query Specification Models
Authoritative Pydantic models for structured dataset queries, pagination, sorting, and filtering.
"""

from enum import Enum
from typing import Dict, List, Optional, Any, Union
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
    value: Union[str, int, float, bool, List[Union[str, int, float, bool]]]


class SortDirection(str, Enum):
    ASC = "asc"
    DESC = "desc"


class ExplorerQuery(BaseModel):
    dataset: str = Field(..., description="Allowlisted dataset identifier (orders, products, etc.)")
    columns: Optional[List[str]] = Field(default=None, description="Subset of columns to project")
    search: Optional[str] = Field(default=None, description="Controlled text search on searchable columns")
    filters: Optional[List[ExplorerFilter]] = Field(default_factory=list, description="Structured filters")
    sort_by: Optional[str] = Field(default=None, description="Sort column identifier")
    sort_direction: Optional[SortDirection] = Field(default=SortDirection.DESC, description="Sort direction")
    page: int = Field(default=1, ge=1, description="1-indexed page number")
    page_size: int = Field(default=25, ge=1, le=100, description="Page size (25, 50, 100)")


class ExplorerQueryResult(BaseModel):
    dataset: str
    rows: List[Dict[str, Any]]
    page: int
    page_size: int
    total_rows: int
    total_pages: int
    execution_time_ms: float


class ExplorerExportQuery(BaseModel):
    dataset: str
    columns: Optional[List[str]] = None
    search: Optional[str] = None
    filters: Optional[List[ExplorerFilter]] = None
    sort_by: Optional[str] = None
    sort_direction: Optional[SortDirection] = SortDirection.DESC
    limit: int = Field(default=5000, ge=1, le=5000, description="Max rows for safe CSV export")
