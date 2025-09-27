export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4200';

function getAuthHeader() {
  const token = localStorage.getItem('accessToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function tryRefreshAccessToken() {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) return null;

  const res = await fetch(`${API_URL}/api/customers/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) return null;
  const data = await res.json().catch(() => ({}));
  const newToken = data?.result?.accessToken;
  if (newToken) {
    localStorage.setItem('accessToken', newToken);
    window.dispatchEvent(new Event('auth:changed'));
    return newToken;
  }
  return null;
}

export async function apiFetch(path, options = {}) {
  const isForm = options?.body instanceof FormData;
  const doFetch = async () => {
    return fetch(`${API_URL}${path}`, {
      credentials: 'omit',
      ...options,
      headers: {
        ...(isForm ? {} : { 'Content-Type': 'application/json' }),
        ...(options.headers || {}),
        ...getAuthHeader(),
      },
    });
  };

  let res = await doFetch();
  if (res.ok) return res.json();

  if (res.status === 401 && path !== '/api/customers/refresh') {
    const refreshed = await tryRefreshAccessToken();
    if (refreshed) {
      res = await doFetch();
      if (res.ok) return res.json();
    }
  }

  const text = await res.text();
  throw new Error(`HTTP ${res.status}: ${text}`);
}
