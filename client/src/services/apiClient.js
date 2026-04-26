const API_BASE = process.env.REACT_APP_API_BASE || process.env.REACT_APP_API_URL || 'http://localhost:5000';

async function parseResponse(res) {
  const contentType = (res.headers.get('content-type') || '').toLowerCase();
  const isJson = contentType.includes('application/json');

  if (!res.ok) {
    if (isJson) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.message || body.error || 'Request failed');
    }
    const text = await res.text().catch(() => 'Request failed');
    throw new Error(text || 'Request failed');
  }

  if (!isJson) return null;
  return res.json();
}

export async function apiRequest(path, options = {}) {
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
  const res = await fetch(url, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });

  return parseResponse(res);
}

export function apiGet(path) {
  return apiRequest(path, { method: 'GET' });
}

export function apiPost(path, body) {
  return apiRequest(path, { method: 'POST', body: JSON.stringify(body) });
}

export function apiPut(path, body) {
  return apiRequest(path, { method: 'PUT', body: JSON.stringify(body) });
}
