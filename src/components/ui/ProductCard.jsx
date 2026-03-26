// src/components/ui/ProductCard.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  StarIcon,
  PhotoIcon,
  HeartIcon as HeartOutline,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
import { motion } from "framer-motion";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import { useAuth } from "../../context/AuthContext";
import { useWishlist } from "../../context/WishlistContext";
import { useCart } from "../../context/CartContext";
import { IMAGE_BASE_URL, DEFAULT_PLACEHOLDER } from "../../config";

// ─── Image URL helper ─────────────────────────────────────────────────────────
// Handles: absolute URL, relative storage path, image object {url, path}
const getImageUrl = (image) => {
  if (!image) return DEFAULT_PLACEHOLDER;

  if (typeof image === "string") {
    if (image.startsWith("http")) return image;
    return `${IMAGE_BASE_URL}/${image.replace(/^public\//, "")}`;
  }

  if (typeof image === "object") {
    const src = image.url || image.path || "";
    if (!src) return DEFAULT_PLACEHOLDER;
    if (src.startsWith("http")) return src;
    return `${IMAGE_BASE_URL}/${src.replace(/^public\//, "")}`;
  }

  return DEFAULT_PLACEHOLDER;
};

// ─── MMK formatter ────────────────────────────────────────────────────────────
const formatMMK = (amount) =>
  new Intl.NumberFormat("my-MM", {
    style: "currency",
    currency: "MMK",
    minimumFractionDigits: 0,
  }).format(amount || 0);

