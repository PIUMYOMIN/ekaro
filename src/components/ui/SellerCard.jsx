import React from "react";
import { Link } from "react-router-dom";
import { StarIcon } from "@heroicons/react/24/solid";
import { motion } from "framer-motion";

const SellerCard = ({ seller }) => {
  // Use the actual API data structure
  const apiSeller = seller.originalData || seller;
  
  // Map API properties to component expectations
  const storeName = apiSeller.store_name || 'Unknown Seller';
  const displayRating = Number(apiSeller.reviews_avg_rating) || 0;
  const reviewsCount = apiSeller.reviews_count || 0;
  const productsCount = apiSeller.products_count || 0;
  const city = apiSeller.user?.city || 'Unknown City';
  const storeLogo = apiSeller.store_logo;
  
  // For category - you might need to adjust this based on your data
  // Since the API doesn't provide a category field, you can use a default or derive it
  const category = "General Merchant"; // Default category

  // Render star ratings
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<StarIcon key={i} className="h-4 w-4 text-yellow-400" fill="currentColor" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<StarIcon key={i} className="h-4 w-4 text-yellow-400" fill="currentColor" />);
      } else {
        stars.push(<StarIcon key={i} className="h-4 w-4 text-gray-300" fill="currentColor" />);
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
        <div className="flex items-center">
          <div className="flex-shrink-0">
            {storeLogo ? (
              <img
                src={storeLogo}
                alt={storeName}
                className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div className={`${storeLogo ? 'hidden' : 'flex'} bg-gray-100 border-2 border-dashed border-gray-300 rounded-full w-16 h-16 items-center justify-center`}>
              <span className="text-gray-400 text-xs text-center px-1">No Logo</span>
            </div>
          </div>
          <div className="ml-4 flex-1">
            <Link to={`/sellers/${apiSeller.id}`}>
              <h3 className="text-lg font-semibold text-gray-900 hover:text-green-700 transition-colors duration-200 line-clamp-1">
                {storeName}
              </h3>
            </Link>
            <p className="text-sm text-gray-600 mt-1">{category}</p>
            <p className="text-xs text-gray-500 mt-1">{city}</p>
            
            <div className="flex items-center mt-2">
              <div className="flex items-center">
                {renderStars(displayRating)}
                <span className="ml-1 text-sm font-medium text-gray-900">
                  {displayRating > 0 ? displayRating.toFixed(1) : 'No ratings'}
                </span>
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

        {/* Verification Badge - You can add logic based on your business rules */}
        {apiSeller.status === 'active' && (
          <div className="mt-3 flex items-center justify-center">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
              <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Verified Seller
            </span>
          </div>
        )}

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