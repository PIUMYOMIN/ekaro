import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  BuildingStorefrontIcon,
  PencilIcon,
  MapPinIcon,
  GlobeAltIcon,
  PhoneIcon,
  EnvelopeIcon,
  StarIcon,
  CalendarIcon,
  UsersIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
  ClockIcon
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

const MyStore = ({ storeData, stats, refreshData }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Helper function to get full image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;

    // Try to get REACT_APP_API_URL from window._env_ (for frontend env injection)
    let baseUrl = "https://db.pyonea.com";
    if (typeof window !== 'undefined') {
      if (window._env_ && window._env_.REACT_APP_API_URL) {
        baseUrl = window._env_.REACT_APP_API_URL;
      } else if (window.REACT_APP_API_URL) {
        baseUrl = window.REACT_APP_API_URL;
      }
    }

    if (imagePath.startsWith('http')) {
      return imagePath;
    }

    // Handle different path formats
    if (imagePath.includes('storage/')) {
      return `${baseUrl}/${imagePath}`;
    }

    if (imagePath.includes('stores/') || imagePath.includes('store_profile/') || imagePath.includes('products/')) {
      return `${baseUrl}/storage/${imagePath}`;
    }

    // Default case - assume it's a storage path
    return `${baseUrl}/storage/${imagePath}`;
  };

  // Get full URLs for display
  const displayLogoUrl = getImageUrl(storeData?.store_logo);
  const displayBannerUrl = getImageUrl(storeData?.store_banner);

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

  // Calculate rating statistics
  const rating = storeData.reviews_avg_rating || 0;
  const totalReviews = storeData.reviews_count || 0;
  const memberSince = new Date(storeData.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long'
  });

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
          onClick={() => navigate('/seller/dashboard?tab=my-store&edit=true')}
          className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all duration-200 font-medium"
        >
          <PencilIcon className="h-4 w-4" />
          <span>Edit Store</span>
        </button>
      </div>

      {/* Store Header with Stats */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Store Banner */}
        {displayBannerUrl && (
          <div className="h-48 bg-gradient-to-r from-green-500 to-emerald-600 relative">
            <img
              src={displayBannerUrl}
              alt="Store banner"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
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
                  e.target.style.display = 'none';
                  // Show fallback icon
                  const fallback = e.target.parentNode.querySelector('.logo-fallback');
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
            ) : (
              <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center shadow-lg logo-fallback">
                <BuildingStorefrontIcon className="h-10 w-10 text-white" />
              </div>
            )}

            {/* Fallback if image fails to load */}
            <div
              className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center shadow-lg logo-fallback hidden"
            >
              <BuildingStorefrontIcon className="h-10 w-10 text-white" />
            </div>

            <div className="flex-1">
              <h1 className="text-2xl font-bold">{storeData.store_name}</h1>
              <p className={`mt-1 ${displayBannerUrl ? 'text-gray-600' : 'text-green-100 opacity-90'}`}>
                {storeData.description || storeData.store_description || "No description provided"}
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${storeData.status === 'approved' || storeData.status === 'active'
                    ? 'bg-green-400 text-white'
                    : storeData.status === 'pending'
                      ? 'bg-yellow-400 text-white'
                      : 'bg-blue-400 text-white'
                  }`}>
                  {storeData.status?.charAt(0).toUpperCase() + storeData.status?.slice(1)}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${storeData.verification_status === 'verified'
                    ? 'bg-blue-400 text-white'
                    : 'bg-gray-400 text-white'
                  }`}>
                  {storeData.verification_status?.charAt(0).toUpperCase() + storeData.verification_status?.slice(1)}
                </span>
                <span className={`text-sm ${displayBannerUrl ? 'text-gray-600' : 'text-green-100'}`}>
                  <CalendarIcon className="h-3 w-3 inline mr-1" />
                  Since {memberSince}
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
              <div className="text-sm text-green-800 flex items-center justify-center">
                <ShoppingBagIcon className="h-4 w-4 mr-1" />
                Total Products
              </div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.totalOrders || 0}</div>
              <div className="text-sm text-blue-800 flex items-center justify-center">
                <ShoppingBagIcon className="h-4 w-4 mr-1" />
                Total Orders
              </div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {stats.totalRevenue ? `${parseInt(stats.totalRevenue).toLocaleString()} MMK` : '0 MMK'}
              </div>
              <div className="text-sm text-purple-800 flex items-center justify-center">
                <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                Total Revenue
              </div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{stats.pendingOrders || 0}</div>
              <div className="text-sm text-orange-800 flex items-center justify-center">
                <ClockIcon className="h-4 w-4 mr-1" />
                Pending Orders
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-green-50 rounded-lg">
                  <EnvelopeIcon className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">{storeData.contact_email || "Not provided"}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <PhoneIcon className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium text-gray-900">{storeData.contact_phone || "Not provided"}</p>
                </div>
              </div>
              {storeData.website && (
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <GlobeAltIcon className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Website</p>
                    <a
                      href={storeData.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-green-600 hover:text-green-700 break-all"
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
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Location</h3>
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-red-50 rounded-lg">
                <MapPinIcon className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {storeData.address ?
                    `${storeData.address}, ${storeData.city}, ${storeData.state}, ${storeData.country}`
                    : "No address provided"
                  }
                </p>
                {storeData.postal_code && (
                  <p className="text-sm text-gray-500 mt-1">Postal Code: {storeData.postal_code}</p>
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
                <p className="font-medium text-gray-900">{storeData.business_type || "Not specified"}</p>
              </div>
              {storeData.business_registration_number && (
                <div>
                  <p className="text-sm text-gray-500">Registration Number</p>
                  <p className="font-medium text-gray-900">{storeData.business_registration_number}</p>
                </div>
              )}
              {storeData.tax_id && (
                <div>
                  <p className="text-sm text-gray-500">Tax ID</p>
                  <p className="font-medium text-gray-900">{storeData.tax_id}</p>
                </div>
              )}
              {storeData.account_number && (
                <div>
                  <p className="text-sm text-gray-500">Account Number</p>
                  <p className="font-medium text-gray-900">{storeData.account_number}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Store Rating */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Rating</h3>
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <div className="flex mr-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <StarIcon
                        key={star}
                        className={`h-6 w-6 ${star <= rating
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                          }`}
                      />
                    ))}
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{rating.toFixed(1)}</span>
                </div>
                <p className="text-sm text-gray-500">
                  Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
                </p>
              </div>
            </div>
          </div>

          {/* Social Media Links */}
          {(storeData.social_facebook || storeData.social_instagram || storeData.social_twitter) && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Social Media</h3>
              <div className="space-y-3">
                {storeData.social_facebook && (
                  <a
                    href={storeData.social_facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold">f</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">Facebook</span>
                  </a>
                )}
                {storeData.social_instagram && (
                  <a
                    href={storeData.social_instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-3 p-3 bg-pink-50 rounded-lg hover:bg-pink-100 transition-colors"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold">IG</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">Instagram</span>
                  </a>
                )}
                {storeData.social_twitter && (
                  <a
                    href={storeData.social_twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-3 p-3 bg-sky-50 rounded-lg hover:bg-sky-100 transition-colors"
                  >
                    <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold">𝕏</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">Twitter</span>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-lg p-6 text-white">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/seller/dashboard?tab=edit-store')}
                className="w-full py-3 bg-white/20 hover:bg-white/30 rounded-xl transition-colors text-sm font-medium"
              >
                Edit Store Profile
              </button>
              <button
                onClick={() => navigate('/seller/dashboard?tab=settings')}
                className="w-full py-3 bg-white/20 hover:bg-white/30 rounded-xl transition-colors text-sm font-medium"
              >
                Store Settings
              </button>
              <button
                onClick={() => navigate('/seller/dashboard?tab=product')}
                className="w-full py-3 bg-white/20 hover:bg-white/30 rounded-xl transition-colors text-sm font-medium"
              >
                Manage Products
              </button>
              <button
                onClick={() => navigate('/seller/dashboard?tab=order')}
                className="w-full py-3 bg-white/20 hover:bg-white/30 rounded-xl transition-colors text-sm font-medium"
              >
                View Orders
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyStore;