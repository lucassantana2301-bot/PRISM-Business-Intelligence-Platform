# AGENTS.md — Multi-Agent Engineering Protocol & System Blueprint

> **PRISM — Business Intelligence Platform**  
> Tagline: *Ask. Understand. Decide.*  
> **Canonical Source of Truth**: This document is the supreme behavioral and architectural guideline for all AI and human contributors (Antigravity, Claude, Codex, Cursor, etc.).

---

## 1. Product Vision & Architecture Overview

PRISM is a modern, high-performance Business Intelligence & Data Intelligence platform designed to transform raw metrics into instant, actionable insights. PRISM is **not** a basic static dashboard. It is an end-to-end data intelligence system integrating:
- Semantic analytics modeling and aggregation engines.
- Multi-dimensional data exploration and executive overviews.
- Automated anomaly detection, trend spotting, and insight synthesis.
- Controlled, secure Natural Language to SQL (NL-to-SQL) querying (**Ask PRISM**).
- Ambient bidirectional voice interaction (**PRISM Voice**).

### Architectural Axioms
1. **Separation of Concerns**: UI components *never* contain business analytics or query composition logic.
2. **Provider Agnosticism**: Data engines (PostgreSQL, DuckDB, BigQuery) and LLM providers (Gemini, Claude, OpenAI) must sit behind unified Protocol/Interface abstractions.
3. **Data Efficiency**: Raw data tables must never be transferred wholesale to browsers or LLM contexts. Aggregations, samples, and schema metadata form the boundary.
4. **Zero Compromise on Security**: NL-to-SQL is strictly read-only, AST-validated, allowlist-filtered, with mandatory LIMIT and timeout enforcement.

---

## 2. Agent Roles & Responsibilities

| Agent / Model | Primary Responsibilities | Strict Constraints |
| :--- | :--- | :--- |
| **Antigravity (Lead)** | Workspace orchestration, full-stack implementation, quality gates, planning execution. | Must adhere to planning mode; never bypass lint/typecheck. |
| **Claude** | Deep analytical modeling, complex algorithms, security reviews, rich documentation refinement. | Must follow `CLAUDE.md` and defer to `AGENTS.md` for architectural decisions. |
| **Codex / Assistants** | Unit tests, boilerplate reduction, localized refactoring. | Must never change contracts or design tokens without prior approval. |

---

## 3. Project Structure & Critical Boundaries

```
PRISM/
├── AGENTS.md                   # Supreme multi-agent protocol (this file)
├── CLAUDE.md                   # Claude-specific entrypoint
├── package.json                # Workspace script orchestrator
├── docs/                       # Architectural & domain documentation
│   ├── PRISM_MASTER.md         # Master product vision and principles
│   ├── ARCHITECTURE.md         # Layered architectural blueprint
│   ├── DATA_MODEL.md           # Conceptual E-commerce data schemas & metrics
│   ├── DESIGN_SYSTEM.md        # UI/UX visual standards & token rules
│   ├── ANALYTICS_SYSTEM.md     # Semantic analytics engine specs
│   ├── ASK_PRISM.md            # Conversational NL-to-SQL pipeline specs
│   ├── VOICE_SYSTEM.md         # Voice interaction architecture
│   ├── SECURITY.md             # Security, sandbox & query validation rules
│   └── ROADMAP.md              # Phase 00 to Phase 12 roadmap
├── apps/
│   ├── web/                    # Next.js (App Router), React, TypeScript, Tailwind CSS
│   │   ├── app/                # App router pages & layouts
│   │   ├── components/         # Modular UI & chart components
│   │   ├── lib/                # Client state, utilities, API clients
│   │   └── lib/contracts/      # TypeScript contracts mirroring backend
│   └── api/                    # Python / FastAPI Backend & Analytics Core
│       ├── src/
│       │   ├── contracts/      # Pydantic schemas for queries & models
│       │   ├── providers/      # Agnostic interfaces (LLM, Data, Voice)
│       │   ├── analytics/      # Metric calculations & aggregation logic
│       │   └── security/       # AST parser & query validation rules
│       ├── pyproject.toml
│       └── requirements.txt
```

### Critical Files (High Caution)
- `apps/web/lib/contracts/*` and `apps/api/src/contracts/*`: Shared contract definitions. Altering these requires updating both frontend and backend.
- `apps/web/tailwind.config.ts` and `apps/web/app/globals.css`: Core design system tokens. Do not alter color tokens arbitrarily.
- `docs/*`: Canonical specs. Changes must be justified and deliberate.

---

## 4. Code & Design Conventions

### Frontend (Next.js / TypeScript)
- **Strict TypeScript**: `noImplicitAny: true`, no `any` types unless justified with a comment.
- **Styling**: Tailwind CSS utilizing curated design system tokens (`bg-prism-*`, `text-prism-*`, `border-prism-*`).
- **Icons**: `lucide-react` with consistent stroke width (`1.5` or `1.75`) and size hierarchy.
- **Component Design**: Server Components by default; `"use client"` only when interactive state, effects, or browser APIs are required.
- **Aesthetics**: Premium dark-mode data terminal aesthetic (Linear / Stripe / Vercel data vibe). No excessive neon, no tacky glassmorphism, no gratuitous animations.

### Backend (Python / FastAPI)
- **Python Version**: >= 3.11 with strict type annotations (`typing`, `pydantic.BaseModel`).
- **Clean Architecture**: Interface contracts defined using `typing.Protocol` or abstract base classes.
- **Validation**: All inputs and outputs must pass through explicit Pydantic v2 schemas.

---

## 5. Multi-Agent Change & Safety Protocol

1. **Check Before Modifying**: Before touching existing files, agents must inspect the current file state. Never overwrite or delete code written by another agent without structural justification.
2. **Pre-Execution Diff Inspection**: Check `git diff` or compare content changes to guarantee no regressions.
3. **Strict Scope Control**: Do not implement future phase features prematurely (e.g., do not integrate live external LLM APIs in Phase 00).
4. **Dependency Policy**: Never add third-party dependencies (`npm install <pkg>` or `pip install <pkg>`) without technical necessity and compatibility checks.
5. **No Hardcoded Secrets**: No API keys, database credentials, or sensitive tokens may ever be committed. Use `.env.example` templates only.

---

## 6. Testing & Quality Gate Protocol

Every task or phase transition **MUST** pass all quality gates before completion:

```bash
# 1. Typecheck
npm run typecheck

# 2. Lint
npm run lint

# 3. Build
npm run build
```

If any check fails, the agent must diagnose and fix the issue before presenting results to the user.

---

## 7. Definition of Done (DoD)

A task or phase is considered **DONE** only when:
- [x] All required files exist with complete, non-placeholder implementations matching specifications.
- [x] Clean execution of `typecheck`, `lint`, and `build`.
- [x] No orphaned or broken imports.
- [x] Verification against `docs/` and roadmap alignment.
- [x] Phase report generated and signed off with status (`PASS` or `BLOCKED`).
