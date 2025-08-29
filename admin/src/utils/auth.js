const API_BASE = process.env.REACT_APP_API_URL || process.env.REACT_APP_API_BASE || 'http://localhost:5000';

export function getToken() {
  return localStorage.getItem('admin_token');
}
export function saveToken(token) {
  localStorage.setItem('admin_token', token);
}
export function removeToken() {
  localStorage.removeItem('admin_token');
}

export async function apiPost(path, body) {
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const err = await res.json().catch(()=>({message: 'Network error'}));
    throw new Error(err.message || 'Request failed');
  }
  return res.json();
}

export async function authFetch(path, options = {}) {
  const token = getToken();
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      Authorization: token ? `Bearer ${token}` : undefined
    }
  });

  const contentType = (res.headers.get('content-type') || '').toLowerCase();
  const isJson = contentType.includes('application/json');

  // handle errors
  if (!res.ok) {
    // auto-logout on auth errors
    if (res.status === 401 || res.status === 403) {
      try { removeToken(); window.dispatchEvent(new Event('app:logout')); } catch(e){}
    }

    if (isJson) {
      const body = await res.json().catch(() => ({}));
      const msg = body && (body.message || body.error) ? (body.message || body.error) : JSON.stringify(body);
      throw new Error(msg || res.statusText || 'Request failed');
    }

    // non-JSON error (HTML page, etc.)
    const txt = await res.text().catch(() => res.statusText);
    throw new Error(txt || res.statusText || 'Request failed');
  }

  // success but not JSON (likely an HTML response) — surface as error to avoid JSON parse crash
  if (!isJson) {
    const txt = await res.text().catch(() => 'Received non-JSON response');
    throw new Error(txt || 'Received non-JSON response');
  }

  return res.json();
}
