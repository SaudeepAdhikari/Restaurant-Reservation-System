const API_BASE = process.env.REACT_APP_API_URL || process.env.REACT_APP_API_BASE || 'http://localhost:5000';

// With HttpOnly cookies, we don't need to manually manage tokens
// These functions are maintained for backward compatibility but operate differently
export function getToken() {
  return null; // Token is in HttpOnly cookie, not accessible via JS
}

export function saveToken(token) {
  // Token is saved via HttpOnly cookie by the server
  // This is now a no-op function
  console.log('Token is being saved by server as HttpOnly cookie');
}

export function removeToken() {
  // We'll handle logout by calling the logout endpoint which will clear the cookie
  console.log('Clearing authentication cookie via logout endpoint');
  return fetch(`${API_BASE}/api/auth/logout`, {
    method: 'POST',
    credentials: 'include' // Important: include cookies in the request
  }).catch(err => {
    console.error('Logout error:', err);
    return Promise.reject(err);
  });
}

export async function apiPost(path, body) {
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
  const res = await fetch(url, {
    method: 'POST',
    credentials: 'include', // Include cookies in the request
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
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
  return fetch(url, {
    ...options,
    credentials: 'include', // Important: include cookies in the request
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    body: options.body // Make sure body is passed correctly
  }).then(async r => {
    const ct = r.headers.get('content-type') || '';
    // handle non-ok responses first
    if (!r.ok) {
      // If unauthorized, call logout endpoint and notify app
      if (r.status === 401 || r.status === 403) {
        try { 
          // Call our removeToken function which hits the logout endpoint
          removeToken(); 
        } catch(e){}
        try { 
          // Notify app of logout
          window.dispatchEvent(new Event('app:logout')); 
        } catch(e){}
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