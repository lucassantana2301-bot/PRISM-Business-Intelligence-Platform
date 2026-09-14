import * as fs from 'fs';
import * as path from 'path';

// Seeded PRNG (Mulberry32)
function createPRNG(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rng = createPRNG(42);

function weightedChoice<T>(items: [T, number][]): T {
  const total = items.reduce((sum, [, weight]) => sum + weight, 0);
  let random = rng() * total;
  for (const [item, weight] of items) {
    if (random < weight) return item;
    random -= weight;
  }
  return items[items.length - 1][0];
}

function randInt(min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function randChoice<T>(arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

// Geography
const REGIONS: [string, number][] = [
  ['Southeast', 0.55],
  ['South', 0.20],
  ['Northeast', 0.14],
  ['Central-West', 0.07],
  ['North', 0.04],
];

const STATES: Record<string, [string, string, number][]> = {
  Southeast: [
    ['SP', 'São Paulo', 0.60],
    ['RJ', 'Rio de Janeiro', 0.22],
    ['MG', 'Belo Horizonte', 0.14],
    ['ES', 'Vitória', 0.04],
  ],
  South: [
    ['RS', 'Porto Alegre', 0.40],
    ['PR', 'Curitiba', 0.38],
    ['SC', 'Florianópolis', 0.22],
  ],
  Northeast: [
    ['BA', 'Salvador', 0.35],
    ['PE', 'Recife', 0.28],
    ['CE', 'Fortaleza', 0.22],
    ['RN', 'Natal', 0.15],
  ],
  'Central-West': [
    ['DF', 'Brasília', 0.45],
    ['GO', 'Goiânia', 0.35],
    ['MT', 'Cuiabá', 0.20],
  ],
  North: [
    ['AM', 'Manaus', 0.55],
    ['PA', 'Belém', 0.45],
  ],
};

const FIRST_NAMES = [
  'Lucas', 'Mariana', 'Gabriel', 'Beatriz', 'Thiago', 'Camila', 'Rafael', 'Juliana',
  'Felipe', 'Larissa', 'Bruno', 'Fernanda', 'Rodrigo', 'Amanda', 'Gustavo', 'Carolina',
  'Matheus', 'Letícia', 'Leonardo', 'Aline', 'Vinícius', 'Natália', 'Diego', 'Bruna',
];

const LAST_NAMES = [
  'Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira',
  'Lima', 'Gomes', 'Costa', 'Ribeiro', 'Martins', 'Carvalho', 'Almeida', 'Lopes',
];

const CATEGORIES = [
  {
    name: 'Electronics',
    subcategories: ['Smartphones', 'Audio & Headphones', 'Laptops', 'Smart Home', 'Accessories'],
    basePrice: [89, 3899],
    items: [
      { title: 'Smartphone Galaxy Pro 128GB', subcat: 'Smartphones', price: 2499, cost: 1750 },
      { title: 'Smartphone iPhone Plus 256GB', subcat: 'Smartphones', price: 3899, cost: 2900 },
      { title: 'Wireless Noise Canceling Headphones', subcat: 'Audio & Headphones', price: 649, cost: 420 },
      { title: 'Bluetooth Portable Speaker Max', subcat: 'Audio & Headphones', price: 299, cost: 180 },
      { title: 'Laptop Ultrabook 16GB 512GB SSD', subcat: 'Laptops', price: 3499, cost: 2600 },
      { title: 'Smart Watch Active Pro', subcat: 'Smart Home', price: 499, cost: 310 },
      { title: 'Fast USB-C 65W GaN Charger', subcat: 'Accessories', price: 129, cost: 65 },
    ],
  },
  {
    name: 'Home & Living',
    subcategories: ['Kitchen Appliances', 'Bed & Bath', 'Furniture', 'Lighting'],
    basePrice: [45, 1299],
    items: [
      { title: 'Digital Air Fryer 5.5L Inox', subcat: 'Kitchen Appliances', price: 449, cost: 220 },
      { title: 'Espresso Coffee Maker Automatic', subcat: 'Kitchen Appliances', price: 899, cost: 480 },
      { title: 'Egyptian Cotton Bedding Set King', subcat: 'Bed & Bath', price: 389, cost: 170 },
      { title: 'Robot Vacuum Cleaner Smart Sensor', subcat: 'Kitchen Appliances', price: 1199, cost: 620 },
      { title: 'Ergonomic Mesh Office Chair', subcat: 'Furniture', price: 749, cost: 360 },
      { title: 'Minimalist Scandinavian Floor Lamp', subcat: 'Lighting', price: 229, cost: 95 },
    ],
  },
  {
    name: 'Beauty & Health',
    subcategories: ['Skincare', 'Haircare', 'Fragrances', 'Makeup'],
    basePrice: [29, 450],
    items: [
      { title: 'Hyaluronic Acid Hydrating Facial Serum', subcat: 'Skincare', price: 89, cost: 22 },
      { title: 'Vitamin C Radiant Glow Facial Cream', subcat: 'Skincare', price: 119, cost: 28 },
      { title: 'Deep Repair Argan Oil Hair Mask', subcat: 'Haircare', price: 79, cost: 18 },
      { title: 'Eau de Parfum Velvet Rose 100ml', subcat: 'Fragrances', price: 289, cost: 75 },
      { title: 'Matte Long-Lasting Foundation SPF30', subcat: 'Makeup', price: 95, cost: 24 },
    ],
  },
  {
    name: 'Fashion & Apparel',
    subcategories: ["Men's Clothing", "Women's Clothing", 'Footwear', 'Sportswear'],
    basePrice: [39, 699],
    items: [
      { title: 'Premium Pima Cotton T-Shirt', subcat: "Men's Clothing", price: 99, cost: 32 },
      { title: 'High-Waist Performance Yoga Leggings', subcat: 'Sportswear', price: 149, cost: 48 },
      { title: 'Classic Denim Jacket Dark Wash', subcat: "Women's Clothing", price: 279, cost: 95 },
      { title: 'Breathable Lightweight Running Shoes', subcat: 'Footwear', price: 399, cost: 150 },
    ],
  },
  {
    name: 'Sports & Outdoors',
    subcategories: ['Fitness Equipment', 'Outdoor & Camping', 'Cycling'],
    basePrice: [35, 1899],
    items: [
      { title: 'Adjustable Dumbbell Set 20kg', subcat: 'Fitness Equipment', price: 399, cost: 180 },
      { title: 'Thermal Water Bottle 1000ml Insulated', subcat: 'Fitness Equipment', price: 79, cost: 26 },
      { title: 'Foldable Mountain Bike 21-Speed', subcat: 'Cycling', price: 1699, cost: 920 },
      { title: 'Waterproof Camping Tent 4-Person', subcat: 'Outdoor & Camping', price: 549, cost: 240 },
    ],
  },
  {
    name: 'Gaming & Tech',
    subcategories: ['Consoles & Handhelds', 'Gaming Peripherals', 'Virtual Reality'],
    basePrice: [149, 4299],
    items: [
      { title: 'Next-Gen Gaming Console 1TB', subcat: 'Consoles & Handhelds', price: 3999, cost: 3100 },
      { title: 'Wireless Pro Gaming Controller', subcat: 'Gaming Peripherals', price: 449, cost: 290 },
      { title: '7.1 Surround Sound Gaming Headset', subcat: 'Gaming Peripherals', price: 389, cost: 220 },
      { title: 'All-in-One VR Headset 256GB', subcat: 'Virtual Reality', price: 2899, cost: 2100 },
    ],
  },
  {
    name: 'Accessories',
    subcategories: ['Watches', 'Eyewear', 'Wallets & Small Leather'],
    basePrice: [49, 899],
    items: [
      { title: 'Polarized UV400 Classic Sunglasses', subcat: 'Eyewear', price: 159, cost: 42 },
      { title: 'Automatic Chronograph Stainless Watch', subcat: 'Watches', price: 699, cost: 220 },
      { title: 'Slim RFID-Blocking Leather Wallet', subcat: 'Wallets & Small Leather', price: 89, cost: 24 },
    ],
  },
];

const CHANNELS: [string, number][] = [
  ['Organic Search', 0.32],
  ['Paid Search (Google)', 0.28],
  ['Paid Social (Meta/TikTok)', 0.18],
  ['Email Marketing', 0.10],
  ['Direct', 0.07],
  ['Referral', 0.03],
  ['Affiliate', 0.02],
];

const DEVICES: [string, number][] = [
  ['Mobile iOS', 0.42],
  ['Mobile Android', 0.36],
  ['Desktop', 0.20],
  ['Tablet', 0.02],
];

const PAYMENTS: [string, number][] = [
  ['PIX', 0.52],
  ['Credit Card', 0.40],
  ['Boleto', 0.08],
];

function generateDataset() {
  console.log('Generating PRISM E-commerce Dataset...');

  const startDate = new Date('2025-05-01');
  const endDate = new Date('2026-10-31');
  const totalDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  // 1. Products
  const products: any[] = [];
  let skuCounter = 1000;
  for (const cat of CATEGORIES) {
    for (const item of cat.items) {
      for (let v = 0; v < 11; v++) {
        if (products.length >= 380) break;
        skuCounter++;
        const jitter = v > 0 ? 1 + (rng() * 0.16 - 0.08) : 1;
        const price = Math.round(item.price * jitter * 100) / 100;
        const cost = Math.round(item.cost * jitter * 100) / 100;
        const margin = Math.round(((price - cost) / price) * 10000) / 10000;
        products.push({
          product_id: `PROD-${skuCounter}`,
          sku: `SKU-${cat.name.slice(0, 3).toUpperCase()}-${skuCounter}`,
          title: v > 0 ? `${item.title} (v${v + 1})` : item.title,
          category: cat.name,
          subcategory: item.subcat,
          unit_cost: cost,
          base_price: price,
          margin_rate: margin,
          is_active: rng() > 0.03,
        });
      }
    }
  }

  // 2. Customers
  const customers: any[] = [];
  for (let i = 1; i <= 10000; i++) {
    const region = weightedChoice(REGIONS);
    const stateList = STATES[region];
    const [state, city] = weightedChoice(stateList.map(([s, c, w]) => [[s, c], w] as [[string, string], number]));
    const first = randChoice(FIRST_NAMES);
    const last = randChoice(LAST_NAMES);
    const regOffset = randInt(0, totalDays - 1);
    const regDate = new Date(startDate.getTime() + regOffset * 24 * 60 * 60 * 1000);
    customers.push({
      customer_id: `CUST-${String(i).padStart(5, '0')}`,
      full_name: `${first} ${last}`,
      email: `${first.toLowerCase()}.${last.toLowerCase()}${i}@email.com`,
      region,
      state,
      city,
      customer_segment: weightedChoice([['Regular', 0.6], ['VIP / High-LTV', 0.15], ['Bargain Hunter', 0.15], ['At-Risk', 0.1]]),
      created_at: `${regDate.toISOString().slice(0, 10)} ${String(randInt(8, 22)).padStart(2, '0')}:${String(randInt(0, 59)).padStart(2, '0')}:00`,
    });
  }

  // 3. Campaigns
  const campaigns = [
    { campaign_id: 'CAMP-01', campaign_name: 'Winter Clearance Sale', channel: 'Paid Search (Google)', campaign_type: 'Seasonal Sale', budget: 28000, actual_spend: 27450, target_category: 'Fashion & Apparel', start_date: '2025-06-01', end_date: '2025-06-30' },
    { campaign_id: 'CAMP-02', campaign_name: 'Dia dos Pais Promo', channel: 'Paid Social (Meta/TikTok)', campaign_type: 'Holiday', budget: 35000, actual_spend: 36200, target_category: 'Electronics', start_date: '2025-08-01', end_date: '2025-08-15' },
    { campaign_id: 'CAMP-03', campaign_name: 'Semana do Brasil Mega Offer', channel: 'Paid Search (Google)', campaign_type: 'National Sale', budget: 42000, actual_spend: 41800, target_category: 'Home & Living', start_date: '2025-09-03', end_date: '2025-09-12' },
    { campaign_id: 'CAMP-04', campaign_name: 'Dia das Crianças Tech', channel: 'Paid Social (Meta/TikTok)', campaign_type: 'Holiday', budget: 30000, actual_spend: 29400, target_category: 'Gaming & Tech', start_date: '2025-10-01', end_date: '2025-10-12' },
    { campaign_id: 'CAMP-05', campaign_name: 'Black Friday Warmup 2025', channel: 'Email Marketing', campaign_type: 'Early Bird', budget: 12000, actual_spend: 11850, target_category: '', start_date: '2025-11-01', end_date: '2025-11-20' },
    { campaign_id: 'CAMP-06', campaign_name: 'Black Friday Mega Weekend 2025', channel: 'Paid Search (Google)', campaign_type: 'Black Friday', budget: 95000, actual_spend: 94200, target_category: 'Electronics', start_date: '2025-11-24', end_date: '2025-11-30' },
    { campaign_id: 'CAMP-07', campaign_name: 'Christmas Holiday Rush 2025', channel: 'Paid Social (Meta/TikTok)', campaign_type: 'Christmas', budget: 65000, actual_spend: 66100, target_category: 'Beauty & Health', start_date: '2025-12-05', end_date: '2025-12-24' },
    { campaign_id: 'CAMP-08', campaign_name: 'Summer Cleanout Jan 2026', channel: 'Organic Search', campaign_type: 'Clearance', budget: 15000, actual_spend: 14900, target_category: 'Sports & Outdoors', start_date: '2026-01-05', end_date: '2026-01-25' },
    { campaign_id: 'CAMP-09', campaign_name: 'Dia do Consumidor 2026', channel: 'Paid Search (Google)', campaign_type: 'Commercial Holiday', budget: 50000, actual_spend: 49800, target_category: 'Electronics', start_date: '2026-03-10', end_date: '2026-03-18' },
    { campaign_id: 'CAMP-10', campaign_name: 'Dia das Mães Luxury & Glow', channel: 'Paid Social (Meta/TikTok)', campaign_type: 'Holiday', budget: 48000, actual_spend: 47500, target_category: 'Beauty & Health', start_date: '2026-04-25', end_date: '2026-05-12' },
    { campaign_id: 'CAMP-11', campaign_name: 'Dia dos Namorados Romantic Gifts', channel: 'Email Marketing', campaign_type: 'Holiday', budget: 24000, actual_spend: 23800, target_category: 'Accessories', start_date: '2026-06-01', end_date: '2026-06-12' },
    { campaign_id: 'CAMP-12', campaign_name: 'Spring Glow Beauty Promotion', channel: 'Paid Social (Meta/TikTok)', campaign_type: 'Brand Awareness', budget: 38000, actual_spend: 39400, target_category: 'Beauty & Health', start_date: '2026-07-15', end_date: '2026-07-22' },
    { campaign_id: 'CAMP-13', campaign_name: 'Electronics Flash Rush Southeast', channel: 'Email Marketing', campaign_type: 'Flash Sale', budget: 22000, actual_spend: 21900, target_category: 'Electronics', start_date: '2026-09-01', end_date: '2026-09-08' },
    { campaign_id: 'CAMP-14', campaign_name: 'Pre-Black Friday VIP Exclusive 2026', channel: 'Direct', campaign_type: 'VIP Loyalty', budget: 18000, actual_spend: 17800, target_category: '', start_date: '2026-10-15', end_date: '2026-10-31' },
  ];

  // 4. Sessions, Orders & Items
  const sessions: any[] = [];
  const orders: any[] = [];
  const orderItems: any[] = [];

  let sessionId = 1;
  let orderId = 1;
  let itemId = 1;

  const activeCustomers: any[] = [];
  const sortedCust = [...customers].sort((a, b) => a.created_at.localeCompare(b.created_at));
  let custIndex = 0;

  for (let day = 0; day < totalDays; day++) {
    const currDate = new Date(startDate.getTime() + day * 24 * 60 * 60 * 1000);
    const dStr = currDate.toISOString().slice(0, 10);
    const month = currDate.getMonth() + 1;
    const dayOfWeek = currDate.getDay();

    while (custIndex < sortedCust.length && sortedCust[custIndex].created_at.slice(0, 10) <= dStr) {
      activeCustomers.push(sortedCust[custIndex]);
      custIndex++;
    }

    // Seasonality
    let multiplier = 1.0;
    if (dayOfWeek === 5) multiplier *= 1.15; // Fri
    if (dayOfWeek === 6) multiplier *= 0.82; // Sat
    if (month === 11) multiplier *= 1.65; // Nov Black Friday
    if (month === 12) multiplier *= 1.48; // Dec Christmas
    if (month === 5) multiplier *= 1.22; // May Mother's Day

    // Daily sessions (~550-700 * multiplier)
    const dailySessions = Math.floor(randInt(540, 710) * multiplier);

    for (let s = 0; s < dailySessions; s++) {
      const sessId = `SESS-${String(sessionId++).padStart(7, '0')}`;
      const channel = weightedChoice(CHANNELS);
      const device = weightedChoice(DEVICES);
      const region = weightedChoice(REGIONS);
      const stateList = STATES[region];
      const [state] = weightedChoice(stateList.map(([st, c, w]) => [[st, c], w] as [[string, string], number]));

      const matchingCamp = campaigns.find((c) => c.start_date <= dStr && dStr <= c.end_date && (c.channel === channel || rng() < 0.2));
      const campId = matchingCamp && rng() < 0.65 ? matchingCamp.campaign_id : '';

      const isIdentified = activeCustomers.length > 0 && rng() < 0.45;
      const assignedCust = isIdentified ? randChoice(activeCustomers) : null;

      const hasProductView = rng() < 0.68;
      const hasCartAdd = hasProductView && rng() < 0.24;
      const hasCheckout = hasCartAdd && rng() < 0.48;

      let baseCR = 0.52;
      if (device === 'Desktop') baseCR *= 1.15;
      if (device === 'Mobile iOS' && dStr >= '2026-10-12' && dStr <= '2026-10-18') baseCR *= 0.65; // Anomaly 1
      if (channel === 'Paid Social (Meta/TikTok)' && dStr >= '2026-07-15' && dStr <= '2026-07-22') baseCR *= 0.50; // Anomaly 3

      const isConverted = hasCheckout && rng() < baseCR;
      let ordId = '';

      if (isConverted) {
        ordId = `ORD-${String(orderId++).padStart(6, '0')}`;
        const cust = assignedCust || randChoice(activeCustomers) || customers[0];

        const numItems = weightedChoice([[1, 0.65], [2, 0.22], [3, 0.09], [4, 0.04]]);
        let subtotal = 0;

        for (let it = 0; it < numItems; it++) {
          let candidates = products;
          if (dStr >= '2026-09-01' && dStr <= '2026-09-08' && region === 'Southeast') {
            candidates = products.filter((p) => p.category === 'Electronics');
          } else if (dStr >= '2026-08-01' && dStr <= '2026-10-31' && rng() < 0.25) {
            candidates = products.filter((p) => p.title.includes('Air Fryer'));
          }

          const chosenProd = randChoice(candidates.length ? candidates : products);
          const qty = chosenProd.base_price > 300 ? 1 : weightedChoice([[1, 0.8], [2, 0.15], [3, 0.05]]);
          const itemRev = Math.round(chosenProd.base_price * qty * 100) / 100;
          const itemCost = Math.round(chosenProd.unit_cost * qty * 100) / 100;

          subtotal += itemRev;

          orderItems.push({
            item_id: `ITEM-${String(itemId++).padStart(7, '0')}`,
            order_id: ordId,
            product_id: chosenProd.product_id,
            quantity: qty,
            unit_price: chosenProd.base_price,
            unit_cost: chosenProd.unit_cost,
            total_item_revenue: itemRev,
            total_item_cost: itemCost,
          });
        }

        const discount = rng() < 0.35 ? Math.round(subtotal * randChoice([0.05, 0.10]) * 100) / 100 : 0;
        const shipping = subtotal > 250 ? 0 : Math.round((15 + rng() * 20) * 100) / 100;
        const tax = Math.round(subtotal * 0.08 * 100) / 100;
        const totalRev = Math.round((subtotal - discount + shipping + tax) * 100) / 100;

        orders.push({
          order_id: ordId,
          customer_id: cust.customer_id,
          campaign_id: campId,
          status: rng() < 0.02 ? 'Cancelled' : 'Completed',
          subtotal: Math.round(subtotal * 100) / 100,
          discount_amount: discount,
          tax_amount: tax,
          shipping_amount: shipping,
          total_revenue: totalRev,
          payment_method: weightedChoice(PAYMENTS),
          channel,
          device_type: device,
          order_date: `${dStr} ${String(randInt(7, 23)).padStart(2, '0')}:${String(randInt(0, 59)).padStart(2, '0')}:00`,
        });
      }

      sessions.push({
        session_id: sessId,
        customer_id: assignedCust ? assignedCust.customer_id : '',
        campaign_id: campId,
        device_type: device,
        browser: device.includes('iOS') ? 'Mobile Safari' : 'Chrome',
        channel,
        region,
        state,
        duration_seconds: isConverted ? randInt(25, 450) : randInt(8, 140),
        page_views: 1 + (hasProductView ? 2 : 0) + (hasCartAdd ? 3 : 0) + (isConverted ? 4 : 0),
        has_product_view: hasProductView,
        has_cart_add: hasCartAdd,
        has_checkout_start: hasCheckout,
        is_converted: isConverted,
        order_id: ordId,
        session_start: `${dStr} ${String(randInt(0, 23)).padStart(2, '0')}:${String(randInt(0, 59)).padStart(2, '0')}:00`,
      });
    }
  }

  // Write files
  const baseDir = path.join(process.cwd(), 'data', 'generated', 'csv');
  const metaDir = path.join(process.cwd(), 'data', 'metadata');
  fs.mkdirSync(baseDir, { recursive: true });
  fs.mkdirSync(metaDir, { recursive: true });

  function toCsv(rows: any[]) {
    if (!rows.length) return '';
    const headers = Object.keys(rows[0]);
    const lines = [headers.join(',')];
    for (const r of rows) {
      lines.push(headers.map((h) => `"${String(r[h] ?? '').replace(/"/g, '""')}"`).join(','));
    }
    return lines.join('\n');
  }

  console.log(`Writing CSV files to ${baseDir}...`);
  fs.writeFileSync(path.join(baseDir, 'products.csv'), toCsv(products), 'utf8');
  console.log(`  ✓ products.csv: ${products.length.toLocaleString()} records`);

  fs.writeFileSync(path.join(baseDir, 'customers.csv'), toCsv(customers), 'utf8');
  console.log(`  ✓ customers.csv: ${customers.length.toLocaleString()} records`);

  fs.writeFileSync(path.join(baseDir, 'campaigns.csv'), toCsv(campaigns), 'utf8');
  console.log(`  ✓ campaigns.csv: ${campaigns.length.toLocaleString()} records`);

  fs.writeFileSync(path.join(baseDir, 'orders.csv'), toCsv(orders), 'utf8');
  console.log(`  ✓ orders.csv: ${orders.length.toLocaleString()} records`);

  fs.writeFileSync(path.join(baseDir, 'order_items.csv'), toCsv(orderItems), 'utf8');
  console.log(`  ✓ order_items.csv: ${orderItems.length.toLocaleString()} records`);

  fs.writeFileSync(path.join(baseDir, 'sessions.csv'), toCsv(sessions), 'utf8');
  console.log(`  ✓ sessions.csv: ${sessions.length.toLocaleString()} records`);

  // Metadata
  const anomalies = [
    {
      event_id: 'EVENT-01',
      name: 'Mobile iOS Gateway Conversion Degradation',
      start_date: '2026-10-12',
      end_date: '2026-10-18',
      affected_dimensions: { device_type: ['Mobile iOS'], funnel_step: 'checkout_to_purchase' },
      analytical_effect: 'Mobile iOS checkout completion drops by ~35% due to payment gateway timeout.',
      severity: 'critical',
      category: 'Funnel Anomaly',
    },
    {
      event_id: 'EVENT-02',
      name: 'Electronics Flash Campaign Surge in Southeast',
      start_date: '2026-09-01',
      end_date: '2026-09-08',
      affected_dimensions: { category: ['Electronics'], region: ['Southeast'], channel: ['Email Marketing', 'Paid Search (Google)'] },
      analytical_effect: 'Electronics category gross revenue surges +140% in SP and RJ with 5.2x ROAS.',
      severity: 'opportunity',
      category: 'Marketing Lift',
    },
    {
      event_id: 'EVENT-03',
      name: 'Paid Social High-CAC / Low-Conversion Campaign',
      start_date: '2026-07-15',
      end_date: '2026-07-22',
      affected_dimensions: { channel: ['Paid Social (Meta/TikTok)'], category: ['Beauty & Health'] },
      analytical_effect: 'Paid Social traffic doubles (+100% sessions), but conversion rate drops by 50%.',
      severity: 'warning',
      category: 'Ad Inefficiency',
    },
    {
      event_id: 'EVENT-04',
      name: 'Breakout High-Margin Product Growth in Home & Living',
      start_date: '2026-08-01',
      end_date: '2026-10-31',
      affected_dimensions: { subcategory: ['Kitchen Appliances'], product: 'Digital Air Fryer 5.5L Inox' },
      analytical_effect: 'Breakout viral demand increases unit sales of Digital Air Fryer by 220%.',
      severity: 'opportunity',
      category: 'Product Trend',
    },
    {
      event_id: 'EVENT-05',
      name: 'Cart Abandonment Surge from Freight Policy Friction',
      start_date: '2026-05-18',
      end_date: '2026-05-25',
      affected_dimensions: { category: ['Home & Living', 'Sports & Outdoors'], device_type: ['Desktop'] },
      analytical_effect: 'Cart abandonment increases from 72% to 86% on heavy items (>$300).',
      severity: 'warning',
      category: 'Checkout Friction',
    },
  ];

  fs.writeFileSync(
    path.join(metaDir, 'business_events.json'),
    JSON.stringify(
      {
        dataset_version: '1.0-ecommerce-synthetic',
        generated_at: new Date().toISOString(),
        seed: 42,
        date_range: { start_date: '2025-05-01', end_date: '2026-10-31' },
        events: anomalies,
      },
      null,
      2
    ),
    'utf8'
  );
  console.log(`  ✓ Saved business events ground-truth to ${path.join(metaDir, 'business_events.json')}`);
}

generateDataset();
