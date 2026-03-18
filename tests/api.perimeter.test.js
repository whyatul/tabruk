import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const ROOT_DIR = process.cwd();
const ORDERS_FILE = path.join(ROOT_DIR, 'server', 'data', 'orders.json');
const PRODUCTS_FILE = path.join(ROOT_DIR, 'server', 'data', 'products.json');

let originalOrdersJson = '';
let originalProductsJson = '';

async function waitForHealth(baseUrl, timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(`${baseUrl}/api/health`);
      if (response.ok) return;
    } catch {
      // Ignore until timeout.
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error(`Server did not become healthy at ${baseUrl} within ${timeoutMs}ms`);
}

async function startServer({ port, env = {} }) {
  const child = spawn('node', ['server/index.js'], {
    cwd: ROOT_DIR,
    env: {
      ...process.env,
      PORT: String(port),
      DATABASE_URL: '',
      FRONTEND_BASE_URL: 'http://localhost:5173',
      ...env,
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  let logs = '';
  child.stdout.on('data', (chunk) => {
    logs += chunk.toString();
  });
  child.stderr.on('data', (chunk) => {
    logs += chunk.toString();
  });

  const baseUrl = `http://localhost:${port}`;
  try {
    await waitForHealth(baseUrl);
  } catch (error) {
    child.kill('SIGTERM');
    throw new Error(`${error.message}\nServer logs:\n${logs}`);
  }

  return {
    baseUrl,
    async stop() {
      if (child.exitCode !== null) return;
      child.kill('SIGTERM');
      await new Promise((resolve) => {
        child.once('exit', () => resolve());
        setTimeout(resolve, 2000);
      });
    },
  };
}

async function apiRequest(baseUrl, endpoint, options = {}) {
  const { headers = {}, ...requestOptions } = options;
  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...requestOptions,
    headers: { 'Content-Type': 'application/json', ...headers },
  });

  const payload = await response
    .json()
    .catch(() => null);

  return { response, payload };
}

before(async () => {
  originalOrdersJson = await fs.readFile(ORDERS_FILE, 'utf8');
  originalProductsJson = await fs.readFile(PRODUCTS_FILE, 'utf8');
});

after(async () => {
  await fs.writeFile(ORDERS_FILE, originalOrdersJson);
  await fs.writeFile(PRODUCTS_FILE, originalProductsJson);
});

test('API perimeter tests with Paytm not configured', async (t) => {
  const server = await startServer({
    port: 4101,
    env: {
      PAYTM_MID: '',
      PAYTM_MERCHANT_KEY: '',
      PAYTM_WEBSITE: 'WEBSTAGING',
      PAYTM_ENV: 'staging',
    },
  });

  t.after(async () => {
    await server.stop();
  });

  const { baseUrl } = server;

  await t.test('health endpoint returns ok', async () => {
    const { response, payload } = await apiRequest(baseUrl, '/api/health');
    assert.equal(response.status, 200);
    assert.deepEqual(payload, { ok: true });
  });

  await t.test('admin protected endpoint rejects missing auth', async () => {
    const { response, payload } = await apiRequest(baseUrl, '/api/admin/products');
    assert.equal(response.status, 401);
    assert.equal(payload.error, 'Unauthorized');
  });

  await t.test('admin login fails for invalid credentials', async () => {
    const { response, payload } = await apiRequest(baseUrl, '/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username: 'wrong', password: 'wrong' }),
    });

    assert.equal(response.status, 401);
    assert.equal(payload.error, 'Invalid admin credentials.');
  });

  let adminToken = '';

  await t.test('admin login succeeds with default credentials', async () => {
    const { response, payload } = await apiRequest(baseUrl, '/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username: 'admin', password: 'admin123' }),
    });

    assert.equal(response.status, 200);
    assert.ok(payload.token);
    assert.ok(payload.expiresAt);
    adminToken = payload.token;
  });

  await t.test('admin session works with bearer token', async () => {
    const { response, payload } = await apiRequest(baseUrl, '/api/admin/session', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    assert.equal(response.status, 200);
    assert.equal(payload.authenticated, true);
    assert.equal(payload.username, 'admin');
  });

  await t.test('public products list returns seeded products', async () => {
    const { response, payload } = await apiRequest(baseUrl, '/api/products');
    assert.equal(response.status, 200);
    assert.ok(Array.isArray(payload));
    assert.ok(payload.length > 0);
  });

  const perimeterProduct = {
    name: 'Perimeter Product',
    category: 'dry-fruits',
    description: 'Boundary-tested product',
    image: 'https://example.com/product.jpg',
    features: ['A', 'B'],
    variations: [{ weight: '1kg', price: 120, originalPrice: 150 }],
  };

  await t.test('admin create product validates missing name', async () => {
    const { response, payload } = await apiRequest(baseUrl, '/api/admin/products', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ ...perimeterProduct, name: '', id: '' }),
    });

    assert.equal(response.status, 400);
    assert.equal(payload.error, 'Product name is required.');
  });

  await t.test('admin create product validates missing valid variation', async () => {
    const { response, payload } = await apiRequest(baseUrl, '/api/admin/products', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ ...perimeterProduct, variations: [{ weight: '', price: 0 }] }),
    });

    assert.equal(response.status, 400);
    assert.equal(payload.error, 'At least one valid variation is required.');
  });

  await t.test('admin create product succeeds and generates slug id', async () => {
    const { response, payload } = await apiRequest(baseUrl, '/api/admin/products', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify(perimeterProduct),
    });

    assert.equal(response.status, 201);
    assert.equal(payload.id, 'perimeter-product');
    assert.equal(payload.name, 'Perimeter Product');
  });

  await t.test('admin create product rejects duplicate id', async () => {
    const { response, payload } = await apiRequest(baseUrl, '/api/admin/products', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify(perimeterProduct),
    });

    assert.equal(response.status, 409);
    assert.equal(payload.error, 'Product with this id already exists.');
  });

  await t.test('admin update product returns 404 for unknown id', async () => {
    const { response, payload } = await apiRequest(baseUrl, '/api/admin/products/does-not-exist', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify(perimeterProduct),
    });

    assert.equal(response.status, 404);
    assert.equal(payload.error, 'Product not found.');
  });

  await t.test('admin delete product returns 404 for unknown id', async () => {
    const { response, payload } = await apiRequest(baseUrl, '/api/admin/products/does-not-exist', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    assert.equal(response.status, 404);
    assert.equal(payload.error, 'Product not found.');
  });

  await t.test('order creation validates non-empty items', async () => {
    const { response, payload } = await apiRequest(baseUrl, '/api/orders', {
      method: 'POST',
      body: JSON.stringify({ customer: { name: 'A', phone: '1', address: 'X' }, items: [] }),
    });

    assert.equal(response.status, 400);
    assert.equal(payload.error, 'Order must have at least one item.');
  });

  await t.test('order creation validates mandatory customer fields', async () => {
    const { response, payload } = await apiRequest(baseUrl, '/api/orders', {
      method: 'POST',
      body: JSON.stringify({ customer: { name: 'A', phone: '', address: '' }, items: [{ id: 'x', quantity: 1, price: 100 }] }),
    });

    assert.equal(response.status, 400);
    assert.equal(payload.error, 'Customer name, phone, and address are required.');
  });

  let createdOrder = null;

  await t.test('order creation succeeds and computes totalAmount', async () => {
    const { response, payload } = await apiRequest(baseUrl, '/api/orders', {
      method: 'POST',
      body: JSON.stringify({
        customer: { name: 'Perimeter User', phone: '9999999999', address: 'Perimeter Street', notes: 'Handle with care' },
        items: [
          { id: 'kaju', name: 'Premium Kaju', quantity: 2, price: 600, variation: { weight: '1kg', price: 600 } },
          { id: 'green-kishmish', name: 'Green Kishmish', quantity: 1, price: 500, variation: { weight: '1kg', price: 500 } },
        ],
      }),
    });

    assert.equal(response.status, 201);
    assert.ok(payload.id);
    assert.ok(payload.orderNumber);
    assert.equal(payload.totalAmount, 1700);
    assert.equal(payload.items.length, 2);
    createdOrder = payload;
  });

  await t.test('admin orders endpoint includes newly created order', async () => {
    const { response, payload } = await apiRequest(baseUrl, '/api/admin/orders', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    assert.equal(response.status, 200);
    assert.ok(Array.isArray(payload));
    assert.ok(payload.some((order) => order.id === createdOrder.id));
  });

  await t.test('paytm initiate fails with clear error when gateway is not configured', async () => {
    const { response, payload } = await apiRequest(baseUrl, '/api/payments/paytm/initiate', {
      method: 'POST',
      body: JSON.stringify({ amount: 1500, customer: { name: 'X', phone: 'Y' } }),
    });

    assert.equal(response.status, 400);
    assert.match(payload.error, /Paytm is not configured/);
  });

  await t.test('paytm verify fails when gateway is not configured', async () => {
    const { response, payload } = await apiRequest(baseUrl, '/api/payments/paytm/verify', {
      method: 'POST',
      body: JSON.stringify({ orderId: 'PTM-TEST-1' }),
    });

    assert.equal(response.status, 400);
    assert.match(payload.error, /Paytm is not configured/);
  });

  await t.test('paytm callback redirects to failed status when no order id is provided', async () => {
    const response = await fetch(`${baseUrl}/api/payments/paytm/callback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ STATUS: 'TXN_SUCCESS' }),
      redirect: 'manual',
    });

    const location = response.headers.get('location') || '';
    assert.equal(response.status, 302);
    assert.match(location, /\/payment-status\?status=failed/);
    assert.match(location, /message=Unable\+to\+verify\+payment\+callback\./);
  });

  await t.test('paytm callback redirects to failed status with paymentOrderId when provided', async () => {
    const response = await fetch(`${baseUrl}/api/payments/paytm/callback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ ORDERID: 'PTM-CB-123' }),
      redirect: 'manual',
    });

    const location = response.headers.get('location') || '';
    assert.equal(response.status, 302);
    assert.match(location, /paymentOrderId=PTM-CB-123/);
    assert.match(location, /status=failed/);
  });
});

