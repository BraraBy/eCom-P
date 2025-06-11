import { useEffect, useState } from "react";

const Category = () => {

    const [categories, setCategories] = useState([]);

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
    <div className="flex justify-center gap-4 py-6">
      {categories.map((category, index) => (
        <div
          key={index}
          className={`w-20 h-20 ${category.color} rounded-full flex items-center justify-center text-sm font-medium text-gray-700 shadow`}
        >
          {category.name}
        </div>
      ))}
    </div>
  );
};

export default Category;
