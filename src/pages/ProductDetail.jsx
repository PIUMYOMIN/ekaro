import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import {
  StarIcon,
  ShoppingCartIcon,
  HeartIcon,
  ArrowLeftIcon,
  XMarkIcon
} from "@heroicons/react/24/solid";
import api from "../utils/api";

const ProductDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    const fetchProductData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch product details from public endpoint
        const productResponse = await api.get(`/products/${id}`);
        const productData = productResponse.data.data.product;

        // Parse images if they're stored as JSON string or use the provided array
        let formattedImages = [];
        if (productData.images) {
          if (Array.isArray(productData.images)) {
            formattedImages = productData.images;
          } else if (typeof productData.images === "string") {
            try {
              formattedImages = JSON.parse(productData.images);
            } catch (e) {
              console.warn("Failed to parse images JSON:", e);
              formattedImages = [
                { url: productData.images, angle: "front", is_primary: true }
              ];
            }
          }
        }

        // Parse specifications if they're stored as JSON string
        let formattedSpecifications = {};
        if (productData.specifications) {
          if (typeof productData.specifications === "string") {
            try {
              formattedSpecifications = JSON.parse(productData.specifications);
            } catch (e) {
              console.warn("Failed to parse specifications JSON:", e);
              formattedSpecifications = {};
            }
          } else if (typeof productData.specifications === "object") {
            formattedSpecifications = productData.specifications;
          }
        }

        setProduct({
          ...productData,
          images: formattedImages,
          specifications: formattedSpecifications,
          average_rating: productData.average_rating || 0,
          review_count: productResponse.data.data.reviews?.length || 0
        });

        // Set reviews from the API response
        setReviews(productResponse.data.data.reviews || []);

        // Check if product is in wishlist (only if user is a buyer)
        if (user && user.role === "buyer") {
          try {
            const wishlistResponse = await api.get("/wishlist");
            const wishlist = wishlistResponse.data.data || [];
            setIsInWishlist(
              wishlist.some((item) => item.id === productData.id)
            );
          } catch (wishlistError) {
            // Only log error if it's not a 403 (Forbidden) for non-buyers
            if (wishlistError.response?.status !== 403) {
              console.warn("Could not fetch wishlist:", wishlistError);
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch product:", err);
        setError(err.response?.data?.message || "Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [id, user]);

  const handleAddToCart = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (quantity < (product?.min_order || 1)) {
      alert(`Minimum order quantity is ${product.min_order}`);
      return;
    }

    if (quantity > (product?.quantity || 0)) {
      alert(`Only ${product.quantity} items available in stock`);
      return;
    }

    setAddingToCart(true);
    try {
      const result = await addToCart({
        id: product.id,
        quantity: quantity
      });

      setSuccessMessage(
        result.message || "Product added to cart successfully!"
      );
    } catch (error) {
      console.error("Failed to add to cart:", error);
      setSuccessMessage({
        type: "error",
        message: error.message || "Failed to add product to cart"
      });
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    navigate("/cart");
  };

  const handleAddToWishlist = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    setWishlistLoading(true);
    try {
      if (isInWishlist) {
        await api.delete(`/wishlist/${product.id}`);
        setIsInWishlist(false);
        setSuccessMessage("Removed from wishlist");
      } else {
        await api.post("/wishlist", { product_id: product.id });
        setIsInWishlist(true);
        setSuccessMessage("Added to wishlist");
      }
    } catch (error) {
      console.error("Failed to update wishlist:", error);
      setSuccessMessage({
        type: "error",
        message: error.response?.data?.message || "Failed to update wishlist"
      });
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleReviewAction = () => {
    if (!user) {
      navigate("/login");
      return;
    }

    // Check if user is admin or seller
    if (user.role === "admin" || user.role === "seller") {
      alert("Admins and sellers cannot write reviews");
      return;
    }

    setShowReviewForm(!showReviewForm);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!user) {
      navigate("/login");
      return;
    }

    if (rating === 0) {
      alert("Please select a rating");
      return;
    }

    setSubmittingReview(true);
    try {
      const response = await api.post(`/products/${product.id}/reviews`, {
        product_id: product.id,
        rating,
        comment: reviewText
      });

      const newReview = {
        ...response.data.data,
        user: { name: user.name }
      };

      setReviews([newReview, ...reviews]);
      setReviewText("");
      setRating(0);
      setShowReviewForm(false);

      // Update product rating
      setProduct((prev) => ({
        ...prev,
        average_rating: response.data.product_rating,
        review_count: prev.review_count + 1
      }));

      // Show success message from backend or default message
      setSuccessMessage(
        response.data.message || "Review submitted successfully!"
      );
    } catch (error) {
      console.error("Failed to submit review:", error);
      alert(error.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  const closeSuccessMessage = () => {
    setSuccessMessage(null);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500" />
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Product Not Found
        </h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={() => navigate("/products")}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
        >
          Back to Products
        </button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Product Not Found</h2>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Success Message Popup */}
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md shadow-lg flex items-center justify-between max-w-md">
          <span>{successMessage}</span>
          <button
            onClick={closeSuccessMessage}
            className="ml-4 text-green-700 hover:text-green-900"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-green-600 hover:text-green-700 mb-6"
      >
        <ArrowLeftIcon className="h-5 w-5 mr-2" />
        Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="bg-gray-100 rounded-lg h-80 lg:h-96 flex items-center justify-center overflow-hidden">
            <img
              src={
                typeof product.images[activeImage] === "string"
                  ? product.images[activeImage]
                  : product.images[activeImage]?.url ||
                  "/placeholder-product.jpg"
              }
              alt={product.name}
              className="max-h-full max-w-full object-contain"
              onError={(e) => {
                e.target.src = "/placeholder-product.jpg";
              }}
            />
          </div>

          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImage(index)}
                  className={`bg-gray-100 rounded h-20 flex items-center justify-center overflow-hidden border-2 ${activeImage === index
                    ? "border-green-500"
                    : "border-transparent"
                    }`}
                >
                  <img
                    src={
                      typeof img === "string"
                        ? img
                        : img.url || "/placeholder-product.jpg"
                    }
                    alt={`View ${index + 1}`}
                    className="max-h-full max-w-full object-contain"
                    onError={(e) => {
                      e.target.src = "/placeholder-product.jpg";
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
              {product.name}
            </h1>
            {product.name_en && (
              <p className="text-lg text-gray-600 mt-1">{product.name_en}</p>
            )}
          </div>

          {/* Rating Summary */}
          <div className="flex items-center">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <StarIcon
                  key={star}
                  className={`h-5 w-5 ${star <= Math.round(product.average_rating || 0)
                    ? "text-yellow-400"
                    : "text-gray-300"
                    }`}
                />
              ))}
            </div>
            <span className="ml-2 text-gray-600">
              {product.average_rating?.toFixed(1) || "0.0"} (
              {product.review_count || 0} reviews)
            </span>
          </div>

          {/* Price */}
          <div>
            <h2 className="text-2xl font-semibold text-green-600">
              {parseFloat(product.price).toLocaleString()} MMK
            </h2>
            <p className="text-gray-500 mt-1">Tax inclusive</p>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-gray-700 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Specifications */}
          {product.specifications &&
            Object.keys(product.specifications).length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Specifications</h3>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {Object.entries(product.specifications).map(
                    ([key, value]) => (
                      <div key={key} className="border-t border-gray-200 pt-2">
                        <dt className="font-medium text-gray-900 text-sm">
                          {key.charAt(0).toUpperCase() +
                            key.slice(1).replace(/([A-Z])/g, " $1")}
                        </dt>
                        <dd className="text-gray-700 text-sm">{value}</dd>
                      </div>
                    )
                  )}
                </dl>
              </div>
            )}

          {/* Quantity Selection */}
          <div className="flex items-center space-x-4">
            <label htmlFor="quantity" className="font-medium">
              Quantity
            </label>
            <input
              type="number"
              id="quantity"
              min={product.min_order || 1}
              max={product.quantity || 100}
              value={quantity}
              onChange={(e) =>
                setQuantity(
                  Math.max(
                    parseInt(e.target.value) || 1,
                    product.min_order || 1
                  )
                )
              }
              className="w-20 px-3 py-2 border border-gray-300 rounded-md"
            />
            <span className="text-gray-600">
              {product.quantity || 0} in stock
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              onClick={handleAddToCart}
              disabled={addingToCart || product.quantity === 0}
              className="flex-1 bg-green-600 text-white py-3 px-6 rounded-md hover:bg-green-700 transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {addingToCart ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Adding...
                </>
              ) : (
                <>
                  <ShoppingCartIcon className="h-5 w-5 mr-2" />
                  Add to Cart
                </>
              )}
            </button>

            <button
              onClick={handleBuyNow}
              disabled={addingToCart || product.quantity === 0}
              className="flex-1 bg-gray-800 text-white py-3 px-6 rounded-md hover:bg-gray-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Buy Now
            </button>

            <button
              onClick={handleAddToWishlist}
              disabled={wishlistLoading}
              className="p-3 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              title={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
            >
              {wishlistLoading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600" />
              ) : (
                <HeartIcon
                  className={`h-6 w-6 ${isInWishlist ? "text-red-500 fill-current" : ""
                    }`}
                />
              )}
            </button>
          </div>

          {product.quantity === 0 && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              This product is currently out of stock
            </div>
          )}

          {/* Seller Info */}
          {product.seller && (
            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold mb-3">Seller Information</h3>
              <Link
                to={`/sellers/${product.seller.seller_profile.store_slug}`}
                className="flex items-center hover:bg-gray-50 p-2 rounded-lg transition-colors"
              >
                <div className="bg-gray-200 border-2 border-dashed rounded-full w-12 h-12 flex items-center justify-center">
                  <span className="text-gray-500 text-sm">Shop</span>
                </div>
                <div className="ml-4">
                  <p className="font-medium text-green-600 hover:text-green-700">
                    {product.seller.seller_profile?.store_name || product.seller?.name || product.seller}
                  </p>
                  <p className="text-gray-600 text-sm">
                    {product.seller?.rating || 4.7} ★ (120 ratings)
                  </p>
                </div>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-16">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Customer Reviews ({product.review_count || 0})
          </h2>
          <button
            onClick={handleReviewAction}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            Write a Review
          </button>
        </div>

        {/* Review Form */}
        {showReviewForm && (
          <div className="mt-6 bg-white p-6 rounded-lg shadow-md mb-8">
            <h3 className="text-lg font-medium mb-4">Write a Review</h3>
            <form onSubmit={handleSubmitReview}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Your Rating</label>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="focus:outline-none mr-1"
                    >
                      <StarIcon
                        className={`h-8 w-8 ${star <= rating ? "text-yellow-400" : "text-gray-300"
                          }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <label htmlFor="review" className="block text-gray-700 mb-2">
                  Your Review
                </label>
                <textarea
                  id="review"
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  required
                  placeholder="Share your experience with this product..."
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center justify-center"
                >
                  {submittingReview ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    "Submit Review"
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Reviews List */}
        <div className="space-y-6">
          {reviews.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg">No reviews yet</p>
              <p className="text-gray-400">
                Be the first to review this product!
              </p>
            </div>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="border-b border-gray-200 pb-6">
                <div className="flex items-start">
                  <div className="bg-gray-200 border-2 border-dashed rounded-full w-10 h-10 flex items-center justify-center">
                    <span className="text-gray-500 text-xs">User</span>
                  </div>
                  <div className="ml-4 flex-1">
                    <h4 className="font-medium">
                      {review.buyer?.name ||
                        review.user?.name ||
                        review.user ||
                        "Anonymous"}
                    </h4>
                    <div className="flex items-center mt-1">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <StarIcon
                            key={star}
                            className={`h-4 w-4 ${star <= review.rating
                              ? "text-yellow-400"
                              : "text-gray-300"
                              }`}
                          />
                        ))}
                      </div>
                      <span className="ml-2 text-sm text-gray-500">
                        {review.created_at}
                      </span>
                    </div>
                    <p className="mt-3 text-gray-700 leading-relaxed">
                      {review.comment}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
