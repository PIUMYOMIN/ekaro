import React, { useState } from "react";
import { Link } from "react-router-dom";

const CategoryBrowser = () => {
  const [categories] = useState([
    {
      id: 1,
      name: "Agriculture",
      subcategories: ["Rice", "Beans", "Seeds", "Fertilizers"],
      productCount: 1250,
      image: null
    },
    {
      id: 2,
      name: "Building Materials",
      subcategories: ["Cement", "Steel", "Bricks", "Pipes"],
      productCount: 890,
      image: null
    },
    {
      id: 3,
      name: "Textiles",
      subcategories: ["Cotton", "Silk", "Wool", "Synthetic"],
      productCount: 640,
      image: null
    },
    {
      id: 4,
      name: "Electronics",
      subcategories: [
        "Home Appliances",
        "Mobile Devices",
        "Computers",
        "Accessories"
      ],
      productCount: 420,
      image: null
    },
    {
      id: 5,
      name: "Food & Beverage",
      subcategories: ["Processed Foods", "Beverages", "Spices", "Oils"],
      productCount: 780,
      image: null
    },
    {
      id: 6,
      name: "Handicrafts",
      subcategories: ["Lacquerware", "Pottery", "Wood Carvings", "Textiles"],
      productCount: 560,
      image: null
    }
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Browse Categories</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map(category =>
          <Link
            key={category.id}
            to={`/products?category=${category.name}`}
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
                {category.productCount} products available
              </p>

              <div className="flex flex-wrap gap-2">
                {category.subcategories.map((subcat, index) =>
                  <span
                    key={index}
                    className="bg-gray-100 text-gray-800 text-sm px-3 py-1 rounded-full"
                  >
                    {subcat}
                  </span>
                )}
              </div>
            </div>
          </Link>
        )}
      </div>
    </div>
  );
};

export default CategoryBrowser;
