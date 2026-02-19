import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { StarIcon, HeartIcon as HeartOutline } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
import { motion } from "framer-motion";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { useWishlist } from "../../context/WishlistContext";

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const [addingToCart, setAddingToCart] = useState(false);
  const [message, setMessage] = useState(null);
  const [imageError, setImageError] = useState(false);
  const navigate = useNavigate();

  // Check if product is in wishlist
  const isInWishlist = wishlist?.some(item => item.id === product.id);

  // Helper: format average rating
  const getAverageRating = () => {
    const rating = product.average_rating;
    if (!rating || rating === 0) {
      return { value: 0, formatted: "0.0", stars: 0 };
    }
    const numRating = typeof rating === 'number' ? rating : parseFloat(rating);
    return {
      value: isNaN(numRating) ? 0 : numRating,
      formatted: isNaN(numRating) ? "0.0" : numRating.toFixed(1),
      stars: Math.floor(isNaN(numRating) ? 0 : numRating)
    };
  };
  const ratingInfo = getAverageRating();

  // Helper: get product image URL (primary or first)
  const getProductImage = () => {
    if (product.primary_image) return product.primary_image;
    if (product.images?.length > 0) {
      const img = product.images[0];
      return img.full_url || img.url || img.path || '/placeholder-product.jpg';
    }
    return '/placeholder-product.jpg';
  };
  const productImage = getProductImage();

  // Helper: calculate discount percentage
  const getDiscountPercentage = () => {
    if (product.discount_percentage) return product.discount_percentage;
    if (product.discount_price && product.price > 0) {
      const discount = ((product.price - product.discount_price) / product.price) * 100;
      return Math.round(discount);
    }
    return 0;
  };
  const discountPercentage = getDiscountPercentage();

  // Wishlist toggle
  const toggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate('/login', { state: { from: 'wishlist-add', productId: product.id } });
      return;
    }
    try {
      if (isInWishlist) {
        await removeFromWishlist(product.id);
      } else {
        await addToWishlist(product.id);
      }
    } catch (error) {
      console.error('Wishlist error:', error);
      setMessage({ type: 'error', message: 'Failed to update wishlist' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  // Add to cart
  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login', { state: { from: 'cart-add', productId: product.id } });
      return;
    }
    if (!product.is_active || product.quantity <= 0) {
      setMessage({ type: 'error', message: 'Product unavailable' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }
    setAddingToCart(true);
    try {
      const result = await addToCart({ id: product.id, quantity: 1 });
      setMessage({ type: 'success', message: result.message || 'Added to cart!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({ type: 'error', message: err.message || 'Failed to add' });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setAddingToCart(false);
    }
  };

  return (
    <>
      {/* Message popup */}
      {message && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-md shadow-lg flex items-center justify-between max-w-md ${
          message.type === 'success' ? 'bg-green-100 text-green-700 border border-green-400' : 'bg-red-100 text-red-700 border border-red-400'
        }`}>
          <span>{message.message}</span>
          <button onClick={() => setMessage(null)} className="ml-4 text-xl font-bold hover:opacity-70">×</button>
        </div>
      )}

      <motion.div
        className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full relative"
        whileHover={{ y: -5 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Image container */}
        <Link to={`/products/${product.id}`} className="block relative">
          <div className="w-full h-48 bg-gray-200 rounded-t-lg overflow-hidden">
            {!imageError ? (
              <LazyLoadImage
                src={productImage}
                alt={product.name_en}
                effect="blur"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <span className="text-gray-400">No image</span>
              </div>
            )}
          </div>

          {/* Discount badge - top left */}
          {discountPercentage > 0 && (
            <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
              -{discountPercentage}%
            </div>
          )}

          {/* Wishlist icon - top right */}
          <button
            onClick={toggleWishlist}
            className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-md hover:bg-gray-100 transition z-10"
            aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
          >
            {isInWishlist ? (
              <HeartSolid className="h-5 w-5 text-red-500" />
            ) : (
              <HeartOutline className="h-5 w-5 text-gray-600 hover:text-red-500" />
            )}
          </button>
        </Link>

        {/* Content */}
        <div className="p-4 flex flex-col flex-grow">
          <Link to={`/products/${product.id}`} className="flex-grow">
            <h3 className="text-lg font-medium text-gray-900 hover:text-green-700 line-clamp-2 min-h-[56px]">
              {product.name_en || product.name || "Unnamed Product"}
            </h3>
            <div className="flex items-center mt-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <StarIcon
                    key={i}
                    className={`h-4 w-4 ${i < ratingInfo.stars ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                  />
                ))}
              </div>
              <span className="ml-2 text-sm text-gray-500">{ratingInfo.formatted}</span>
              {product.review_count > 0 && (
                <span className="ml-1 text-sm text-gray-500">({product.review_count})</span>
              )}
            </div>
            {product.description_en && (
              <p className="mt-2 text-sm text-gray-600 line-clamp-2">{product.description_en}</p>
            )}
          </Link>

          {/* Price and MOQ */}
          <div className="mt-4 flex items-center justify-between">
            <div>
              {discountPercentage > 0 ? (
                <>
                  <span className="text-lg font-bold text-red-600">
                    {formatMMK(product.discount_price || (product.price * (1 - discountPercentage/100)))}
                  </span>
                  <span className="ml-2 text-sm text-gray-500 line-through">
                    {formatMMK(product.price)}
                  </span>
                </>
              ) : (
                <span className="text-lg font-bold text-green-700">{formatMMK(product.price)}</span>
              )}
            </div>
            {product.moq > 1 && (
              <span className="text-xs text-gray-500">MOQ: {product.moq}</span>
            )}
          </div>

          {/* Add to cart button */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <button
              onClick={handleAddToCart}
              disabled={addingToCart || !product.is_active || product.quantity <= 0}
              className={`w-full rounded-md py-2 px-4 text-sm font-medium text-white transition-colors ${
                !product.is_active || product.quantity <= 0
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {addingToCart ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
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
          </div>
        </div>
      </motion.div>
    </>
  );
};

// Helper: format MMK
const formatMMK = (amount) => {
  const num = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
  return new Intl.NumberFormat("my-MM", { style: "currency", currency: "MMK", minimumFractionDigits: 0 }).format(num);
};

export default ProductCard;