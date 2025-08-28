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
  const res = await fetch(path, {
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
  return fetch(path, {
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
