import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useCart from "../../hooks/useCart";

const CartDrawer = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const drawerRef = useRef(null);
  const overlayRef = useRef(null);
  const { items, patchQty, remove, clear, total } = useCart();

  useEffect(() => {
    const root = document.documentElement;
    if (isOpen) root.style.overflow = "hidden";
    else root.style.overflow = "";
    return () => { root.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target) && overlayRef.current?.contains(e.target)) {
        onClose();
      }
    };
    const handleEscape = (e) => { if (e.key === "Escape") onClose(); };
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
    if (!token) navigate("/login?redirect=/checkout");
    else navigate("/checkout");
  };

  return (
    <>
      {isOpen && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-[99] bg-black/40 backdrop-blur-[1px] transition-opacity"
        />
      )}

      <aside
        ref={drawerRef}
        className={`fixed top-0 right-0 h-dvh 
          w-[85vw] sm:w-80 md:w-96 z-[100]
          bg-white shadow-2xl rounded-l-2xl
          transform transition-transform duration-300
          ${isOpen ? "translate-x-0" : "translate-x-full"}`}
        aria-hidden={!isOpen}
        role="dialog"
        aria-label="Cart drawer"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 border-b bg-white/90 backdrop-blur flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <i className="bx bx-cart text-2xl text-gray-700" />
            <h2 className="text-lg font-semibold">Your Cart</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-100 grid place-items-center"
            aria-label="Close cart"
          >
            <i className="bx bx-x text-2xl text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="h-[calc(100dvh-56px-88px)] overflow-y-auto px-4 py-3 space-y-3">
          {items.length === 0 && (
            <div className="flex h-full items-center justify-center">
              <div className="text-center text-gray-500">
                <div className="mx-auto mb-3 w-14 h-14 rounded-full grid place-items-center bg-gray-100">
                  <i className="bx bx-shopping-bag text-2xl" />
                </div>
                <p className="font-medium">Your cart is empty</p>
                <p className="text-sm text-gray-400">Add items to continue.</p>
              </div>
            </div>
          )}

          {items.map((item, idx) => (
            <div key={item.id ?? idx} className="flex gap-3 py-3 border-b last:border-b-0">
              <img
                src={item.image}
                alt={item.name}
                className="w-20 h-20 rounded-md object-cover bg-gray-50"
                onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/160x160.png?text=No+Image"; }}
              />
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold truncate">{item.name}</h3>
                {(item.size || item.color) && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    {item.size ? `Size: ${item.size}` : ""}{item.size && item.color ? " • " : ""}{item.color ? `Color: ${item.color}` : ""}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Price: <span className="font-semibold text-gray-900">฿{Number(item.price).toFixed(2)}</span>
                </p>

                <div className="mt-2 flex items-center gap-2">
                  <button
                    className="w-7 h-7 text-sm font-bold border rounded-md hover:bg-gray-50"
                    onClick={() => patchQty(item.id, -1)}
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="text-sm w-6 text-center tabular-nums">{item.quantity}</span>
                  <button
                    className="w-7 h-7 text-sm font-bold border rounded-md hover:bg-gray-50 disabled:opacity-40"
                    onClick={() => patchQty(item.id, +1)}
                    disabled={Number.isFinite(Number(item.stock)) && Number(item.quantity) >= Number(item.stock)}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                  {Number.isFinite(Number(item.stock)) && Number(item.stock) > 0 && (
                    <span className="text-[11px] text-gray-500">Max {item.stock}</span>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end justify-between">
                <button
                  className="text-gray-500 hover:text-red-600"
                  onClick={() => remove(item.id)}
                  aria-label={`Remove ${item.name}`}
                  title="Remove"
                >
                  <i className="bx bx-trash text-xl" />
                </button>
                <div className="text-sm font-semibold">฿{(Number(item.price) * Number(item.quantity)).toFixed(2)}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 border-t bg-white/90 backdrop-blur px-4 py-4">
          <div className="flex items-center justify-between text-sm mb-3">
            <span className="text-gray-600">Total</span>
            <span className="text-base font-semibold">฿{total.toFixed(2)}</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => clear()}
              className="w-1/3 rounded-lg border px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
              disabled={items.length === 0}
            >
              Clear
            </button>
            <button
              onClick={handleCheckout}
              className="w-2/3 rounded-lg bg-gray-900 px-4 py-3 text-sm font-medium text-white hover:bg-black disabled:opacity-50"
              disabled={items.length === 0}
            >
              Checkout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default CartDrawer;
