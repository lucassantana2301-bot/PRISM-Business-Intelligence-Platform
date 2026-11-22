from __future__ import annotations

import pytest

from src.security.query_validator import SQLValidationError, validate_sql_query


@pytest.mark.parametrize(
    "sql",
    [
        "SELECT SUM(o.subtotal) FROM orders o",
        "WITH a AS (SELECT 1 AS x) SELECT x FROM a",
        "SELECT 1 AS x UNION ALL SELECT 2 AS x",
    ],
)
def test_accepts_read_only_queries(sql: str) -> None:
    assert validate_sql_query(sql) is True


@pytest.mark.parametrize(
    "sql",
    [
        "DROP TABLE orders",
        "INSERT INTO orders VALUES (1)",
        "ATTACH 'x.db' AS x",
        "COPY orders TO 'out.csv'",
        "PRAGMA database_list",
        "SELECT 1; DROP TABLE orders",
        "SELECT * FROM read_csv('/etc/passwd')",
        "",
    ],
)
def test_rejects_writes_side_effects_and_file_access(sql: str) -> None:
    with pytest.raises(SQLValidationError):
        validate_sql_query(sql)
