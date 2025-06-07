export async function fetchProducts() {
  const res = await fetch("http://localhost:4100/api/products"); // << ปรับ endpoint ตามจริง
  if (!res.ok) {
    throw new Error("Failed to fetch products");
  }
  return res.json();
}
