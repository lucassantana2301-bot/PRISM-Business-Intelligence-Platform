"""
Provider-Agnostic Data & OLAP Engine Protocol Specification
"""

from typing import Protocol, runtime_checkable, Dict, Any, List


@runtime_checkable
class BaseDataEngine(Protocol):
    """
    Decoupled interface for Analytics Data Engines (DuckDB, PostgreSQL, BigQuery).
    """

    async def execute_safe_query(self, sanitized_sql: str) -> List[Dict[str, Any]]:
        """
        Executes an AST-validated read-only SQL query with hard LIMIT and timeout boundaries.
        """
        ...

    async def get_schema_metadata(self) -> Dict[str, Any]:
        """
        Returns the allowlisted tables, views, columns, and data types available for querying.
        """
        ...
