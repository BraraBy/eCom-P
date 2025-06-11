import { useEffect, useState } from "react";
import { Navbar, Footer } from "../components";
import { Menu, X } from "lucide-react";

const ProductSection = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

    const [categorie, setCategories] = useState([]);

    useEffect(() => {
      fetch('http://localhost:4200/api/category')
        .then(res => res.json())
        .then(data => {
          if (data.status === "200" && Array.isArray(data.result)) {
            setCategories(data.result);
          }
        })
        .catch(err => {
          console.error('Failed to fetch products:', err);
        });
    }, []);

  return (
    <div className="bg-gray-100 min-h-screen w-full relative">
      <Navbar />

      {/* ☰ Toggle Button - Mobile only */}
      <div className="lg:hidden flex justify-between items-center px-4 py-3 bg-white shadow">
        <button onClick={() => setSidebarOpen(true)}>
          <Menu size={24} />
        </button>
        <p className="font-semibold text-gray-600">Categories</p>
      </div>

      {/* 🔳 Overlay & Sidebar (Mobile) */}
      {sidebarOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-opacity-40 z-40"
            onClick={() => setSidebarOpen(false)}
          ></div>

          {/* Sidebar */}
          <div className="fixed top-0 left-0 w-64 h-full bg-white z-50 shadow-lg transform transition-transform duration-300 translate-x-0">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold">Categories</h2>
              <button onClick={() => setSidebarOpen(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              {categorie.map((category, index) => (
                <a
                  key={category.category_id || index}
                  href="#"
                  className="block font-medium hover:underline text-gray-600"
                >
                  {category.name}
                </a>
              ))}
            </div>
          </div>
        </>
      )}

      {/* 💻 Main Content */}
      <div className="container px-4 py-8 mx-auto">
        <div className="lg:flex lg:-mx-2">
          {/* Sidebar (Desktop only) */}
        <div className="hidden lg:block space-y-3 lg:w-1/5 lg:px-2 lg:space-y-4">
          {categorie.map((category, index) => (
            <a
              key={category.category_id || index}
              href="#"
              className="block font-medium hover:underline text-gray-600"
            >
              {category.name}
            </a>
          ))}
        </div>


          <div className="mt-6 lg:mt-0 lg:px-2 lg:w-4/5">
            <div className="flex items-center justify-between text-sm tracking-widest uppercase">
              <p className="text-gray-500 ">6 Items</p>
              <div className="flex items-center">
                <p className="text-gray-500 ">Sort</p>
                <select className="font-medium text-gray-700 bg-transparent focus:outline-none">
                  <option value="#">Recommended</option>
                  <option value="#">Size</option>
                  <option value="#">Price</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8 mt-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[
                {
                  name: "Printed T-shirt",
                  price: "$12.55",
                  image:
                    "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=634&q=80",
                },
                {
                  name: "Slub jersey T-shirt",
                  price: "$18.70",
                  image:
                    "https://images.unsplash.com/photo-1620799139507-2a76f79a2f4d?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=966&q=80",
                },
                {
                  name: "T-shirt with a motif",
                  price: "$16.55",
                  image:
                    "https://images.unsplash.com/photo-1603320409990-02d834987237?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80",
                },
                {
                  name: "Art T-shirt",
                  price: "$12.55",
                  image:
                    "https://images.unsplash.com/photo-1603320410149-db26b12d5c2b?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=634&q=80",
                },
              ].map((product, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center justify-center w-full max-w-lg mx-auto"
                >
                  <img
                    className="object-cover w-full rounded-md h-72 xl:h-80"
                    src={product.image}
                    alt={product.name}
                  />
                  <h4 className="mt-2 text-lg font-medium text-gray-700">
                    {product.name}
                  </h4>
                  <p className="text-blue-500">{product.price}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div><Footer/></div>
    </div>
  );
};

export default ProductSection;
