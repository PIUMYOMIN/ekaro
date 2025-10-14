// src/pages/Seller/StoreBasicInfo.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  ArrowRightIcon,
  BuildingStorefrontIcon,
  PhotoIcon
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
  const [storeLogo, setStoreLogo] = useState(null);
  const [storeLogoPreview, setStoreLogoPreview] = useState(onboardingData.store_logo || "");
  const [storeBanner, setStoreBanner] = useState(null);
  const [storeBannerPreview, setStoreBannerPreview] = useState(onboardingData.store_banner || "");

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm({
    defaultValues: {
      store_name: onboardingData.store_name,
      business_type: onboardingData.business_type,
      contact_email: onboardingData.contact_email || user?.email,
      contact_phone: onboardingData.contact_phone || user?.phone,
      description: onboardingData.description,
    }
  });

  useEffect(() => {
    const fetchBusinessTypes = async () => {
      try {
        const response = await api.get("/business-types");
        setBusinessTypes(response.data.data);
      } catch (error) {
        console.log("Using default business types");
        setBusinessTypes([
          { value: "retail", label: "Retail Business" },
          { value: "wholesale", label: "Wholesale Business" },
          { value: "service", label: "Service Business" },
          { value: "individual", label: "Individual/Sole Proprietorship" },
          { value: "company", label: "Company" }
        ]);
      }
    };

    fetchBusinessTypes();
  }, []);

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
  setLoading(true);
  setError("");

  try {
    // Upload images if selected
    let logoUrl = onboardingData.store_logo;
    let bannerUrl = onboardingData.store_banner;

    if (storeLogo) {
      logoUrl = await uploadImage(storeLogo, "logo");
    }

    if (storeBanner) {
      bannerUrl = await uploadImage(storeBanner, "banner");
    }

    // ✅ Create complete form data object
    const formData = {
      ...data,
      store_logo: logoUrl,
      store_banner: bannerUrl
    };
    
    console.log('Saving StoreBasicInfo data:', formData); // Debug log
    
    // ✅ Update local storage with current form data
    updateOnboardingData(formData);

    // ✅ Add a small delay to ensure state is updated before navigation
    setTimeout(() => {
      navigate("/seller/onboarding/business-details");
    }, 100);

  } catch (error) {
    console.error("Error saving store basic info:", error);
    setError(
      error.response?.data?.message || "Failed to save store information"
    );
  } finally {
    setLoading(false);
  }
};

  // Update local storage when form fields change
  useEffect(() => {
    const subscription = watch((value) => {
      updateOnboardingData(value);
    });
    return () => subscription.unsubscribe();
  }, [watch, updateOnboardingData]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-green-600 rounded-full flex items-center justify-center">
            <BuildingStorefrontIcon className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {t("seller_onboarding.storeBasicInfo.title")}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {t("seller_onboarding.storeBasicInfo.subtitle")}
          </p>
          <div className="mt-4 flex justify-center space-x-2">
            <div className="w-3 h-3 bg-green-600 rounded-full"></div>
            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <p className="text-sm text-red-700">{error}</p>
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
                  {t("seller_onboarding.storeBasicInfo.store.logo")}
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
                  {t("seller_onboarding.storeBasicInfo.store.banner")}
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
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                {t("seller_onboarding.storeBasicInfo.store.name")} *
              </label>
              <input
                id="name"
                type="text"
                className={`mt-1 block w-full px-4 py-3 border ${
                  errors.store_name ? "border-red-300" : "border-gray-300"
                } rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200`}
                placeholder={t(
                  "seller_onboarding.storeBasicInfo.store.placeholder"
                )}
                {...register("store_name", {
                  required: t("validation.required"),
                  minLength: {
                    value: 2,
                    message: t("validation.minLength", { count: 2 })
                  }
                })}
              />
              {errors.store_name && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.store_name.message}
                </p>
              )}
            </div>

            {/* Business Type */}
            <div>
              <label htmlFor="business_type" className="block text-sm font-medium text-gray-700">
                {t("seller_onboarding.storeBasicInfo.businessType.label")} *
              </label>
              <select
                id="business_type"
                className={`mt-1 block w-full px-4 py-3 border ${
                  errors.business_type ? "border-red-300" : "border-gray-300"
                } rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200`}
                {...register("business_type", {
                  required: t("validation.required")
                })}
              >
                <option value="">
                  {t("seller_onboarding.storeBasicInfo.businessType.selectBusinessType")}
                </option>
                {businessTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              {errors.business_type && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.business_type.message}
                </p>
              )}
            </div>

            {/* Contact Email */}
            <div>
              <label htmlFor="contact_email" className="block text-sm font-medium text-gray-700">
                {t("seller_onboarding.storeBasicInfo.contactEmail.label")} *
              </label>
              <input
                id="contact_email"
                type="email"
                className={`mt-1 block w-full px-4 py-3 border ${
                  errors.contact_email ? "border-red-300" : "border-gray-300"
                } rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200`}
                placeholder={t(
                  "seller_onboarding.storeBasicInfo.contactEmail.placeholder"
                )}
                {...register("contact_email", {
                  required: t("validation.required"),
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: t("validation.invalidEmail")
                  }
                })}
              />
              {errors.contact_email && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.contact_email.message}
                </p>
              )}
            </div>

            {/* Contact Phone */}
            <div>
              <label htmlFor="contact_phone" className="block text-sm font-medium text-gray-700">
                {t("seller_onboarding.storeBasicInfo.contactPhone.label")} *
              </label>
              <input
                id="contact_phone"
                type="tel"
                className={`mt-1 block w-full px-4 py-3 border ${
                  errors.contact_phone ? "border-red-300" : "border-gray-300"
                } rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200`}
                placeholder={t(
                  "seller_onboarding.storeBasicInfo.contactPhone.placeholder"
                )}
                {...register("contact_phone", {
                  required: t("validation.required")
                })}
              />
              {errors.contact_phone && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.contact_phone.message}
                </p>
              )}
            </div>

            {/* Store Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                {t("seller_onboarding.storeBasicInfo.description.label")}
              </label>
              <textarea
                id="description"
                rows={3}
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                placeholder={t(
                  "seller_onboarding.storeBasicInfo.description.placeholder"
                )}
                {...register("description")}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center items-center py-4 px-6 border border-transparent text-lg font-medium rounded-xl text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              ) : (
                <>
                  <span>{t("seller_onboarding.continue")}</span>
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