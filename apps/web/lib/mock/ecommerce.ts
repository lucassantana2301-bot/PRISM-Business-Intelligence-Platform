/**
 * PRISM E-Commerce Preview / Mock Data Boundary
 * 
 * Centralized, typed mock datasets for Phase 01/01.5 UI validation.
 * In Phase 02+, these mock sets will be superseded by real backend analytical queries.
 */

import { KPICardData, MetricName } from '../contracts/analytics';
import { InsightSeverity } from '@/components/ui/InsightCard';

// ==================== EXECUTIVE OVERVIEW KPIS ====================
export const mockExecutiveKPIs = [
  {
    metricId: 'gross_revenue' as MetricName,
    label: 'Gross Revenue',
    formattedValue: '$847,320',
    delta: 12.4,
    comparisonLabel: 'vs prev 30d ($753.8k)',
    isFavorable: true,
    sparklineData: [32, 38, 41, 39, 48, 52, 60, 58, 68, 74],
  },
  {
    metricId: 'orders' as MetricName,
    label: 'Total Orders',
    formattedValue: '14,290',
    delta: 8.1,
    comparisonLabel: 'vs prev 30d (13.2k)',
    isFavorable: true,
    sparklineData: [28, 30, 35, 34, 40, 42, 45, 43, 50, 54],
  },
  {
    metricId: 'conversion_rate' as MetricName,
    label: 'Conversion Rate',
    formattedValue: '3.42%',
    delta: -0.3,
    comparisonLabel: 'vs prev 30d (3.72%)',
    isFavorable: true,
    sparklineData: [4.2, 4.0, 3.8, 3.9, 3.7, 3.5, 3.6, 3.4, 3.5, 3.42],
  },
  {
    metricId: 'average_order_value' as MetricName,
    label: 'Average Order Value',
    formattedValue: '$59.30',
    delta: 4.0,
    comparisonLabel: 'vs prev 30d ($57.02)',
    isFavorable: true,
    sparklineData: [55, 56, 55, 57, 58, 57, 59, 58, 60, 59.3],
  },
];

// ==================== REVENUE & ORDERS TIME-SERIES ====================
export interface TimeSeriesDataPoint {
  date: string;
  current: number;
  previous: number;
  orders: number;
}

export const mockRevenueTrendData: TimeSeriesDataPoint[] = [
  { date: 'Oct 01', current: 24200, previous: 21800, orders: 412 },
  { date: 'Oct 05', current: 28400, previous: 25100, orders: 489 },
  { date: 'Oct 10', current: 26100, previous: 24300, orders: 440 },
  { date: 'Oct 15', current: 34500, previous: 27900, orders: 580 },
  { date: 'Oct 20', current: 31200, previous: 29400, orders: 510 },
  { date: 'Oct 25', current: 39800, previous: 32000, orders: 660 },
  { date: 'Oct 30', current: 42300, previous: 35100, orders: 710 },
];

// ==================== CATEGORY DISTRIBUTION ====================
export interface CategoryShare {
  name: string;
  revenue: number;
  share: number;
  color: string;
}

export const mockCategoryData: CategoryShare[] = [
  { name: 'Electronics', revenue: 342000, share: 40.4, color: '#3B82F6' },
  { name: 'Apparel', revenue: 218500, share: 25.8, color: '#10B981' },
  { name: 'Home & Living', revenue: 164200, share: 19.4, color: '#8B5CF6' },
  { name: 'Beauty & Health', revenue: 84620, share: 10.0, color: '#F59E0B' },
  { name: 'Accessories', revenue: 38000, share: 4.4, color: '#06B6D4' },
];

// ==================== REGIONAL PERFORMANCE ====================
export interface RegionalPerformance {
  region: string;
  revenue: string;
  share: string;
  growth: string;
}

