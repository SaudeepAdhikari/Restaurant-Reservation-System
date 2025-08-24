// Lightweight API helper that attaches Authorization header when token is present
const API_BASE = 'http://localhost:5000/api';

function getToken() {
  return localStorage.getItem('adminToken');
}

async function request(path, options = {}) {
  const headers = options.headers ? { ...options.headers } : {};
  headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  // Central handling for unauthorized / forbidden responses
  if (res.status === 401 || res.status === 403) {
    try { localStorage.removeItem('adminToken'); localStorage.removeItem('adminUser'); } catch (e) {}
    // redirect to admin login (hash-based route used in app)
    if (typeof window !== 'undefined') window.location.hash = '#login';
    const err = new Error(data.error || (res.status === 403 ? 'Forbidden' : 'Unauthorized'));
    err.status = res.status;
    err.body = data;
    throw err;
  }
  if (!res.ok) {
    const err = new Error(data.error || 'API error');
    err.status = res.status;
    err.body = data;
    throw err;
  }
  return data;
}

export function apiGet(path) {
  return request(path, { method: 'GET' });
}

export function apiPost(path, body) {
  return request(path, { method: 'POST', body: JSON.stringify(body) });
}

export function apiPut(path, body) {
  return request(path, { method: 'PUT', body: JSON.stringify(body) });
}

export function apiDelete(path) {
  return request(path, { method: 'DELETE' });
}

const api = { apiGet, apiPost };
export default api;
