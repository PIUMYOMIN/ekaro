import React, { useState, useCallback, memo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { StarIcon, TagIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { IMAGE_BASE_URL, DEFAULT_PLACEHOLDER } from "../../config"; // <-- import config

// Helper function to format MMK currency
export const formatMMK = amount => {
  const numAmount = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
  return new Intl.NumberFormat("my-MM", {
    style: "currency",
    currency: "MMK",
    minimumFractionDigits: 0
  }).format(numAmount);
};

// Memoized helper function to build image URL
const getImageUrl = (image) => {
  if (!image) return DEFAULT_PLACEHOLDER;
  
  // Handle different image formats
  if (typeof image === 'string') {
    if (image.startsWith('http')) {
      return image; // already a full URL
    }
    // It's a storage path, convert to URL using IMAGE_BASE_URL
    const cleanPath = image.replace('public/', '');
    return `${IMAGE_BASE_URL}/${cleanPath}`;
  }
  
  if (typeof image === 'object') {
    // Try url first
    if (image.url) {
      if (image.url.startsWith('http')) {
        return image.url;
      }
      const cleanPath = image.url.replace('public/', '');
      return `${IMAGE_BASE_URL}/${cleanPath}`;
    }
    
    // Try path if no url
    if (image.path) {
      const cleanPath = image.path.replace('public/', '');
      return `${IMAGE_BASE_URL}/${cleanPath}`;
    }
  }
  
  return DEFAULT_PLACEHOLDER;
};

// Helper function to get category name
const getCategoryName = (product) => {
  if (!product) return '';
  
  if (product.category) {
    if (typeof product.category === 'object') {
      return product.category.name_en || product.category.name || '';
    }
    return product.category;
  }
  
  if (product.category_name) {
    return product.category_name;
  }
  
  if (product.category_en) {
    return product.category_en;
  }
  
  return '';
};

// Helper function to get category link
const getCategoryLink = (product) => {
  if (!product) return '#';
  
  if (product.category_id) {
    return `/products?category=${product.category_id}`;
  }
  
  if (product.category && typeof product.category === 'object' && product.category.id) {
    return `/products?category=${product.category.id}`;
  }
  
  return '/products';
};

const ProductCard = memo(({ product, onClick }) => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [addingToCart, setAddingToCart] = useState(false);
  const [message, setMessage] = useState(null);
  const [imageError, setImageError] = useState(false);
  const navigate = useNavigate();

  // Memoized helper function to safely get and format average rating
  const getAverageRating = useCallback(() => {
    if (!product) {
      return {
        value: 0,
        formatted: "0.0",
        stars: 0
      };
    }
    
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
  }, [product]);

  const ratingInfo = getAverageRating();

  // Get the primary or first image for display
  const getProductImage = useCallback(() => {
    if (!product || !product.images) return DEFAULT_PLACEHOLDER;
    
    let images = product.images;
    
    if (typeof images === 'string') {
      try {
        images = JSON.parse(images);
      } catch (e) {
        return getImageUrl(images);
      }
    }
    
    if (Array.isArray(images)) {
      if (images.length === 0) {
        return DEFAULT_PLACEHOLDER;
      }
      
      const primaryImage = images.find(img => {
        if (typeof img === 'object') {
          return img.is_primary;
        }
        return false;
      });
      
      const imageToUse = primaryImage || images[0];
      return getImageUrl(imageToUse);
    }
    
    return DEFAULT_PLACEHOLDER;
  }, [product]);

  const productImage = getProductImage();
  const productName = product?.name_en || product?.name || "Unnamed Product";
  const productPrice = product?.price || 0;
  const productMOQ = product?.moq || 1;
  const productUnit = product?.min_order_unit || 'units';
  const isActive = product?.is_active !== false;
  const inStock = (product?.quantity || 0) > 0;
  const isOnSale = product?.is_on_sale || false;
  const categoryName = getCategoryName(product);
  const categoryLink = getCategoryLink(product);
  const sellerName = product?.seller?.store_name || product?.seller?.name || product?.seller_name || 'Seller';

  const handleAddToCart = useCallback(async (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    
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

    if (!isActive) {
      setMessage({
        type: 'error',
        message: 'This product is currently unavailable'
      });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    if (!inStock) {
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
  }, [user, product.id, isActive, inStock, navigate, addToCart]);

  React.useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  React.useEffect(() => {
    setImageError(false);
  }, [product]);

  return (
    <>
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
        className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full group"
        whileHover={{ y: -5 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClick}
      >
        <div className="relative flex-shrink-0">
          <Link to={`/products/${product.id}`} className="block" onClick={(e) => e.stopPropagation()}>
            <div className="w-full h-48 bg-gray-200 rounded-t-lg overflow-hidden">
              <LazyLoadImage
                src={imageError ? DEFAULT_PLACEHOLDER : productImage}
                alt={productName}
                effect="blur"
                threshold={100}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                placeholderSrc="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 300'%3E%3Crect width='300' height='300' fill='%23f3f4f6'/%3E%3C/svg%3E"
                onError={() => setImageError(true)}
                loading="lazy"
              />
            </div>
          </Link>
          
          {categoryName && (
            <Link 
              to={categoryLink} 
              onClick={(e) => e.stopPropagation()}
              className="absolute top-2 left-2 inline-flex items-center gap-1 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-medium px-2 py-1.5 rounded-lg hover:bg-white hover:shadow-sm transition-all"
            >
              <TagIcon className="h-3 w-3" />
              <span className="truncate max-w-[80px]">{categoryName}</span>
            </Link>
          )}
          
          {isOnSale && (
            <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1.5 rounded">
              SALE
            </div>
          )}
          
          {!inStock && (
            <div className="absolute top-10 right-2 bg-gray-700 text-white text-xs font-semibold px-2 py-1.5 rounded">
              Out of Stock
            </div>
          )}
          
          {!isActive && (
            <div className="absolute top-10 right-2 bg-yellow-500 text-white text-xs font-semibold px-2 py-1.5 rounded">
              Inactive
            </div>
          )}
          
          {sellerName && (
            <div className="absolute bottom-2 left-2">
              <div className="flex items-center gap-1.5 bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-1.5 rounded-lg">
                <div className="w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-700">
                    {sellerName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="truncate max-w-[100px]">{sellerName}</span>
              </div>
            </div>
          )}
        </div>
        
        <div className="p-4 flex flex-col flex-grow">
          <div className="flex-grow">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <Link to={`/products/${product.id}`} onClick={(e) => e.stopPropagation()}>
                  <h3 className="text-lg font-medium text-gray-900 hover:text-green-700 line-clamp-2 min-h-[56px]">
                    {productName}
                  </h3>
                </Link>
                
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center">
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
                    {product.reviews_count > 0 && (
                      <span className="ml-1 text-sm text-gray-500">
                        ({product.reviews_count || 0})
                      </span>
                    )}
                  </div>
                  
                  {categoryName && (
                    <Link 
                      to={categoryLink}
                      onClick={(e) => e.stopPropagation()}
                      className="md:hidden text-xs text-green-600 hover:text-green-800 font-medium"
                    >
                      {categoryName}
                    </Link>
                  )}
                </div>
                
                {product.description_en && (
                  <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                    {product.description_en}
                  </p>
                )}
              </div>
              
              <div className="text-right ml-2 flex-shrink-0">
                <div className="flex flex-col items-end">
                  <p className="text-lg font-bold text-green-700">
                    {formatMMK(productPrice)}
                  </p>
                  {product.discount_price && product.discount_price < productPrice && (
                    <p className="text-sm text-gray-400 line-through">
                      {formatMMK(product.discount_price)}
                    </p>
                  )}
                  {productMOQ > 1 && (
                    <p className="text-xs text-gray-500 mt-1">
                      MOQ: {productMOQ} {productUnit}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between mb-3">
              {categoryName && (
                <Link 
                  to={categoryLink}
                  onClick={(e) => e.stopPropagation()}
                  className="hidden md:flex items-center gap-1 text-xs text-gray-600 hover:text-green-700 font-medium"
                >
                  <TagIcon className="h-3 w-3" />
                  <span className="truncate max-w-[120px]">{categoryName}</span>
                </Link>
              )}
              
              <div className={`text-xs font-medium px-2 py-1 rounded-full ${
                !isActive ? 'bg-yellow-100 text-yellow-800' :
                !inStock ? 'bg-red-100 text-red-800' :
                'bg-green-100 text-green-800'
              }`}>
                {!isActive ? 'Unavailable' : !inStock ? 'Out of Stock' : 'In Stock'}
              </div>
            </div>
            
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={addingToCart || !isActive || !inStock}
              className={`w-full rounded-md py-2.5 px-4 flex items-center justify-center text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all ${
                !isActive || !inStock
                  ? 'bg-gray-400 hover:bg-gray-500'
                  : 'bg-green-600 hover:bg-green-700 hover:shadow-md'
              }`}
            >
              {addingToCart ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Adding...
                </>
              ) : !isActive ? (
                'Unavailable'
              ) : !inStock ? (
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
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;