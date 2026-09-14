# Analytics & Semantic Engine Specification

> **PRISM — Business Intelligence Platform**  
> Metric Formulation, Dimensional Aggregation, Time-Grain Normalization, and Anomaly Detection

---

## 1. The Semantic Layer

The PRISM Semantic Layer sits between the raw data storage and all consumption channels (Executive Overview, Analytics Views, Data Explorer, and Ask PRISM). It standardizes metric calculations so that regardless of how a query is initiated, the numbers remain 100% consistent.

```
Raw Storage (PostgreSQL / DuckDB / BigQuery)
                      ↓
           Semantic Metric Models
  [Revenue, Orders, AOV, Conversion, LTV]
                      ↓
        Time-Grain & Slice Rollups
  [Hourly, Daily, Weekly, Monthly, Regional]
                      ↓
       Normalized Analytical Frames
                      ↓
     [API Response / Visual Component]
```

---

## 2. Dynamic Time-Grain Engine

Analytics charts require adaptive granularity depending on the selected date window:

| Date Window | Default Grain | Comparative Offset |
| :--- | :--- | :--- |
| **Today / Last 24 Hours** | Hourly | Previous Day / Same Day Last Week |
| **Last 7 Days** | Daily | Previous 7 Days |
| **Last 30 Days / MTD** | Daily | Previous 30 Days / Previous Month |
| **Last 90 Days / QTD** | Weekly | Previous 90 Days / Prior Quarter |
| **Last 365 Days / YTD** | Monthly | Previous Year (YoY) |

### Delta Calculation Rule:
$$\Delta\% = \frac{\text{Current Period Value} - \text{Comparison Period Value}}{\text{Comparison Period Value}} \times 100$$

Edge case handling: If $\text{Comparison Period Value} = 0$, return `null` or formatted `"N/A"` to prevent division by zero.

---

## 3. Scale-Aware Payload Architecture

To maintain sub-100ms UI interactions and prevent network congestion:
1. **Never ship raw transactional tables** to the browser.
2. **Pre-aggregate on the server / OLAP engine**: Only send grouped summaries (e.g., maximum 100-300 rows for time-series charts).
3. **Data Explorer Virtualization**: For row-level exploration, data is retrieved via cursor-based pagination (page size: 50 records) with server-side column projection and filter predicates.
4. **LLM Context Optimization**: When Ask PRISM queries data, only concise schema summaries and aggregated statistical results are sent to the language model.
