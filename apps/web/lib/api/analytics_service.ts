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

interface Campaign {
  campaign_id: string;
  campaign_name: string;
  channel: string;
  campaign_type: string;
  budget: number;
  actual_spend: number;
  target_category: string;
  start_date: string;
  end_date: string;
}

interface DatasetCache {
  orders: Order[];
  orderItems: OrderItem[];
  sessions: Session[];
  products: Product[];
  customers: Customer[];
  campaigns: Campaign[];
  productMap: Map<string, Product>;
  customerMap: Map<string, Customer>;
  ordersMap: Map<string, Order>;
  campaignMap: Map<string, Campaign>;
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

  const campaigns = parseCsv<Campaign>(path.join(DATA_DIR, 'campaigns.csv'), (r) => ({
    campaign_id: r.campaign_id,
    campaign_name: r.campaign_name,
    channel: r.channel,
    campaign_type: r.campaign_type,
    budget: parseFloat(r.budget) || 0,
    actual_spend: parseFloat(r.actual_spend) || 0,
    target_category: r.target_category,
    start_date: r.start_date,
    end_date: r.end_date,
  }));

  const productMap = new Map<string, Product>();
  products.forEach((p) => productMap.set(p.product_id, p));

  const customerMap = new Map<string, Customer>();
  customers.forEach((c) => customerMap.set(c.customer_id, c));

  const ordersMap = new Map<string, Order>();
  orders.forEach((o) => ordersMap.set(o.order_id, o));

  const campaignMap = new Map<string, Campaign>();
  campaigns.forEach((camp) => campaignMap.set(camp.campaign_id, camp));

  cachedData = {
    orders,
    orderItems,
    sessions,
    products,
    customers,
    campaigns,
    productMap,
    customerMap,
    ordersMap,
    campaignMap,
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
    const compEnd = new Date(dStart.getTime() - 24 * 60 * 60 * 1000);
    const compStart = new Date(compEnd.getTime() - (durationDays - 1) * 24 * 60 * 60 * 1000);
    return [compStart.toISOString().slice(0, 10), compEnd.toISOString().slice(0, 10)];
  } else if (comparison === 'previous_year') {
    const compStart = new Date(dStart);
    compStart.setUTCFullYear(dStart.getUTCFullYear() - 1);
    const compEnd = new Date(dEnd);
    compEnd.setUTCFullYear(dEnd.getUTCFullYear() - 1);
    return [compStart.toISOString().slice(0, 10), compEnd.toISOString().slice(0, 10)];
  }

  return null;
}

