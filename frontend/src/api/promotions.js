const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:4200").replace(/\/+$/, "");

async function parseJSON(res) {
  const ct = res.headers.get("content-type") || "";
  const text = await res.text();
  if (!ct.includes("application/json")) {
    throw new Error(`Expected JSON but got: ${ct || "unknown"}\n${text.slice(0, 200)}`);
  }
  return JSON.parse(text);
}

function url(p) {
  if (!API_URL) throw new Error("VITE_API_URL is not set");
  // force /api prefix so frontend calls backend at /api/…
  return `${API_URL}/api${p.startsWith("/") ? p : `/${p}`}`;
}

export async function apiListActivePromos() {
  const r = await fetch(url("/promotions/active"));
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const j = await parseJSON(r);
  return j.result ?? j;
}

export async function apiListAllPromos() {
  const r = await fetch(url("/promotions"));
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const j = await parseJSON(r);
  return j.result ?? j;
}

export async function apiCreatePromo(body) {
  const r = await fetch(url("/promotions"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const j = await parseJSON(r);
  if (!r.ok) throw new Error(j.message || "Create failed");
  return j.result ?? j;
}

export async function apiUpdatePromo(id, body) {
  const r = await fetch(url(`/promotions/${id}`), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const j = await parseJSON(r);
  if (!r.ok) throw new Error(j.message || "Update failed");
  return j.result ?? j;
}

export async function apiDeletePromo(id) {
  const r = await fetch(url(`/promotions/${id}`), { method: "DELETE" });
  const j = await parseJSON(r);
  if (!r.ok) throw new Error(j.message || "Delete failed");
  return j.result ?? j;
}

export async function apiSetScope(id, { product_ids = [], category_ids = [] }) {
  const r = await fetch(url(`/promotions/${id}/scope`), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ product_ids, category_ids }),
  });
  const j = await parseJSON(r);
  if (!r.ok) throw new Error(j.message || "Set scope failed");
  return j.result ?? j;
}

export async function apiGetPromoByCode(code) {
  const r = await fetch(url(`/promotions/by-code/${encodeURIComponent(code)}`), {
    credentials: "include",
  });
  const j = await parseJSON(r);
  if (!r.ok) throw new Error(j.message || `HTTP ${r.status}`);
  return j.result ?? j;
}

export async function apiRedeemPromotion(promotion_id, { customers_id = null, order_id }) {
  const r = await fetch(url(`/promotions/${promotion_id}/redeem`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ customers_id, order_id }),
  });
  const j = await parseJSON(r);
  if (!r.ok) throw new Error(j.message || `HTTP ${r.status}`);
  return j.result ?? j;
}

export async function apiValidatePromo({ code, items, customers_id = null }) {
  const r = await fetch(url(`/promotions/validate`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ code, items, customers_id }),
  });
  const j = await parseJSON(r);
  if (!r.ok) throw new Error(j.message || `HTTP ${r.status}`);
  return j.result ?? j;
}
