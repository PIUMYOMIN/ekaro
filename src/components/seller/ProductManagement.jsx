// src/components/seller/ProductManagement.jsx
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowPathIcon,
  CubeIcon
} from "@heroicons/react/24/solid";
import api from "../../utils/api";

const ProductManagement = ({ onAddProduct, onEditProduct: propOnEditProduct }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

  // Modal states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [statusTarget, setStatusTarget] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError("");
    try {
      // Option 1: Use the existing route
      const response = await api.get("/products");

      console.log("Products response:", response.data);

      if (response.data.success) {
        setProducts(response.data.data || []);
      } else {
        setError(response.data.message || "Failed to fetch products");
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch products";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (product) => {
    setSelectedProduct(product);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;
    try {
      await api.delete(`/products/${selectedProduct.id}`);
      await fetchProducts(); // Refresh the list
      setDeleteModalOpen(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error("Delete error:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to delete product";
      alert(errorMessage);
    }
  };

  const confirmStatusToggle = (product) => {
    setSelectedProduct(product);
    setStatusTarget(!product.is_active);
    setStatusModalOpen(true);
  };

  const handleProductStatus = async () => {
    if (!selectedProduct) return;
    try {
      await api.put(`/products/${selectedProduct.id}`, {
        is_active: statusTarget
      });
      await fetchProducts(); // Refresh the list
      setStatusModalOpen(false);
      setSelectedProduct(null);
      setStatusTarget(null);
    } catch (error) {
      console.error("Status update error:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to update product status";
      alert(errorMessage);
    }
  };

  // Complete the onEditProduct function
  const handleEditProduct = (product) => {
    console.log("Editing product:", product);
    
    // If a prop function was provided, use it
    if (typeof propOnEditProduct === 'function') {
      propOnEditProduct(product);
    } else {
      // Otherwise, navigate to the edit page
      // Choose the appropriate route based on your needs:
      
      // Option 1: Seller-specific route (preferred for seller dashboard)
      navigate(`/seller/products/${product.id}/edit`);
      
      // Option 2: General edit route
      // navigate(`/products/${product.id}/edit`);
      
      // Option 3: If you have access to the product creation page
      // You could pass the product data to that page
      // navigate(`/seller/products/create`, { state: { editProduct: product } });
    }
  };

  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const getSortedProducts = () => {
    if (!sortConfig.key) return products;

    return [...products].sort((a, b) => {
      // Handle nested properties
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      // Handle category name sorting
      if (sortConfig.key === "category" && a.category && b.category) {
        aValue = a.category.name;
        bValue = b.category.name;
      }

      if (aValue < bValue) {
        return sortConfig.direction === "ascending" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "ascending" ? 1 : -1;
      }
      return 0;
    });
  };

  const sortedProducts = getSortedProducts();

  const getStatusColor = (status) =>
    status ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800";

  const getStatusText = (isActive) => (isActive ? "active" : "inactive");

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(price);

  const getProductImage = (product) => {
    if (product.images && product.images.length > 0) {
      // Handle different image formats
      const firstImage = product.images[0];
      if (typeof firstImage === "string") {
        return firstImage;
      }
      return firstImage.url || firstImage.path || "/placeholder-product.jpg";
    }
    return "/placeholder-product.jpg";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-red-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">{error}</h3>
            <div className="mt-2">
              <button
                onClick={fetchProducts}
                className="text-sm text-red-700 underline hover:text-red-600"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {t("seller.product_management")}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {t("seller.manage_your_products")}
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <button
            onClick={fetchProducts}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowPathIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            {t("seller.product.refresh")}
          </button>
          <button
            onClick={() => navigate("/products/create")}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            {t("seller.product.add_product")}
          </button>
        </div>
      </div>

      {/* Products Count */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              Products Summary
            </h3>
            <p className="text-sm text-gray-500">
              Total: {products.length} products
            </p>
          </div>
          <div className="flex space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {products.filter((p) => p.is_active).length}
              </div>
              <div className="text-sm text-gray-500">Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-400">
                {products.filter((p) => !p.is_active).length}
              </div>
              <div className="text-sm text-gray-500">Inactive</div>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Product
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer"
                  onClick={() => requestSort("category")}
                >
                  <div className="flex items-center">
                    {t("product.category")}
                    {sortConfig.key === "category" &&
                      (sortConfig.direction === "ascending" ? (
                        <ArrowUpIcon className="ml-1 h-3 w-3" />
                      ) : (
                        <ArrowDownIcon className="ml-1 h-3 w-3" />
                      ))}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer"
                  onClick={() => requestSort("price")}
                >
                  <div className="flex items-center">
                    {t("product.price")}
                    {sortConfig.key === "price" &&
                      (sortConfig.direction === "ascending" ? (
                        <ArrowUpIcon className="ml-1 h-3 w-3" />
                      ) : (
                        <ArrowDownIcon className="ml-1 h-3 w-3" />
                      ))}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer"
                  onClick={() => requestSort("quantity")}
                >
                  <div className="flex items-center">
                    {t("product.stock")}
                    {sortConfig.key === "quantity" &&
                      (sortConfig.direction === "ascending" ? (
                        <ArrowUpIcon className="ml-1 h-3 w-3" />
                      ) : (
                        <ArrowDownIcon className="ml-1 h-3 w-3" />
                      ))}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {t("product.status")}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  {t("product.actions")}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedProducts.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-8 text-center text-sm text-gray-500"
                  >
                    <div className="flex flex-col items-center">
                      <CubeIcon className="h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No products found
                      </h3>
                      <p className="text-gray-600 mb-4">
                        You haven't added any products yet.
                      </p>
                      <button
                        onClick={() => navigate("/products/create")}
                        className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700"
                      >
                        Add Your First Product
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                sortedProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <img
                            className="h-10 w-10 rounded-lg object-cover"
                            src={getProductImage(product)}
                            alt={product.name}
                            onError={(e) => {
                              e.target.src = "/placeholder-product.jpg";
                            }}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-500 line-clamp-1">
                            {product.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {product.category?.name || "Uncategorized"}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {formatPrice(product.price)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          product.quantity > 10
                            ? "bg-green-100 text-green-800"
                            : product.quantity > 0
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {product.quantity} in stock
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => confirmStatusToggle(product)}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          product.is_active
                        )}`}
                      >
                        {t(`product.${getStatusText(product.is_active)}`)}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => navigate(`/products/${product.id}`)}
                          className="text-gray-500 hover:text-gray-700"
                          title="View Product"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="text-green-600 hover:text-green-900"
                          title="Edit Product"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => confirmDelete(product)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Product"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t("product.confirm_delete")}
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              {t("product.delete_message", { name: selectedProduct?.name })}
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 text-sm bg-gray-200 rounded-md"
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-md"
              >
                {t("common.delete")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Toggle Modal */}
      {statusModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t("product.confirm_status_change")}
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              {statusTarget
                ? t("product.activate_message", {
                    name: selectedProduct?.name
                  })
                : t("product.deactivate_message", {
                    name: selectedProduct?.name
                  })}
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setStatusModalOpen(false)}
                className="px-4 py-2 text-sm bg-gray-200 rounded-md"
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={handleProductStatus}
                className="px-4 py-2 text-sm bg-green-600 text-white rounded-md"
              >
                {t("common.confirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;