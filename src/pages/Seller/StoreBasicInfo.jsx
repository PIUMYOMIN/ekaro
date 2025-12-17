import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  ArrowRightIcon,
  BuildingStorefrontIcon,
  PhotoIcon,
  InformationCircleIcon,
  ChevronDownIcon,
  UserIcon,
  BuildingOfficeIcon,
  TruckIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import { useSellerOnboarding } from "../../hooks/useSellerOnboarding";

const StoreBasicInfo = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { onboardingData, updateOnboardingData } = useSellerOnboarding();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [businessTypes, setBusinessTypes] = useState([]);
  const [selectedBusinessType, setSelectedBusinessType] = useState(null);
  const [storeLogo, setStoreLogo] = useState(null);
  const [storeLogoPreview, setStoreLogoPreview] = useState(
    onboardingData.store_logo || ""
  );
  const [storeBanner, setStoreBanner] = useState(null);
  const [storeBannerPreview, setStoreBannerPreview] = useState(
    onboardingData.store_banner || ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    trigger
  } = useForm({
    defaultValues: {
      store_name: onboardingData.store_name || (user?.name ? `${user.name}'s Store` : ""),
      business_type_slug: onboardingData.business_type_slug || "",
      contact_email: onboardingData.contact_email || user?.email || "",
      contact_phone: onboardingData.contact_phone || user?.phone || "",
      description: onboardingData.description || ""
    }
  });

  useEffect(() => {
    const fetchBusinessTypes = async () => {
      try {
        const response = await api.get("/business-types");
        console.log("Fetched business types:", response.data);
        
        if (response.data.success && response.data.data) {
          setBusinessTypes(response.data.data);

          // Set selected business type if already exists
          if (onboardingData.business_type_slug) {
            const type = response.data.data.find(
              bt => bt.slug === onboardingData.business_type_slug
            );
            setSelectedBusinessType(type);
            setValue("business_type_slug", type.slug);
          }
        } else {
          setError("Failed to load business types");
        }
      } catch (error) {
        console.error("Failed to fetch business types:", error);
        setError("Failed to load business types. Please refresh the page.");
      }
    };

    fetchBusinessTypes();
  }, [onboardingData.business_type_slug, setValue]);

  // Business type icon mapping
  const getBusinessTypeIcon = (iconName) => {
    const icons = {
      'user': <UserIcon className="h-5 w-5" />,
      'building': <BuildingOfficeIcon className="h-5 w-5" />,
      'store': <BuildingOfficeIcon className="h-5 w-5" />,
      'truck': <TruckIcon className="h-5 w-5" />,
      'users': <UsersIcon className="h-5 w-5" />,
      'default': <BuildingOfficeIcon className="h-5 w-5" />
    };
    return icons[iconName] || icons.default;
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image file");
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        setError("Logo size should be less than 2MB");
        return;
      }

      setStoreLogo(file);
      const previewUrl = URL.createObjectURL(file);
      setStoreLogoPreview(previewUrl);
      updateOnboardingData({ store_logo: previewUrl });
    }
  };

  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("Banner size should be less than 5MB");
        return;
      }

      setStoreBanner(file);
      const previewUrl = URL.createObjectURL(file);
      setStoreBannerPreview(previewUrl);
      updateOnboardingData({ store_banner: previewUrl });
    }
  };

  const handleBusinessTypeChange = (slug) => {
    const type = businessTypes.find(bt => bt.slug === slug);
    setSelectedBusinessType(type);
    setValue("business_type_slug", slug);

    // Update local storage
    updateOnboardingData({
      business_type_slug: slug,
      business_type_info: type
    });
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

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setError("");

    try {
      // Validate business type is selected
      if (!data.business_type_slug) {
        setError("Please select a business type");
        setIsSubmitting(false);
        return;
      }

      // Validate store name
      if (!data.store_name || data.store_name.trim() === '') {
        data.store_name = user?.name ? `${user.name}'s Store` : 'My Store';
        setValue('store_name', data.store_name);
        updateOnboardingData({ store_name: data.store_name });
      }

      // Upload images if selected
      let logoUrl = onboardingData.store_logo;
      let bannerUrl = onboardingData.store_banner;

      if (storeLogo && storeLogo instanceof File) {
        logoUrl = await uploadImage(storeLogo, "logo");
      }

      if (storeBanner && storeBanner instanceof File) {
        bannerUrl = await uploadImage(storeBanner, "banner");
      }

      // Prepare request data
      const requestData = {
        store_name: data.store_name.trim(),
        business_type_slug: data.business_type_slug,
        contact_email: data.contact_email,
        contact_phone: data.contact_phone,
        description: data.description || '',
        store_logo: logoUrl || null,
        store_banner: bannerUrl || null
      };

      console.log('Submitting store basic info:', requestData);

      // Make API call to save store basic info
      const response = await api.post('/seller/onboarding/store-basic', requestData);

      console.log('API Response:', response.data);

      // ✅ CHECK SUCCESS STATUS
      if (response.data.success) {
        // Update local storage with response data
        updateOnboardingData({
          ...data,
          store_logo: logoUrl || onboardingData.store_logo,
          store_banner: bannerUrl || onboardingData.store_banner,
          business_type_info: response.data.data?.business_type || selectedBusinessType
        });

        // Clear any errors
        setError("");

        // ✅ NAVIGATE ON SUCCESS
        navigate("/seller/onboarding/business-details");
      } else {
        setError(response.data.message || "Failed to save store information");
      }
    } catch (error) {
      console.error("Error saving store basic info:", error);

      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);

        if (error.response.status === 422) {
          const validationErrors = error.response.data.errors;
          if (validationErrors) {
            const errorMessages = Object.values(validationErrors).flat().join(', ');
            setError(`Validation errors: ${errorMessages}`);
          } else {
            setError(error.response.data.message || "Validation failed");
          }
        } else {
          setError(error.response.data.message || "Failed to save store information");
        }
      } else if (error.request) {
        console.error("No response received:", error.request);
        setError("No response from server. Please check your connection.");
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update local storage when form fields change
  useEffect(() => {
    const subscription = watch((value) => {
      updateOnboardingData(value);
    });
    return () => subscription.unsubscribe();
  }, [watch, updateOnboardingData]);

  // Pre-fill store name if user name exists and store name not set
  useEffect(() => {
    if (!onboardingData.store_name && user?.name) {
      const defaultStoreName = `${user.name}'s Store`;
      if (!onboardingData.store_name_cleared) {
        setValue('store_name', defaultStoreName);
        updateOnboardingData({
          store_name: defaultStoreName,
          store_name_cleared: false
        });
      }
    }
  }, [user, onboardingData.store_name, setValue, updateOnboardingData]);

  const handleStoreNameChange = (e) => {
    const value = e.target.value;
    if (value === '') {
      updateOnboardingData({ store_name_cleared: true });
    } else {
      updateOnboardingData({ store_name_cleared: false });
    }
  };

  // Check onboarding status on component mount
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const response = await api.get('/seller/onboarding/status');
        console.log('Onboarding status:', response.data);

        const { data } = response.data;

        if (data.needs_onboarding && data.current_step !== 'store-basic') {
          console.log('Redirecting to current step:', data.current_step);
          navigate(`/seller/onboarding/${data.current_step}`);
        }
      } catch (error) {
        console.error('Failed to check onboarding status:', error);
      }
    };

    checkOnboardingStatus();
  }, [navigate]);

  const handleContinue = async () => {
    console.log('Form data before validation:', watch());
    const isValid = await trigger();
    console.log('Form validation result:', isValid);
    console.log('Form errors:', errors);

    if (isValid) {
      await onSubmit(watch());
    } else {
      const firstError = Object.keys(errors)[0];
      if (firstError) {
        const element = document.getElementsByName(firstError)[0];
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.focus();
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-green-600 rounded-full flex items-center justify-center">
            <BuildingStorefrontIcon className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Store Basic Information
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Step 1 of 5 • Tell us about your store
          </p>
          <div className="mt-4 flex justify-center space-x-2">
            <div className="w-3 h-3 bg-green-600 rounded-full"></div>
            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form
          className="mt-8 space-y-6 bg-white p-8 rounded-2xl shadow-lg"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="space-y-6">
            {/* Store Media Uploads */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Logo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Store Logo
                </label>
                <div className="space-y-3">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden mx-auto">
                      {storeLogoPreview ? (
                        <img
                          src={storeLogoPreview}
                          alt="Store logo"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <BuildingStorefrontIcon className="h-8 w-8 text-gray-400" />
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block">
                      <span className="sr-only">Choose logo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-1 text-center">
                      Recommended: 400x400px, Max 2MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Banner Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Store Banner (Optional)
                </label>
                <div className="space-y-3">
                  <div className="relative">
                    <div className="w-full h-32 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden">
                      {storeBannerPreview ? (
                        <img
                          src={storeBannerPreview}
                          alt="Store banner"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <PhotoIcon className="h-8 w-8 text-gray-400" />
                      )}
                    </div>
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
                    <p className="text-xs text-gray-500 mt-1 text-center">
                      Recommended: 1200x300px, Max 5MB
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Store Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Store Name *
              </label>
              <input
                type="text"
                className={`mt-1 block w-full px-4 py-3 border ${errors.store_name ? "border-red-300" : "border-gray-300"
                  } rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200`}
                placeholder="Enter your store name"
                {...register("store_name", {
                  required: "Store name is required",
                  minLength: {
                    value: 2,
                    message: "Store name must be at least 2 characters"
                  }
                })}
                onChange={(e) => {
                  handleStoreNameChange(e);
                  register("store_name").onChange(e);
                }}
              />
              {errors.store_name && (
                <p className="mt-1 text-sm text-red-600">{errors.store_name.message}</p>
              )}
            </div>

            {/* Business Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Business Type *
              </label>
              <div className="mt-1 relative">
                <select
                  className={`block w-full px-4 py-3 border ${errors.business_type_slug ? "border-red-300" : "border-gray-300"
                    } rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 appearance-none bg-white`}
                  value={watch("business_type_slug")}
                  onChange={(e) => handleBusinessTypeChange(e.target.value)}
                  {...register("business_type_slug", {
                    required: "Business type is required"
                  })}
                >
                  <option value="">Select business type</option>
                  {businessTypes.map((type) => (
                    <option key={type.id} value={type.slug}>
                      {type.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                </div>
              </div>
              {errors.business_type_slug && (
                <p className="mt-1 text-sm text-red-600">{errors.business_type_slug.message}</p>
              )}

              {/* Business Type Description */}
              {selectedBusinessType && (
                <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg bg-${selectedBusinessType.color}-100`}>
                      {getBusinessTypeIcon(selectedBusinessType.icon)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-900">{selectedBusinessType.name}</p>
                      <p className="text-xs text-blue-700 mt-1">{selectedBusinessType.description}</p>
                      <div className="mt-2 text-xs text-blue-600">
                        <span className="font-medium">Document Requirements:</span>
                        <ul className="mt-1 space-y-1">
                          {selectedBusinessType.document_requirements?.map((req, index) => (
                            <li key={index} className="flex items-start">
                              <span className="mr-2">•</span>
                              <span>{req.label} {req.required ? '(Required)' : '(Optional)'}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Contact Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Contact Email *
              </label>
              <input
                type="email"
                className={`mt-1 block w-full px-4 py-3 border ${errors.contact_email ? "border-red-300" : "border-gray-300"
                  } rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200`}
                placeholder="contact@yourstore.com"
                {...register("contact_email", {
                  required: "Contact email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address"
                  }
                })}
              />
              {errors.contact_email && (
                <p className="mt-1 text-sm text-red-600">{errors.contact_email.message}</p>
              )}
            </div>

            {/* Contact Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Contact Phone *
              </label>
              <input
                type="tel"
                className={`mt-1 block w-full px-4 py-3 border ${errors.contact_phone ? "border-red-300" : "border-gray-300"
                  } rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200`}
                placeholder="+95 123 456 789"
                {...register("contact_phone", {
                  required: "Contact phone is required"
                })}
              />
              {errors.contact_phone && (
                <p className="mt-1 text-sm text-red-600">{errors.contact_phone.message}</p>
              )}
            </div>

            {/* Store Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Store Description (Optional)
              </label>
              <textarea
                rows={3}
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                placeholder="Describe your store and what you offer..."
                {...register("description")}
              />
              <p className="mt-1 text-xs text-gray-500">
                This will be displayed on your store page
              </p>
            </div>
          </div>

          {/* Business Type Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start">
              <InformationCircleIcon className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <p className="text-sm text-blue-700">
                  <span className="font-medium">Note:</span> Your business type determines the documents you'll need to upload later.
                </p>
                {selectedBusinessType?.is_individual && (
                  <p className="text-xs text-blue-600 mt-1">
                    As an individual seller, you'll only need to upload identity documents.
                  </p>
                )}
                {selectedBusinessType?.requires_registration && (
                  <p className="text-xs text-blue-600 mt-1">
                    Business types require registration documents, tax documents, and identity verification.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="button"
              onClick={handleContinue}
              disabled={isSubmitting}
              className="group relative w-full flex justify-center items-center py-4 px-6 border border-transparent text-lg font-medium rounded-xl text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <span>Continue to Business Details</span>
                  <ArrowRightIcon className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StoreBasicInfo;