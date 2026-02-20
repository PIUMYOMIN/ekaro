import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { StarIcon, PhotoIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [addingToCart, setAddingToCart] = useState(false);
  const [message, setMessage] = useState(null);
  const [imageError, setImageError] = useState(false);
  const navigate = useNavigate();
  const slug = product.slug_en || product.slug || product.id;

  // Helper function to safely get and format average rating
  const getAverageRating = () => {
    const rating = product.average_rating;
    if (rating === null || rating === undefined || rating === 0) {
      return {
        value: 0,
        formatted: "0.0",
        stars: 0
      };
    }
    
    const numRating = typeof rating === 'number' ? rating : parseFloat(rating);
    return {
      value: isNaN(numRating) ? 0 : numRating,
      formatted: isNaN(numRating) ? "0.0" : numRating.toFixed(1),
      stars: Math.floor(isNaN(numRating) ? 0 : numRating)
    };
  };

  const ratingInfo = getAverageRating();

  // Get the primary image path - uses relative path from public directory
  const getProductImagePath = () => {
    // 1. First try the primary_image field
    if (product.primary_image) {
      return product.primary_image; // e.g., "uploads/products/filename.jpg"
    }
    
    // 2. Try to find primary image in images array
    if (product.images && product.images.length > 0) {
      // Find primary image
      const primaryImage = product.images.find(img => img.is_primary === true);
      if (primaryImage) {
        return primaryImage.path || primaryImage.url;
      }
      
      // Use first image as fallback
      const firstImage = product.images[0];
      if (typeof firstImage === 'object') {
        return firstImage.path || firstImage.url;
      }
      if (typeof firstImage === 'string') {
        return firstImage;
      }
    }
    
    // 3. Return null to show placeholder
    return null;
  };

  const imagePath = getProductImagePath();

  // Handle image load error
  const handleImageError = () => {
    setImageError(true);
  };

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login', { 
        state: { 
          from: 'cart-add',
          productId: product.id,
          returnTo: window.location.pathname 
        } 
      });
      return;
    }

    if (!product.is_active) {
      setMessage({
        type: 'error',
        message: 'This product is currently unavailable'
      });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    if (product.quantity <= 0) {
      setMessage({
        type: 'error',
        message: 'This product is out of stock'
      });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    setAddingToCart(true);
    try {
      const result = await addToCart({
        id: product.id,
        quantity: 1
      });

      setMessage({
        type: 'success',
        message: result.message || 'Product added to cart!'
      });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({
        type: 'error',
        message: error.message || 'Failed to add product to cart'
      });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setAddingToCart(false);
    }
  };

  return (
    <>
      {/* Message Popup */}
      {message && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-md shadow-lg flex items-center justify-between max-w-md ${
          message.type === 'success' 
            ? 'bg-green-100 border border-green-400 text-green-700'
            : 'bg-red-100 border border-red-400 text-red-700'
        }`}>
          <span>{message.message}</span>
          <button
            onClick={() => setMessage(null)}
            className="ml-4 text-xl font-bold hover:opacity-70"
          >
            ×
          </button>
        </div>
      )}

      <motion.div
        className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full"
        whileHover={{ y: -5 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="relative flex-shrink-0">
          <Link to={`/products/${product.slug_en}`} className="block">
            <div className="w-full h-48 bg-gray-100 rounded-t-lg overflow-hidden relative">
              {imagePath && !imageError ? (
                <LazyLoadImage
                  src={`/${imagePath}`}
                  alt={product.name_en || product.name || "Product"}
                  effect="blur"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  placeholderSrc="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 300'%3E%3Crect width='300' height='300' fill='%23f3f4f6'/%3E%3C/svg%3E"
                  onError={handleImageError}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100">
                  <PhotoIcon className="h-12 w-12 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500">No image</span>
                </div>
              )}
              
              {/* Image Count Badge */}
              {product.images && product.images.length > 0 && (
                <div className="absolute top-2 right-2 bg-black/70 text-white text-xs font-medium px-2 py-1 rounded-full">
                  {product.images.length} {product.images.length === 1 ? 'photo' : 'photos'}
                </div>
              )}
            </div>
          </Link>
          
          {/* Category Badge */}
          {product.category?.name_en && (
            <div className="absolute bottom-2 left-2 bg-green-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
              {product.category.name_en}
            </div>
          )}
          
          {/* Out of Stock Badge */}
          {product.quantity <= 0 && (
            <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
              Out of Stock
            </div>
          )}
          
          {/* Featured Badge */}
          {product.is_featured && (
            <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
              Featured
            </div>
          )}
        </div>
        
        <div className="p-4 flex flex-col flex-grow">
          <div className="flex-grow">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <Link to={`/products/${product.slug_en}`} className="block">
                  <h3 className="text-lg font-medium text-gray-900 hover:text-green-700 line-clamp-2 min-h-[56px]">
                    {product.name_en || product.name || "Unnamed Product"}
                  </h3>
                </Link>
                
                {/* Rating */}
                <div className="flex items-center mt-2">
                  <div className="flex">
                    {[0, 1, 2, 3, 4].map(rating => (
                      <StarIcon
                        key={rating}
                        className={`h-4 w-4 ${rating < ratingInfo.stars
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"}`}
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-gray-500">
                    {ratingInfo.formatted}
                  </span>
                  {product.review_count > 0 && (
                    <span className="ml-1 text-sm text-gray-500">
                      ({product.review_count || 0})
                    </span>
                  )}
                </div>
                
                {/* Short Description */}
                {product.description_en && (
                  <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                    {product.description_en}
                  </p>
                )}
              </div>
              
              <div className="text-right ml-2 flex-shrink-0">
                <p className="text-lg font-bold text-green-700">
                  {formatMMK(product.price || 0)}
                </p>
                {product.moq > 1 && (
                  <p className="text-xs text-gray-500 mt-1">
                    MOQ: {product.moq} {product.min_order_unit || 'units'}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          {/* Action Button */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={addingToCart || !product.is_active || product.quantity <= 0}
              className={`w-full rounded-md py-2 px-4 flex items-center justify-center text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                !product.is_active || product.quantity <= 0
                  ? 'bg-gray-400 hover:bg-gray-500'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {addingToCart ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Adding...
                </>
              ) : !product.is_active ? (
                'Unavailable'
              ) : product.quantity <= 0 ? (
                'Out of Stock'
              ) : (
                'Add to Cart'
              )}
            </button>
            
            {/* Additional Info */}
            <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
              <span className="truncate max-w-[60%]">
                {product.seller?.store_name || product.seller?.name || 'Seller'}
              </span>
              <div className="flex items-center space-x-1">
                {product.is_new && (
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded">
                    New
                  </span>
                )}
                {product.is_on_sale && (
                  <span className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded">
                    Sale
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

// Helper function to format MMK currency
export const formatMMK = amount => {
  const numAmount = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
  return new Intl.NumberFormat("my-MM", {
    style: "currency",
    currency: "MMK",
    minimumFractionDigits: 0
  }).format(numAmount);
};

export default ProductCard;