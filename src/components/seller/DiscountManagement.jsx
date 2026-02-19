import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CalendarIcon,
  TagIcon,
  CurrencyDollarIcon,
  TicketIcon
} from "@heroicons/react/24/solid";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext"; // ✅ import auth

const DiscountManagement = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // ✅ Compute a set of category IDs that actually have products from this seller
  const sellerCategoryIds = useMemo(() => {
    const ids = new Set();
    products.forEach(product => {
      if (product.category_id) ids.add(product.category_id);
    });
    return ids;
  }, [products]);

  // ✅ Filter categories to only those that appear in seller's products
  const relevantCategories = useMemo(() => {
    return categories.filter(cat => sellerCategoryIds.has(cat.id));
  }, [categories, sellerCategoryIds]);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    type: "",
    value: "",
    min_order: "",
    max_uses_total: "",
    max_uses_per_customer: "",
    starts_at: "",
    expires_at: "",
    applicable_to: isAdmin ? "all_products" : "specific_products", // default for seller
    applicable_product_ids: [],
    applicable_category_ids: [],
    applicable_seller_ids: [],
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
      const response = await api.get("/seller/discounts");
      if (response.data.success) {
        const discountsArray = response.data.data?.data || [];
        setDiscounts(discountsArray);
      }
    } catch (err) {
      setError("Failed to fetch discounts");
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await api.get("/seller/products/my-products");
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

    if (!formData.type) {
      setError("Please select a discount type");
      return;
    }

    if (formData.type !== "free_shipping" && !formData.value) {
      setError("Discount value is required");
      return;
    }

    try {
      const submitData = {
        name: formData.name,
        code: formData.code || null,
        type: formData.type,
        value: formData.type === "free_shipping" ? null : formData.value,
        min_order: formData.min_order || null,
        max_uses_total: formData.max_uses_total || null,
        max_uses_per_customer: formData.max_uses_per_customer || null,
        starts_at: formData.starts_at ? formData.starts_at + " 00:00:00" : null,
        expires_at: formData.expires_at ? formData.expires_at + " 23:59:59" : null,
        applicable_to: formData.applicable_to,
        applicable_product_ids: formData.applicable_product_ids,
        applicable_category_ids: formData.applicable_category_ids,
        applicable_seller_ids: formData.applicable_seller_ids,
        is_one_time_use: formData.is_one_time_use,
        is_active: formData.is_active
      };

      const url = editingDiscount
        ? `/seller/discounts/${editingDiscount.id}`
        : "/seller/discounts";
      const method = editingDiscount ? "put" : "post";

      const response = await api[method](url, submitData);

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
      type: "",
      value: "",
      min_order: "",
      max_uses_total: "",
      max_uses_per_customer: "",
      starts_at: "",
      expires_at: "",
      applicable_to: isAdmin ? "all_products" : "specific_products",
      applicable_product_ids: [],
      applicable_category_ids: [],
      applicable_seller_ids: [],
      is_one_time_use: false,
      is_active: true
    });
    setEditingDiscount(null);
  };

  const editDiscount = (discount) => {
    setEditingDiscount(discount);
    const startsDate = discount.starts_at ? discount.starts_at.split(" ")[0] : "";
    const expiresDate = discount.expires_at ? discount.expires_at.split(" ")[0] : "";

    setFormData({
      name: discount.name,
      code: discount.code || "",
      type: discount.type,
      value: discount.value || "",
      min_order: discount.min_order || "",
      max_uses_total: discount.max_uses_total || "",
      max_uses_per_customer: discount.max_uses_per_customer || "",
      starts_at: startsDate,
      expires_at: expiresDate,
      applicable_to: discount.applicable_to,
      applicable_product_ids: discount.applicable_product_ids || [],
      applicable_category_ids: discount.applicable_category_ids || [],
      applicable_seller_ids: discount.applicable_seller_ids || [],
      is_one_time_use: discount.is_one_time_use || false,
      is_active: discount.is_active
    });
    setShowForm(true);
  };

  const deleteDiscount = async (id) => {
    if (window.confirm("Are you sure you want to delete this discount?")) {
      try {
        await api.delete(`/seller/discounts/${id}`);
        await fetchDiscounts();
      } catch (err) {
        setError("Failed to delete discount");
      }
    }
  };

  const toggleStatus = async (discount) => {
    try {
      await api.put(`/seller/discounts/${discount.id}/toggle-status`);
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
          <h2 className="text-2xl font-bold text-gray-900">{t('seller.discount.title')}</h2>
          <p className="text-gray-600">{t('seller.discount.subtitle')}</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
          className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span>{showForm ? t('common.cancel') : t('seller.discount.create')}</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {t('common.error')}: {error}
        </div>
      )}

      {/* Discount Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow border p-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingDiscount ? t('seller.discount.edit') : t('seller.discount.createNew')}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('seller.discount.name')} *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder={t('seller.discount.namePlaceholder')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('seller.discount.code')}
                </label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder={t('seller.discount.codePlaceholder')}
                />
                <p className="text-sm text-gray-500 mt-1">
                  {t('seller.discount.codeHint')}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('seller.discount.type')} *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="" disabled>{t('seller.discount.selectType')}</option>
                  <option value="percentage">{t('seller.discount.percentage')}</option>
                  <option value="fixed">{t('seller.discount.fixed')}</option>
                  <option value="free_shipping">{t('seller.discount.freeShipping')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {formData.type === "percentage"
                    ? t('seller.discount.percentageValue')
                    : formData.type === "fixed"
                    ? t('seller.discount.fixedAmount')
                    : t('seller.discount.value')}
                </label>
                <input
                  type="number"
                  name="value"
                  value={formData.value}
                  onChange={handleChange}
                  required={formData.type && formData.type !== "free_shipping"}
                  disabled={!formData.type || formData.type === "free_shipping"}
                  min="0"
                  step="0.01"
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder={
                    formData.type === "percentage"
                      ? t('seller.discount.percentagePlaceholder')
                      : formData.type === "fixed"
                      ? t('seller.discount.fixedPlaceholder')
                      : t('seller.discount.notRequired')
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('seller.discount.minOrder')}
                </label>
                <input
                  type="number"
                  name="min_order"
                  value={formData.min_order}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder={t('seller.discount.minOrderPlaceholder')}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('seller.discount.startsAt')} *
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
                  {t('seller.discount.expiresAt')} *
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
                {t('seller.discount.applicableTo')} *
              </label>
              <select
                name="applicable_to"
                value={formData.applicable_to}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
              >
                {isAdmin ? (
                  // Admin sees all options
                  <>
                    <option value="all_products">{t('seller.discount.allProducts')}</option>
                    <option value="specific_products">{t('seller.discount.specificProducts')}</option>
                    <option value="specific_categories">{t('seller.discount.specificCategories')}</option>
                    <option value="specific_sellers">{t('seller.discount.specificSellers')}</option>
                  </>
                ) : (
                  // Seller sees only their own options
                  <>
                    <option value="specific_products">{t('seller.discount.specificProducts')}</option>
                    <option value="specific_categories">{t('seller.discount.specificCategories')}</option>
                  </>
                )}
              </select>
            </div>

            {/* Specific Products Selection */}
            {formData.applicable_to === "specific_products" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('seller.discount.selectProducts')}
                </label>
                <div className="max-h-60 overflow-y-auto border rounded-lg p-3">
                  {products.length === 0 ? (
                    <p className="text-gray-500 text-sm">{t('seller.discount.noProducts')}</p>
                  ) : (
                    products.map((product) => (
                      <div key={product.id} className="flex items-center mb-2">
                        <input
                          type="checkbox"
                          id={`product-${product.id}`}
                          checked={formData.applicable_product_ids.includes(product.id)}
                          onChange={() => handleProductSelect(product.id)}
                          className="h-4 w-4 text-green-600"
                        />
                        <label htmlFor={`product-${product.id}`} className="ml-2 text-sm">
                          {product.name_en} - {product.price} MMK
                        </label>
                      </div>
                    ))
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {t('seller.discount.selected')}: {formData.applicable_product_ids.length} {t('seller.discount.products')}
                </p>
              </div>
            )}

            {/* Specific Categories Selection */}
            {formData.applicable_to === "specific_categories" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('seller.discount.selectCategories')}
                </label>
                <div className="max-h-60 overflow-y-auto border rounded-lg p-3">
                  {relevantCategories.length === 0 ? (
                    <p className="text-gray-500 text-sm">
                      {t('seller.discount.noCategories')}
                    </p>
                  ) : (
                    relevantCategories.map((category) => (
                      <div key={category.id} className="flex items-center mb-2">
                        <input
                          type="checkbox"
                          id={`category-${category.id}`}
                          checked={formData.applicable_category_ids.includes(category.id)}
                          onChange={() => handleCategorySelect(category.id)}
                          className="h-4 w-4 text-green-600"
                        />
                        <label htmlFor={`category-${category.id}`} className="ml-2 text-sm">
                          {category.name_en}
                        </label>
                      </div>
                    ))
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {t('seller.discount.selected')}: {formData.applicable_category_ids.length} {t('seller.discount.categories')}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('seller.discount.maxTotalUses')}
                </label>
                <input
                  type="number"
                  name="max_uses_total"
                  value={formData.max_uses_total}
                  onChange={handleChange}
                  min="1"
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder={t('seller.discount.leaveEmpty')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('seller.discount.maxPerCustomer')}
                </label>
                <input
                  type="number"
                  name="max_uses_per_customer"
                  value={formData.max_uses_per_customer}
                  onChange={handleChange}
                  min="1"
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder={t('seller.discount.leaveEmpty')}
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
                {t('seller.discount.oneTimeUse')}
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
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? t('seller.discount.creating') : editingDiscount ? t('seller.discount.update') : t('seller.discount.create')}
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
                  {t('seller.discount.discount')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {t('seller.discount.type')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {t('seller.discount.applicable')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {t('seller.discount.validity')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {t('seller.discount.status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {t('common.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {discounts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    {t('seller.discount.no_discounts')}
                  </td>
                </tr>
              ) : (
                discounts.map((discount) => (
                  <tr key={discount.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{discount.name}</div>
                        {discount.code && (
                          <div className="text-sm text-gray-500">{t('seller.discount.code')}: {discount.code}</div>
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
                            {discount.type === "percentage"
                              ? `${discount.value}%`
                              : discount.type === "fixed"
                              ? `${discount.value} MMK`
                              : "Free Shipping"}
                          </div>
                          {discount.min_order && (
                            <div className="text-sm text-gray-500">
                              {t('seller.discount.min')}: {discount.min_order} MMK
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">{getApplicableText(discount)}</div>
                      {discount.max_uses_total && (
                        <div className="text-xs text-gray-500">
                          {t('seller.discount.used')}: {discount.used_count || 0}/{discount.max_uses_total}
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
                        {discount.is_active ? t('seller.discount.active') : t('seller.discount.inactive')}
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