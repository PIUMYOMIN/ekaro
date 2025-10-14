// src/pages/Seller/StorePolicies.jsx
import React,{useState} from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  ArrowRightIcon,
  ArrowLeftIcon,
  ShieldCheckIcon
} from "@heroicons/react/24/outline";
import api from "../../utils/api";

const StorePolicies = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    setError("");

    try {
      const storeResponse = await api.get("/sellers/my-store");
      const sellerId = storeResponse.data.data.id;

      await api.put(`/sellers/${sellerId}`, {
        return_policy: data.return_policy,
        warranty: data.warranty,
        warranty_type: data.warranty_type,
        warranty_period: data.warranty_period,
        social_facebook: data.social_facebook,
        social_instagram: data.social_instagram,
        social_twitter: data.social_twitter,
        shipping_details: data.shipping_details,
        shipping_cost: data.shipping_cost,
        min_order_unit: data.min_order_unit,
        moq: data.moq
      });

      navigate("/seller/onboarding/address");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update store policies");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-green-600 rounded-full flex items-center justify-center">
            <ShieldCheckIcon className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Store Policies & Social Media
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Configure your store policies and social media presence
          </p>
          <div className="mt-4 flex justify-center space-x-2">
            <div className="w-3 h-3 bg-green-600 rounded-full"></div>
            <div className="w-3 h-3 bg-green-600 rounded-full"></div>
            <div className="w-3 h-3 bg-green-600 rounded-full"></div>
            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6 bg-white p-8 rounded-2xl shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Return Policy */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Return Policy
              </label>
              <textarea
                rows={3}
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Describe your return policy..."
                {...register("return_policy")}
              />
            </div>

            {/* Warranty Information */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Warranty Type
              </label>
              <select
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                {...register("warranty_type")}
              >
                <option value="">Select warranty type</option>
                <option value="manufacturer">Manufacturer Warranty</option>
                <option value="seller">Seller Warranty</option>
                <option value="none">No Warranty</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Warranty Period
              </label>
              <input
                type="text"
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="e.g., 1 year, 6 months"
                {...register("warranty_period")}
              />
            </div>

            {/* Social Media */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Social Media Links</h3>
              <div className="space-y-4">
                <input
                  type="url"
                  className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Facebook URL"
                  {...register("social_facebook")}
                />
                <input
                  type="url"
                  className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Instagram URL"
                  {...register("social_instagram")}
                />
                <input
                  type="url"
                  className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Twitter URL"
                  {...register("social_twitter")}
                />
              </div>
            </div>

            {/* Shipping Information */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Shipping Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Shipping Cost (MMK)
                  </label>
                  <input
                    type="number"
                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    {...register("shipping_cost")}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Minimum Order Quantity
                  </label>
                  <input
                    type="number"
                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    {...register("moq")}
                  />
                </div>
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
              className="flex-1 py-4 px-6 border border-transparent text-white rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 font-medium flex items-center justify-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              ) : (
                <>
                  <span>Continue</span>
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

export default StorePolicies;