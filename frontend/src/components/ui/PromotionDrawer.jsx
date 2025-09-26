import React, { useEffect, useRef, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { apiListActivePromos } from "../../api/promotions";

const Chip = ({ children }) => (
  <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
    {children}
  </span>
);

const SkeletonCard = () => (
  <div className="border rounded-lg p-3 animate-pulse">
    <div className="h-4 w-40 bg-gray-200 rounded mb-2" />
    <div className="h-3 w-56 bg-gray-200 rounded mb-2" />
    <div className="h-3 w-24 bg-gray-200 rounded" />
  </div>
);

const PromotionDrawer = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const drawerRef = useRef(null);
  const overlayRef = useRef(null);

  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(false);

  // ล็อกสกรอลล์
  useEffect(() => {
    const root = document.documentElement;
    if (isOpen) root.style.overflow = "hidden";
    else root.style.overflow = "";
    return () => { root.style.overflow = ""; };
  }, [isOpen]);

  // โหลดโปรโมชันเมื่อเปิด
  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    apiListActivePromos()
      .then((data) => setPromos(Array.isArray(data) ? data : []))
      .catch(() => setPromos([]))
      .finally(() => setLoading(false));
  }, [isOpen]);

  // ปิดเมื่อคลิกนอก/กด ESC
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

  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      // toast ภายในแบบง่าย
      const ev = new CustomEvent("app:toast", { detail: { type: "success", message: "Copied coupon code" } });
      window.dispatchEvent(ev);
    } catch {}
  };

  const now = Date.now();
  const normalized = useMemo(() => {
    return promos.map((p) => {
      const id = p.promotion_id ?? p.id;
      const title = p.title ?? p.name ?? "Promotion";
      const desc = p.description ?? p.details ?? "";
      const code = p.code ?? p.coupon_code ?? null;
      const percent = typeof p.discount_percent === "number" ? p.discount_percent : null;
      const amount = typeof p.discount_amount === "number" ? p.discount_amount : null;
      const ends = p.ends_at ? new Date(p.ends_at).getTime() : null;
      const expired = ends ? ends < now : false;
      return { id, title, desc, code, percent, amount, ends, expired, raw: p };
    });
  }, [promos, now]);

  return (
    <>
      {isOpen && (
        <div ref={overlayRef} className="fixed inset-0 z-[99] bg-black/40 backdrop-blur-[1px] transition-opacity" />
      )}

      <aside
        ref={drawerRef}
        className={`fixed top-0 right-0 h-dvh 
          w-[85vw] sm:w-80 md:w-96 z-[100]
          bg-white shadow-2xl rounded-l-2xl
          transform transition-transform duration-300
          ${isOpen ? "translate-x-0" : "translate-x-full"}`}
        role="dialog"
        aria-label="Promotion drawer"
        aria-hidden={!isOpen}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 border-b bg-white/90 backdrop-blur flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <i className="bx bx-purchase-tag text-2xl text-gray-700" />
            <h2 className="text-lg font-semibold">Promotions</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-100 grid place-items-center"
            aria-label="Close promotions"
          >
            <i className="bx bx-x text-2xl text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="h-[calc(100dvh-56px-72px)] overflow-y-auto px-4 py-3 space-y-3">
          {loading && (
            <>
              <SkeletonCard /><SkeletonCard /><SkeletonCard />
            </>
          )}

          {!loading && normalized.length === 0 && (
            <div className="flex h-full items-center justify-center">
              <div className="text-center text-gray-500">
                <div className="mx-auto mb-3 w-14 h-14 rounded-full grid place-items-center bg-gray-100">
                  <i className="bx bx-purchase-tag-alt text-2xl" />
                </div>
                <p className="font-medium">There are no promotions yet.</p>
                <p className="text-sm text-gray-400">Come back and check it out again soon.</p>
              </div>
            </div>
          )}

          {normalized.map((p) => (
            <div key={p.id} className={`border rounded-lg p-3 hover:shadow-sm transition ${p.expired ? "opacity-60" : ""}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-semibold leading-snug line-clamp-1">{p.title}</h3>
                  <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{p.desc || "—"}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {p.percent != null && <Chip>{p.percent}% OFF</Chip>}
                    {p.amount != null && <Chip>−฿{Number(p.amount).toFixed(0)}</Chip>}
                    {p.code && (
                      <button
                        onClick={() => copy(p.code)}
                        className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100"
                        title="Copy coupon code"
                      >
                        <i className="bx bx-copy-alt text-base" />
                        {p.code}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                <span className={`${p.expired ? "text-red-500" : ""}`}>
                  {p.ends ? `to ${new Date(p.ends).toLocaleDateString()}` : "No expiration date"}
                </span>
                {!p.expired && (
                  <button
                    onClick={() => {
                      navigate("/categories?highlight=promotions");
                      onClose();
                    }}
                    className="text-blue-600 hover:underline"
                  >
                    View products
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 border-t bg-white/90 backdrop-blur px-4 py-3">
          <button
            onClick={() => {
              navigate("/promotions");
              onClose();
            }}
            className="w-full rounded-lg border px-4 py-3 text-sm hover:bg-gray-50"
          >
            See all the Promotions.
          </button>
        </div>
      </aside>
    </>
  );
};

export default PromotionDrawer;
