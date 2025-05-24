import { API_BASE_URL } from "./config";

export async function fetchProducts() {
  const res = await fetch(`${API_BASE_URL}/products`);
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}
