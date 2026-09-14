# PRISM — Business Intelligence Platform

> **Tagline**: *Ask. Understand. Decide.*  
> **Platform**: Next.js (App Router) • TypeScript • Tailwind CSS • Python • DuckDB • FastAPI • Recharts

---

## 1. Executive Summary

**PRISM** is a modern, high-performance Business Intelligence and Data Intelligence platform engineered to transform raw operational metrics into instant, actionable executive insights.

PRISM moves beyond static reporting dashboards by unifying:
1. **Semantic Analytics Engine**: Deterministic calculation of 17 canonical e-commerce business metrics with time-grain rollups and temporal delta comparisons.
2. **Ask PRISM (Conversational Analytics)**: Bilingual (PT/EN) Natural Language to SQL and semantic intent pipeline strictly bounded by AST validation and schema allowlists.
3. **Dynamic Visualization Engine**: Deterministic mapping of analytical semantics into optimal charts (Metric Cards, Area, Line, Vertical/Horizontal Bar, Donut, and Data Tables) with complete provenance explanations.
4. **PRISM Voice**: Ambient bidirectional voice querying with Web Speech API integration, real-time audio wave feedback, and zero-compromise security equivalence.
5. **Proactive Insights & Anomaly Detection**: Statistical anomaly discovery scanning device conversion drops, category surges, and regional disparities without reading hidden ground-truth metadata.
6. **Enterprise Data Provider Architecture**: Pluggable provider abstraction for Embedded DuckDB OLAP, PostgreSQL / Neon, and Google BigQuery.

---

## 2. End-to-End System Architecture

```
                    ┌────────────────────────────────────────────────────────┐
                    │               PRISM PRESENTATION LAYER                 │
                    │   Executive Dashboard • Data Explorer • Ask PRISM      │
                    │      Insights Feed • Dynamic Visualization • Voice     │
                    └───────────────────────────┬────────────────────────────┘
                                                │ TypeScript / SSE / REST
                                                ▼
                    ┌────────────────────────────────────────────────────────┐
                    │               SEMANTIC INTENT & VOICE GATE             │
                    │   Intent Resolver • Context Machine • AST Validator    │
                    │        Zero-Injection Sandbox • Schema Allowlist       │
                    └───────────────────────────┬────────────────────────────┘
                                                │ Validated AnalyticsQuery
                                                ▼
                    ┌────────────────────────────────────────────────────────┐
                    │            DETERMINISTIC ANALYTICS ENGINE              │
                    │   Semantic Metric Registry • Temporal Comparison       │
                    │        Time-Grain Rollups • Vectorized Filters         │
                    └───────────────────────────┬────────────────────────────┘
                                                │ Vectorized Execution
                                                ▼
                    ┌────────────────────────────────────────────────────────┐
                    │              DATA WAREHOUSE / OLAP LAYER               │
                    │   DuckDB (Embedded) • PostgreSQL/Neon • BigQuery       │
                    │   10k Customers • 15k Orders • 369k Sessions           │
                    └────────────────────────────────────────────────────────┘
```

---

## 3. Key Platform Capabilities

### A. Executive Overview (`/`)
- Four primary executive KPI cards with comparison deltas: **Gross Revenue**, **Orders**, **Conversion Rate**, and **Average Order Value**.
- Full-fidelity revenue time-series trajectory with previous period overlays.
- Category distribution charts and regional revenue breakdown.
- Multi-step E-Commerce Conversion Funnel (*Store Sessions $\rightarrow$ Product Views $\rightarrow$ Cart Adds $\rightarrow$ Checkouts $\rightarrow$ Purchases*).

### B. Conversational Analytics — Ask PRISM (`/ask`)
- Natural-language business inquiries in Portuguese and English.
- Multi-turn conversation state machine preserving active date windows, dimensions, and filter contexts.
- Automated ranking semantics (mapping "melhor/top" to `DESC` and "pior/menor" to `ASC`).
- Real-time Query Inspector exposing raw engine execution times and generated analytical plans.

### C. Dynamic Visualization Engine
- Runtime validated `VisualizationSpec` ensuring zero arbitrary frontend JavaScript execution.
- Deterministic semantic decision engine:
  - Single Metric $\rightarrow$ KPI Stat Card
  - Time Series (Volume) $\rightarrow$ Area Chart
  - Time Series (Rates/Percentages) $\rightarrow$ Line Chart
  - Categorical Comparison $\rightarrow$ Vertical Bar Chart
  - Ranked Entities $\rightarrow$ Horizontal Bar Chart
  - Small Composition ($\le 8$ items) $\rightarrow$ Donut Chart
  - High-Cardinality Results ($> 10$ records) $\rightarrow$ Tabular View
- Interactive Decision Provenance explanation toggle on every chart.

### D. PRISM Voice
- Natural voice-to-data interaction with Speech-to-Text and Text-to-Speech provider interfaces.
- Real-time listening feedback, live transcription preview, and speech synthesis mute toggle.
- Untrusted voice input flows through the exact same AST and allowlist security pipeline as typed text.

