# PRISM Design System & Aesthetic Blueprint

> **PRISM — Business Intelligence Platform**  
> Visual Direction: Minimalist Dark Terminal, Data-First, Linear/Stripe/Vercel-inspired Precision.

---

## 1. Aesthetic Philosophy

PRISM's interface is engineered for cognitive clarity and high-density analytical reasoning. It avoids flashy gamer visuals, neon glow saturations, and template clutter in favor of an institutional, high-precision aesthetic.

### Principles:
- **Data-First Hierarchy**: The data is the hero. Container borders and backgrounds are subtle and muted to let metric values and trend charts command attention.
- **Monospace Precision**: Monospace numerical typography (`Geist Mono`, `JetBrains Mono`, or `Roboto Mono`) ensures columnar alignment and instant visual scanning of financial values.
- **Micro-Interactions over Heavy Animations**: Tooltips appear instantly without lag; chart hover cursors are crisp; cards have subtle hover states (`border-zinc-700/80` and subtle elevation).

---

## 2. Color Palette & Semantic Tokens

```
Canvas / Deep Background:   #090A0F  (prism-bg-canvas)
Surface / Card Background:  #11131A  (prism-bg-card)
Elevated / Dropdown:        #181B24  (prism-bg-elevated)
Subtle Border:              #232733  (prism-border-subtle)
Hover Border:               #363D4F  (prism-border-hover)

Text Primary (Values):      #F8FAFC  (prism-text-primary)
Text Secondary (Labels):    #94A3B8  (prism-text-secondary)
Text Muted (Micro-text):    #64748B  (prism-text-muted)

Accents:
- Primary Brand / Intent:   #3B82F6  (prism-blue - restrained electric blue)
- Positive / Growth Delta:  #10B981  (prism-emerald - subtle green)
- Negative / Anomaly Delta: #EF4444  (prism-rose - muted warning red)
- Warning / Attention:      #F59E0B  (prism-amber)
- Neutral Trend / Slices:   #8B5CF6, #06B6D4, #EC4899
```

---

## 3. Typography Hierarchy

| Level | Size | Weight | Font Family | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Display KPI** | `28px - 32px` | `600 / SemiBold` | Mono / Sans | Main Metric Values (`$1,429,820`) |
| **Card Header** | `13px - 14px` | `500 / Medium` | Sans | Widget & Section Titles ("Total Revenue") |
| **Body & Labels**| `12px - 13px` | `400 / Regular` | Sans | Metric Subtitles, Dimension Filters |
| **Micro Data / Delta** | `11px - 12px` | `500 / Medium` | Mono | +14.2% MoM, Timestamp indicators |

---

## 4. UI Component Patterns

### A. Executive KPI Card
- **Header**: Label with subtle icon + time filter indicator.
- **Value**: Monospace numerical display with formatted currency/units.
- **Delta Indicator**: Crisp pill tag displaying percentage change vs. prior period ($\uparrow 12.4\%$ in emerald or $\downarrow 3.1\%$ in rose).
- **Sparkline**: Ultra-compact 7-day or 30-day mini area/line chart embedded at the base with smooth gradient fill.

### B. Chart Standardization (Recharts)
- Gridlines: dashed `stroke="#1e2230"`, strokeDasharray `3 3`.
- Tooltip: Custom dark-themed popover (`bg-zinc-900 border border-zinc-800 text-xs shadow-2xl`).
- Lines / Bars: Crisp strokes (`strokeWidth: 2`), restrained radius for bar charts (`radius: [4, 4, 0, 0]`).

---

## 5. Anti-Patterns (Strictly Prohibited)

- ❌ **No heavy glassmorphism** with high blur and transparent text that hinders legibility.
- ❌ **No neon gradients** or rainbow charts with 15 jarring colors.
- ❌ **No slow or bouncy animations** that delay analytical perception.
- ❌ **No layout shifts** during data re-fetches; use skeleton loaders matching exact layout dimensions.