export const mockRegionalData: RegionalPerformance[] = [
  { region: 'Southeast (SP/RJ/MG)', revenue: '$482,972', share: '57.0%', growth: '+14.8%' },
  { region: 'South (RS/SC/PR)', revenue: '$177,937', share: '21.0%', growth: '+9.2%' },
  { region: 'Northeast', revenue: '$110,151', share: '13.0%', growth: '+6.4%' },
  { region: 'Midwest & North', revenue: '$76,260', share: '9.0%', growth: '+3.1%' },
];

// ==================== CONVERSION FUNNEL ====================
export interface FunnelStep {
  step: string;
  count: string;
  conversion: string;
  drop: string;
}

export const mockFunnelSteps: FunnelStep[] = [
  { step: '1. Store Sessions', count: '417,840', conversion: '100%', drop: '-' },
  { step: '2. Product Views', count: '284,130', conversion: '68.0%', drop: '-32.0%' },
  { step: '3. Cart Adds', count: '62,670', conversion: '15.0%', drop: '-77.9%' },
  { step: '4. Checkout Started', count: '29,240', conversion: '7.0%', drop: '-53.3%' },
  { step: '5. Completed Orders', count: '14,290', conversion: '3.42%', drop: '-51.1%' },
];

// ==================== ACQUISITION CHANNELS ====================
export interface ChannelPerformance {
  channel: string;
  revenue: number;
  spend: number;
  roas: string;
  orders: number;
}

export const mockChannelData: ChannelPerformance[] = [
  { channel: 'Organic Search', revenue: 312000, spend: 0, roas: 'N/A', orders: 5240 },
  { channel: 'Paid Search (Google)', revenue: 268000, spend: 54000, roas: '4.96x', orders: 4410 },
  { channel: 'Social Ads (Meta)', revenue: 142000, spend: 38000, roas: '3.73x', orders: 2390 },
  { channel: 'Email Marketing', revenue: 84000, spend: 4200, roas: '20.0x', orders: 1480 },
  { channel: 'Direct / Referral', revenue: 41320, spend: 0, roas: 'N/A', orders: 770 },
];

export interface DevicePerformance {
  device: string;
  share: number;
  aov: string;
  conversion: string;
}

export const mockDeviceData: DevicePerformance[] = [
  { device: 'Desktop', share: 54, aov: '$68.40', conversion: '4.1%' },
  { device: 'Mobile (iOS)', share: 32, aov: '$52.10', conversion: '2.9%' },
  { device: 'Mobile (Android)', share: 14, aov: '$44.80', conversion: '2.4%' },
];

// ==================== SAMPLE ORDERS DATA ====================
export interface OrderRecord {
  order_id: string;
  customer_id: string;
  customer_name: string;
  category: string;
  region: string;
  total_revenue: string;
  payment_method: string;
  status: 'Completed' | 'Processing' | 'Pending';
  order_date: string;
}

