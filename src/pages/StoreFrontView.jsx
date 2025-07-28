import React, { useState } from "react";
import { useParams } from "react-router-dom";
import ProductCard from "../components/ui/ProductCard";
import { StarIcon } from "@heroicons/react/24/solid";

const StorefrontView = () => {
  const { id } = useParams();
  const [store, setStore] = useState({
    id: id,
    name: "Golden Grains Co.",
    description:
      "Premium agricultural products supplier since 2010. Specializing in high-quality rice and grains from Myanmar.",
    rating: 4.5,
    totalProducts: 42,
    totalSales: 1250,
    joinedDate: "2020-05-15",
    categories: ["Rice", "Grains", "Agriculture"],
    products: [
      { id: 1, name: "Premium Rice", price: 12000, moq: 50, stock: 500 },
      { id: 2, name: "Organic Brown Rice", price: 15000, moq: 30, stock: 200 },
      {
        id: 3,
        name: "Fragrant Jasmine Rice",
        price: 18000,
        moq: 40,
        stock: 150
      },
      { id: 4, name: "Sticky Rice", price: 10000, moq: 50, stock: 300 }
    ]
  });

  const [isFollowing, setIsFollowing] = useState(false);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/4 mb-6 md:mb-0">
            <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center mx-auto">
              <span className="text-gray-600 text-xl">GG</span>
            </div>
          </div>

          <div className="md:w-3/4">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold mb-2">
                  {store.name}
                </h1>
                <div className="flex items-center mb-4">
                  <div className="flex text-yellow-400 mr-2">
                    {[1, 2, 3, 4, 5].map(star =>
                      <StarIcon
                        key={star}
                        className={`h-5 w-5 ${star <= Math.floor(store.rating)
                          ? "fill-current"
                          : ""}`}
                      />
                    )}
                  </div>
                  <span className="text-gray-600">
                    {store.rating} ({store.totalSales} sales)
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsFollowing(!isFollowing)}
                className={`px-4 py-2 rounded-lg ${isFollowing
                  ? "bg-gray-200 text-gray-800"
                  : "bg-blue-600 text-white"}`}
              >
                {isFollowing ? "Following" : "Follow Store"}
              </button>
            </div>

            <p className="text-gray-700 mb-4">
              {store.description}
            </p>

            <div className="flex flex-wrap gap-2 mb-4">
              {store.categories.map((category, index) =>
                <span
                  key={index}
                  className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm"
                >
                  {category}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="border p-3 rounded-lg">
                <div className="font-bold text-lg">
                  {store.totalProducts}
                </div>
                <div className="text-gray-600 text-sm">Products</div>
              </div>
              <div className="border p-3 rounded-lg">
                <div className="font-bold text-lg">
                  {store.rating}
                </div>
                <div className="text-gray-600 text-sm">Rating</div>
              </div>
              <div className="border p-3 rounded-lg">
                <div className="font-bold text-lg">
                  {store.totalSales}
                </div>
                <div className="text-gray-600 text-sm">Sales</div>
              </div>
              <div className="border p-3 rounded-lg">
                <div className="font-bold text-lg">2020</div>
                <div className="text-gray-600 text-sm">Since</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6">Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {store.products.map(product =>
            <ProductCard key={product.id} product={product} />
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">Store Reviews</h2>

        <div className="space-y-6">
          {[1, 2, 3].map(review =>
            <div
              key={review}
              className="border-b pb-6 last:border-b-0 last:pb-0"
            >
              <div className="flex items-center mb-3">
                <div className="flex text-yellow-400 mr-3">
                  {[1, 2, 3, 4, 5].map(star =>
                    <StarIcon
                      key={star}
                      className={`h-5 w-5 ${star <= 4 ? "fill-current" : ""}`}
                    />
                  )}
                </div>
                <span className="font-medium">
                  Customer {review}
                </span>
                <span className="ml-auto text-gray-500 text-sm">
                  2023-07-{20 + review}
                </span>
              </div>
              <p className="text-gray-700">
                {review === 1 &&
                  "Excellent quality products and fast delivery. Highly recommended for bulk purchases."}
                {review === 2 &&
                  "Good prices and reliable supplier. The rice quality is consistent."}
                {review === 3 &&
                  "Satisfied with the products but delivery was a bit delayed."}
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <button className="text-blue-600 hover:underline">
            View All Reviews
          </button>
        </div>
      </div>
    </div>
  );
};

export default StorefrontView;
