import React, { useEffect, useState } from "react";
import { fetchProducts } from "../api/product";
import { useProduct } from '../hooks/useProduct';

const Product = () => {
  const [products, setProducts] = useState([]);   
  const [loading, setLoading] = useState(true);

  const {
    emblaRef,
    prevBtnEnabled,
    nextBtnEnabled,
    scrollNext,
    scrollPrev,
    addToCart,
    selectedProduct,
    setSelectedProduct
  } = useProduct ();

    useEffect(() => {
    // เรียก API ตอน component mount
    fetchProducts()
      .then(setProducts)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center h-40">
        Loading...
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto py-10 px-4">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">Product</h2>

      <div className="relative">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-6">
            {products.map((product) => (
              <div
                className="w-[90%] sm:w-1/2 md:w-1/3 lg:w-1/4 shrink-0"
                key={product.id}
              >
                <div
                  className="group relative bg-white rounded-lg shadow hover:shadow-lg transition cursor-pointer"
                  onClick={() => setSelectedProduct(product)}
                >
                  <img
                    alt={product.imageAlt}
                    src={product.imageSrc}
                    className="aspect-square w-full rounded-t-lg bg-gray-200 object-cover"
                  />
                  <div className="p-4 flex justify-between">
                    <div>
                      <h3 className="text-bold text-gray-700 font-bold">{product.name}</h3>
                      <p className="mt-1 text-sm text-gray-500">{product.color}</p>
                    </div>
                    <p className="text-sm font-medium text-gray-900">{product.price}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {prevBtnEnabled && (
          <button
            onClick={scrollPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 outline-none "
          >
            <i className='bx bxs-chevron-left text-2xl text-gray-600 hover:text-red-300' ></i>
          </button>
        )}
        {nextBtnEnabled && (
          <button
            onClick={scrollNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full outline-none "
          >
            <i className='bx bxs-chevron-right text-2xl text-gray-600 hover:text-red-300' ></i>
          </button>
        )}
      </div>

      {/* MODAL */}
      {selectedProduct && (
        <div
          className="fixed inset-0 z-50 grid place-content-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modalTitle"
        >
          <div className="w-full sm:w-[400px] md:w-[500px] lg:w-[600px] rounded-lg bg-white p-6 shadow-lg relative">
            <div className="flex items-start justify-between">
              <h2 id="modalTitle" className="text-xl font-bold text-black sm:text-2xl">
                {selectedProduct.name}
              </h2>

              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="-me-4 -mt-4 rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600 focus:outline-none"
                aria-label="Close"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="size-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="w-full mt-4 space-y-3">
              <img
                src={selectedProduct.imageSrc}
                alt={selectedProduct.imageAlt}
                className="w-full h-[300px] object-contain rounded-lg mb-4"
              />
              <p className="text-gray-700 text-sm">Color: {selectedProduct.color}</p>
              <p className="text-gray-900 font-semibold">{selectedProduct.price}</p>
            </div>

            <footer className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="rounded bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => {
                  addToCart(selectedProduct);
                  setSelectedProduct(null);
                }}
                className="rounded bg-gray-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700"
              >
                Add to Cart
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
};

export default Product;