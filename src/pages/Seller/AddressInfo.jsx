// src/pages/Seller/AddressInfo.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  ArrowRightIcon,
  ArrowLeftIcon,
  MapPinIcon
} from "@heroicons/react/24/outline";
import { useSellerOnboarding } from "../../hooks/useSellerOnboarding";

const AddressInfo = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { onboardingData, updateOnboardingData } = useSellerOnboarding();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm({
    defaultValues: {
      address: onboardingData.address,
      city: onboardingData.city,
      state: onboardingData.state,
      country: onboardingData.country,
      postal_code: onboardingData.postal_code,
      location: onboardingData.location,
    }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setError("");

    try {
      // Update local storage with address info
      updateOnboardingData(data);
      
      // Move to submit page
      navigate("/seller/onboarding/submit");
    } catch (error) {
      setError("Failed to save address information");
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
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-green-600 rounded-full flex items-center justify-center">
            <MapPinIcon className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {t("seller_onboarding.addressInfo.title")}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {t("seller_onboarding.addressInfo.subtitle")}
          </p>
          <div className="mt-4 flex justify-center space-x-2">
            <div className="w-3 h-3 bg-green-600 rounded-full"></div>
            <div className="w-3 h-3 bg-green-600 rounded-full"></div>
            <div className="w-3 h-3 bg-green-600 rounded-full"></div>
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
          <div className="space-y-4">
            {/* Address */}
            <div>
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700"
              >
                {t("seller_onboarding.addressInfo.address.label")} *
              </label>
              <textarea
                id="address"
                rows={3}
                className={`mt-1 block w-full px-4 py-3 border ${
                  errors.address ? "border-red-300" : "border-gray-300"
                } rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200`}
                placeholder={t(
                  "seller_onboarding.addressInfo.address.placeholder"
                )}
                {...register("address", {
                  required: t("validation.required")
                })}
              />
              {errors.address && (
                <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* City */}
              <div>
                <label
                  htmlFor="city"
                  className="block text-sm font-medium text-gray-700"
                >
                  {t("seller_onboarding.addressInfo.city.label")} *
                </label>
                <input
                  id="city"
                  type="text"
                  className={`mt-1 block w-full px-4 py-3 border ${
                    errors.city ? "border-red-300" : "border-gray-300"
                  } rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200`}
                  placeholder={t(
                    "seller_onboarding.addressInfo.city.placeholder"
                  )}
                  {...register("city", {
                    required: t("validation.required")
                  })}
                />
                {errors.city && (
                  <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
                )}
              </div>

              {/* State */}
              <div>
                <label
                  htmlFor="state"
                  className="block text-sm font-medium text-gray-700"
                >
                  {t("seller_onboarding.addressInfo.stateRegion.label")} *
                </label>
                <input
                  id="state"
                  type="text"
                  className={`mt-1 block w-full px-4 py-3 border ${
                    errors.state ? "border-red-300" : "border-gray-300"
                  } rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200`}
                  placeholder={t(
                    "seller_onboarding.addressInfo.stateRegion.placeholder"
                  )}
                  {...register("state", {
                    required: t("validation.required")
                  })}
                />
                {errors.state && (
                  <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Country */}
              <div>
                <label
                  htmlFor="country"
                  className="block text-sm font-medium text-gray-700"
                >
                  {t("seller_onboarding.addressInfo.country.label")} *
                </label>
                <input
                  id="country"
                  type="text"
                  className={`mt-1 block w-full px-4 py-3 border ${
                    errors.country ? "border-red-300" : "border-gray-300"
                  } rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200`}
                  {...register("country", {
                    required: t("validation.required")
                  })}
                />
                {errors.country && (
                  <p className="mt-1 text-sm text-red-600">{errors.country.message}</p>
                )}
              </div>

              {/* Postal Code */}
              <div>
                <label
                  htmlFor="postal_code"
                  className="block text-sm font-medium text-gray-700"
                >
                  {t("seller_onboarding.addressInfo.postalCode.label")} *
                </label>
                <input
                  id="postal_code"
                  type="text"
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                  placeholder={t(
                    "seller_onboarding.addressInfo.postalCode.placeholder"
                  )}
                  {...register("postal_code")}
                />
              </div>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => navigate("/seller/onboarding/business-details")}
              className="flex-1 py-4 px-6 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium flex items-center justify-center"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              {t("seller_onboarding.back")}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-4 px-6 border border-transparent text-white rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 font-medium flex items-center justify-center shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              ) : (
                <>
                  <span>{t("seller_onboarding.continue")}</span>
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddressInfo;