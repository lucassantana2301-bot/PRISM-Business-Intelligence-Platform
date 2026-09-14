# CLAUDE.md — Claude Development Guide for PRISM

> **PRISM — Business Intelligence Platform**  
> *Ask. Understand. Decide.*

This document provides concise development guidelines for Claude when working within the PRISM codebase.

---

## 1. Authoritative Protocol

**`AGENTS.md` is the canonical and authoritative protocol for this project.**  
Always review and adhere to [AGENTS.md](./AGENTS.md) for architectural rules, multi-agent change protocols, design tokens, and quality gates.

---

## 2. Core Principles for Claude

1. **Adhere to Layered Architecture**:
   - UI (`apps/web`) → Application → Analytics Engine (`apps/api`) → Data Layer → Intelligence Layer.
   - Do not inject SQL generation logic or analytics calculations directly into React components.
2. **Provider Agnosticism**:
   - Write interfaces against `BaseLLMProvider` and `BaseDataEngine` rather than hardcoding specific SDK calls.
3. **Security First**:
   - Ask PRISM NL-to-SQL interactions must strictly adhere to the AST query validation and allowlist models detailed in [docs/SECURITY.md](./docs/SECURITY.md).
4. **Design Aesthetic**:
   - Dark mode data terminal (Linear / Stripe / Vercel style). Clean typography, high information density, subtle micro-interactions, no neon or template bloat.

---

## 3. Essential Commands

```bash
# Frontend dev server (from root)
npm run dev

# Run type checks across workspaces
npm run typecheck

# Run linter
npm run lint

# Run production build
npm run build
```

---

## 4. Work Verification Checklist

Before reporting completion on any task:
- [ ] Verify `git status` and ensure only requested files were touched.
- [ ] Run `npm run typecheck` and ensure zero TypeScript errors.
- [ ] Run `npm run lint` and ensure zero lint warnings or errors.
- [ ] Run `npm run build` and ensure the Next.js production build succeeds.
- [ ] Ensure all documentation links in `docs/` remain consistent.
