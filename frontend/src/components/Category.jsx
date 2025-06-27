import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ แก้จุดนี้

const Category = () => {
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate(); // ✅ ต้องเรียกใช้ hook นี้

  useEffect(() => {
    fetch("http://localhost:4200/api/category")
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "200" && Array.isArray(data.result)) {
          setCategories(data.result);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch products:", err);
      });
  }, []);

  return (
    <div className="flex flex-wrap justify-center gap-4 py-6">
      {categories.map((category) => (
        <button
          key={category.category_id}
          onClick={() => navigate(`/categories/${category.name}`)}
          className={`w-20 h-20 ${
            category.color || "bg-gray-200"
          } rounded-full flex items-center justify-center text-sm font-medium text-gray-700 shadow hover:scale-105 transition`}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
};

export default Category;
