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
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  InformationCircleIcon
} from "@heroicons/react/24/outline";

const ProductForm = ({ product = null, onSuccess, onCancel }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price || "",
    quantity: product?.quantity || 0,
    category_id: product?.category_id || "",
    specifications: product?.specifications || {},
    moq: product?.moq || 1,
    min_order_unit: product?.min_order_unit || "piece",
    lead_time: product?.lead_time || "",
    is_active: product?.is_active ?? true,
    seller_id: product?.seller_id || user?.id,
    brand: product?.brand || "",
    model: product?.model || "",
    color: product?.color || "",
    material: product?.material || "",
    origin: product?.origin || "",
    weight_kg: product?.weight_kg || "",
    warranty: product?.warranty || "",
    warranty_type: product?.warranty_type || "",
    warranty_period: product?.warranty_period || "",
    return_policy: product?.return_policy || "",
    shipping_cost: product?.shipping_cost || "",
    shipping_time: product?.shipping_time || "",
    packaging_details: product?.packaging_details || "",
    additional_info: product?.additional_info || ""
  });
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [error, setError] = useState("");
  const [specInput, setSpecInput] = useState({ key: "", value: "" });
  const [imagePreviews, setImagePreviews] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState(new Set());

  // Available options for dropdowns
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
    { id: 1, title: "Basic Info", description: "Product name and description" },
    { id: 2, title: "Details", description: "Product specifications" },
    { id: 3, title: "Pricing", description: "Price and inventory" },
    { id: 4, title: "Media", description: "Images and specs" },
    { id: 5, title: "Shipping", description: "Delivery and warranty" }
  ];

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

  const handleImageSelect = async (e) => {
  const files = Array.from(e.target.files);
  if (files.length === 0) return;

  try {
    setUploadingImages(true);
    
    const newPreviews = [];
    
    for (const file of files) {
      const uploadFormData = new FormData();
      uploadFormData.append("image", file);
      uploadFormData.append("angle", "default");
      
      console.log("Uploading file:", file.name, file.type, file.size);
      
      const response = await api.post("/products/upload-image", uploadFormData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      
      console.log("Upload response:", response.data);
      
      if (response.data.success) {
        const uploadedImage = response.data.data;
        
        const newPreview = {
          url: uploadedImage.full_url || uploadedImage.url, // Use full_url for display
          tempPath: uploadedImage.url, // Store the path for backend processing
          is_primary: imagePreviews.length === 0 && newPreviews.length === 0,
          angle: uploadedImage.angle || "default",
          isExisting: false
        };
        
        newPreviews.push(newPreview);
      } else {
        console.error("Upload failed:", response.data);
        throw new Error(response.data.message || "Upload failed");
      }
    }
    
    setImagePreviews((prev) => [...prev, ...newPreviews]);
    
  } catch (err) {
    console.error("Failed to upload images:", err);
    console.error("Error details:", err.response?.data);
    
    let errorMessage = "Failed to upload images. Please try again.";
    
    if (err.response?.data?.errors) {
      // Handle validation errors from server
      const errorMessages = Object.values(err.response.data.errors).flat();
      errorMessage = `Upload failed: ${errorMessages.join(", ")}`;
    } else if (err.response?.data?.message) {
      errorMessage = err.response.data.message;
    }
    
    setError(errorMessage);
  } finally {
    setUploadingImages(false);
    e.target.value = ""; // Reset file input
  }
};

  const removeImage = async (index) => {
    const previewToRemove = imagePreviews[index];

    try {
      if (!previewToRemove.isExisting && previewToRemove.url.startsWith("blob:")) {
        URL.revokeObjectURL(previewToRemove.url);
      }

      setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    } catch (err) {
      console.error("Failed to delete image:", err);
    }
  };

  const setPrimaryImage = (index) => {
    setImagePreviews((prev) =>
      prev.map((img, i) => ({
        ...img,
        is_primary: i === index
      }))
    );
  };

  const prepareImagesPayload = () => {
    return imagePreviews.map((img) => ({
      url: img.tempPath || img.url,
      angle: img.angle,
      is_primary: img.is_primary
    }));
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        return formData.name && formData.description && formData.category_id;
      case 2:
        return true; // Details are optional
      case 3:
        return formData.price && formData.quantity && formData.moq;
      case 4:
        return imagePreviews.length > 0;
      case 5:
        return true; // Shipping info is optional
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity),
        moq: parseInt(formData.moq),
        category_id: parseInt(formData.category_id),
        specifications: formData.specifications,
        images: prepareImagesPayload(),
        weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : null,
        shipping_cost: formData.shipping_cost ? parseFloat(formData.shipping_cost) : null,
        brand: formData.brand || null,
        model: formData.model || null,
        color: formData.color || null,
        material: formData.material || null,
        origin: formData.origin || null,
        warranty: formData.warranty || null,
        warranty_type: formData.warranty_type || null,
        warranty_period: formData.warranty_period || null,
        return_policy: formData.return_policy || null,
        shipping_time: formData.shipping_time || null,
        packaging_details: formData.packaging_details || null,
        additional_info: formData.additional_info || null
      };

      let response;
      if (product) {
        response = await api.put(`/products/${product.id}`, payload);
      } else {
        response = await api.post("/products", payload);
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-8">
          <div className="px-8 py-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {product ? "Edit Product" : "Add New Product"}
                </h1>
                <p className="text-gray-600 mt-1">
                  {product ? "Update your product details" : "Create a new product listing in a few simple steps"}
                </p>
              </div>
              <button
                onClick={onCancel}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center flex-1">
                  <button
                    onClick={() => goToStep(step.id)}
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 font-semibold text-sm transition-all ${
                      currentStep === step.id
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
                    <div className={`text-sm font-medium ${
                      currentStep === step.id ? "text-green-600" : 
                      completedSteps.has(step.id) ? "text-gray-900" : "text-gray-500"
                    }`}>
                      {step.title}
                    </div>
                    <div className="text-xs text-gray-500 hidden sm:block">
                      {step.description}
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-4 ${
                      completedSteps.has(step.id) ? "bg-green-500" : "bg-gray-300"
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
          {error && (
            <div className="mx-8 mt-8 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-start">
              <InformationCircleIcon className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-8">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">Basic Information</h2>
                  <p className="text-gray-600">Tell us about your product</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                    placeholder="Enter product name"
                  />
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                      placeholder="e.g., 3-5 days, 1 week"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Product Details */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">Product Details</h2>
                  <p className="text-gray-600">Additional product information</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Brand
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Weight (kg)
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Info
                    </label>
                    <textarea
                      name="additional_info"
                      rows="3"
                      value={formData.additional_info}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                      placeholder="Any additional product information..."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Pricing & Inventory */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">Pricing & Inventory</h2>
                  <p className="text-gray-600">Set your pricing and stock information</p>
                </div>

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
                        className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
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
            )}

            {/* Step 4: Media & Specifications */}
            {currentStep === 4 && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">Media & Specifications</h2>
                  <p className="text-gray-600">Add images and product specifications</p>
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Product Images *
                  </label>
                  
                  <label className="block w-full h-40 border-2 border-dashed border-gray-300 rounded-xl hover:border-green-500 transition-all duration-200 cursor-pointer bg-gray-50 hover:bg-green-50">
                    <div className="flex flex-col items-center justify-center h-full">
                      {uploadingImages ? (
                        <div className="flex items-center space-x-2">
                          <CloudArrowUpIcon className="h-8 w-8 text-green-500 animate-pulse" />
                          <span className="text-green-600">Uploading...</span>
                        </div>
                      ) : (
                        <>
                          <PhotoIcon className="h-10 w-10 text-gray-400 mb-2" />
                          <span className="text-base font-medium text-gray-600">
                            Click to upload images
                          </span>
                          <span className="text-sm text-gray-500 mt-1">
                            PNG, JPG, WebP up to 5MB each
                          </span>
                        </>
                      )}
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

                  {/* Image Previews */}
                  {imagePreviews.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-sm font-medium text-gray-700 mb-3">
                        Uploaded Images ({imagePreviews.length})
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
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

                {/* Specifications */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Product Specifications
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

            {/* Step 5: Shipping & Warranty */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">Shipping & Warranty</h2>
                  <p className="text-gray-600">Set shipping details and warranty information</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Shipping Cost (MMK)
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
                      Return Policy
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Warranty Details
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
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Packaging Details
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
                    type="submit"
                    disabled={loading || uploadingImages}
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
                        <span>{product ? "Update Product" : "Create Product"}</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductForm;