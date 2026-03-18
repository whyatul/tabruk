import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';
import crypto from 'node:crypto';
import { Buffer } from 'node:buffer';
import { Pool } from 'pg';
import PaytmChecksum from 'paytmchecksum';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;
const ADMIN_USERNAME = String(process.env.ADMIN_USERNAME || 'admin').trim();
const ADMIN_PASSWORD = String(process.env.ADMIN_PASSWORD || 'admin123').trim();
const SESSION_TTL_MS = 1000 * 60 * 60 * 12;
const adminSessions = new Map();
const DATABASE_URL = String(process.env.DATABASE_URL || '').trim();
const shouldUseNeon = Boolean(DATABASE_URL);
let neonReady = false;
const PAYTM_MID = String(process.env.PAYTM_MID || '').trim();
const PAYTM_MERCHANT_KEY = String(process.env.PAYTM_MERCHANT_KEY || '').trim();
const PAYTM_WEBSITE = String(process.env.PAYTM_WEBSITE || 'WEBSTAGING').trim();
const PAYTM_ENV = String(process.env.PAYTM_ENV || 'staging').trim().toLowerCase();
const PAYTM_CALLBACK_URL = String(process.env.PAYTM_CALLBACK_URL || '').trim();
const FRONTEND_BASE_URL = String(process.env.FRONTEND_BASE_URL || 'http://localhost:5173').trim();
const paytmIsConfigured = Boolean(PAYTM_MID && PAYTM_MERCHANT_KEY);
const paytmBaseUrl = PAYTM_ENV === 'production' ? 'https://securegw.paytm.in' : 'https://securegw-stage.paytm.in';

const pool = shouldUseNeon
  ? new Pool({
      connectionString: DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    })
  : null;

const productsFilePath = path.join(__dirname, 'data', 'products.json');
const ordersFilePath = path.join(__dirname, 'data', 'orders.json');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const readJson = async (filePath, fallback = []) => {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
};

const writeJson = async (filePath, data) => {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
};

