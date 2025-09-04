// src/components/ui/ProductCard.jsx
import React from "react";
import { Link } from "react-router-dom";
import { StarIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";

const ProductCard = ({ product, onClick }) => {
  // Helper function to get image URL
  const getImageUrl = (image) => {
    if (!image) return '/placeholder-product.jpg';
    
    // Handle different image formats
    if (typeof image === 'string') {
      return image;
    } else if (image.url) {
      return image.url;
    } else if (image.path) {
      return image.path;
    }
    
    return '/placeholder-product.jpg';
  };

  // Get the first image or placeholder
  const productImage = product.images && product.images.length > 0 
    ? getImageUrl(product.images[0])
    : '/placeholder-product.jpg';

  return (
    <motion.div
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
      whileHover={{ y: -5 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="relative">
        <Link to={`/products/${product.id}`}>
          <div className="w-full h-48 bg-gray-200 rounded-t-lg overflow-hidden">
            <LazyLoadImage
              src={productImage}
              alt={product.name}
              effect="blur"
              className="w-full h-full object-cover"
              placeholderSrc="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 300'%3E%3Crect width='300' height='300' fill='%23e5e7eb'/%3E%3C/svg%3E"
              onError={(e) => {
                e.target.src = '/placeholder-product.jpg';
              }}
            />
          </div>
        </Link>
        <div className="absolute top-2 right-2 bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full">
          {product.category?.name || "No category"}
        </div>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <Link to={`/products/${product.id}`} className="block">
              <h3 className="text-lg font-medium text-gray-900 hover:text-green-700 line-clamp-2">
                {product.name}
              </h3>
            </Link>
            <div className="flex items-center mt-1">
              {[0, 1, 2, 3, 4].map(rating =>
                <StarIcon
                  key={rating}
                  className={`h-4 w-4 ${rating < Math.floor(product.average_rating || 0)
                    ? "text-yellow-400 fill-current"
                    : "text-gray-300"}`}
                />
              )}
              <span className="ml-1 text-sm text-gray-500">
                ({product.average_rating?.toFixed(1) || '0.0'})
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-green-700">
              {formatMMK(product.price)}
            </p>
            <p className="text-xs text-gray-500">per unit</p>
          </div>
        </div>
        <div className="mt-4">
          <button
            type="button"
            onClick={onClick}
            className="w-full bg-green-600 border border-transparent rounded-md py-2 px-4 flex items-center justify-center text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Add to cart
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// Helper function to format MMK currency
export const formatMMK = amount => {
  return new Intl.NumberFormat("my-MM", {
    style: "currency",
    currency: "MMK",
    minimumFractionDigits: 0
  }).format(amount);
};

export default ProductCard;