test('API perimeter tests with Paytm credentials configured', async (t) => {
  const server = await startServer({
    port: 4102,
    env: {
      PAYTM_MID: 'MID_TEST_123',
      PAYTM_MERCHANT_KEY: 'KEY_TEST_123',
      PAYTM_WEBSITE: 'WEBSTAGING',
      PAYTM_ENV: 'staging',
      PAYTM_CALLBACK_URL: 'https://example.com/paytm/callback',
    },
  });

  t.after(async () => {
    await server.stop();
  });

  const { baseUrl } = server;

  await t.test('paytm initiate validates amount before external call', async () => {
    const { response, payload } = await apiRequest(baseUrl, '/api/payments/paytm/initiate', {
      method: 'POST',
      body: JSON.stringify({ amount: 0, customer: { name: 'X', phone: 'Y' } }),
    });

    assert.equal(response.status, 400);
    assert.equal(payload.error, 'Invalid payment amount.');
  });

  await t.test('paytm verify requires orderId before external call', async () => {
    const { response, payload } = await apiRequest(baseUrl, '/api/payments/paytm/verify', {
      method: 'POST',
      body: JSON.stringify({ orderId: '' }),
    });

    assert.equal(response.status, 400);
    assert.equal(payload.error, 'orderId is required for verification.');
  });
});
