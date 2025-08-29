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
    const ct = r.headers.get('content-type') || '';
    // handle non-ok responses first
    if (!r.ok) {
      // If unauthorized, clear token and notify app
      if (r.status === 401 || r.status === 403) {
        try { removeToken(); } catch(e){}
        try { window.dispatchEvent(new Event('app:logout')); } catch(e){}
      }
      // try to read JSON error, otherwise text
      if (ct.includes('application/json')) {
        const err = await r.json().catch(()=>({ message: 'Request failed' }));
        throw new Error(err.message || 'Request failed');
      } else {
        const txt = await r.text().catch(()=>'');
        throw new Error(`Request failed: ${r.status} ${r.statusText} - response not JSON: ${txt.slice(0,200)}`);
      }
    }

    // ok response
    if (ct.includes('application/json')) {
      return r.json();
    }
    const txt = await r.text().catch(()=>'');
    // likely HTML (index.html) returned by dev server or proxy misconfig
    throw new Error(`Expected JSON but got non-JSON response from ${url}: ${txt.slice(0,200)}`);
  });
}