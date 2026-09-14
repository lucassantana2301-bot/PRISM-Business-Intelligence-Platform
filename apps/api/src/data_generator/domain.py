"""
PRISM Canonical E-Commerce Domain Entities & Data Schemas
"""

from dataclasses import dataclass, asdict
from typing import Optional, List, Dict, Any


@dataclass
class Customer:
    customer_id: str
    full_name: str
    email: str
    region: str
    state: str
    city: str
    customer_segment: str
    created_at: str

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class Product:
    product_id: str
    sku: str
    title: str
    category: str
    subcategory: str
    unit_cost: float
    base_price: float
    margin_rate: float
    is_active: bool

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class Order:
    order_id: str
    customer_id: str
    campaign_id: Optional[str]
    status: str
    subtotal: float
    discount_amount: float
    tax_amount: float
    shipping_amount: float
    total_revenue: float
    payment_method: str
    channel: str
    device_type: str
    order_date: str

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class OrderItem:
    item_id: str
    order_id: str
    product_id: str
    quantity: int
    unit_price: float
    unit_cost: float
    total_item_revenue: float
    total_item_cost: float

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class Session:
    session_id: str
    customer_id: Optional[str]
    campaign_id: Optional[str]
    device_type: str
    browser: str
    channel: str
    region: str
    state: str
    duration_seconds: int
    page_views: int
    has_product_view: bool
    has_cart_add: bool
    has_checkout_start: bool
    is_converted: bool
    order_id: Optional[str]
    session_start: str

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class Campaign:
    campaign_id: str
    campaign_name: str
    channel: str
    campaign_type: str
    budget: float
    actual_spend: float
    target_category: Optional[str]
    start_date: str
    end_date: str

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)
