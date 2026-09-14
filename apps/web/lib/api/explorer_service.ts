/**
 * PRISM Server Data Explorer Service & Execution Adapter
 * Executes structured server-side pagination, sorting, filtering, text search,
 * and safe CSV streaming export matching apps/api/src/explorer/* specifications.
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  DatasetMetadata,
  ExplorerQuery,
  ExplorerQueryResult,
  ExplorerExportQuery,
  ExplorerFilter,
  ColumnMetadata,
} from '@/lib/contracts/explorer';

const DATA_DIR = path.resolve(process.cwd(), '../../data/generated/csv');

// ==================== CANONICAL DATASET REGISTRY ====================
export const DATASET_REGISTRY: Record<string, DatasetMetadata> = {
  orders: {
    dataset_id: 'orders',
    display_name: 'Orders',
    description: 'Customer transactions, fulfillment statuses, payment channels, and financial totals.',
    table_name: 'orders',
    primary_key: 'order_id',
    default_columns: ['order_id', 'customer_id', 'status', 'total_revenue', 'payment_method', 'channel', 'order_date'],
    columns: [
      { name: 'order_id', display_name: 'Order ID', data_type: 'string', description: 'Unique order reference', nullable: false, filterable: true, sortable: true, searchable: true, format_type: 'text' },
      { name: 'customer_id', display_name: 'Customer ID', data_type: 'string', description: 'Associated customer reference', nullable: false, filterable: true, sortable: true, searchable: true, format_type: 'text' },
      { name: 'campaign_id', display_name: 'Campaign ID', data_type: 'string', description: 'Associated marketing campaign', nullable: true, filterable: true, sortable: true, searchable: false, format_type: 'text' },
      { name: 'status', display_name: 'Status', data_type: 'string', description: 'Order fulfillment state', nullable: false, filterable: true, sortable: true, searchable: false, format_type: 'badge' },
      { name: 'subtotal', display_name: 'Subtotal', data_type: 'float', description: 'Items total before discounts and taxes', nullable: false, filterable: true, sortable: true, searchable: false, format_type: 'currency' },
      { name: 'discount_amount', display_name: 'Discount', data_type: 'float', description: 'Total promotional discount applied', nullable: false, filterable: true, sortable: true, searchable: false, format_type: 'currency' },
      { name: 'tax_amount', display_name: 'Tax', data_type: 'float', description: 'Calculated sales tax', nullable: false, filterable: true, sortable: true, searchable: false, format_type: 'currency' },
      { name: 'shipping_amount', display_name: 'Shipping', data_type: 'float', description: 'Shipping fee charged', nullable: false, filterable: true, sortable: true, searchable: false, format_type: 'currency' },
      { name: 'total_revenue', display_name: 'Total Revenue', data_type: 'float', description: 'Gross order amount paid by customer', nullable: false, filterable: true, sortable: true, searchable: false, format_type: 'currency' },
      { name: 'payment_method', display_name: 'Payment Method', data_type: 'string', description: 'Payment method used', nullable: false, filterable: true, sortable: true, searchable: false, format_type: 'text' },
      { name: 'channel', display_name: 'Channel', data_type: 'string', description: 'Acquisition touchpoint', nullable: false, filterable: true, sortable: true, searchable: false, format_type: 'text' },
      { name: 'device_type', display_name: 'Device Type', data_type: 'string', description: 'Device category', nullable: false, filterable: true, sortable: true, searchable: false, format_type: 'text' },
      { name: 'order_date', display_name: 'Order Timestamp', data_type: 'datetime', description: 'Timestamp when order was placed', nullable: false, filterable: true, sortable: true, searchable: false, format_type: 'datetime' },
    ],
  },
  order_items: {
    dataset_id: 'order_items',
    display_name: 'Order Items',
    description: 'Line-item merchandise sales records with unit prices and product cost margins.',
    table_name: 'order_items',
    primary_key: 'item_id',
    default_columns: ['item_id', 'order_id', 'product_id', 'quantity', 'unit_price', 'total_item_revenue', 'total_item_cost'],
    columns: [
      { name: 'item_id', display_name: 'Item ID', data_type: 'string', description: 'Unique line item reference', nullable: false, filterable: true, sortable: true, searchable: true, format_type: 'text' },
      { name: 'order_id', display_name: 'Order ID', data_type: 'string', description: 'Associated parent order', nullable: false, filterable: true, sortable: true, searchable: true, format_type: 'text' },
      { name: 'product_id', display_name: 'Product ID', data_type: 'string', description: 'Product catalog SKU identifier', nullable: false, filterable: true, sortable: true, searchable: true, format_type: 'text' },
      { name: 'quantity', display_name: 'Quantity', data_type: 'integer', description: 'Units purchased', nullable: false, filterable: true, sortable: true, searchable: false, format_type: 'integer' },
      { name: 'unit_price', display_name: 'Unit Price', data_type: 'float', description: 'Sales price per unit', nullable: false, filterable: true, sortable: true, searchable: false, format_type: 'currency' },
      { name: 'unit_cost', display_name: 'Unit Cost', data_type: 'float', description: 'Production cost per unit', nullable: false, filterable: true, sortable: true, searchable: false, format_type: 'currency' },
      { name: 'total_item_revenue', display_name: 'Item Revenue', data_type: 'float', description: 'Gross revenue (quantity * unit_price)', nullable: false, filterable: true, sortable: true, searchable: false, format_type: 'currency' },
      { name: 'total_item_cost', display_name: 'Item Cost', data_type: 'float', description: 'Total COGS (quantity * unit_cost)', nullable: false, filterable: true, sortable: true, searchable: false, format_type: 'currency' },
    ],
  },
  sessions: {
    dataset_id: 'sessions',
    display_name: 'Store Sessions',
    description: 'Web and mobile browsing visits, duration, funnel events, and conversion flags.',
    table_name: 'sessions',
    primary_key: 'session_id',
    default_columns: ['session_id', 'channel', 'device_type', 'region', 'duration_seconds', 'page_views', 'is_converted', 'session_start'],
    columns: [
      { name: 'session_id', display_name: 'Session ID', data_type: 'string', description: 'Unique session tracking ID', nullable: false, filterable: true, sortable: true, searchable: true, format_type: 'text' },
      { name: 'customer_id', display_name: 'Customer ID', data_type: 'string', description: 'Customer ID if logged in', nullable: true, filterable: true, sortable: true, searchable: true, format_type: 'text' },
      { name: 'campaign_id', display_name: 'Campaign ID', data_type: 'string', description: 'Attributed ad campaign', nullable: true, filterable: true, sortable: true, searchable: false, format_type: 'text' },
      { name: 'device_type', display_name: 'Device', data_type: 'string', description: 'Client device', nullable: false, filterable: true, sortable: true, searchable: false, format_type: 'text' },
      { name: 'browser', display_name: 'Browser', data_type: 'string', description: 'Web browser used', nullable: false, filterable: true, sortable: true, searchable: false, format_type: 'text' },
      { name: 'channel', display_name: 'Channel', data_type: 'string', description: 'Traffic channel source', nullable: false, filterable: true, sortable: true, searchable: false, format_type: 'text' },
      { name: 'region', display_name: 'Region', data_type: 'string', description: 'Geographic macro-region', nullable: false, filterable: true, sortable: true, searchable: false, format_type: 'text' },
      { name: 'state', display_name: 'State', data_type: 'string', description: 'State code', nullable: false, filterable: true, sortable: true, searchable: false, format_type: 'text' },
      { name: 'duration_seconds', display_name: 'Duration (s)', data_type: 'integer', description: 'Session length in seconds', nullable: false, filterable: true, sortable: true, searchable: false, format_type: 'integer' },
      { name: 'page_views', display_name: 'Page Views', data_type: 'integer', description: 'Total pages viewed', nullable: false, filterable: true, sortable: true, searchable: false, format_type: 'integer' },
      { name: 'has_product_view', display_name: 'Viewed Product', data_type: 'boolean', description: 'Whether product was viewed', nullable: false, filterable: true, sortable: true, searchable: false, format_type: 'boolean' },
      { name: 'has_cart_add', display_name: 'Added to Cart', data_type: 'boolean', description: 'Whether item added to cart', nullable: false, filterable: true, sortable: true, searchable: false, format_type: 'boolean' },
      { name: 'has_checkout_start', display_name: 'Started Checkout', data_type: 'boolean', description: 'Whether checkout initiated', nullable: false, filterable: true, sortable: true, searchable: false, format_type: 'boolean' },
      { name: 'is_converted', display_name: 'Converted', data_type: 'boolean', description: 'Whether order completed', nullable: false, filterable: true, sortable: true, searchable: false, format_type: 'boolean' },
      { name: 'order_id', display_name: 'Order ID', data_type: 'string', description: 'Generated order ID', nullable: true, filterable: true, sortable: true, searchable: false, format_type: 'text' },
      { name: 'session_start', display_name: 'Session Start', data_type: 'datetime', description: 'Visit initiation timestamp', nullable: false, filterable: true, sortable: true, searchable: false, format_type: 'datetime' },
    ],
  },
  products: {
    dataset_id: 'products',
    display_name: 'Products Catalog',
    description: 'Merchandise inventory, department categories, base prices, and margin targets.',
    table_name: 'products',
    primary_key: 'product_id',
    default_columns: ['product_id', 'sku', 'title', 'category', 'subcategory', 'base_price', 'unit_cost', 'margin_rate', 'is_active'],
    columns: [
      { name: 'product_id', display_name: 'Product ID', data_type: 'string', description: 'Internal product key', nullable: false, filterable: true, sortable: true, searchable: true, format_type: 'text' },
      { name: 'sku', display_name: 'SKU', data_type: 'string', description: 'Inventory SKU code', nullable: false, filterable: true, sortable: true, searchable: true, format_type: 'text' },
      { name: 'title', display_name: 'Product Title', data_type: 'string', description: 'Commercial product title', nullable: false, filterable: true, sortable: true, searchable: true, format_type: 'text' },
      { name: 'category', display_name: 'Category', data_type: 'string', description: 'Main department', nullable: false, filterable: true, sortable: true, searchable: false, format_type: 'text' },
      { name: 'subcategory', display_name: 'Subcategory', data_type: 'string', description: 'Category hierarchy', nullable: false, filterable: true, sortable: true, searchable: false, format_type: 'text' },
      { name: 'base_price', display_name: 'Base Price', data_type: 'float', description: 'Catalog list price', nullable: false, filterable: true, sortable: true, searchable: false, format_type: 'currency' },
      { name: 'unit_cost', display_name: 'Unit Cost', data_type: 'float', description: 'Inventory production cost', nullable: false, filterable: true, sortable: true, searchable: false, format_type: 'currency' },
      { name: 'margin_rate', display_name: 'Margin Rate', data_type: 'float', description: 'Target profit margin', nullable: false, filterable: true, sortable: true, searchable: false, format_type: 'percentage' },
      { name: 'is_active', display_name: 'Active', data_type: 'boolean', description: 'Whether product is active', nullable: false, filterable: true, sortable: true, searchable: false, format_type: 'boolean' },
    ],
  },
  customers: {
    dataset_id: 'customers',
    display_name: 'Customers',
    description: 'Buyer profiles, geographic locations, and customer segmentation tiers.',
    table_name: 'customers',
    primary_key: 'customer_id',
    default_columns: ['customer_id', 'full_name', 'email', 'region', 'state', 'city', 'customer_segment', 'created_at'],
    columns: [
      { name: 'customer_id', display_name: 'Customer ID', data_type: 'string', description: 'Unique customer ID', nullable: false, filterable: true, sortable: true, searchable: true, format_type: 'text' },
      { name: 'full_name', display_name: 'Full Name', data_type: 'string', description: 'Customer full name', nullable: false, filterable: true, sortable: true, searchable: true, format_type: 'text' },
      { name: 'email', display_name: 'Email', data_type: 'string', description: 'Customer email address', nullable: false, filterable: true, sortable: true, searchable: true, format_type: 'text' },
      { name: 'region', display_name: 'Region', data_type: 'string', description: 'Geographic macro-region', nullable: false, filterable: true, sortable: true, searchable: false, format_type: 'text' },
      { name: 'state', display_name: 'State', data_type: 'string', description: 'State identifier', nullable: false, filterable: true, sortable: true, searchable: false, format_type: 'text' },
      { name: 'city', display_name: 'City', data_type: 'string', description: 'City location', nullable: false, filterable: true, sortable: true, searchable: true, format_type: 'text' },
      { name: 'customer_segment', display_name: 'Segment', data_type: 'string', description: 'RFM tier (VIP, Regular, At-Risk, etc.)', nullable: false, filterable: true, sortable: true, searchable: false, format_type: 'badge' },
      { name: 'created_at', display_name: 'Account Created', data_type: 'datetime', description: 'Registration timestamp', nullable: false, filterable: true, sortable: true, searchable: false, format_type: 'datetime' },
    ],
  },
  campaigns: {
    dataset_id: 'campaigns',
    display_name: 'Marketing Campaigns',
    description: 'Ad campaigns, channels, allocated budgets, and actual marketing expenditures.',
    table_name: 'campaigns',
    primary_key: 'campaign_id',
    default_columns: ['campaign_id', 'campaign_name', 'channel', 'campaign_type', 'budget', 'actual_spend', 'target_category', 'start_date', 'end_date'],
    columns: [
      { name: 'campaign_id', display_name: 'Campaign ID', data_type: 'string', description: 'Unique campaign key', nullable: false, filterable: true, sortable: true, searchable: true, format_type: 'text' },
      { name: 'campaign_name', display_name: 'Campaign Name', data_type: 'string', description: 'Campaign promotional title', nullable: false, filterable: true, sortable: true, searchable: true, format_type: 'text' },
      { name: 'channel', display_name: 'Channel', data_type: 'string', description: 'Ad network channel', nullable: false, filterable: true, sortable: true, searchable: false, format_type: 'text' },
      { name: 'campaign_type', display_name: 'Type', data_type: 'string', description: 'Promotion category', nullable: false, filterable: true, sortable: true, searchable: false, format_type: 'text' },
      { name: 'budget', display_name: 'Budget', data_type: 'float', description: 'Allocated budget', nullable: false, filterable: true, sortable: true, searchable: false, format_type: 'currency' },
      { name: 'actual_spend', display_name: 'Actual Spend', data_type: 'float', description: 'Realized spend', nullable: false, filterable: true, sortable: true, searchable: false, format_type: 'currency' },
      { name: 'target_category', display_name: 'Target Category', data_type: 'string', description: 'Promoted category', nullable: false, filterable: true, sortable: true, searchable: false, format_type: 'text' },
      { name: 'start_date', display_name: 'Start Date', data_type: 'date', description: 'Launch date', nullable: false, filterable: true, sortable: true, searchable: false, format_type: 'text' },
      { name: 'end_date', display_name: 'End Date', data_type: 'date', description: 'Conclusion date', nullable: false, filterable: true, sortable: true, searchable: false, format_type: 'text' },
    ],
  },
};

// Cached in-memory raw tables for high-performance server query evaluation
const rawTableCache: Map<string, Record<string, any>[]> = new Map();

function loadRawTable(datasetId: string): Record<string, any>[] {
  if (rawTableCache.has(datasetId)) {
    return rawTableCache.get(datasetId)!;
  }

  let filePath = path.join(DATA_DIR, `${datasetId}.csv`);
  if (!fs.existsSync(filePath)) {
    const altPath = path.resolve(__dirname, '../../../../data/generated/csv', `${datasetId}.csv`);
    if (fs.existsSync(altPath)) filePath = altPath;
    else return [];
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.trim().split('\n');
  if (lines.length <= 1) return [];

  const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
  const meta = DATASET_REGISTRY[datasetId];
  const colTypes = new Map(meta.columns.map((c) => [c.name, c.data_type]));

  const rows: Record<string, any>[] = [];

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

    const row: Record<string, any> = {};
    headers.forEach((h, idx) => {
      const valStr = values[idx] !== undefined ? values[idx] : '';
      const dtype = colTypes.get(h);

      if (dtype === 'integer') {
        row[h] = valStr !== '' ? parseInt(valStr, 10) || 0 : null;
      } else if (dtype === 'float') {
        row[h] = valStr !== '' ? parseFloat(valStr) || 0.0 : null;
      } else if (dtype === 'boolean') {
        row[h] = valStr === 'true';
      } else {
        row[h] = valStr;
      }
    });
    rows.push(row);
  }

  rawTableCache.set(datasetId, rows);
  return rows;
}

export function getDatasetList(): (DatasetMetadata & { row_count: number })[] {
  return Object.values(DATASET_REGISTRY).map((meta) => {
    const rows = loadRawTable(meta.dataset_id);
    return {
      ...meta,
      row_count: rows.length,
    };
  });
}

export function getDatasetSchema(datasetId: string): DatasetMetadata {
  const meta = DATASET_REGISTRY[datasetId];
  if (!meta) {
    throw new Error(`Unknown or non-allowlisted dataset '${datasetId}'.`);
  }
  return meta;
}

function matchesFilter(row: Record<string, any>, filter: ExplorerFilter, meta: DatasetMetadata): boolean {
  const colDef = meta.columns.find((c) => c.name === filter.column);
  if (!colDef) return false;

  const val = row[filter.column];
  const target = filter.value;

  switch (filter.operator) {
    case 'eq':
      if (typeof val === 'string') return String(val).toLowerCase() === String(target).toLowerCase();
      return val === target;

    case 'neq':
      if (typeof val === 'string') return String(val).toLowerCase() !== String(target).toLowerCase();
      return val !== target;

    case 'contains':
      return String(val ?? '').toLowerCase().includes(String(target).toLowerCase());

    case 'in':
      if (!Array.isArray(target)) return false;
      return target.some((t) => (typeof val === 'string' ? String(val).toLowerCase() === String(t).toLowerCase() : val === t));

    case 'not_in':
      if (!Array.isArray(target)) return true;
      return !target.some((t) => (typeof val === 'string' ? String(val).toLowerCase() === String(t).toLowerCase() : val === t));

    case 'gt':
      return val > target;

    case 'gte':
      return val >= target;

    case 'lt':
      return val < target;

    case 'lte':
      return val <= target;

    case 'between':
      if (!Array.isArray(target) || target.length !== 2) return false;
      return val >= target[0] && val <= target[1];

    default:
      return true;
  }
}

export async function executeExplorerQuery(query: ExplorerQuery): Promise<ExplorerQueryResult> {
  const t0 = performance.now();

  const meta = DATASET_REGISTRY[query.dataset];
  if (!meta) {
    throw new Error(`Unknown or non-allowlisted dataset '${query.dataset}'.`);
  }

  const allRows = loadRawTable(query.dataset);
  const colMap = new Map(meta.columns.map((c) => [c.name, c]));

  // 1. Validate Columns
  const projectedCols = query.columns || meta.default_columns;
  for (const c of projectedCols) {
    if (!colMap.has(c)) {
      throw new Error(`Column '${c}' is not allowed in dataset '${query.dataset}'.`);
    }
  }

  // 2. Validate and Apply Filters
  let filtered = allRows;
  if (query.filters && query.filters.length > 0) {
    for (const f of query.filters) {
      if (!colMap.has(f.column)) {
        throw new Error(`Filter column '${f.column}' is not valid for '${query.dataset}'.`);
      }
      const colDef = colMap.get(f.column)!;
      if (!colDef.filterable) {
        throw new Error(`Column '${f.column}' is not filterable.`);
      }
    }
    filtered = filtered.filter((row) => query.filters!.every((f) => matchesFilter(row, f, meta)));
  }

  // 3. Apply Text Search (Searchable columns only)
  if (query.search && query.search.trim()) {
    const term = query.search.trim().toLowerCase();
    const searchableCols = meta.columns.filter((c) => c.searchable).map((c) => c.name);
    if (searchableCols.length > 0) {
      filtered = filtered.filter((row) =>
        searchableCols.some((c) => String(row[c] ?? '').toLowerCase().includes(term))
      );
    }
  }

  // 4. Sort
  if (query.sort_by) {
    if (!colMap.has(query.sort_by)) {
      throw new Error(`Sort column '${query.sort_by}' is not valid for '${query.dataset}'.`);
    }
    const sortColDef = colMap.get(query.sort_by)!;
    if (!sortColDef.sortable) {
      throw new Error(`Column '${query.sort_by}' is not sortable.`);
    }

    const sortDir = query.sort_direction === 'asc' ? 1 : -1;
    const sortKey = query.sort_by;

    filtered = [...filtered].sort((a, b) => {
      const va = a[sortKey];
      const vb = b[sortKey];
      if (va === vb) return 0;
      if (va === null || va === undefined) return 1;
      if (vb === null || vb === undefined) return -1;
      if (va < vb) return -1 * sortDir;
      return 1 * sortDir;
    });
  }

  // 5. Paginate (Hard limit page_size <= 100)
  const pageSize = Math.min(Math.max(query.page_size || 25, 1), 100);
  const page = Math.max(query.page || 1, 1);
  const totalRows = filtered.length;
  const totalPages = Math.max(Math.ceil(totalRows / pageSize), 1);
  const offset = (page - 1) * pageSize;

  const paginatedRows = filtered.slice(offset, offset + pageSize).map((r) => {
    const projectedRow: Record<string, any> = {};
    projectedCols.forEach((col) => {
      projectedRow[col] = r[col];
    });
    return projectedRow;
  });

  const executionTimeMs = Number((performance.now() - t0).toFixed(2));

  return {
    dataset: query.dataset,
    rows: paginatedRows,
    page,
    page_size: pageSize,
    total_rows: totalRows,
    total_pages: totalPages,
    execution_time_ms: executionTimeMs,
  };
}

export function exportExplorerCsv(query: ExplorerExportQuery): string {
  const meta = DATASET_REGISTRY[query.dataset];
  if (!meta) {
    throw new Error(`Unknown or non-allowlisted dataset '${query.dataset}'.`);
  }

  const allRows = loadRawTable(query.dataset);
  const colMap = new Map(meta.columns.map((c) => [c.name, c]));
  const projectedCols = query.columns || meta.default_columns;

  for (const c of projectedCols) {
    if (!colMap.has(c)) {
      throw new Error(`Column '${c}' is not allowed in dataset '${query.dataset}'.`);
    }
  }

  let filtered = allRows;
  if (query.filters && query.filters.length > 0) {
    filtered = filtered.filter((row) => query.filters!.every((f) => matchesFilter(row, f, meta)));
  }

  if (query.search && query.search.trim()) {
    const term = query.search.trim().toLowerCase();
    const searchableCols = meta.columns.filter((c) => c.searchable).map((c) => c.name);
    if (searchableCols.length > 0) {
      filtered = filtered.filter((row) =>
        searchableCols.some((c) => String(row[c] ?? '').toLowerCase().includes(term))
      );
    }
  }

  if (query.sort_by && colMap.has(query.sort_by)) {
    const sortDir = query.sort_direction === 'asc' ? 1 : -1;
    const sortKey = query.sort_by;
    filtered = [...filtered].sort((a, b) => {
      const va = a[sortKey];
      const vb = b[sortKey];
      if (va === vb) return 0;
      if (va === null || va === undefined) return 1;
      if (vb === null || vb === undefined) return -1;
      if (va < vb) return -1 * sortDir;
      return 1 * sortDir;
    });
  }

  const limit = Math.min(Math.max(query.limit || 5000, 1), 5000);
  const exportedRows = filtered.slice(0, limit);

  // CSV formatting with Formula Injection Protection
  const lines: string[] = [];
  lines.push(projectedCols.join(','));

  for (const row of exportedRows) {
    const values = projectedCols.map((col) => {
      let val = row[col];
      let strVal = val !== null && val !== undefined ? String(val) : '';

      // Formula Injection Neutralization
      if (strVal.startsWith('=') || strVal.startsWith('+') || strVal.startsWith('-') || strVal.startsWith('@')) {
        strVal = `'${strVal}`;
      }

      if (strVal.includes(',') || strVal.includes('"') || strVal.includes('\n')) {
        strVal = `"${strVal.replace(/"/g, '""')}"`;
      }
      return strVal;
    });
    lines.push(values.join(','));
  }

  return lines.join('\n');
}
