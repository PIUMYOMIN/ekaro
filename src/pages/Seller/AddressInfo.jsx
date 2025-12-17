import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  ArrowRightIcon,
  ArrowLeftIcon,
  MapPinIcon,
  GlobeAltIcon
} from "@heroicons/react/24/outline";
import api from "../../utils/api";
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
    watch,
    setValue
  } = useForm({
    defaultValues: {
      address: onboardingData.address || "",
      city: onboardingData.city || "",
      state: onboardingData.state || "",
      country: onboardingData.country || "Myanmar",
      postal_code: onboardingData.postal_code || "",
      location: onboardingData.location || "",
    }
  });

  useEffect(() => {
    // Set default country
    if (!onboardingData.country) {
      setValue('country', 'Myanmar');
      updateOnboardingData({ country: 'Myanmar' });
    }
  }, [onboardingData.country, setValue, updateOnboardingData]);

  const onSubmit = async (data) => {
    setLoading(true);
    setError("");

    try {
      // ✅ MAKE API CALL TO SAVE ADDRESS
      const response = await api.post('/seller/onboarding/address', data);
      
      // ✅ CHECK SUCCESS STATUS
      if (response.data.success) {
        // Update local storage with address info
        updateOnboardingData(data);
        setError("");
        
        // ✅ NAVIGATE ON SUCCESS
        navigate("/seller/onboarding/documents");
      } else {
        setError(response.data.message || "Failed to save address information");
      }
    } catch (error) {
      console.error("Error saving address:", error);
      
      if (error.response) {
        if (error.response.status === 422) {
          const validationErrors = error.response.data.errors;
          if (validationErrors) {
            const errorMessages = Object.values(validationErrors).flat().join(', ');
            setError(`Validation errors: ${errorMessages}`);
          } else {
            setError(error.response.data.message || "Validation failed");
          }
        } else {
          setError(error.response.data.message || "Failed to save address information");
        }
      } else if (error.request) {
        setError("No response from server. Please check your connection.");
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
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
            <MapPinIcon className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Address Information
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Step 3 of 5 • Where is your business located?
          </p>
          <div className="mt-4 flex justify-center space-x-2">
            <div className="w-3 h-3 bg-green-600 rounded-full"></div>
            <div className="w-3 h-3 bg-green-600 rounded-full"></div>
            <div className="w-3 h-3 bg-green-600 rounded-full"></div>
            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
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
              <label className="block text-sm font-medium text-gray-700">
                Full Address *
              </label>
              <textarea
                rows={3}
                className={`mt-1 block w-full px-4 py-3 border ${
                  errors.address ? "border-red-300" : "border-gray-300"
                } rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200`}
                placeholder="Building number, street name, ward, township"
                {...register("address", {
                  required: "Address is required"
                })}
              />
              {errors.address && (
                <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* City */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  City/Township *
                </label>
                <input
                  type="text"
                  className={`mt-1 block w-full px-4 py-3 border ${
                    errors.city ? "border-red-300" : "border-gray-300"
                  } rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200`}
                  placeholder="Enter your city"
                  {...register("city", {
                    required: "City is required"
                  })}
                />
                {errors.city && (
                  <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
                )}
              </div>

              {/* State/Region */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  State/Region *
                </label>
                <select
                  className={`mt-1 block w-full px-4 py-3 border ${
                    errors.state ? "border-red-300" : "border-gray-300"
                  } rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200`}
                  {...register("state", {
                    required: "State/Region is required"
                  })}
                >
                  <option value="">Select State/Region</option>
                  <option value="Yangon Region">Yangon Region</option>
                  <option value="Mandalay Region">Mandalay Region</option>
                  <option value="Sagaing Region">Sagaing Region</option>
                  <option value="Tanintharyi Region">Tanintharyi Region</option>
                  <option value="Bago Region">Bago Region</option>
                  <option value="Magway Region">Magway Region</option>
                  <option value="Ayeyarwady Region">Ayeyarwady Region</option>
                  <option value="Kachin State">Kachin State</option>
                  <option value="Kayah State">Kayah State</option>
                  <option value="Kayin State">Kayin State</option>
                  <option value="Chin State">Chin State</option>
                  <option value="Mon State">Mon State</option>
                  <option value="Rakhine State">Rakhine State</option>
                  <option value="Shan State">Shan State</option>
                  <option value="Naypyidaw Union Territory">Naypyidaw Union Territory</option>
                </select>
                {errors.state && (
                  <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Country */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Country *
                </label>
                <div className="relative">
                  <GlobeAltIcon className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    className={`mt-1 block w-full pl-11 pr-4 py-3 border ${
                      errors.country ? "border-red-300" : "border-gray-300"
                    } rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200`}
                    {...register("country", {
                      required: "Country is required"
                    })}
                  />
                </div>
                {errors.country && (
                  <p className="mt-1 text-sm text-red-600">{errors.country.message}</p>
                )}
              </div>

              {/* Postal Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Postal Code
                </label>
                <input
                  type="text"
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                  placeholder="Postal code (if applicable)"
                  {...register("postal_code")}
                />
              </div>
            </div>

            {/* Location/Map (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Location Pin (Optional)
              </label>
              <input
                type="text"
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                placeholder="Google Maps link or coordinates"
                {...register("location")}
              />
              <p className="mt-1 text-xs text-gray-500">
                Helps customers find your physical location
              </p>
            </div>
          </div>

          {/* Info Card */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start">
              <MapPinIcon className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <p className="text-sm text-blue-700">
                  <span className="font-medium">Next:</span> You'll need to upload documents for verification
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Required documents depend on your business type selected earlier
                </p>
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
              Back
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
                  <span>Continue to Documents</span>
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