function calculateMetric(
  metricId: MetricName,
  startDate: string,
  endDate: string,
  data: DatasetCache
): number {
  const startStr = `${startDate} 00:00:00`;
  const endStr = `${endDate} 23:59:59`;

  const completedOrders = data.orders.filter(
    (o) => o.status === 'Completed' && o.order_date >= startStr && o.order_date <= endStr
  );
  const completedOrderIds = new Set(completedOrders.map((o) => o.order_id));

  const itemsInCompleted = data.orderItems.filter((oi) => completedOrderIds.has(oi.order_id));

  const windowSessions = data.sessions.filter(
    (s) => s.session_start >= startStr && s.session_start <= endStr
  );

  switch (metricId) {
    case 'gross_revenue': {
      return itemsInCompleted.reduce((sum, item) => sum + item.total_item_revenue, 0);
    }
    case 'net_revenue': {
      return completedOrders.reduce((sum, o) => sum + (o.subtotal - o.discount_amount), 0);
    }
    case 'orders': {
      return completedOrders.length;
    }
    case 'average_order_value': {
      if (completedOrders.length === 0) return 0;
      const netRev = completedOrders.reduce((sum, o) => sum + (o.subtotal - o.discount_amount), 0);
      return netRev / completedOrders.length;
    }
    case 'sessions': {
      return windowSessions.length;
    }
    case 'conversion_rate': {
      if (windowSessions.length === 0) return 0;
      const converted = windowSessions.filter((s) => s.is_converted).length;
      return (converted / windowSessions.length) * 100.0;
    }
    case 'cart_abandonment_rate': {
      const carts = windowSessions.filter((s) => s.has_cart_add).length;
      if (carts === 0) return 0;
      const converted = windowSessions.filter((s) => s.has_cart_add && s.is_converted).length;
      return ((carts - converted) / carts) * 100.0;
    }
    case 'total_customers': {
      const uniqueCust = new Set(completedOrders.map((o) => o.customer_id));
      return uniqueCust.size;
    }
    case 'new_customers': {
      const firstOrderDateMap = new Map<string, string>();
      data.orders
        .filter((o) => o.status === 'Completed')
        .forEach((o) => {
          const curr = firstOrderDateMap.get(o.customer_id);
          if (!curr || o.order_date < curr) {
            firstOrderDateMap.set(o.customer_id, o.order_date);
          }
        });
      let newCount = 0;
      firstOrderDateMap.forEach((firstDate) => {
        if (firstDate >= startStr && firstDate <= endStr) {
          newCount++;
        }
      });
      return newCount;
    }
    case 'returning_customers': {
      const priorCusts = new Set(
        data.orders
          .filter((o) => o.status === 'Completed' && o.order_date < startStr)
          .map((o) => o.customer_id)
      );
      const currCusts = new Set(completedOrders.map((o) => o.customer_id));
      let returning = 0;
      currCusts.forEach((c) => {
        if (priorCusts.has(c)) returning++;
      });
      return returning;
    }
    case 'units_sold': {
      return itemsInCompleted.reduce((sum, item) => sum + item.quantity, 0);
    }
    case 'gross_margin': {
      const totalRev = itemsInCompleted.reduce((sum, item) => sum + item.total_item_revenue, 0);
      const totalCost = itemsInCompleted.reduce((sum, item) => sum + item.total_item_cost, 0);
      return totalRev - totalCost;
    }
    case 'gross_margin_rate': {
      const totalRev = itemsInCompleted.reduce((sum, item) => sum + item.total_item_revenue, 0);
      const totalCost = itemsInCompleted.reduce((sum, item) => sum + item.total_item_cost, 0);
      if (totalRev === 0) return 0;
      return ((totalRev - totalCost) / totalRev) * 100.0;
    }
    case 'revenue_per_customer': {
      const uniqueCust = new Set(completedOrders.map((o) => o.customer_id));
      if (uniqueCust.size === 0) return 0;
      const netRev = completedOrders.reduce((sum, o) => sum + (o.subtotal - o.discount_amount), 0);
      return netRev / uniqueCust.size;
    }
    case 'revenue_per_session': {
      if (windowSessions.length === 0) return 0;
      const netRev = completedOrders.reduce((sum, o) => sum + (o.subtotal - o.discount_amount), 0);
      return netRev / windowSessions.length;
    }
    case 'roas': {
      const campaignRev = completedOrders
        .filter((o) => !!o.campaign_id)
        .reduce((sum, o) => sum + (o.subtotal - o.discount_amount), 0);

      const campaignSpend = data.campaigns
        .filter((c) => c.start_date <= endDate && c.end_date >= startDate)
        .reduce((sum, c) => sum + c.actual_spend, 0);

      if (campaignSpend === 0) return 0;
      return campaignRev / campaignSpend;
    }
    default:
      return 0;
  }
}

