// src/hooks/useProduct.jsx
import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:4200";

const FALLBACK_IMG = "https://via.placeholder.com/160x160.png?text=No+Image";

export default function useProduct({ category } = {}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [count, setCount] = useState(0);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");
      try {
        const url = new URL(`${API}/api/products`);
        if (category && category !== "all") {
          url.searchParams.set("category_slug", category);
        }
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        const raw = Array.isArray(data.result) ? data.result : [];
        const normalized = raw.map((p, idx) => ({
          ...p,
          // ให้ทุกชิ้นมี id ที่ stable เพื่อใช้เป็น React key
          id: p.id ?? p.product_id ?? p.sku ?? p.code ?? p.slug ?? `tmp-${idx}`,
          // ปรับค่าให้ปลอดภัยต่อ UI
          name: p.name ?? p.title ?? "Unnamed",
          price: Number(p.price ?? 0),
          image_url: p.image_url ?? p.img_url ?? FALLBACK_IMG,
          stock: typeof p.stock === "number" ? p.stock : undefined,
        }));

        setItems(normalized);
        setCount(normalized.length);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [category]);

  return { items, count, loading, error };
}
