import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeftIcon, PhotoIcon } from "@heroicons/react/24/outline";
import api from "../../../utils/api";

const CategoryForm = ({ mode = "create", category: initialCategory = null, onSuccess }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [categoriesFetched, setCategoriesFetched] = useState(false);

  // Initialize form state
  const [formData, setFormData] = useState({
    name_en: "",
    name_mm: "",
    description_en: "",
    description_mm: "",
    commission_rate: 0, // Store as percentage for display
    parent_id: "",
    is_active: true,
    image: null
  });

  // Fetch parent categories for dropdown - memoized with useCallback
  const fetchCategories = useCallback(async () => {
    if (categoriesFetched) return; // Prevent multiple fetches

    try {
      setLoading(true);
      const response = await api.get("/categories");
      if (response.data.success) {
        setCategories(response.data.data);
        setCategoriesFetched(true);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setLoading(false);
    }
  }, [categoriesFetched]);

  // Initialize form from initialCategory prop - memoized with useCallback
  const initializeForm = useCallback(() => {
    if (mode === "edit" && initialCategory) {
      // Convert commission rate from decimal to percentage for display
      const commissionRate = initialCategory.commission_rate ?
        parseFloat(initialCategory.commission_rate) * 100 : 0;

      const newFormData = {
        name_en: initialCategory.name_en || "",
        name_mm: initialCategory.name_mm || "",
        description_en: initialCategory.description_en || "",
        description_mm: initialCategory.description_mm || "",
        commission_rate: commissionRate,
        parent_id: initialCategory.parent_id || "",
        is_active: initialCategory.is_active !== false,
        image: initialCategory.image || null
      };

      setFormData(newFormData);

      // Set image preview if image exists
      if (initialCategory.image) {
        const imageUrl = initialCategory.image.startsWith('http')
          ? initialCategory.image
          : `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/storage/${initialCategory.image.replace('public/', '')}`;
        setImagePreview(imageUrl);
      }
    }
  }, [mode, initialCategory]);

  // Run initialization once
  useEffect(() => {
    fetchCategories();
    initializeForm();
  }, [fetchCategories, initializeForm]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      if (!validTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, image: "Please upload a valid image file (JPEG, PNG, GIF, WebP)" }));
        return;
      }

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: "Image size should be less than 2MB" }));
        return;
      }

      setFormData(prev => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
      setErrors(prev => ({ ...prev, image: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name_en.trim()) {
      newErrors.name_en = "English name is required";
    }

    const commissionRate = parseFloat(formData.commission_rate);
    if (isNaN(commissionRate) || commissionRate < 0 || commissionRate > 100) {
      newErrors.commission_rate = "Commission rate must be between 0 and 100";
    }

    return newErrors;
  };

  // Update the handleSubmit function
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setSaving(true);
    try {
      const submitData = new FormData();

      // Append all fields with correct types
      submitData.append("name_en", formData.name_en);
      if (formData.name_mm) submitData.append("name_mm", formData.name_mm);
      if (formData.description_en) submitData.append("description_en", formData.description_en);
      if (formData.description_mm) submitData.append("description_mm", formData.description_mm);

      // Convert percentage to decimal for API (e.g., 10% -> 0.10)
      const commissionRate = parseFloat(formData.commission_rate) / 100;
      submitData.append("commission_rate", commissionRate);

      if (formData.parent_id) {
        submitData.append("parent_id", formData.parent_id);
      }

      submitData.append("is_active", formData.is_active ? 1 : 0);

      // Handle image upload
      if (formData.image && typeof formData.image === "object") {
        // New image file uploaded
        submitData.append("image", formData.image);
      } else if (mode === "edit" && !formData.image && initialCategory?.image) {
        // In edit mode, no new image selected, keep existing image
        // Don't append anything for image - backend will keep existing
      } else if (mode === "edit" && formData.image === null && initialCategory?.image) {
        // Image was removed - send empty string to delete image
        submitData.append("image", "");
      } else if (mode === "create" && !formData.image) {
        // In create mode, no image selected
        // Don't append image field
      }

      console.log("Submitting form data:");
      for (let [key, value] of submitData.entries()) {
        console.log(key, value, value instanceof File ? `[File: ${value.name}]` : '');
      }

      if (mode === "edit") {
        await api.put(`/categories/${id}`, submitData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      } else {
        await api.post("/categories", submitData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      }

      console.log("Image state:", {
        formDataImage: formData.image,
        initialCategoryImage: initialCategory?.image,
        mode,
        hasNewImage: formData.image && typeof formData.image === "object",
        hasExistingImage: initialCategory?.image,
        imageType: formData.image ? typeof formData.image : 'null'
      });

      // Also check the FormData
      console.log("FormData entries:");
      for (let [key, value] of submitData.entries()) {
        console.log(`  ${key}:`, value, value instanceof File ? `[File: ${value.name}, ${value.size} bytes]` : '');
      }

      console.log("Full request details:");
      console.log("Method:", mode === "edit" ? "PUT" : "POST");
      console.log("URL:", mode === "edit" ? `/categories/${id}` : "/categories");
      console.log("Headers:", { "Content-Type": "multipart/form-data" });
      console.log("FormData size:", submitData);

      // Count entries
      let entryCount = 0;
      for (let entry of submitData.entries()) {
        entryCount++;
      }
      console.log("Total FormData entries:", entryCount);

      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      } else {
        // Default navigation
        navigate("/admin");
      }
    } catch (error) {
      console.error("Failed to save category:", error);

      if (error.response?.data?.errors) {
        // Handle Laravel validation errors
        const validationErrors = {};
        Object.keys(error.response.data.errors).forEach(key => {
          validationErrors[key] = error.response.data.errors[key][0];
        });
        setErrors(validationErrors);
      } else {
        alert(error.response?.data?.message || "Failed to save category");
      }
    } finally {
      setSaving(false);
    }
  };

  // Update the handleRemoveImage function
  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, image: null }));
    setImagePreview(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate("/admin")}
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to Categories
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {mode === "edit" ? "Edit Category" : "Create New Category"}
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          {mode === "edit"
            ? "Update category details and settings"
            : "Add a new product category to your store"
          }
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        <div className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name_en" className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name (English) *
                </label>
                <input
                  type="text"
                  id="name_en"
                  name="name_en"
                  value={formData.name_en}
                  onChange={handleChange}
                  className={`block w-full rounded-md border ${errors.name_en ? 'border-red-300' : 'border-gray-300'
                    } px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 sm:text-sm`}
                  placeholder="e.g., Electronics"
                />
                {errors.name_en && (
                  <p className="mt-1 text-sm text-red-600">{errors.name_en}</p>
                )}
              </div>

              <div>
                <label htmlFor="name_mm" className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name (Myanmar)
                </label>
                <input
                  type="text"
                  id="name_mm"
                  name="name_mm"
                  value={formData.name_mm}
                  onChange={handleChange}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 sm:text-sm"
                  placeholder="e.g., လျှပ်စစ်ပစ္စည်းများ"
                />
              </div>
            </div>
          </div>

          {/* Descriptions */}
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="description_en" className="block text-sm font-medium text-gray-700 mb-1">
                  Description (English)
                </label>
                <textarea
                  id="description_en"
                  name="description_en"
                  value={formData.description_en}
                  onChange={handleChange}
                  rows={3}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 sm:text-sm"
                  placeholder="Brief description of the category"
                />
              </div>

              <div>
                <label htmlFor="description_mm" className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Myanmar)
                </label>
                <textarea
                  id="description_mm"
                  name="description_mm"
                  value={formData.description_mm}
                  onChange={handleChange}
                  rows={3}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 sm:text-sm"
                  placeholder="အမျိုးအစားအကြောင်း အတိုချုပ်"
                />
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Category Image
            </h3>
            <div className="flex items-start space-x-6">
              <div className="flex-shrink-0">
                <div className="relative">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Category preview"
                        className="h-32 w-32 rounded-lg object-cover"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        title="Remove image"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="h-32 w-32 rounded-lg bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                      <PhotoIcon className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {imagePreview ? "Replace Image" : "Upload Image"}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    PNG, JPG, GIF, WebP up to 2MB
                  </p>
                  {errors.image && (
                    <p className="mt-1 text-sm text-red-600">{errors.image}</p>
                  )}
                </div>

                {mode === "edit" && formData.image && typeof formData.image === "string" && (
                  <p className="text-sm text-gray-500">
                    Current image: {formData.image.split('/').pop()}
                    <br />
                    <span className="text-xs">Leave unchanged to keep current image</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Settings */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Settings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="parent_id" className="block text-sm font-medium text-gray-700 mb-1">
                  Parent Category
                </label>
                <select
                  id="parent_id"
                  name="parent_id"
                  value={formData.parent_id}
                  onChange={handleChange}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 sm:text-sm"
                  disabled={loading}
                >
                  <option value="">None (Root Category)</option>
                  {categories
                    .filter(cat => mode === "edit" ? cat.id !== parseInt(id) : true)
                    .map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name_en}
                      </option>
                    ))
                  }
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Select parent category to create a subcategory
                </p>
              </div>

              <div>
                <label htmlFor="commission_rate" className="block text-sm font-medium text-gray-700 mb-1">
                  Commission Rate (%) *
                </label>
                <div className="relative rounded-md shadow-sm">
                  <input
                    type="number"
                    id="commission_rate"
                    name="commission_rate"
                    value={formData.commission_rate}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    step="0.1"
                    className={`block w-full rounded-md border ${errors.commission_rate ? 'border-red-300' : 'border-gray-300'
                      } px-3 py-2 pr-10 text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 sm:text-sm`}
                    placeholder="e.g., 10"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">%</span>
                  </div>
                </div>
                {errors.commission_rate && (
                  <p className="mt-1 text-sm text-red-600">{errors.commission_rate}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Platform commission percentage for this category (0-100%)
                </p>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                  Category is active
                </label>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Inactive categories won't be visible to users
              </p>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-6 border-t border-gray-200">
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate("/admin")}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {mode === "edit" ? "Saving..." : "Creating..."}
                  </>
                ) : (
                  mode === "edit" ? "Update Category" : "Create Category"
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CategoryForm;