export async function executeAnalyticsQuery(
  query: AnalyticsQuery
): Promise<AnalyticsQueryResult> {
  const t0 = performance.now();
  const data = loadDataset();

  const startStr = `${query.start_date} 00:00:00`;
  const endStr = `${query.end_date} 23:59:59`;

  const compDates = computeComparisonDates(
    query.start_date,
    query.end_date,
    query.comparison
  );

  const metrics_summary: Record<string, MetricSummaryValue> = {};

  for (const m of query.metrics) {
    const currVal = calculateMetric(m, query.start_date, query.end_date, data);
    let prevVal: number | null = null;
    let absDelta: number | null = null;
    let pctDelta: number | null = null;
    let isFavorable: boolean | null = null;

    if (compDates) {
      prevVal = calculateMetric(m, compDates[0], compDates[1], data);
      absDelta = Number((currVal - prevVal).toFixed(4));
      if (prevVal > 0) {
        pctDelta = Number((((currVal - prevVal) / prevVal) * 100.0).toFixed(2));
      } else {
        pctDelta = currVal > 0 ? 100.0 : 0.0;
      }

      const isFavorableUp = !['cart_abandonment_rate'].includes(m);
      isFavorable = isFavorableUp ? currVal >= prevVal : currVal <= prevVal;
    }

    let formatType: MetricSummaryValue['format_type'] = 'decimal';
    if (['gross_revenue', 'net_revenue', 'average_order_value', 'revenue_per_customer', 'revenue_per_session', 'gross_margin'].includes(m)) {
      formatType = 'currency';
    } else if (['orders', 'sessions', 'total_customers', 'new_customers', 'returning_customers', 'units_sold'].includes(m)) {
      formatType = 'integer';
    } else if (['conversion_rate', 'cart_abandonment_rate', 'gross_margin_rate'].includes(m)) {
      formatType = 'percentage';
    } else if (['roas'].includes(m)) {
      formatType = 'ratio';
    }

    metrics_summary[m] = {
      metric_id: m,
      current_value: Number(currVal.toFixed(4)),
      previous_value: prevVal !== null ? Number(prevVal.toFixed(4)) : null,
      absolute_delta: absDelta,
      percentage_delta: pctDelta,
      format_type: formatType,
      is_favorable_up: !['cart_abandonment_rate'].includes(m),
      is_favorable: isFavorable,
    };
  }

  const rows: Record<string, any>[] = [];

  if (query.time_grain) {
    const isWeekly = query.time_grain === 'week';
    const isDaily = query.time_grain === 'day';

    const completed = data.orders.filter(
      (o) => o.status === 'Completed' && o.order_date >= startStr && o.order_date <= endStr
    );

    const timeBuckets = new Map<string, { netRev: number; grossRev: number; orders: number }>();

    completed.forEach((o) => {
      const dt = new Date(o.order_date);
      let bucketKey = o.order_date.slice(0, 10);
      if (isWeekly) {
        const day = dt.getUTCDay();
        const diff = dt.getUTCDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(dt.setDate(diff));
        bucketKey = monday.toISOString().slice(0, 10);
      } else if (query.time_grain === 'month') {
        bucketKey = o.order_date.slice(0, 7) + '-01';
      }

      const curr = timeBuckets.get(bucketKey) || { netRev: 0, grossRev: 0, orders: 0 };
      curr.netRev += o.subtotal - o.discount_amount;
      curr.grossRev += o.total_revenue;
      curr.orders += 1;
      timeBuckets.set(bucketKey, curr);
    });

    const sortedBuckets = Array.from(timeBuckets.keys()).sort();
    sortedBuckets.forEach((bKey) => {
      const val = timeBuckets.get(bKey)!;
      rows.push({
        timestamp: bKey,
        date: bKey,
        gross_revenue: Number(val.grossRev.toFixed(2)),
        net_revenue: Number(val.netRev.toFixed(2)),
        orders: val.orders,
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
    const regionMap = new Map<string, { netRevenue: number; grossRevenue: number; orders: number }>();
    const completed = data.orders.filter(
      (o) => o.status === 'Completed' && o.order_date >= startStr && o.order_date <= endStr
    );
    const orderIds = new Set(completed.map((o) => o.order_id));
    const items = data.orderItems.filter((oi) => orderIds.has(oi.order_id));
    const orderItemsMap = new Map<string, number>();
    items.forEach((oi) => {
      orderItemsMap.set(oi.order_id, (orderItemsMap.get(oi.order_id) || 0) + oi.total_item_revenue);
    });

    completed.forEach((o) => {
      const cust = data.customerMap.get(o.customer_id);
      const reg = cust?.region || 'Other';
      const curr = regionMap.get(reg) || { netRevenue: 0, grossRevenue: 0, orders: 0 };
      curr.netRevenue += o.subtotal - o.discount_amount;
      curr.grossRevenue += orderItemsMap.get(o.order_id) || o.total_revenue;
      curr.orders += 1;
      regionMap.set(reg, curr);
    });

    const isGross = query.metrics.includes('gross_revenue');
    const totalRev = Array.from(regionMap.values()).reduce((a, b) => a + (isGross ? b.grossRevenue : b.netRevenue), 0);
    regionMap.forEach((val, reg) => {
      const revVal = isGross ? val.grossRevenue : val.netRevenue;
      rows.push({
        region: reg,
        name: reg,
        revenue: Number(revVal.toFixed(2)),
        net_revenue: Number(val.netRevenue.toFixed(2)),
        gross_revenue: Number(val.grossRevenue.toFixed(2)),
        orders: val.orders,
        share: totalRev > 0 ? Number(((revVal / totalRev) * 100.0).toFixed(1)) : 0,
        aov: val.orders > 0 ? Number((revVal / val.orders).toFixed(2)) : 0,
      });
    });

    rows.sort((a, b) => b.gross_revenue - a.gross_revenue);
  } else if (query.dimensions && query.dimensions.includes('device_type')) {
    // Device Breakdown
    const devMap = new Map<string, { total: number; converted: number; revenue: number }>();
    data.sessions
      .filter((s) => s.session_start >= startStr && s.session_start <= endStr)
      .forEach((s) => {
        const curr = devMap.get(s.device_type) || { total: 0, converted: 0, revenue: 0 };
        curr.total += 1;
        if (s.is_converted) curr.converted += 1;
        devMap.set(s.device_type, curr);
      });

    devMap.forEach((val, dev) => {
      const cr = val.total > 0 ? (val.converted * 100.0) / val.total : 0;
      rows.push({
        device_type: dev,
        name: dev,
        sessions: val.total,
        conversion_rate: Number(cr.toFixed(2)),
        orders: val.converted,
      });
    });
    rows.sort((a, b) => a.conversion_rate - b.conversion_rate);
  } else if (query.dimensions && query.dimensions.includes('channel')) {
    // Channel Breakdown
    const chanMap = new Map<string, { sessions: number; converted: number }>();
    data.sessions
      .filter((s) => s.session_start >= startStr && s.session_start <= endStr)
      .forEach((s) => {
        const curr = chanMap.get(s.channel) || { sessions: 0, converted: 0 };
        curr.sessions += 1;
        if (s.is_converted) curr.converted += 1;
        chanMap.set(s.channel, curr);
      });

    chanMap.forEach((val, ch) => {
      rows.push({
        channel: ch,
        name: ch,
        sessions: val.sessions,
        orders: val.converted,
      });
    });
    rows.sort((a, b) => b.sessions - a.sessions);
  } else if (query.dimensions && (query.dimensions.includes('campaign_name') || query.dimensions.includes('campaign_id'))) {
    // Campaign Breakdown
    const campMap = new Map<string, { revenue: number; name: string }>();
    const completed = data.orders.filter(
      (o) => o.status === 'Completed' && o.order_date >= startStr && o.order_date <= endStr && o.campaign_id
    );
    completed.forEach((o) => {
      const camp = data.campaignMap.get(o.campaign_id);
      const campName = camp?.campaign_name || o.campaign_id;
      const curr = campMap.get(o.campaign_id) || { revenue: 0, name: campName };
      curr.revenue += o.subtotal - o.discount_amount;
      campMap.set(o.campaign_id, curr);
    });

    campMap.forEach((val, cid) => {
      const camp = data.campaignMap.get(cid);
      const spend = camp ? camp.actual_spend : 0;
      const roas = spend > 0 ? val.revenue / spend : 0.0;
      rows.push({
        campaign_name: val.name,
        name: val.name,
        revenue: Number(val.revenue.toFixed(2)),
        roas: Number(roas.toFixed(2)),
      });
    });
    rows.sort((a, b) => b.roas - a.roas);
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
        name: prod?.title || pid,
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

  // Explicit OrderBy sorting if requested
  if (query.order_by && query.order_by.length > 0) {
    const ob = query.order_by[0];
    const field = ob.field;
    const isAsc = ob.direction === 'asc';
    rows.sort((a, b) => {
      const vA = a[field] !== undefined ? a[field] : (a.revenue ?? 0);
      const vB = b[field] !== undefined ? b[field] : (b.revenue ?? 0);
      return isAsc ? vA - vB : vB - vA;
    });
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
      rate: totalSessions > 0 ? (checkouts / totalAdds(totalSessions)) * 100 : 0,
    },
    {
      step: '5. Completed Purchase',
      count: conversions,
      conversion: getStepConv(conversions, checkouts),
      drop: getDrop(conversions, checkouts),
      rate: totalSessions > 0 ? (conversions / totalSessions) * 100 : 0,
    },
  ];

  function totalAdds(tot: number) {
    return tot > 0 ? tot : 1;
  }
}
