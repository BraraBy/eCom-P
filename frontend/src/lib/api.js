export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4200';

function getAuthHeader() {
  const token = localStorage.getItem('accessToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    credentials: 'omit',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      ...getAuthHeader(),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return res.json();
}
