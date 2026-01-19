import React from "react";
import DataTable from "../ui/DataTable";
import api from "../../utils/api";
const ProductManagement = ({
  products,
  loading,
  error,
  navigate,
  handleProductStatus
}) => {
  const columns = [
    { header: "Image", accessor: "image", isImage: true },
    { header: "Name", accessor: "name" },
    { header: "Myanmar Name", accessor: "name_mm" },
    { header: "Category", accessor: "category" },
    { header: "Price", accessor: "price", isCurrency: true },
    { header: "Stock", accessor: "stock" },
    { header: "Min Order", accessor: "min_order" },
    { header: "Status", accessor: "status" },
    { header: "Created At", accessor: "created_at" },
    { header: "Actions", accessor: "actions" }
  ];

  const handleDelete = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await api.delete(`/products/${productId}`);
        // You might want to add a callback to refresh the product list
        alert("Product deleted successfully");
      } catch (error) {
        alert("Failed to delete product");
      }
    }
  };

  const productData = products.map((product) => ({
    ...product,
    image: product.images?.[0]?.url || "/placeholder-product.jpg",
    category: product.category?.name || "Uncategorized",
    price: product.price || 0,
    stock: product.quantity || 0,
    min_order: product.min_order || 1,
    status: product.is_active ? "Active" : "Inactive",
    created_at: new Date(product.created_at).toLocaleDateString(),
    actions: (
      <div className="flex space-x-2">
        <button
          className="text-indigo-600 hover:text-indigo-900"
          onClick={() => navigate(`/products/${product.id}/edit`)}
        >
          Edit
        </button>
        <select
          value={product.is_active ? "active" : "inactive"}
          onChange={(e) =>
            handleProductStatus(product.id, e.target.value === "active")
          }
          className="text-sm border rounded p-1"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <button
          className="text-red-600 hover:text-red-900"
          onClick={() => handleDelete(product.id)}
        >
          Delete
        </button>
      </div>
    )
  }));

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            Product Management
          </h3>
          <p className="mt-1 text-sm text-gray-500">Manage all products</p>
        </div>
        <div className="flex space-x-3">
          <button
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            onClick={() => navigate("/products/create")}
          >
            Add New Product
          </button>
        </div>
      </div>

      {loading && <div className="p-8 flex justify-center">Loading...</div>}
      {error && <div className="p-4 text-red-500">Error loading products</div>}

      {!loading && !error && <DataTable columns={columns} data={productData} />}
    </div>
  );
};

export default ProductManagement;