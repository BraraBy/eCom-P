import Swal from "sweetalert2";
import { useSearchParams } from "react-router-dom";
import useProduct from "../hooks/useProduct";
import useHorizontalScroll from "../hooks/useHorizontalScroll";

const FALLBACK_IMG = "https://via.placeholder.com/400x300.png?text=No+Image";
const formatPrice = (n) =>
  typeof n === "number"
    ? n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : n;

export default function Product() {
  const [params] = useSearchParams();
  const search = params.get("search") || "";

  const { items, loading, error, count } = useProduct({ search });
  const { scrollerRef, canLeft, canRight, scrollBy, onScroll } = useHorizontalScroll([items]);

  const onAddToCart = (product, quantity) => {
    window.dispatchEvent(new CustomEvent("cart:add", { detail: { product, quantity } }));
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: "Added to cart",
      showConfirmButton: false,
      timer: 1400,
      timerProgressBar: true,
    });
  };

  if (loading) {
    return (
      <section className="container mx-auto px-4 py-8">
        <div className="mb-4 text-sm text-gray-500">
          {search ? `กำลังค้นหา “${search}”…` : "Loading products…"}
        </div>
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
        <h2 className="text-xl font-semibold">
          {search ? `ผลการค้นหา: “${search}”` : "Recommend"}
        </h2>
        <span className="text-sm text-gray-500">Total: {count}</span>
      </div>

      {count === 0 ? (
        <div className="text-gray-500">No products found</div>
      ) : (
        <div className="relative">
          <button
            type="button"
            onClick={() => scrollBy("left")}
            className={`flex items-center justify-center absolute left-2 top-1/2 -translate-y-1/2 z-10
                        w-10 h-10 rounded-full bg-white shadow hover:bg-gray-50 transition
                        ${canLeft ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            aria-label="Scroll left"
            aria-hidden={!canLeft}
          >
            <i className="bx bx-chevron-left text-2xl" />
          </button>

          <div
            ref={scrollerRef}
            onScroll={onScroll}
            className="flex gap-4 overflow-x-auto scroll-smooth no-scrollbar py-1 px-6"
          >
            {items.map((p, idx) => {
              const key = p.product_id ?? p.id ?? p.code ?? p.slug ?? `p-${idx}`;
              return (
                <article
                  key={key}
                  className="
                    flex-shrink-0
                    basis-1/1 sm:basis-1/2 lg:basis-1/4
                    group rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-transform duration-200 overflow-hidden
                  "
                >
                  <div className="block w-full text-left">
                    <div className="aspect-[4/3] bg-gray-50 overflow-hidden">
                      <img
                        src={p.image_url || FALLBACK_IMG}
                        alt={p.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => (e.currentTarget.src = FALLBACK_IMG)}
                      />
                    </div>
                  </div>

                  <div className="p-3">
                    <h3 className="line-clamp-2 font-medium text-sm text-gray-900 min-h-[40px]">{p.name}</h3>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-indigo-600 font-semibold">฿{formatPrice(p.price)}</span>
                      {Number(p.stock || 0) > 0 ? (
                        <button
                          className="rounded-lg bg-gray-900 text-white px-3 py-2 text-xs hover:bg-black disabled:opacity-50"
                          onClick={() => onAddToCart(p, 1)}
                        >
                          Add to Cart
                        </button>
                      ) : (
                        <span className="text-xs rounded-lg px-3 py-2 border border-gray-200 text-gray-400">
                          Out of stock
                        </span>
                      )}
                    </div>
                    {typeof p.stock === "number" && (
                      <div className="mt-2 text-xs text-gray-500">Stock: {p.stock}</div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => scrollBy("right")}
            className={`flex items-center justify-center absolute right-2 top-1/2 -translate-y-1/2 z-10
                        w-10 h-10 rounded-full bg-white shadow hover:bg-gray-50 transition
                        ${canRight ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            aria-label="Scroll right"
            aria-hidden={!canRight}
          >
            <i className="bx bx-chevron-right text-2xl" />
          </button>
        </div>
      )}
    </section>
  );
}
