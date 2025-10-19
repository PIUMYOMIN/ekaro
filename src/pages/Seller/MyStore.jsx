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
  DocumentTextIcon
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

    // Use a fallback base URL if REACT_APP_API_URL is not defined
    const baseUrl = (typeof process !== "undefined" && process.env?.REACT_APP_API_URL) 
      ? process.env.REACT_APP_API_URL 
      : window?.location?.origin || 'http://localhost:8000';

    // If it's already a full URL, return as is
    if (imagePath.startsWith('http')) {
      return imagePath;
    }

    // Remove any leading slashes and construct the URL
    const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;

    // For Laravel storage paths, they're usually served from /storage
    if (imagePath.includes('products/temp') || imagePath.includes('storage')) {
      return `${baseUrl}/storage/${cleanPath}`;
    }

    return `${baseUrl}/${cleanPath}`;
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
          { value: "individual", label: "Individual/Sole Proprietorship" },
          { value: "partnership", label: "Partnership" },
          { value: "private_limited", label: "Private Limited Company" },
          { value: "public_limited", label: "Public Limited Company" },
          { value: "cooperative", label: "Cooperative" },
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
        setLogoPreview(getImageUrl(storeData.store_logo));
      }
      if (storeData.store_banner) {
        setBannerPreview(getImageUrl(storeData.store_banner));
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
      const updateData = { ...formData };

      // Upload images if they exist
      if (logoFile) {
        const logoUrl = await uploadImage(logoFile, "logo");
        updateData.store_logo = logoUrl;
      }

      if (bannerFile) {
        const bannerUrl = await uploadImage(bannerFile, "banner");
        updateData.store_banner = bannerUrl;
      }

      const response = await api.put("/sellers/my-store/update", updateData);

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
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors"
        >
          <PencilIcon className="h-4 w-4" />
          <span>{isEditing ? "Cancel Edit" : "Edit Store"}</span>
        </button>
      </div>

      {/* Status Message */}
      {message.text && (
        <div
          className={`p-4 rounded-xl ${
            message.type === "success"
              ? "bg-green-50 border border-green-200 text-green-700"
              : "bg-red-50 border border-red-200 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      {isEditing ? (
        /* Edit Form - Same as before */
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ... edit form JSX remains the same ... */}
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
                      // If image fails to load, show fallback
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : (
                  <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center shadow-lg">
                    <BuildingStorefrontIcon className="h-10 w-10 text-white" />
                  </div>
                )}
                
                {/* Fallback if image fails to load */}
                {displayLogoUrl && (
                  <div 
                    className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center shadow-lg hidden"
                    style={{ display: 'none' }}
                  >
                    <BuildingStorefrontIcon className="h-10 w-10 text-white" />
                  </div>
                )}

                <div className="flex-1">
                  <h1 className="text-2xl font-bold">{storeData.store_name}</h1>
                  <p className={`mt-1 ${displayBannerUrl ? 'text-gray-600' : 'text-green-100 opacity-90'}`}>
                    {storeData.description || "No description provided"}
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