const API_BASE = 'http://localhost:8000/api';
const DEFAULT_TIMEOUT_MS = 120000;

async function fetchJSON(url, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error(`API timeout: ${url}`);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export const dashboardAPI = {
  getOverview: () => fetchJSON(`${API_BASE}/dashboard/overview`),
  getRiskDistribution: () => fetchJSON(`${API_BASE}/dashboard/risk-distribution`),
  getTrend: () => fetchJSON(`${API_BASE}/dashboard/trend`),
  getRiskByAgency: () => fetchJSON(`${API_BASE}/dashboard/risk-by-agency`),
};

export const sociosAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchJSON(`${API_BASE}/socios?${query}`);
  },
  getById: (id) => fetchJSON(`${API_BASE}/socios/${id}`),
  getPayments: (id) => fetchJSON(`${API_BASE}/socios/${id}/payments`),
  getTransactions: (id) => fetchJSON(`${API_BASE}/socios/${id}/transactions`),
  getBalanceHistory: (id) => fetchJSON(`${API_BASE}/socios/${id}/balance-history`),
};

export const alertsAPI = {
  getAll: () => fetchJSON(`${API_BASE}/alerts`),
};

export const modelAPI = {
  getFeatureImportance: () => fetchJSON(`${API_BASE}/model/feature-importance`),
  getInfo: () => fetchJSON(`${API_BASE}/model/info`),
};
