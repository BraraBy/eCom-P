import { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:4200";

export default function useProduct({ category, search } = {}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [count, setCount] = useState(0);

  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams();

        if (category) {
          const asString = String(category);
          if (/^\d+$/.test(asString)) params.set("category_id", asString);
          else params.set("category_slug", asString);
        }

        if (search) params.set("search", search);

        const url = `${API}/api/products${params.toString() ? "?" + params.toString() : ""}`;
        const res = await fetch(url, { signal: ac.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        const result = data?.result ?? data;
        let rows = [];
        let total = 0;

        if (!result) {
          rows = [];
        } else if (Array.isArray(result)) {
          rows = result;
          total = result.length;
        } else if (Array.isArray(result.rows)) {
          rows = result.rows;
          total = Number(result.total ?? result.count ?? rows.length) || rows.length;
        } else if (Array.isArray(data)) {
          rows = data;
          total = data.length;
        } else {
          rows = Array.isArray(result) ? result : [result];
          total = rows.length;
        }

        setItems(rows);
        setCount(total);
      } catch (e) {
        if (e.name !== "AbortError") {
          setError(e.message || "Fetch products failed");
          setItems([]);
          setCount(0);
        }
      } finally {
        setLoading(false);
      }
    })();

    return () => ac.abort();
  }, [category, search]);

  return { items, count, loading, error };
}
