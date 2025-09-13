// src/hooks/useCart.js
import { useState, useMemo, useCallback } from "react";

const KEY = "cart.items";

const read = () => {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); }
  catch { return []; }
};
const write = (v) => localStorage.setItem(KEY, JSON.stringify(v));

export default function useCart(initial = read()) {
  const [items, setItems] = useState(initial);

  const setAndSave = useCallback(updater => {
    setItems(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      write(next);
      return next;
    });
  }, []);

  const add = useCallback((product, quantity = 1) => {
    if (!product) return;
    const id = product.id ?? product.product_id;
    const mapped = {
      id,
      name: product.name ?? "Product",
      price: Number(product.price ?? 0),
      image: product.image_url || product.img_url ||
             "https://via.placeholder.com/160x160.png?text=No+Image",
      quantity,
      size: product.size,
      color: product.color,
      stock: product.stock,
    };
    setAndSave(prev => {
      const i = prev.findIndex(p => p.id === id);
      if (i >= 0) return prev.map((p, idx) => idx === i ? { ...p, quantity: p.quantity + quantity } : p);
      return [...prev, mapped];
    });
  }, [setAndSave]);

  const remove = useCallback(id => setAndSave(prev => prev.filter(p => p.id !== id)), [setAndSave]);

  const patchQty = useCallback((id, delta) => {
    setAndSave(prev => prev
      .map(p => p.id === id ? { ...p, quantity: Math.max(1, (p.quantity || 1) + delta) } : p)
      .filter(p => p.quantity > 0)
    );
  }, [setAndSave]);

  const clear = useCallback(() => setAndSave([]), [setAndSave]);

  const total = useMemo(() =>
    items.reduce((sum, it) => sum + Number(it.price || 0) * Number(it.quantity || 0), 0),
  [items]);

  return { items, add, remove, patchQty, clear, total, setItems: setAndSave };
}
