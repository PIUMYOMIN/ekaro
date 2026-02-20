import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { StarIcon, PhotoIcon, HeartIcon as HeartOutline } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
import { motion } from "framer-motion";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import { useWishlist } from "../../context/WishlistContext";
import { useCart } from "../../context/CartContext";

// Placeholder image path – ensure this file exists in your public folder
const PLACEHOLDER_IMAGE = "/placeholder-product.jpg";

const ProductCard = ({ product }) => {
  const { user } = useAuth();
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { cartItems } = useCart();
  const [addingToCart, setAddingToCart] = useState(false);
  const [message, setMessage] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [isInCart, setIsInCart] = useState(false);
  const navigate = useNavigate();
  const slug = product.slug_en || product.slug || product.id;
  const productId = product.id || product.product_id;

  // Extract valid image URLs from product.images
  const getValidImages = () => {
    if (!product.images || !Array.isArray(product.images)) return [];
    // Filter out invalid URLs (empty string, just folder path, etc.)
    return product.images.filter(img => {
      const url = img.url;
      return url && url !== "http://localhost:8000/storage/" && url.trim() !== "";
    });
  };

  const validImages = getValidImages();

  // Get the best image URL for display
  const getImageUrl = () => {
    if (validImages.length === 0) return null;
    // Find primary image
    const primary = validImages.find(img => img.is_primary === true);
    const imageToUse = primary || validImages[0];
    return imageToUse.url;
  };

  const imageUrl = getImageUrl();

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
      navigate("/login", { state: { from: "cart-add", productId, returnTo: window.location.pathname } });
      return;
    }
    if (!productId) {
      setMessage({ type: "error", message: "Invalid product" });
      setTimeout(() => setMessage(null), 3000);
      return;
    }
    if (!product.is_active || product.quantity <= 0) {
      setMessage({ type: "error", message: "Product unavailable" });
      setTimeout(() => setMessage(null), 3000);
      return;
    }
    setAddingToCart(true);
    try {
      const response = await api.post("/cart", {
        product_id: productId,
        quantity: 1
      });
      setMessage({ type: "success", message: response.data.message || "Added to cart!" });
    } catch (error) {
      setMessage({ type: "error", message: error.response?.data?.message || "Failed to add to cart" });
    } finally {
      setAddingToCart(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const formatMMK = (amount) =>
    new Intl.NumberFormat("my-MM", { style: "currency", currency: "MMK", minimumFractionDigits: 0 }).format(amount || 0);

  // Button text logic
  let buttonText = "Add to Cart";
  if (addingToCart) buttonText = "Adding...";
  else if (!product.is_active) buttonText = "Unavailable";
  else if (product.quantity <= 0) buttonText = "Out of Stock";
  else if (isInCart) buttonText = "In Cart";

  return (
    <>
      {message && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-md shadow-lg flex items-center justify-between max-w-md ${
          message.type === "success" ? "bg-green-100 border-green-400 text-green-700" :
          message.type === "error" ? "bg-red-100 border-red-400 text-red-700" :
          "bg-blue-100 border-blue-400 text-blue-700"
        }`}>
          <span className="text-sm sm:text-base">{message.message}</span>
          <button onClick={() => setMessage(null)} className="ml-4 text-xl font-bold hover:opacity-70">×</button>
        </div>
      )}

      <motion.div
        className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full"
        whileHover={{ y: -5 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="relative flex-shrink-0">
          <Link to={`/products/${slug}`} className="block">
            <div className="w-full h-36 sm:h-48 bg-gray-100 rounded-t-lg overflow-hidden relative">
              {imageUrl && !imageError ? (
                <LazyLoadImage
                  src={imageUrl} // use full URL directly
                  alt={product.name_en || "Product"}
                  effect="blur"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
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

          {/* Top left badges */}
          <div className="absolute top-1 left-1 sm:top-2 sm:left-2 flex flex-col items-start space-y-0.5 sm:space-y-1">
            {discountPercentage > 0 && product.quantity > 0 && (
              <span className="bg-red-600 text-white text-[10px] sm:text-xs font-bold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full">
                -{discountPercentage}%
              </span>
            )}
            {product.quantity <= 0 && (
              <span className="bg-red-600 text-white text-[10px] sm:text-xs font-semibold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full">
                Out of Stock
              </span>
            )}
          </div>

          {/* Top right row */}
          <div className="absolute top-1 right-1 sm:top-2 sm:right-2 flex items-center space-x-0.5 sm:space-x-1">
            <button
              onClick={toggleWishlist}
              className="p-1 sm:p-1.5 bg-white rounded-full shadow-md hover:bg-gray-100 transition"
              aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
            >
              {isInWishlist ? (
                <HeartSolid className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
              ) : (
                <HeartOutline className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600 hover:text-red-500" />
              )}
            </button>

            {product.is_featured && (
              <span className="bg-yellow-500 text-white text-[10px] sm:text-xs font-semibold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full">
                Featured
              </span>
            )}
            {validImages.length > 0 && (
              <span className="bg-black/70 text-white text-[10px] sm:text-xs font-medium px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full">
                {validImages.length}
              </span>
            )}
          </div>

          {/* Category badge */}
          {product.category?.name_en && (
            <div className="absolute bottom-1 left-1 sm:bottom-2 sm:left-2 bg-green-600 text-white text-[10px] sm:text-xs font-semibold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full">
              {product.category.name_en}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-2 sm:p-4 flex flex-col flex-grow">
          <div className="flex-grow">
            <div className="flex justify-between items-start gap-1">
              <div className="flex-1 min-w-0">
                <Link to={`/products/${slug}`} className="block">
                  <h3 className="text-sm sm:text-lg font-medium text-gray-900 hover:text-green-700 line-clamp-2 min-h-[2.5rem] sm:min-h-[3.5rem]">
                    {product.name_en || product.name || "Unnamed Product"}
                  </h3>
                </Link>
                <div className="flex items-center mt-0.5 sm:mt-2">
                  <div className="flex">
                    {[0,1,2,3,4].map(i => (
                      <StarIcon key={i} className={`h-3 w-3 sm:h-4 sm:w-4 ${i < ratingInfo.stars ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
                    ))}
                  </div>
                  <span className="ml-1 text-[10px] sm:text-sm text-gray-500">{ratingInfo.formatted}</span>
                  {product.review_count > 0 && (
                    <span className="ml-1 text-[10px] sm:text-sm text-gray-500">({product.review_count})</span>
                  )}
                </div>
                {product.description_en && (
                  <p className="mt-1 text-xs sm:text-sm text-gray-600 line-clamp-2">{product.description_en}</p>
                )}
              </div>
              <div className="text-right flex-shrink-0 ml-1 sm:ml-2">
                {discountPercentage > 0 ? (
                  <>
                    <p className="text-xs sm:text-lg font-bold text-red-600">
                      {formatMMK(product.discount_price || (product.price * (1 - discountPercentage/100)))}
                    </p>
                    <p className="text-[8px] sm:text-xs text-gray-500 line-through">{formatMMK(product.price)}</p>
                  </>
                ) : (
                  <p className="text-xs sm:text-lg font-bold text-green-700">{formatMMK(product.price)}</p>
                )}
                {product.moq > 1 && (
                  <p className="text-[8px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1">
                    MOQ: {product.moq} {product.min_order_unit || "units"}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Button */}
          <div className="mt-2 sm:mt-4 pt-2 sm:pt-4 border-t border-gray-100">
            <button
              onClick={handleAddToCart}
              disabled={addingToCart || !product.is_active || product.quantity <= 0}
              className={`w-full rounded-md py-1 sm:py-2 px-2 sm:px-4 text-xs sm:text-sm font-medium text-white ${
                !product.is_active || product.quantity <= 0 ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
              } transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {addingToCart ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white mr-1 inline-block"></div>
                  {buttonText}
                </>
              ) : (
                buttonText
              )}
            </button>
            <div className="flex justify-between items-center mt-1 sm:mt-2 text-[8px] sm:text-xs text-gray-500">
              <span className="truncate max-w-[60%]">{product.seller?.store_name || product.seller?.name || "Seller"}</span>
              <div className="flex items-center space-x-0.5 sm:space-x-1">
                {product.is_new && <span className="bg-blue-100 text-blue-800 px-1 sm:px-2 py-0.5 rounded">New</span>}
                {product.is_on_sale && discountPercentage === 0 && (
                  <span className="bg-red-100 text-red-800 px-1 sm:px-2 py-0.5 rounded">Sale</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default ProductCard;