import { spawn } from 'node:child_process';
import process from 'node:process';

const ROOT = process.cwd();
const PORT = Number(process.env.PAYMENT_TEST_PORT || 4200);
const BASE_URL = `http://localhost:${PORT}`;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForHealth(timeoutMs = 20000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(`${BASE_URL}/api/health`);
      if (response.ok) return;
    } catch {
      // Wait and retry.
    }
    await delay(250);
  }
  throw new Error(`Server did not become healthy at ${BASE_URL} within ${timeoutMs}ms`);
}

async function request(path, payload) {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  return { status: response.status, data };
}

async function run() {
  const server = spawn('node', ['server/index.js'], {
    cwd: ROOT,
    env: {
      ...process.env,
      PORT: String(PORT),
      FRONTEND_BASE_URL: process.env.FRONTEND_BASE_URL || 'http://localhost:5173',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  let logs = '';
  server.stdout.on('data', (chunk) => {
    logs += chunk.toString();
  });
  server.stderr.on('data', (chunk) => {
    logs += chunk.toString();
  });

  const stopServer = async () => {
    if (server.exitCode !== null) return;
    server.kill('SIGTERM');
    await new Promise((resolve) => {
      server.once('exit', () => resolve());
      setTimeout(resolve, 2500);
    });
  };

  try {
    await waitForHealth();

    const amount = Number(process.env.PAYMENT_TEST_AMOUNT || 1);
    const customer = {
      name: 'Gateway Probe User',
      phone: '9999999999',
      address: 'Probe Street',
      notes: 'Live gateway check',
    };

    const initiate = await request('/api/payments/paytm/initiate', {
      amount,
      customer,
      items: [{ id: 'probe-item', name: 'Probe Item', quantity: 1, price: amount }],
    });

    if (initiate.status !== 200) {
      throw new Error(
        `Initiate failed with status ${initiate.status}. Response: ${JSON.stringify(initiate.data)}`,
      );
    }

    const { orderId, txnToken, checkoutScriptUrl, callbackUrl } = initiate.data;

    if (!orderId || !txnToken || !checkoutScriptUrl) {
      throw new Error(`Initiate succeeded but required fields missing: ${JSON.stringify(initiate.data)}`);
    }

    const verify = await request('/api/payments/paytm/verify', { orderId });

    if (verify.status !== 200) {
      throw new Error(
        `Verify failed with status ${verify.status}. Response: ${JSON.stringify(verify.data)}`,
      );
    }

    const resultInfo = verify.data?.body?.resultInfo || {};

    console.log('LIVE_PAYMENT_CHECK:PASS');
    console.log(`ORDER_ID=${orderId}`);
    console.log(`TXN_TOKEN_PRESENT=${Boolean(txnToken)}`);
    console.log(`CHECKOUT_SCRIPT_URL=${checkoutScriptUrl}`);
    console.log(`CALLBACK_URL=${callbackUrl}`);
    console.log(`VERIFY_RESULT_STATUS=${resultInfo.resultStatus || 'UNKNOWN'}`);
    console.log(`VERIFY_RESULT_CODE=${resultInfo.resultCode || 'UNKNOWN'}`);
    console.log(`VERIFY_RESULT_MSG=${resultInfo.resultMsg || 'UNKNOWN'}`);
  } catch (error) {
    console.error('LIVE_PAYMENT_CHECK:FAIL');
    console.error(error.message);
    if (logs.trim()) {
      console.error('SERVER_LOGS_START');
      console.error(logs);
      console.error('SERVER_LOGS_END');
    }
    process.exitCode = 1;
  } finally {
    await stopServer();
  }
}

run();
