import React from "react";
const AnalyticsManagement = ({ products }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-6">
        Sales Analytics
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-50 p-6 rounded-xl">
          <h4 className="text-md font-medium text-gray-700 mb-4">
            Revenue Overview
          </h4>
          <div className="bg-white p-4 rounded-lg h-64 flex items-center justify-center">
            <div className="text-gray-500">Revenue chart visualization</div>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-xl">
          <h4 className="text-md font-medium text-gray-700 mb-4">
            Top Selling Products
          </h4>
          <div className="space-y-4">
            {products.slice(0, 5).map((product, index) => (
              <div key={product.id} className="flex items-center">
                <div className="text-gray-500 font-medium mr-4">
                  {index + 1}
                </div>
                <div className="flex-shrink-0 h-10 w-10">
                  <img
                    className="h-10 w-10 rounded-md object-cover"
                    src={
                      product.images?.[0]?.url ||
                      product.image ||
                      "/placeholder-product.jpg"
                    }
                    alt={product.name}
                  />
                </div>
                <div className="ml-3">
                  <div className="text-sm font-medium text-gray-900">
                    {product.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    Sold: {product.sold_count || 0}
                  </div>
                </div>
                <div className="ml-auto text-sm font-medium">
                  {product.price.toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD",
                    minimumFractionDigits: 0
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsManagement;