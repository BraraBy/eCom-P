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
  // 1) ลบสถานะล็อกอิน
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");

  // 2) รีเซ็ตตะกร้า guest ให้ว่างเสมอหลังออกจากระบบ
  localStorage.setItem("cart:guest", "[]");
  
  // 3) แจ้งทุกหน้าว่ามีการเปลี่ยนแปลง
  window.dispatchEvent(new Event("auth:changed"));
  window.dispatchEvent(new Event("cart:changed"));
}

export async function register(name, email, password) {
  const data = await apiFetch("/api/customers/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });

  // ถ้า backend ส่ง token และ user กลับมา
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
