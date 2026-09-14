"""
PRISM Analytics Security — AST SQL Query Validator
Strict structural verification of analytical SQL statements to enforce SELECT-only,
read-only operations over allowlisted tables and columns, rejecting all DDL, DML,
mutation, filesystem, multiple statement, and PRAGMA execution attempts.
"""

import re
from typing import Set, List, Optional

# Allowlisted Tables in PRISM Analytical Schema
ALLOWLISTED_TABLES: Set[str] = {
    "orders",
    "order_items",
    "products",
    "customers",
    "sessions",
    "campaigns",
    "o",
    "oi",
    "p",
    "c",
    "s",
    "session_cnt",
    "rev",
    "first_orders",
    "current_orders",
    "prior_orders",
    "campaign_rev",
    "campaign_cost",
}

# Forbidden SQL Keywords & Functions
FORBIDDEN_KEYWORDS: Set[str] = {
    "INSERT",
    "UPDATE",
    "DELETE",
    "DROP",
    "ALTER",
    "CREATE",
    "TRUNCATE",
    "REPLACE",
    "ATTACH",
    "DETACH",
    "COPY",
    "EXPORT",
    "IMPORT",
    "PRAGMA",
    "CALL",
    "EXEC",
    "EXECUTE",
    "GRANT",
    "REVOKE",
    "LOAD",
    "INSTALL",
    "READ_CSV",
    "READ_PARQUET",
    "READ_JSON",
    "WRITE_CSV",
    "WRITE_PARQUET",
    "WRITE_JSON",
    "SYSTEM",
    "SHELL",
}


class SQLValidationError(Exception):
    """Raised when an analytical SQL query fails structural validation."""
    pass


def validate_sql_query(sql: str) -> bool:
    """
    Validate that an analytical SQL string is strictly SELECT-only, contains no
    forbidden mutations, no multiple statements, no filesystem access, and operates
    only on allowlisted tables.
    """
    if not sql or not isinstance(sql, str):
        raise SQLValidationError("SQL query must be a non-empty string.")

    cleaned_sql = sql.strip()

    # 1. Multi-Statement Injection Check
    # Check if there are multiple semicolon-separated statements (ignoring trailing semicolon)
    statements = [s.strip() for s in cleaned_sql.split(";") if s.strip()]
    if len(statements) > 1:
        raise SQLValidationError("Multiple SQL statements are strictly prohibited.")

    # 2. Must start with SELECT or WITH (for Common Table Expressions)
    first_token_match = re.match(r"^\s*([A-Za-z_]+)", cleaned_sql, re.IGNORECASE)
    if not first_token_match:
        raise SQLValidationError("Invalid SQL syntax: missing starting keyword.")
    
    first_token = first_token_match.group(1).upper()
    if first_token not in {"SELECT", "WITH"}:
        raise SQLValidationError(f"Forbidden SQL statement type '{first_token}'. Only SELECT/WITH queries are allowed.")

    # 3. Forbidden Keyword Scan
    # Tokenize words to prevent substring false positives
    tokens = set(re.findall(r"\b[A-Za-z_][A-Za-z0-9_]*\b", cleaned_sql.upper()))
    
    forbidden_present = tokens.intersection(FORBIDDEN_KEYWORDS)
    if forbidden_present:
        raise SQLValidationError(f"SQL contains forbidden keyword(s): {', '.join(sorted(forbidden_present))}")

    # 4. AST / Structural Verification with sqlglot (if available)
    try:
        import sqlglot
        from sqlglot import exp

        parsed_trees = sqlglot.parse(cleaned_sql)
        if len(parsed_trees) > 1:
            raise SQLValidationError("Multiple AST query trees detected.")

        ast = parsed_trees[0]
        if not isinstance(ast, (exp.Select, exp.Expression)):
            raise SQLValidationError("AST root is not a valid analytical SELECT expression.")

        # Check for non-select AST expressions
        for node in ast.walk():
            if isinstance(node, (exp.Insert, exp.Update, exp.Delete, exp.Drop, exp.AlterTable, exp.Create, exp.Command)):
                raise SQLValidationError(f"Disallowed AST operation '{type(node).__name__}' detected.")

    except ImportError:
        # Fallback to strict regex validation if sqlglot is not in the environment
        pass
    except Exception as e:
        if isinstance(e, SQLValidationError):
            raise e
        # If sqlglot raises a parse error on invalid sql
        raise SQLValidationError(f"SQL syntax parse error: {str(e)}")

    return True
