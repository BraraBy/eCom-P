import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useOrders from "../hooks/useOrders";
import { Navbar, Footer } from "../components";

const fmt = (n) =>
  Number(n || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export default function OrderHistory() {
  const navigate = useNavigate();
  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    if (!token) navigate("/login?redirect=/orders", { replace: true });
  }, [token, navigate]);

  const {
    orders,
    loadingOrders,
    errorOrders,
    itemsByOrder,
    loadingItems,
    errorItems,
    loadItems,
  } = useOrders();

  const [open, setOpen] = useState({});

  const sorted = [...orders].sort(
    (a, b) =>
      new Date(b.order_date || b.created_at) -
        new Date(a.order_date || a.created_at) ||
      (b.order_id ?? 0) - (a.order_id ?? 0)
  );

  const toggle = async (oid) => {
    setOpen((p) => ({ ...p, [oid]: !p[oid] }));
    if (!itemsByOrder[oid]) await loadItems(oid);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="container md:mx-auto sm:px-30 px-4 py-6">
        <h1 className="text-xl font-semibold mb-4">Order History</h1>

        {loadingOrders && (
          <div className="text-gray-500">Loading…</div>
        )}
        {errorOrders && <div className="text-red-600">{errorOrders}</div>}

        {!loadingOrders && !errorOrders && sorted.length === 0 && (
          <div className="text-gray-500">No orders yet</div>
        )}

        <div className="space-y-4">
          {sorted.map((o, idx) => {
            const userSeq = sorted.length - idx;
            const isOpen = !!open[o.order_id];
            const items = itemsByOrder[o.order_id] || [];
            const statusUpper = String(o.status || "COMPLETED").toUpperCase();
            const statusText =
              statusUpper.charAt(0) + statusUpper.slice(1).toLowerCase();

            return (
              <section
                key={o.order_id}
                className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden"
              >
                {/* แถวหัวการ์ด */}
                <div className="p-4 flex flex-wrap items-center gap-4">
                  {/* ซ้าย: ชื่อ/เวลา */}
                  <div className="flex-1 min-w-[180px]">
                    <div className="text-sm text-gray-600">Order #{userSeq}</div>
                    <div className="text-xs text-gray-400">
                      {new Date(o.order_date || o.created_at)
                      .toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' })}
                    </div>
                  </div>
                  <div className="w-24 text-right text-gray-600">
                    total: <span className="font-medium">{o.item_count ?? "-"}</span>
                  </div>
                  <div className="w-40 sm:text-right">
                    TOTAL:{" "}
                    <span className="font-semibold">฿{fmt(o.total_amount ?? 0)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-sm">
                      STATUS:{" "}
                      <span
                        className={`font-medium ${
                          statusUpper === "COMPLETED"
                            ? "text-green-600"
                            : "text-gray-700"
                        }`}
                      >
                        {statusText}
                      </span>
                    </div>
                    <button
                      onClick={() => toggle(o.order_id)}
                      className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
                    >
                      {isOpen ? "Hide" : "Details"}
                    </button>
                  </div>
                </div>

                {/* รายการสินค้าในออเดอร์ */}
                {isOpen && (
                  <div className="border-t">
                    {loadingItems[o.order_id] && (
                      <div className="p-4 text-gray-500">Loading product list…</div>
                    )}
                    {errorItems[o.order_id] && (
                      <div className="p-4 text-red-600">{errorItems[o.order_id]}</div>
                    )}
                    {!loadingItems[o.order_id] && !errorItems[o.order_id] && (
                      <ul className="divide-y">
                        {items.map((it, i) => (
                          <li
                            key={it.order_detail_id ?? it.product_id ?? i}
                            className="p-4 flex items-center gap-4"
                          >
                            <img
                              src={
                                it.image_url ||
                                "https://via.placeholder.com/120x120.png?text=No+Image"
                              }
                              alt={it.product_name || `Product ${it.product_id}`}
                              className="w-16 h-16 rounded-md object-cover"
                              onError={(e) =>
                                (e.currentTarget.src =
                                  "https://via.placeholder.com/120x120.png?text=No+Image")
                              }
                            />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm">
                                {it.product_name || `#${it.product_id}`}
                              </div>
                              <div className="text-xs text-gray-500">
                                ฿{fmt(it.price)} × {it.quantity}
                              </div>
                            </div>
                            <div className="text-sm font-semibold">
                              ฿{fmt(it.quantity * it.price)}
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </main>
      <Footer />
    </div>
  );
}
