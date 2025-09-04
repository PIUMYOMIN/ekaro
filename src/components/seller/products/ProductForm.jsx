import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import api from "../../../utils/api";
import { useAuth } from "../../../context/AuthContext";
import {
  XMarkIcon,
  PhotoIcon,
  CloudArrowUpIcon
} from "@heroicons/react/24/outline";

const ProductForm = ({ product = null, onSuccess, onCancel }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: product?.name || "",
    name_mm: product?.name_mm || "",
    description: product?.description || "",
    price: product?.price || "",
    quantity: product?.quantity || "",
    category_id: product?.category_id || "",
    specifications: product?.specifications || {},
    min_order: product?.min_order || 1,
    lead_time: product?.lead_time || "",
    is_active: product?.is_active ?? true,
    seller_id:
      product?.seller_id || (user?.roles?.includes("admin") ? "" : user?.id)
  });
  const [categories, setCategories] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingSellers, setLoadingSellers] = useState(false);
  const [error, setError] = useState("");
  const [specInput, setSpecInput] = useState({ key: "", value: "" });
  const [imagePreviews, setImagePreviews] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  const isAdmin = user?.roles?.includes("admin");

  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const response = await api.get("/categories");
        setCategories(response.data.data || []);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      } finally {
        setLoadingCategories(false);
      }
    };

    const fetchSellers = async () => {
      if (!isAdmin) return;

      setLoadingSellers(true);
      try {
        // You might need to create this endpoint or use a different approach
        const response = await api.get("/users?role=seller");
        setSellers(response.data.data || []);
      } catch (err) {
        console.error("Failed to fetch sellers:", err);
        // Fallback to empty array
        setSellers([]);
      } finally {
        setLoadingSellers(false);
      }
    };

    // Load existing product images if editing
    if (product && product.images) {
      const previews = product.images.map((img) => ({
        url: typeof img === "string" ? img : img.url,
        is_primary: img.is_primary || false,
        angle: img.angle || "default",
        isExisting: true // Mark as existing image from server
      }));
      setImagePreviews(previews);
    }

    fetchCategories();
    fetchSellers();
  }, [isAdmin, product]);

  // Clean up object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      // Clean up object URLs to avoid memory leaks
      imagePreviews.forEach((preview) => {
        if (!preview.isExisting && preview.url.startsWith("blob:")) {
          URL.revokeObjectURL(preview.url);
        }
      });
    };
  }, [imagePreviews]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSpecChange = (e) => {
    const { name, value } = e.target;
    setSpecInput((prev) => ({ ...prev, [name]: value }));
  };

  const addSpecification = () => {
    if (specInput.key && specInput.value) {
      setFormData((prev) => ({
        ...prev,
        specifications: {
          ...prev.specifications,
          [specInput.key]: specInput.value
        }
      }));
      setSpecInput({ key: "", value: "" });
    }
  };

  const removeSpecification = (key) => {
    setFormData((prev) => {
      const newSpecs = { ...prev.specifications };
      delete newSpecs[key];
      return { ...prev, specifications: newSpecs };
    });
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Create previews for selected images
    const newPreviews = files.map((file) => ({
      url: URL.createObjectURL(file),
      file: file,
      is_primary: imagePreviews.length === 0, // Set as primary if no images yet
      angle: "default",
      isExisting: false
    }));

    setImagePreviews((prev) => [...prev, ...newPreviews]);
    setImageFiles((prev) => [...prev, ...files]);
    e.target.value = ""; // Reset file input
  };

  const removeImage = (index) => {
    const previewToRemove = imagePreviews[index];

    // Revoke object URL if it's a blob URL
    if (
      !previewToRemove.isExisting &&
      previewToRemove.url.startsWith("blob:")
    ) {
      URL.revokeObjectURL(previewToRemove.url);
    }

    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const setPrimaryImage = (index) => {
    setImagePreviews((prev) =>
      prev.map((img, i) => ({
        ...img,
        is_primary: i === index
      }))
    );
  };

  const uploadImages = async (productId = null) => {
    if (imageFiles.length === 0) return [];

    setUploadingImages(true);
    const uploadedImages = [];

    try {
      for (const file of imageFiles) {
        const formData = new FormData();
        formData.append("image", file);

        // Use the correct endpoint based on whether we're creating or updating
        const endpoint = productId
          ? `/products/${productId}/upload-image`
          : "/products/upload-image";

        const response = await api.post(endpoint, formData, {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        });

        uploadedImages.push(response.data.data);
      }
    } catch (err) {
      console.error("Failed to upload images:", err);
      throw new Error("Failed to upload images");
    } finally {
      setUploadingImages(false);
    }

    return uploadedImages;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Prepare the payload
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity),
        min_order: parseInt(formData.min_order),
        category_id: parseInt(formData.category_id)
      };

      // For sellers, remove seller_id from payload (it will be set automatically)
      if (!isAdmin) {
        delete payload.seller_id;
      }

      let response;
      if (product) {
        // Update existing product
        response = await api.put(`/products/${product.id}`, payload);

        // Upload new images for existing product
        if (imageFiles.length > 0) {
          const newUploadedImages = await uploadImages(product.id);

          // Get current images from previews (excluding new ones that were just uploaded)
          const existingImages = imagePreviews
            .filter((img) => img.isExisting)
            .map((img) => ({
              url: img.url,
              angle: img.angle,
              is_primary: img.is_primary
            }));

          // Combine existing images with new uploaded images
          const allImages = [...existingImages, ...newUploadedImages];

          // Update the product with the combined images array
          await api.put(`/products/${product.id}`, { images: allImages });
        }
      } else {
        // Upload images first for new product
        const uploadedImages = await uploadImages();

        // Create new product with uploaded images
        response = await api.post("/products", {
          ...payload,
          images: uploadedImages
        });
      }

      onSuccess(response.data);
    } catch (err) {
      if (err.response?.data?.errors) {
        const errorMessages = Object.values(err.response.data.errors).flat();
        setError(errorMessages.join(", "));
      } else {
        setError(err.response?.data?.message || "Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-6">
        {product
          ? t("seller.products.edit_product")
          : t("seller.products.add_product")}
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Upload Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("seller.products.images")}
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {/* Image upload button */}
            <label className="relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-500 transition-colors">
              <PhotoIcon className="w-8 h-8 text-gray-400" />
              <span className="text-sm text-gray-500 mt-2 text-center">
                {uploadingImages ? "Uploading..." : "Add Images"}
              </span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageSelect}
                disabled={uploadingImages}
                className="hidden"
              />
            </label>

            {/* Display image previews */}
            {imagePreviews.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={image.url}
                  alt={`Product image ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => setPrimaryImage(index)}
                      className={`p-1 rounded text-xs ${
                        image.is_primary
                          ? "bg-green-600 text-white"
                          : "bg-white text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {image.is_primary ? "Primary" : "Set Primary"}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="p-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {image.is_primary && (
                  <div className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
                    Primary
                  </div>
                )}
                {image.isExisting && (
                  <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                    Existing
                  </div>
                )}
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500">
            First image will be used as the primary display image. Supported
            formats: JPG, PNG, WebP.
          </p>
        </div>

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              {t("seller.products.name_en")} *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border"
            />
          </div>

          <div>
            <label
              htmlFor="name_mm"
              className="block text-sm font-medium text-gray-700"
            >
              {t("seller.products.name_mm")}
            </label>
            <input
              type="text"
              id="name_mm"
              name="name_mm"
              value={formData.name_mm}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700"
          >
            {t("seller.products.description")} *
          </label>
          <textarea
            id="description"
            name="description"
            rows="4"
            required
            value={formData.description}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border"
          />
        </div>

        {/* Pricing & Inventory */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label
              htmlFor="price"
              className="block text-sm font-medium text-gray-700"
            >
              {t("seller.products.price")} (MMK) *
            </label>
            <input
              type="number"
              id="price"
              name="price"
              step="0.01"
              min="0"
              required
              value={formData.price}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border"
            />
          </div>

          <div>
            <label
              htmlFor="quantity"
              className="block text-sm font-medium text-gray-700"
            >
              {t("seller.products.quantity")} *
            </label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              min="0"
              required
              value={formData.quantity}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border"
            />
          </div>

          <div>
            <label
              htmlFor="min_order"
              className="block text-sm font-medium text-gray-700"
            >
              {t("seller.products.min_order")} *
            </label>
            <input
              type="number"
              id="min_order"
              name="min_order"
              min="1"
              required
              value={formData.min_order}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border"
            />
          </div>
        </div>

        {/* Category & Lead Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="category_id"
              className="block text-sm font-medium text-gray-700"
            >
              {t("seller.products.category")} *
            </label>
            <select
              id="category_id"
              name="category_id"
              required
              value={formData.category_id}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border"
            >
              <option value="">{t("seller.products.select_category")}</option>
              {loadingCategories ? (
                <option disabled>{t("common.loading")}</option>
              ) : (
                categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label
              htmlFor="lead_time"
              className="block text-sm font-medium text-gray-700"
            >
              {t("seller.products.lead_time")}
            </label>
            <input
              type="text"
              id="lead_time"
              name="lead_time"
              value={formData.lead_time}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border"
              placeholder={t("seller.products.lead_time_placeholder")}
            />
          </div>
        </div>

        {/* Seller selection (admin only) */}
        {isAdmin && (
          <div>
            <label
              htmlFor="seller_id"
              className="block text-sm font-medium text-gray-700"
            >
              {t("seller.products.seller")} *
            </label>
            <select
              id="seller_id"
              name="seller_id"
              required
              value={formData.seller_id}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border"
            >
              <option value="">{t("seller.products.select_seller")}</option>
              {loadingSellers ? (
                <option disabled>{t("common.loading")}</option>
              ) : (
                sellers.map((seller) => (
                  <option key={seller.id} value={seller.id}>
                    {seller.name || t("common.unknown")} (
                    {seller.email || t("common.unknown")})
                  </option>
                ))
              )}
            </select>
          </div>
        )}

        {/* Specifications */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("seller.products.specifications")}
          </label>
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                name="key"
                placeholder={t("seller.products.spec_name")}
                value={specInput.key}
                onChange={handleSpecChange}
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border"
              />
              <input
                type="text"
                name="value"
                placeholder={t("seller.products.spec_value")}
                value={specInput.value}
                onChange={handleSpecChange}
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border"
              />
              <button
                type="button"
                onClick={addSpecification}
                className="px-3 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
              >
                {t("common.add")}
              </button>
            </div>

            {Object.entries(formData.specifications).map(([key, value]) => (
              <div
                key={key}
                className="flex items-center justify-between bg-gray-50 p-2 rounded"
              >
                <span className="text-sm">
                  <strong>{key}:</strong> {value}
                </span>
                <button
                  type="button"
                  onClick={() => removeSpecification(key)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  {t("common.remove")}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center">
          <input
            id="is_active"
            name="is_active"
            type="checkbox"
            checked={formData.is_active}
            onChange={handleChange}
            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
          />
          <label
            htmlFor="is_active"
            className="ml-2 block text-sm text-gray-900"
          >
            {t("seller.products.active")}
          </label>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {t("common.cancel")}
          </button>
          <button
            type="submit"
            disabled={loading || uploadingImages}
            className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50 flex items-center"
          >
            {uploadingImages && (
              <CloudArrowUpIcon className="w-4 h-4 mr-2 animate-pulse" />
            )}
            {loading
              ? t("common.saving")
              : product
              ? t("common.update")
              : t("common.create")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
