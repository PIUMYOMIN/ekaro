import React, { useState, useEffect, useRef } from "react";
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
  ExclamationCircleIcon,
  CloudArrowUpIcon,
  ArrowsUpDownIcon,
  EyeIcon,
  StarIcon,
  PencilIcon
} from "@heroicons/react/24/outline";

// Local storage keys for draft
const STORAGE_KEYS = {
  PRODUCT_DRAFT: "product_draft",
  IMAGE_PREVIEWS: "product_image_previews"
};

// Image angle options
const IMAGE_ANGLES = [
  { value: "front", label: "Front View", icon: "👁️" },
  { value: "back", label: "Back View", icon: "↩️" },
  { value: "side", label: "Side View", icon: "↔️" },
  { value: "top", label: "Top View", icon: "⬆️" },
  { value: "default", label: "Other View", icon: "📷" }
];

// Image validation
const validateImageFile = (file) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/gif", "image/webp"];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, message: "Invalid image format. Use JPEG, PNG, GIF, or WebP." };
  }

  if (file.size > maxSize) {
    return { valid: false, message: "Image size should be less than 5MB." };
  }

  return { valid: true, message: "" };
};

const ProductForm = ({ product = null, onSuccess, onCancel }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Default form data
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

  // Initialize form from product or saved draft
  const [formData, setFormData] = useState(() => {
    if (product) {
      return { ...defaultFormData, ...product };
    }
    const savedDraft = localStorage.getItem(STORAGE_KEYS.PRODUCT_DRAFT);
    if (savedDraft) {
      try {
        return { ...defaultFormData, ...JSON.parse(savedDraft) };
      } catch (error) {
        console.error("Error loading draft:", error);
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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [draggedImage, setDraggedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  // Product condition options
  const productConditions = [
    { value: "new", label: "New", description: "Brand new, never used" },
    { value: "used_like_new", label: "Used - Like New", description: "Used but looks and functions like new" },
    { value: "used_good", label: "Used - Good", description: "Used with minor signs of wear" },
    { value: "used_fair", label: "Used - Fair", description: "Used with visible signs of wear" }
  ];

  // Minimum order units
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

  // Warranty types
  const warrantyTypes = [
    { value: "manufacturer", label: "Manufacturer Warranty" },
    { value: "seller", label: "Seller Warranty" },
    { value: "international", label: "International Warranty" },
    { value: "no_warranty", label: "No Warranty" }
  ];

  // Steps configuration
  const steps = [
    { id: 1, title: "Basic Info", description: "Product details" },
    { id: 2, title: "Pricing", description: "Price and inventory" },
    { id: 3, title: "Media", description: "Images and specs" },
    { id: 4, title: "Shipping & More", description: "Delivery and details" }
  ];

  // ----- Image management functions -----
  const setPrimaryImage = (index) => {
    setImagePreviews(prev => prev.map((img, i) => ({
      ...img,
      is_primary: i === index
    })));
  };

  const removeImage = (index) => {
    setImagePreviews(prev => {
      const newPreviews = prev.filter((_, i) => i !== index);
      // If primary image was removed, set first remaining as primary
      if (prev[index].is_primary && newPreviews.length > 0) {
        newPreviews[0].is_primary = true;
      }
      return newPreviews;
    });
  };

  const handleDragStart = (index) => setDraggedImage(index);
  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (index) => {
    if (draggedImage === null || draggedImage === index) return;
    const newPreviews = [...imagePreviews];
    const draggedItem = newPreviews[draggedImage];
    newPreviews.splice(draggedImage, 1);
    newPreviews.splice(index, 0, draggedItem);
    setImagePreviews(newPreviews);
    setDraggedImage(null);
  };

  const updateImageAngle = (index, angle) => {
    setImagePreviews(prev => prev.map((img, i) =>
      i === index ? { ...img, angle } : img
    ));
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const validFiles = [];
    const errors = [];

    files.forEach((file) => {
      const validation = validateImageFile(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        errors.push(`${file.name}: ${validation.message}`);
      }
    });

    if (errors.length > 0) {
      setError(`Some images were rejected:\n${errors.join("\n")}`);
    }

    if (validFiles.length > 0) {
      const newPreviews = validFiles.map((file, index) => ({
        url: URL.createObjectURL(file),
        file,
        is_primary: imagePreviews.length === 0 && index === 0,
        angle: "default",
        isExisting: false,
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(2) + " MB"
      }));

      setImagePreviews(prev => [...prev, ...newPreviews]);
    }

    e.target.value = "";
  };

  const addImageFromUrl = () => {
    const url = prompt("Enter image URL:");
    if (url && url.trim()) {
      const newPreview = {
        url: url.trim(),
        is_primary: imagePreviews.length === 0,
        angle: "default",
        isExisting: false,
        name: "External Image",
        size: "External"
      };
      setImagePreviews(prev => [...prev, newPreview]);
    }
  };

  const clearAllImages = () => {
    if (window.confirm("Are you sure you want to remove all images?")) {
      imagePreviews.forEach(preview => {
        if (!preview.isExisting && preview.url.startsWith("blob:")) {
          URL.revokeObjectURL(preview.url);
        }
      });
      setImagePreviews([]);
    }
  };

  // Upload images to server (returns array of image objects)
  const uploadImagesToServer = async () => {
    if (imagePreviews.length === 0) return [];

    setIsUploadingImages(true);
    setUploadProgress(0);

    const uploadedImages = [];
    const totalImages = imagePreviews.filter(img => img.file).length;
    let uploadedCount = 0;

    for (const preview of imagePreviews) {
      if (preview.file) {
        try {
          const formData = new FormData();
          formData.append("image", preview.file);
          formData.append("angle", preview.angle);

          const uploadResponse = await api.post("/products/upload-image", formData, {
            headers: { "Content-Type": "multipart/form-data" },
            onUploadProgress: (progressEvent) => {
              const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploadProgress(progress);
            }
          });

          if (uploadResponse.data.success) {
            uploadedImages.push({
              url: uploadResponse.data.data.url,
              angle: preview.angle,
              is_primary: preview.is_primary
            });
          }

          uploadedCount++;
          setUploadProgress(Math.round((uploadedCount / totalImages) * 100));
        } catch (err) {
          console.error(`Failed to upload image ${preview.name}:`, err);
        }
      } else if (preview.isExisting) {
        uploadedImages.push({
          url: preview.url,
          angle: preview.angle,
          is_primary: preview.is_primary
        });
      }
    }

    setIsUploadingImages(false);
    setUploadProgress(100);
    return uploadedImages;
  };

  // ----- Form handling -----
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSpecChange = (e) => {
    const { name, value } = e.target;
    setSpecInput(prev => ({ ...prev, [name]: value }));
  };

  const addSpecification = () => {
    if (specInput.key && specInput.value) {
      setFormData(prev => ({
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
    setFormData(prev => {
      const newSpecs = { ...prev.specifications };
      delete newSpecs[key];
      return { ...prev, specifications: newSpecs };
    });
  };

  // Step validation
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

  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const goToStep = (step) => {
    if (completedSteps.has(step - 1) || step === 1) {
      setCurrentStep(step);
    }
  };

  // Final submit
  const handleFinalSubmit = async () => {
    if (loading || isUploadingImages) return;

    setLoading(true);
    setError("");

    try {
      const uploadedImages = await uploadImagesToServer();
      if (imagePreviews.length > 0 && uploadedImages.length === 0) {
        throw new Error("Failed to upload product images. Please try again.");
      }

      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity, 10),
        moq: parseInt(formData.moq, 10),
        category_id: parseInt(formData.category_id, 10),
        specifications: formData.specifications,
        images: uploadedImages,
        discount_price: formData.discount_price ? parseFloat(formData.discount_price) : null,
        name_mm: formData.name_mm || "",
        description_mm: formData.description_mm || "",
        brand: formData.brand || null,
        model: formData.model || null,
        color: formData.color || null,
        material: formData.material || null,
        origin: formData.origin || null,
        weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : null,
        shipping_cost: formData.shipping_cost ? parseFloat(formData.shipping_cost) : null,
        warranty: formData.warranty || null,
        warranty_type: formData.warranty_type || null,
        warranty_period: formData.warranty_period || null,
        return_policy: formData.return_policy || null,
        shipping_time: formData.shipping_time || null,
        packaging_details: formData.packaging_details || null,
        additional_info: formData.additional_info || null,
        lead_time: formData.lead_time || null,
        is_featured: formData.is_featured || false,
        is_new: formData.is_new !== undefined ? formData.is_new : true,
        condition: formData.condition
      };

      let response;
      if (product) {
        response = await api.put(`/seller/products/${product.id}`, payload);
        setSuccessMessage("Product updated successfully!");
      } else {
        response = await api.post("/products", payload);
        setSuccessMessage("Product created successfully!");
      }

      // Clear draft on success
      localStorage.removeItem(STORAGE_KEYS.PRODUCT_DRAFT);
      localStorage.removeItem(STORAGE_KEYS.IMAGE_PREVIEWS);
      setShowSuccessPopup(true);
    } catch (err) {
      console.error("Product submission error:", err);
      if (err.response?.data?.errors) {
        const errorMessages = Object.values(err.response.data.errors).flat();
        setError(errorMessages.join(", "));
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Auto-save draft
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

  // Load categories and existing images
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
          console.error("Error loading image previews:", error);
        }
      }
    }

    fetchCategories();
  }, [product]);

  // Clean up blob URLs on unmount
  useEffect(() => {
    return () => {
      imagePreviews.forEach(preview => {
        if (!preview.isExisting && preview.url.startsWith("blob:")) {
          URL.revokeObjectURL(preview.url);
        }
      });
    };
  }, [imagePreviews]);

  // Redirect after success
  useEffect(() => {
    if (showSuccessPopup) {
      const timer = setTimeout(() => {
        setShowSuccessPopup(false);
        if (onSuccess) {
          onSuccess();
        } else {
          navigate("/seller/products");
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessPopup, onSuccess, navigate]);

  // Cancel handler
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
      navigate("/seller/products");
    }
  };

  // Image preview modal
  const ImagePreviewModal = () => {
    if (!previewImage) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
        <div className="relative max-w-4xl max-h-[90vh] mx-4">
          <button
            onClick={() => setPreviewImage(null)}
            className="absolute top-4 right-4 z-10 p-2 bg-black/50 text-white rounded-full hover:bg-black/75 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
          <img
            src={previewImage}
            alt="Product preview"
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
          />
        </div>
      </div>
    );
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
            <p className="text-gray-600">Tell us about your product (English fields are required)</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name (English) *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Enter product name in English"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name (Myanmar) <span className="text-xs text-gray-500">(Optional)</span>
                </label>
                <input
                  type="text"
                  name="name_mm"
                  value={formData.name_mm}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
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
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Describe your product in detail in English..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Myanmar) <span className="text-xs text-gray-500">(Optional)</span>
                </label>
                <textarea
                  name="description_mm"
                  rows="4"
                  value={formData.description_mm}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
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
                  <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
                    <span className="ml-2 text-gray-600">Loading categories...</span>
                  </div>
                ) : categories.length > 0 ? (
                  <select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select a category</option>
                    {categories.map(parentCategory => (
                      <optgroup key={parentCategory.id} label={parentCategory.name_en}>
                        {parentCategory.children && parentCategory.children.length > 0 ? (
                          parentCategory.children.map(child => (
                            <option key={child.id} value={child.id}>{child.name_en}</option>
                          ))
                        ) : (
                          <option disabled>No sub-categories</option>
                        )}
                      </optgroup>
                    ))}
                  </select>
                ) : (
                  <div className="text-center py-4 bg-gray-50 rounded-lg border border-gray-300">
                    <p className="text-gray-600">No categories available</p>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">Select a sub-category for your product.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Condition *
                </label>
                <select
                  name="condition"
                  value={formData.condition}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  {productConditions.map(condition => (
                    <option key={condition.value} value={condition.value}>
                      {condition.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {productConditions.find(c => c.value === formData.condition)?.description}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand <span className="text-xs text-gray-500">(Optional)</span>
                </label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Product brand"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Model <span className="text-xs text-gray-500">(Optional)</span>
                </label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Model number/name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color <span className="text-xs text-gray-500">(Optional)</span>
                </label>
                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Product color"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Material <span className="text-xs text-gray-500">(Optional)</span>
                </label>
                <input
                  type="text"
                  name="material"
                  value={formData.material}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Primary material"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Origin <span className="text-xs text-gray-500">(Optional)</span>
                </label>
                <input
                  type="text"
                  name="origin"
                  value={formData.origin}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Country of origin"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Pricing & Inventory</h2>
            <p className="text-gray-600">Set your pricing and stock information</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (MMK) *
                </label>
                <input
                  type="number"
                  name="price"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount Price (MMK) <span className="text-xs text-gray-500">(Optional)</span>
                </label>
                <input
                  type="number"
                  name="discount_price"
                  step="0.01"
                  min="0"
                  value={formData.discount_price}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="0.00"
                />
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
                  value={formData.quantity}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
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
                  value={formData.moq}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Minimum order quantity"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order Unit *
                </label>
                <select
                  name="min_order_unit"
                  value={formData.min_order_unit}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  {minOrderUnits.map(unit => (
                    <option key={unit.value} value={unit.value}>{unit.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lead Time <span className="text-xs text-gray-500">(Optional)</span>
                </label>
                <input
                  type="text"
                  name="lead_time"
                  value={formData.lead_time}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., 3-5 days, 1 week"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weight (kg) <span className="text-xs text-gray-500">(Optional)</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  name="weight_kg"
                  value={formData.weight_kg}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Product weight in kilograms"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-8">
            <h2 className="text-lg font-semibold text-gray-900">Media & Specifications</h2>
            <p className="text-gray-600">Add images and product specifications</p>

            {/* Image Upload Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">
                  Product Images *
                  <span className="ml-2 text-xs font-normal text-gray-500">
                    {imagePreviews.length} image(s)
                  </span>
                </label>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={addImageFromUrl}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Add from URL
                  </button>
                  {imagePreviews.length > 0 && (
                    <button
                      type="button"
                      onClick={clearAllImages}
                      className="px-3 py-1.5 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
                    >
                      Clear All
                    </button>
                  )}
                </div>
              </div>

              {isUploadingImages && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-700">Uploading images...</span>
                    <span className="text-sm text-blue-600">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <label className="block w-full h-40 border-2 border-dashed border-gray-300 rounded-xl hover:border-green-500 transition-all cursor-pointer bg-gray-50 hover:bg-green-50 group">
                <div className="flex flex-col items-center justify-center h-full p-4">
                  <CloudArrowUpIcon className="h-10 w-10 text-gray-400 mb-2 group-hover:text-green-500" />
                  <span className="text-base font-medium text-gray-600 group-hover:text-green-600">
                    {imagePreviews.length > 0 ? "Add more images" : "Click to upload images"}
                  </span>
                  <span className="text-sm text-gray-500 mt-1 text-center">
                    Drag & drop or click to browse<br />PNG, JPG, WebP up to 5MB each
                  </span>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </label>

              {imagePreviews.length > 0 && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-gray-700">
                      Uploaded Images ({imagePreviews.length})
                    </h3>
                    <span className="text-xs text-gray-500 flex items-center">
                      <ArrowsUpDownIcon className="h-4 w-4 mr-1" /> Drag to reorder
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {imagePreviews.map((image, index) => (
                      <div
                        key={index}
                        className={`relative group rounded-lg overflow-hidden border-2 transition-all ${
                          image.is_primary
                            ? "border-green-500 ring-2 ring-green-200"
                            : "border-gray-200 hover:border-green-300"
                        } ${draggedImage === index ? "opacity-50" : ""}`}
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={handleDragOver}
                        onDrop={() => handleDrop(index)}
                      >
                        <div className="aspect-square bg-gray-100 relative">
                          <img
                            src={image.url}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover cursor-pointer"
                            onClick={() => setPreviewImage(image.url)}
                          />
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                            <div className="text-white text-xs truncate">{image.name || `Image ${index + 1}`}</div>
                            <div className="text-white/70 text-xs">{image.size}</div>
                          </div>

                          {image.is_primary && (
                            <div className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded-full flex items-center">
                              <CheckCircleIcon className="h-3 w-3 mr-1" /> Primary
                            </div>
                          )}

                          <div className="absolute top-2 right-2">
                            <select
                              value={image.angle}
                              onChange={(e) => updateImageAngle(index, e.target.value)}
                              className="text-xs bg-black/60 text-white border-none rounded px-1.5 py-0.5 focus:ring-0"
                            >
                              {IMAGE_ANGLES.map(angle => (
                                <option key={angle.value} value={angle.value}>
                                  {angle.icon} {angle.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                            <div className="flex flex-col space-y-2">
                              <button
                                type="button"
                                onClick={() => setPrimaryImage(index)}
                                className={`px-3 py-1.5 rounded text-xs flex items-center ${
                                  image.is_primary
                                    ? "bg-green-600 text-white"
                                    : "bg-white text-gray-700 hover:bg-gray-100"
                                }`}
                              >
                                {image.is_primary ? (
                                  <>
                                    <CheckCircleIcon className="h-3 w-3 mr-1" /> Primary
                                  </>
                                ) : (
                                  <>
                                    <StarIcon className="h-3 w-3 mr-1" /> Set Primary
                                  </>
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="px-3 py-1.5 bg-red-600 text-white rounded text-xs flex items-center hover:bg-red-700"
                              >
                                <TrashIcon className="h-3 w-3 mr-1" /> Remove
                              </button>
                              <button
                                type="button"
                                onClick={() => setPreviewImage(image.url)}
                                className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs flex items-center hover:bg-blue-700"
                              >
                                <EyeIcon className="h-3 w-3 mr-1" /> Preview
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="absolute top-1 left-1 p-1 bg-black/50 rounded text-white opacity-0 group-hover:opacity-100">
                          <ArrowsUpDownIcon className="h-3 w-3" />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-800 mb-1">Image Tips:</h4>
                    <ul className="text-xs text-blue-600 space-y-1">
                      <li>• Set the best image as primary (will be shown first)</li>
                      <li>• Use different angles (front, back, side) for better presentation</li>
                      <li>• Ensure images are well-lit and in focus</li>
                      <li>• Drag and drop to reorder images</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Specifications */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Product Specifications <span className="text-xs text-gray-500">(Optional)</span>
              </label>

              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  <div className="md:col-span-2">
                    <input
                      type="text"
                      name="key"
                      placeholder="Specification name (e.g., Material, Size)"
                      value={specInput.key}
                      onChange={handleSpecChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <input
                      type="text"
                      name="value"
                      placeholder="Specification value (e.g., Cotton, XL)"
                      value={specInput.value}
                      onChange={handleSpecChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={addSpecification}
                      disabled={!specInput.key || !specInput.value}
                      className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      <PlusIcon className="h-4 w-4 mr-1" /> Add
                    </button>
                  </div>
                </div>
              </div>

              {Object.keys(formData.specifications).length > 0 ? (
                <div className="space-y-2">
                  {Object.entries(formData.specifications).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-3 hover:border-green-500 transition-colors group"
                    >
                      <div className="flex-1 flex items-center">
                        <span className="font-medium text-gray-900 min-w-[120px]">{key}:</span>
                        <span className="text-gray-600 ml-2">{value}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeSpecification(key)}
                        className="text-red-600 hover:text-red-800 p-1 rounded-lg hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                        title="Remove specification"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg">
                  <PencilIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>No specifications added yet.</p>
                  <p className="text-sm mt-1">Add details like dimensions, materials, etc.</p>
                </div>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Shipping & More</h2>
            <p className="text-gray-600">Set shipping details, warranty, and other information</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shipping Cost (MMK) <span className="text-xs text-gray-500">(Optional)</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  name="shipping_cost"
                  value={formData.shipping_cost}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Shipping cost"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shipping Time <span className="text-xs text-gray-500">(Optional)</span>
                </label>
                <input
                  type="text"
                  name="shipping_time"
                  value={formData.shipping_time}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., 3-5 business days"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Warranty Type <span className="text-xs text-gray-500">(Optional)</span>
                </label>
                <select
                  name="warranty_type"
                  value={formData.warranty_type}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select warranty type</option>
                  {warrantyTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Warranty Period <span className="text-xs text-gray-500">(Optional)</span>
                </label>
                <input
                  type="text"
                  name="warranty_period"
                  value={formData.warranty_period}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., 12 months, 2 years"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Warranty Details <span className="text-xs text-gray-500">(Optional)</span>
                </label>
                <input
                  type="text"
                  name="warranty"
                  value={formData.warranty}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Warranty coverage details"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Return Policy <span className="text-xs text-gray-500">(Optional)</span>
                </label>
                <input
                  type="text"
                  name="return_policy"
                  value={formData.return_policy}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., 30 days return policy"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Packaging Details <span className="text-xs text-gray-500">(Optional)</span>
              </label>
              <textarea
                name="packaging_details"
                rows="3"
                value={formData.packaging_details}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="Describe how the product is packaged..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Information <span className="text-xs text-gray-500">(Optional)</span>
              </label>
              <textarea
                name="additional_info"
                rows="3"
                value={formData.additional_info}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
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
                <label htmlFor="is_featured" className="text-sm font-medium text-gray-900">
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
                <label htmlFor="is_active" className="text-sm font-medium text-gray-900">
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
                <label htmlFor="is_new" className="text-sm font-medium text-gray-900">
                  Mark as new product (recommended for condition: New)
                </label>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <ImagePreviewModal />

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-xl">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircleIcon className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Success!</h3>
              <p className="text-gray-600 mb-6">{successMessage}</p>
              <p className="text-sm text-gray-500">Redirecting...</p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with progress */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-8">
          <div className="px-8 py-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {product ? "Edit Product" : "New Listing"}
                </h1>
                <p className="text-gray-600 mt-1">
                  {product ? "Update your product details" : "Create a new product listing"}
                  {!product && <span className="text-blue-600 text-sm ml-2">• Draft auto-saved</span>}
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

          {/* Step indicators */}
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
                    <div className={`text-sm font-medium ${currentStep === step.id ? "text-green-600" : completedSteps.has(step.id) ? "text-gray-900" : "text-gray-500"}`}>
                      {step.title}
                    </div>
                    <div className="text-xs text-gray-500 hidden sm:block">{step.description}</div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-4 ${completedSteps.has(step.id) ? "bg-green-500" : "bg-gray-300"}`} />
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
              <ExclamationCircleIcon className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="p-8">{renderStepContent()}</div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center px-8 py-6 border-t border-gray-200">
            <div className="flex space-x-3">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex items-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium"
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
                  className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>Next</span>
                  <ChevronRightIcon className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  disabled={loading || isUploadingImages}
                  className="flex items-center space-x-2 px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading || isUploadingImages ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>{isUploadingImages ? "Uploading Images..." : product ? "Updating..." : "Creating..."}</span>
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
  );
};

export default ProductForm;