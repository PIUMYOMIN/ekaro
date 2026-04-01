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
import { useTranslation } from "react-i18next";

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
  const { i18n } = useTranslation();
  const { user } = useAuth();
  // Pick localised field: show _mm when locale is my, fall back to _en
  const loc = (en, mm) => i18n.language === 'my' ? (mm || en) : en;
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { cartItems, addToCart } = useCart();
  const [message, setMessage] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [isInCart, setIsInCart] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  const slug = product.slug_en || product.slug || product.id;
  const productId = product.id || product.product_id;

  const imageUrl = product.images?.[0] ? getImageUrl(product.images[0]) : DEFAULT_PLACEHOLDER;
  const isInWishlist = wishlist?.some(item => item.id === productId);

  useEffect(() => {
    if (cartItems && productId) {
      const found = cartItems.some(item => item.product_id === productId);
      setIsInCart(found);
    } else {
      setIsInCart(false);
    }
  }, [cartItems, productId]);

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

  const getDiscountPercentage = () => {
    if (product.discount_percentage) return product.discount_percentage;
    if (product.discount_price && product.price > 0) {
      return Math.round(((product.price - product.discount_price) / product.price) * 100);
    }
    return 0;
  };
  const discountPercentage = getDiscountPercentage();

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

  const handleAddToCart = async () => {
    if (!user) {
      navigate("/login", { state: { from: "cart-add", productId, returnTo: window.location.pathname } });
      return;
    }
    if (!productId || !product.is_active || product.quantity <= 0) return;
    setIsInCart(true);
    try {
      await addToCart(productId, 1);
    } catch (error) {
      setIsInCart(false);
      setMessage({ type: "error", message: error.message || "Failed to add to cart" });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const formatMMK = (amount) =>
    new Intl.NumberFormat("my-MM", { style: "currency", currency: "MMK", minimumFractionDigits: 0 }).format(amount || 0);

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
          bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col h-full 
          transition-all duration-300 ease-out 
          hover:shadow-md hover:border-gray-300
          ${className}
        `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Image Section */}
        <div className="relative flex-shrink-0 overflow-hidden bg-gray-50 aspect-square">
          <Link to={`/products/${slug}`} className="block w-full h-full">
            {imageUrl && !imageError ? (
              <LazyLoadImage
                src={imageUrl}
                alt={loc(product.name_en, product.name_mm) || "Product"}
                effect="blur"
                className={`
                  w-full h-full object-contain transition-transform duration-500 ease-out
                  ${isHovered ? 'scale-105' : 'scale-100'}
                `}
                placeholderSrc="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 300'%3E%3Crect width='300' height='300' fill='%23f9fafb'/%3E%3C/svg%3E"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50">
                <PhotoIcon className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400 mb-1" />
                <span className="text-xs text-gray-500">No image</span>
              </div>
            )}
          </Link>

          {/* Top‑left badges – horizontal row for all */}
          <div className="absolute top-2 left-2 flex flex-wrap gap-x-1.5 gap-y-1 text-xs font-medium">
            {discountPercentage > 0 && product.quantity > 0 && (
              <span className="text-red-600">-{discountPercentage}%</span>
            )}
            {product.quantity <= 0 && (
              <span className="text-red-600">Out of Stock</span>
            )}
            {product.is_new && (
              <span className="text-green-600">New</span>
            )}
            {product.is_on_sale && discountPercentage === 0 && (
              <span className="text-orange-600">Sale</span>
            )}
          </div>

          {/* Top‑right wishlist button – minimal */}
          <button
            onClick={toggleWishlist}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
            aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
          >
            {isInWishlist ? (
              <HeartSolid className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-500" />
            ) : (
              <HeartOutline className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-600 hover:text-red-500 transition-colors" />
            )}
          </button>

          {/* Bottom‑left category badge – text only */}
          {(product.category?.name_en || product.category?.name_mm) && (
            <div className="absolute bottom-2 left-2">
              <span className="text-[11px] sm:text-xs text-gray-500 font-medium">
                {loc(product.category?.name_en, product.category?.name_mm)}
              </span>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="flex flex-col flex-grow p-3 sm:p-4">
          <div className="flex-grow space-y-1.5 sm:space-y-2">
            <Link to={`/products/${slug}`} className="block group">
              <h3 className="text-sm sm:text-base font-medium text-gray-900 group-hover:text-green-700 line-clamp-2 transition-colors">
{loc(product.name_en, product.name_mm) || product.name || "Unnamed Product"}
              </h3>
            </Link>

            <div className="flex items-center">
              <div className="flex">
                {[0, 1, 2, 3, 4].map(i => (
                  <StarIcon key={i} className={`h-3 w-3 ${i < ratingInfo.stars ? "text-yellow-500 fill-current" : "text-gray-300"}`} />
                ))}
              </div>
              <span className="ml-1 text-[11px] sm:text-xs text-gray-500">{ratingInfo.formatted}</span>
              {product.review_count > 0 && (
                <span className="ml-1 text-[11px] sm:text-xs text-gray-500">({product.review_count})</span>
              )}
            </div>

            {(product.description_en || product.description_mm) && (
              <p className="text-[11px] sm:text-xs text-gray-500 line-clamp-2">
                {loc(product.description_en, product.description_mm)}
              </p>
            )}
          </div>

          <div className="mt-3 sm:mt-4 pt-2 border-t border-gray-100">
            <div className="flex items-baseline justify-between flex-wrap gap-1">
              <div className="flex flex-wrap items-baseline gap-1.5 sm:gap-2">
                {discountPercentage > 0 ? (
                  <>
                    <span className="text-sm sm:text-base md:text-lg font-bold text-red-600">
                      {formatMMK(product.discount_price || (product.price * (1 - discountPercentage / 100)))}
                    </span>
                    <span className="text-[10px] sm:text-xs text-gray-400 line-through">
                      {formatMMK(product.price)}
                    </span>
                  </>
                ) : (
                  <span className="text-sm sm:text-base md:text-lg font-bold text-green-700">
                    {formatMMK(product.price)}
                  </span>
                )}
              </div>
              {product.moq > 1 && (
                <span className="text-[10px] sm:text-xs text-gray-400">
                  MOQ {product.moq} {product.min_order_unit || "units"}
                </span>
              )}
            </div>
          </div>

          <div className="mt-3 sm:mt-4">
            <button
              onClick={handleAddToCart}
              disabled={!product.is_active || product.quantity <= 0 || isInCart}
              className={`
                w-full rounded-lg py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white transition-colors
                ${!product.is_active || product.quantity <= 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : isInCart
                    ? "bg-gray-500 cursor-default"
                    : "bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                }
              `}
              aria-label={buttonText}
            >
              {buttonText}
            </button>
          </div>

          <div className="mt-2 text-[10px] sm:text-xs text-gray-400 truncate text-center">
            {product.seller?.seller_profile?.store_name ||
              product.seller?.store_name ||
              product.seller?.name ||
              "Seller"}
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default ProductCard;