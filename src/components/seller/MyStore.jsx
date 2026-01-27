import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  BuildingStorefrontIcon,
  PencilIcon,
  CameraIcon,
  MapPinIcon,
  GlobeAltIcon,
  PhoneIcon,
  EnvelopeIcon,
  CheckIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";
import api from "../../utils/api";

const MyStore = ({ storeData, stats, refreshData }) => {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [businessTypes, setBusinessTypes] = useState([]);

  // Helper function to get full image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;

    // Try to get REACT_APP_API_URL from window._env_ (for frontend env injection)
    let baseUrl = "http://localhost:8000";
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

    // Handle different path formats
    if (imagePath.includes('storage/')) {
      return `${baseUrl}/${imagePath}`;
    }

    if (imagePath.includes('stores/') || imagePath.includes('store_profile/') || imagePath.includes('products/')) {
      return `${baseUrl}/storage/${imagePath}`;
    }

    // Default case - assume it's a storage path
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
        setIsEditing(false);
        // Clear file states and refresh data
        setLogoFile(null);
        setBannerFile(null);
        if (refreshData) {
          refreshData();
        }

        // Auto-hide success message after 5 seconds
        setTimeout(() => {
          setMessage({ type: "", text: "" });
        }, 5000);
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
    setIsEditing(false);
    setLogoFile(null);
    setBannerFile(null);
    // Reset form data to original store data
    if (storeData) {
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
        account_number: storeData.account_number || ""
      });
      if (storeData.store_logo) {
        setLogoPreview(getImageUrl(storeData.store_logo));
      }
      if (storeData.store_banner) {
        setBannerPreview(getImageUrl(storeData.store_banner));
      }
    }
    setMessage({ type: "", text: "" });
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

  // Get full URLs for display
  const displayLogoUrl = getImageUrl(storeData.store_logo);
  const displayBannerUrl = getImageUrl(storeData.store_banner);

  return (
    <div className="space-y-6">
      {/* Header with Edit Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {t("seller.my_store")}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {t("seller.my_store_summary")}
          </p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors"
          >
            <PencilIcon className="h-4 w-4" />
            <span>Edit Store</span>
          </button>
        )}
      </div>

      {/* Status Message */}
      {message.text && (
        <div
          className={`p-4 rounded-xl flex items-center space-x-3 ${
            message.type === "success"
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

      {isEditing ? (
        /* Edit Form */
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Store Media Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Store Media</h3>

            {/* Logo Upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Store Logo
              </label>
              <div className="flex items-center space-x-6">
                <div className="w-32 h-32 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden">
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt="Store logo preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <CameraIcon className="h-8 w-8 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <label className="block">
                    <span className="sr-only">Choose logo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Recommended: 400x400px, Max 2MB
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
                    <CameraIcon className="h-8 w-8 text-gray-400" />
                  )}
                </div>
                <div>
                  <label className="block">
                    <span className="sr-only">Choose banner</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBannerChange}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Recommended: 1200x300px, Max 5MB
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Store Basic Information */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Store Basic Information</h3>

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
                <input
                  type="email"
                  name="contact_email"
                  value={formData.contact_email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                  placeholder="contact@yourstore.com"
                />
              </div>

              {/* Contact Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Phone *
                </label>
                <input
                  type="tel"
                  name="contact_phone"
                  value={formData.contact_phone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                  placeholder="+95 123 456 789"
                />
              </div>
            </div>
          </div>

          {/* Business Details */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Details</h3>

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
                  placeholder="Registration number"
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
                  placeholder="Tax identification number"
                />
              </div>

              {/* Website */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                  placeholder="https://yourstore.com"
                />
              </div>

              {/* Account Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Number
                </label>
                <input
                  type="text"
                  name="account_number"
                  value={formData.account_number}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                  placeholder="Bank account number"
                />
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Address Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Address */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address *
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                  placeholder="Full street address"
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
                  placeholder="City"
                />
              </div>

              {/* State */}
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
                  placeholder="State or region"
                />
              </div>

              {/* Country */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country *
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                  placeholder="Country"
                />
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
                  placeholder="Postal code"
                />
              </div>
            </div>
          </div>

          {/* Social Media Links */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Social Media Links</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Facebook */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Facebook
                </label>
                <input
                  type="url"
                  name="social_facebook"
                  value={formData.social_facebook}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                  placeholder="https://facebook.com/yourpage"
                />
              </div>

              {/* Instagram */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instagram
                </label>
                <input
                  type="url"
                  name="social_instagram"
                  value={formData.social_instagram}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                  placeholder="https://instagram.com/yourprofile"
                />
              </div>

              {/* Twitter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Twitter
                </label>
                <input
                  type="url"
                  name="social_twitter"
                  value={formData.social_twitter}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                  placeholder="https://twitter.com/yourprofile"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={cancelEdit}
              disabled={saving}
              className="flex items-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium disabled:opacity-50"
            >
              <XMarkIcon className="h-4 w-4" />
              <span>Cancel</span>
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center space-x-2 px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all duration-200 font-medium disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <CheckIcon className="h-4 w-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        /* Display View */
        <div className="space-y-6">
          {/* Store Header with Stats */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Store Banner */}
            {displayBannerUrl && (
              <div className="h-48 bg-gradient-to-r from-green-500 to-emerald-600 relative">
                <img
                  src={displayBannerUrl}
                  alt="Store banner"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
              </div>
            )}
            
            {/* Store Info Section */}
            <div className={`p-6 ${!displayBannerUrl ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' : ''}`}>
              <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                {/* Store Logo */}
                {displayLogoUrl ? (
                  <img
                    src={displayLogoUrl}
                    alt={storeData.store_name}
                    className="w-20 h-20 rounded-2xl object-cover border-4 border-white/20 shadow-lg"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      // Show fallback icon
                      const fallback = e.target.parentNode.querySelector('.logo-fallback');
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                ) : (
                  <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center shadow-lg logo-fallback">
                    <BuildingStorefrontIcon className="h-10 w-10 text-white" />
                  </div>
                )}
                
                {/* Fallback if image fails to load */}
                <div 
                  className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center shadow-lg logo-fallback hidden"
                >
                  <BuildingStorefrontIcon className="h-10 w-10 text-white" />
                </div>

                <div className="flex-1">
                  <h1 className="text-2xl font-bold">{storeData.store_name}</h1>
                  <p className={`mt-1 ${displayBannerUrl ? 'text-gray-600' : 'text-green-100 opacity-90'}`}>
                    {storeData.description || storeData.store_description || "No description provided"}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      storeData.status === 'approved' || storeData.status === 'active'
                        ? 'bg-green-400 text-white' 
                        : storeData.status === 'pending'
                        ? 'bg-yellow-400 text-white'
                        : 'bg-blue-400 text-white'
                    }`}>
                      {storeData.status?.charAt(0).toUpperCase() + storeData.status?.slice(1)}
                    </span>
                    <span className={`text-sm ${displayBannerUrl ? 'text-gray-600' : 'text-green-100'}`}>
                      Since {new Date(storeData.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Store Statistics */}
            <div className="p-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Store Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{stats.totalProducts || 0}</div>
                  <div className="text-sm text-green-800">Total Products</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{stats.totalOrders || 0}</div>
                  <div className="text-sm text-blue-800">Total Orders</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {stats.totalRevenue ? `${parseInt(stats.totalRevenue).toLocaleString()} MMK` : '0 MMK'}
                  </div>
                  <div className="text-sm text-purple-800">Total Revenue</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{stats.pendingOrders || 0}</div>
                  <div className="text-sm text-orange-800">Pending Orders</div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{storeData.contact_email || "Not provided"}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <PhoneIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{storeData.contact_phone || "Not provided"}</p>
                </div>
              </div>
              {storeData.website && (
                <div className="flex items-center space-x-3">
                  <GlobeAltIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Website</p>
                    <a 
                      href={storeData.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="font-medium text-green-600 hover:text-green-700"
                    >
                      {storeData.website}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Address Information */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Address</h3>
            <div className="flex items-start space-x-3">
              <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="font-medium">
                  {storeData.address ? 
                    `${storeData.address}, ${storeData.city}, ${storeData.state}, ${storeData.country}` 
                    : "No address provided"
                  }
                </p>
                {storeData.postal_code && (
                  <p className="text-sm text-gray-500">Postal Code: {storeData.postal_code}</p>
                )}
              </div>
            </div>
          </div>

          {/* Business Information */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Business Type</p>
                <p className="font-medium">{storeData.business_type || "Not specified"}</p>
              </div>
              {storeData.business_registration_number && (
                <div>
                  <p className="text-sm text-gray-500">Registration Number</p>
                  <p className="font-medium">{storeData.business_registration_number}</p>
                </div>
              )}
              {storeData.tax_id && (
                <div>
                  <p className="text-sm text-gray-500">Tax ID</p>
                  <p className="font-medium">{storeData.tax_id}</p>
                </div>
              )}
              {storeData.account_number && (
                <div>
                  <p className="text-sm text-gray-500">Account Number</p>
                  <p className="font-medium">{storeData.account_number}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyStore;