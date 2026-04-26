import { authFetch } from '../utils/auth';

export function apiGet(path) {
  return authFetch(path, { method: 'GET' });
}

export function apiPost(path, body) {
  return authFetch(path, { method: 'POST', body: JSON.stringify(body) });
}

export function apiPut(path, body) {
  return authFetch(path, { method: 'PUT', body: JSON.stringify(body) });
}

export function apiDelete(path) {
  return authFetch(path, { method: 'DELETE' });
}
