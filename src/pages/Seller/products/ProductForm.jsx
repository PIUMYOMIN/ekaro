import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import api from "../../../utils/api";
import { useAuth } from "../../../context/AuthContext";
import {
  XMarkIcon,
  PhotoIcon,
  CloudArrowUpIcon,
  TrashIcon,
  PlusIcon,
  EyeIcon
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
    seller_id: product?.seller_id || user?.id
  });
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [error, setError] = useState("");
  const [specInput, setSpecInput] = useState({ key: "", value: "" });
  const [imagePreviews, setImagePreviews] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

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

    // Load existing product images if editing
    if (product && product.images) {
      const previews = product.images.map((img) => ({
        url: typeof img === "string" ? img : img.url,
        is_primary: img.is_primary || false,
        angle: img.angle || "default",
        isExisting: true
      }));
      setImagePreviews(previews);
    }

    fetchCategories();
  }, [product]);

  // Clean up object URLs
  useEffect(() => {
    return () => {
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

    const newPreviews = files.map((file) => ({
      url: URL.createObjectURL(file),
      file: file,
      is_primary: imagePreviews.length === 0,
      angle: "default",
      isExisting: false
    }));

    setImagePreviews((prev) => [...prev, ...newPreviews]);
    setImageFiles((prev) => [...prev, ...files]);
    e.target.value = "";
  };

  const removeImage = (index) => {
    const previewToRemove = imagePreviews[index];

    if (!previewToRemove.isExisting && previewToRemove.url.startsWith("blob:")) {
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
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity),
        min_order: parseInt(formData.min_order),
        category_id: parseInt(formData.category_id)
      };

      let response;
      if (product) {
        response = await api.put(`/products/${product.id}`, payload);

        if (imageFiles.length > 0) {
          const newUploadedImages = await uploadImages(product.id);
          const existingImages = imagePreviews
            .filter((img) => img.isExisting)
            .map((img) => ({
              url: img.url,
              angle: img.angle,
              is_primary: img.is_primary
            }));

          const allImages = [...existingImages, ...newUploadedImages];
          await api.put(`/products/${product.id}`, { images: allImages });
        }
      } else {
        const uploadedImages = await uploadImages();
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

  const tabs = [
    { id: "basic", name: "Basic Info" },
    { id: "images", name: "Images" },
    { id: "specs", name: "Specifications" },
    { id: "inventory", name: "Inventory" }
  ];

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {product ? "Edit Product" : "Add New Product"}
            </h1>
            <p className="text-green-100 mt-1">
              {product ? "Update your product details" : "Create a new product listing"}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="text-white hover:text-green-200 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === tab.id
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }
              `}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Basic Information Tab */}
          {activeTab === "basic" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name (English) *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                    placeholder="Enter product name in English"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name (Myanmar)
                  </label>
                  <input
                    type="text"
                    name="name_mm"
                    value={formData.name_mm}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                    placeholder="Enter product name in Myanmar"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  rows="4"
                  required
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                  placeholder="Describe your product in detail..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    name="category_id"
                    required
                    value={formData.category_id}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                  >
                    <option value="">Select a category</option>
                    {loadingCategories ? (
                      <option disabled>Loading categories...</option>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lead Time
                  </label>
                  <input
                    type="text"
                    name="lead_time"
                    value={formData.lead_time}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                    placeholder="e.g., 3-5 days, 1 week"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Images Tab */}
          {activeTab === "images" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Product Images
                </label>
                
                {/* Image Upload Area */}
                <label className="block w-full h-48 border-2 border-dashed border-gray-300 rounded-2xl hover:border-green-500 transition-all duration-200 cursor-pointer bg-gray-50 hover:bg-green-50">
                  <div className="flex flex-col items-center justify-center h-full">
                    <PhotoIcon className="h-12 w-12 text-gray-400 mb-3" />
                    <span className="text-lg font-medium text-gray-600">
                      Click to upload images
                    </span>
                    <span className="text-sm text-gray-500 mt-1">
                      PNG, JPG, WebP up to 5MB each
                    </span>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageSelect}
                    disabled={uploadingImages}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Uploaded Images ({imagePreviews.length})
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {imagePreviews.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image.url}
                          alt={`Product preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-xl border-2 border-gray-200 group-hover:border-green-500 transition-all duration-200"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100">
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
                              <TrashIcon className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        {image.is_primary && (
                          <div className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
                            Primary
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Specifications Tab */}
          {activeTab === "specs" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Product Specifications
                </label>
                
                {/* Add Specification Form */}
                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    <div className="md:col-span-2">
                      <input
                        type="text"
                        name="key"
                        placeholder="Specification name"
                        value={specInput.key}
                        onChange={handleSpecChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <input
                        type="text"
                        name="value"
                        placeholder="Specification value"
                        value={specInput.value}
                        onChange={handleSpecChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={addSpecification}
                        className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                      >
                        <PlusIcon className="h-4 w-4" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Specifications List */}
                {Object.keys(formData.specifications).length > 0 ? (
                  <div className="space-y-2">
                    {Object.entries(formData.specifications).map(([key, value]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between bg-white border border-gray-200 rounded-xl p-4 hover:border-green-500 transition-colors"
                      >
                        <div className="flex-1">
                          <span className="font-medium text-gray-900">{key}:</span>
                          <span className="text-gray-600 ml-2">{value}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeSpecification(key)}
                          className="text-red-600 hover:text-red-800 p-1 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No specifications added yet. Add some to help customers understand your product better.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Inventory Tab */}
          {activeTab === "inventory" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (MMK) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      K
                    </span>
                    <input
                      type="number"
                      name="price"
                      step="0.01"
                      min="0"
                      required
                      value={formData.price}
                      onChange={handleChange}
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    min="0"
                    required
                    value={formData.quantity}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                    placeholder="Available quantity"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Order *
                  </label>
                  <input
                    type="number"
                    name="min_order"
                    min="1"
                    required
                    value={formData.min_order}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                    placeholder="Minimum order quantity"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-xl border border-green-200">
                <input
                  id="is_active"
                  name="is_active"
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="is_active"
                  className="text-sm font-medium text-gray-900"
                >
                  Make this product active and visible to customers
                </label>
              </div>
            </div>
          )}

          {/* Navigation and Submit */}
          <div className="flex justify-between items-center pt-8 border-t border-gray-200 mt-8">
            <div className="flex space-x-3">
              {tabs.map((tab, index) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    ${activeTab === tab.id
                      ? "bg-green-600 text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }
                  `}
                >
                  {index + 1}. {tab.name}
                </button>
              ))}
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || uploadingImages}
                className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {uploadingImages && (
                  <CloudArrowUpIcon className="h-4 w-4 animate-pulse" />
                )}
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>{product ? "Updating..." : "Creating..."}</span>
                  </>
                ) : (
                  <span>{product ? "Update Product" : "Create Product"}</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;