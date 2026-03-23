import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { StarIcon, PhotoIcon, HeartIcon as HeartOutline } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
import { motion } from "framer-motion";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import { useAuth } from "../../context/AuthContext";
import { useWishlist } from "../../context/WishlistContext";
import { useCart } from "../../context/CartContext";
import { IMAGE_BASE_URL, DEFAULT_PLACEHOLDER } from "../../config";

// Helper to build full image URL
const getImageUrl = (image) => {
  if (!image) return DEFAULT_PLACEHOLDER;
  if (typeof image === 'string') {
    if (image.startsWith('http')) return image;
    const cleanPath = image.replace('public/', '');
    return `${IMAGE_BASE_URL}/${cleanPath}`;
  }
  if (typeof image === 'object') {
    if (image.url) {
      if (image.url.startsWith('http')) return image.url;
      const cleanPath = image.url.replace('public/', '');
      return `${IMAGE_BASE_URL}/${cleanPath}`;
    }
    if (image.path) {
      const cleanPath = image.path.replace('public/', '');
      return `${IMAGE_BASE_URL}/${cleanPath}`;
    }
  }
  return DEFAULT_PLACEHOLDER;
};

const ProductCard = ({ product, className = "" }) => {
  const { user } = useAuth();
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { cartItems, addToCart } = useCart();
  const [message, setMessage] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [isInCart, setIsInCart] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  const slug = product.slug_en || product.slug || product.id;
  const productId = product.id || product.product_id;

  // Extract valid image objects for counting and badge
  const validImages = (product.images && Array.isArray(product.images))
    ? product.images.filter(img => img && img.url && img.url.trim() !== "")
    : [];

  // Get the best image URL using the helper
  const imageUrl = product.images?.[0] ? getImageUrl(product.images[0]) : DEFAULT_PLACEHOLDER;

  // Check if product is in wishlist
  const isInWishlist = wishlist?.some(item => item.id === productId);

  // Check if product is in cart
  useEffect(() => {
    if (cartItems && productId) {
      const found = cartItems.some(item => item.product_id === productId);
      setIsInCart(found);
    } else {
      setIsInCart(false);
    }
  }, [cartItems, productId]);

  // Rating helper
  const getAverageRating = () => {
    const rating = product.average_rating;
    if (!rating || rating === 0) return { value: 0, formatted: "0.0", stars: 0 };
    const num = typeof rating === "number" ? rating : parseFloat(rating);
    return {
      value: isNaN(num) ? 0 : num,
      formatted: isNaN(num) ? "0.0" : num.toFixed(1),
      stars: Math.floor(isNaN(num) ? 0 : num)
    };
  };
  const ratingInfo = getAverageRating();

  // Discount percentage
  const getDiscountPercentage = () => {
    if (product.discount_percentage) return product.discount_percentage;
    if (product.discount_price && product.price > 0) {
      return Math.round(((product.price - product.discount_price) / product.price) * 100);
    }
    return 0;
  };
  const discountPercentage = getDiscountPercentage();

  // Wishlist toggle
  const toggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate("/login", { state: { from: "wishlist-add", productId, returnTo: window.location.pathname } });
      return;
    }
    if (!productId) {
      setMessage({ type: "error", message: "Invalid product" });
      setTimeout(() => setMessage(null), 3000);
      return;
    }
    try {
      if (isInWishlist) {
        await removeFromWishlist(productId);
        setMessage({ type: "success", message: "Removed from wishlist" });
      } else {
        await addToWishlist(productId);
        setMessage({ type: "success", message: "Added to wishlist" });
      }
    } catch (error) {
      setMessage({ type: "error", message: error.response?.data?.message || "Failed to update wishlist" });
    } finally {
      setTimeout(() => setMessage(null), 3000);
    }
  };

  // Add to cart
  const handleAddToCart = async () => {
    if (!user) {
      navigate("/login", {
        state: { from: "cart-add", productId, returnTo: window.location.pathname }
      });
      return;
    }

    if (!productId || !product.is_active || product.quantity <= 0) {
      return;
    }

    // Optimistic UI update
    setIsInCart(true);

    try {
      await addToCart(productId, 1);
    } catch (error) {
      setIsInCart(false);
      setMessage({
        type: "error",
        message: error.message || "Failed to add to cart"
      });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const formatMMK = (amount) =>
    new Intl.NumberFormat("my-MM", { style: "currency", currency: "MMK", minimumFractionDigits: 0 }).format(amount || 0);

  // Button text logic
  let buttonText = "Add to Cart";
  if (!product.is_active) buttonText = "Unavailable";
  else if (product.quantity <= 0) buttonText = "Out of Stock";
  else if (isInCart) buttonText = "In Cart";

  return (
    <>
      {message && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-md shadow-lg flex items-center justify-between max-w-md ${message.type === "success" ? "bg-green-100 border-green-400 text-green-700" :
            message.type === "error" ? "bg-red-100 border-red-400 text-red-700" :
              "bg-blue-100 border-blue-400 text-blue-700"
          }`}>
          <span className="text-sm sm:text-base">{message.message}</span>
          <button onClick={() => setMessage(null)} className="ml-4 text-xl font-bold hover:opacity-70">×</button>
        </div>
      )}

      <motion.div
        className={`
          bg-white rounded-xl shadow-sm overflow-hidden flex flex-col h-full 
          transition-all duration-300 ease-out 
          hover:shadow-xl hover:-translate-y-1
          ${className}
        `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Image Section */}
        <div className="relative flex-shrink-0 overflow-hidden bg-gray-100">
          <Link to={`/products/${slug}`} className="block">
            <div className="relative w-full aspect-square">
              {imageUrl && !imageError ? (
                <LazyLoadImage
                  src={imageUrl}
                  alt={product.name_en || "Product"}
                  effect="blur"
                  className={`
                    w-full h-full object-cover transition-transform duration-500 ease-out
                    ${isHovered ? 'scale-110' : 'scale-100'}
                  `}
                  placeholderSrc="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 300'%3E%3Crect width='300' height='300' fill='%23f3f4f6'/%3E%3C/svg%3E"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100">
                  <PhotoIcon className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mb-1 sm:mb-2" />
                  <span className="text-xs sm:text-sm text-gray-500">No image</span>
                </div>
              )}
            </div>
          </Link>

          {/* Top left badges: discount and stock */}
          <div className="absolute top-2 left-2 flex flex-col items-start space-y-1">
            {discountPercentage > 0 && product.quantity > 0 && (
              <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                -{discountPercentage}%
              </span>
            )}
            {product.quantity <= 0 && (
              <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                Out of Stock
              </span>
            )}
          </div>

          {/* Top right wishlist button */}
          <button
            onClick={toggleWishlist}
            className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
            aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
          >
            {isInWishlist ? (
              <HeartSolid className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
            ) : (
              <HeartOutline className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700 hover:text-red-500 transition-colors" />
            )}
          </button>

          {/* Bottom left: Category + Condition badges (New, Sale) */}
          <div className="absolute bottom-2 left-2 flex flex-wrap gap-1">
            {product.category?.name_en && (
              <span className="bg-green-600/90 backdrop-blur-sm text-white text-xs font-semibold px-2 py-1 rounded-full shadow-sm">
                {product.category.name_en}
              </span>
            )}
            {product.is_new && (
              <span className="bg-blue-600/90 backdrop-blur-sm text-white text-xs font-semibold px-2 py-1 rounded-full shadow-sm">
                New
              </span>
            )}
            {product.is_on_sale && discountPercentage === 0 && (
              <span className="bg-orange-600/90 backdrop-blur-sm text-white text-xs font-semibold px-2 py-1 rounded-full shadow-sm">
                Sale
              </span>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4 flex flex-col flex-grow">
          {/* Product Info */}
          <div className="flex-grow space-y-2">
            <Link to={`/products/${slug}`} className="block group">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 group-hover:text-green-700 line-clamp-2 transition-colors">
                {product.name_en || product.name || "Unnamed Product"}
              </h3>
            </Link>

            {/* Rating */}
            <div className="flex items-center space-x-1">
              <div className="flex items-center">
                {[0, 1, 2, 3, 4].map(i => (
                  <StarIcon key={i} className={`h-3 w-3 sm:h-4 sm:w-4 ${i < ratingInfo.stars ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
                ))}
              </div>
              <span className="text-xs text-gray-500">{ratingInfo.formatted}</span>
              {product.review_count > 0 && (
                <span className="text-xs text-gray-500">({product.review_count})</span>
              )}
            </div>

            {/* Description (optional) */}
            {product.description_en && (
              <p className="text-xs text-gray-600 line-clamp-2">
                {product.description_en}
              </p>
            )}

            {/* Price and MOQ */}
            <div className="flex items-baseline justify-between flex-wrap gap-1">
              <div className="flex flex-wrap items-baseline gap-2">
                {discountPercentage > 0 ? (
                  <>
                    <span className="text-lg sm:text-xl font-bold text-red-600">
                      {formatMMK(product.discount_price || (product.price * (1 - discountPercentage / 100)))}
                    </span>
                    <span className="text-xs text-gray-500 line-through">
                      {formatMMK(product.price)}
                    </span>
                  </>
                ) : (
                  <span className="text-lg sm:text-xl font-bold text-green-700">
                    {formatMMK(product.price)}
                  </span>
                )}
              </div>
              {product.moq > 1 && (
                <span className="text-xs text-gray-500">
                  MOQ: {product.moq} {product.min_order_unit || "units"}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-4 pt-3 border-t border-gray-100 space-y-2">
            <button
              onClick={handleAddToCart}
              disabled={!product.is_active || product.quantity <= 0 || isInCart}
              className={`
                w-full rounded-lg py-2 px-4 text-sm font-medium text-white 
                transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
                ${!product.is_active || product.quantity <= 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : isInCart
                    ? "bg-gray-500 cursor-default"
                    : "bg-green-600 hover:bg-green-700 active:bg-green-800"
                }
              `}
              aria-label={buttonText}
            >
              {buttonText}
            </button>

            {/* Seller info */}
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span className="truncate max-w-[60%]">
                {product.seller?.seller_profile?.store_name ||
                  product.seller?.store_name ||
                  product.seller?.name ||
                  "Seller"}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default ProductCard;