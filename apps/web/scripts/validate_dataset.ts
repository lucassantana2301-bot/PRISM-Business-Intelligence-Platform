import * as fs from 'fs';
import * as path from 'path';

function parseCsv(content: string): Record<string, string>[] {
  const lines = content.trim().split('\n');
  if (lines.length <= 1) return [];
  const headers = lines[0].split(',').map((h) => h.replace(/^"|"$/g, ''));
  const records: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;
    // Basic CSV cell parser handling quotes
    const values: string[] = [];
    let inQuotes = false;
    let currVal = '';
    for (let c = 0; c < line.length; c++) {
      const char = line[c];
      if (char === '"') {
        if (inQuotes && line[c + 1] === '"') {
          currVal += '"';
          c++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        values.push(currVal);
        currVal = '';
      } else {
        currVal += char;
      }
    }
    values.push(currVal);

    const record: Record<string, string> = {};
    headers.forEach((h, idx) => {
      record[h] = values[idx] ?? '';
    });
    records.push(record);
  }
  return records;
}

function validate() {
  console.log('==================================================');
  console.log('  PRISM DATASET INTEGRITY VALIDATOR (Phase 02)');
  console.log('==================================================');

  const baseDir = path.join(process.cwd(), 'data', 'generated', 'csv');
  const metaDir = path.join(process.cwd(), 'data', 'metadata');

  const customers = parseCsv(fs.readFileSync(path.join(baseDir, 'customers.csv'), 'utf8'));
  const products = parseCsv(fs.readFileSync(path.join(baseDir, 'products.csv'), 'utf8'));
  const campaigns = parseCsv(fs.readFileSync(path.join(baseDir, 'campaigns.csv'), 'utf8'));
  const orders = parseCsv(fs.readFileSync(path.join(baseDir, 'orders.csv'), 'utf8'));
  const orderItems = parseCsv(fs.readFileSync(path.join(baseDir, 'order_items.csv'), 'utf8'));
  const sessions = parseCsv(fs.readFileSync(path.join(baseDir, 'sessions.csv'), 'utf8'));

  console.log(`Loaded ${customers.length.toLocaleString()} customers`);
  console.log(`Loaded ${products.length.toLocaleString()} products`);
  console.log(`Loaded ${campaigns.length.toLocaleString()} campaigns`);
  console.log(`Loaded ${orders.length.toLocaleString()} orders`);
  console.log(`Loaded ${orderItems.length.toLocaleString()} order items`);
  console.log(`Loaded ${sessions.length.toLocaleString()} sessions`);

  const errors: string[] = [];

  // PK checks
  const tables = [
    { name: 'customers', rows: customers, pk: 'customer_id' },
    { name: 'products', rows: products, pk: 'product_id' },
    { name: 'campaigns', rows: campaigns, pk: 'campaign_id' },
    { name: 'orders', rows: orders, pk: 'order_id' },
    { name: 'order_items', rows: orderItems, pk: 'item_id' },
    { name: 'sessions', rows: sessions, pk: 'session_id' },
  ];

  for (const t of tables) {
    const seen = new Set<string>();
    for (const r of t.rows) {
      const val = r[t.pk];
      if (seen.has(val)) errors.push(`Duplicate PK ${val} in ${t.name}`);
      seen.add(val);
    }
    console.log(`  ✓ ${t.name}.${t.pk} is 100% unique (${seen.size.toLocaleString()} keys)`);
  }

  // FK checks
  const custSet = new Set(customers.map((c) => c.customer_id));
  const prodSet = new Set(products.map((p) => p.product_id));
  const campSet = new Set(campaigns.map((c) => c.campaign_id));
  const ordSet = new Set(orders.map((o) => o.order_id));

  for (const o of orders) {
    if (!custSet.has(o.customer_id)) errors.push(`Orphan customer in order ${o.order_id}`);
  }
  console.log('  ✓ orders -> customers integrity verified');

  for (const item of orderItems) {
    if (!ordSet.has(item.order_id)) errors.push(`Orphan order in item ${item.item_id}`);
    if (!prodSet.has(item.product_id)) errors.push(`Orphan product in item ${item.item_id}`);
  }
  console.log('  ✓ order_items -> orders & products integrity verified');

  for (const s of sessions) {
    if (s.customer_id && !custSet.has(s.customer_id)) errors.push(`Invalid customer in session ${s.session_id}`);
    if (s.campaign_id && !campSet.has(s.campaign_id)) errors.push(`Invalid campaign in session ${s.session_id}`);
    if (s.order_id && !ordSet.has(s.order_id)) errors.push(`Invalid order in session ${s.session_id}`);
  }
  console.log('  ✓ sessions foreign keys verified');

  // Metadata check
  const metaPath = path.join(metaDir, 'business_events.json');
  if (!fs.existsSync(metaPath)) {
    errors.push('Missing business_events.json metadata file');
  } else {
    const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
    if (!meta.events || meta.events.length < 5) {
      errors.push(`Expected >= 5 business events, found ${meta.events?.length}`);
    }
    console.log(`  ✓ Verified ${meta.events.length} intentional anomalies in business_events.json`);
  }

  console.log('==================================================');
  if (errors.length > 0) {
    console.error(`  ❌ FAILED with ${errors.length} errors:`, errors.slice(0, 5));
    process.exit(1);
  } else {
    console.log('  ✓ ALL INTEGRITY GATES PASSED (100% OK)');
    console.log('==================================================');
  }
}

validate();
