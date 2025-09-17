import React from "react";
import { Link } from "react-router-dom";
import { StarIcon } from "@heroicons/react/24/solid"; // solid for filled stars
import { motion } from "framer-motion";

const SellerCard = ({ seller }) => {
  const rating = seller.reviews_avg_rating ?? 0; // from backend
  const reviewsCount = seller.reviews_count ?? 0;

  return (
    <motion.div
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
      whileHover={{ y: -5 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            {seller.store_logo ? (
              <img
                src={seller.store_logo}
                alt={seller.store_name}
                className="w-16 h-16 rounded-full object-cover border"
              />
            ) : (
              <div className="bg-gray-200 border-2 border-dashed rounded-full w-16 h-16" />
            )}
          </div>
          <div className="ml-4">
            <Link to={`/sellers/${seller.id}`}>
              <h3 className="text-lg font-medium text-gray-900 hover:text-green-700">
                {seller.store_name}
              </h3>
            </Link>
            <p className="text-sm text-gray-500">
              {seller.city || "Unknown City"}
            </p>
            <div className="flex items-center mt-1">
              {[...Array(5)].map((_, i) => (
                <StarIcon
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.round(rating)
                      ? "text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
              <span className="ml-1 text-sm text-gray-500">
                ({rating.toFixed(1)} / {reviewsCount})
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="bg-gray-100 p-2 rounded text-center">
            <p className="text-xs text-gray-500">
              {seller.products_count ?? 0}+ Products
            </p>
          </div>
          <div className="bg-gray-100 p-2 rounded text-center">
            <p className="text-xs text-gray-500">
              {seller.customers_count ?? 0}+ Customers
            </p>
          </div>
        </div>

        <Link
          to={`/sellers/${seller.id}`}
          className="mt-4 w-full block text-center bg-green-600 border border-transparent rounded-md py-2 px-4 text-sm font-medium text-white hover:bg-green-700"
        >
          View Profile
        </Link>
      </div>
    </motion.div>
  );
};

export default SellerCard;
