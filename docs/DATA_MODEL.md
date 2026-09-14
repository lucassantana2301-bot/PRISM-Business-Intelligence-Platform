# E-Commerce Conceptual Data Model & Metric Catalog

> **PRISM — Business Intelligence Platform**  
> Foundational Schema, Dimensions, and Canonical Metric Formulations

---

## 1. Entity-Relationship Model (Conceptual)

```mermaid
erDiagram
    CUSTOMERS ||--o{ ORDERS : places
    CUSTOMERS ||--o{ SESSIONS : initiates
    ORDERS ||--|{ ORDER_ITEMS : contains
    PRODUCTS ||--o{ ORDER_ITEMS : included_in
    CAMPAIGNS ||--o{ SESSIONS : drives
    CAMPAIGNS ||--o{ ORDERS : attributes

    CUSTOMERS {
        string customer_id PK
        string full_name
        string email
        string region
        string state
        string city
        string customer_segment
        timestamp created_at
    }

    PRODUCTS {
        string product_id PK
        string sku
        string title
        string category
        string subcategory
        decimal unit_cost
        decimal base_price
        boolean is_active
    }

    ORDERS {
        string order_id PK
        string customer_id FK
        string campaign_id FK
        string status
        decimal subtotal
        decimal discount_amount
        decimal tax_amount
        decimal shipping_amount
        decimal total_revenue
        string payment_method
        string channel
        timestamp order_date
    }

    ORDER_ITEMS {
        string item_id PK
        string order_id FK
        string product_id FK
        int quantity
        decimal unit_price
        decimal total_item_revenue
    }

    SESSIONS {
        string session_id PK
        string customer_id FK
        string campaign_id FK
        string device_type
        string browser
        string landing_page
        int duration_seconds
        int page_views
        boolean has_cart_add
        boolean has_checkout
        boolean is_converted
        timestamp session_start
    }

    CAMPAIGNS {
        string campaign_id PK
        string campaign_name
        string channel
        string campaign_type
        decimal budget
        decimal spend
        timestamp start_date
        timestamp end_date
    }
```

---

## 2. Core Dimensions

| Dimension | Description | Cardinality / Examples |
| :--- | :--- | :--- |
| **Time** | `order_date`, `session_start` | Hourly, Daily, Weekly, Monthly, Quarterly, Yearly |
| **Customer** | `customer_segment`, `customer_id` | VIP, Regular, At-Risk, Churned, New |
| **Product & Category**| `category`, `subcategory`, `product_id`| Electronics, Apparel, Home & Living, Beauty |
| **Geography / Region**| `region`, `state`, `city` | Southeast (SP, RJ, MG), South (RS, SC, PR), Northeast, etc. |
| **Channel / Source** | `channel` | Organic Search, Paid Ads, Social, Email, Direct, Affiliate |
| **Device & Client** | `device_type`, `browser` | Mobile (iOS, Android), Desktop, Tablet |
| **Campaign** | `campaign_name`, `campaign_type` | Black Friday, Summer Launch, Retargeting |

---

## 3. Canonical Metric Formulations (Semantic Definitions)

### A. Revenue & Monetization
- **Gross Revenue**:
  $$\text{Gross Revenue} = \sum (\text{item\_price} \times \text{quantity})$$
- **Net Revenue**:
  $$\text{Net Revenue} = \sum (\text{total\_revenue} - \text{discount\_amount} - \text{refunds})$$
- **Average Order Value (AOV)**:
  $$\text{AOV} = \frac{\text{Net Revenue}}{\text{Total Orders Completed}}$$

### B. Conversion & Funnel
- **Overall Conversion Rate**:
  $$\text{CR} = \frac{\text{Total Converted Sessions}}{\text{Total Sessions}} \times 100$$
- **Cart Abandonment Rate**:
  $$\text{Cart Abandonment} = \left(1 - \frac{\text{Sessions with Completed Order}}{\text{Sessions with Cart Add}}\right) \times 100$$

### C. Customer Acquisition & Retention
- **New vs. Returning Ratio**:
  $$\text{New Customer Ratio} = \frac{\text{Orders from Customers with First Order in Period}}{\text{Total Orders}}$$
- **Customer Lifetime Value (LTV - 90d / 360d)**:
  $$\text{LTV} = \text{Average Revenue per Customer} \times \text{Average Purchase Frequency}$$

---

## 4. Query Efficiency & Rollup Strategy

To guarantee millisecond dashboard responsiveness:
1. **Raw Layer**: Granular transactional tables (`orders`, `order_items`, `sessions`).
2. **Aggregated Daily Marts (`marts.daily_sales_rollup`)**: Pre-aggregated metrics grouped by `date`, `category`, `region`, `channel`, `device_type`.
3. **Semantic Layer Abstraction**: Queries from Ask PRISM and the Executive View query the rollup marts first, falling back to granular tables only when drill-down predicates require item-level specifics.
