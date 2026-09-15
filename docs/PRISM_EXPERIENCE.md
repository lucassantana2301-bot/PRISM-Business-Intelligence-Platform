# PRISM — Cinematic Product Experience Blueprint

> **PRISM — Business Intelligence Platform**  
> Narrative Architecture, Motion Choreography, PRISM Core Mathematics, and Transition Engineering  
> Tagline: *Ask. Understand. Decide.*

---

## 1. Executive Summary & Narrative Philosophy

PRISM exists because modern organizations do not suffer from a deficit of raw data; they suffer from a deficit of clarity. Enterprisewide telemetry produces millions of disconnected rows, event streams, and metrics every day. Without an intelligent semantic and computational core, raw data generates cognitive overload.

The **PRISM Cinematic Product Experience** is an interactive, scroll-driven technological story that communicates the journey of information through PRISM:

$$\text{RAW DATA} \longrightarrow \text{CONTEXT} \longrightarrow \text{UNDERSTANDING} \longrightarrow \text{DECISION}$$

It is not a generic SaaS landing page. It is an Awwwards-caliber digital experience designed with deep midnight tones, editorial monospace typography, an interactive mathematical **PRISM CORE**, and a physicalized transition into the production dashboard.

---

## 2. Route Architecture & Shell Isolation

```
/                → PRISM Cinematic Experience (Full-viewport canvas & scroll director)
/dashboard       → Executive Overview Dashboard (Canonical DuckDB KPIs & charts)
/analytics       → Multi-dimensional Analytics Workspace
/explorer        → Virtualized Data Explorer
/insights        → Telemetry & Statistical Anomaly Feed
/ask             → Natural Language & Voice Intelligence HUD
/sources         → Data Sources & Catalog Health
```

### Protection Boundary:
- `AppShell` detects route context:
  - On `/`: AppShell renders a minimal, ultra-clean viewport with zero navigation chrome to preserve cinematic focus.
  - On `/dashboard`, `/analytics`, `/explorer`, `/insights`, `/ask`, `/sources`: AppShell renders the full standard dark terminal shell (collapsible sidebar, command palette, tenant switcher, topbar).
- Zero changes to analytical contracts (`apps/web/lib/contracts/*`) or DuckDB aggregation services.

---

## 3. The 8 Narrative Acts

### Act 01 — The PRISM (The Awakening)
- **Environment**: Deep midnight background (`#07090E`), subtle grid coordinates, quiet confidence.
- **Editorial Typography**: Large display hierarchy: `PRISM`, `BUSINESS INTELLIGENCE PLATFORM`, `ASK. UNDERSTAND. DECIDE.`
- **Protagonist**: The **PRISM CORE** in a dormant state, gently refracting ambient light vectors and reacting to cursor parallax and scroll velocity.
- **CTA**: Minimalist scroll anchor: `SCROLL TO UNDERSTAND ↓` with an instant bypass `DIRECT ACCESS →`.

### Act 02 — The Problem (Data Chaos)
- **Environment**: Order disintegrates as scrolling progresses. Floating matrices of raw transactions, JSON payloads, timestamps, conversion drop-offs, and metrics cloud the viewport.
- **Story Statement**:
  - *"Companies don't lack data."*
  - *(scroll pause)*
  - *"They lack clarity."*
- **Climax**: Sudden visual freeze. Floating noise halts; atmospheric silence returns; the PRISM CORE re-emerges in sharp focus.

### Act 03 — From Noise to Signal (Transformation)
- **Concept**: *"DATA IS NOT THE ANSWER. UNDERSTANDING IS."*
- **Choreography**: Scattered data particles and raw telemetry converge into the facets of the PRISM CORE.
- **Emergence**: Refracted internal light decomposes disordered noise into ordered spectral beams representing pure semantic signals (Revenue, Orders, Conversion, AOV).

### Act 04 — Ask (Natural Language Intelligence)
- **Concept**: Querying data using natural human intent without cognitive translation into raw SQL.
- **Typographic Anchor**: `ASK.`
- **Simulation**: Query input simulation: *"Why did revenue drop this month?"*
- **5-Stage Pipeline Visualization**:
  $$\text{QUESTION} \longrightarrow \text{DATA CONTEXT} \longrightarrow \text{SEMANTIC ANALYSIS} \longrightarrow \text{COMPUTATION} \longrightarrow \text{EVIDENCE}$$
- Restrained, crisp terminal-style execution telemetry without artificial gimmicks.

### Act 05 — Understand (The Analytical Engine)
- **Concept**: Visualizing the high-performance local-first computation engine.
- **Typographic Anchor**: `UNDERSTAND.`
- **Spatial Engine Map**:
  - Raw Parquet Data Mart $\rightarrow$ In-Memory DuckDB OLAP $\rightarrow$ Metric Catalog $\rightarrow$ Dimensional Relationships $\rightarrow$ Synthesized Insights.
- **Live Metric Reconciliation**: Anchored to real dataset metrics ($865.3K Gross Revenue, 771 Orders, 4.23% Conversion, $1,092.46 AOV).