const ensureSchema = async () => {
  if (!pool) return;

  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      image TEXT NOT NULL,
      features JSONB NOT NULL DEFAULT '[]'::jsonb,
      variations JSONB NOT NULL DEFAULT '[]'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      order_number TEXT NOT NULL,
      status TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      customer_address TEXT NOT NULL,
      customer_notes TEXT NOT NULL,
      items JSONB NOT NULL DEFAULT '[]'::jsonb,
      total_amount NUMERIC NOT NULL DEFAULT 0
    )
  `);

  const productsCount = await pool.query('SELECT COUNT(*)::int AS count FROM products');
  const hasProducts = (productsCount.rows[0]?.count ?? 0) > 0;

  if (!hasProducts) {
    const seedProducts = await readJson(productsFilePath, []);

    for (const product of seedProducts) {
      await pool.query(
        `INSERT INTO products (id, name, category, description, image, features, variations, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb, $8::timestamptz, $9::timestamptz)
         ON CONFLICT (id) DO NOTHING`,
        [
          product.id,
          product.name,
          product.category,
          product.description || '',
          product.image || '',
          JSON.stringify(product.features ?? []),
          JSON.stringify(product.variations ?? []),
          product.createdAt || new Date().toISOString(),
          product.updatedAt || new Date().toISOString(),
        ],
      );
    }
  }
};

const rowToProduct = (row) => ({
  id: row.id,
  name: row.name,
  category: row.category,
  description: row.description,
  image: row.image,
  features: row.features ?? [],
  variations: row.variations ?? [],
  createdAt: new Date(row.created_at).toISOString(),
  updatedAt: new Date(row.updated_at).toISOString(),
});

const rowToOrder = (row) => ({
  id: row.id,
  orderNumber: row.order_number,
  status: row.status,
  createdAt: new Date(row.created_at).toISOString(),
  customer: {
    name: row.customer_name,
    phone: row.customer_phone,
    address: row.customer_address,
    notes: row.customer_notes,
  },
  items: row.items ?? [],
  totalAmount: Number(row.total_amount || 0),
});

const getProductsStore = async () => {
  if (!neonReady) {
    return readJson(productsFilePath, []);
  }

  const result = await pool.query('SELECT * FROM products ORDER BY updated_at DESC');
  return result.rows.map(rowToProduct);
};

const getOrdersStore = async () => {
  if (!neonReady) {
    const orders = await readJson(ordersFilePath, []);
    return [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  const result = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
  return result.rows.map(rowToOrder);
};

const createProductStore = async (product) => {
  if (!neonReady) {
    const products = await readJson(productsFilePath, []);
    if (products.some((item) => item.id === product.id)) {
      return { error: 'Product with this id already exists.', status: 409 };
    }
    products.unshift(product);
    await writeJson(productsFilePath, products);
    return { value: product };
  }

  const existing = await pool.query('SELECT id FROM products WHERE id = $1', [product.id]);
  if (existing.rowCount > 0) {
    return { error: 'Product with this id already exists.', status: 409 };
  }

  const result = await pool.query(
    `INSERT INTO products (id, name, category, description, image, features, variations, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb, $8::timestamptz, $9::timestamptz)
     RETURNING *`,
    [
      product.id,
      product.name,
      product.category,
      product.description,
      product.image,
      JSON.stringify(product.features ?? []),
      JSON.stringify(product.variations ?? []),
      product.createdAt,
      product.updatedAt,
    ],
  );

  return { value: rowToProduct(result.rows[0]) };
};

const updateProductStore = async (id, product) => {
  if (!neonReady) {
    const products = await readJson(productsFilePath, []);
    const index = products.findIndex((item) => item.id === id);
    if (index === -1) {
      return { error: 'Product not found.', status: 404 };
    }

    products[index] = {
      ...products[index],
      ...product,
      id,
      createdAt: products[index].createdAt,
    };

    await writeJson(productsFilePath, products);
    return { value: products[index] };
  }

  const existing = await pool.query('SELECT created_at FROM products WHERE id = $1', [id]);
  if (existing.rowCount === 0) {
    return { error: 'Product not found.', status: 404 };
  }

  const createdAt = existing.rows[0].created_at;
  const result = await pool.query(
    `UPDATE products
     SET name = $2,
         category = $3,
         description = $4,
         image = $5,
         features = $6::jsonb,
         variations = $7::jsonb,
         updated_at = $8::timestamptz
     WHERE id = $1
     RETURNING *`,
    [
      id,
      product.name,
      product.category,
      product.description,
      product.image,
      JSON.stringify(product.features ?? []),
      JSON.stringify(product.variations ?? []),
      product.updatedAt,
    ],
  );

  return {
    value: {
      ...rowToProduct(result.rows[0]),
      createdAt: new Date(createdAt).toISOString(),
    },
  };
};

const deleteProductStore = async (id) => {
  if (!neonReady) {
    const products = await readJson(productsFilePath, []);
    const nextProducts = products.filter((item) => item.id !== id);

    if (nextProducts.length === products.length) {
      return { error: 'Product not found.', status: 404 };
    }

    await writeJson(productsFilePath, nextProducts);
    return { ok: true };
  }

  const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING id', [id]);
  if (result.rowCount === 0) {
    return { error: 'Product not found.', status: 404 };
  }
  return { ok: true };
};

const createOrderStore = async (body) => {
  const items = Array.isArray(body.items) ? body.items : [];
  const customer = body.customer ?? {};

  if (!items.length) {
    return { error: 'Order must have at least one item.', status: 400 };
  }

  if (!customer.name || !customer.phone || !customer.address) {
    return { error: 'Customer name, phone, and address are required.', status: 400 };
  }

  if (!neonReady) {
    const orders = await readJson(ordersFilePath, []);
    const now = new Date();

    const order = {
      id: `ord-${Math.random().toString(36).slice(2, 10)}`,
      orderNumber: `TB-${now.getFullYear()}${String(orders.length + 1).padStart(4, '0')}`,
      status: 'new',
      createdAt: now.toISOString(),
      customer: {
        name: String(customer.name).trim(),
        phone: String(customer.phone).trim(),
        address: String(customer.address).trim(),
        notes: String(customer.notes ?? '').trim(),
      },
      items: items.map((item) => ({
        id: item.id,
        name: item.name,
        weight: item.variation?.weight ?? item.weight,
        price: Number(item.variation?.price ?? item.price ?? 0),
        quantity: Number(item.quantity ?? 1),
        lineTotal: Number(item.variation?.price ?? item.price ?? 0) * Number(item.quantity ?? 1),
      })),
    };

    order.totalAmount = order.items.reduce((sum, item) => sum + item.lineTotal, 0);
    orders.unshift(order);
    await writeJson(ordersFilePath, orders);
    return { value: order };
  }

  const now = new Date();
  const countResult = await pool.query('SELECT COUNT(*)::int AS count FROM orders');
  const count = countResult.rows[0]?.count ?? 0;

  const order = {
    id: `ord-${Math.random().toString(36).slice(2, 10)}`,
    orderNumber: `TB-${now.getFullYear()}${String(count + 1).padStart(4, '0')}`,
    status: 'new',
    createdAt: now.toISOString(),
    customer: {
      name: String(customer.name).trim(),
      phone: String(customer.phone).trim(),
      address: String(customer.address).trim(),
      notes: String(customer.notes ?? '').trim(),
    },
    items: items.map((item) => ({
      id: item.id,
      name: item.name,
      weight: item.variation?.weight ?? item.weight,
      price: Number(item.variation?.price ?? item.price ?? 0),
      quantity: Number(item.quantity ?? 1),
      lineTotal: Number(item.variation?.price ?? item.price ?? 0) * Number(item.quantity ?? 1),
    })),
  };

  order.totalAmount = order.items.reduce((sum, item) => sum + item.lineTotal, 0);

  const result = await pool.query(
    `INSERT INTO orders (
      id, order_number, status, created_at, customer_name, customer_phone, customer_address, customer_notes, items, total_amount
    ) VALUES ($1, $2, $3, $4::timestamptz, $5, $6, $7, $8, $9::jsonb, $10)
    RETURNING *`,
    [
      order.id,
      order.orderNumber,
      order.status,
      order.createdAt,
      order.customer.name,
      order.customer.phone,
      order.customer.address,
      order.customer.notes,
      JSON.stringify(order.items),
      order.totalAmount,
    ],
  );

  return { value: rowToOrder(result.rows[0]) };
};

const secureCompare = (left, right) => {
  const leftBuffer = Buffer.from(String(left));
  const rightBuffer = Buffer.from(String(right));

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
};

const getTokenFromAuthHeader = (headerValue = '') => {
  const [scheme, token] = String(headerValue).split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !token) {
    return null;
  }
  return token.trim();
};

const requireAdminAuth = (req, res, next) => {
  const token = getTokenFromAuthHeader(req.headers.authorization);

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const session = adminSessions.get(token);

  if (!session || session.expiresAt < Date.now()) {
    if (session) {
      adminSessions.delete(token);
    }
    return res.status(401).json({ error: 'Session expired. Please login again.' });
  }

  req.adminSession = session;
  return next();
};

const toSlug = (value = '') =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const parseVariations = (variations = []) =>
  variations
    .map((variation) => ({
      weight: String(variation.weight ?? '').trim(),
      price: Number(variation.price ?? 0),
      originalPrice: Number(variation.originalPrice ?? 0),
    }))
    .filter((variation) => variation.weight && variation.price > 0);

const normalizeProductPayload = (payload = {}, existingId = null) => {
  const name = String(payload.name ?? '').trim();
  const id = existingId ?? toSlug(payload.id || name);

  if (!name || !id) {
    return { error: 'Product name is required.' };
  }

  const variations = parseVariations(payload.variations);

  if (!variations.length) {
    return { error: 'At least one valid variation is required.' };
  }

  const now = new Date().toISOString();

  return {
    value: {
      id,
      name,
      category: String(payload.category ?? '').trim() || 'general',
      description: String(payload.description ?? '').trim(),
      image: String(payload.image ?? '').trim(),
      features: Array.isArray(payload.features)
        ? payload.features.map((item) => String(item).trim()).filter(Boolean)
        : [],
      variations,
      updatedAt: now,
      ...(existingId ? {} : { createdAt: now }),
    },
  };
};

const createPaymentOrderId = () => `PTM-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

