const AUTH_KEY = 'chat.auth';
const AUTH_BASE = '/api/auth';

export function getAuthSession() {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

export function saveAuthSession(session) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(session));
}

export function clearAuthSession() {
  localStorage.removeItem(AUTH_KEY);
}

export function getAuthToken() {
  return getAuthSession()?.access_token || '';
}

export async function signup(payload) {
  return request(`${AUTH_BASE}/signup`, payload);
}

export async function login(payload) {
  return request(`${AUTH_BASE}/login`, payload);
}

async function request(url, payload) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const detail =
      data?.detail ||
      data?.message ||
      data?.error ||
      (Array.isArray(data?.detail) && data.detail[0]?.msg) ||
      `Request failed (${res.status})`;

    throw new Error(typeof detail === 'string' ? detail : JSON.stringify(detail));
  }

  return data;
}