// ─── Component ────────────────────────────────────────────────────────────────
const ProductCard = ({ product, className = "", onAddToCart: onAddToCartProp }) => {
  const { user }                               = useAuth();
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { cartItems, addToCart }               = useCart();
  const navigate                               = useNavigate();

  const [wishlistMsg, setWishlistMsg] = useState(null);
  const [imageError, setImageError]   = useState(false);
  const [isInCart, setIsInCart]       = useState(false);
  const [isHovered, setIsHovered]     = useState(false);

  // ── Derived values ──────────────────────────────────────────────────────────
  const slug      = product.slug_en || product.slug || product.id;
  const productId = product.id || product.product_id;

  // Primary image — first in array, or first marked primary
  const primaryImage =
    product.images?.find((img) => img?.is_primary) ??
    product.images?.[0] ??
    null;
  const imageUrl = !imageError ? getImageUrl(primaryImage) : DEFAULT_PLACEHOLDER;

  const isInWishlist = wishlist?.some((item) => item.id === productId);

  // Sync cart state
  useEffect(() => {
    setIsInCart(
      cartItems?.some((item) => item.product_id === productId) ?? false
    );
  }, [cartItems, productId]);

  // ── Ratings ─────────────────────────────────────────────────────────────────
  const rawRating  = parseFloat(product.average_rating) || 0;
  const starsFull  = Math.floor(rawRating);
  const ratingText = rawRating > 0 ? rawRating.toFixed(1) : "0.0";
  const reviewCount = product.review_count ?? product.reviews_count ?? 0;

  // ── Discount ─────────────────────────────────────────────────────────────────
  // Use server-computed discount_percentage first, then calculate from prices
  const discountPct = (() => {
    if (product.discount_percentage && product.discount_percentage > 0)
      return Math.round(product.discount_percentage);
    if (product.discount_price && product.price > 0)
      return Math.round(
        ((product.price - product.discount_price) / product.price) * 100
      );
    return 0;
  })();

  const finalPrice =
    discountPct > 0
      ? product.discount_price ?? product.price * (1 - discountPct / 100)
      : product.price;

  const isAvailable  = product.is_active && product.quantity > 0;
  const isOutOfStock = product.quantity <= 0;

  // ── Wishlist toggle ─────────────────────────────────────────────────────────
  const toggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate("/login", {
        state: { from: "wishlist-add", productId, returnTo: window.location.pathname },
      });
      return;
    }
    if (!productId) return;
    try {
      if (isInWishlist) {
        await removeFromWishlist(productId);
        setWishlistMsg({ type: "success", text: "Removed from wishlist" });
      } else {
        await addToWishlist(productId);
        setWishlistMsg({ type: "success", text: "Added to wishlist" });
      }
    } catch (err) {
      setWishlistMsg({
        type: "error",
        text: err.response?.data?.message || "Failed to update wishlist",
      });
    } finally {
      setTimeout(() => setWishlistMsg(null), 3000);
    }
  };

  // ── Add to cart ─────────────────────────────────────────────────────────────
  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate("/login", {
        state: { from: "cart-add", productId, returnTo: window.location.pathname },
      });
      return;
    }
    if (!isAvailable || isInCart) return;
    setIsInCart(true);
    try {
      if (onAddToCartProp) {
        await onAddToCartProp(productId, 1);
      } else {
        await addToCart(productId, 1);
      }
    } catch {
      setIsInCart(false);
    }
  };

  const cartButtonLabel = !product.is_active
    ? "Unavailable"
    : isOutOfStock
    ? "Out of Stock"
    : isInCart
    ? "In Cart"
    : "Add to Cart";

  // ── Seller link ─────────────────────────────────────────────────────────────
  const sellerHref = product.seller?.slug
    ? `/sellers/${product.seller.slug}`
    : product.seller?.id
    ? `/sellers/${product.seller.id}`
    : null;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <motion.div
      className={`relative bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col h-full
        transition-all duration-300 ease-out hover:shadow-md hover:border-gray-300 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* ── Wishlist toast ── */}
      {wishlistMsg && (
        <div
          className={`absolute top-10 right-2 z-20 px-2 py-1 rounded text-[11px] font-medium shadow ${
            wishlistMsg.type === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {wishlistMsg.text}
        </div>
      )}

      {/* ── Image section ── */}
      <div className="relative flex-shrink-0 overflow-hidden bg-gray-50 aspect-square">
        <Link to={`/products/${slug}`} className="block w-full h-full">
          {!imageError && primaryImage ? (
            <LazyLoadImage
              src={imageUrl}
              alt={product.name_en || "Product"}
              effect="blur"
              className={`w-full h-full object-contain transition-transform duration-500 ease-out ${
                isHovered ? "scale-105" : "scale-100"
              }`}
              placeholderSrc="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 300'%3E%3Crect width='300' height='300' fill='%23f9fafb'/%3E%3C/svg%3E"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50">
              <PhotoIcon className="h-8 w-8 sm:h-10 sm:w-10 text-gray-300 mb-1" />
              <span className="text-xs text-gray-400">No image</span>
            </div>
          )}
        </Link>

        {/* Top-left badges */}
        <div className="absolute top-2 left-2 flex flex-wrap gap-x-1.5 gap-y-1 text-[11px] sm:text-xs font-medium leading-none">
          {discountPct > 0 && !isOutOfStock && (
            <span className="bg-red-500 text-white px-1.5 py-0.5 rounded">
              -{discountPct}%
            </span>
          )}
          {isOutOfStock && (
            <span className="bg-gray-500 text-white px-1.5 py-0.5 rounded">
              Out of Stock
            </span>
          )}
          {product.is_new && !isOutOfStock && (
            <span className="bg-green-500 text-white px-1.5 py-0.5 rounded">
              New
            </span>
          )}
          {product.is_featured && (
            <span className="bg-amber-500 text-white px-1.5 py-0.5 rounded flex items-center gap-0.5">
              <StarIcon className="h-2.5 w-2.5" />
              Featured
            </span>
          )}
          {product.is_on_sale && discountPct === 0 && !isOutOfStock && (
            <span className="bg-orange-500 text-white px-1.5 py-0.5 rounded">
              Sale
            </span>
          )}
        </div>

        {/* Wishlist button */}
        <button
          onClick={toggleWishlist}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 backdrop-blur-sm shadow-sm
            hover:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
          aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
          {isInWishlist ? (
            <HeartSolid className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-500" />
          ) : (
            <HeartOutline className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-600 hover:text-red-500 transition-colors" />
          )}
        </button>

        {/* Category badge — bottom-left */}
        {product.category?.name_en && (
          <div className="absolute bottom-2 left-2">
            <span className="text-[10px] sm:text-[11px] text-gray-500 font-medium bg-white/70 backdrop-blur-sm px-1.5 py-0.5 rounded">
              {product.category.name_en}
            </span>
          </div>
        )}
      </div>

      {/* ── Content section ── */}
      <div className="flex flex-col flex-grow p-3 sm:p-4">
        <div className="flex-grow space-y-1.5 sm:space-y-2">

          {/* Product name */}
          <Link to={`/products/${slug}`} className="block group">
            <h3 className="text-sm sm:text-base font-medium text-gray-900 group-hover:text-green-700 line-clamp-2 transition-colors">
              {product.name_en || product.name || "Unnamed Product"}
            </h3>
          </Link>

          {/* Star rating */}
          <div className="flex items-center gap-1">
            <div className="flex">
              {[0, 1, 2, 3, 4].map((i) => (
                <StarIcon
                  key={i}
                  className={`h-3 w-3 ${
                    i < starsFull
                      ? "text-yellow-400 fill-current"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-[11px] sm:text-xs text-gray-500">{ratingText}</span>
            {reviewCount > 0 && (
              <span className="text-[11px] sm:text-xs text-gray-400">
                ({reviewCount})
              </span>
            )}
          </div>

          {/* Short description */}
          {product.description_en && (
            <p className="text-[11px] sm:text-xs text-gray-500 line-clamp-2">
              {product.description_en}
            </p>
          )}
        </div>

        {/* ── Price row ── */}
        <div className="mt-3 sm:mt-4 pt-2 border-t border-gray-100">
          <div className="flex items-baseline justify-between flex-wrap gap-1">
            <div className="flex flex-wrap items-baseline gap-1.5">
              {discountPct > 0 ? (
                <>
                  <span className="text-sm sm:text-base font-bold text-red-600">
                    {formatMMK(finalPrice)}
                  </span>
                  <span className="text-[10px] sm:text-xs text-gray-400 line-through">
                    {formatMMK(product.price)}
                  </span>
                </>
              ) : (
                <span className="text-sm sm:text-base font-bold text-green-700">
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

        {/* ── Add to cart button ── */}
        <div className="mt-2 sm:mt-3">
          <button
            onClick={handleAddToCart}
            disabled={!isAvailable || isInCart}
            className={`w-full rounded-lg py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 ${
              !product.is_active || isOutOfStock
                ? "bg-gray-300 cursor-not-allowed"
                : isInCart
                ? "bg-gray-400 cursor-default"
                : "bg-green-600 hover:bg-green-700 focus:ring-green-500"
            }`}
            aria-label={cartButtonLabel}
          >
            {cartButtonLabel}
          </button>
        </div>

        {/* ── Seller name ── */}
        {product.seller?.store_name && (
          <div className="mt-1.5 text-center">
            {sellerHref ? (
              <Link
                to={sellerHref}
                onClick={(e) => e.stopPropagation()}
                className="text-[10px] sm:text-xs text-gray-400 hover:text-green-600 transition-colors truncate block"
              >
                {product.seller.store_name}
              </Link>
            ) : (
              <span className="text-[10px] sm:text-xs text-gray-400 truncate block">
                {product.seller.store_name}
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ProductCard;