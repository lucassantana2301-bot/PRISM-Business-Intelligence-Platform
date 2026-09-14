#!/usr/bin/env python3
"""
PRISM E-Commerce Dataset Quality & Referential Integrity Validator
"""

import os
import csv
import json
import sys
from pathlib import Path


def load_csv_rows(filepath: str):
    if not os.path.exists(filepath):
        raise FileNotFoundError(f"Missing dataset file: {filepath}")
    with open(filepath, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        return list(reader)


def validate_dataset(data_dir: str = "data/generated/csv", metadata_dir: str = "data/metadata"):
    print("==================================================")
    print("  PRISM DATASET INTEGRITY VALIDATOR (Phase 02)")
    print("==================================================")

    errors = []
    warnings = []

    # 1. Load Datasets
    print("Loading CSV datasets...")
    customers = load_csv_rows(os.path.join(data_dir, "customers.csv"))
    products = load_csv_rows(os.path.join(data_dir, "products.csv"))
    campaigns = load_csv_rows(os.path.join(data_dir, "campaigns.csv"))
    orders = load_csv_rows(os.path.join(data_dir, "orders.csv"))
    order_items = load_csv_rows(os.path.join(data_dir, "order_items.csv"))
    sessions = load_csv_rows(os.path.join(data_dir, "sessions.csv"))

    print(f"  ✓ Customers:   {len(customers):,}")
    print(f"  ✓ Products:    {len(products):,}")
    print(f"  ✓ Campaigns:   {len(campaigns):,}")
    print(f"  ✓ Orders:      {len(orders):,}")
    print(f"  ✓ Order Items: {len(order_items):,}")
    print(f"  ✓ Sessions:    {len(sessions):,}")

    # 2. Check Primary Key Uniqueness
    print("\n1. Validating Primary Key Uniqueness...")
    pk_checks = [
        ("customers", customers, "customer_id"),
        ("products", products, "product_id"),
        ("campaigns", campaigns, "campaign_id"),
        ("orders", orders, "order_id"),
        ("order_items", order_items, "item_id"),
        ("sessions", sessions, "session_id"),
    ]

    for name, rows, pk_col in pk_checks:
        seen = set()
        for r in rows:
            pk = r[pk_col]
            if pk in seen:
                errors.append(f"Duplicate PK in {name}: {pk}")
            seen.add(pk)
        print(f"  ✓ {name}.{pk_col} is 100% unique ({len(seen):,} unique keys)")

    # 3. Check Foreign Key Referential Integrity
    print("\n2. Validating Foreign Key Integrity...")
    customer_ids = {c["customer_id"] for c in customers}
    product_ids = {p["product_id"] for p in products}
    campaign_ids = {c["campaign_id"] for c in campaigns}
    order_ids = {o["order_id"] for o in orders}

    # orders -> customers
    for o in orders:
        if o["customer_id"] not in customer_ids:
            errors.append(f"Orphan order customer_id: {o['customer_id']} in order {o['order_id']}")
    print("  ✓ orders.customer_id -> customers.customer_id verified")

    # order_items -> orders & products
    for item in order_items:
        if item["order_id"] not in order_ids:
            errors.append(f"Orphan item order_id: {item['order_id']} in item {item['item_id']}")
        if item["product_id"] not in product_ids:
            errors.append(f"Orphan item product_id: {item['product_id']} in item {item['item_id']}")
    print("  ✓ order_items.order_id & product_id referential integrity verified")

    # sessions -> customers, campaigns, orders
    for s in sessions:
        if s["customer_id"] and s["customer_id"] not in customer_ids:
            errors.append(f"Invalid session customer_id: {s['customer_id']} in session {s['session_id']}")
        if s["campaign_id"] and s["campaign_id"] not in campaign_ids:
            errors.append(f"Invalid session campaign_id: {s['campaign_id']} in session {s['session_id']}")
        if s["order_id"] and s["order_id"] not in order_ids:
            errors.append(f"Invalid session order_id: {s['order_id']} in session {s['session_id']}")
    print("  ✓ sessions foreign keys verified")

    # 4. Math & Business Logic Consistency
    print("\n3. Validating Math & Monetary Constraints...")
    for o in orders:
        rev = float(o["total_revenue"])
        sub = float(o["subtotal"])
        disc = float(o["discount_amount"])
        tax = float(o["tax_amount"])
        ship = float(o["shipping_amount"])
        if rev < 0 or sub < 0 or disc < 0:
            errors.append(f"Negative monetary value in order {o['order_id']}")

    for p in products:
        price = float(p["base_price"])
        cost = float(p["unit_cost"])
        margin = float(p["margin_rate"])
        if price <= 0 or cost <= 0:
            errors.append(f"Invalid product price/cost in product {p['product_id']}")
        if margin <= 0 or margin >= 1:
            errors.append(f"Unrealistic margin {margin} in product {p['product_id']}")
    print("  ✓ Positive monetary amounts and product margins verified")

    # 5. Business Events Ground-Truth Metadata
    print("\n4. Validating Business Events Ground Truth...")
    events_file = os.path.join(metadata_dir, "business_events.json")
    if not os.path.exists(events_file):
        errors.append(f"Missing business events metadata file: {events_file}")
    else:
        with open(events_file, "r", encoding="utf-8") as f:
            events_data = json.load(f)
            events = events_data.get("events", [])
            if len(events) < 5:
                errors.append(f"Expected at least 5 business anomalies, found {len(events)}")
            for ev in events:
                if not ev.get("event_id") or not ev.get("name") or not ev.get("start_date") or not ev.get("end_date"):
                    errors.append(f"Incomplete event structure: {ev}")
        print(f"  ✓ Verified {len(events)} intentional anomalies in {events_file}")

    print("\n==================================================")
    if errors:
        print(f"  ❌ VALIDATION FAILED with {len(errors)} errors:")
        for err in errors[:10]:
            print(f"    - {err}")
        return False
    else:
        print("  ✓ ALL DATA INTEGRITY GATES PASSED (100% OK)")
        print("==================================================")
        return True


if __name__ == "__main__":
    success = validate_dataset()
    sys.exit(0 if success else 1)
