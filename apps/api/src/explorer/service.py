"""
PRISM Data Explorer — Execution Service
DuckDB-powered structured dataset exploration, server-side pagination,
sorting, multi-operator filtering, text search, and safe CSV export.
"""

import time
import io
import csv
from typing import Dict, List, Optional, Any, Tuple
import duckdb

from .registry import DATASET_REGISTRY, DatasetMetadata, ColumnMetadata
from .query_spec import (
    ExplorerQuery,
    ExplorerQueryResult,
    ExplorerFilter,
    ExplorerFilterOperator,
    ExplorerExportQuery,
    SortDirection,
)
from ..analytics.engine import AnalyticsEngine


class ExplorerService:
    def __init__(self, engine: Optional[AnalyticsEngine] = None):
        self.engine = engine or AnalyticsEngine()
        self.con = self.engine.con

    def get_datasets(self) -> List[Dict[str, Any]]:
        """List all allowlisted datasets with current row counts."""
        result = []
        for d_id, meta in DATASET_REGISTRY.items():
            count_res = self.con.execute(f"SELECT COUNT(*) FROM {meta.table_name};").fetchone()
            row_count = count_res[0] if count_res else 0
            result.append({
                "dataset_id": meta.dataset_id,
                "display_name": meta.display_name,
                "description": meta.description,
                "table_name": meta.table_name,
                "primary_key": meta.primary_key,
                "row_count": row_count,
                "column_count": len(meta.columns),
                "default_columns": meta.default_columns,
            })
        return result

    def get_schema(self, dataset_id: str) -> DatasetMetadata:
        """Retrieve schema metadata for a specific allowlisted dataset."""
        if dataset_id not in DATASET_REGISTRY:
            raise ValueError(f"Unknown or non-allowlisted dataset '{dataset_id}'.")
        return DATASET_REGISTRY[dataset_id]

    def _build_where_clause(
        self, dataset_meta: DatasetMetadata, filters: Optional[List[ExplorerFilter]], search: Optional[str]
    ) -> Tuple[str, List[Any]]:
        """Safely construct WHERE clause and parameter bindings."""
        col_map: Dict[str, ColumnMetadata] = {c.name: c for c in dataset_meta.columns}
        clauses = []
        params = []

        # 1. Process Structured Filters
        if filters:
            for f in filters:
                if f.column not in col_map:
                    raise ValueError(f"Column '{f.column}' is not valid for dataset '{dataset_meta.dataset_id}'.")
                col_def = col_map[f.column]
                if not col_def.filterable:
                    raise ValueError(f"Column '{f.column}' is not configured as filterable.")

                col = f.column
                op = f.operator
                val = f.value

                if op == ExplorerFilterOperator.EQ:
                    clauses.append(f"{col} = ?")
                    params.append(val)
                elif op == ExplorerFilterOperator.NEQ:
                    clauses.append(f"{col} != ?")
                    params.append(val)
                elif op == ExplorerFilterOperator.CONTAINS:
                    clauses.append(f"CAST({col} AS VARCHAR) ILIKE ?")
                    params.append(f"%{val}%")
                elif op == ExplorerFilterOperator.IN:
                    if not isinstance(val, list) or len(val) == 0:
                        raise ValueError(f"Operator 'in' requires a non-empty list of values.")
                    placeholders = ", ".join(["?" for _ in val])
                    clauses.append(f"{col} IN ({placeholders})")
                    params.extend(val)
                elif op == ExplorerFilterOperator.NOT_IN:
                    if not isinstance(val, list) or len(val) == 0:
                        raise ValueError(f"Operator 'not_in' requires a non-empty list of values.")
                    placeholders = ", ".join(["?" for _ in val])
                    clauses.append(f"{col} NOT IN ({placeholders})")
                    params.extend(val)
                elif op == ExplorerFilterOperator.GT:
                    clauses.append(f"{col} > ?")
                    params.append(val)
                elif op == ExplorerFilterOperator.GTE:
                    clauses.append(f"{col} >= ?")
                    params.append(val)
                elif op == ExplorerFilterOperator.LT:
                    clauses.append(f"{col} < ?")
                    params.append(val)
                elif op == ExplorerFilterOperator.LTE:
                    clauses.append(f"{col} <= ?")
                    params.append(val)
                elif op == ExplorerFilterOperator.BETWEEN:
                    if not isinstance(val, list) or len(val) != 2:
                        raise ValueError(f"Operator 'between' requires a 2-element list [start, end].")
                    clauses.append(f"{col} BETWEEN ? AND ?")
                    params.extend([val[0], val[1]])

        # 2. Process Controlled Text Search
        if search and search.strip():
            term = search.strip()
            searchable_cols = [c.name for c in dataset_meta.columns if c.searchable]
            if searchable_cols:
                search_or = []
                for sc in searchable_cols:
                    search_or.append(f"CAST({sc} AS VARCHAR) ILIKE ?")
                    params.append(f"%{term}%")
                clauses.append(f"({' OR '.join(search_or)})")

        where_sql = " AND ".join(clauses)
        return (f"WHERE {where_sql}" if where_sql else "", params)

    def execute_query(self, query: ExplorerQuery) -> ExplorerQueryResult:
        """Execute validated paginated query with sorting and filtering."""
        t0 = time.perf_counter()

        if query.dataset not in DATASET_REGISTRY:
            raise ValueError(f"Unknown or non-allowlisted dataset '{query.dataset}'.")

        meta = DATASET_REGISTRY[query.dataset]
        col_map = {c.name: c for c in meta.columns}

        # Validate projected columns
        projected = query.columns or meta.default_columns
        for col in projected:
            if col not in col_map:
                raise ValueError(f"Column '{col}' is not allowed in dataset '{query.dataset}'.")

        select_cols = ", ".join(projected)

        # Build WHERE clause
        where_clause, params = self._build_where_clause(meta, query.filters, query.search)

        # 1. Count Total Matching Rows
        count_sql = f"SELECT COUNT(*) FROM {meta.table_name} {where_clause};"
        total_rows_res = self.con.execute(count_sql, params).fetchone()
        total_rows = total_rows_res[0] if total_rows_res else 0

        # 2. Build ORDER BY
        order_by_sql = ""
        if query.sort_by:
            if query.sort_by not in col_map:
                raise ValueError(f"Sort column '{query.sort_by}' is not valid.")
            if not col_map[query.sort_by].sortable:
                raise ValueError(f"Column '{query.sort_by}' is not sortable.")
            direction = "ASC" if query.sort_direction == SortDirection.ASC else "DESC"
            order_by_sql = f"ORDER BY {query.sort_by} {direction}"
        else:
            order_by_sql = f"ORDER BY {meta.primary_key} ASC"

        # 3. Apply Pagination (Hard max page_size = 100)
        page_size = min(max(query.page_size, 1), 100)
        page = max(query.page, 1)
        offset = (page - 1) * page_size

        total_pages = max((total_rows + page_size - 1) // page_size, 1) if total_rows > 0 else 1

        data_sql = f"""
            SELECT {select_cols}
            FROM {meta.table_name}
            {where_clause}
            {order_by_sql}
            LIMIT {page_size} OFFSET {offset};
        """

        df = self.con.execute(data_sql, params).df()
        rows = df.to_dict(orient="records")

        # Format datetimes/dates for clean JSON transport
        for r in rows:
            for k, v in r.items():
                if hasattr(v, "isoformat"):
                    r[k] = v.isoformat()

        exec_time = round((time.perf_counter() - t0) * 1000.0, 2)

        return ExplorerQueryResult(
            dataset=query.dataset,
            rows=rows,
            page=page,
            page_size=page_size,
            total_rows=total_rows,
            total_pages=total_pages,
            execution_time_ms=exec_time,
        )

    def export_csv(self, query: ExplorerExportQuery) -> str:
        """
        Generate sanitized CSV for filtered query.
        Limits rows to query.limit (max 5000) and neutralizes spreadsheet formula injection.
        """
        if query.dataset not in DATASET_REGISTRY:
            raise ValueError(f"Unknown or non-allowlisted dataset '{query.dataset}'.")

        meta = DATASET_REGISTRY[query.dataset]
        col_map = {c.name: c for c in meta.columns}

        projected = query.columns or meta.default_columns
        for col in projected:
            if col not in col_map:
                raise ValueError(f"Column '{col}' is not allowed in dataset '{query.dataset}'.")

        select_cols = ", ".join(projected)
        where_clause, params = self._build_where_clause(meta, query.filters, query.search)

        order_by_sql = ""
        if query.sort_by:
            if query.sort_by not in col_map or not col_map[query.sort_by].sortable:
                raise ValueError(f"Invalid sort column '{query.sort_by}'.")
            direction = "ASC" if query.sort_direction == SortDirection.ASC else "DESC"
            order_by_sql = f"ORDER BY {query.sort_by} {direction}"
        else:
            order_by_sql = f"ORDER BY {meta.primary_key} ASC"

        limit = min(max(query.limit, 1), 5000)

        data_sql = f"""
            SELECT {select_cols}
            FROM {meta.table_name}
            {where_clause}
            {order_by_sql}
            LIMIT {limit};
        """

        df = self.con.execute(data_sql, params).df()
        records = df.to_dict(orient="records")

        output = io.StringIO()
        writer = csv.writer(output, quoting=csv.QUOTE_MINIMAL)
        writer.writerow(projected)

        for r in records:
            row_vals = []
            for col in projected:
                val = r.get(col, "")
                if hasattr(val, "isoformat"):
                    val = val.isoformat()
                str_val = str(val) if val is not None else ""
                
                # Formula Injection Protection: neutralize =, +, -, @
                if str_val.startswith(("=", "+", "-", "@")):
                    str_val = f"'{str_val}"

                row_vals.append(str_val)
            writer.writerow(row_vals)

        return output.getvalue()
