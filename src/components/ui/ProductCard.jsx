import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PhotoIcon, ShoppingCartIcon, MapPinIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid, StarIcon } from "@heroicons/react/24/solid";
import { HeartIcon as HeartOutline } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import { useWishlist } from "../../context/WishlistContext";
import { useCart } from "../../context/CartContext";
import { IMAGE_BASE_URL, DEFAULT_PLACEHOLDER } from "../../config";
import { useTranslation } from "react-i18next";

// ── Image URL helper ──────────────────────────────────────────────────────────
const getImageUrl = (image) => {
  if (!image) return DEFAULT_PLACEHOLDER;
  if (typeof image === "string") {
    if (image.startsWith("http")) return image;
    return `${IMAGE_BASE_URL}/${image.replace("public/", "")}`;
  }
  if (typeof image === "object") {
    const src = image.url || image.path || "";
    if (!src) return DEFAULT_PLACEHOLDER;
    if (src.startsWith("http")) return src;
    return `${IMAGE_BASE_URL}/${src.replace("public/", "")}`;
  }
  return DEFAULT_PLACEHOLDER;
};

// ── Format price in MMK ───────────────────────────────────────────────────────
const formatMMK = (amount) =>
  new Intl.NumberFormat("my-MM", {
    style: "currency",
    currency: "MMK",
    minimumFractionDigits: 0,
  }).format(amount || 0);

// ── Star rating row ───────────────────────────────────────────────────────────
const Stars = ({ rating, count }) => {
  const filled = Math.round(rating || 0);
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <StarIcon
            key={i}
            className={`h-3 w-3 ${i <= filled ? "text-amber-400" : "text-gray-200"}`}
          />
        ))}
      </div>
      {(rating > 0 || count > 0) && (
        <span className="text-[10px] text-gray-400 dark:text-slate-600 leading-none">
          {rating ? Number(rating).toFixed(1) : ""}
          {count > 0 && ` (${count})`}
        </span>
      )}
    </div>
  );
};

// ── Mini toast (inline, not fixed) ───────────────────────────────────────────
const MiniToast = ({ msg, type }) => (
  <AnimatePresence>
    {msg && (
      <motion.div
        className={`absolute top-2 left-1/2 -translate-x-1/2 z-30 whitespace-nowrap
                    text-[11px] font-semibold px-3 py-1.5 rounded-full shadow-lg
                    ${type === "success"
                      ? "bg-green-600 text-white"
                      : "bg-red-500 text-white"}`}
        initial={{ opacity: 0, y: -8, scale: 0.9 }}
        animate={{ opacity: 1, y: 0,  scale: 1   }}
        exit={{    opacity: 0, y: -8, scale: 0.9 }}
        transition={{ duration: 0.2 }}
      >
        {msg}
      </motion.div>
    )}
  </AnimatePresence>
);


