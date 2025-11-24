import React from "react";
import { Link } from "react-router-dom";
import { StarIcon, CheckBadgeIcon } from "@heroicons/react/24/solid";
import { motion } from "framer-motion";

const SellerCard = ({ seller }) => {
  // Use the actual API data structure
  const apiSeller = seller.originalData || seller;
  
  // Map API properties to component expectations
  const storeName = apiSeller.store_name || 'Unknown Seller';
  const displayRating = Number(apiSeller.reviews_avg_rating) || 0;
  const reviewsCount = apiSeller.reviews_count || 0;
  const productsCount = apiSeller.products_count || 0;
  const city = apiSeller.city || apiSeller.user?.city || 'Unknown City';
  const storeLogo = apiSeller.store_logo;
  const businessType = apiSeller.business_type || "General Merchant";
  const isVerified = apiSeller.status === 'approved' || apiSeller.status === 'active';
  
  // Render star ratings
  const renderStars = (rating) => {
    if (!rating || rating === 0) {
      return (
        <div className="flex items-center">
          {[...Array(5)].map((_, i) => (
            <StarIcon key={i} className="h-4 w-4 text-gray-300" />
          ))}
          <span className="ml-1 text-sm text-gray-500">No ratings</span>
        </div>
      );
    }

    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<StarIcon key={i} className="h-4 w-4 text-yellow-400" fill="currentColor" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<StarIcon key={i} className="h-4 w-4 text-yellow-400" fill="currentColor" />);
      } else {
        stars.push(<StarIcon key={i} className="h-4 w-4 text-gray-300" />);
      }
    }
    
    return stars;
  };

  return (
    <motion.div
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-100"
      whileHover={{ y: -5 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-4">
        <div className="flex items-start space-x-3">
          {/* Seller Logo */}
          <div className="flex-shrink-0 relative">
            {storeLogo ? (
              <div className="relative">
                <img
                  src={storeLogo}
                  alt={storeName}
                  className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                  onError={(e) => {
                    // If image fails to load, hide it and show fallback
                    e.target.style.display = 'none';
                    const fallback = e.target.parentElement?.nextElementSibling;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
                {isVerified && (
                  <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                    <CheckBadgeIcon className="h-4 w-4 text-green-500" />
                  </div>
                )}
              </div>
            ) : null}
            
            {/* Fallback when no logo or image fails to load */}
            <div 
              className={`${storeLogo ? 'hidden' : 'flex'} relative bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-dashed border-gray-300 rounded-full w-16 h-16 items-center justify-center`}
            >
              <span className="text-gray-500 font-semibold text-lg">
                {storeName.charAt(0).toUpperCase()}
              </span>
              {isVerified && (
                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                  <CheckBadgeIcon className="h-4 w-4 text-green-500" />
                </div>
              )}
            </div>
          </div>
          
          {/* Seller Info */}
          <div className="flex-1 min-w-0">
            <Link to={`/sellers/${apiSeller.id}`}>
              <h3 className="text-lg font-semibold text-gray-900 hover:text-green-700 transition-colors duration-200 line-clamp-1">
                {storeName}
              </h3>
            </Link>
            
            <div className="flex items-center flex-wrap gap-1 mt-1">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                {businessType}
              </span>
              {city && (
                <span className="text-xs text-gray-500 truncate">
                  {city}
                </span>
              )}
            </div>
            
            {/* Rating and Reviews */}
            <div className="flex items-center mt-2">
              <div className="flex items-center">
                {renderStars(displayRating)}
                {displayRating > 0 && (
                  <span className="ml-1 text-sm font-medium text-gray-900">
                    {displayRating.toFixed(1)}
                  </span>
                )}
              </div>
              {reviewsCount > 0 && (
                <>
                  <span className="mx-2 text-gray-300">•</span>
                  <span className="text-sm text-gray-500">
                    {reviewsCount} review{reviewsCount !== 1 ? 's' : ''}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="bg-green-50 p-2 rounded-lg text-center border border-green-100">
            <p className="text-lg font-semibold text-green-700">{productsCount}</p>
            <p className="text-xs text-green-600">Products</p>
          </div>
          <div className="bg-blue-50 p-2 rounded-lg text-center border border-blue-100">
            <p className="text-lg font-semibold text-blue-700">{reviewsCount}</p>
            <p className="text-xs text-blue-600">Reviews</p>
          </div>
        </div>

        {/* View Profile Button */}
        <Link
          to={`/sellers/${apiSeller.id}`}
          className="mt-4 w-full block text-center bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
        >
          View Store
        </Link>
      </div>
    </motion.div>
  );
};

export default SellerCard;