### E. Proactive Insights & Anomaly Detection (`/insights`)
- Autonomous detection of statistically meaningful shifts:
  - **Severe Conversion Drop**: Identifies Mobile iOS conversion anomalies against historical baselines.
  - **Category Outperformance**: Uncovers product category revenue spikes.
  - **Campaign Efficiency Breakouts**: Highlights high-ROAS promotional campaigns.
  - **Regional Contribution Disparities**: Flags lagging geographic markets.
- Strict empirical separation of **Observation** (data evidence) from **Hypothesis** (potential root causes).
- One-click "Investigate with PRISM" workflow linking directly to `/ask`.

### F. Data Explorer (`/explorer`)
- High-performance exploration of all 6 canonical entities: `customers`, `products`, `orders`, `order_items`, `sessions`, `campaigns`.
- Server-side multi-column sorting, pagination, search, filter operators, and secure CSV exports.

### G. Data Sources & Warehouse Integration (`/sources`)
- Transparent connection status, latency monitoring, and schema discovery across **DuckDB**, **PostgreSQL / Neon**, and **Google BigQuery**.
- Strict zero-credential leakage architecture.

---

## 4. Canonical Dataset & Metric Registry

The platform operates on a reproducible synthetic E-commerce data mart:

| Entity | Record Count | Primary Key | Key Dimensions & Attributes |
| :--- | :--- | :--- | :--- |
| **Customers** | 10,000 | `customer_id` | Region, State, City, Customer Segment |
| **Products** | 363 | `product_id` | SKU, Category, Subcategory, Unit Cost, Base Price |
| **Orders** | 15,277 | `order_id` | Gross/Net Revenue, Discounts, Payment Method, Channel, Device |
| **Order Items** | 23,313 | `item_id` | Quantity, Unit Price, Unit Cost, Total Item Revenue |
| **Sessions** | 369,066 | `session_id` | Device Type, Browser, Channel, Funnel Milestones, Converted |
| **Campaigns** | 14 | `campaign_id` | Budget, Actual Spend, Channel, Target Category, Dates |

### Canonical Semantic Metrics
- `gross_revenue` • `net_revenue` • `orders` • `average_order_value`
- `sessions` • `conversion_rate` • `cart_abandonment_rate` • `units_sold`
- `total_customers` • `new_customers` • `returning_customers`
- `gross_margin` • `gross_margin_rate` • `revenue_per_customer` • `revenue_per_session` • `roas`

---

## 5. Security & Governance Model

PRISM enforces enterprise-grade security invariants across all interfaces:
1. **Strict Read-Only Enforcement**: Query validator strictly rejects all SQL DDL/DML mutation keywords (`DROP`, `DELETE`, `UPDATE`, `INSERT`, `ALTER`, `TRUNCATE`, `ATTACH`, `COPY`).
2. **AST Schema Allowlist**: Every metric and dimension is validated against canonical allowlists before compilation.
3. **Execution Guardrails**: Mandatory hard `LIMIT` injection (max 1,000 rows) and query execution timeouts (5,000ms max).
4. **Prompt & Adversarial Injection Barriers**: Sanitizes prompt injection attacks, path traversal probes, and secret extraction attempts.
5. **Zero Secret Leakage**: API credentials, connection strings, and tokens are strictly environment-isolated and never delivered to client bundles.

---

## 6. Getting Started & Local Setup

### Prerequisites
- Node.js >= 18.18 (Node 20+ recommended)
- Python >= 3.11 (for backend Python DuckDB services)
- npm >= 9.0

### Installation & Execution

```bash
# 1. Clone repository and install dependencies
git clone https://github.com/your-username/prism-bi-platform.git
cd "PRISM — Business Intelligence Platform"
npm install

# 2. Run Quality Gates & Full Verification Matrix
npm run test:ask
npm run test:visualization
npm run test:voice
npm run test:insights
npm run test:data-providers
npm run test:hardening
npm run typecheck
npm run lint

# 3. Launch the Local Development Server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to experience the full interactive platform.

---

## 7. Verification Test Suite Commands

```bash
# Conversational Analytics & Intent Security Suite (11 Scenarios + Context Tests)
npm run test:ask

# Dynamic Visualization Decision Engine & Value Preservation Suite
npm run test:visualization

# Voice System, STT/TTS Providers & Security Equivalence Suite
npm run test:voice

# Proactive Statistical Insights & Anomaly Detection Suite
npm run test:insights

# Cloud Data Providers (DuckDB, Postgres, BigQuery) & Catalog Suite
npm run test:data-providers

# Production Hardening, SLA Benchmarks, & Healthcheck Suite
npm run test:hardening

# Data Model Validation & Integrity Suite
npm run validate:data

# Full Typecheck, Lint, and Production Build
npm run typecheck
npm run lint
npm run build
```

---

## 8. Portfolio & Project Summary

- **Architecture**: Decoupled Layered Architecture (Next.js App Router + Python DuckDB Semantic Engine).
- **Domain**: Modern E-Commerce Business Intelligence & Conversational Analytics.
- **Key Engineering Highlights**:
  - Zero mathematical divergence between raw database and natural language answers.
  - Zero dynamic `eval()` or unsanitized JavaScript rendering in charts.
  - Statistical anomaly detection completely isolated from test ground truth.
  - Sub-100ms analytical aggregation over hundreds of thousands of sessions.
