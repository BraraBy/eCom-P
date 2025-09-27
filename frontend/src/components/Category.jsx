import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4200";

const ICON_MAP = {
  snacks: "bx bx-cookie",
  drinks: "bx bx-drink",
  "ice cream": "bx bx-popsicle",
  stationery: "bx bx-pencil",
  fruit: "bx bx-apple",
  households: "bx bx-home-heart",
  kitchen: "bx bx-restaurant",
};

const slugify = (s = "") =>
  s.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

export default function Category() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/category`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data.status === "200" && Array.isArray(data.result)) {
          setCategories(data.result);
        } else {
          setErr("No categories");
        }
      } catch (e) {
        setErr(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-2xl bg-gray-100 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (err || categories.length === 0) {
    return (
      <div className="py-6 text-center text-gray-500">
        {err ? `Error: ${err}` : "No categories to show"}
      </div>
    );
  }

 return (
  <div className="py-3 max-w-7xl mx-auto">
    {/* มือถือ: แนวนอนเลื่อนได้ */}
    <div className="flex md:hidden gap-3 overflow-x-auto no-scrollbar px-2">
      {categories.map((c) => {
        const name = c.name.toLowerCase() || "Category";
        const slug = slugify(name);
        const icon = ICON_MAP[name] || "bx bx-category";
        const hasImage = Boolean(c.image_url);

        return (
          <button
            key={c.category_id ?? slug}
            onClick={() => navigate(`/categories/${slug}`)}
            className="flex-shrink-0 text-center"
          >
            <div className="mx-auto mb-1 grid place-items-center w-14 h-14 rounded-full ring-1 ring-gray-200 hover:ring-gray-300 bg-gray-50 overflow-hidden">
              {hasImage ? (
                <img
                  src={c.image_url}
                  alt={name}
                  className="w-full h-full object-cover"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              ) : (
                <i className={`${icon} text-xl text-gray-600`} />
              )}
            </div>
            <div className="text-xs font-medium text-gray-800 capitalize truncate w-14">
              {name}
            </div>
          </button>
        );
      })}
    </div>

    {/* เดสก์ท็อป: grid แบบเดิม */}
    <div className="hidden md:grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
      {categories.map((c) => {
        const name = c.name.toLowerCase() || "Category";
        const slug = slugify(name);
        const icon = ICON_MAP[name] || "bx bx-category";
        const hasImage = Boolean(c.image_url);

        return (
          <button
            key={c.category_id ?? slug}
            onClick={() => navigate(`/categories/${slug}`)}
            className="group p-4 rounded-2xl bg-white shadow-sm hover:shadow-md transition text-center"
          >
            <div className="mx-auto mb-2 grid place-items-center w-20 h-20 rounded-full ring-1 ring-gray-200 hover:ring-gray-300 bg-gray-50 overflow-hidden">
              {hasImage ? (
                <img
                  src={c.image_url}
                  alt={name}
                  className="w-full h-full object-cover group-hover:scale-105 transition"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              ) : (
                <i className={`${icon} text-3xl text-gray-600`} />
              )}
            </div>
            <div className="text-sm font-medium text-gray-800 capitalize">
              {name}
            </div>
          </button>
        );
      })}
    </div>
  </div>
);
}
