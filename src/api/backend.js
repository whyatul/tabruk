const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const ADMIN_TOKEN_KEY = 'admin_auth_token';

function getAdminToken() {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

function setAdminToken(token) {
  if (!token) {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    return;
  }
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
}

async function request(path, options = {}) {
  const { useAdminAuth = false, ...requestOptions } = options;
  const token = useAdminAuth ? getAdminToken() : null;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(requestOptions.headers || {}),
    },
    ...requestOptions,
  });

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
}

export const backendApi = {
  getStoredAdminToken() {
    return getAdminToken();
  },
  clearStoredAdminToken() {
    setAdminToken(null);
  },
  async adminLogin(payload) {
    const data = await request('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    setAdminToken(data.token);
    return data;
  },
  async adminSession() {
    return request('/api/admin/session', { useAdminAuth: true });
  },
  async adminLogout() {
    try {
      await request('/api/admin/logout', {
        method: 'POST',
        useAdminAuth: true,
      });
    } finally {
      setAdminToken(null);
    }
  },
  getProducts() {
    return request('/api/products');
  },
  getAdminProducts() {
    return request('/api/admin/products', { useAdminAuth: true });
  },
  createProduct(payload) {
    return request('/api/admin/products', {
      method: 'POST',
      body: JSON.stringify(payload),
      useAdminAuth: true,
    });
  },
  updateProduct(id, payload) {
    return request(`/api/admin/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
      useAdminAuth: true,
    });
  },
  deleteProduct(id) {
    return request(`/api/admin/products/${id}`, {
      method: 'DELETE',
      useAdminAuth: true,
    });
  },
  getOrders() {
    return request('/api/admin/orders', { useAdminAuth: true });
  },
  createOrder(payload) {
    return request('/api/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  initiatePaytmPayment(payload) {
    return request('/api/payments/paytm/initiate', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  verifyPaytmPayment(orderId) {
    return request('/api/payments/paytm/verify', {
      method: 'POST',
      body: JSON.stringify({ orderId }),
    });
  },
};
