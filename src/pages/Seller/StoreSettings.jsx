import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";
import {
  CameraIcon,
  MapPinIcon,
  GlobeAltIcon,
  PhoneIcon,
  EnvelopeIcon,
  BuildingStorefrontIcon,
  DocumentTextIcon,
  CheckBadgeIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline";

const StoreSettings = ({ storeData, setStoreData }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [businessTypes, setBusinessTypes] = useState([]);

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

  // Fetch business types from backend or use defaults
  useEffect(() => {
    const fetchBusinessTypes = async () => {
      try {
        // Try to get business types from API
        const response = await api.get("/business-types"); // You might need to create this endpoint
        setBusinessTypes(response.data.data);
      } catch (error) {
        console.log("Using default business types");
        // Fallback to default business types
        setBusinessTypes([
          { value: "individual", label: "Individual/Sole Proprietorship" },
          { value: "partnership", label: "Partnership" },
          { value: "private_limited", label: "Private Limited Company" },
          { value: "public_limited", label: "Public Limited Company" },
          { value: "cooperative", label: "Cooperative" },
          { value: "llc", label: "Limited Liability Company (LLC)" },
          { value: "sole_proprietor", label: "Sole Proprietor" },
          { value: "freelancer", label: "Freelancer" }
        ]);
      }
    };

    fetchBusinessTypes();
  }, []);

  // Initialize form data when storeData is available
  useEffect(() => {
  if (storeData) {
    setFormData({
      store_name: storeData.store_name || "",
      description: storeData.description || "",
      business_type: storeData.business_type || "",
      business_registration_number: storeData.business_registration_number || "",
      tax_id: storeData.tax_id || "",
      contact_email: storeData.contact_email || user?.email || "",
      contact_phone: storeData.contact_phone || user?.phone || "",
      website: storeData.website || "",
      address: storeData.address || user?.address || "",
      city: storeData.city || user?.city || "",
      state: storeData.state || user?.state || "",
      country: storeData.country || "Myanmar",
      postal_code: storeData.postal_code || user?.postal_code || "",
      social_facebook: storeData.social_facebook || "",
      social_instagram: storeData.social_instagram || "",
      social_twitter: storeData.social_twitter || "",
      account_number: storeData.account_number || ""
    });

    if (storeData.store_logo) {
      setLogoPreview(storeData.store_logo);
    }
    if (storeData.store_banner) {
      setBannerPreview(storeData.store_banner);
    }
  }
}, [storeData, user]);


  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type and size
      if (!file.type.startsWith("image/")) {
        setMessage({ type: "error", text: "Please select a valid image file" });
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        // 2MB
        setMessage({
          type: "error",
          text: "Image size should be less than 2MB"
        });
        return;
      }

      setLogoFile(file);
      const previewUrl = URL.createObjectURL(file);
      setLogoPreview(previewUrl);
    }
  };

  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type and size
      if (!file.type.startsWith("image/")) {
        setMessage({ type: "error", text: "Please select a valid image file" });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        // 5MB
        setMessage({
          type: "error",
          text: "Banner size should be less than 5MB"
        });
        return;
      }

      setBannerFile(file);
      const previewUrl = URL.createObjectURL(file);
      setBannerPreview(previewUrl);
    }
  };

  const uploadImage = async (file, type) => {
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await api.post("/products/upload-image", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      return response.data.data.url;
    } catch (error) {
      console.error(`Failed to upload ${type}:`, error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      // First, get the current seller profile to ensure we have the correct ID
      const storeResponse = await api.get("/test/my-store");
      const sellerId = storeResponse.data.data.id;

      // Prepare update data
      const updateData = {
        ...formData
        // Remove empty fields to avoid validation issues
      };

      // Remove empty social media fields
      if (!updateData.social_facebook) delete updateData.social_facebook;
      if (!updateData.social_instagram) delete updateData.social_instagram;
      if (!updateData.social_twitter) delete updateData.social_twitter;

      // Upload images if they exist
      if (logoFile) {
        try {
          const logoUrl = await uploadImage(logoFile, "logo");
          updateData.store_logo = logoUrl;
        } catch (error) {
          setMessage({ type: "error", text: "Failed to upload logo image" });
          setSaving(false);
          return;
        }
      }

      if (bannerFile) {
        try {
          const bannerUrl = await uploadImage(bannerFile, "banner");
          updateData.store_banner = bannerUrl;
        } catch (error) {
          setMessage({ type: "error", text: "Failed to upload banner image" });
          setSaving(false);
          return;
        }
      }

      // Update seller profile with the correct ID
      const response = await api.put(`/sellers/${sellerId}`, updateData);

      if (response.data.success) {
        setMessage({
          type: "success",
          text: "Store profile updated successfully!"
        });
        setStoreData(response.data.data);

        // Clear file states
        setLogoFile(null);
        setBannerFile(null);
      }
    } catch (error) {
      console.error("Failed to update store:", error);
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to update store profile"
      });
    } finally {
      setSaving(false);
    }
  };

  // Get current business type display name
  const getCurrentBusinessTypeLabel = () => {
    if (!formData.business_type) return "";
    const currentType = businessTypes.find(
      (type) => type.value === formData.business_type
    );
    return currentType ? currentType.label : formData.business_type;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Loading */}
      
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Store Settings</h1>
            <p className="text-gray-600 mt-1">
              Manage your store profile and business information
            </p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-green-600">
            <CheckBadgeIcon className="h-5 w-5" />
            <span>Verified Seller</span>
          </div>
        </div>
      </div>

      {/* Status Message */}
      {message.text && (
        <div
          className={`p-4 rounded-xl flex items-start space-x-3 ${
            message.type === "success"
              ? "bg-green-50 border border-green-200 text-green-700"
              : "bg-red-50 border border-red-200 text-red-700"
          }`}
        >
          {message.type === "success" ? (
            <CheckBadgeIcon className="h-5 w-5 mt-0.5 flex-shrink-0" />
          ) : (
            <ExclamationTriangleIcon className="h-5 w-5 mt-0.5 flex-shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Store Branding Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <BuildingStorefrontIcon className="h-5 w-5 mr-2 text-green-600" />
            Store Branding
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Logo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Store Logo
              </label>
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden">
                    {logoPreview ? (
                      <img
                        src={logoPreview}
                        alt="Store logo"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <CameraIcon className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  {logoPreview && (
                    <button
                      type="button"
                      onClick={() => {
                        setLogoPreview("");
                        setLogoFile(null);
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
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
                  <p className="text-xs text-gray-500 mt-2">
                    Recommended: 400x400px, PNG or JPG, Max 2MB
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
                <div className="relative">
                  <div className="w-full h-32 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden">
                    {bannerPreview ? (
                      <img
                        src={bannerPreview}
                        alt="Store banner"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <CameraIcon className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  {bannerPreview && (
                    <button
                      type="button"
                      onClick={() => {
                        setBannerPreview("");
                        setBannerFile(null);
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
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
                    Recommended: 1200x300px, PNG or JPG, Max 5MB
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Basic Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
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
                <option value="">Select Business Type</option>
                {businessTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>

              {/* Display current business type if exists */}
              {formData.business_type && (
                <p className="text-sm text-green-600 mt-2">
                  Current: {getCurrentBusinessTypeLabel()}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Store Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                placeholder="Describe your store and what you sell..."
              />
              <p className="text-xs text-gray-500 mt-2">
                Tell customers about your business, products, and what makes you
                unique.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <EnvelopeIcon className="h-5 w-5 mr-2 text-green-600" />
            Contact Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  placeholder="contact@yourstore.com"
                />
              </div>
            </div>

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
                  placeholder="+95 9XXXXXXXX"
                />
              </div>
            </div>

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
                  placeholder="https://yourstore.com"
                />
              </div>
            </div>

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

        {/* Business Registration */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <DocumentTextIcon className="h-5 w-5 mr-2 text-green-600" />
            Business Registration
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          </div>
        </div>

        {/* Address Information */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <MapPinIcon className="h-5 w-5 mr-2 text-green-600" />
            Address Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Street Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                placeholder="Enter your business address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                placeholder="City"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State/Region
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                placeholder="State or Region"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                placeholder="Country"
              />
            </div>

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

        {/* Social Media */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Social Media Links
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                placeholder="https://twitter.com/yourhandle"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4 pt-6">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="px-8 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Saving...</span>
              </>
            ) : (
              <span>Save Changes</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StoreSettings;
