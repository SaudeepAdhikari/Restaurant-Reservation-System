const API_BASE = process.env.REACT_APP_API_URL || process.env.REACT_APP_API_BASE || 'http://localhost:5000';

export function getToken() {
  return localStorage.getItem('owner_token');
}
export function saveToken(token) {
  localStorage.setItem('owner_token', token);
}
export function removeToken() {
  localStorage.removeItem('owner_token');
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

export function authFetch(path, options = {}) {
  const token = getToken();
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      Authorization: token ? `Bearer ${token}` : undefined
    }
  }).then(async r => {
    if (!r.ok) throw new Error((await r.json()).message || 'Request failed');
    return r.json();
  });
}