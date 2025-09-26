// src/hooks/useCart.jsx
import { useState, useMemo, useCallback, useEffect, useRef } from "react";

function safeParse(json, fallback) { try { return JSON.parse(json); } catch { return fallback; } }
function getUser() { return safeParse(localStorage.getItem("user") || "null", null); }
function cartKeyForUser(u) { return u?.customers_id ? `cart:${u.customers_id}` : "cart:guest"; }
function readCart(key) { return safeParse(localStorage.getItem(key) || "[]", []); }
function writeCart(key, v) { localStorage.setItem(key, JSON.stringify(v)); window.dispatchEvent(new Event("cart:changed")); }

export default function useCart() {
  const [user, setUser] = useState(getUser());
  const keyRef = useRef(cartKeyForUser(user));

  // migrate legacy key -> guest (ครั้งเดียวพอ)
  useEffect(() => {
    const legacy = safeParse(localStorage.getItem("cart.items") || "[]", []);
    const guest  = readCart("cart:guest");
    if (legacy.length && guest.length === 0) writeCart("cart:guest", legacy);
  }, []);

  const [items, setItems] = useState(() => readCart(keyRef.current));
  const setAndSave = useCallback((updater) => {
    setItems(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      writeCart(keyRef.current, next);
      return next;
    });
  }, []);

  // 🔐 ฟังการเปลี่ยนแปลงสถานะล็อกอิน
  useEffect(() => {
    const onAuthChanged = () => {
      const newUser = getUser();
      const newKey  = cartKeyForUser(newUser);
      const oldKey  = keyRef.current;

      // ถ้าล็อกอินเข้ามาใหม่ → ล้าง guest ทิ้ง และใช้ตะกร้าของ user ตามที่มี (ไม่ merge)
      if (newKey !== oldKey && newUser?.customers_id) {
        localStorage.removeItem("cart:guest");
      }

      keyRef.current = newKey;
      setUser(newUser);
      setItems(readCart(newKey));
    };

    window.addEventListener("auth:changed", onAuthChanged);

    // sync ข้ามแท็บ (ถ้าอีกแท็บแก้ตะกร้าของ key เดียวกัน)
    const onStorage = (e) => {
      if (!e.key) return;
      if (e.key === keyRef.current) setItems(readCart(keyRef.current));
    };
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("auth:changed", onAuthChanged);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  // 👉 (optional) รองรับปุ่มที่ยิงอีเวนต์ 'cart:add' มาจากที่อื่น
  useEffect(() => {
    const onAdd = (e) => {
      const { product, quantity } = e.detail || {};
      if (!product) return;
      add(product, quantity || 1);
    };
    window.addEventListener("cart:add", onAdd);
    return () => window.removeEventListener("cart:add", onAdd);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ใช้ [] เพื่อเลี่ยง rebind event เมื่อ add เปลี่ยน

  // actions
  const add = useCallback((p, q = 1) => {
    const id = p?.id ?? p?.product_id;
    if (!id) return;
    const stock = Number(p.stock ?? Infinity);
    if (Number.isFinite(stock) && stock <= 0) return; // out of stock: ไม่เพิ่ม
    const mapped = {
      id,
      name: p.name ?? 'Product',
      price: Number(p.price ?? 0),
      image: p.image_url || p.img_url || 'https://via.placeholder.com/160x160.png?text=No+Image',
      quantity: Number(q || 1),
      size: p.size,
      color: p.color,
      stock: Number.isFinite(stock) ? stock : undefined,
    };
    setAndSave(prev => {
      const i = prev.findIndex(x => x.id === id);
      if (i >= 0) {
        const curr = prev[i];
        const max = Number.isFinite(stock) ? stock : Infinity;
        const nextQty = Math.min(Number(curr.quantity || 0) + mapped.quantity, max);
        if (nextQty <= 0) return prev.filter((_, idx) => idx !== i);
        return prev.map((x, idx) => (idx === i ? { ...x, quantity: nextQty } : x));
      } else {
        const max = Number.isFinite(stock) ? stock : Infinity;
        mapped.quantity = Math.min(mapped.quantity, max);
        if (mapped.quantity <= 0) return prev;
        return [...prev, mapped];
      }
    });
  }, [setAndSave]);

  const remove = useCallback((id) => setAndSave(prev => prev.filter(x => x.id !== id)), [setAndSave]);

  const patchQty = useCallback((id, delta) => {
    setAndSave(prev => prev
      .map(x => {
        if (x.id !== id) return x;
        const max = Number.isFinite(Number(x.stock)) ? Number(x.stock) : Infinity;
        const next = Math.max(0, Math.min(Number(x.quantity || 0) + Number(delta || 0), max));
        return { ...x, quantity: next };
      })
      .filter(x => x.quantity > 0));
  }, [setAndSave]);

  const clear = useCallback(() => setAndSave([]), [setAndSave]);

  const total = useMemo(() => items.reduce((s, it) => s + Number(it.price || 0) * Number(it.quantity || 0), 0), [items]);

  return { items, add, remove, patchQty, clear, total, setItems: setAndSave };
}
