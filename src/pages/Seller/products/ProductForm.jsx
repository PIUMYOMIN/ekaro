import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../../../utils/api";
import { useAuth } from "../../../context/AuthContext";
import {
  XMarkIcon,
  PhotoIcon,
  TrashIcon,
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from "@heroicons/react/24/outline";

// Local storage keys
const STORAGE_KEYS = {
  PRODUCT_DRAFT: 'product_draft',
  IMAGE_PREVIEWS: 'product_image_previews'
};

const ProductForm = ({ product = null, onSuccess, onCancel }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const defaultFormData = {
    name: "",
    name_mm: "",
    description: "",
    description_mm: "",
    price: "",
    quantity: 0,
    category_id: "",
    specifications: {},
    moq: 1,
    min_order_unit: "piece",
    lead_time: "",
    condition: "new",
    is_active: true,
    seller_id: user?.id,
    brand: "",
    model: "",
    color: "",
    material: "",
    origin: "",
    weight_kg: "",
    warranty: "",
    warranty_type: "",
    warranty_period: "",
    return_policy: "",
    shipping_cost: "",
    shipping_time: "",
    packaging_details: "",
    additional_info: "",
    is_featured: false,
    is_new: true,
    discount_price: "",
    discount_start: "",
    discount_end: ""
  };

  const [formData, setFormData] = useState(() => {
    if (product) {
      return { ...defaultFormData, ...product };
    }

    const savedDraft = localStorage.getItem(STORAGE_KEYS.PRODUCT_DRAFT);
    if (savedDraft) {
      try {
        return { ...defaultFormData, ...JSON.parse(savedDraft) };
      } catch (error) {
        console.error('Error loading draft:', error);
      }
    }

    return defaultFormData;
  });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [error, setError] = useState("");
  const [specInput, setSpecInput] = useState({ key: "", value: "" });
  const [imagePreviews, setImagePreviews] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Product conditions
  const productConditions = [
    { value: "new", label: "New", description: "Brand new, never used" },
    { value: "used_like_new", label: "Used - Like New", description: "Used but looks and functions like new" },
    { value: "used_good", label: "Used - Good", description: "Used with minor signs of wear" },
    { value: "used_fair", label: "Used - Fair", description: "Used with visible signs of wear" }
  ];

  const minOrderUnits = [
    { value: "piece", label: "Piece" },
    { value: "kg", label: "Kilogram" },
    { value: "gram", label: "Gram" },
    { value: "meter", label: "Meter" },
    { value: "set", label: "Set" },
    { value: "pack", label: "Pack" },
    { value: "box", label: "Box" },
    { value: "pallet", label: "Pallet" }
  ];

  const warrantyTypes = [
    { value: "manufacturer", label: "Manufacturer Warranty" },
    { value: "seller", label: "Seller Warranty" },
    { value: "international", label: "International Warranty" },
    { value: "no_warranty", label: "No Warranty" }
  ];

  const steps = [
    { id: 1, title: "Basic Info", description: "Product details" },
    { id: 2, title: "Pricing", description: "Price and inventory" },
    { id: 3, title: "Media", description: "Images and specs" },
    { id: 4, title: "Shipping & More", description: "Delivery and details" }
  ];

  useEffect(() => {
    if (!product) {
      const draftToSave = { ...formData };
      delete draftToSave.seller_id;
      localStorage.setItem(STORAGE_KEYS.PRODUCT_DRAFT, JSON.stringify(draftToSave));
    }
  }, [formData, product]);

  useEffect(() => {
    if (!product) {
      const previewsToSave = imagePreviews.map(preview => ({
        url: preview.url,
        is_primary: preview.is_primary,
        angle: preview.angle,
        isExisting: preview.isExisting
      }));
      localStorage.setItem(STORAGE_KEYS.IMAGE_PREVIEWS, JSON.stringify(previewsToSave));
    }
  }, [imagePreviews, product]);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const response = await api.get("/categories");
        if (response.data.success && Array.isArray(response.data.data)) {
          setCategories(response.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      } finally {
        setLoadingCategories(false);
      }
    };

    if (product && product.images) {
      const previews = product.images.map((img) => ({
        url: typeof img === "string" ? img : img.url,
        is_primary: img.is_primary || false,
        angle: img.angle || "default",
        isExisting: true
      }));
      setImagePreviews(previews);
    } else if (!product) {
      const savedPreviews = localStorage.getItem(STORAGE_KEYS.IMAGE_PREVIEWS);
      if (savedPreviews) {
        try {
          const parsedPreviews = JSON.parse(savedPreviews);
          setImagePreviews(parsedPreviews);
        } catch (error) {
          console.error('Error loading image previews:', error);
        }
      }
    }

    fetchCategories();
  }, [product]);

  useEffect(() => {
    return () => {
      imagePreviews.forEach((preview) => {
        if (!preview.isExisting && preview.url.startsWith("blob:")) {
          URL.revokeObjectURL(preview.url);
        }
      });
    };
  }, [imagePreviews]);

  useEffect(() => {
    if (showSuccessPopup) {
      const timer = setTimeout(() => {
        setShowSuccessPopup(false);
        clearDraft();
        if (onSuccess) {
          onSuccess();
        } else {
          navigate("/admin");
        }
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [showSuccessPopup, onSuccess, navigate]);

  const clearDraft = () => {
    localStorage.removeItem(STORAGE_KEYS.PRODUCT_DRAFT);
    localStorage.removeItem(STORAGE_KEYS.IMAGE_PREVIEWS);
  };

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

    const newPreviews = files.map((file, index) => ({
      url: URL.createObjectURL(file),
      file: file,
      is_primary: imagePreviews.length === 0 && index === 0,
      angle: "default",
      isExisting: false
    }));

    setImagePreviews((prev) => [...prev, ...newPreviews]);
    e.target.value = "";
  };

  const removeImage = (index) => {
    const previewToRemove = imagePreviews[index];

    if (previewToRemove.url.startsWith("blob:")) {
      URL.revokeObjectURL(previewToRemove.url);
    }

    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const setPrimaryImage = (index) => {
    setImagePreviews((prev) =>
      prev.map((img, i) => ({
        ...img,
        is_primary: i === index
      }))
    );
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        return formData.name && formData.description && formData.category_id;
      case 2:
        return formData.price && formData.quantity && formData.moq && formData.condition;
      case 3:
        return imagePreviews.length > 0;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCompletedSteps(prev => new Set(prev).add(currentStep));
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const goToStep = (step) => {
    if (completedSteps.has(step - 1) || step === 1) {
      setCurrentStep(step);
    }
  };

  const handleFinalSubmit = async () => {
    if (loading) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log("Starting final product submission...");

      const uploadedImages = [];

      for (const preview of imagePreviews) {
        if (preview.file) {
          console.log("Uploading image:", preview.file.name);
          const uploadFormData = new FormData();
          uploadFormData.append("image", preview.file);

          const uploadResponse = await api.post("/products/upload-image", uploadFormData, {
            headers: {
              "Content-Type": "multipart/form-data"
            }
          });

          console.log("Image upload response:", uploadResponse.data);

          if (uploadResponse.data.success) {
            uploadedImages.push({
              url: uploadResponse.data.data.url,
              angle: preview.angle,
              is_primary: preview.is_primary
            });
          }
        } else if (preview.isExisting) {
          uploadedImages.push({
            url: preview.url,
            angle: preview.angle,
            is_primary: preview.is_primary
          });
        }
      }

      console.log("All images uploaded:", uploadedImages);

      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity),
        moq: parseInt(formData.moq),
        category_id: parseInt(formData.category_id),
        specifications: formData.specifications,
        images: uploadedImages,
        discount_price: formData.discount_price ? parseFloat(formData.discount_price) : null,
        // Ensure Myanmar fields are empty strings if not provided
        name_mm: formData.name_mm || "",
        description_mm: formData.description_mm || ""
      };

      console.log("Sending final product payload:", payload);

      let response;
      if (product) {
        response = await api.put(`/products/${product.id}`, payload);
        setSuccessMessage("Product updated successfully!");
      } else {
        response = await api.post("/products", payload);
        setSuccessMessage("Product created successfully!");
      }

      console.log("Product API response:", response.data);

      setShowSuccessPopup(true);

    } catch (err) {
      console.error("Product submission error:", err);

      if (err.response?.data?.errors) {
        const errorMessages = Object.values(err.response.data.errors).flat();
        setError(errorMessages.join(", "));
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (!product) {
      const confirmLeave = window.confirm(
        "You have unsaved changes. Are you sure you want to leave? Your draft will be saved."
      );
      if (!confirmLeave) return;
    }

    if (onCancel) {
      onCancel();
    } else {
      navigate("/admin");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {showSuccessPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-xl transform transition-all">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircleIcon className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Success!
              </h3>
              <p className="text-gray-600 mb-6">
                {successMessage}
              </p>
              <p className="text-sm text-gray-500">
                Redirecting to admin panel...
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-8">
          <div className="px-8 py-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {product ? "Edit Product" : "New Listing"}
                </h1>
                <p className="text-gray-600 mt-1">
                  {product ? "Update your product details" : "Create a new product listing"}
                  {!product && (
                    <span className="text-blue-600 text-sm ml-2">• Draft auto-saved</span>
                  )}
                </p>
              </div>
              <button
                onClick={handleCancel}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center flex-1">
                  <button
                    onClick={() => goToStep(step.id)}
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 font-semibold text-sm transition-all ${currentStep === step.id
                      ? "border-green-500 bg-green-500 text-white"
                      : completedSteps.has(step.id)
                        ? "border-green-500 bg-green-500 text-white"
                        : "border-gray-300 text-gray-500"
                      }`}
                  >
                    {completedSteps.has(step.id) ? (
                      <CheckCircleIcon className="h-5 w-5" />
                    ) : (
                      step.id
                    )}
                  </button>
                  <div className="ml-3 flex-1">
                    <div className={`text-sm font-medium ${currentStep === step.id ? "text-green-600" :
                      completedSteps.has(step.id) ? "text-gray-900" : "text-gray-500"
                      }`}>
                      {step.title}
                    </div>
                    <div className="text-xs text-gray-500 hidden sm:block">
                      {step.description}
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-4 ${completedSteps.has(step.id) ? "bg-green-500" : "bg-gray-300"
                      }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
          {error && (
            <div className="mx-8 mt-8 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-start">
              <ExclamationCircleIcon className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="p-8">
            {/* Step 1: Basic Information with Category */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">Basic Information</h2>
                  <p className="text-gray-600">Tell us about your product (English fields are required)</p>
                </div>

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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                      placeholder="Enter product name in English"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Name (Myanmar)
                      <span className="ml-1 text-xs text-gray-500">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      name="name_mm"
                      value={formData.name_mm}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                      placeholder="Enter product name in Myanmar"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description (English) *
                    </label>
                    <textarea
                      name="description"
                      rows="4"
                      required
                      value={formData.description}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                      placeholder="Describe your product in detail in English..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description (Myanmar)
                      <span className="ml-1 text-xs text-gray-500">(Optional)</span>
                    </label>
                    <textarea
                      name="description_mm"
                      rows="4"
                      value={formData.description_mm}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                      placeholder="Describe your product in detail in Myanmar..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    {loadingCategories ? (
                      <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
                        <span className="ml-2 text-gray-600">Loading categories...</span>
                      </div>
                    ) : categories.length > 0 ? (
                      <select
                        name="category_id"
                        required
                        value={formData.category_id}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                      >
                        <option value="">Select a category</option>
                        {categories.map((parentCategory) => (
                          <optgroup
                            key={parentCategory.id}
                            label={parentCategory.name}
                            className="font-semibold text-gray-900"
                          >
                            {/* Show child categories as selectable options */}
                            {parentCategory.children && parentCategory.children.length > 0 ? (
                              parentCategory.children.map((childCategory) => (
                                <option key={childCategory.id} value={childCategory.id} className="pl-6 text-gray-700">
                                  {childCategory.name}
                                </option>
                              ))
                            ) : (
                              <option disabled className="pl-6 text-gray-500">
                                No sub-categories available
                              </option>
                            )}
                          </optgroup>
                        ))}
                      </select>
                    ) : (
                      <div className="text-center py-4 bg-gray-50 rounded-lg border border-gray-300">
                        <p className="text-gray-600">No categories available</p>
                        <p className="text-sm text-gray-500 mt-1">Please create categories first</p>
                      </div>
                    )}
                    <p className="text-sm text-gray-500 mt-1">
                      Parent categories are shown as section headers. Select a sub-category for your product.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Condition *
                    </label>
                    <select
                      name="condition"
                      required
                      value={formData.condition}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                    >
                      {productConditions.map((condition) => (
                        <option key={condition.value} value={condition.value}>
                          {condition.label}
                        </option>
                      ))}
                    </select>
                    {formData.condition && (
                      <p className="text-xs text-gray-500 mt-1">
                        {productConditions.find(c => c.value === formData.condition)?.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Brand
                      <span className="ml-1 text-xs text-gray-500">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      name="brand"
                      value={formData.brand}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                      placeholder="Product brand"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Model
                      <span className="ml-1 text-xs text-gray-500">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      name="model"
                      value={formData.model}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                      placeholder="Model number/name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Color
                      <span className="ml-1 text-xs text-gray-500">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      name="color"
                      value={formData.color}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                      placeholder="Product color"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Material
                      <span className="ml-1 text-xs text-gray-500">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      name="material"
                      value={formData.material}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                      placeholder="Primary material"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Origin
                      <span className="ml-1 text-xs text-gray-500">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      name="origin"
                      value={formData.origin}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                      placeholder="Country of origin"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Pricing & Inventory */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">Pricing & Inventory</h2>
                  <p className="text-gray-600">Set your pricing and stock information</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Discount Price (MMK)
                      <span className="ml-1 text-xs text-gray-500">(Optional)</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        K
                      </span>
                      <input
                        type="number"
                        name="discount_price"
                        step="0.01"
                        min="0"
                        value={formData.discount_price}
                        onChange={handleChange}
                        className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                      placeholder="Available quantity"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      MOQ (Minimum Order) *
                    </label>
                    <input
                      type="number"
                      name="moq"
                      min="1"
                      required
                      value={formData.moq}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                      placeholder="Minimum order quantity"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Order Unit *
                    </label>
                    <select
                      name="min_order_unit"
                      required
                      value={formData.min_order_unit}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                    >
                      {minOrderUnits.map((unit) => (
                        <option key={unit.value} value={unit.value}>
                          {unit.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lead Time
                      <span className="ml-1 text-xs text-gray-500">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      name="lead_time"
                      value={formData.lead_time}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                      placeholder="e.g., 3-5 days, 1 week"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Weight (kg)
                      <span className="ml-1 text-xs text-gray-500">(Optional)</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      name="weight_kg"
                      value={formData.weight_kg}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                      placeholder="Product weight in kilograms"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Media & Specifications */}
            {currentStep === 3 && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">Media & Specifications</h2>
                  <p className="text-gray-600">Add images and product specifications</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Product Images *
                  </label>

                  <label className="block w-full h-40 border-2 border-dashed border-gray-300 rounded-xl hover:border-green-500 transition-all duration-200 cursor-pointer bg-gray-50 hover:bg-green-50">
                    <div className="flex flex-col items-center justify-center h-full">
                      <PhotoIcon className="h-10 w-10 text-gray-400 mb-2" />
                      <span className="text-base font-medium text-gray-600">
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
                      className="hidden"
                    />
                  </label>

                  {imagePreviews.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-sm font-medium text-gray-700 mb-3">
                        Uploaded Images ({imagePreviews.length})
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {imagePreviews.map((image, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={image.url}
                              alt={`Product preview ${index + 1}`}
                              className="w-full h-20 object-cover rounded-lg border-2 border-gray-200 group-hover:border-green-500 transition-all duration-200"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                              <div className="flex space-x-1">
                                <button
                                  type="button"
                                  onClick={() => setPrimaryImage(index)}
                                  className={`p-1 rounded text-xs ${image.is_primary
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
                              <div className="absolute top-1 left-1 bg-green-600 text-white text-xs px-1.5 py-0.5 rounded">
                                Primary
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Product Specifications
                    <span className="ml-1 text-xs text-gray-500">(Optional)</span>
                  </label>

                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
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

                  {Object.keys(formData.specifications).length > 0 ? (
                    <div className="space-y-2">
                      {Object.entries(formData.specifications).map(([key, value]) => (
                        <div
                          key={key}
                          className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-3 hover:border-green-500 transition-colors"
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
                    <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg">
                      No specifications added yet.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 4: Shipping & More */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">Shipping & More</h2>
                  <p className="text-gray-600">Set shipping details, warranty, and other information</p>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Shipping Cost (MMK)
                        <span className="ml-1 text-xs text-gray-500">(Optional)</span>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        name="shipping_cost"
                        value={formData.shipping_cost}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                        placeholder="Shipping cost"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Shipping Time
                        <span className="ml-1 text-xs text-gray-500">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        name="shipping_time"
                        value={formData.shipping_time}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                        placeholder="e.g., 3-5 business days"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Warranty Type
                        <span className="ml-1 text-xs text-gray-500">(Optional)</span>
                      </label>
                      <select
                        name="warranty_type"
                        value={formData.warranty_type}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                      >
                        <option value="">Select warranty type</option>
                        {warrantyTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Warranty Period
                        <span className="ml-1 text-xs text-gray-500">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        name="warranty_period"
                        value={formData.warranty_period}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                        placeholder="e.g., 12 months, 2 years"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Warranty Details
                        <span className="ml-1 text-xs text-gray-500">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        name="warranty"
                        value={formData.warranty}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                        placeholder="Warranty coverage details"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Return Policy
                        <span className="ml-1 text-xs text-gray-500">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        name="return_policy"
                        value={formData.return_policy}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                        placeholder="e.g., 30 days return policy"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Packaging Details
                      <span className="ml-1 text-xs text-gray-500">(Optional)</span>
                    </label>
                    <textarea
                      name="packaging_details"
                      rows="3"
                      value={formData.packaging_details}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                      placeholder="Describe how the product is packaged..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Information
                      <span className="ml-1 text-xs text-gray-500">(Optional)</span>
                    </label>
                    <textarea
                      name="additional_info"
                      rows="3"
                      value={formData.additional_info}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                      placeholder="Any additional information about the product..."
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <input
                        id="is_featured"
                        name="is_featured"
                        type="checkbox"
                        checked={formData.is_featured}
                        onChange={handleChange}
                        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor="is_featured"
                        className="text-sm font-medium text-gray-900"
                      >
                        Feature this product on homepage
                      </label>
                    </div>

                    <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg border border-green-200">
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

                    <div className="flex items-center space-x-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <input
                        id="is_new"
                        name="is_new"
                        type="checkbox"
                        checked={formData.is_new}
                        onChange={handleChange}
                        className="h-5 w-5 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor="is_new"
                        className="text-sm font-medium text-gray-900"
                      >
                        Mark as new product (recommended for condition: New)
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-8 border-t border-gray-200 mt-8">
              <div className="flex space-x-3">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex items-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium"
                  >
                    <ChevronLeftIcon className="h-4 w-4" />
                    <span>Previous</span>
                  </button>
                )}
              </div>

              <div className="flex space-x-3">
                {currentStep < steps.length ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={!validateStep(currentStep)}
                    className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>Next</span>
                    <ChevronRightIcon className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleFinalSubmit}
                    disabled={loading}
                    className="flex items-center space-x-2 px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>{product ? "Updating..." : "Creating..."}</span>
                      </>
                    ) : (
                      <>
                        <CheckCircleIcon className="h-4 w-4" />
                        <span>{product ? "Update Product" : "Create Listing"}</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductForm;