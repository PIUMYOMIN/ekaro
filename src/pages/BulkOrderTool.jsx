import React, { useState } from "react";

const BulkOrderTool = () => {
  const [products, setProducts] = useState([
    {
      id: 1,
      name: "Premium Rice",
      quantity: "",
      price: "12,000 MMK/bag",
      moq: "50 bags"
    },
    {
      id: 2,
      name: "Construction Cement",
      quantity: "",
      price: "8,500 MMK/bag",
      moq: "100 bags"
    },
    {
      id: 3,
      name: "Steel Bars",
      quantity: "",
      price: "1,200,000 MMK/ton",
      moq: "5 tons"
    }
  ]);

  const [suppliers, setSuppliers] = useState([
    { id: 1, name: "Golden Grains Co.", location: "Yangon", rating: 4.5 },
    {
      id: 2,
      name: "Building Materials Ltd.",
      location: "Mandalay",
      rating: 4.2
    },
    { id: 3, name: "Steel & Metal Corp.", location: "Naypyidaw", rating: 4.0 }
  ]);

  const [selectedSupplier, setSelectedSupplier] = useState(null);

  const handleQuantityChange = (id, value) => {
    setProducts(prev =>
      prev.map(
        product =>
          product.id === id ? { ...product, quantity: value } : product
      )
    );
  };

  const calculateTotal = () => {
    return products.reduce((total, product) => {
      if (product.quantity && product.price) {
        const price = parseInt(product.price.replace(/[^0-9]/g, ""));
        return total + price * parseInt(product.quantity);
      }
      return total;
    }, 0);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Bulk Order Tool</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Select Products</h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-4 text-left">Product</th>
                <th className="p-4 text-left">Price</th>
                <th className="p-4 text-left">MOQ</th>
                <th className="p-4 text-left">Quantity</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product =>
                <tr key={product.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    {product.name}
                  </td>
                  <td className="p-4">
                    {product.price}
                  </td>
                  <td className="p-4">
                    {product.moq}
                  </td>
                  <td className="p-4">
                    <input
                      type="number"
                      value={product.quantity}
                      onChange={e =>
                        handleQuantityChange(product.id, e.target.value)}
                      className="w-24 border rounded p-2"
                      min={product.moq.match(/\d+/)[0]}
                      placeholder="0"
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex justify-between items-center">
          <button className="bg-gray-200 text-gray-800 px-6 py-2 rounded hover:bg-gray-300">
            Add More Products
          </button>
          <div className="text-lg font-medium">
            Estimated Total: {calculateTotal().toLocaleString()} MMK
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Select Supplier</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {suppliers.map(supplier =>
            <div
              key={supplier.id}
              onClick={() => setSelectedSupplier(supplier.id)}
              className={`border rounded-lg p-4 cursor-pointer hover:border-blue-500 ${selectedSupplier ===
              supplier.id
                ? "border-blue-500 bg-blue-50"
                : ""}`}
            >
              <h3 className="font-medium mb-1">
                {supplier.name}
              </h3>
              <p className="text-gray-600 text-sm mb-2">
                {supplier.location}
              </p>
              <div className="flex items-center">
                <div className="flex text-yellow-400 mr-2">
                  {[1, 2, 3, 4, 5].map(star =>
                    <svg
                      key={star}
                      className={`h-4 w-4 ${star <= Math.floor(supplier.rating)
                        ? "fill-current"
                        : ""}`}
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  )}
                </div>
                <span className="text-gray-600 text-sm">
                  {supplier.rating}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

        <div className="mb-6">
          <h3 className="font-medium mb-2">Selected Products</h3>
          <ul className="space-y-2">
            {products.filter(p => p.quantity).map(product =>
              <li key={product.id} className="flex justify-between">
                <span>
                  {product.name} ({product.quantity})
                </span>
                <span>
                  {(parseInt(product.price.replace(/[^0-9]/g, "")) *
                    parseInt(product.quantity)).toLocaleString()}{" "}
                  MMK
                </span>
              </li>
            )}
          </ul>
        </div>

        {selectedSupplier &&
          <div className="mb-6">
            <h3 className="font-medium mb-2">Selected Supplier</h3>
            <p>
              {suppliers.find(s => s.id === selectedSupplier).name}
            </p>
          </div>}

        <div className="mb-6">
          <h3 className="font-medium mb-2">Total Amount</h3>
          <p className="text-2xl font-bold">
            {calculateTotal().toLocaleString()} MMK
          </p>
        </div>

        <div className="flex justify-end">
          <button
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700"
            disabled={!selectedSupplier || calculateTotal() === 0}
          >
            Place Bulk Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkOrderTool;
