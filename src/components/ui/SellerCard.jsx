import React from "react";
import { Link } from "react-router-dom";
import {StarIcon} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";

const SellerCard = ({ seller }) => {
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
            <div className="bg-gray-200 border-2 border-dashed rounded-full w-16 h-16" />
          </div>
          <div className="ml-4">
            <Link to={`/seller/${seller.id}`}>
              <h3 className="text-lg font-medium text-gray-900 hover:text-green-700">
                {seller.name}
              </h3>
            </Link>
            <p className="text-sm text-gray-500">
              {seller.category}
            </p>
            <div className="flex items-center mt-1">
              {[0, 1, 2, 3, 4].map(rating =>
                <StarIcon
                  key={rating}
                  className={`h-4 w-4 ${rating < Math.floor(seller.rating)
                    ? "text-yellow-400"
                    : "text-gray-300"}`}
                />
              )}
              <span className="ml-1 text-sm text-gray-500">
                ({seller.rating})
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="bg-gray-100 p-2 rounded text-center">
            <p className="text-xs text-gray-500">
              {seller.products}+ Products
            </p>
          </div>
          <div className="bg-gray-100 p-2 rounded text-center">
            <p className="text-xs text-gray-500">
              {seller.customers}+ Customers
            </p>
          </div>
        </div>

        <Link
          to={`/seller/${seller.id}`}
          className="mt-4 w-full block text-center bg-green-600 border border-transparent rounded-md py-2 px-4 text-sm font-medium text-white hover:bg-green-700"
        >
          View Profile
        </Link>
      </div>
    </motion.div>
  );
};

export default SellerCard;
