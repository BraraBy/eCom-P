import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, useSearchParams} from "react-router-dom"; // ⬅️ เพิ่ม useNavigate
import { Navbar, Footer } from "../components";
import { Menu, X } from "lucide-react";
import useProduct from "../hooks/useProduct";
import Swal from "sweetalert2";

const API = import.meta.env.VITE_API_URL || "http://localhost:4200";
const slugify = (s = "") =>
  String(s).toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

export default function Categorie() {
  const { slug } = useParams();
  const [params] = useSearchParams();
  const search = (params.get("search") || "").trim();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [active, setActive] = useState("all");
  const [loadingCats, setLoadingCats] = useState(true);
  const [catErr, setCatErr] = useState("");
  const [sort, setSort] = useState("recommended");

  // โหลดหมวดจาก DB
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API}/api/category`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        if (data.status === "200" && Array.isArray(data.result)) {
          const list = data.result.map((c) => ({
            id: String(c.category_id),
            name: c.name,
            slug: slugify(c.name),
          }));
          const allList = [{ id: "all", name: "All", slug: "all" }, ...list];
          setCategories(allList);

          if (slug) {
            const s = slugify(slug);
            const match = allList.find((c) => c.slug === s);
            setActive(match ? match.slug : "all");
          } else {
            setActive("all");
          }
        } else {
          setCatErr("No categories");
          Swal.fire({
            icon: "warning",
            title: "Category not found",
            text: "The system did not find any category entries. Please try again later.",
            confirmButtonColor: "#3085d6",
          });
        }
      } catch (e) {
        setCatErr(e.message || "Fetch categories failed");
        Swal.fire({
          icon: "error",
          title: "Category loading failed",
          text: e.message || "An error occurred during the connection.",
          confirmButtonColor: "#d33",
        });
      } finally {
        setLoadingCats(false);
      }
    })();
  }, [slug]);

  // ✅ ฟังก์ชันเลือกหมวด + อัปเดต URL
  const handleSelectCategory = (cat) => {
    setActive(cat.slug);
    setSidebarOpen(false);
    if (cat.slug === "all") {
      navigate("/categories");                 // /categories
    } else {
      navigate(`/categories/${cat.slug}`);     // /categories/<slug>
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // เรียกสินค้า
  const categoryParam = active === "all" ? undefined : active;
  const { items, loading: loadingProducts, error: prodErr } = useProduct({
    category: categoryParam,
    search: search || undefined,
  });

  // sort ฝั่ง client
  const sortedItems = useMemo(() => {
    if (!items) return [];
    if (sort === "price-asc")  return [...items].sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    if (sort === "price-desc") return [...items].sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    return items;
  }, [items, sort]);

  const chips = loadingCats ? new Array(6).fill(null) : categories;

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

    let productTitle = "Products";
    if (slug && search) productTitle = `Products (หมวด: ${slug}, ค้นหา: ${search})`;
    else if (slug)      productTitle = `Products (หมวด: ${slug})`;
    else if (search)    productTitle = `Products (ค้นหา: ${search})`;

  return (
    <div className="bg-gray-50 min-h-screen w-full">
      <Navbar />

      {/* Mobile top bar */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white shadow">
        <button aria-label="Open categories" onClick={() => setSidebarOpen(true)}>
          <Menu size={22} />
        </button>
        <p className="font-semibold text-gray-700">Categories</p>
        <div className="w-6" />
      </div>

      {/* Overlay */}
      <div
        onClick={() => setSidebarOpen(false)}
        className={`fixed inset-0 z-[100] bg-black/40 transition-opacity duration-300 ease-out 
          ${sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      />

      {/* Sidebar (mobile) */}
      <aside
        className={`fixed top-0 left-0 z-[101] h-dvh w-72 max-w-[85vw] bg-white shadow-xl
          transition-[transform,opacity] duration-300 ease-out transform-gpu will-change-transform
          ${sidebarOpen ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"}`}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h2 className="text-lg font-semibold">Categories</h2>
          <button aria-label="Close" onClick={() => setSidebarOpen(false)}>
            <X size={22} />
          </button>
        </div>
        <div className="p-4 space-y-2">
          {loadingCats
            ? new Array(6).fill(0).map((_, i) => (
                <div key={i} className="h-9 rounded-lg bg-gray-100 animate-pulse" />
              ))
            : chips.map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleSelectCategory(c)}    // ⬅️ ใช้ฟังก์ชันนี้
                  className={`w-full text-left px-3 py-2 rounded-lg border transition ${
                    String(active) === String(c.slug)
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-700 hover:bg-gray-50 border-gray-200"
                  }`}
                >
                  {c.name}
                </button>
              ))}
          {catErr && <div className="mt-2 text-sm text-red-600">Error: {catErr}</div>}
        </div>
      </aside>

      {/* Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="lg:flex lg:gap-6">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block lg:w-64 shrink-0">
            <div className="sticky top-20 space-y-3">
              <h3 className="px-2 text-sm font-semibold text-gray-600">Categories</h3>
              <div className="flex flex-wrap gap-2">
                {loadingCats
                  ? new Array(8).fill(0).map((_, i) => (
                      <div key={i} className="h-9 w-20 rounded-full bg-gray-100 animate-pulse" />
                    ))
                  : chips.map((c) => (
                      <button
                        key={c.slug}                                // <-- use slug as key for consistency
                        onClick={() => handleSelectCategory(c)}
                        className={`px-3 py-2 rounded-full border text-sm transition ${
                          // <-- compare active to slug (was comparing to id) so UI & filtering stay in sync
                          String(active) === String(c.slug)
                            ? "bg-gray-900 text-white border-gray-900"
                            : "bg-white text-gray-700 hover:bg-gray-50 border-gray-200"
                        }`}
                      >
                        {c.name}
                      </button>
                    ))}
              </div>
            </div>
          </aside>

          {/* Products */}
          <section className="flex-1">
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold">{productTitle}</h2>
                <span className="text-sm text-gray-500">
                  ({loadingProducts ? "…" : sortedItems.length})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <label htmlFor="sort" className="text-sm text-gray-500">Sort</label>
                <select
                  id="sort"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="rounded-md border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:outline-none"
                >
                  <option value="recommended">Recommended</option>
                  <option value="price-asc">Price (Low → High)</option>
                  <option value="price-desc">Price (High → Low)</option>
                </select>
              </div>
            </div>

            {/* Grid */}
            {loadingProducts ? (
              <div className="grid gap-4 mt-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
                {new Array(8).fill(0).map((_, i) => (
                  <div key={i} className="h-60 rounded-2xl bg-gray-100 animate-pulse" />
                ))}
              </div>
            ) : prodErr ? (
              <div className="mt-6 rounded-md bg-red-50 text-red-600 px-3 py-2 text-sm">
                Error: {prodErr}
              </div>
            ) : (
              <div className="grid gap-4 mt-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
                {sortedItems.map((p) => (
                  <article
                    key={p.id}
                    className="group rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition overflow-hidden"
                  >
                    <div className="aspect-[4/3] bg-gray-50 overflow-hidden">
                      <img
                        src={p.image_url || "https://via.placeholder.com/400x300.png?text=No+Image"}
                        alt={p.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/400x300.png?text=No+Image")}
                      />
                    </div>
                    <div className="p-3">
                      <h4 className="text-sm font-medium text-gray-900 line-clamp-2 min-h-[40px]">
                        {p.name}
                      </h4>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-indigo-600 font-semibold">
                          ฿{Number(p.price ?? 0).toFixed(2)}
                        </span>
                        <button
                          className="rounded-lg bg-gray-900 text-white px-3 py-2 text-xs hover:bg-black"
                          onClick={() => onAddToCart(p, 1)}
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {!loadingProducts && !prodErr && sortedItems.length === 0 && (
              <div className="py-16 text-center text-gray-500">No products found</div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
