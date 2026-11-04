# CLAUDE.md — PRISM (Business Intelligence Platform)

`AGENTS.md` is canonical (architecture axioms, repo tree, conventions, change protocol, DoD).
Read it before structural changes; this file only adds what you need to act correctly on the first try.
Domain specs live in `docs/` (`SECURITY.md`, `ARCHITECTURE.md`, `ASK_PRISM.md`, `DESIGN_SYSTEM.md`, `DATA_MODEL.md`, ...).

## How the system actually runs (read this first)

- **npm workspaces** monorepo (`package-lock.json`; no pnpm/turbo). Root scripts all target `apps/web`.
- **`apps/web` is self-contained.** Browser -> `lib/api/*_client.ts` (fetch `/api/...`) -> Next.js route
  handlers `app/api/**/route.ts` -> TypeScript engines `lib/api/*_service.ts` that read CSVs from
  `data/generated/csv`. The web app does **not** call `apps/api`.
- **`apps/api` (Python/FastAPI + DuckDB + sqlglot)** is a parallel engine with the same contracts
  (`src/main.py`, `src/analytics/`, `src/explorer/`, `src/security/query_validator.py`,
  `src/providers/`). It is not deployed and not part of any npm script.
- **Contracts are mirrored**: `apps/web/lib/contracts/*.ts` <-> `apps/api/src/contracts/*.py`
  (plus `apps/api/src/analytics/query_spec.py`, `src/explorer/query_spec.py`). Change both sides together.
- **Deploy**: Vercel builds only the web app (`vercel.json`: `npm --workspace=apps/web run build`,
  output `apps/web/.next`).

## Non-negotiable rules

1. **Layering**: React components render only. Query composition, metric math, intent resolution and
   SQL live in `lib/api/*_service.ts` / `lib/visualization/` (web) or `apps/api/src/{analytics,explorer,security}`.
   Never build SQL or aggregate metrics inside `components/` or `app/**/page.tsx`.
2. **Provider agnosticism**: go through the abstractions, not concrete SDKs/drivers.
   Python: `BaseLLMProvider` (`src/providers/llm.py`), `BaseDataEngine` (`src/providers/data.py`), both
   `typing.Protocol`. Web: `IDataProvider` / `DataProviderRegistry` (`lib/providers/data_provider.ts`),
   speech providers in `lib/voice/providers.ts`. Do not add live LLM SDK calls (out of current phase scope).
3. **Ask PRISM / NL-to-SQL security** (spec: `docs/SECURITY.md`):
   - NL is resolved to a structured semantic intent over allowlisted metrics/dimensions; never execute
     raw user or LLM text as SQL.
   - Every SQL string executed in `apps/api` must pass `validate_sql_query()` first (SELECT/WITH only,
     single statement, forbidden-keyword scan, sqlglot AST walk).
   - Identifiers (tables, columns, dimensions, sort fields) come only from registries/allowlists
     (`CANONICAL_METRIC_REGISTRY`, `ALLOWED_DIMENSIONS`, `DATASET_REGISTRY`); values are bound params
     (`?`) or `_sanitize_val()`. Dates go through `_validate_date_str()`.
   - Always keep hard limits: analytics LIMIT <= 100, explorer page_size <= 100, CSV export <= 5000 rows
     with formula-injection neutralization.
   - Never ship raw tables to the browser or an LLM context; aggregates, samples and schema metadata only.
   - Never weaken the validator, allowlists or limits to make a test pass.
4. **Design**: dark data-terminal look (Linear/Stripe/Vercel). Use `prism-*` Tailwind tokens; do not
   change tokens in `apps/web/tailwind.config.ts` / `app/globals.css` without approval. See `docs/DESIGN_SYSTEM.md`.
5. **No new dependencies** without necessity (AGENTS.md section 5). **No secrets** in code or docs.

## Commands (run from repo root unless noted)

```bash
npm install                    # once; installs all workspaces
npm run generate:data          # REQUIRED before dev/tests: writes data/generated/csv (gitignored)
npm run validate:data          # sanity-check the generated dataset
npm run dev                    # next dev (apps/web), http://localhost:3000
npm run typecheck              # tsc --noEmit
npm run lint                   # next lint (eslint next/core-web-vitals)
npm run build                  # next build
```

Web functional tests are standalone `tsx` scripts that import the services directly (no server needed):

```bash
npm run test:analytics | test:dashboard | test:explorer | test:ask | test:visualization
npm run test:voice | test:insights | test:data-providers | test:hardening
```

`npm test` is a placeholder (`echo`) and verifies nothing. `apps/web/scripts/test_css_delivery.ts`
is not wired to a script and needs a running server (`PORT`, default 3005).

Python API (Python >= 3.11; no pytest suite, no ruff/mypy config committed):

```bash
pip install -r apps/api/requirements.txt          # do not use `pip install -e apps/api` (see pitfalls)
python apps/api/scripts/generate_ecommerce_dataset.py   # Python generator (from repo root)
python apps/api/scripts/validate_dataset.py
python apps/api/scripts/test_analytics_engine.py
```

`src/main.py` uses relative imports, so the app must be imported as package `src` from `apps/api`
(e.g. `uvicorn src.main:app`); no run command is documented in the repo.

## Environment

No env vars are required locally. Optional, read by `lib/providers/data_provider.ts` only to mark
providers as "configured": `DATABASE_URL`, `POSTGRES_HOST`, `BIGQUERY_PROJECT_ID`. There is no
`.env.example` yet; `.env*` files are gitignored.

## Verification before saying "done"

1. `git status` / `git diff`: only the requested files changed.
2. `npm run typecheck`, `npm run lint`, `npm run build`: all clean (AGENTS.md quality gate).
3. Run the `test:*` script(s) for the area you touched (e.g. Ask PRISM -> `test:ask` + `test:hardening`;
   explorer -> `test:explorer`). Generate data first.
4. Touched `apps/api`? Run `python apps/api/scripts/test_analytics_engine.py` and confirm imports work.
5. Touched a contract? Confirm the TS and Python sides still match.
6. If a check cannot run (e.g. deps not installed), say so explicitly instead of claiming success.

## Pitfalls

- **Missing data fails silently**: services return `[]` when CSVs are absent, so pages/tests show zeros
  instead of erroring. Run `npm run generate:data` first.
- **CSV path depends on cwd**: web services resolve `../../data/generated/csv` from `process.cwd()`
  (correct when run via the workspace, cwd = `apps/web`) with a `__dirname` fallback. Python scripts use
  paths relative to repo root, so run them from the root.
- **Vercel build does not generate data** and `data/generated/` is gitignored; production API routes
  have no CSVs unless that changes.
- `apps/api/pyproject.toml` declares `readme = "README.md"`, which does not exist; editable install fails.
- `sqlglot` is optional at runtime in the validator: if it is missing, the AST check is silently skipped.
  Keep it installed when testing security behavior.
- Two Ask contracts exist on the web side: the route `app/api/ask/query` and test scripts use
  `lib/contracts/ask.ts`, while `components/ask/AskPrismClient.tsx` imports `ask_prism.ts`. Check
  which one a file uses before editing, and keep request/response shapes compatible.
- UI copy and intent resolution are bilingual (PT/EN); keep both when changing Ask PRISM phrasing.
