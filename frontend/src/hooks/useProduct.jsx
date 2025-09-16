// src/hooks/useProduct.jsx
import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:4200";

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
          url.searchParams.set("category_slug", category); // ✅ ส่ง slug ไป
        }
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setItems(Array.isArray(data.result) ? data.result : []);
        setCount((data.result || []).length);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [category]);

  return { items, count, loading, error };
}
