// pages/seller/ProductForm.js
import React, { useState, useEffect, useRef, useCallback } from "react";
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
  PencilIcon,
} from "@heroicons/react/24/outline";

// Local storage keys for draft
const STORAGE_KEYS = {
  PRODUCT_DRAFT: "product_draft",
  IMAGE_PREVIEWS: "product_image_previews",
};

// Image angle options
const IMAGE_ANGLES = [
  { value: "front", label: "Front View", icon: "👁️" },
  { value: "back", label: "Back View", icon: "↩️" },
  { value: "side", label: "Side View", icon: "↔️" },
  { value: "top", label: "Top View", icon: "⬆️" },
  { value: "default", label: "Other View", icon: "📷" },
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

// Helper to get full URL for image preview
const getImageUrl = (url) => {
  if (!url) return "";
  
  // If the URL is already absolute (starts with http), return it as is
  if (url.startsWith("http")) return url;
  
  // Otherwise, construct the full URL using the image base URL
  const imageBaseUrl = import.meta.env.VITE_IMAGE_BASE_URL;
  if (imageBaseUrl) {

    const cleanUrl = url.startsWith('/') ? url.slice(1) : url;
    return `${imageBaseUrl}/${cleanUrl}`;
  }
  

  const apiUrl = import.meta.env.VITE_API_URL;
  if (apiUrl) {
    const cleanUrl = url.startsWith('/') ? url.slice(1) : url;
    return `${apiUrl}/storage/${cleanUrl}`;
  }
  
  // Last resort: return the url as is
  return url;
};

// Helper to sanitize product data: convert null string fields to empty string
const sanitizeProductData = (data) => {
  const sanitized = { ...data };
  const stringFields = [
    "name_en", "name_mm", "description_en", "description_mm", "brand", "model",
    "color", "material", "origin", "warranty", "warranty_type", "warranty_period",
    "return_policy", "shipping_time", "packaging_details", "additional_info", "lead_time"
  ];
  stringFields.forEach(field => {
    if (sanitized[field] === null || sanitized[field] === undefined) {
      sanitized[field] = "";
    }
  });
  return sanitized;
};

const ProductForm = ({ product = null, onSuccess, onCancel }) => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  // Show Myanmar name when locale is 'my'
  const catName = (c) => i18n.language === 'my' ? (c.name_mm || c.name_en) : c.name_en;
  const isMounted   = useRef(true);  // guards success timer against post-unmount state update
  const [cancelModal, setCancelModal] = useState(false); // replaces window.confirm

  // Default form data
  const defaultFormData = {
    name_en: "",
    name_mm: "",
    description_en: "",
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
    discount_end: "",
  };

  // Initialize form from product or saved draft
  const [formData, setFormData] = useState(() => {
    if (product) {
      // Remove images from formData because they are handled separately
      const { images, ...rest } = product;
      return { ...defaultFormData, ...rest };
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
  const [catError, setCatError] = useState(false);
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
  // FIX: tracks whether the seller changed images in this session.
  // When editing, if images were not touched we skip sending `images` in the
  // payload so the backend preserves existing images unchanged.
  const [imagesModified, setImagesModified] = useState(false);
  // FIX: replaces window.prompt() in addImageFromUrl
  const [urlInput, setUrlInput] = useState("");

  // Product condition options
  const productConditions = [
    { value: "new", label: "New", description: "Brand new, never used" },
    { value: "used_like_new", label: "Used - Like New", description: "Used but looks and functions like new" },
    { value: "used_good", label: "Used - Good", description: "Used with minor signs of wear" },
    { value: "used_fair", label: "Used - Fair", description: "Used with visible signs of wear" },
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
    { value: "pallet", label: "Pallet" },
  ];

  // Warranty types
  const warrantyTypes = [
    { value: "manufacturer", label: "Manufacturer Warranty" },
    { value: "seller", label: "Seller Warranty" },
    { value: "international", label: "International Warranty" },
    { value: "no_warranty", label: "No Warranty" },
  ];

  // Steps configuration
  const steps = [
    { id: 1, title: "Basic Info", description: "Product details" },
    { id: 2, title: "Pricing", description: "Price and inventory" },
    { id: 3, title: "Media", description: "Images and specs" },
    { id: 4, title: "Shipping & More", description: "Delivery and details" },
  ];

  // ----- Image management functions -----
  const setPrimaryImage = (index) => {
    setImagesModified(true);
    setImagePreviews((prev) =>
      prev.map((img, i) => ({
        ...img,
        is_primary: i === index,
      }))
    );
  };

  const removeImage = (index) => {
    setImagesModified(true);
    setImagePreviews((prev) => {
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
    setImagesModified(true);
    const newPreviews = [...imagePreviews];
    const draggedItem = newPreviews[draggedImage];
    newPreviews.splice(draggedImage, 1);
    newPreviews.splice(index, 0, draggedItem);
    setImagePreviews(newPreviews);
    setDraggedImage(null);
  };

  const updateImageAngle = (index, angle) => {
    setImagesModified(true);
    setImagePreviews((prev) =>
      prev.map((img, i) => (i === index ? { ...img, angle } : img))
    );
  };

  const handleImageSelect = async (e) => {
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

    if (validFiles.length === 0) return;

    setIsUploadingImages(true);
    setUploadProgress(0);

    const totalBytes = validFiles.reduce((sum, f) => sum + f.size, 0);
    const uploadedBytes = new Array(validFiles.length).fill(0);

    const uploadOne = async (file, index) => {
      const fd = new FormData();
      fd.append("image", file);
      fd.append("angle", "default");

      try {
        const response = await api.post("/seller/products/upload-image", fd, {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            uploadedBytes[index] = progressEvent.loaded;
            const totalUploaded = uploadedBytes.reduce((a, b) => a + b, 0);
            setUploadProgress(Math.round((totalUploaded / totalBytes) * 100));
          },
        });

        if (response.data.success) {
          const imageData = response.data.data;
          // FIX: store both the display url (absolute) AND the submission path
          // (relative temp path). On submit we send `path` not `url` so the
          // backend receives the relative temp path it can move to permanent storage.
          return {
            url:        imageData.url,   // relative temp path — getImageUrl() builds the display URL
            path:       imageData.url,   // same value; named clearly for submit logic
            file:       null,
            is_primary: imagePreviews.length === 0 && index === 0,
            angle:      imageData.angle,
            isExisting: false,
            name:       file.name,
            size:       (file.size / (1024 * 1024)).toFixed(2) + " MB",
          };
        }
        return null;
      } catch (err) {
        console.error(`Failed to upload image ${file.name}:`, err);
        setError(`Failed to upload ${file.name}: ${err.message}`);
        return null;
      }
    };

    const results = await Promise.all(validFiles.map((file, i) => uploadOne(file, i)));
    const newPreviews = results.filter(Boolean);

    setImagesModified(true);
    setImagePreviews((prev) => [...prev, ...newPreviews]);
    setIsUploadingImages(false);
    e.target.value = "";
  };

  const addImageFromUrl = () => {
    const url = urlInput.trim();
    if (!url) return;
    const newPreview = {
      url,
      path:       url,   // external URL used as-is by backend
      is_primary: imagePreviews.length === 0,
      angle:      "default",
      isExisting: false,
      name:       "External Image",
      size:       "External",
    };
    setImagesModified(true);
    setImagePreviews((prev) => [...prev, newPreview]);
    setUrlInput("");
  };

  const clearAllImages = () => {

    setCancelModal('clear-images');
  };

  const confirmClearImages = () => {
    setImagePreviews([]);
    setImagesModified(true);
    setCancelModal(false);
  };

  // ----- Form handling -----
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
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
          [specInput.key]: specInput.value,
        },
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

  // Step validation
  const validateStep = (step) => {
    switch (step) {
      case 1:
        return formData.name_en && formData.description_en && formData.category_id;
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
      setCompletedSteps((prev) => new Set(prev).add(currentStep));
      setCurrentStep((prev) => Math.min(prev + 1, steps.length));
    }
  };

  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

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
      const payload = {
        ...formData,
        price:        parseFloat(formData.price),
        quantity:     parseInt(formData.quantity, 10),
        moq:          parseInt(formData.moq, 10),
        category_id:  parseInt(formData.category_id, 10),
        specifications: formData.specifications,
        discount_price: formData.discount_price ? parseFloat(formData.discount_price) : null,
        weight_kg:    formData.weight_kg    ? parseFloat(formData.weight_kg)    : null,
        shipping_cost: formData.shipping_cost ? parseFloat(formData.shipping_cost) : null,
        is_featured:  formData.is_featured  || false,
        is_new:       formData.is_new       !== undefined ? formData.is_new : true,
        condition:    formData.condition,
      };

      // FIX: only include `images` in the payload if the seller actually changed them.
      //
      // On create:  always send images (required for a new product).
      // On edit:    send images ONLY when imagesModified is true.
      //             If images were not touched the backend preserves the existing
      //             images column unchanged — nothing is deleted, nothing is renamed.
      //
      // When we DO send images, use `path` (the relative storage path) not `url`
      // (which is the absolute display URL). The backend matches existing images by
      // their stored relative path and moves temp images from products/temp/{uid}/
      // to products/{uid}/.
      if (!product || imagesModified) {
        payload.images = imagePreviews.map((preview) => ({
          url:        preview.path || preview.url,  // relative path takes priority
          angle:      preview.angle,
          is_primary: preview.is_primary,
        }));
      }
      // else: no `images` key → backend preserves existing images

      let response;
      if (product) {
        response = await api.put(`/seller/products/${product.id}`, payload);
        setSuccessMessage("Product updated successfully!");
      } else {
        response = await api.post("/seller/products", payload);
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

  useEffect(() => {
    if (!product) {
      try {
        const draftToSave = { ...formData };
        delete draftToSave.seller_id;
        localStorage.setItem(STORAGE_KEYS.PRODUCT_DRAFT, JSON.stringify(draftToSave));
      } catch {
        // Quota exceeded — draft not saved, that's acceptable
        console.warn("Draft auto-save skipped: localStorage quota exceeded");
      }
    }
  }, [formData, product]);

  useEffect(() => {
    if (!product) {
      try {
        const previewsToSave = imagePreviews.map((preview) => ({
          url:        preview.url,
          is_primary: preview.is_primary,
          angle:      preview.angle,
          isExisting: preview.isExisting,
        }));
        localStorage.setItem(STORAGE_KEYS.IMAGE_PREVIEWS, JSON.stringify(previewsToSave));
      } catch {
        console.warn("Image preview auto-save skipped: localStorage quota exceeded");
      }
    }
  }, [imagePreviews, product]);

  // Hoisted so retry button can call it
  const fetchCategories = useCallback(async () => {
    setLoadingCategories(true);
    setCatError(false);
    try {
      const response = await api.get("/categories/all");
      if (response.data.success && Array.isArray(response.data.data)) {
        setCategories(response.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      setCatError(true);
    } finally {
      setLoadingCategories(false);
    }
  }, []);

  // Load categories and existing images for edit
   useEffect(() => {

    const _fetchProductForEdit = async () => {
      if (!product || !product.id) return;
      try {
        const response = await api.get(`/seller/products/${product.id}/edit`);
        const productData = response.data.data;

        // Sanitize null values
        const sanitizedData = sanitizeProductData(productData);

        // FIX: getProductForEdit now returns both `url` (absolute, for display)
        // and `path` (relative, for submission). We store both so:
        //   - <img src={getImageUrl(image.url)}> works immediately
        //   - handleFinalSubmit sends image.path (relative) to the backend
        const images = productData.images || [];
        const previews = images.map((img, idx) => ({
          url:        img.url,              // absolute URL for display
          path:       img.path || img.url,  // relative path for submission (backend provides `path`)
          is_primary: img.is_primary || idx === 0,
          angle:      img.angle || "default",
          isExisting: true,
          name:       img.url.split("/").pop(),
          size:       "Existing",
        }));
        setImagePreviews(previews);
        // imagesModified stays false — seller hasn't touched images yet

        // Set form data, remove images field
        const { images: _, ...rest } = sanitizedData;
        setFormData((prev) => ({ ...prev, ...rest }));
      } catch (err) {
        console.error("Error loading product for edit:", err);
        setError("Failed to load product details.");
      }
    };

    if (product && product.id) {
      _fetchProductForEdit();
    } else {
      // New product: load draft from local storage
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

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Redirect after success
  useEffect(() => {
    if (showSuccessPopup) {
      const timer = setTimeout(() => {

        if (!isMounted.current) return;
        setShowSuccessPopup(false);
        if (onSuccess) {
          onSuccess();
        } else {
          navigate("/seller/dashboard");
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessPopup, onSuccess, navigate]);


  const handleCancel = () => {
    if (!product) {

      setCancelModal('leave');
      return;
    }
    if (onCancel) {
      onCancel();
    } else {
      navigate("/seller/dashboard");
    }
  };

  const confirmCancel = () => {
    setCancelModal(false);
    if (onCancel) {
      onCancel();
    } else {
      navigate("/seller/dashboard");
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
            src={getImageUrl(previewImage)}
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
            <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Basic Information</h2>
            <p className="text-gray-600 dark:text-slate-400">Tell us about your product (English fields are required)</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Product Name (English) *
                </label>
                <input
                  type="text"
                  name="name_en"
                  value={formData.name_en}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
                  placeholder="Enter product name in English"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Product Name (Myanmar) <span className="text-xs text-gray-500 dark:text-slate-500">(Optional)</span>
                </label>
                <input
                  type="text"
                  name="name_mm"
                  value={formData.name_mm}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
                  placeholder="Enter product name in Myanmar"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Description (English) *
                </label>
                <textarea
                  name="description_en"
                  rows="4"
                  value={formData.description_en}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
                  placeholder="Describe your product in detail in English..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Description (Myanmar) <span className="text-xs text-gray-500 dark:text-slate-500">(Optional)</span>
                </label>
                <textarea
                  name="description_mm"
                  rows="4"
                  value={formData.description_mm}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
                  placeholder="Describe your product in detail in Myanmar..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Category *
                </label>
                {loadingCategories ? (
                  <div className="flex items-center p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
                    <span className="ml-2 text-gray-600 dark:text-slate-400">Loading categories...</span>
                  </div>
                ) : categories.length > 0 ? (
                  <select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
                  >
                    <option value="">Select a category</option>
                    {categories.map((parentCategory) => (
                      <optgroup key={parentCategory.id} label={catName(parentCategory)}>
                        {parentCategory.children && parentCategory.children.length > 0 ? (
                          parentCategory.children.map((child) => (
                            <option key={child.id} value={child.id}>
                              {catName(child)}
                            </option>
                          ))
                        ) : (
                          <option disabled>No sub-categories</option>
                        )}
                      </optgroup>
                    ))}
                  </select>
                ) : (
                  <div className="text-center py-4 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-300 dark:border-slate-600">
                    <p className="text-gray-500 dark:text-slate-400 text-sm mb-2">
                      {catError ? 'Failed to load categories.' : 'No categories available.'}
                    </p>
                    <button type="button" onClick={fetchCategories}
                      className="text-xs text-green-700 dark:text-green-400 underline hover:text-green-900 dark:hover:text-green-300">
                      Try again
                    </button>
                  </div>
                )}
                <p className="text-xs text-gray-500 dark:text-slate-500 mt-1">Select a sub-category for your product.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Condition *
                </label>
                <select
                  name="condition"
                  value={formData.condition}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
                >
                  {productConditions.map((condition) => (
                    <option key={condition.value} value={condition.value}>
                      {condition.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 dark:text-slate-500 mt-1">
                  {productConditions.find((c) => c.value === formData.condition)?.description}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Brand <span className="text-xs text-gray-500 dark:text-slate-500">(Optional)</span>
                </label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
                  placeholder="Product brand"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Model <span className="text-xs text-gray-500 dark:text-slate-500">(Optional)</span>
                </label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
                  placeholder="Model number/name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Color <span className="text-xs text-gray-500 dark:text-slate-500">(Optional)</span>
                </label>
                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
                  placeholder="Product color"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Material <span className="text-xs text-gray-500 dark:text-slate-500">(Optional)</span>
                </label>
                <input
                  type="text"
                  name="material"
                  value={formData.material}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
                  placeholder="Primary material"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Origin <span className="text-xs text-gray-500 dark:text-slate-500">(Optional)</span>
                </label>
                <input
                  type="text"
                  name="origin"
                  value={formData.origin}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
                  placeholder="Country of origin"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Pricing & Inventory</h2>
            <p className="text-gray-600 dark:text-slate-400">Set your pricing and stock information</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Price (MMK) *
                </label>
                <input
                  type="number"
                  name="price"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Discount Price (MMK) <span className="text-xs text-gray-500 dark:text-slate-500">(Optional)</span>
                </label>
                <input
                  type="number"
                  name="discount_price"
                  step="0.01"
                  min="0"
                  value={formData.discount_price}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Stock Quantity *
                </label>
                <input
                  type="number"
                  name="quantity"
                  min="0"
                  value={formData.quantity}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
                  placeholder="Available quantity"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  MOQ (Minimum Order) *
                </label>
                <input
                  type="number"
                  name="moq"
                  min="1"
                  value={formData.moq}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
                  placeholder="Minimum order quantity"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Order Unit *
                </label>
                <select
                  name="min_order_unit"
                  value={formData.min_order_unit}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
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
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Lead Time <span className="text-xs text-gray-500 dark:text-slate-500">(Optional)</span>
                </label>
                <input
                  type="text"
                  name="lead_time"
                  value={formData.lead_time}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
                  placeholder="e.g., 3-5 days, 1 week"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Weight (kg) <span className="text-xs text-gray-500 dark:text-slate-500">(Optional)</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  name="weight_kg"
                  value={formData.weight_kg}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
                  placeholder="Product weight in kilograms"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Media & Specifications</h2>
            <p className="text-gray-600 dark:text-slate-400">Add images and product specifications</p>

            {/* Image Upload Section */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">
                  Product Images *
                  <span className="ml-2 text-xs font-normal text-gray-500 dark:text-slate-500">
                    {imagePreviews.length} image(s)
                  </span>
                </label>
                <div className="flex space-x-2">
                  {/* FIX: replaced window.prompt() with an inline URL input */}
                  <div className="flex gap-1">
                    <input
                      type="url"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addImageFromUrl(); } }}
                      placeholder="https://example.com/image.jpg"
                      className="text-sm border border-gray-300 dark:border-slate-600 rounded-lg px-2 py-1.5 w-full sm:w-56 focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
                    />
                    <button
                      type="button"
                      onClick={addImageFromUrl}
                      disabled={!urlInput.trim()}
                      className="px-3 py-1.5 text-sm border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 text-gray-700 dark:text-slate-300"
                    >
                      Add URL
                    </button>
                  </div>
                  {imagePreviews.length > 0 && (
                    <button
                      type="button"
                      onClick={clearAllImages}
                      className="px-3 py-1.5 text-sm border border-red-300 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      Clear All
                    </button>
                  )}
                </div>
              </div>

              {isUploadingImages && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-400">Uploading images...</span>
                    <span className="text-sm text-blue-600 dark:text-blue-400">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-blue-200 dark:bg-blue-900/30 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <label className="block w-full h-40 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-xl hover:border-green-500 transition-all cursor-pointer bg-gray-50 dark:bg-slate-800 hover:bg-green-50 dark:hover:bg-green-900/20 group">
                <div className="flex flex-col items-center justify-center h-full p-4">
                  <CloudArrowUpIcon className="h-10 w-10 text-gray-400 dark:text-slate-500 mb-2 group-hover:text-green-500" />
                  <span className="text-base font-medium text-gray-600 dark:text-slate-400 group-hover:text-green-600">
                    {imagePreviews.length > 0 ? "Add more images" : "Click to upload images"}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-slate-500 mt-1 text-center">
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
                    <h3 className="text-sm font-medium text-gray-700 dark:text-slate-300">
                      Uploaded Images ({imagePreviews.length})
                    </h3>
                    <span className="text-xs text-gray-500 dark:text-slate-500 flex items-center">
                      <ArrowsUpDownIcon className="h-4 w-4 mr-1" /> Drag to reorder
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {imagePreviews.map((image, index) => (
                      <div
                        key={index}
                        className={`relative group rounded-lg overflow-hidden border-2 transition-all ${
                          image.is_primary
                            ? "border-green-500 ring-2 ring-green-200 dark:ring-green-800"
                            : "border-gray-200 dark:border-slate-600 hover:border-green-300"
                        } ${draggedImage === index ? "opacity-50" : ""}`}
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={handleDragOver}
                        onDrop={() => handleDrop(index)}
                      >
                        <div className="aspect-square bg-gray-100 dark:bg-slate-800 relative">
                          <img
                            src={getImageUrl(image.url)}
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
                              {IMAGE_ANGLES.map((angle) => (
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

                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-800 dark:text-blue-400 mb-1">Image Tips:</h4>
                    <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
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
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-4">
                Product Specifications <span className="text-xs text-gray-500 dark:text-slate-500">(Optional)</span>
              </label>

              <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  <div className="md:col-span-2">
                    <input
                      type="text"
                      name="key"
                      placeholder="Specification name (e.g., Material, Size)"
                      value={specInput.key}
                      onChange={handleSpecChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <input
                      type="text"
                      name="value"
                      placeholder="Specification value (e.g., Cotton, XL)"
                      value={specInput.value}
                      onChange={handleSpecChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
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
                      className="flex items-center justify-between bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg p-3 hover:border-green-500 transition-colors group"
                    >
                      <div className="flex-1 flex items-center">
                        <span className="font-medium text-gray-900 dark:text-slate-100 min-w-[120px]">{key}:</span>
                        <span className="text-gray-600 dark:text-slate-400 ml-2">{value}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeSpecification(key)}
                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors opacity-0 group-hover:opacity-100"
                        title="Remove specification"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500 dark:text-slate-400 bg-gray-50 dark:bg-slate-800 rounded-lg">
                  <PencilIcon className="h-8 w-8 mx-auto mb-2 text-gray-400 dark:text-slate-500" />
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
            <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Shipping & More</h2>
            <p className="text-gray-600 dark:text-slate-400">Set shipping details, warranty, and other information</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Shipping Cost (MMK) <span className="text-xs text-gray-500 dark:text-slate-500">(Optional)</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  name="shipping_cost"
                  value={formData.shipping_cost}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
                  placeholder="Shipping cost"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Shipping Time <span className="text-xs text-gray-500 dark:text-slate-500">(Optional)</span>
                </label>
                <input
                  type="text"
                  name="shipping_time"
                  value={formData.shipping_time}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
                  placeholder="e.g., 3-5 business days"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Warranty Type <span className="text-xs text-gray-500 dark:text-slate-500">(Optional)</span>
                </label>
                <select
                  name="warranty_type"
                  value={formData.warranty_type}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
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
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Warranty Period <span className="text-xs text-gray-500 dark:text-slate-500">(Optional)</span>
                </label>
                <input
                  type="text"
                  name="warranty_period"
                  value={formData.warranty_period}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
                  placeholder="e.g., 12 months, 2 years"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Warranty Details <span className="text-xs text-gray-500 dark:text-slate-500">(Optional)</span>
                </label>
                <input
                  type="text"
                  name="warranty"
                  value={formData.warranty}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
                  placeholder="Warranty coverage details"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Return Policy <span className="text-xs text-gray-500 dark:text-slate-500">(Optional)</span>
                </label>
                <input
                  type="text"
                  name="return_policy"
                  value={formData.return_policy}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
                  placeholder="e.g., 30 days return policy"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Packaging Details <span className="text-xs text-gray-500 dark:text-slate-500">(Optional)</span>
              </label>
              <textarea
                name="packaging_details"
                rows="3"
                value={formData.packaging_details}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
                placeholder="Describe how the product is packaged..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Additional Information <span className="text-xs text-gray-500 dark:text-slate-500">(Optional)</span>
              </label>
              <textarea
                name="additional_info"
                rows="3"
                value={formData.additional_info}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
                placeholder="Any additional information about the product..."
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <input
                  id="is_featured"
                  name="is_featured"
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={handleChange}
                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is_featured" className="text-sm font-medium text-gray-900 dark:text-slate-100">
                  Feature this product on homepage
                </label>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <input
                  id="is_active"
                  name="is_active"
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-900 dark:text-slate-100">
                  Make this product active and visible to customers
                </label>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <input
                  id="is_new"
                  name="is_new"
                  type="checkbox"
                  checked={formData.is_new}
                  onChange={handleChange}
                  className="h-5 w-5 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                />
                <label htmlFor="is_new" className="text-sm font-medium text-gray-900 dark:text-slate-100">
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
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
      <ImagePreviewModal />

      {cancelModal === 'leave' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-2">Leave without saving?</h3>
            <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">
              Your draft has been auto-saved. You can continue editing later.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setCancelModal(false)}
                className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700"
              >
                Keep Editing
              </button>
              <button
                onClick={confirmCancel}
                className="px-4 py-2 bg-gray-800 dark:bg-slate-700 text-white rounded-lg text-sm font-medium hover:bg-gray-900"
              >
                Leave
              </button>
            </div>
          </div>
        </div>
      )}

      {cancelModal === 'clear-images' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-2">Remove all images?</h3>
            <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">
              This will remove all uploaded images from the form. This cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setCancelModal(false)}
                className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={confirmClearImages}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
              >
                Remove All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-md mx-4 shadow-xl">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                <CheckCircleIcon className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-2">Success!</h3>
              <p className="text-gray-600 dark:text-slate-400 mb-6">{successMessage}</p>
              <p className="text-sm text-gray-500 dark:text-slate-500">Redirecting...</p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with progress */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 mb-8">
          <div className="px-4 sm:px-8 py-4 sm:py-6 border-b border-gray-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                  {product ? "Edit Product" : "New Listing"}
                </h1>
                <p className="text-gray-600 dark:text-slate-400 mt-1">
                  {product ? "Update your product details" : "Create a new product listing"}
                  {!product && <span className="text-blue-600 dark:text-blue-400 text-sm ml-2">• Draft auto-saved</span>}
                </p>
              </div>
              <button
                onClick={handleCancel}
                className="p-2 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Step indicators */}
          <div className="px-4 sm:px-8 py-4 sm:py-5">

            {/* ── Mobile: segmented pill strip ─────────────────────────── */}
            <div className="sm:hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-800 dark:text-slate-200">
                  {steps[currentStep - 1]?.title}
                </span>
                <span className="text-xs font-bold text-green-700 dark:text-green-400">
                  Step {currentStep} of {steps.length}
                </span>
              </div>
              <div className="flex gap-1.5">
                {steps.map((step) => (
                  <button
                    key={step.id}
                    onClick={() => goToStep(step.id)}
                    className={`flex-1 h-2 rounded-full transition-all duration-300 ${
                      currentStep === step.id
                        ? 'bg-green-500'
                        : completedSteps.has(step.id)
                        ? 'bg-green-400'
                        : 'bg-gray-200 dark:bg-slate-600'
                    }`}
                    aria-label={step.title}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-400 dark:text-slate-500 mt-1.5">
                {steps[currentStep - 1]?.description}
              </p>
            </div>

            {/* ── Desktop: circles + connectors + labels ───────────────── */}
            <div className="hidden sm:flex items-start">
              {steps.map((step, index) => {
                const done    = completedSteps.has(step.id);
                const current = currentStep === step.id;
                const last    = index === steps.length - 1;
                return (
                  <React.Fragment key={step.id}>
                    {/* Node */}
                    <button
                      onClick={() => goToStep(step.id)}
                      className="flex flex-col items-center flex-shrink-0 group"
                    >
                      <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center
                                       font-semibold text-sm transition-all duration-200
                                       ${current ? 'border-green-500 bg-green-500 text-white shadow shadow-green-200'
                                       : done    ? 'border-green-400 bg-green-400 text-white'
                                       :           'border-gray-300 dark:border-slate-600 text-gray-400 dark:text-slate-500 group-hover:border-gray-400 dark:group-hover:border-slate-500'}`}>
                        {done
                          ? <CheckCircleIcon className="h-5 w-5" />
                          : step.id}
                      </div>
                      <span className={`mt-1.5 text-[11px] font-medium text-center leading-tight w-16 break-words
                                        ${current ? 'text-green-700 dark:text-green-400' : done ? 'text-gray-600 dark:text-slate-400' : 'text-gray-400 dark:text-slate-500'}`}>
                        {step.title}
                      </span>
                      <span className="text-[10px] text-gray-400 dark:text-slate-500 text-center w-16 leading-tight">
                        {step.description}
                      </span>
                    </button>

                    {/* Connector */}
                    {!last && (
                      <div className="flex-1 mt-4 mx-2">
                        <div className={`h-0.5 rounded-full transition-colors duration-300
                                         ${done ? 'bg-green-400' : 'bg-gray-200 dark:bg-slate-700'}`} />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>

          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700">
          {error && (
            <div className="mx-4 sm:mx-8 mt-4 sm:mt-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 flex items-start">
              <ExclamationCircleIcon className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="p-4 sm:p-8">{renderStepContent()}</div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center px-4 sm:px-8 py-4 sm:py-6 border-t border-gray-200 dark:border-slate-700">
            <div className="flex space-x-3">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex items-center space-x-2 px-6 py-3 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-all font-medium"
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