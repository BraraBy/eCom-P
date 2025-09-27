import { apiFetch } from "../lib/api";

export async function login(email, password) {
  const data = await apiFetch("/api/customers/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  const { accessToken, refreshToken, user } = data.result;
  if (accessToken) localStorage.setItem("accessToken", accessToken);
  if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
  localStorage.setItem("user", JSON.stringify(user));

  window.dispatchEvent(new Event("auth:changed"));
  return user;
}

export function logout() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");

  localStorage.setItem("cart:guest", "[]");
  
  window.dispatchEvent(new Event("auth:changed"));
  window.dispatchEvent(new Event("cart:changed"));
}

export async function register(name, email, password) {
  const data = await apiFetch("/api/customers/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });

  const { accessToken, refreshToken, user } = data.result;
  if (accessToken) localStorage.setItem("accessToken", accessToken);
  if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
  localStorage.setItem("user", JSON.stringify(user));

  window.dispatchEvent(new Event("auth:changed"));
  return user;
}

export async function refreshAccessToken() {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) return null;

  try {
    const data = await apiFetch("/api/customers/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    });
    const { accessToken } = data.result;
    if (accessToken) {
      localStorage.setItem("accessToken", accessToken);
      window.dispatchEvent(new Event("auth:changed"));
      return accessToken;
    }
  } catch (err) {
    console.error("Refresh token failed:", err);
    logout();
  }
  return null;
}
