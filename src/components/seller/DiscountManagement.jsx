import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  CalendarIcon,
  TagIcon,
  CurrencyDollarIcon,
  TicketIcon
} from "@heroicons/react/24/solid";
import api from "../../utils/api";

const DiscountManagement = () => {
  const { t } = useTranslation();
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    type: "percentage",
    value: "",
    min_order_amount: "",
    max_uses: "",
    starts_at: "",
    expires_at: "",
    applicable_to: "all_products",
    applicable_product_ids: [],
    applicable_category_ids: [],
    applicable_seller_ids: [],
    max_uses_per_user: "",
    is_one_time_use: false,
    is_active: true
  });

  useEffect(() => {
    fetchDiscounts();
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchDiscounts = async () => {
    setLoading(true);
    try {
      const response = await api.get("/discounts");
      if (response.data.success) {
        setDiscounts(response.data.data);
      }
    } catch (err) {
      setError("Failed to fetch discounts");
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await api.get("/products");
      if (response.data.success) {
        setProducts(response.data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch products");
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories");
      if (response.data.success) {
        setCategories(response.data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch categories");
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleProductSelect = (productId) => {
    setFormData(prev => {
      const ids = prev.applicable_product_ids;
      const newIds = ids.includes(productId)
        ? ids.filter(id => id !== productId)
        : [...ids, productId];
      return { ...prev, applicable_product_ids: newIds };
    });
  };

  const handleCategorySelect = (categoryId) => {
    setFormData(prev => {
      const ids = prev.applicable_category_ids;
      const newIds = ids.includes(categoryId)
        ? ids.filter(id => id !== categoryId)
        : [...ids, categoryId];
      return { ...prev, applicable_category_ids: newIds };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const url = editingDiscount
        ? `/discounts/${editingDiscount.id}`
        : "/discounts";
      const method = editingDiscount ? "put" : "post";

      const response = await api[method](url, formData);

      if (response.data.success) {
        await fetchDiscounts();
        resetForm();
        setShowForm(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save discount");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      type: "percentage",
      value: "",
      min_order_amount: "",
      max_uses: "",
      starts_at: "",
      expires_at: "",
      applicable_to: "all_products",
      applicable_product_ids: [],
      applicable_category_ids: [],
      applicable_seller_ids: [],
      max_uses_per_user: "",
      is_one_time_use: false,
      is_active: true
    });
    setEditingDiscount(null);
  };

  const editDiscount = (discount) => {
    setEditingDiscount(discount);
    setFormData({
      name: discount.name,
      code: discount.code,
      type: discount.type,
      value: discount.value,
      min_order_amount: discount.min_order_amount || "",
      max_uses: discount.max_uses || "",
      starts_at: discount.starts_at.split(" ")[0],
      expires_at: discount.expires_at.split(" ")[0],
      applicable_to: discount.applicable_to,
      applicable_product_ids: discount.applicable_product_ids || [],
      applicable_category_ids: discount.applicable_category_ids || [],
      applicable_seller_ids: discount.applicable_seller_ids || [],
      max_uses_per_user: discount.max_uses_per_user || "",
      is_one_time_use: discount.is_one_time_use,
      is_active: discount.is_active
    });
    setShowForm(true);
  };

  const deleteDiscount = async (id) => {
    if (window.confirm("Are you sure you want to delete this discount?")) {
      try {
        await api.delete(`/discounts/${id}`);
        await fetchDiscounts();
      } catch (err) {
        setError("Failed to delete discount");
      }
    }
  };

  const toggleStatus = async (discount) => {
    try {
      await api.put(`/discounts/${discount.id}/toggle-status`);
      await fetchDiscounts();
    } catch (err) {
      setError("Failed to update discount status");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getApplicableText = (discount) => {
    switch (discount.applicable_to) {
      case "all_products":
        return "All Products";
      case "specific_products":
        return `${discount.applicable_product_ids?.length || 0} Products`;
      case "specific_categories":
        return `${discount.applicable_category_ids?.length || 0} Categories`;
      case "specific_sellers":
        return `${discount.applicable_seller_ids?.length || 0} Sellers`;
      default:
        return "N/A";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Discount Management</h2>
          <p className="text-gray-600">Create and manage discount coupons for your products</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
          className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span>{showForm ? "Cancel" : "Create Discount"}</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Discount Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow border p-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingDiscount ? "Edit Discount" : "Create New Discount"}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="e.g., Summer Sale 2024"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount Code (Optional)
                </label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="e.g., SUMMER24"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Leave empty to auto-generate
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount Type *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount</option>
                  <option value="free_shipping">Free Shipping</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {formData.type === "percentage" ? "Percentage Value *" : "Fixed Amount *"}
                </label>
                <input
                  type="number"
                  name="value"
                  value={formData.value}
                  onChange={handleChange}
                  required={formData.type !== "free_shipping"}
                  min="0"
                  step="0.01"
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder={formData.type === "percentage" ? "e.g., 20" : "e.g., 5000"}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Order Amount
                </label>
                <input
                  type="number"
                  name="min_order_amount"
                  value={formData.min_order_amount}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="e.g., 10000"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Starts At *
                </label>
                <input
                  type="date"
                  name="starts_at"
                  value={formData.starts_at}
                  onChange={handleChange}
                  required
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expires At *
                </label>
                <input
                  type="date"
                  name="expires_at"
                  value={formData.expires_at}
                  onChange={handleChange}
                  required
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Applicable To *
              </label>
              <select
                name="applicable_to"
                value={formData.applicable_to}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="all_products">All Products</option>
                <option value="specific_products">Specific Products</option>
                <option value="specific_categories">Specific Categories</option>
                <option value="specific_sellers">Specific Sellers</option>
              </select>
            </div>

            {/* Specific Products Selection */}
            {formData.applicable_to === "specific_products" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Products
                </label>
                <div className="max-h-60 overflow-y-auto border rounded-lg p-3">
                  {products.map((product) => (
                    <div key={product.id} className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        id={`product-${product.id}`}
                        checked={formData.applicable_product_ids.includes(product.id)}
                        onChange={() => handleProductSelect(product.id)}
                        className="h-4 w-4 text-green-600"
                      />
                      <label htmlFor={`product-${product.id}`} className="ml-2 text-sm">
                        {product.name} - {product.price} MMK
                      </label>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Selected: {formData.applicable_product_ids.length} products
                </p>
              </div>
            )}

            {/* Specific Categories Selection */}
            {formData.applicable_to === "specific_categories" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Categories
                </label>
                <div className="max-h-60 overflow-y-auto border rounded-lg p-3">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        id={`category-${category.id}`}
                        checked={formData.applicable_category_ids.includes(category.id)}
                        onChange={() => handleCategorySelect(category.id)}
                        className="h-4 w-4 text-green-600"
                      />
                      <label htmlFor={`category-${category.id}`} className="ml-2 text-sm">
                        {category.name}
                      </label>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Selected: {formData.applicable_category_ids.length} categories
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Uses
                </label>
                <input
                  type="number"
                  name="max_uses"
                  value={formData.max_uses}
                  onChange={handleChange}
                  min="1"
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Leave empty for unlimited"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Uses Per User
                </label>
                <input
                  type="number"
                  name="max_uses_per_user"
                  value={formData.max_uses_per_user}
                  onChange={handleChange}
                  min="1"
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Leave empty for unlimited"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="is_one_time_use"
                name="is_one_time_use"
                checked={formData.is_one_time_use}
                onChange={handleChange}
                className="h-4 w-4 text-green-600"
              />
              <label htmlFor="is_one_time_use" className="text-sm">
                One-time use per customer
              </label>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-lg"
              >
                {editingDiscount ? "Update Discount" : "Create Discount"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Discounts List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Discount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-xs font-medium text-gray-500 uppercase">
                  Applicable To
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Validity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {discounts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    No discounts found. Create your first discount!
                  </td>
                </tr>
              ) : (
                discounts.map((discount) => (
                  <tr key={discount.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{discount.name}</div>
                        {discount.code && (
                          <div className="text-sm text-gray-500">Code: {discount.code}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {discount.type === "percentage" && (
                          <TagIcon className="h-5 w-5 text-blue-500 mr-2" />
                        )}
                        {discount.type === "fixed" && (
                          <CurrencyDollarIcon className="h-5 w-5 text-green-500 mr-2" />
                        )}
                        {discount.type === "free_shipping" && (
                          <TicketIcon className="h-5 w-5 text-purple-500 mr-2" />
                        )}
                        <div>
                          <div className="font-medium">
                            {discount.type === "percentage" ? `${discount.value}%` :
                             discount.type === "fixed" ? `${discount.value} MMK` :
                             "Free Shipping"}
                          </div>
                          {discount.min_order_amount && (
                            <div className="text-sm text-gray-500">
                              Min: {discount.min_order_amount} MMK
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">{getApplicableText(discount)}</div>
                      {discount.max_uses && (
                        <div className="text-xs text-gray-500">
                          Used: {discount.used_count}/{discount.max_uses}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-1 text-gray-400" />
                          {formatDate(discount.starts_at)}
                        </div>
                        <div className="flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-1 text-gray-400" />
                          {formatDate(discount.expires_at)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleStatus(discount)}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          discount.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {discount.is_active ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => editDiscount(discount)}
                          className="text-green-600 hover:text-green-900"
                          title="Edit"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => deleteDiscount(discount.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
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
    </div>
  );
};

export default DiscountManagement;