const paytmInitiateTransaction = async ({ orderId, amount, customerId, callbackUrl }) => {
  const paytmParams = {
    body: {
      requestType: 'Payment',
      mid: PAYTM_MID,
      websiteName: PAYTM_WEBSITE,
      orderId,
      callbackUrl,
      txnAmount: {
        value: Number(amount).toFixed(2),
        currency: 'INR',
      },
      userInfo: {
        custId: customerId,
      },
    },
  };

  const checksum = await PaytmChecksum.generateSignature(JSON.stringify(paytmParams.body), PAYTM_MERCHANT_KEY);
  paytmParams.head = { signature: checksum };

  const response = await fetch(
    `${paytmBaseUrl}/theia/api/v1/initiateTransaction?mid=${encodeURIComponent(PAYTM_MID)}&orderId=${encodeURIComponent(orderId)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paytmParams),
    },
  );

  const data = await response.json();
  return data;
};

const paytmFetchOrderStatus = async (orderId) => {
  const body = { mid: PAYTM_MID, orderId };
  const checksum = await PaytmChecksum.generateSignature(JSON.stringify(body), PAYTM_MERCHANT_KEY);
  const payload = { body, head: { signature: checksum } };

  const response = await fetch(`${paytmBaseUrl}/v3/order/status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  return response.json();
};

const getStatusFromPaytmResult = (resultStatus = '') => {
  const normalized = String(resultStatus).toUpperCase();
  if (normalized === 'TXN_SUCCESS') return 'success';
  if (normalized === 'PENDING') return 'pending';
  return 'failed';
};

const buildPaymentStatusUrl = ({ status, orderNumber = '', paymentOrderId = '', message = '' }) => {
  const params = new URLSearchParams();
  params.set('status', status);
  if (orderNumber) params.set('orderNumber', orderNumber);
  if (paymentOrderId) params.set('paymentOrderId', paymentOrderId);
  if (message) params.set('message', message);
  return `${FRONTEND_BASE_URL}/payment-status?${params.toString()}`;
};

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.post('/api/admin/login', (req, res) => {
  const { username = '', password = '' } = req.body ?? {};
  const normalizedUsername = String(username).trim().toLowerCase();
  const normalizedPassword = String(password).trim();

  const isValidUser = secureCompare(normalizedUsername, ADMIN_USERNAME.toLowerCase());
  const isValidPassword = secureCompare(normalizedPassword, ADMIN_PASSWORD);

  if (!isValidUser || !isValidPassword) {
    return res.status(401).json({ error: 'Invalid admin credentials.' });
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + SESSION_TTL_MS;

  adminSessions.set(token, {
    username: ADMIN_USERNAME,
    createdAt: Date.now(),
    expiresAt,
  });

  return res.json({ token, expiresAt });
});

app.get('/api/admin/session', requireAdminAuth, (req, res) => {
  res.json({ authenticated: true, username: req.adminSession.username, expiresAt: req.adminSession.expiresAt });
});

app.post('/api/admin/logout', requireAdminAuth, (req, res) => {
  const token = getTokenFromAuthHeader(req.headers.authorization);
  if (token) {
    adminSessions.delete(token);
  }
  return res.status(204).send();
});

app.get('/api/products', async (_req, res) => {
  const products = await getProductsStore();
  res.json(products);
});

app.get('/api/admin/products', requireAdminAuth, async (_req, res) => {
  const products = await getProductsStore();
  res.json(products);
});

app.post('/api/admin/products', requireAdminAuth, async (req, res) => {
  const parsed = normalizeProductPayload(req.body);

  if (parsed.error) {
    return res.status(400).json({ error: parsed.error });
  }

  const created = await createProductStore(parsed.value);
  if (created.error) {
    return res.status(created.status || 400).json({ error: created.error });
  }

  return res.status(201).json(created.value);
});

app.put('/api/admin/products/:id', requireAdminAuth, async (req, res) => {
  const { id } = req.params;

  const parsed = normalizeProductPayload(req.body, id);

  if (parsed.error) {
    return res.status(400).json({ error: parsed.error });
  }

  const updated = await updateProductStore(id, parsed.value);
  if (updated.error) {
    return res.status(updated.status || 400).json({ error: updated.error });
  }

  return res.json(updated.value);
});

app.delete('/api/admin/products/:id', requireAdminAuth, async (req, res) => {
  const deleted = await deleteProductStore(req.params.id);
  if (deleted.error) {
    return res.status(deleted.status || 400).json({ error: deleted.error });
  }

  return res.status(204).send();
});

app.get('/api/admin/orders', requireAdminAuth, async (_req, res) => {
  const orders = await getOrdersStore();
  res.json(orders);
});

app.post('/api/orders', async (req, res) => {
  const created = await createOrderStore(req.body ?? {});
  if (created.error) {
    return res.status(created.status || 400).json({ error: created.error });
  }

  return res.status(201).json(created.value);
});

app.post('/api/payments/paytm/initiate', async (req, res) => {
  try {
    if (!paytmIsConfigured) {
      return res.status(400).json({
        error: 'Paytm is not configured on server. Set PAYTM_MID and PAYTM_MERCHANT_KEY in environment.',
      });
    }

    const { amount = 0, customer = {} } = req.body ?? {};
    const totalAmount = Number(amount);

    if (!totalAmount || totalAmount <= 0) {
      return res.status(400).json({ error: 'Invalid payment amount.' });
    }

    const orderId = createPaymentOrderId();
    const customerId = String(customer.phone || customer.name || 'guest').replace(/\s+/g, '').slice(0, 64) || 'guest';
    const callbackUrl = PAYTM_CALLBACK_URL || `http://localhost:${PORT}/api/payments/paytm/callback`;

    const result = await paytmInitiateTransaction({
      orderId,
      amount: totalAmount,
      customerId,
      callbackUrl,
    });

    const txnToken = result?.body?.txnToken;
    if (!txnToken) {
      const resultInfo = result?.body?.resultInfo || {};
      return res.status(400).json({
        error: resultInfo.resultMsg || 'Failed to initiate Paytm transaction.',
        gatewayCode: resultInfo.resultCode || null,
        gatewayStatus: resultInfo.resultStatus || null,
      });
    }

    return res.json({
      orderId,
      amount: totalAmount.toFixed(2),
      mid: PAYTM_MID,
      txnToken,
      checkoutScriptUrl: `${paytmBaseUrl}/merchantpgpui/checkoutjs/merchants/${PAYTM_MID}.js`,
      environment: PAYTM_ENV,
      callbackUrl,
    });
  } catch (error) {
    return res.status(500).json({ error: `Paytm initiate failed: ${error.message}` });
  }
});

app.post('/api/payments/paytm/verify', async (req, res) => {
  try {
    if (!paytmIsConfigured) {
      return res.status(400).json({ error: 'Paytm is not configured on server.' });
    }

    const { orderId = '' } = req.body ?? {};
    const normalizedOrderId = String(orderId).trim();

    if (!normalizedOrderId) {
      return res.status(400).json({ error: 'orderId is required for verification.' });
    }

    const result = await paytmFetchOrderStatus(normalizedOrderId);
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: `Paytm verify failed: ${error.message}` });
  }
});