### Act 06 — Decide (Executive Clarity)
- **Concept**: Analysis collapses into decisive action.
- **Typographic Anchor**: `DECIDE.`
- **Clarity Collapse**: Dimensional complexity converges into two crystal-clear executive directives with real deltas ($865K Revenue, 4.23% Conversion).
- **Core Truth**: *"Millions of data points. One clear decision."*

### Act 07 — Built Different (Engineering Philosophy)
- **Heading**: `BUILT FOR UNDERSTANDING.`
- **System Architecture**:
  1. Data Ingestion & Schema Allowlist
  2. Embedded DuckDB OLAP Engine
  3. Semantic Layer & Metric Formulas
  4. Provider-Agnostic LLM Protocol
  5. Executive Presentation Terminal
- **Verifiable Tenets**: *Fast by design. Local-first analytics. Explorable by humans. Queryable by language. Built for decisions.*

### Act 08 — Enter PRISM (The Gateway)
- **Environment**: Atmospheric convergence into the central PRISM CORE.
- **Statement**: `TURN INFORMATION INTO UNDERSTANDING.`
- **Primary CTA**: `ENTER PRISM →`
- **Warp Transition**: Upon trigger, the PRISM CORE expands along the camera z-axis. Optical refraction spreads across the viewport, morphing the dark cinematic space into the live application dashboard at `/dashboard`.

---

## 4. PRISM CORE Mathematical & Rendering Engine

The PRISM CORE is rendered on a hardware-accelerated 2D/3D projection Canvas (`PrismCoreCanvas.tsx`) using vector matrix transformations, internal refraction raytracing, and particle convergence dynamics.

### Mathematical Foundations:
- **Geometry**: 3D Double-Pyramid Octahedron / Polyhedral Crystal with 6 vertices and 8 triangular facets.
- **Projection**: Perspective camera projection with focal length $f = 600\text{px}$:
  $$x' = \frac{x \cdot f}{z + d} + x_c, \quad y' = \frac{y \cdot f}{z + d} + y_c$$
- **Rotation Matrices**:
  $$\mathbf{R}_y(\theta) = \begin{bmatrix} \cos\theta & 0 & \sin\theta \\ 0 & 1 & 0 \\ -\sin\theta & 0 & \cos\theta \end{bmatrix}, \quad \mathbf{R}_x(\phi) = \begin{bmatrix} 1 & 0 & 0 \\ 0 & \cos\phi & -\sin\phi \\ 0 & \sin\phi & \cos\phi \end{bmatrix}$$
- **Refraction & Dispersion**: Snell's Law approximation for internal chromatic aberration:
  $$\text{Ray}_{\text{spectral}} = \mathbf{V}_{\text{incident}} + \eta_{\lambda} \cdot \mathbf{N}$$
  Where $\eta_{\lambda}$ varies across Red ($650\text{nm}$), Green ($530\text{nm}$), and Blue ($460\text{nm}$).
- **Particle System**: 120-240 autonomous telemetry particles undergoing Lorentz-inspired gravitational attraction toward the PRISM core center:
  $$\mathbf{F}_{\text{attract}} = \frac{G \cdot M}{||\mathbf{r}||^2} \hat{\mathbf{r}} + \mathbf{v} \times \mathbf{B}$$

---

## 5. Performance Tiers & Adaptive Quality

| Feature | Tier 1 (High GPU) | Tier 2 (Medium / Mobile) | Tier 3 (Low / Reduced Motion) |
| :--- | :--- | :--- | :--- |
| **Particle Count** | 200 convergence particles | 80 convergence particles | 20 static/smooth particles |
| **Refraction Rays** | 12 chromatic dispersion beams | 6 primary dispersion beams | 3 crisp vector beams |
| **Canvas Resolution** | Native DevicePixelRatio (up to 2x) | Clamped to 1.5x Dpi | Clamped to 1.0x Dpi |
| **Warp Transition** | Full optical zoom & particle bloom | CSS scale & opacity crossfade | Instant clean navigation |
| **Prefers Reduced Motion** | Automatic step progression | Automatic step progression | Zero transform motion, direct fade |

---

## 6. Accessibility & Keyboard Support

- Standard HTML5 semantic landmark structure (`<main>`, `<section>`, `<article>`, `<header>`, `<nav>`).
- Keyboard controls:
  - `Space` / `Down Arrow` / `Page Down`: Progress through narrative acts.
  - `Up Arrow` / `Page Up`: Return to preceding act.
  - `Enter` or `Tab + Enter`: Trigger `ENTER PRISM →` transition.
  - `Escape` or `Bypass Link`: Immediate skip to `/dashboard`.
- Screen-reader text announcements for active narrative act headlines.
- Full color contrast compliance ($> 4.5:1$) for all editorial statements and UI controls.

---

## 7. Multi-Agent Engineering Protocol

- **Antigravity (Lead Orchestrator)**: Implements master canvas math, route architecture, formatters, and full integration verification.
- **Claude (Architecture & Storytelling)**: Reviews narrative flow, copy precision against `docs/`, and ensures zero fabrication of technical capabilities.
- **Codex (TypeScript & Performance Gatekeeper)**: Enforces strict type boundaries, canvas memory cleanup (`cancelAnimationFrame`), zero memory leaks, and 100% test pass rate.
