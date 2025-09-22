import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useCart from "../../hooks/useCart";

const CartDrawer = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const drawerRef = useRef(null);
  const overlayRef = useRef(null);

  // ใช้ state/actions จาก useCart
  const { items, patchQty, remove, clear, total } = useCart();

  // ล็อกการสกรอลล์เวลาเปิด Drawer
  useEffect(() => {
    const root = document.documentElement;
    if (isOpen) root.style.overflow = "hidden";
    else root.style.overflow = "";
    return () => { root.style.overflow = ""; };
  }, [isOpen]);

  // ปิดเมื่อคลิกนอก/กด ESC
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        drawerRef.current &&
        !drawerRef.current.contains(e.target) &&
        overlayRef.current?.contains(e.target)
      ) {
        onClose();
      }
    };
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  const handleCheckout = () => {
    onClose();
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/login?redirect=/checkout"); // ✅ guest → ไปล็อกอิน
    } else {
      navigate("/checkout"); // ✅ user → ไปต่อ
    }
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && <div ref={overlayRef} className="fixed inset-0 bg-black/30 z-[99]" />}

      <div
        ref={drawerRef}
        className={`fixed top-0 -right-0 h-full w-80 max-w-full bg-white z-[100]
                    transform transition-transform duration-300
                    ${isOpen ? "translate-x-0 shadow-lg" : "translate-x-[110%] shadow-none"}`}
      >
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center px-4 py-3 border-b">
            <h2 className="text-lg font-semibold">Your Cart</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-red-500 text-xl">×</button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <ul className="space-y-4">
              {items.map((item) => (
                <li key={item.id} className="flex items-center gap-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 rounded-sm object-cover"
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://via.placeholder.com/160x160.png?text=No+Image";
                    }}
                  />
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-black">{item.name}</h3>
                    {(item.size || item.color) && (
                      <p className="text-xs text-gray-500">
                        {item.size ? `Size: ${item.size}` : ""}{" "}
                        {item.color ? `Color: ${item.color}` : ""}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      Price : <span className="font-semibold text-black">฿{Number(item.price).toFixed(2)}</span>
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        className="w-6 h-6 text-sm font-bold border rounded text-gray-700 hover:bg-gray-100 cursor-pointer"
                        onClick={() => patchQty(item.id, -1)}
                      >
                        −
                      </button>
                      <span className="text-sm">{item.quantity}</span>
                      <button
                        className="w-6 h-6 text-sm font-bold border rounded text-gray-700 hover:bg-gray-100 cursor-pointer"
                        onClick={() => patchQty(item.id, +1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <button
                    className="text-gray-500 hover:text-red-600 cursor-pointer"
                    onClick={() => remove(item.id)}
                    aria-label={`Remove ${item.name}`}
                  >
                    🗑
                  </button>
                </li>
              ))}
            </ul>

            {items.length === 0 && (
              <p className="text-sm text-gray-400 text-center">Your cart is empty</p>
            )}

            {items.length > 0 && (
              <div className="px-4 pb-6 space-y-3">
                <div className="flex justify-between items-center text-sm text-gray-700 font-medium mb-2">
                  <span>Total</span>
                  <span>฿{total.toFixed(2)}</span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => clear()}
                    className="w-1/3 rounded-md border px-5 py-3 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Clear
                  </button>
                  <button
                    onClick={handleCheckout}
                    className="w-2/3 rounded-md bg-gray-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-700 cursor-pointer"
                  >
                    Checkout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CartDrawer;
