import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4200";

// ไอคอนพื้นฐานตามชื่อหมวด (ปรับเพิ่มได้)
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
    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4 py-6 max-w-7xl mx-auto">
      {categories.map((c) => {
        const name = c.name.toLowerCase() || "Category";
        const slug = slugify(name);
        const icon = ICON_MAP[name] || "bx bx-category";
        const hasImage = Boolean(c.image_url);
        const ringColor = "ring-gray-200";
        const hoverRing = "hover:ring-gray-300";
        const base =
          "group cursor-pointer select-none rounded-2xl bg-white shadow-sm hover:shadow-md transition transform hover:-translate-y-0.5";

        return (
          <button
            key={c.category_id ?? slug}
            onClick={() => navigate(`/categories/${slug}`)}
            className={`${base} p-4 text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-600`}
            aria-label={`Go to ${name}`}
          >
            <div
              className={`mx-auto mb-2 grid place-items-center w-20 h-20 rounded-full ring-1 ${ringColor} ${hoverRing} bg-gray-50 overflow-hidden`}
            >
              {hasImage ? (
                <img
                  src={c.image_url}
                  alt={name}
                  className="w-full h-full object-cover group-hover:scale-105 transition"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
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
  );
}
