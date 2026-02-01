import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  CameraIcon,
  MapPinIcon,
  GlobeAltIcon,
  PhoneIcon,
  EnvelopeIcon,
  CheckIcon,
  XMarkIcon,
  BuildingStorefrontIcon,
  DocumentTextIcon,
  LinkIcon
} from "@heroicons/react/24/outline";
import api from "../../utils/api";

const EditStore = ({ storeData, refreshData }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [businessTypes, setBusinessTypes] = useState([]);

  // Helper function to get full image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;

    let baseUrl = "https://db.pyonea.com";
    if (typeof window !== 'undefined') {
      if (window._env_ && window._env_.REACT_APP_API_URL) {
        baseUrl = window._env_.REACT_APP_API_URL;
      } else if (window.REACT_APP_API_URL) {
        baseUrl = window.REACT_APP_API_URL;
      }
    }

    if (imagePath.startsWith('http')) {
      return imagePath;
    }

    if (imagePath.includes('storage/')) {
      return `${baseUrl}/${imagePath}`;
    }

    if (imagePath.includes('stores/') || imagePath.includes('store_profile/') || imagePath.includes('products/')) {
      return `${baseUrl}/storage/${imagePath}`;
    }

    return `${baseUrl}/storage/${imagePath}`;
  };

  const [formData, setFormData] = useState({
    store_name: "",
    description: "",
    business_type: "",
    business_registration_number: "",
    tax_id: "",
    contact_email: "",
    contact_phone: "",
    website: "",
    address: "",
    city: "",
    state: "",
    country: "Myanmar",
    postal_code: "",
    social_facebook: "",
    social_instagram: "",
    social_twitter: "",
    social_linkedin: "",
    account_number: ""
  });

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState("");

  // Fetch business types
  useEffect(() => {
    const fetchBusinessTypes = async () => {
      try {
        const response = await api.get("/business-types");
        setBusinessTypes(response.data.data);
      } catch (error) {
        console.log("Using default business types");
        setBusinessTypes([
          { value: "individual", label: "Individual/Sole Proprietorship", name_en: "Individual" },
          { value: "partnership", label: "Partnership", name_en: "Partnership" },
          { value: "private_limited", label: "Private Limited Company", name_en: "Private Limited" },
          { value: "public_limited", label: "Public Limited Company", name_en: "Public Limited" },
          { value: "cooperative", label: "Cooperative", name_en: "Cooperative" },
        ]);
      }
    };

    fetchBusinessTypes();
  }, []);

  // Initialize form data when storeData is available
  useEffect(() => {
    if (storeData) {
      console.log("Store data loaded:", storeData);
      setFormData({
        store_name: storeData.store_name || "",
        description: storeData.description || storeData.store_description || "",
        business_type: storeData.business_type || "",
        business_registration_number: storeData.business_registration_number || "",
        tax_id: storeData.tax_id || "",
        contact_email: storeData.contact_email || "",
        contact_phone: storeData.contact_phone || "",
        website: storeData.website || "",
        address: storeData.address || "",
        city: storeData.city || "",
        state: storeData.state || "",
        country: storeData.country || "Myanmar",
        postal_code: storeData.postal_code || "",
        social_facebook: storeData.social_facebook || "",
        social_instagram: storeData.social_instagram || "",
        social_twitter: storeData.social_twitter || "",
        social_linkedin: storeData.social_linkedin || "",
        account_number: storeData.account_number || ""
      });

      // Use getImageUrl to get full URLs for previews
      if (storeData.store_logo) {
        const logoUrl = getImageUrl(storeData.store_logo);
        console.log("Logo URL:", logoUrl);
        setLogoPreview(logoUrl);
      }
      if (storeData.store_banner) {
        const bannerUrl = getImageUrl(storeData.store_banner);
        console.log("Banner URL:", bannerUrl);
        setBannerPreview(bannerUrl);
      }
    }
  }, [storeData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      const previewUrl = URL.createObjectURL(file);
      setLogoPreview(previewUrl);
    }
  };

  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBannerFile(file);
      const previewUrl = URL.createObjectURL(file);
      setBannerPreview(previewUrl);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const submitFormData = new FormData();

      // Append all form fields EXCEPT store_logo and store_banner
      Object.keys(formData).forEach(key => {
        if (key !== 'store_logo' && key !== 'store_banner' &&
          formData[key] !== null && formData[key] !== undefined) {
          submitFormData.append(key, formData[key]);
        }
      });

      // Append files if they exist - use the actual file objects
      if (logoFile) {
        console.log("Appending logo file:", logoFile);
        submitFormData.append('store_logo', logoFile);
      } else if (logoPreview && !logoPreview.startsWith('blob:')) {
        // If logoPreview is a URL (not a blob) and no new file, keep existing
        submitFormData.append('store_logo', logoPreview);
      }

      if (bannerFile) {
        console.log("Appending banner file:", bannerFile);
        submitFormData.append('store_banner', bannerFile);
      } else if (bannerPreview && !bannerPreview.startsWith('blob:')) {
        // If bannerPreview is a URL (not a blob) and no new file, keep existing
        submitFormData.append('store_banner', bannerPreview);
      }

      // Debug: Log what's being sent
      console.log("=== FORM DATA DEBUG ===");
      for (let [key, value] of submitFormData.entries()) {
        if (value instanceof File) {
          console.log(`${key}: File - ${value.name} (${value.size} bytes, ${value.type})`);
        } else {
          console.log(`${key}: ${value}`);
        }
      }

      // Make the API call - Use the correct endpoint
      const response = await api.put('/sellers/my-store/update', submitFormData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setMessage({
          type: "success",
          text: "Store profile updated successfully!"
        });
        
        // Clear file states and refresh data
        setLogoFile(null);
        setBannerFile(null);
        if (refreshData) {
          await refreshData();
        }

        // Navigate back to store view
        setTimeout(() => {
          navigate('/seller/dashboard?tab=my-store');
        }, 1500);
      }
    } catch (error) {
      console.error("Failed to update store:", error);
      console.error("Error response:", error.response);

      let errorMessage = "Failed to update store profile";

      if (error.response?.data?.errors) {
        // Handle validation errors
        const errors = error.response.data.errors;
        console.log("Validation errors:", errors);
        errorMessage = Object.values(errors).flat().join(', ');
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      setMessage({
        type: "error",
        text: errorMessage
      });
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    navigate('/seller/dashboard?tab=my-store');
  };

  if (!storeData) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading store information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Edit Store Profile
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Update your store information and media
          </p>
        </div>
        <button
          onClick={cancelEdit}
          className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
        >
          <XMarkIcon className="h-4 w-4" />
          <span>Cancel</span>
        </button>
      </div>

      {/* Status Message */}
      {message.text && (
        <div
          className={`p-4 rounded-xl flex items-center space-x-3 ${message.type === "success"
              ? "bg-green-50 border border-green-200 text-green-700"
              : "bg-red-50 border border-red-200 text-red-700"
            }`}
        >
          {message.type === "success" ? (
            <CheckIcon className="h-5 w-5 text-green-500 flex-shrink-0" />
          ) : (
            <XMarkIcon className="h-5 w-5 text-red-500 flex-shrink-0" />
          )}
          <span className="flex-1">{message.text}</span>
          <button
            onClick={() => setMessage({ type: "", text: "" })}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Edit Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Store Media Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <CameraIcon className="h-5 w-5 mr-2 text-green-600" />
            Store Media
          </h3>

          {/* Logo Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Store Logo
            </label>
            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="w-32 h-32 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Store logo preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center">
                    <CameraIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <span className="text-xs text-gray-500">No logo</span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <label className="block">
                  <span className="sr-only">Choose logo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                  />
                </label>
                <p className="text-xs text-gray-500 mt-2">
                  Recommended: 400x400px, JPG/PNG format, Max 2MB
                </p>
              </div>
            </div>
          </div>

          {/* Banner Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Store Banner
            </label>
            <div className="space-y-3">
              <div className="w-full h-32 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden">
                {bannerPreview ? (
                  <img
                    src={bannerPreview}
                    alt="Store banner preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center">
                    <CameraIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <span className="text-xs text-gray-500">No banner</span>
                  </div>
                )}
              </div>
              <div>
                <label className="block">
                  <span className="sr-only">Choose banner</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBannerChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                  />
                </label>
                <p className="text-xs text-gray-500 mt-2">
                  Recommended: 1200x300px, JPG/PNG format, Max 5MB
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Store Basic Information */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BuildingStorefrontIcon className="h-5 w-5 mr-2 text-green-600" />
            Store Basic Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Store Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Store Name *
              </label>
              <input
                type="text"
                name="store_name"
                value={formData.store_name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                placeholder="Enter your store name"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Store Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                placeholder="Describe your store and what you offer..."
              />
              <p className="text-xs text-gray-500 mt-2">
                This description will appear on your store page
              </p>
            </div>

            {/* Business Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Type *
              </label>
              <select
                name="business_type"
                value={formData.business_type}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
              >
                <option value="">Select business type</option>
                {businessTypes.map((type) => (
                  <option key={type.value || type.slug_en} value={type.value || type.slug_en}>
                    {type.name_en || type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Contact Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Email *
              </label>
              <div className="relative">
                <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  name="contact_email"
                  value={formData.contact_email}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                  placeholder="store@example.com"
                />
              </div>
            </div>

            {/* Contact Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Phone *
              </label>
              <div className="relative">
                <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="tel"
                  name="contact_phone"
                  value={formData.contact_phone}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                  placeholder="09xxxxxxxxx"
                />
              </div>
            </div>

            {/* Website */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website
              </label>
              <div className="relative">
                <GlobeAltIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                  placeholder="https://example.com"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Business Details */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <DocumentTextIcon className="h-5 w-5 mr-2 text-green-600" />
            Business Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Business Registration Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Registration Number
              </label>
              <input
                type="text"
                name="business_registration_number"
                value={formData.business_registration_number}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                placeholder="Enter registration number"
              />
            </div>

            {/* Tax ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tax ID
              </label>
              <input
                type="text"
                name="tax_id"
                value={formData.tax_id}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                placeholder="Enter tax identification number"
              />
            </div>

            {/* Account Number */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bank Account Number
              </label>
              <input
                type="text"
                name="account_number"
                value={formData.account_number}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                placeholder="Enter your bank account number"
              />
              <p className="text-xs text-gray-500 mt-2">
                For receiving payments from sales
              </p>
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <MapPinIcon className="h-5 w-5 mr-2 text-green-600" />
            Address Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Address */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address *
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                placeholder="Street address, building, floor"
              />
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City *
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                placeholder="Enter city"
              />
            </div>

            {/* State/Region */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State/Region *
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                placeholder="Enter state or region"
              />
            </div>

            {/* Country */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country *
              </label>
              <select
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
              >
                <option value="Myanmar">Myanmar</option>
                <option value="Thailand">Thailand</option>
                <option value="Singapore">Singapore</option>
                <option value="Malaysia">Malaysia</option>
                <option value="Indonesia">Indonesia</option>
                <option value="Vietnam">Vietnam</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Postal Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Postal Code
              </label>
              <input
                type="text"
                name="postal_code"
                value={formData.postal_code}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                placeholder="Enter postal code"
              />
            </div>
          </div>
        </div>

        {/* Social Media Links */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <LinkIcon className="h-5 w-5 mr-2 text-green-600" />
            Social Media Links
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Facebook */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Facebook
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">fb.com/</span>
                </div>
                <input
                  type="text"
                  name="social_facebook"
                  value={formData.social_facebook}
                  onChange={handleInputChange}
                  className="w-full pl-20 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                  placeholder="username"
                />
              </div>
            </div>

            {/* Instagram */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instagram
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">instagram.com/</span>
                </div>
                <input
                  type="text"
                  name="social_instagram"
                  value={formData.social_instagram}
                  onChange={handleInputChange}
                  className="w-full pl-28 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                  placeholder="username"
                />
              </div>
            </div>

            {/* Twitter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Twitter (X)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">twitter.com/</span>
                </div>
                <input
                  type="text"
                  name="social_twitter"
                  value={formData.social_twitter}
                  onChange={handleInputChange}
                  className="w-full pl-24 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                  placeholder="username"
                />
              </div>
            </div>

            {/* LinkedIn */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                LinkedIn
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">linkedin.com/</span>
                </div>
                <input
                  type="text"
                  name="social_linkedin"
                  value={formData.social_linkedin}
                  onChange={handleInputChange}
                  className="w-full pl-26 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                  placeholder="username"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-4">
          <button
            type="button"
            onClick={cancelEdit}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
          >
            Cancel
          </button>
          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {saving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <CheckIcon className="h-5 w-5 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default EditStore;