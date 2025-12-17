import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  ArrowRightIcon,
  ArrowLeftIcon,
  DocumentTextIcon,
  BuildingOfficeIcon,
  IdentificationIcon,
  CreditCardIcon,
  InformationCircleIcon,
  GlobeAltIcon,
  UserGroupIcon
} from "@heroicons/react/24/outline";
import api from "../../utils/api";
import { useSellerOnboarding } from "../../hooks/useSellerOnboarding";
import { useAuth } from "../../context/AuthContext";

const BusinessDetails = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { onboardingData, updateOnboardingData } = useSellerOnboarding();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isIndividual, setIsIndividual] = useState(true);
  const [businessTypeInfo, setBusinessTypeInfo] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [missingBusinessType, setMissingBusinessType] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    trigger,
    clearErrors
  } = useForm({
    defaultValues: {
      business_registration_number: onboardingData.business_registration_number || "",
      tax_id: onboardingData.tax_id || "",
      website: onboardingData.website || "",
      account_number: onboardingData.account_number || "",
      social_facebook: onboardingData.social_facebook || "",
      social_instagram: onboardingData.social_instagram || "",
      social_twitter: onboardingData.social_twitter || "",
      social_linkedin: onboardingData.social_linkedin || "",
    }
  });

  useEffect(() => {
    if (!initializing) return;
  
    let isMounted = true;

    const initializeData = async () => {
      try {
        console.log("Initializing Business Details with onboarding data:", onboardingData);

        // Check if business type is selected
        if (!onboardingData.business_type_slug) {
          console.error("No business type selected!");
          setMissingBusinessType(true);
          setError("Please select a business type first. Redirecting to store info...");
          setTimeout(() => {
            navigate("/seller/onboarding/store-basic");
          }, 2000);
          return;
        }

        // Get business type info
        let businessTypeData = onboardingData.business_type_info;

        if (!businessTypeData && isMounted) {
          // Fetch business type info from API
          console.log("Fetching business type info for slug:", onboardingData.business_type_slug);
          const response = await api.get(`/business-types/${onboardingData.business_type_slug}`);
          if (response.data.success && isMounted) {
            businessTypeData = response.data.data;
            console.log("Fetched business type info:", businessTypeData);
            setBusinessTypeInfo(businessTypeData);
            setIsIndividual(businessTypeData.is_individual);
            // Cache it
            updateOnboardingData({ business_type_info: businessTypeData });
          } else {
            throw new Error("Failed to fetch business type info");
          }
        } else if (isMounted) {
          setBusinessTypeInfo(businessTypeData);
          setIsIndividual(businessTypeData.is_individual);
        }

      } catch (error) {
        if (isMounted) {
          console.error("Failed to initialize business details:", error);
          setError(`Failed to load business information: ${error.message}`);
        }
      } finally {
        if (isMounted) {
          setInitializing(false);
        }
      }
    };

    initializeData();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [onboardingData, navigate, updateOnboardingData]);

  const onSubmit = async (data) => {
    setLoading(true);
    setError("");

    try {
      console.log("Submitting business details:", data);
      console.log("Is Individual:", isIndividual);

      // Only validate business registration for NON-individual types
      if (!isIndividual) {
        const missingFields = [];
        
        if (!data.business_registration_number?.trim()) {
          missingFields.push("Business Registration Number");
        }

        if (!data.tax_id?.trim()) {
          missingFields.push("Tax ID");
        }

        if (missingFields.length > 0) {
          setError(`Please fill in required fields: ${missingFields.join(', ')}`);
          setLoading(false);
          return;
        }
      }

      // Make API call
      console.log("Making API call to /seller/onboarding/business-details");
      const response = await api.post('/seller/onboarding/business-details', data);

      console.log("API Response:", response.data);

      // ✅ CHECK SUCCESS STATUS
      if (response.data.success) {
        // Update local storage with business details
        updateOnboardingData(data);

        // Clear any errors
        setError("");

        // ✅ NAVIGATE ON SUCCESS
        navigate("/seller/onboarding/address");
      } else {
        setError(response.data.message || "Failed to save business details");
      }
    } catch (error) {
      console.error("Error saving business details:", error);

      if (error.response) {
        console.error("Response status:", error.response.status);
        console.error("Response data:", error.response.data);

        if (error.response.status === 422) {
          const validationErrors = error.response.data.errors;
          if (validationErrors) {
            const errorMessages = Object.values(validationErrors).flat().join(', ');
            setError(`Validation errors: ${errorMessages}`);
          } else {
            setError(error.response.data.message || "Validation failed");
          }
        } else if (error.response.status === 401) {
          setError("Session expired. Please log in again.");
          setTimeout(() => {
            navigate("/login");
          }, 3000);
        } else {
          setError(error.response.data.message || "Failed to save business details");
        }
      } else if (error.request) {
        console.error("No response received:", error.request);
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
      console.log("Form changed, updating local storage:", value);
      updateOnboardingData(value);
    });
    return () => subscription.unsubscribe();
  }, [watch, updateOnboardingData]);

  // Show loading while initializing
  if (initializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading business details...</p>
          <p className="text-xs text-gray-500 mt-2">Please wait while we load your information</p>
        </div>
      </div>
    );
  }

  // Show error if business type is missing
  if (missingBusinessType) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="max-w-md w-full text-center">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-6">
            <p className="text-red-700">{error}</p>
          </div>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-300 rounded w-3/4 mx-auto mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-green-600 rounded-full flex items-center justify-center">
            <DocumentTextIcon className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {isIndividual ? 'Business Information' : 'Company Registration Details'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Step 2 of 5 • {isIndividual ? 'Add your business information' : 'Enter your company details'}
          </p>
          <div className="mt-4 flex justify-center space-x-2">
            <div className="w-3 h-3 bg-green-600 rounded-full"></div>
            <div className="w-3 h-3 bg-green-600 rounded-full"></div>
            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Business Type Info Card */}
        {businessTypeInfo && (
          <div className={`border rounded-xl p-4 ${isIndividual ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}`}>
            <div className="flex items-start">
              <InformationCircleIcon className={`h-5 w-5 mt-0.5 mr-2 flex-shrink-0 ${isIndividual ? 'text-green-500' : 'text-blue-500'}`} />
              <div>
                <p className={`text-sm ${isIndividual ? 'text-green-700' : 'text-blue-700'}`}>
                  <span className="font-medium">Business Type:</span> {businessTypeInfo.name}
                </p>
                <p className={`text-xs ${isIndividual ? 'text-green-600' : 'text-blue-600'} mt-1`}>
                  {isIndividual
                    ? "As an individual seller, business registration details are optional."
                    : "Business registration and tax documents are required for verification."
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        <form
          className="mt-8 space-y-6 bg-white p-8 rounded-2xl shadow-lg"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="space-y-6">
            {/* Business Registration Details - Only for non-individuals */}
            {!isIndividual && (
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <BuildingOfficeIcon className="h-5 w-5 mr-2 text-blue-600" />
                  Business Registration
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Business Registration Number *
                    </label>
                    <input
                      type="text"
                      className={`mt-1 block w-full px-4 py-3 border ${errors.business_registration_number ? "border-red-300" : "border-gray-300"
                        } rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200`}
                      placeholder="Enter your business registration number"
                      {...register("business_registration_number", {
                        required: !isIndividual ? "Business registration number is required" : false
                      })}
                    />
                    {errors.business_registration_number && (
                      <p className="mt-1 text-sm text-red-600">{errors.business_registration_number.message}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      As shown on your business registration certificate
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Tax Identification Number *
                    </label>
                    <input
                      type="text"
                      className={`mt-1 block w-full px-4 py-3 border ${errors.tax_id ? "border-red-300" : "border-gray-300"
                        } rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200`}
                      placeholder="Enter your tax ID"
                      {...register("tax_id", {
                        required: !isIndividual ? "Tax ID is required" : false
                      })}
                    />
                    {errors.tax_id && (
                      <p className="mt-1 text-sm text-red-600">{errors.tax_id.message}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      Your official tax identification number
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Financial Information */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <CreditCardIcon className="h-5 w-5 mr-2 text-purple-600" />
                Financial Information (Optional)
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Bank Account Number
                  </label>
                  <input
                    type="text"
                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                    placeholder="Enter your bank account number"
                    {...register("account_number")}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    For receiving payments from sales (can be added later)
                  </p>
                </div>
              </div>
            </div>

            {/* Online Presence */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <GlobeAltIcon className="h-5 w-5 mr-2 text-indigo-600" />
                Online Presence (Optional)
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Website
                  </label>
                  <div className="mt-1 flex rounded-xl shadow-sm">
                    <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                      https://
                    </span>
                    <input
                      type="text"
                      className="flex-1 min-w-0 block w-full px-3 py-3 rounded-none rounded-r-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="yourstore.com"
                      {...register("website")}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Social Media Links
                  </label>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <span className="inline-flex items-center px-3 py-2 rounded-l-xl border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                        facebook.com/
                      </span>
                      <input
                        type="text"
                        className="flex-1 rounded-none rounded-r-xl border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="yourpage"
                        {...register("social_facebook")}
                      />
                    </div>
                    <div className="flex items-center">
                      <span className="inline-flex items-center px-3 py-2 rounded-l-xl border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                        instagram.com/
                      </span>
                      <input
                        type="text"
                        className="flex-1 rounded-none rounded-r-xl border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="yourprofile"
                        {...register("social_instagram")}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Document Requirements Preview */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex items-start">
              {isIndividual ? (
                <UserGroupIcon className="h-5 w-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
              ) : (
                <BuildingOfficeIcon className="h-5 w-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
              )}
              <div>
                <p className="text-sm text-yellow-800">
                  <span className="font-medium">Next Step - Address:</span> You'll need to provide your business address next.
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate("/seller/onboarding/store-basic")}
              className="flex-1 py-4 px-6 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium flex items-center justify-center shadow-sm hover:shadow"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-4 px-6 border border-transparent text-white rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 font-medium flex items-center justify-center shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <span>Continue to Address</span>
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