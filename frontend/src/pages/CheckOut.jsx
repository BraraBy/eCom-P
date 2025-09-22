// src/pages/CheckOut.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import useCart from "../hooks/useCart";        // ✅ แก้ path
import { Navbar, Footer } from "../components"; // ✅ แก้ path (ต้องมี index ใน components)
import { apiFetch } from "../lib/api";          // ✅ แก้ path

const fmt = (n) =>
  Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function CheckOut() {
  const navigate = useNavigate();
  const { items, patchQty, remove, clear } = useCart();

  // โหลด user จาก localStorage เพื่อเติมที่อยู่
  const [user, setUser] = useState(null);
  useEffect(() => {
    try {
      setUser(JSON.parse(localStorage.getItem("user") || "null"));
    } catch {
      setUser(null);
    }
  }, []);

  // สรุปราคา
  const subtotal = useMemo(
    () => items.reduce((sum, it) => sum + Number(it.price || 0) * Number(it.quantity || 0), 0),
    [items]
  );
  const total = subtotal;

  // ส่งคำสั่งซื้อ
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");
  const [successId, setSuccessId] = useState(null);
  const timerRef = useRef(null);
  useEffect(() => () => clearTimeout(timerRef.current), []);

  const placeOrder = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/login?redirect=/checkout"); // guest → ไปล็อกอินก่อน
      return;
    }
    if (items.length === 0) return;

    setPlacing(true);
    setError("");

    try {
      const payload = {
        total_amount: Number(total.toFixed(2)),
        items: items.map((it) => ({
          product_id: it.product_id ?? it.id,
          quantity: Number(it.quantity || 1),
          price: Number(it.price || 0),
        })),
      };

      const data = await apiFetch("/api/orders", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setSuccessId(data.result?.order_id || null);
      clear(); // ล้างตะกร้าของ user ปัจจุบัน
      setPlacing(false);
      timerRef.current = setTimeout(() => navigate("/", { replace: true }), 1500);
    } catch (e) {
      setError(e.message || "Place order failed");
      setPlacing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-xl font-semibold">Checkout</h1>
          <p className="text-sm text-gray-500">Please review your order before confirming.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* LEFT: รายการสินค้า */}
          <section className="lg:col-span-2">
            <div className="rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b">
                <h2 className="font-semibold">Items in your cart</h2>
              </div>

              {items.length === 0 ? (
                <div className="p-6 text-gray-500 text-sm">
                  There are no products in the cart.{" "}
                  <Link to="/" className="text-indigo-600 underline">Continue shopping</Link>
                </div>
              ) : (
                <ul className="divide-y">
                  {items.map((it) => (
                    <li key={it.id ?? it.product_id} className="p-4 flex gap-4">
                      <img
                        src={it.image || it.image_url || "https://via.placeholder.com/120x120.png?text=No+Image"}
                        alt={it.name}
                        className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                        onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/120x120.png?text=No+Image")}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="font-medium line-clamp-2">{it.name}</h3>
                          <button
                            onClick={() => remove(it.id ?? it.product_id)}
                            className="text-gray-400 hover:text-red-500"
                            aria-label="Remove"
                          >
                            <i className="bx bx-x text-2xl"></i>
                          </button>
                        </div>
                        <div className="mt-1 text-sm text-gray-500">฿{fmt(it.price)}</div>
                        <div className="mt-3 flex items-center gap-3">
                          <button
                            onClick={() => patchQty(it.id ?? it.product_id, -1)}
                            className="w-8 h-8 rounded-md border hover:bg-gray-50"
                            aria-label="decrease"
                          >
                            –
                          </button>
                          <span className="min-w-8 text-center">{it.quantity}</span>
                          <button
                            onClick={() => patchQty(it.id ?? it.product_id, +1)}
                            className="w-8 h-8 rounded-md border hover:bg-gray-50"
                            aria-label="increase"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          {/* RIGHT: สรุปยอด */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl bg-white shadow-sm border border-gray-100 p-4 space-y-3">
              <h3 className="font-semibold">Order Summary</h3>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span><span>฿{fmt(subtotal)}</span>
              </div>
              <hr />
              <div className="flex justify-between font-semibold">
                <span>Total</span><span>฿{fmt(total)}</span>
              </div>

              {error && <div className="text-sm text-red-600 bg-red-50 rounded-md px-3 py-2">{error}</div>}

              <button
                onClick={placeOrder}
                disabled={placing || items.length === 0}
                className="w-full py-3 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:bg-gray-300"
              >
                {placing ? "Placing order..." : "Confirm Order"}
              </button>

              <button
                onClick={() => navigate("/")}
                className="w-full py-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-sm"
              >
                Continue Shopping
              </button>

              {successId && (
                <p className="text-sm text-green-600">
                  สั่งซื้อสำเร็จ! หมายเลขคำสั่งซื้อ: <span className="font-semibold">{successId}</span>
                </p>
              )}
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
