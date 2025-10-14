// src/pages/Seller/BusinessDetails.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  ArrowRightIcon,
  ArrowLeftIcon,
  DocumentTextIcon
} from "@heroicons/react/24/outline";
import { useSellerOnboarding } from "../../hooks/useSellerOnboarding";

const BusinessDetails = () => {
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
      business_registration_number: onboardingData.business_registration_number,
      tax_id: onboardingData.tax_id,
      website: onboardingData.website,
      account_number: onboardingData.account_number,
      social_facebook: onboardingData.social_facebook,
      social_instagram: onboardingData.social_instagram,
      social_twitter: onboardingData.social_twitter,
      social_linkedin: onboardingData.social_linkedin,
    }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setError("");

    try {
      // Update local storage with business details
      updateOnboardingData(data);
      
      // Move to next step
      navigate("/seller/onboarding/address");
    } catch (error) {
      setError("Failed to save business details");
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
            <DocumentTextIcon className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {t("seller_onboarding.businessDetails.title")}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {t("seller_onboarding.businessDetails.subtitle")}
          </p>
          <div className="mt-4 flex justify-center space-x-2">
            <div className="w-3 h-3 bg-green-600 rounded-full"></div>
            <div className="w-3 h-3 bg-green-600 rounded-full"></div>
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
          <div className="space-y-4">
            {/* Business Registration Number */}
            <div>
              <label
                htmlFor="business_registration_number"
                className="block text-sm font-medium text-gray-700"
              >
                {t("seller_onboarding.businessDetails.registrationNumber.label")}
              </label>
              <input
                id="business_registration_number"
                type="text"
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                placeholder={t(
                  "seller_onboarding.businessDetails.registrationNumber.placeholder"
                )}
                {...register("business_registration_number")}
              />
            </div>

            {/* Tax ID */}
            <div>
              <label
                htmlFor="tax_id"
                className="block text-sm font-medium text-gray-700"
              >
                {t("seller_onboarding.businessDetails.taxId.label")}
              </label>
              <input
                id="tax_id"
                type="text"
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                placeholder={t(
                  "seller_onboarding.businessDetails.taxId.placeholder"
                )}
                {...register("tax_id")}
              />
            </div>

            {/* Website */}
            <div>
              <label
                htmlFor="website"
                className="block text-sm font-medium text-gray-700"
              >
                {t("seller_onboarding.businessDetails.website.label")}
              </label>
              <input
                id="website"
                type="url"
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                placeholder={t(
                  "seller_onboarding.businessDetails.website.placeholder"
                )}
                {...register("website")}
              />
            </div>

            {/* Account Number */}
            <div>
              <label
                htmlFor="account_number"
                className="block text-sm font-medium text-gray-700"
              >
                {t("seller_onboarding.businessDetails.accountNumber.label")}
              </label>
              <input
                id="account_number"
                type="text"
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                placeholder={t(
                  "seller_onboarding.businessDetails.accountNumber.placeholder"
                )}
                {...register("account_number")}
              />
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => navigate("/seller/onboarding/store-basic")}
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

export default BusinessDetails;