# Ask PRISM Security, Sandbox & Query Governance

> **PRISM — Business Intelligence Platform**  
> Defense-in-Depth Security Protocol for Natural Language to SQL Execution

---

## 1. Security Architecture Axioms

Executing SQL queries derived from LLM interpretation presents security risks (SQL injection, accidental data alteration, denial of service via runaway queries, and prompt injection attacks). PRISM implements a strict multi-layer defense sandbox:

```
[User Prompt]
      ↓
[Prompt Injection Sanitizer]
      ↓
[LLM Semantic Intent Generator]
      ↓
[AST SQL Parser & Validator]
      ↓ (Check against Table/Column Allowlist)
      ↓ (Reject Non-SELECT / DDL / DML / Functions)
      ↓ (Inject Mandatory LIMIT & Statement Timeout)
[Read-Only Database Role (Transaction Sandbox)]
      ↓
[Structured Query Results with PII Masking]
```

---

## 2. Strict Security Rules

### A. Read-Only Enforcement
- The database connection used by the analytics/LLM engine is strictly assigned a `READ_ONLY` role.
- Prohibited SQL operations:
  - `INSERT`, `UPDATE`, `DELETE`, `MERGE`
  - `DROP`, `ALTER`, `CREATE`, `TRUNCATE`
  - `GRANT`, `REVOKE`, `EXEC`, `CALL`, `COPY`
  - Multiple statements separated by semicolons (`;`) are strictly rejected.

### B. Schema Allowlist
- Queries may only reference explicitly allowlisted tables and views:
  - `marts.daily_sales_rollup`
  - `analytics.customers`
  - `analytics.products`
  - `analytics.orders`
  - `analytics.order_items`
  - `analytics.sessions`
  - `analytics.campaigns`
- Access to system tables (`pg_catalog`, `information_schema`, `sqlite_master`) is blocked by the AST parser.

### C. Resource Boundaries & Denial-of-Service Defense
- **Mandatory LIMIT**: Every generated query must contain a `LIMIT` clause $\le 1,000$ (default: $100$). If missing, the AST rewriter automatically appends `LIMIT 100`.
- **Query Timeout**: Hard database statement timeout enforced at `3,000ms`. Any query exceeding this threshold is aborted immediately.
- **Max Joins Limit**: Maximum 3 joins permitted per query to prevent Cartesian explosions.

### D. Audit Logging & Anomaly Defense
- Every generated query, execution duration, row count, user ID, and source intent is recorded in an immutable query audit log.
- Suspicious queries (e.g., repeated attempts to probe schema or bypass filters) trigger automatic security alerts and rate-limiting.
