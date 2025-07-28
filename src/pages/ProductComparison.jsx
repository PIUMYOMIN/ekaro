import React, { useState } from "react";
import { Link } from "react-router-dom";

const ProductComparison = () => {
  const [comparedProducts] = useState([
    {
      id: 1,
      name: "Premium Rice",
      price: "12,000 MMK/bag",
      moq: "50 bags",
      origin: "Ayeyarwady",
      supplier: "Golden Grains Co.",
      rating: 4.5,
      delivery: "3-5 days",
      features: ["Long grain", "Non-sticky", "High quality", "50kg bags"]
    },
    {
      id: 2,
      name: "Standard Rice",
      price: "9,500 MMK/bag",
      moq: "100 bags",
      origin: "Bago",
      supplier: "Rice Distributors Ltd.",
      rating: 3.8,
      delivery: "2-4 days",
      features: ["Medium grain", "Slightly sticky", "Good quality", "50kg bags"]
    },
    {
      id: 3,
      name: "Organic Rice",
      price: "18,000 MMK/bag",
      moq: "30 bags",
      origin: "Shan State",
      supplier: "Organic Farms Myanmar",
      rating: 4.7,
      delivery: "5-7 days",
      features: [
        "Long grain",
        "Certified organic",
        "Premium quality",
        "25kg bags"
      ]
    }
  ]);

  const [selectedFeatures] = useState([
    "Price",
    "Minimum Order Quantity",
    "Origin",
    "Supplier",
    "Rating",
    "Delivery Time",
    "Grain Type",
    "Quality",
    "Packaging"
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Product Comparison</h1>

      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="p-4 text-left">Features</th>
                {comparedProducts.map(product =>
                  <th key={product.id} className="p-4 text-left">
                    <Link
                      to={`/products/${product.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {product.name}
                    </Link>
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {selectedFeatures.map((feature, index) =>
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium">
                    {feature}
                  </td>
                  {comparedProducts.map(product =>
                    <td key={`${product.id}-${index}`} className="p-4">
                      {feature === "Price" && product.price}
                      {feature === "Minimum Order Quantity" && product.moq}
                      {feature === "Origin" && product.origin}
                      {feature === "Supplier" && product.supplier}
                      {feature === "Rating" &&
                        <div className="flex items-center">
                          <span className="mr-1">
                            {product.rating}
                          </span>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map(star =>
                              <svg
                                key={star}
                                className={`h-4 w-4 ${star <=
                                Math.floor(product.rating)
                                  ? "text-yellow-400 fill-current"
                                  : "text-gray-300"}`}
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            )}
                          </div>
                        </div>}
                      {feature === "Delivery Time" && product.delivery}
                      {feature === "Grain Type" && product.features[0]}
                      {feature === "Quality" && product.features[2]}
                      {feature === "Packaging" && product.features[3]}
                    </td>
                  )}
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <button className="bg-gray-200 text-gray-800 px-6 py-2 rounded hover:bg-gray-300">
          Add Another Product
        </button>
        <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
          Add Selected to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductComparison;
