# PRISM Master Specification & Product Manifesto

> **Platform**: PRISM — Business Intelligence Platform  
> **Tagline**: *Ask. Understand. Decide.*  
> **Version**: 1.0 (Foundation)

---

## 1. Product Manifesto

Traditional Business Intelligence tools are heavy, static, and disconnected from the natural cadence of decision-makers. They force executives and analysts to navigate labyrinthine dashboards or wait days for data engineering teams to produce new slices of data.

**PRISM** reimagines BI as an ambient, intelligent, and instantaneous partner:
1. **Ask**: Natural queries via text or low-latency voice, parsed into rigorous semantic intents.
2. **Understand**: Instantaneous synthesis of dimensional analytics, correlation analysis, and automated anomaly detection.
3. **Decide**: High-density, crystal-clear visualizations and executive summaries built for rapid cognitive consumption.

PRISM is **not** a toy chatbot or a static template dashboard; it is an enterprise-grade Data Intelligence Platform that pairs rigorous analytical engines with secure, bounded conversational AI.

---

## 2. Core Pillars & User Experience

```
┌────────────────────────────────────────────────────────┐
│                      PRISM CORE                        │
├───────────────────┬───────────────────┬────────────────┤
│   Executive View  │     Analytics     │ Data Explorer  │
│   (KPI Command)   │  (Deep Slicing)   │ (Raw & Tabular)│
├───────────────────┴───────────────────┴────────────────┤
│                       INSIGHTS                         │
│       (Automated Anomaly Detection & Drivers)          │
├────────────────────────────────────────────────────────┤
│                      ASK PRISM                         │
│     (Conversational NL-to-SQL + Context Engine)        │
├────────────────────────────────────────────────────────┤
│                     PRISM VOICE                        │
│          (Ambient Bidirectional Audio AI)              │
└────────────────────────────────────────────────────────┘
```

### Key Functional Domains
- **Executive Overview**: Immediate pulse of the business with real-time KPI cards (Revenue, Orders, AOV, Conversion, Active Customers), temporal deltas, and micro-sparklines.
- **Deep Analytics**: Multi-dimensional slicing across Time, Geography, Product Category, Channel, Device, and Campaigns.
- **Data Explorer**: High-performance virtualized grid for raw record inspection with instant filtering, column projection, and export.
- **Autonomous Insights**: Algorithmic detection of revenue drops, spike anomalies, conversion bottlenecks, and regional drift.
- **Ask PRISM**: Context-aware natural language interrogation that compiles plain text into safe, optimized semantic queries.
- **PRISM Voice**: Hands-free executive interrogation workflow supporting contextual follow-ups ("*How were sales this week?*" → "*Compare with last week*" → "*What caused the drop in Southeast?*").

---

## 3. Guiding Architectural Tenets

1. **Information Density with Zero Visual Noise**: Clean lines, monospace tabular data, crisp micro-charts, and zero gratuitous decoration.
2. **Safe & Bounded Autonomy**: The LLM never touches raw database execution directly; queries pass through a deterministic Semantic Layer and AST Security Guardrail.
3. **Multi-Turn Context Continuity**: Follow-up questions inherit active dimensions, date filters, and subject entities seamlessly.
4. **Scale-Aware Aggregations**: Raw transactional logs are pre-aggregated or summarized via vectorized engines (DuckDB / PostgreSQL / BigQuery); payloads to browsers and LLMs remain lean and ultra-fast.
