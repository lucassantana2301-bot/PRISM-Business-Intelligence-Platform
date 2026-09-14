"""
PRISM Deterministic E-Commerce Synthetic Dataset Generator Core
"""

import os
import csv
import json
import random
from datetime import datetime, date, timedelta
from typing import List, Dict, Any, Tuple, Optional

from .domain import Customer, Product, Order, OrderItem, Session, Campaign
from .catalog import (
    REGIONS_WEIGHTED,
    STATES_BY_REGION,
    CUSTOMER_SEGMENTS_WEIGHTED,
    FIRST_NAMES,
    LAST_NAMES,
    EMAIL_DOMAINS,
    CATEGORY_SPECS,
    CHANNELS_WEIGHTED,
    PAYMENT_METHODS_WEIGHTED,
    DEVICE_TYPES_WEIGHTED,
    BROWSERS_BY_DEVICE,
)
from .seasonality import get_seasonal_multiplier, evaluate_active_anomalies, INTENTIONAL_ANOMALIES


class DatasetGenerator:
    def __init__(
        self,
        seed: int = 42,
        start_date: str = "2025-05-01",
        end_date: str = "2026-10-31",
        target_customers: int = 10000,
        target_products: int = 380,
    ):
        self.seed = seed
        self.start_date = datetime.strptime(start_date, "%Y-%m-%d").date()
        self.end_date = datetime.strptime(end_date, "%Y-%m-%d").date()
        self.target_customers = target_customers
        self.target_products = target_products

        # Initialize PRNG with deterministic seed
        self.rng = random.Random(seed)

        self.customers: List[Customer] = []
        self.products: List[Product] = []
        self.campaigns: List[Campaign] = []
        self.orders: List[Order] = []
        self.order_items: List[OrderItem] = []
        self.sessions: List[Session] = []

    def _weighted_choice(self, choices: List[Tuple[Any, float]]) -> Any:
        items, weights = zip(*choices)
        return self.rng.choices(items, weights=weights, k=1)[0]

    def generate_products(self) -> List[Product]:
        """Generates realistic product catalog across all categories."""
        products = []
        sku_counter = 1000

        for cat_name, spec in CATEGORY_SPECS.items():
            base_items = spec["items"]
            # Generate multiple variations for each base item to reach target product count
            variations_per_item = max(1, self.target_products // (len(CATEGORY_SPECS) * len(base_items)))

            for title, subcat, base_price, unit_cost in base_items:
                for v_idx in range(variations_per_item + 1):
                    if len(products) >= self.target_products:
                        break

                    sku_counter += 1
                    var_suffix = f" (v{v_idx+1})" if v_idx > 0 else ""
                    item_title = f"{title}{var_suffix}"
                    
                    # Small price jitter for variations
                    price_jitter = 1.0 + (self.rng.uniform(-0.08, 0.08) if v_idx > 0 else 0.0)
                    final_price = round(base_price * price_jitter, 2)
                    final_cost = round(unit_cost * price_jitter, 2)
                    margin_rate = round((final_price - final_cost) / final_price, 4)

                    is_active = self.rng.random() > 0.03  # 97% active products

                    products.append(
                        Product(
                            product_id=f"PROD-{sku_counter}",
                            sku=f"SKU-{cat_name[:3].upper()}-{sku_counter}",
                            title=item_title,
                            category=cat_name,
                            subcategory=subcat,
                            unit_cost=final_cost,
                            base_price=final_price,
                            margin_rate=margin_rate,
                            is_active=is_active,
                        )
                    )

        self.products = products
        return products

    def generate_customers(self) -> List[Customer]:
        """Generates customer identities with synthetic geographic distributions."""
        customers = []
        total_days = (self.end_date - self.start_date).days

        for i in range(1, self.target_customers + 1):
            region = self._weighted_choice(REGIONS_WEIGHTED)
            state, city, _ = self._weighted_choice(
                [(s, w) for s, w in [(item[0], item[2]) for item in STATES_BY_REGION[region]]]
            )
            # Find matching city name
            matching_city = next(item[1] for item in STATES_BY_REGION[region] if item[0] == state)

            first_name = self.rng.choice(FIRST_NAMES)
            last_name = self.rng.choice(LAST_NAMES)
            full_name = f"{first_name} {last_name}"
            email_domain = self.rng.choice(EMAIL_DOMAINS)
            email = f"{first_name.lower()}.{last_name.lower()}{i}@{email_domain}"

            segment = self._weighted_choice(CUSTOMER_SEGMENTS_WEIGHTED)

            # Registration date distributed across timeline
            reg_offset = self.rng.randint(0, total_days)
            reg_date = self.start_date + timedelta(days=reg_offset)
            reg_hour = self.rng.randint(8, 22)
            reg_min = self.rng.randint(0, 59)
            created_at = f"{reg_date.strftime('%Y-%m-%d')} {reg_hour:02d}:{reg_min:02d}:00"

            customers.append(
                Customer(
                    customer_id=f"CUST-{i:05d}",
                    full_name=full_name,
                    email=email,
                    region=region,
                    state=state,
                    city=matching_city,
                    customer_segment=segment,
                    created_at=created_at,
                )
            )

        self.customers = customers
        return customers

    def generate_campaigns(self) -> List[Campaign]:
        """Generates marketing campaigns with structured time windows."""
        campaigns_def = [
            ("CAMP-01", "Winter Clearance Sale", "Paid Search (Google)", "Seasonal Sale", 28000.0, 27450.0, "Fashion & Apparel", "2025-06-01", "2025-06-30"),
            ("CAMP-02", "Dia dos Pais Promo", "Paid Social (Meta/TikTok)", "Holiday", 35000.0, 36200.0, "Electronics", "2025-08-01", "2025-08-15"),
            ("CAMP-03", "Semana do Brasil Mega Offer", "Paid Search (Google)", "National Sale", 42000.0, 41800.0, "Home & Living", "2025-09-03", "2025-09-12"),
            ("CAMP-04", "Dia das Crianças Tech & Toys", "Paid Social (Meta/TikTok)", "Holiday", 30000.0, 29400.0, "Gaming & Tech", "2025-10-01", "2025-10-12"),
            ("CAMP-05", "Black Friday Warmup 2025", "Email Marketing", "Early Bird", 12000.0, 11850.0, None, "2025-11-01", "2025-11-20"),
            ("CAMP-06", "Black Friday Mega Weekend 2025", "Paid Search (Google)", "Black Friday", 95000.0, 94200.0, "Electronics", "2025-11-24", "2025-11-30"),
            ("CAMP-07", "Christmas Holiday Rush 2025", "Paid Social (Meta/TikTok)", "Christmas", 65000.0, 66100.0, "Beauty & Health", "2025-12-05", "2025-12-24"),
            ("CAMP-08", "Summer Cleanout Jan 2026", "Organic Search", "Clearance", 15000.0, 14900.0, "Sports & Outdoors", "2026-01-05", "2026-01-25"),
            ("CAMP-09", "Dia do Consumidor 2026", "Paid Search (Google)", "Commercial Holiday", 50000.0, 49800.0, "Electronics", "2026-03-10", "2026-03-18"),
            ("CAMP-10", "Dia das Mães Luxury & Glow", "Paid Social (Meta/TikTok)", "Holiday", 48000.0, 47500.0, "Beauty & Health", "2026-04-25", "2026-05-12"),
            ("CAMP-11", "Dia dos Namorados Romantic Gifts", "Email Marketing", "Holiday", 24000.0, 23800.0, "Accessories", "2026-06-01", "2026-06-12"),
            ("CAMP-12", "Spring Glow Beauty Promotion (Inefficient)", "Paid Social (Meta/TikTok)", "Brand Awareness", 38000.0, 39400.0, "Beauty & Health", "2026-07-15", "2026-07-22"),
            ("CAMP-13", "Electronics Flash Rush Southeast", "Email Marketing", "Flash Sale", 22000.0, 21900.0, "Electronics", "2026-09-01", "2026-09-08"),
            ("CAMP-14", "Pre-Black Friday VIP Exclusive 2026", "Direct", "VIP Loyalty", 18000.0, 17800.0, None, "2026-10-15", "2026-10-31"),
        ]

        campaigns = [
            Campaign(
                campaign_id=cid,
                campaign_name=name,
                channel=ch,
                campaign_type=ctype,
                budget=b,
                actual_spend=s,
                target_category=tcat,
                start_date=sdate,
                end_date=edate,
            )
            for cid, name, ch, ctype, b, s, tcat, sdate, edate in campaigns_def
        ]

        self.campaigns = campaigns
        return campaigns

    def generate_sessions_and_orders(self) -> Tuple[List[Session], List[Order], List[OrderItem]]:
        """
        Simulates end-to-end user traffic, conversion funnels, and orders across each day.
        """
        sessions = []
        orders = []
        order_items = []

        session_id_counter = 1
        order_id_counter = 1
        item_id_counter = 1

        curr_date = self.start_date
        total_days = (self.end_date - self.start_date).days + 1

        # Track registered customers available up to current date
        active_customer_pool: List[Customer] = []
        cust_iter = iter(sorted(self.customers, key=lambda c: c.created_at))
        next_cust = next(cust_iter, None)

        print(f"Generating synthetic daily transactions across {total_days} days...")

        while curr_date <= self.end_date:
            d_str = curr_date.strftime("%Y-%m-%d")

            # Update customer pool with newly registered customers
            while next_cust and next_cust.created_at[:10] <= d_str:
                active_customer_pool.append(next_cust)
                next_cust = next(cust_iter, None)

            seasonal_mult = get_seasonal_multiplier(curr_date)
            anomalies = evaluate_active_anomalies(curr_date)

            # Daily base sessions target (~500 - 750 daily base scaled by seasonality)
            base_daily_sessions = int(self.rng.randint(520, 720) * seasonal_mult)

            # Injected anomaly: Paid social traffic boost in Beauty
            if anomalies["paid_social_beauty_traffic_boost"] > 1.0:
                base_daily_sessions = int(base_daily_sessions * 1.35)

            for _ in range(base_daily_sessions):
                session_id = f"SESS-{session_id_counter:07d}"
                session_id_counter += 1

                # Acquisition Channel & Device
                channel = self._weighted_choice(CHANNELS_WEIGHTED)
                device_type = self._weighted_choice(DEVICE_TYPES_WEIGHTED)
                browser = self._weighted_choice(
                    [(b, w) for b, w in BROWSERS_BY_DEVICE[device_type]]
                )

                # Geographic Attribution
                region = self._weighted_choice(REGIONS_WEIGHTED)
                state = self._weighted_choice(
                    [(item[0], item[2]) for item in STATES_BY_REGION[region]]
                )

                # Campaign attribution if within date window
                matching_campaigns = [
                    c for c in self.campaigns
                    if c.start_date <= d_str <= c.end_date and (c.channel == channel or self.rng.random() < 0.2)
                ]
                assigned_campaign_id = matching_campaigns[0].campaign_id if matching_campaigns and self.rng.random() < 0.65 else None

                # Customer linkage
                is_identified = len(active_customer_pool) > 0 and self.rng.random() < 0.45
                assigned_customer = self.rng.choice(active_customer_pool) if is_identified else None

                # Funnel progression probabilities
                # 1. Product View (~65% base)
                has_product_view = self.rng.random() < 0.68
                
                # 2. Add to Cart (~22% of product views)
                has_cart_add = False
                if has_product_view:
                    has_cart_add = self.rng.random() < 0.24

                # 3. Checkout Start (~45% of cart adds)
                has_checkout_start = False
                if has_cart_add:
                    has_checkout_start = self.rng.random() < 0.48

                # 4. Completed Purchase (Conversion)
                is_converted = False
                if has_checkout_start:
                    base_completion_rate = 0.52
                    
                    # Apply device modifier (Desktop slightly higher, Mobile baseline)
                    if device_type == "Desktop":
                        base_completion_rate *= 1.15

                    # Apply Anomaly EVENT-01: Mobile iOS Gateway drop
                    if device_type == "Mobile iOS" and anomalies["mobile_ios_checkout_penalty"] < 1.0:
                        base_completion_rate *= anomalies["mobile_ios_checkout_penalty"]

                    # Apply Anomaly EVENT-03: Paid Social Beauty CR drop
                    if channel == "Paid Social (Meta/TikTok)" and anomalies["paid_social_beauty_cr_penalty"] < 1.0:
                        base_completion_rate *= anomalies["paid_social_beauty_cr_penalty"]

                    # Apply Anomaly EVENT-05: Cart abandonment on heavy items
                    if anomalies["cart_abandonment_heavy_surge"] > 1.0 and device_type == "Desktop":
                        base_completion_rate *= 0.60

                    is_converted = self.rng.random() < base_completion_rate

                order_id: Optional[str] = None

                # If session successfully converted, generate order & items
                if is_converted:
                    order_id = f"ORD-{order_id_counter:06d}"
                    order_id_counter += 1

                    # Ensure we have a customer for completed orders
                    if not assigned_customer:
                        assigned_customer = self.rng.choice(active_customer_pool) if active_customer_pool else self.customers[0]

                    # Pick 1 to 4 items for this order
                    num_items = self.rng.choices([1, 2, 3, 4], weights=[0.65, 0.22, 0.09, 0.04])[0]
                    order_subtotal = 0.0

                    # Item selection strategy (respecting breakout product or category surge)
                    for _ in range(num_items):
                        # Filter product selection
                        candidate_products = self.products
                        if anomalies["electronics_se_surge"] > 1.0 and region == "Southeast":
                            candidate_products = [p for p in self.products if p.category == "Electronics"] or self.products
                        elif anomalies["air_fryer_demand_boost"] > 1.0 and self.rng.random() < 0.25:
                            candidate_products = [p for p in self.products if "Air Fryer" in p.title] or self.products

                        chosen_prod = self.rng.choice(candidate_products)
                        quantity = 1 if chosen_prod.base_price > 300 else self.rng.choices([1, 2, 3], weights=[0.80, 0.15, 0.05])[0]
                        item_revenue = round(chosen_prod.base_price * quantity, 2)
                        item_cost = round(chosen_prod.unit_cost * quantity, 2)

                        order_subtotal += item_revenue

                        order_items.append(
                            OrderItem(
                                item_id=f"ITEM-{item_id_counter:07d}",
                                order_id=order_id,
                                product_id=chosen_prod.product_id,
                                quantity=quantity,
                                unit_price=chosen_prod.base_price,
                                unit_cost=chosen_prod.unit_cost,
                                total_item_revenue=item_revenue,
                                total_item_cost=item_cost,
                            )
                        )
                        item_id_counter += 1

                    # Calculate order totals
                    discount = round(order_subtotal * (self.rng.choice([0.0, 0.05, 0.10]) if self.rng.random() < 0.35 else 0.0), 2)
                    shipping = 0.0 if order_subtotal > 250.0 else round(self.rng.uniform(15.0, 35.0), 2)
                    tax = round(order_subtotal * 0.08, 2)
                    total_revenue = round(order_subtotal - discount + shipping + tax, 2)

                    payment_method = self._weighted_choice(PAYMENT_METHODS_WEIGHTED)
                    order_status = "Cancelled" if self.rng.random() < 0.02 else "Completed"

                    order_time_hour = self.rng.randint(7, 23)
                    order_time_min = self.rng.randint(0, 59)
                    order_timestamp = f"{d_str} {order_time_hour:02d}:{order_time_min:02d}:00"

                    orders.append(
                        Order(
                            order_id=order_id,
                            customer_id=assigned_customer.customer_id,
                            campaign_id=assigned_campaign_id,
                            status=order_status,
                            subtotal=round(order_subtotal, 2),
                            discount_amount=discount,
                            tax_amount=tax,
                            shipping_amount=shipping,
                            total_revenue=total_revenue,
                            payment_method=payment_method,
                            channel=channel,
                            device_type=device_type,
                            order_date=order_timestamp,
                        )
                    )

                # Session record
                sess_hour = self.rng.randint(0, 23)
                sess_min = self.rng.randint(0, 59)
                session_start_time = f"{d_str} {sess_hour:02d}:{sess_min:02d}:00"
                page_views = 1 + (2 if has_product_view else 0) + (3 if has_cart_add else 0) + (4 if is_converted else 0)
                duration_sec = self.rng.randint(25, 450) if is_converted else self.rng.randint(8, 140)

                sessions.append(
                    Session(
                        session_id=session_id,
                        customer_id=assigned_customer.customer_id if assigned_customer else None,
                        campaign_id=assigned_campaign_id,
                        device_type=device_type,
                        browser=browser,
                        channel=channel,
                        region=region,
                        state=state,
                        duration_seconds=duration_sec,
                        page_views=page_views,
                        has_product_view=has_product_view,
                        has_cart_add=has_cart_add,
                        has_checkout_start=has_checkout_start,
                        is_converted=is_converted,
                        order_id=order_id,
                        session_start=session_start_time,
                    )
                )

            curr_date += timedelta(days=1)

        self.sessions = sessions
        self.orders = orders
        self.order_items = order_items
        return sessions, orders, order_items

    def export_dataset(self, output_dir: str = "data/generated"):
        """Exports generated entities to CSV and saves ground truth business events JSON."""
        csv_dir = os.path.join(output_dir, "csv")
        meta_dir = "data/metadata"
        os.makedirs(csv_dir, exist_ok=True)
        os.makedirs(meta_dir, exist_ok=True)

        tables = {
            "customers.csv": [c.to_dict() for c in self.customers],
            "products.csv": [p.to_dict() for p in self.products],
            "campaigns.csv": [c.to_dict() for c in self.campaigns],
            "orders.csv": [o.to_dict() for o in self.orders],
            "order_items.csv": [i.to_dict() for i in self.order_items],
            "sessions.csv": [s.to_dict() for s in self.sessions],
        }

        print(f"Exporting CSV datasets to {csv_dir}...")
        for filename, rows in tables.items():
            if not rows:
                continue
            filepath = os.path.join(csv_dir, filename)
            keys = rows[0].keys()
            with open(filepath, "w", newline="", encoding="utf-8") as f:
                writer = csv.DictWriter(f, fieldnames=keys)
                writer.writeheader()
                writer.writerows(rows)
            print(f"  ✓ {filename}: {len(rows):,} records")

        # Export Intentional Anomalies Metadata
        events_path = os.path.join(meta_dir, "business_events.json")
        with open(events_path, "w", encoding="utf-8") as f:
            json.dump(
                {
                    "dataset_version": "1.0-ecommerce-synthetic",
                    "generated_at": datetime.utcnow().isoformat() + "Z",
                    "seed": self.seed,
                    "date_range": {
                        "start_date": self.start_date.strftime("%Y-%m-%d"),
                        "end_date": self.end_date.strftime("%Y-%m-%d"),
                    },
                    "events": INTENTIONAL_ANOMALIES,
                },
                f,
                indent=2,
                ensure_ascii=False,
            )
        print(f"  ✓ Saved business events ground-truth to {events_path}")