// ── Delivery zone swipe-up ticker (same pattern as CategoryCard) ──────────────
const DeliveryZoneTicker = ({ zones }) => {
  const [idx, setIdx] = React.useState(0);
  React.useEffect(() => {
    if (zones.length <= 1) return;
    const id = setInterval(() => setIdx((p) => (p + 1) % zones.length), 2400);
    return () => clearInterval(id);
  }, [zones.length]);
  if (!zones.length) return null;
  return (
    <div className="relative h-5 overflow-hidden">
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={idx}
          className="absolute inset-0 flex items-center text-[10px] font-medium text-green-700"
          initial={{ y: 14, opacity: 0 }}
          animate={{ y: 0,  opacity: 1 }}
          exit={{    y: -14, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {zones[idx]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
};

const _zoneCache = {};

const DeliveryZoneStrip = ({ sellerProfile }) => {
  const [zones, setZones] = React.useState([]);
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    // Try delivery_areas_summary on the seller profile prop first
    if (sellerProfile?.delivery_areas_summary?.length) {
      setZones(sellerProfile.delivery_areas_summary);
      setLoaded(true);
      return;
    }
    // Fallback: fetch public endpoint
    const profileId = sellerProfile?.id || sellerProfile?.seller_profile_id;
    if (!profileId) { setZones(["Whole Myanmar"]); setLoaded(true); return; }
    api.get(`/sellers/${profileId}/delivery-areas`)
      .then(res => {
        const states = res.data?.data?.states ?? [];
        setZones(states.length ? states : ["Whole Myanmar"]);
      })
      .catch(() => setZones(["Whole Myanmar"]))
      .finally(() => setLoaded(true));
  }, [sellerProfile?.id]);

  return (
    <div className="bg-green-50 border-t border-green-100 px-3 py-1.5">
      <div className="flex items-center gap-1.5">
        <MapPinIcon className="h-3 w-3 text-green-500 flex-shrink-0" />
        {loaded
          ? <DeliveryZoneTicker zones={zones} />
          : <span className="text-[10px] text-gray-400 dark:text-slate-600">Loading…</span>}
      </div>
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
const ProductCard = ({ product, className = "" }) => {
  const { i18n } = useTranslation();
  const loc = (en, mm) => (i18n.language === "my" ? mm || en : en || mm);
  const { user } = useAuth();
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { cartItems, addToCart } = useCart();
  const navigate = useNavigate();

  const [toast, setToast]         = useState(null); // { msg, type }
  const [imageError, setImageError] = useState(false);
  const [isInCart, setIsInCart]   = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [wishLoading, setWishLoading] = useState(false);

  const slug      = product.slug_en || product.slug || product.id;
  const productId = product.id || product.product_id;
  const imageUrl  = product.images?.[0] ? getImageUrl(product.images[0]) : DEFAULT_PLACEHOLDER;
  const isInWishlist = !!wishlist?.some((w) => w.id === productId);

  // Use server-computed fields when available (ProductResource now always returns them);
  // fall back to client-side calculation for backward compat.
  const isOnSale     = product.is_currently_on_sale
                    ?? (product.is_on_sale && (product.discount_price > 0 || product.discount_percentage > 0));
  const effectivePrice = isOnSale
    ? (product.selling_price ?? product.discount_price ?? product.price)
    : product.price;
  const discountPct = isOnSale
    ? (product.discount_percentage
        || (product.price > 0 ? Math.round(((product.price - effectivePrice) / product.price) * 100) : 0))
    : 0;

  const isBuyer       = !user || user.type === "buyer";
  const isUnavailable = !product.is_active;
  const isOutOfStock  = product.is_active && product.quantity <= 0;

  useEffect(() => {
    setIsInCart(!!cartItems?.some((c) => c.product_id === productId));
  }, [cartItems, productId]);

  const flash = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2200);
  }, []);

  // ── Wishlist ────────────────────────────────────────────────────────────────
  const toggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate("/login", { state: { returnTo: window.location.pathname } });
      return;
    }
    if (wishLoading) return;
    setWishLoading(true);
    try {
      if (isInWishlist) {
        await removeFromWishlist(productId);
        flash("Removed from wishlist");
      } else {
        await addToWishlist(productId);
        flash("Added to wishlist ♡");
      }
    } catch {
      flash("Could not update wishlist", "error");
    } finally {
      setWishLoading(false);
    }
  };

  // ── Add to cart ─────────────────────────────────────────────────────────────
  const handleAddToCart = async () => {
    if (!user) {
      navigate("/login", { state: { returnTo: window.location.pathname } });
      return;
    }
    if (isUnavailable || isOutOfStock || isInCart || cartLoading) return;
    setCartLoading(true);
    try {
      await addToCart(productId, 1);
      flash("Added to cart ✓");
    } catch {
      flash("Could not add to cart", "error");
    } finally {
      setCartLoading(false);
    }
  };

  // ── Derived display values ──────────────────────────────────────────────────
  const sellerName =
    product.seller?.seller_profile?.store_name ||
    product.seller?.store_name ||
    product.seller?.name;

  const cartLabel = isUnavailable
    ? "Unavailable"
    : isOutOfStock
    ? "Out of Stock"
    : isInCart
    ? "In Cart"
    : cartLoading
    ? "Adding…"
    : "Add to Cart";

  return (
    <motion.div
      className={`group relative bg-white dark:bg-slate-800 rounded-2xl overflow-hidden flex flex-col h-full
                  border border-gray-100 shadow-sm
                  hover:shadow-lg hover:border-gray-200
                  transition-all duration-300 ease-out ${className}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0  }}
      transition={{ duration: 0.3 }}
    >
      {/* ── Image ───────────────────────────────────────────────────────────── */}
      <div className="relative flex-shrink-0 overflow-hidden bg-gray-50 dark:bg-slate-900 aspect-square">
        <Link to={`/products/${slug}`} className="block w-full h-full">
          {!imageError ? (
            <LazyLoadImage
              src={imageUrl}
              alt={loc(product.name_en, product.name_mm) || "Product"}
              effect="blur"
              className="w-full h-full object-center object-contain
                         transition-transform duration-500 ease-out
                         group-hover:scale-105"
              placeholderSrc="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 300'%3E%3Crect width='300' height='300' fill='%23f9fafb'/%3E%3C/svg%3E"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 dark:bg-slate-900">
              <PhotoIcon className="h-10 w-10 text-gray-300 mb-1" />
              <span className="text-xs text-gray-400 dark:text-slate-600">No image</span>
            </div>
          )}
        </Link>

        {/* Inline toast */}
        <MiniToast msg={toast?.msg} type={toast?.type} />

        {/* ── Badges ── */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
          {discountPct > 0 && !isOutOfStock && !isUnavailable && (
            <span className="bg-red-500 text-white text-[10px] font-bold
                             px-2 py-0.5 rounded-full leading-tight">
              -{Math.round(discountPct)}%
            </span>
          )}
          {product.is_new && !isOutOfStock && !isUnavailable && (
            <span className="bg-green-500 text-white text-[10px] font-bold
                             px-2 py-0.5 rounded-full leading-tight">
              NEW
            </span>
          )}
          {isOutOfStock && (
            <span className="bg-gray-700/80 text-white text-[10px] font-bold
                             px-2 py-0.5 rounded-full leading-tight backdrop-blur-sm">
              Sold Out
            </span>
          )}
          {isUnavailable && !isOutOfStock && (
            <span className="bg-gray-400 text-white text-[10px] font-bold
                             px-2 py-0.5 rounded-full leading-tight">
              N/A
            </span>
          )}
        </div>

        {/* ── Wishlist button ── */}
        {isBuyer && (
          <button
            onClick={toggleWishlist}
            disabled={wishLoading}
            className="absolute top-2.5 right-2.5
                       w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm shadow
                       flex items-center justify-center
                       hover:bg-white hover:scale-110 active:scale-95
                       transition-all duration-150 focus:outline-none
                       focus:ring-2 focus:ring-green-400 focus:ring-offset-1
                       disabled:opacity-60"
            aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
          >
            {isInWishlist
              ? <HeartSolid className="h-3.5 w-3.5 text-red-500" />
              : <HeartOutline className="h-3.5 w-3.5 text-gray-500 dark:text-slate-500 group-hover:text-red-400 transition-colors" />
            }
          </button>
        )}

        {/* ── Category chip (bottom-left) ── */}
        {(product.category?.name_en || product.category?.name_mm) && (
          <div className="absolute bottom-2 left-2">
            <span className="text-[10px] font-medium text-gray-500
                             bg-white/80 backdrop-blur-sm px-2 py-0.5 rounded-full">
              {loc(product.category?.name_en, product.category?.name_mm)}
            </span>
          </div>
        )}
      </div>

      {/* ── Content ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-grow px-3 pt-3 pb-3 sm:px-4 sm:pt-3.5">

        {/* Product name */}
        <Link to={`/products/${slug}`} className="block mb-1.5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-slate-100 line-clamp-2 leading-snug
                         group-hover:text-green-700 transition-colors duration-150">
            {loc(product.name_en, product.name_mm) || product.name || "Unnamed Product"}
          </h3>
        </Link>

        {/* Rating */}
        <Stars rating={product.average_rating} count={product.review_count} />

        {/* Seller name */}
        {sellerName && (
          <p className="mt-1 text-[10px] text-gray-400 dark:text-slate-600 truncate">
            by {sellerName}
          </p>
        )}

        {/* Spacer */}
        <div className="flex-grow" />

        {/* ── Price ─────────────────────────────────────────────────────────── */}
        <div className="mt-3 pt-2.5 border-t border-gray-100 dark:border-slate-800">
          <div className="flex items-end justify-between gap-1 flex-wrap">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              {discountPct > 0 ? (
                <>
                  <span className="text-base font-bold text-red-600 leading-none">
                    {formatMMK(effectivePrice)}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-slate-600 line-through leading-none">
                    {formatMMK(product.price)}
                  </span>
                </>
              ) : (
                <span className="text-base font-bold text-green-700 leading-none">
                  {formatMMK(product.price)}
                </span>
              )}
            </div>

            {/* MOQ chip */}
            {product.moq > 1 && (
              <span className="text-[10px] text-gray-400 dark:text-slate-600 bg-gray-50 dark:bg-slate-900 border border-gray-200
                               px-1.5 py-0.5 rounded-md font-medium whitespace-nowrap">
                MOQ {product.moq}
              </span>
            )}
          </div>
        </div>

        {/* ── Add to Cart button ─────────────────────────────────────────────── */}
        {isBuyer && (
          <button
            onClick={handleAddToCart}
            disabled={isUnavailable || isOutOfStock || isInCart || cartLoading}
            className={`mt-2.5 w-full rounded-xl py-2 text-xs font-semibold
                        flex items-center justify-center gap-1.5
                        transition-all duration-150 focus:outline-none
                        focus:ring-2 focus:ring-green-500 focus:ring-offset-1
                        ${isUnavailable || isOutOfStock
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : isInCart
                          ? "bg-green-50 text-green-700 border border-green-200 cursor-default"
                          : "bg-green-600 hover:bg-green-700 active:bg-green-800 text-white shadow-sm hover:shadow"
                        }`}
            aria-label={cartLabel}
          >
            {!isUnavailable && !isOutOfStock && (
              <ShoppingCartIcon className="h-3.5 w-3.5 flex-shrink-0" />
            )}
            {cartLabel}
          </button>
        )}
      </div>
      {/* ── Delivery zones (swipe-up ticker) ── */}
      {(product.seller_id || product.seller?.id) && (
        <DeliveryZoneStrip
          sellerProfile={product.seller?.seller_profile || product.seller_profile}
        />
      )}
    </motion.div>
  );
};

export default ProductCard;