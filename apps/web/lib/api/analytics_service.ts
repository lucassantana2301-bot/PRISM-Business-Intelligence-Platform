/**
 * PRISM Server Analytics Service & Query Execution Adapter
 * Executes canonical analytical queries matching apps/api/src/analytics/* specifications.
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  AnalyticsQuery,
  AnalyticsQueryResult,
  MetricSummaryValue,
  TimeGrain,
  ComparisonWindow,
  MetricName,
} from '@/lib/contracts/analytics';

const DATA_DIR = path.resolve(process.cwd(), '../../data/generated/csv');

interface Order {
  order_id: string;
  customer_id: string;
  campaign_id: string;
  status: string;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  shipping_amount: number;
  total_revenue: number;
  payment_method: string;
  channel: string;
  device_type: string;
  order_date: string;
}

interface OrderItem {
  item_id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  unit_cost: number;
  total_item_revenue: number;
  total_item_cost: number;
}

interface Session {
  session_id: string;
  customer_id: string;
  campaign_id: string;
  device_type: string;
  browser: string;
  channel: string;
  region: string;
  state: string;
  duration_seconds: number;
  page_views: number;
  has_product_view: boolean;
  has_cart_add: boolean;
  has_checkout_start: boolean;
  is_converted: boolean;
  order_id: string;
  session_start: string;
}

interface Product {
  product_id: string;
  sku: string;
  title: string;
  category: string;
  subcategory: string;
  unit_cost: number;
  base_price: number;
  margin_rate: number;
  is_active: boolean;
}

interface Customer {
  customer_id: string;
  full_name: string;
  email: string;
  region: string;
  state: string;
  city: string;
  customer_segment: string;
  created_at: string;
}

interface DatasetCache {
  orders: Order[];
  orderItems: OrderItem[];
  sessions: Session[];
  products: Product[];
  customers: Customer[];
  productMap: Map<string, Product>;
  customerMap: Map<string, Customer>;
  ordersMap: Map<string, Order>;
}

let cachedData: DatasetCache | null = null;

function parseCsv<T>(filePath: string, transform: (row: Record<string, string>) => T): T[] {
  if (!fs.existsSync(filePath)) {
    // Fallback search in relative paths
    const altPath = path.resolve(__dirname, '../../../../data/generated/csv', path.basename(filePath));
    if (fs.existsSync(altPath)) filePath = altPath;
    else return [];
  }
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.trim().split('\n');
  if (lines.length <= 1) return [];

  const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
  const results: T[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let charIdx = 0; charIdx < line.length; charIdx++) {
      const c = line[charIdx];
      if (c === '"') {
        inQuotes = !inQuotes;
      } else if (c === ',' && !inQuotes) {
        values.push(current.trim().replace(/^"|"$/g, ''));
        current = '';
      } else {
        current += c;
      }
    }
    values.push(current.trim().replace(/^"|"$/g, ''));

    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] !== undefined ? values[idx] : '';
    });
    results.push(transform(row));
  }
  return results;
}

function loadDataset(): DatasetCache {
  if (cachedData) return cachedData;

  const orders = parseCsv<Order>(path.join(DATA_DIR, 'orders.csv'), (r) => ({
    order_id: r.order_id,
    customer_id: r.customer_id,
    campaign_id: r.campaign_id,
    status: r.status,
    subtotal: parseFloat(r.subtotal) || 0,
    discount_amount: parseFloat(r.discount_amount) || 0,
    tax_amount: parseFloat(r.tax_amount) || 0,
    shipping_amount: parseFloat(r.shipping_amount) || 0,
    total_revenue: parseFloat(r.total_revenue) || 0,
    payment_method: r.payment_method,
    channel: r.channel,
    device_type: r.device_type,
    order_date: r.order_date,
  }));

  const orderItems = parseCsv<OrderItem>(path.join(DATA_DIR, 'order_items.csv'), (r) => ({
    item_id: r.item_id,
    order_id: r.order_id,
    product_id: r.product_id,
    quantity: parseInt(r.quantity, 10) || 0,
    unit_price: parseFloat(r.unit_price) || 0,
    unit_cost: parseFloat(r.unit_cost) || 0,
    total_item_revenue: parseFloat(r.total_item_revenue) || 0,
    total_item_cost: parseFloat(r.total_item_cost) || 0,
  }));

  const sessions = parseCsv<Session>(path.join(DATA_DIR, 'sessions.csv'), (r) => ({
    session_id: r.session_id,
    customer_id: r.customer_id,
    campaign_id: r.campaign_id,
    device_type: r.device_type,
    browser: r.browser,
    channel: r.channel,
    region: r.region,
    state: r.state,
    duration_seconds: parseInt(r.duration_seconds, 10) || 0,
    page_views: parseInt(r.page_views, 10) || 0,
    has_product_view: r.has_product_view === 'true',
    has_cart_add: r.has_cart_add === 'true',
    has_checkout_start: r.has_checkout_start === 'true',
    is_converted: r.is_converted === 'true',
    order_id: r.order_id,
    session_start: r.session_start,
  }));

  const products = parseCsv<Product>(path.join(DATA_DIR, 'products.csv'), (r) => ({
    product_id: r.product_id,
    sku: r.sku,
    title: r.title,
    category: r.category,
    subcategory: r.subcategory,
    unit_cost: parseFloat(r.unit_cost) || 0,
    base_price: parseFloat(r.base_price) || 0,
    margin_rate: parseFloat(r.margin_rate) || 0,
    is_active: r.is_active === 'true',
  }));

  const customers = parseCsv<Customer>(path.join(DATA_DIR, 'customers.csv'), (r) => ({
    customer_id: r.customer_id,
    full_name: r.full_name,
    email: r.email,
    region: r.region,
    state: r.state,
    city: r.city,
    customer_segment: r.customer_segment,
    created_at: r.created_at,
  }));

  const productMap = new Map<string, Product>();
  products.forEach((p) => productMap.set(p.product_id, p));

  const customerMap = new Map<string, Customer>();
  customers.forEach((c) => customerMap.set(c.customer_id, c));

  const ordersMap = new Map<string, Order>();
  orders.forEach((o) => ordersMap.set(o.order_id, o));

  cachedData = {
    orders,
    orderItems,
    sessions,
    products,
    customers,
    productMap,
    customerMap,
    ordersMap,
  };

  return cachedData;
}

export function computeComparisonDates(
  startDate: string,
  endDate: string,
  comparison?: ComparisonWindow
): [string, string] | null {
  if (!comparison || comparison === 'none') return null;

  const dStart = new Date(startDate + 'T00:00:00Z');
  const dEnd = new Date(endDate + 'T23:59:59Z');
  const durationMs = dEnd.getTime() - dStart.getTime() + 1000;
  const durationDays = Math.round(durationMs / (1000 * 60 * 60 * 24));

  if (comparison === 'previous_period') {
    const compEnd = new Date(dStart.getTime() - 1000);
    const compStart = new Date(compEnd.getTime() - (durationDays - 1) * 24 * 60 * 60 * 1000);
    return [compStart.toISOString().split('T')[0], compEnd.toISOString().split('T')[0]];
  }

  return null;
}

function calculateScalarMetric(
  metricId: MetricName,
  startDate: string,
  endDate: string,
  data: DatasetCache
): number {
  const startStr = `${startDate} 00:00:00`;
  const endStr = `${endDate} 23:59:59`;

  const windowOrders = data.orders.filter(
    (o) => o.status === 'Completed' && o.order_date >= startStr && o.order_date <= endStr
  );
  const windowOrderIds = new Set(windowOrders.map((o) => o.order_id));
  const windowItems = data.orderItems.filter((oi) => windowOrderIds.has(oi.order_id));
  const windowSessions = data.sessions.filter(
    (s) => s.session_start >= startStr && s.session_start <= endStr
  );

  switch (metricId) {
    case 'gross_revenue':
      return windowItems.reduce((acc, oi) => acc + oi.total_item_revenue, 0);

    case 'net_revenue':
      return windowOrders.reduce((acc, o) => acc + (o.subtotal - o.discount_amount), 0);

    case 'orders':
      return windowOrders.length;

    case 'average_order_value': {
      const netRev = windowOrders.reduce((acc, o) => acc + (o.subtotal - o.discount_amount), 0);
      return windowOrders.length > 0 ? netRev / windowOrders.length : 0.0;
    }

    case 'sessions':
      return windowSessions.length;

    case 'conversion_rate': {
      const converted = windowSessions.filter((s) => s.is_converted).length;
      return windowSessions.length > 0 ? (converted * 100.0) / windowSessions.length : 0.0;
    }

    case 'cart_abandonment_rate': {
      const cartAdds = windowSessions.filter((s) => s.has_cart_add).length;
      const converted = windowSessions.filter((s) => s.is_converted).length;
      return cartAdds > 0 ? ((cartAdds - converted) * 100.0) / cartAdds : 0.0;
    }

    case 'total_customers':
      return new Set(windowOrders.map((o) => o.customer_id)).size;

    case 'units_sold':
      return windowItems.reduce((acc, oi) => acc + oi.quantity, 0);

    case 'gross_margin':
      return windowItems.reduce((acc, oi) => acc + (oi.total_item_revenue - oi.total_item_cost), 0);

    case 'gross_margin_rate': {
      const grossRev = windowItems.reduce((acc, oi) => acc + oi.total_item_revenue, 0);
      const grossMargin = windowItems.reduce(
        (acc, oi) => acc + (oi.total_item_revenue - oi.total_item_cost),
        0
      );
      return grossRev > 0 ? (grossMargin * 100.0) / grossRev : 0.0;
    }

    default:
      return 0.0;
  }
}

export async function executeAnalyticsQuery(query: AnalyticsQuery): Promise<AnalyticsQueryResult> {
  const t0 = performance.now();
  const data = loadDataset();

  const compDates = computeComparisonDates(query.start_date, query.end_date, query.comparison);
  const metrics_summary: Record<string, MetricSummaryValue> = {};

  for (const metric of query.metrics) {
    const currVal = calculateScalarMetric(metric, query.start_date, query.end_date, data);
    let prevVal: number | null = null;
    let absDelta: number | null = null;
    let pctDelta: number | null = null;
    let isFavorable: boolean | null = null;

    if (compDates) {
      prevVal = calculateScalarMetric(metric, compDates[0], compDates[1], data);
      absDelta = Number((currVal - prevVal).toFixed(4));
      pctDelta = prevVal > 0 ? Number((((currVal - prevVal) / prevVal) * 100.0).toFixed(2)) : currVal > 0 ? 100.0 : 0.0;
      isFavorable = metric === 'cart_abandonment_rate' ? currVal <= prevVal : currVal >= prevVal;
    }

    metrics_summary[metric] = {
      metric_id: metric,
      current_value: Number(currVal.toFixed(4)),
      previous_value: prevVal !== null ? Number(prevVal.toFixed(4)) : null,
      absolute_delta: absDelta,
      percentage_delta: pctDelta,
      format_type:
        metric === 'conversion_rate' || metric === 'cart_abandonment_rate' || metric === 'gross_margin_rate'
          ? 'percentage'
          : metric === 'orders' || metric === 'sessions' || metric === 'total_customers' || metric === 'units_sold'
          ? 'integer'
          : 'currency',
      is_favorable_up: metric !== 'cart_abandonment_rate',
      is_favorable: isFavorable,
    };
  }

  // Multi-dimensional breakdown & Time series
  const rows: Record<string, any>[] = [];
  const startStr = `${query.start_date} 00:00:00`;
  const endStr = `${query.end_date} 23:59:59`;

  if (query.time_grain) {
    // Time Series grouping
    const timeBuckets = new Map<string, { currentRevenue: number; currentOrders: number }>();

    const completed = data.orders.filter(
      (o) => o.status === 'Completed' && o.order_date >= startStr && o.order_date <= endStr
    );

    completed.forEach((o) => {
      const d = o.order_date.split(' ')[0];
      let key = d;

      if (query.time_grain === 'week') {
        const parts = d.split('-').map((p) => parseInt(p, 10));
        const dt = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
        const day = dt.getUTCDay();
        const diff = dt.getUTCDate() - day + (day === 0 ? -6 : 1);
        key = new Date(Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth(), diff)).toISOString().split('T')[0];
      } else if (query.time_grain === 'month') {
        key = d.substring(0, 7) + '-01';
      }

      const curr = timeBuckets.get(key) || { currentRevenue: 0, currentOrders: 0 };
      curr.currentRevenue += o.subtotal - o.discount_amount;
      curr.currentOrders += 1;
      timeBuckets.set(key, curr);
    });

    // Sort chronologically
    const sortedKeys = Array.from(timeBuckets.keys()).sort();
    sortedKeys.forEach((k) => {
      const bucket = timeBuckets.get(k)!;
      rows.push({
        timestamp: k,
        date: k,
        net_revenue: Number(bucket.currentRevenue.toFixed(2)),
        orders: bucket.currentOrders,
        current: Number(bucket.currentRevenue.toFixed(2)),
      });
    });
  } else if (query.dimensions && query.dimensions.includes('category')) {
    // Category Breakdown
    const catMap = new Map<string, number>();
    const completedOrders = data.orders.filter(
      (o) => o.status === 'Completed' && o.order_date >= startStr && o.order_date <= endStr
    );
    const orderIds = new Set(completedOrders.map((o) => o.order_id));
    const items = data.orderItems.filter((oi) => orderIds.has(oi.order_id));

    items.forEach((item) => {
      const prod = data.productMap.get(item.product_id);
      const cat = prod?.category || 'Other';
      catMap.set(cat, (catMap.get(cat) || 0) + item.total_item_revenue);
    });

    const totalRev = Array.from(catMap.values()).reduce((a, b) => a + b, 0);
    const colors: Record<string, string> = {
      Electronics: '#3B82F6',
      'Fashion & Apparel': '#8B5CF6',
      'Home & Living': '#10B981',
      'Beauty & Health': '#F59E0B',
      'Sports & Outdoors': '#EC4899',
      Other: '#64748B',
    };

    catMap.forEach((rev, catName) => {
      rows.push({
        category: catName,
        name: catName,
        revenue: Number(rev.toFixed(2)),
        gross_revenue: Number(rev.toFixed(2)),
        share: totalRev > 0 ? Number(((rev / totalRev) * 100.0).toFixed(1)) : 0,
        color: colors[catName] || '#64748B',
      });
    });

    rows.sort((a, b) => b.revenue - a.revenue);
  } else if (query.dimensions && query.dimensions.includes('region')) {
    // Regional Performance Breakdown
    const regionMap = new Map<string, { revenue: number; orders: number }>();
    const completed = data.orders.filter(
      (o) => o.status === 'Completed' && o.order_date >= startStr && o.order_date <= endStr
    );

    completed.forEach((o) => {
      const cust = data.customerMap.get(o.customer_id);
      const reg = cust?.region || 'Other';
      const curr = regionMap.get(reg) || { revenue: 0, orders: 0 };
      curr.revenue += o.subtotal - o.discount_amount;
      curr.orders += 1;
      regionMap.set(reg, curr);
    });

    const totalRev = Array.from(regionMap.values()).reduce((a, b) => a + b.revenue, 0);
    regionMap.forEach((val, reg) => {
      rows.push({
        region: reg,
        revenue: Number(val.revenue.toFixed(2)),
        net_revenue: Number(val.revenue.toFixed(2)),
        orders: val.orders,
        share: totalRev > 0 ? Number(((val.revenue / totalRev) * 100.0).toFixed(1)) : 0,
        aov: val.orders > 0 ? Number((val.revenue / val.orders).toFixed(2)) : 0,
      });
    });

    rows.sort((a, b) => b.revenue - a.revenue);
  } else if (query.dimensions && (query.dimensions.includes('product_id') || query.dimensions.includes('product'))) {
    // Top Products
    const prodMetrics = new Map<string, { revenue: number; units: number }>();
    const completedOrders = data.orders.filter(
      (o) => o.status === 'Completed' && o.order_date >= startStr && o.order_date <= endStr
    );
    const orderIds = new Set(completedOrders.map((o) => o.order_id));
    const items = data.orderItems.filter((oi) => orderIds.has(oi.order_id));

    items.forEach((item) => {
      const curr = prodMetrics.get(item.product_id) || { revenue: 0, units: 0 };
      curr.revenue += item.total_item_revenue;
      curr.units += item.quantity;
      prodMetrics.set(item.product_id, curr);
    });

    prodMetrics.forEach((val, pid) => {
      const prod = data.productMap.get(pid);
      rows.push({
        product_id: pid,
        title: prod?.title || pid,
        category: prod?.category || 'General',
        gross_revenue: Number(val.revenue.toFixed(2)),
        revenue: Number(val.revenue.toFixed(2)),
        units_sold: val.units,
      });
    });

    rows.sort((a, b) => b.revenue - a.revenue);
    if (query.limit) {
      rows.splice(query.limit);
    }
  }

  const executionTimeMs = Number((performance.now() - t0).toFixed(2));

  return {
    query,
    metrics_summary,
    rows,
    row_count: rows.length,
    execution_time_ms: executionTimeMs,
  };
}

export interface FunnelStepData {
  step: string;
  count: number;
  conversion: string;
  drop: string;
  rate: number;
}

export function calculateConversionFunnel(startDate: string, endDate: string): FunnelStepData[] {
  const data = loadDataset();
  const startStr = `${startDate} 00:00:00`;
  const endStr = `${endDate} 23:59:59`;

  const windowSessions = data.sessions.filter(
    (s) => s.session_start >= startStr && s.session_start <= endStr
  );

  const totalSessions = windowSessions.length;
  const productViews = windowSessions.filter((s) => s.has_product_view).length;
  const cartAdds = windowSessions.filter((s) => s.has_cart_add).length;
  const checkouts = windowSessions.filter((s) => s.has_checkout_start).length;
  const conversions = windowSessions.filter((s) => s.is_converted).length;

  const getDrop = (curr: number, prev: number) => {
    if (prev === 0) return '0.0%';
    const pct = ((prev - curr) / prev) * 100.0;
    return `-${pct.toFixed(1)}%`;
  };

  const getStepConv = (curr: number, prev: number) => {
    if (prev === 0) return '0.0%';
    return `${((curr / prev) * 100.0).toFixed(1)}%`;
  };

  return [
    {
      step: '1. Store Sessions',
      count: totalSessions,
      conversion: '100%',
      drop: '0.0%',
      rate: 100,
    },
    {
      step: '2. Product Views',
      count: productViews,
      conversion: getStepConv(productViews, totalSessions),
      drop: getDrop(productViews, totalSessions),
      rate: totalSessions > 0 ? (productViews / totalSessions) * 100 : 0,
    },
    {
      step: '3. Add to Cart',
      count: cartAdds,
      conversion: getStepConv(cartAdds, productViews),
      drop: getDrop(cartAdds, productViews),
      rate: totalSessions > 0 ? (cartAdds / totalSessions) * 100 : 0,
    },
    {
      step: '4. Checkout Started',
      count: checkouts,
      conversion: getStepConv(checkouts, cartAdds),
      drop: getDrop(checkouts, cartAdds),
      rate: totalSessions > 0 ? (checkouts / totalSessions) * 100 : 0,
    },
    {
      step: '5. Completed Purchase',
      count: conversions,
      conversion: getStepConv(conversions, checkouts),
      drop: getDrop(conversions, checkouts),
      rate: totalSessions > 0 ? (conversions / totalSessions) * 100 : 0,
    },
  ];
}
