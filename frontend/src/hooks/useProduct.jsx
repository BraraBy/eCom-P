import { useEffect, useMemo, useState, useCallback } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4200";

export default function useProduct({ category } = {}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const fetchProducts = useCallback(async (signal) => {
    setLoading(true);
    setErr("");

    // ถ้ามีการกรองหมวด สามารถเปลี่ยนเป็น endpoint ที่รองรับได้
    const url = `${API_URL}/api/products${category ? `?category=${encodeURIComponent(category)}` : ""}`;

    try {
      const res = await fetch(url, { signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const list = Array.isArray(data?.result) ? data.result : [];

      // normalize เผื่อบางคีย์ต่างชื่อ
      const normalized = list.map(p => ({
        id: p.product_id ?? p.id,
        name: p.name ?? "",
        price: Number(p.price ?? 0),
        image_url: p.image_url ?? p.img_url ?? "",
        stock: typeof p.stock === "number" ? p.stock : (p.qty ?? null),
        description: p.description ?? "",
        raw: p, // เก็บของเดิมเผื่อใช้
      }));

      setItems(normalized);
    } catch (e) {
      if (e.name !== "AbortError") setErr(e.message || "Fetch failed");
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    const ctrl = new AbortController();
    fetchProducts(ctrl.signal);
    return () => ctrl.abort();
  }, [fetchProducts]);

  const count = useMemo(() => items.length, [items]);

  // เผื่อเรียกใหม่จากภายนอก
  const refetch = () => fetchProducts();

  return { items, loading, error: err, count, refetch };
}
