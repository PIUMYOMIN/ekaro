import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";

const CategoryBrowser = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await api.get("/categories");
        const categoriesData = response.data.data || response.data;
        setCategories(categoriesData);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
        setError("Failed to load categories. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Function to get all subcategory names from a category tree
  const getAllSubcategoryNames = category => {
    let subcategories = [];

    if (category.children && category.children.length > 0) {
      category.children.forEach(child => {
        subcategories.push(child.name);
        // Recursively get subcategories of subcategories
        subcategories = subcategories.concat(getAllSubcategoryNames(child));
      });
    }

    return subcategories;
  };

  // Function to count total products in a category (including all subcategories)
  const countTotalProducts = category => {
    let count = category.products_count || 0;

    if (category.children && category.children.length > 0) {
      category.children.forEach(child => {
        count += countTotalProducts(child);
      });
    }

    return count;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Browse Categories</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) =>
            <div
              key={index}
              className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse"
            >
              <div className="h-48 bg-gray-300" />
              <div className="p-6">
                <div className="h-6 bg-gray-300 rounded mb-2" />
                <div className="h-4 bg-gray-300 rounded mb-4 w-1/2" />
                <div className="flex flex-wrap gap-2">
                  {[...Array(4)].map((_, i) =>
                    <div key={i} className="h-6 bg-gray-300 rounded w-16" />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Browse Categories</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Browse Categories</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map(category => {
          const totalProducts = countTotalProducts(category);
          const subcategoryNames = getAllSubcategoryNames(category);

          return (
            <Link
              key={category.id}
              to={`/products?category=${category.id}`}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="h-48 bg-gray-200 flex items-center justify-center">
                {category.image
                  ? <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover"
                    />
                  : <span className="text-gray-500 text-lg">
                      {category.name}
                    </span>}
              </div>
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-2">
                  {category.name}
                </h2>
                <p className="text-gray-600 mb-4">
                  {totalProducts} products available
                </p>

                <div className="flex flex-wrap gap-2">
                  {subcategoryNames.slice(0, 4).map((subcat, index) =>
                    <span
                      key={index}
                      className="bg-gray-100 text-gray-800 text-sm px-3 py-1 rounded-full"
                    >
                      {subcat}
                    </span>
                  )}
                  {subcategoryNames.length > 4 &&
                    <span className="bg-gray-100 text-gray-800 text-sm px-3 py-1 rounded-full">
                      +{subcategoryNames.length - 4} more
                    </span>}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryBrowser;