app.post('/api/payments/paytm/callback', (req, res) => {
  const callbackOrderId = String(req.body?.ORDERID || req.body?.orderId || '').trim();

  if (!callbackOrderId || !paytmIsConfigured) {
    const fallbackUrl = buildPaymentStatusUrl({
      status: 'failed',
      paymentOrderId: callbackOrderId,
      message: 'Unable to verify payment callback.',
    });
    return res.redirect(302, fallbackUrl);
  }

  paytmFetchOrderStatus(callbackOrderId)
    .then((verification) => {
      const resultInfo = verification?.body?.resultInfo || {};
      const txStatus = getStatusFromPaytmResult(resultInfo.resultStatus);
      const txMessage = resultInfo.resultMsg || 'Payment callback received.';
      const redirectUrl = buildPaymentStatusUrl({
        status: txStatus,
        paymentOrderId: callbackOrderId,
        message: txMessage,
      });
      return res.redirect(302, redirectUrl);
    })
    .catch((error) => {
      const redirectUrl = buildPaymentStatusUrl({
        status: 'failed',
        paymentOrderId: callbackOrderId,
        message: `Verification error: ${error.message}`,
      });
      return res.redirect(302, redirectUrl);
    });
});

const startServer = async () => {
  if (pool) {
    try {
      await ensureSchema();
      neonReady = true;
      console.log('Neon database connected and schema ensured.');
    } catch (error) {
      neonReady = false;
      console.error('Neon connection failed; falling back to JSON storage.', error.message);
    }
  }

  app.listen(PORT, () => {
    console.log(`API server running on http://localhost:${PORT}`);
  });
};

startServer();
