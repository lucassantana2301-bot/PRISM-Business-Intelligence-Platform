# PRISM E-Commerce Dataset Specification & Generation Guide

> **PRISM — Business Intelligence Platform**  
> Synthetic E-Commerce Dataset Specification (Phase 02 Baseline)

---

## 1. Overview & Reproducibility

The PRISM E-Commerce dataset is a statistically coherent, reproducible synthetic transactional dataset engineered specifically to support realistic business intelligence operations, dimensional slicing, funnel analysis, and automated anomaly detection.

### Core Parameters
- **Deterministic Seed**: `42`
- **Time Window**: 18 Months (May 01, 2025 to October 31, 2026)
- **Market Context**: Brazilian E-Commerce
- **Currency**: BRL / USD normalized
- **Location**: `data/generated/csv/`
- **Ground Truth Metadata**: `data/metadata/business_events.json`

---

## 2. Relational Scale & Record Counts

| Entity Table | Primary Key | Total Records | File Location | Key Foreign Relationships |
| :--- | :--- | :--- | :--- | :--- |
| **`customers.csv`** | `customer_id` | **10,000** | `data/generated/csv/customers.csv` | - |
| **`products.csv`** | `product_id` | **363** | `data/generated/csv/products.csv` | - |
| **`campaigns.csv`** | `campaign_id` | **14** | `data/generated/csv/campaigns.csv` | - |
| **`orders.csv`** | `order_id` | **15,277** | `data/generated/csv/orders.csv` | `customer_id`, `campaign_id` |
| **`order_items.csv`** | `item_id` | **23,313** | `data/generated/csv/order_items.csv` | `order_id`, `product_id` |
| **`sessions.csv`** | `session_id` | **369,066** | `data/generated/csv/sessions.csv` | `customer_id`, `campaign_id`, `order_id` |

---

## 3. Entity Schemas

### A. Customers (`customers.csv`)
- `customer_id` (PK, e.g. `CUST-00001`)
- `full_name` (Synthetic non-PII Brazilian name)
- `email` (Synthetic email)
- `region` (Southeast, South, Northeast, Central-West, North)
- `state` (SP, RJ, MG, RS, PR, SC, BA, PE, CE, DF, GO, AM, etc.)
- `city` (São Paulo, Rio de Janeiro, Curitiba, etc.)
- `customer_segment` (`Regular`, `VIP / High-LTV`, `Bargain Hunter`, `At-Risk`)
- `created_at` (Registration timestamp)

### B. Products (`products.csv`)
- `product_id` (PK, e.g. `PROD-1001`)
- `sku` (e.g. `SKU-ELE-1001`)
- `title` (Product title)
- `category` (Electronics, Home & Living, Beauty & Health, Fashion & Apparel, Sports & Outdoors, Gaming & Tech, Accessories)
- `subcategory` (Smartphones, Skincare, Kitchen Appliances, etc.)
- `unit_cost` (Base acquisition cost)
- `base_price` (Retail selling price)
- `margin_rate` ((base_price - unit_cost) / base_price)
- `is_active` (Active inventory flag)

### C. Campaigns (`campaigns.csv`)
- `campaign_id` (PK, e.g. `CAMP-01`)
- `campaign_name` (e.g. `Black Friday Mega Weekend 2025`)
- `channel` (Paid Search, Paid Social, Email, Direct, etc.)
- `campaign_type` (Black Friday, Holiday, Seasonal Sale, Brand Awareness)
- `budget` (Allocated budget)
- `actual_spend` (Realized ad spend)
- `target_category` (Optional target category filter)
- `start_date` / `end_date`

### D. Orders (`orders.csv`)
- `order_id` (PK, e.g. `ORD-000001`)
- `customer_id` (FK -> `customers.customer_id`)
- `campaign_id` (FK -> `campaigns.campaign_id`, optional attribution)
- `status` (`Completed`, `Cancelled`)
- `subtotal` (Sum of order items revenue)
- `discount_amount` (Coupon / promotion discount)
- `tax_amount` (Applicable tax)
- `shipping_amount` (Freight amount)
- `total_revenue` (subtotal - discount + tax + shipping)
- `payment_method` (`PIX`, `Credit Card`, `Boleto`)
- `channel` (Acquisition channel)
- `device_type` (`Mobile iOS`, `Mobile Android`, `Desktop`, `Tablet`)
- `order_date` (Timestamp)

### E. Order Items (`order_items.csv`)
- `item_id` (PK, e.g. `ITEM-0000001`)
- `order_id` (FK -> `orders.order_id`)
- `product_id` (FK -> `products.product_id`)
- `quantity` (Units purchased)
- `unit_price` (Selling unit price)
- `unit_cost` (Unit cost)
- `total_item_revenue` (unit_price * quantity)
- `total_item_cost` (unit_cost * quantity)

### F. Sessions (`sessions.csv`)
- `session_id` (PK, e.g. `SESS-0000001`)
- `customer_id` (FK -> `customers.customer_id`, optional for guest)
- `campaign_id` (FK -> `campaigns.campaign_id`, optional)
- `device_type` (`Mobile iOS`, `Mobile Android`, `Desktop`, `Tablet`)
- `browser` (`Mobile Safari`, `Chrome`, `Firefox`, etc.)
- `channel` (Acquisition channel)
- `region` / `state`
- `duration_seconds`
- `page_views`
- `has_product_view` (Boolean)
- `has_cart_add` (Boolean)
- `has_checkout_start` (Boolean)
- `is_converted` (Boolean)
- `order_id` (FK -> `orders.order_id`, populated on conversion)
- `session_start` (Timestamp)

---

## 4. Intentional Business Anomalies (Ground Truth)

Located at `data/metadata/business_events.json` for validation:

1. **`EVENT-01` (Mobile iOS Gateway Degradation)**:
   - Window: `2026-10-12` to `2026-10-18`
   - Effect: Mobile iOS checkout completion rate drops by ~35% due to gateway latency.
2. **`EVENT-02` (Electronics Flash Campaign Surge)**:
   - Window: `2026-09-01` to `2026-09-08`
   - Effect: Electronics gross revenue surges +140% in Southeast (SP/RJ) with 5.2x ROAS.
3. **`EVENT-03` (Paid Social High-CAC Ad Inefficiency)**:
   - Window: `2026-07-15` to `2026-07-22`
   - Effect: Traffic doubles on Beauty & Health via Meta Ads, but conversion drops 50% (CAC up 1.4x).
4. **`EVENT-04` (Breakout Air Fryer Demand)**:
   - Window: `2026-08-01` to `2026-10-31`
   - Effect: "Digital Air Fryer 5.5L Inox" sales surge +220%, lifting category gross margin.
5. **`EVENT-05` (Cart Abandonment Friction)**:
   - Window: `2026-05-18` to `2026-05-25`
   - Effect: Cart abandonment on heavy items (>$300) increases from 72% to 86% during freight rule experiment.

---

## 5. Reproduction & Validation Commands

```bash
# Generate Dataset (TypeScript Runner)
npm run generate:data

# Validate Dataset Referential Integrity
npm run validate:data

# Generate Dataset (Python Runner)
python apps/api/scripts/generate_ecommerce_dataset.py

# Validate Dataset (Python Runner)
python apps/api/scripts/validate_dataset.py
```
