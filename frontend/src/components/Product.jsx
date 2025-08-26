import { useState } from "react";
import useProduct from "../hooks/useProduct";

const FALLBACK_IMG = "https://via.placeholder.com/400x300.png?text=No+Image";
const formatPrice = (n) =>
  typeof n === "number"
    ? n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : n;

export default function Product() {
  const { items, loading, error, count } = useProduct(); // ยังใช้ hook เดิม
  const [selected, setSelected] = useState(null);
  const [qty, setQty] = useState(1);

  // TODO: เปลี่ยนให้เรียกฟังก์ชัน cart จริงของคุณ
  const onAddToCart = (product, quantity) => {
    // ตัวอย่าง fallback: ส่ง event ให้ส่วนอื่นไปรับ
    window.dispatchEvent(
      new CustomEvent("cart:add", { detail: { product, quantity } })
    );
    // ปิดโมดอลหลังเพิ่ม
    setSelected(null);
    setQty(1);
  };

  const openModal = (p) => {
    setSelected(p);
    setQty(1);
  };

  const inc = () =>
    setQty((q) => Math.min(q + 1, typeof selected?.stock === "number" ? selected.stock : q + 1));
  const dec = () => setQty((q) => Math.max(1, q));

  if (loading) {
    return (
      <section className="container mx-auto px-4 py-8">
        <div className="mb-4 text-sm text-gray-500">Loading products…</div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-60 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="container mx-auto px-4 py-8">
        <div className="text-red-600">Error: {error}</div>
      </section>
    );
  }

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="flex items-end justify-between mb-6">
        <h2 className="text-xl font-semibold">Product</h2>
        <span className="text-sm text-gray-500">Total: {count}</span>
      </div>

      {/* GRID สินค้า */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((p) => (
          <article
            key={p.id}
            className="rounded-xl bg-white shadow-sm hover:shadow-md transition overflow-hidden"
          >
            <button
              className="block w-full aspect-[4/3] bg-gray-50"
              onClick={() => openModal(p)}
              aria-label={`Open ${p.name}`}
            >
              <img
                src={p.image_url || FALLBACK_IMG}
                alt={p.name}
                className="w-full h-full object-cover"
                onError={(e) => (e.currentTarget.src = FALLBACK_IMG)}
              />
            </button>

            <div className="p-3">
              <h3 className="line-clamp-1 font-medium">{p.name}</h3>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-indigo-600 font-semibold">฿{formatPrice(p.price)}</span>
                <span className="text-xs text-gray-500">
                  {typeof p.stock === "number" ? `Stock: ${p.stock}` : null}
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* MODAL (ไม่มี description; เพิ่ม qty + Add to Cart) */}
      {selected && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full max-w-2xl bg-white rounded-2xl overflow-hidden shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h4 className="font-semibold line-clamp-1">{selected.name}</h4>
              <button onClick={() => setSelected(null)} className="p-2 rounded hover:bg-gray-100">
                <i className="bx bx-x text-2xl" />
              </button>
            </div>

            {/* Body */}
            <div className="grid md:grid-cols-2 gap-4 p-4">
              <div className="aspect-[4/3] bg-gray-50 rounded-lg overflow-hidden">
                <img
                  src={selected.image_url || FALLBACK_IMG}
                  alt={selected.name}
                  className="w-full h-full object-cover"
                  onError={(e) => (e.currentTarget.src = FALLBACK_IMG)}
                />
              </div>

              <div className="space-y-4">
                <div className="text-2xl font-bold text-indigo-700">
                  ฿{formatPrice(selected.price)}
                </div>
                {typeof selected.stock === "number" && (
                  <div className="text-sm text-gray-500">Stock: {selected.stock}</div>
                )}

                {/* Quantity */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={dec}
                    className="w-9 h-9 rounded-md border border-gray-300 hover:bg-gray-50"
                    aria-label="Decrease quantity"
                  >
                    –
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={typeof selected.stock === "number" ? selected.stock : undefined}
                    value={qty}
                    onChange={(e) => {
                      const v = Math.max(
                        1,
                        Math.min(
                          Number(e.target.value || 1),
                          typeof selected.stock === "number" ? selected.stock : Number(e.target.value || 1)
                        )
                      );
                      setQty(v);
                    }}
                    className="w-16 text-center border rounded-md py-1"
                  />
                  <button
                    onClick={inc}
                    className="w-9 h-9 rounded-md border border-gray-300 hover:bg-gray-50"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                {/* Add to Cart */}
                <button
                  onClick={() => onAddToCart(selected, qty)}
                  disabled={typeof selected.stock === "number" && selected.stock < 1}
                  className="w-full py-3 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:bg-gray-300"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}