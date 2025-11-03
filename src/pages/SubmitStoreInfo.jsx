import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline";
import api from "../utils/api";
import { useSellerOnboarding } from "../hooks/useSellerOnboarding";

const SubmitStoreInfo = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { onboardingData, clearOnboardingData, isLoaded } = useSellerOnboarding();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isLoaded) {
      const storedData = localStorage.getItem("seller_onboarding_data");
      console.log("🔍 SubmitStoreInfo - Raw localStorage:", storedData);
    }
  }, [onboardingData, isLoaded]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your store information...</p>
        </div>
      </div>
    );
  }

  const requiredFields = [
    {
      field: "store_name",
      label: "Store Name",
      value: onboardingData.store_name
    },
    {
      field: "business_type",
      label: "Business Type",
      value: onboardingData.business_type
    },
    {
      field: "contact_email",
      label: "Contact Email",
      value: onboardingData.contact_email
    },
    {
      field: "contact_phone",
      label: "Contact Phone",
      value: onboardingData.contact_phone
    },
    { field: "address", label: "Address", value: onboardingData.address },
    { field: "city", label: "City", value: onboardingData.city },
    { field: "state", label: "State", value: onboardingData.state },
    { field: "country", label: "Country", value: onboardingData.country }
  ];

  const missingFields = requiredFields.filter(
    (field) => !field.value || field.value.trim() === ""
  );

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      console.log("🚀 Submitting onboarding data:", onboardingData);

      // Use the new onboarding complete endpoint
      const response = await api.post("/seller/onboarding/complete", onboardingData);

      if (response.data.success) {
        console.log("✅ Onboarding completed successfully:", response.data);
        clearOnboardingData();
        navigate("/seller", {
          replace: true,
          state: {
            message: "Store submitted for approval!",
            success: true,
            store: response.data.data
          }
        });
      } else {
        throw new Error(response.data.message || "Failed to complete onboarding");
      }
    } catch (error) {
      console.error("❌ Failed to submit store information:", error);

      if (error.response?.status === 403) {
        setError(
          "Access denied: You don't have seller permissions. Please make sure you registered as a seller."
        );
      } else if (error.response?.status === 404) {
        setError(
          "API endpoint not found. Please check if the server is running correctly."
        );
      } else if (error.response?.data?.errors) {
        const firstError = Object.values(error.response.data.errors)[0][0];
        setError(firstError);
      } else {
        setError(
          error.response?.data?.message ||
            "Failed to submit store information. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-green-600 rounded-full flex items-center justify-center">
            <CheckCircleIcon className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Ready to Submit Your Store Information
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Review your information before submitting for approval
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="mt-8 space-y-6 bg-white p-8 rounded-2xl shadow-lg">
          {/* Requirements Check */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              Requirements Check
            </h3>

            {missingFields.length > 0 ? (
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
                <div className="flex">
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      Please complete the following required fields:
                    </p>
                    <ul className="mt-2 text-sm text-yellow-700 list-disc list-inside">
                      {missingFields.map((field) => (
                        <li key={field.field}>{field.label}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-green-50 border-l-4 border-green-500 p-4">
                <div className="flex">
                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                  <div className="ml-3">
                    <p className="text-sm text-green-700">
                      All required fields are completed! You're ready to submit.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Store Information Summary */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              Store Information Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {requiredFields.map((field) => (
                <div
                  key={field.field}
                  className={field.value ? "text-gray-900" : "text-red-600"}
                >
                  <strong>{field.label}:</strong>{" "}
                  {field.value || "Not provided"}
                </div>
              ))}
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => navigate("/seller/onboarding/address")}
              className="flex-1 py-4 px-6 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
            >
              Back to Edit
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || missingFields.length > 0}
              className="flex-1 py-4 px-6 border border-transparent text-white rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto"></div>
              ) : (
                "Submit for Approval"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmitStoreInfo;