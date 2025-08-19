import { apiFetch } from '../lib/api';
export async function login(email, password) {
  const data = await apiFetch('/api/customers/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  const { accessToken, refreshToken, user } = data.result;
  if (accessToken) localStorage.setItem('accessToken', accessToken);
  if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
  localStorage.setItem('user', JSON.stringify(user));
  return user;
}
export function logout() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
}
