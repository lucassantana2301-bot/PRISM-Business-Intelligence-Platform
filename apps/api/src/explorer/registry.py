"""
PRISM Data Explorer — Controlled Schema & Dataset Registry
Defines allowlisted datasets, column metadata, data types, filterability, and sorting permissions.
"""

from typing import Dict, List, Optional
from pydantic import BaseModel, Field


class ColumnMetadata(BaseModel):
    name: str
    display_name: str
    data_type: str = Field(description="string, integer, float, boolean, datetime, date")
    description: str
    nullable: bool = False
    filterable: bool = True
    sortable: bool = True
    searchable: bool = False
    format_type: str = Field(description="text, currency, integer, percentage, datetime, badge, boolean")


class DatasetMetadata(BaseModel):
    dataset_id: str
    display_name: str
    description: str
    table_name: str
    primary_key: str
    default_columns: List[str]
    columns: List[ColumnMetadata]


# ==================== CANONICAL DATASET REGISTRY ====================
DATASET_REGISTRY: Dict[str, DatasetMetadata] = {
    # 1. Orders
    "orders": DatasetMetadata(
        dataset_id="orders",
        display_name="Orders",
        description="Customer transactions, fulfillment statuses, payment channels, and financial totals.",
        table_name="orders",
        primary_key="order_id",
        default_columns=["order_id", "customer_id", "status", "total_revenue", "payment_method", "channel", "order_date"],
        columns=[
            ColumnMetadata(name="order_id", display_name="Order ID", data_type="string", description="Unique order reference", filterable=True, sortable=True, searchable=True, format_type="text"),
            ColumnMetadata(name="customer_id", display_name="Customer ID", data_type="string", description="Associated customer reference", filterable=True, sortable=True, searchable=True, format_type="text"),
            ColumnMetadata(name="campaign_id", display_name="Campaign ID", data_type="string", description="Associated marketing campaign", nullable=True, filterable=True, sortable=True, format_type="text"),
            ColumnMetadata(name="status", display_name="Status", data_type="string", description="Order fulfillment state (Completed, Processing, Cancelled)", filterable=True, sortable=True, format_type="badge"),
            ColumnMetadata(name="subtotal", display_name="Subtotal", data_type="float", description="Items total before discounts and taxes", filterable=True, sortable=True, format_type="currency"),
            ColumnMetadata(name="discount_amount", display_name="Discount", data_type="float", description="Total promotional discount applied", filterable=True, sortable=True, format_type="currency"),
            ColumnMetadata(name="tax_amount", display_name="Tax", data_type="float", description="Calculated sales tax", filterable=True, sortable=True, format_type="currency"),
            ColumnMetadata(name="shipping_amount", display_name="Shipping", data_type="float", description="Shipping fee charged", filterable=True, sortable=True, format_type="currency"),
            ColumnMetadata(name="total_revenue", display_name="Total Revenue", data_type="float", description="Gross order amount paid by customer", filterable=True, sortable=True, format_type="currency"),
            ColumnMetadata(name="payment_method", display_name="Payment Method", data_type="string", description="Method used (Credit Card, PIX, Boleto, PayPal)", filterable=True, sortable=True, format_type="text"),
            ColumnMetadata(name="channel", display_name="Channel", data_type="string", description="Acquisition touchpoint", filterable=True, sortable=True, format_type="text"),
            ColumnMetadata(name="device_type", display_name="Device Type", data_type="string", description="Device category (Desktop, Mobile Android, Mobile iOS)", filterable=True, sortable=True, format_type="text"),
            ColumnMetadata(name="order_date", display_name="Order Timestamp", data_type="datetime", description="Timestamp when order was placed", filterable=True, sortable=True, format_type="datetime"),
        ],
    ),

    # 2. Order Items
    "order_items": DatasetMetadata(
        dataset_id="order_items",
        display_name="Order Items",
        description="Line-item merchandise sales records with unit prices and product cost margins.",
        table_name="order_items",
        primary_key="item_id",
        default_columns=["item_id", "order_id", "product_id", "quantity", "unit_price", "total_item_revenue", "total_item_cost"],
        columns=[
            ColumnMetadata(name="item_id", display_name="Item ID", data_type="string", description="Unique line item reference", filterable=True, sortable=True, searchable=True, format_type="text"),
            ColumnMetadata(name="order_id", display_name="Order ID", data_type="string", description="Associated parent order", filterable=True, sortable=True, searchable=True, format_type="text"),
            ColumnMetadata(name="product_id", display_name="Product ID", data_type="string", description="Product catalog SKU identifier", filterable=True, sortable=True, searchable=True, format_type="text"),
            ColumnMetadata(name="quantity", display_name="Quantity", data_type="integer", description="Units purchased", filterable=True, sortable=True, format_type="integer"),
            ColumnMetadata(name="unit_price", display_name="Unit Price", data_type="float", description="Sales price per unit", filterable=True, sortable=True, format_type="currency"),
            ColumnMetadata(name="unit_cost", display_name="Unit Cost", data_type="float", description="Production/procurement cost per unit", filterable=True, sortable=True, format_type="currency"),
            ColumnMetadata(name="total_item_revenue", display_name="Item Revenue", data_type="float", description="Gross revenue (quantity * unit_price)", filterable=True, sortable=True, format_type="currency"),
            ColumnMetadata(name="total_item_cost", display_name="Item Cost", data_type="float", description="Total COGS (quantity * unit_cost)", filterable=True, sortable=True, format_type="currency"),
        ],
    ),

    # 3. Sessions
    "sessions": DatasetMetadata(
        dataset_id="sessions",
        display_name="Store Sessions",
        description="Web and mobile browsing visits, duration, funnel events, and conversion flags.",
        table_name="sessions",
        primary_key="session_id",
        default_columns=["session_id", "channel", "device_type", "region", "duration_seconds", "page_views", "is_converted", "session_start"],
        columns=[
            ColumnMetadata(name="session_id", display_name="Session ID", data_type="string", description="Unique session tracking ID", filterable=True, sortable=True, searchable=True, format_type="text"),
            ColumnMetadata(name="customer_id", display_name="Customer ID", data_type="string", description="Customer ID if logged in", nullable=True, filterable=True, sortable=True, searchable=True, format_type="text"),
            ColumnMetadata(name="campaign_id", display_name="Campaign ID", data_type="string", description="Attributed ad campaign", nullable=True, filterable=True, sortable=True, format_type="text"),
            ColumnMetadata(name="device_type", display_name="Device", data_type="string", description="Client device", filterable=True, sortable=True, format_type="text"),
            ColumnMetadata(name="browser", display_name="Browser", data_type="string", description="Web browser used", filterable=True, sortable=True, format_type="text"),
            ColumnMetadata(name="channel", display_name="Channel", data_type="string", description="Traffic channel source", filterable=True, sortable=True, format_type="text"),
            ColumnMetadata(name="region", display_name="Region", data_type="string", description="Geographic macro-region", filterable=True, sortable=True, format_type="text"),
            ColumnMetadata(name="state", display_name="State", data_type="string", description="State code", filterable=True, sortable=True, format_type="text"),
            ColumnMetadata(name="duration_seconds", display_name="Duration (s)", data_type="integer", description="Session length in seconds", filterable=True, sortable=True, format_type="integer"),
            ColumnMetadata(name="page_views", display_name="Page Views", data_type="integer", description="Total pages viewed in session", filterable=True, sortable=True, format_type="integer"),
            ColumnMetadata(name="has_product_view", display_name="Viewed Product", data_type="boolean", description="Whether product page was visited", filterable=True, sortable=True, format_type="boolean"),
            ColumnMetadata(name="has_cart_add", display_name="Added to Cart", data_type="boolean", description="Whether item was added to cart", filterable=True, sortable=True, format_type="boolean"),
            ColumnMetadata(name="has_checkout_start", display_name="Started Checkout", data_type="boolean", description="Whether checkout flow was initiated", filterable=True, sortable=True, format_type="boolean"),
            ColumnMetadata(name="is_converted", display_name="Converted", data_type="boolean", description="Whether order purchase was finalized", filterable=True, sortable=True, format_type="boolean"),
            ColumnMetadata(name="order_id", display_name="Order ID", data_type="string", description="Generated order ID if converted", nullable=True, filterable=True, sortable=True, format_type="text"),
            ColumnMetadata(name="session_start", display_name="Session Start", data_type="datetime", description="Visit initiation timestamp", filterable=True, sortable=True, format_type="datetime"),
        ],
    ),

    # 4. Products
    "products": DatasetMetadata(
        dataset_id="products",
        display_name="Products Catalog",
        description="Merchandise inventory, department categories, base prices, and margin targets.",
        table_name="products",
        primary_key="product_id",
        default_columns=["product_id", "sku", "title", "category", "subcategory", "base_price", "unit_cost", "margin_rate", "is_active"],
        columns=[
            ColumnMetadata(name="product_id", display_name="Product ID", data_type="string", description="Internal product key", filterable=True, sortable=True, searchable=True, format_type="text"),
            ColumnMetadata(name="sku", display_name="SKU", data_type="string", description="Inventory SKU code", filterable=True, sortable=True, searchable=True, format_type="text"),
            ColumnMetadata(name="title", display_name="Product Title", data_type="string", description="Commercial product title", filterable=True, sortable=True, searchable=True, format_type="text"),
            ColumnMetadata(name="category", display_name="Category", data_type="string", description="Main department", filterable=True, sortable=True, format_type="text"),
            ColumnMetadata(name="subcategory", display_name="Subcategory", data_type="string", description="Product category hierarchy", filterable=True, sortable=True, format_type="text"),
            ColumnMetadata(name="base_price", display_name="Base Price", data_type="float", description="Catalog list price", filterable=True, sortable=True, format_type="currency"),
            ColumnMetadata(name="unit_cost", display_name="Unit Cost", data_type="float", description="Inventory production cost", filterable=True, sortable=True, format_type="currency"),
            ColumnMetadata(name="margin_rate", display_name="Margin Rate", data_type="float", description="Target profit margin percentage", filterable=True, sortable=True, format_type="percentage"),
            ColumnMetadata(name="is_active", display_name="Active", data_type="boolean", description="Whether product is live for sale", filterable=True, sortable=True, format_type="boolean"),
        ],
    ),

    # 5. Customers
    "customers": DatasetMetadata(
        dataset_id="customers",
        display_name="Customers",
        description="Buyer profiles, geographic locations, and customer segmentation tiers.",
        table_name="customers",
        primary_key="customer_id",
        default_columns=["customer_id", "full_name", "email", "region", "state", "city", "customer_segment", "created_at"],
        columns=[
            ColumnMetadata(name="customer_id", display_name="Customer ID", data_type="string", description="Unique customer ID", filterable=True, sortable=True, searchable=True, format_type="text"),
            ColumnMetadata(name="full_name", display_name="Full Name", data_type="string", description="Customer full name", filterable=True, sortable=True, searchable=True, format_type="text"),
            ColumnMetadata(name="email", display_name="Email", data_type="string", description="Customer email address", filterable=True, sortable=True, searchable=True, format_type="text"),
            ColumnMetadata(name="region", display_name="Region", data_type="string", description="Geographic macro-region", filterable=True, sortable=True, format_type="text"),
            ColumnMetadata(name="state", display_name="State", data_type="string", description="State identifier", filterable=True, sortable=True, format_type="text"),
            ColumnMetadata(name="city", display_name="City", data_type="string", description="City location", filterable=True, sortable=True, searchable=True, format_type="text"),
            ColumnMetadata(name="customer_segment", display_name="Segment", data_type="string", description="RFM tier (VIP, Regular, At-Risk, Churned, One-Time)", filterable=True, sortable=True, format_type="badge"),
            ColumnMetadata(name="created_at", display_name="Account Created", data_type="datetime", description="Registration timestamp", filterable=True, sortable=True, format_type="datetime"),
        ],
    ),

    # 6. Campaigns
    "campaigns": DatasetMetadata(
        dataset_id="campaigns",
        display_name="Marketing Campaigns",
        description="Ad campaigns, channels, allocated budgets, and actual marketing expenditures.",
        table_name="campaigns",
        primary_key="campaign_id",
        default_columns=["campaign_id", "campaign_name", "channel", "campaign_type", "budget", "actual_spend", "target_category", "start_date", "end_date"],
        columns=[
            ColumnMetadata(name="campaign_id", display_name="Campaign ID", data_type="string", description="Unique campaign key", filterable=True, sortable=True, searchable=True, format_type="text"),
            ColumnMetadata(name="campaign_name", display_name="Campaign Name", data_type="string", description="Campaign promotional title", filterable=True, sortable=True, searchable=True, format_type="text"),
            ColumnMetadata(name="channel", display_name="Channel", data_type="string", description="Ad network channel", filterable=True, sortable=True, format_type="text"),
            ColumnMetadata(name="campaign_type", display_name="Type", data_type="string", description="Promotion category (Seasonal, Holiday, Evergreen)", filterable=True, sortable=True, format_type="text"),
            ColumnMetadata(name="budget", display_name="Budget", data_type="float", description="Allocated budget", filterable=True, sortable=True, format_type="currency"),
            ColumnMetadata(name="actual_spend", display_name="Actual Spend", data_type="float", description="Realized spend", filterable=True, sortable=True, format_type="currency"),
            ColumnMetadata(name="target_category", display_name="Target Category", data_type="string", description="Promoted merchandise category", filterable=True, sortable=True, format_type="text"),
            ColumnMetadata(name="start_date", display_name="Start Date", data_type="date", description="Launch date", filterable=True, sortable=True, format_type="text"),
            ColumnMetadata(name="end_date", display_name="End Date", data_type="date", description="Conclusion date", filterable=True, sortable=True, format_type="text"),
        ],
    ),
}