export const mockOrdersData: OrderRecord[] = [
  { order_id: 'ORD-8921', customer_id: 'CUST-1049', customer_name: 'Lucas Silveira', category: 'Electronics', region: 'SP', total_revenue: '$349.00', payment_method: 'PIX', status: 'Completed', order_date: '2026-10-30 14:22' },
  { order_id: 'ORD-8920', customer_id: 'CUST-2914', customer_name: 'Mariana Duarte', category: 'Apparel', region: 'RJ', total_revenue: '$129.50', payment_method: 'Credit Card', status: 'Completed', order_date: '2026-10-30 14:18' },
  { order_id: 'ORD-8919', customer_id: 'CUST-5831', customer_name: 'Gabriel Costa', category: 'Home & Living', region: 'MG', total_revenue: '$89.00', payment_method: 'PIX', status: 'Processing', order_date: '2026-10-30 14:05' },
  { order_id: 'ORD-8918', customer_id: 'CUST-9012', customer_name: 'Beatriz Almeida', category: 'Electronics', region: 'RS', total_revenue: '$899.00', payment_method: 'Credit Card', status: 'Completed', order_date: '2026-10-30 13:47' },
  { order_id: 'ORD-8917', customer_id: 'CUST-3310', customer_name: 'Thiago Martins', category: 'Beauty & Health', region: 'PR', total_revenue: '$45.20', payment_method: 'Credit Card', status: 'Completed', order_date: '2026-10-30 13:30' },
  { order_id: 'ORD-8916', customer_id: 'CUST-7729', customer_name: 'Camila Rocha', category: 'Apparel', region: 'SP', total_revenue: '$210.00', payment_method: 'PIX', status: 'Completed', order_date: '2026-10-30 13:12' },
  { order_id: 'ORD-8915', customer_id: 'CUST-4109', customer_name: 'Rafael Mendes', category: 'Electronics', region: 'BA', total_revenue: '$620.00', payment_method: 'Boleto', status: 'Pending', order_date: '2026-10-30 12:55' },
  { order_id: 'ORD-8914', customer_id: 'CUST-8830', customer_name: 'Juliana Paes', category: 'Home & Living', region: 'SC', total_revenue: '$149.90', payment_method: 'Credit Card', status: 'Completed', order_date: '2026-10-30 12:40' },
  { order_id: 'ORD-8913', customer_id: 'CUST-1192', customer_name: 'Felipe Santos', category: 'Accessories', region: 'SP', total_revenue: '$38.00', payment_method: 'PIX', status: 'Completed', order_date: '2026-10-30 12:15' },
  { order_id: 'ORD-8912', customer_id: 'CUST-6501', customer_name: 'Larissa Lima', category: 'Electronics', region: 'DF', total_revenue: '$450.00', payment_method: 'Credit Card', status: 'Completed', order_date: '2026-10-30 11:58' },
];

// ==================== UNIFIED MOCK INSIGHTS ====================
export interface InsightItem {
  id: string;
  title: string;
  description: string;
  severity: InsightSeverity;
  metricLabel: string;
  metricValue: string;
  impact: string;
  timestamp: string;
}

export const mockInsightsData: InsightItem[] = [
  {
    id: 'ins-1',
    title: 'Mobile Checkout Gateway Conversion Drop',
    description: 'A 22% drop in conversion on Mobile iOS was detected between 10:00 and 13:00. Correlates with third-party payment gateway latency increase.',
    severity: 'critical',
    metricLabel: 'Estimated Revenue Loss',
    metricValue: '$18,400',
    impact: '-22% CR Drop',
    timestamp: '28m ago',
  },
  {
    id: 'ins-2',
    title: 'Electronics Category Flash Surge in Southeast',
    description: 'São Paulo and Rio de Janeiro registered a 3.4x spike in Smartphone Accessories and Audio gear following the morning promotional email push.',
    severity: 'opportunity',
    metricLabel: 'Attributed Net Revenue',
    metricValue: '+$64,200',
    impact: '+340% Lift',
    timestamp: '45m ago',
  },
  {
    id: 'ins-3',
    title: 'Paid Ads ROAS Degradation in Beauty Campaign',
    description: 'Cost per acquisition (CAC) on Meta Ads increased by 38% for the "Spring Glow" campaign without corresponding conversion improvement.',
    severity: 'warning',
    metricLabel: 'Ad Spend Inefficiency',
    metricValue: '$6,200',
    impact: '1.4x CAC Rise',
    timestamp: '2h ago',
  },
  {
    id: 'ins-4',
    title: 'Returning Customer Retention Index Growth',
    description: 'Customers with 3+ previous orders generated 42% of total order value this week, up from a 30-day baseline of 35%.',
    severity: 'opportunity',
    metricLabel: 'Repeat Order Value',
    metricValue: '$355,800',
    impact: '+7% Baseline Shift',
    timestamp: '3h ago',
  },
  {
    id: 'ins-5',
    title: 'Cart Abandonment Anomaly in Home & Living',
    description: 'Cart abandonment for items above $300 increased to 84% on desktop, suggesting potential shipping cost friction at final checkout step.',
    severity: 'warning',
    metricLabel: 'Unrealized Pipeline',
    metricValue: '$24,900',
    impact: '+12% Abandonment',
    timestamp: '5h ago',
  },
];
