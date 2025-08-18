import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const CartDrawer = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const drawerRef = useRef(null);
  const overlayRef = useRef(null);
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "Basic Tee 6-Pack",
      size: "XXS",
      color: "White",
      image: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=830&q=80",
      quantity: 1,
      price: 250,
    },
    {
      id: 2,
      name: "Basic Tee 6-Pack",
      size: "M",
      color: "Black",
      image: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=830&q=80",
      quantity: 1,
      price: 300,
    },
  ]);

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

  const increaseQty = (id) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decreaseQty = (id) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  };

  const removeItem = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);


  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          ref={overlayRef}
          className="fixed inset-0 bg-black/30 z-[99]"
        ></div>
      )}

      <div
        ref={drawerRef}
        className={`fixed top-0 right-0 h-full w-80 max-w-full bg-white z-[100] shadow-lg transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center px-4 py-3 border-b">
          <h2 className="text-lg font-semibold">Your Cart</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-500 text-xl"
          >
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
                />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-black">{item.name}</h3>
                  <p className="text-xs text-gray-500">
                    Size : {item.size} Color : {item.color}
                  </p>
                  <p className="text-xs text-gray-500">
                    Price : <span className="font-semibold text-black">{item.price}฿</span>
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
                <span>${totalPrice.toFixed(2)}</span>
              </div>

              <button
                onClick={() => navigate('/checkout')}
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
