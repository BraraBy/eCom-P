import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const STORAGE_KEY = "cart.items";

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}
function saveCart(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

const CartDrawer = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const drawerRef = useRef(null);
  const overlayRef = useRef(null);

  // เริ่มต้นด้วยข้อมูลจาก localStorage (ไม่ใช้ mock แล้ว)
  const [cartItems, setCartItems] = useState(() => loadCart());

  // --- รับ event เพิ่มสินค้าจาก Product.jsx ---
  useEffect(() => {
    const onAdd = (e) => {
      const { product, quantity = 1 } = e.detail || {};
      if (!product) return;

      setCartItems((prev) => {
        // map field ให้เข้ากับ UI เดิม
        const id = product.id ?? product.product_id;
        const name = product.name ?? "Product";
        const price = Number(product.price ?? 0);
        const image =
          product.image_url ||
          product.img_url ||
          "https://via.placeholder.com/160x160.png?text=No+Image";

        // ถ้ามีอยู่แล้ว → บวกจำนวน
        const idx = prev.findIndex((p) => p.id === id);
        let next = [];
        if (idx >= 0) {
          next = prev.map((p, i) =>
            i === idx ? { ...p, quantity: p.quantity + quantity } : p
          );
        } else {
          next = [
            ...prev,
            {
              id,
              name,
              price,
              image,
              quantity,
              // optional fields เผื่ออนาคต
              size: product.size,
              color: product.color,
              stock: product.stock,
            },
          ];
        }
        saveCart(next);
        return next;
      });
    };

    const onClear = () => {
      saveCart([]);
      setCartItems([]);
    };

    window.addEventListener("cart:add", onAdd);
    window.addEventListener("cart:clear", onClear);
    return () => {
      window.removeEventListener("cart:add", onAdd);
      window.removeEventListener("cart:clear", onClear);
    };
  }, []);

  // คลิกนอก/กด ESC ปิด
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        drawerRef.current &&
        !drawerRef.current.contains(event.target) &&
        overlayRef.current?.contains(event.target)
      ) {
        onClose();
      }
    };
    const handleEscape = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  // เปลี่ยนจำนวน/ลบ + persist
  const patchQty = useCallback((id, delta) => {
    setCartItems((prev) => {
      const next = prev
        .map((item) =>
          item.id === id
            ? { ...item, quantity: Math.max(1, (item.quantity || 1) + delta) }
            : item
        )
        .filter((item) => item.quantity > 0);
      saveCart(next);
      return next;
    });
  }, []);

  const increaseQty = (id) => patchQty(id, +1);
  const decreaseQty = (id) => patchQty(id, -1);

  const removeItem = (id) => {
    setCartItems((prev) => {
      const next = prev.filter((item) => item.id !== id);
      saveCart(next);
      return next;
    });
  };

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
    0
  );

  return (
    <>
      {/* Overlay */}
      {isOpen && <div ref={overlayRef} className="fixed inset-0 bg-black/30 z-[99]" />}

      <div
        ref={drawerRef}
        className={`fixed top-0 right-0 h-full w-80 max-w-full bg-white z-[100] shadow-lg transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center px-4 py-3 border-b">
          <h2 className="text-lg font-semibold">Your Cart</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-red-500 text-xl">
            ×
          </button>
        </div>

        <div className="p-4 space-y-6">
          <ul className="space-y-4">
            {cartItems.map((item) => (
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
                      onClick={() => decreaseQty(item.id)}
                    >
                      −
                    </button>
                    <span className="text-sm">{item.quantity}</span>
                    <button
                      className="w-6 h-6 text-sm font-bold border rounded text-gray-700 hover:bg-gray-100 cursor-pointer"
                      onClick={() => increaseQty(item.id)}
                    >
                      +
                    </button>
                  </div>
                </div>
                <button
                  className="text-gray-500 hover:text-red-600 cursor-pointer"
                  onClick={() => removeItem(item.id)}
                  aria-label={`Remove ${item.name}`}
                >
                  🗑
                </button>
              </li>
            ))}
          </ul>

          {cartItems.length === 0 && (
            <p className="text-sm text-gray-400 text-center">Your cart is empty</p>
          )}

          {cartItems.length > 0 && (
            <div className="px-4 pb-6 space-y-3">
              <div className="flex justify-between items-center text-sm text-gray-700 font-medium mb-2">
                <span>Total</span>
                <span>฿{totalPrice.toFixed(2)}</span>
              </div>

              <button
                onClick={() => {
                  onClose();
                  navigate("/checkout");
                }}
                className="w-full rounded-md bg-gray-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-700 cursor-pointer"
              >
                Checkout
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CartDrawer;
