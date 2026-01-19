import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Tab } from "@headlessui/react";
import {
  StarIcon,
  CheckCircleIcon,
  ShoppingBagIcon,
  PlusIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  ChatBubbleLeftIcon,
  ChevronLeftIcon,
  UserIcon,
  XMarkIcon,
  CheckBadgeIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline";

import ProductCard from "../components/ui/ProductCard";
import ReviewCard from "../components/ui/ReviewCard";
import Pagination from "../components/ui/Pagination";
import api from "../utils/api";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const SellerProfile = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [reviewsPerPage] = useState(5);
  const [activeTab, setActiveTab] = useState("products");
  const [loading, setLoading] = useState({
    seller: true,
    products: true,
    reviews: true
  });
  const [error, setError] = useState(null);

  // Follow state
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);

  // Review form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  // Popup notification state
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState("success");

  const [logoError, setLogoError] = useState(false);


  useEffect(() => {
    const fetchSellerData = async () => {
      try {
        setLoading({ seller: true, products: true, reviews: true });
        setError(null);

        // Fetch seller details
        try {
          const sellerRes = await api.get(`/sellers/${id}`);
          console.log("Fetched seller data:", sellerRes.data);
          if (sellerRes.data.success && sellerRes.data.data) {
            const sellerData = sellerRes.data.data.seller;
            setSeller(sellerData);

            // Set follow data
            setIsFollowing(sellerRes.data.data.is_following || false);
            setFollowersCount(sellerRes.data.data.stats?.followers_count || 0);

            // Set products from the response
            if (sellerRes.data.data.products && sellerRes.data.data.products.data) {
              setProducts(sellerRes.data.data.products.data);
            }

            // Set reviews from the seller data
            if (sellerData.reviews) {
              setReviews(sellerData.reviews);
            }

            // Set stats if included
            if (sellerRes.data.data.stats) {
              setStats(sellerRes.data.data.stats);
            }
          } else {
            throw new Error('Invalid seller data structure');
          }
        } catch (err) {
          console.error("Failed to fetch seller:", err);
          setError("Failed to load seller information.");
        } finally {
          setLoading(prev => ({ ...prev, seller: false, reviews: false, products: false }));
        }
      } catch (error) {
        console.error("Error fetching seller data:", error);
        setError("Failed to load seller data. Please try again later.");
        setLoading({ seller: false, products: false, reviews: false });
      }
    };

    fetchSellerData();
  }, [id]);

  // Handle follow toggle
  const handleFollowToggle = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showNotification('Please login to follow sellers', 'error');
        return;
      }

      const response = await api.post(`/follow/seller/${seller.user_id}/toggle`);
      if (response.data.success) {
        setIsFollowing(response.data.data.is_following);
        setFollowersCount(response.data.data.followers_count);

        showNotification(
          response.data.data.is_following ? 'Successfully followed seller' : 'Successfully unfollowed seller',
          'success'
        );
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      if (error.response?.status === 401) {
        showNotification('Please login to follow sellers', 'error');
      } else {
        showNotification('Failed to update follow status', 'error');
      }
    }
  };

  // Show popup notification
  const showNotification = (message, type = "success") => {
    setPopupMessage(message);
    setPopupType(type);
    setShowPopup(true);

    setTimeout(() => {
      setShowPopup(false);
    }, 5000);
  };

  // Handle review submission
  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!reviewRating) {
      showNotification("Please select a rating", "error");
      return;
    }

    setSubmittingReview(true);
    try {
      const response = await api.post(`/sellers/${id}/reviews`, {
        rating: reviewRating,
        comment: reviewComment,
      });

      if (response.data.success) {
        // Refresh reviews
        const sellerRes = await api.get(`/sellers/${id}`);
        if (sellerRes.data.success && sellerRes.data.data) {
          setSeller(sellerRes.data.data.seller);
          setReviews(sellerRes.data.data.seller.reviews || []);
        }

        setReviewRating(0);
        setReviewComment("");
        setShowReviewForm(false);
        showNotification("Review submitted successfully!", "success");
      }
    } catch (err) {
      console.error("Failed to submit review:", err);
      const errorMessage = err.response?.data?.message || "Failed to submit review. Please try again.";
      showNotification(errorMessage, "error");
    } finally {
      setSubmittingReview(false);
    }
  };

  // Safely get current reviews for pagination
  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = Array.isArray(reviews) ? reviews.slice(indexOfFirstReview, indexOfLastReview) : [];

  // Change page
  const paginate = pageNumber => setCurrentPage(pageNumber);

  // Render star ratings
  const renderStars = (rating, size = "h-5 w-5") => {
    if (!rating) {
      return (
        <div className="flex items-center">
          {[...Array(5)].map((_, i) => (
            <StarIcon key={i} className={`${size} text-gray-300`} />
          ))}
          <span className="ml-2 text-sm text-gray-500">No ratings</span>
        </div>
      );
    }

    const stars = [];
    const numericRating = parseFloat(rating);
    const fullStars = Math.floor(numericRating);
    const hasHalfStar = numericRating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<StarIcon key={i} className={`${size} text-yellow-400`} fill="currentColor" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<StarIcon key={i} className={`${size} text-yellow-400`} fill="currentColor" />);
      } else {
        stars.push(<StarIcon key={i} className={`${size} text-gray-300`} />);
      }
    }

    return stars;
  };

  // Render interactive stars for review form
  const renderInteractiveStars = () => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setReviewRating(star)}
            className="focus:outline-none transition-transform hover:scale-110"
          >
            <StarIcon
              className={`h-8 w-8 ${star <= reviewRating ? "text-yellow-400" : "text-gray-300"
                }`}
              fill={star <= reviewRating ? "currentColor" : "none"}
            />
          </button>
        ))}
      </div>
    );
  };

  // Popup notification component
  const PopupNotification = () => (
    <AnimatePresence>
      {showPopup && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          className="fixed top-4 mx-auto z-50 max-w-sm w-full"
        >
          <div className={`rounded-lg shadow-lg border-l-4 ${popupType === "success"
            ? "bg-green-50 border-green-500"
            : "bg-red-50 border-red-500"
            }`}>
            <div className="p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {popupType === "success" ? (
                    <CheckBadgeIcon className="h-6 w-6 text-green-500" />
                  ) : (
                    <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
                  )}
                </div>
                <div className="ml-3 w-0 flex-1">
                  <p className={`text-sm font-medium ${popupType === "success" ? "text-green-800" : "text-red-800"
                    }`}>
                    {popupMessage}
                  </p>
                </div>
                <div className="ml-4 flex-shrink-0 flex">
                  <button
                    onClick={() => setShowPopup(false)}
                    className={`inline-flex rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${popupType === "success"
                      ? "focus:ring-green-500 text-green-400 hover:text-green-500"
                      : "focus:ring-red-500 text-red-400 hover:text-red-500"
                      }`}
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (loading.seller && !seller) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-700">Loading seller information...</p>
        </div>
      </div>
    );
  }

  if (error && !seller) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="mt-2 text-lg font-medium text-gray-900">Error loading seller</h3>
          <p className="mt-1 text-sm text-gray-500">{error}</p>
          <div className="mt-6">
            <Link
              to="/sellers"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
            >
              Back to Sellers
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100">
            <UserIcon className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="mt-2 text-lg font-medium text-gray-900">Seller not found</h3>
          <p className="mt-1 text-sm text-gray-500">The seller you're looking for doesn't exist.</p>
          <div className="mt-6">
            <Link
              to="/sellers"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
            >
              Back to Sellers
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Calculate values from API data with safe fallbacks
  const rating = parseFloat(seller.reviews_avg_rating) || 0;
  const reviewCount = seller.reviews_count || 0;
  const productCount = products.length || stats.active_products || 0;
  const memberSince = seller.created_at ? new Date(seller.created_at).getFullYear() : 'N/A';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Popup Notification */}
      <PopupNotification />

      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Link to="/sellers" className="flex items-center text-green-600 hover:text-green-800 transition-colors duration-200">
          <ChevronLeftIcon className="h-5 w-5 mr-1" />
          {t("seller.back_to_sellers") || "Back to Sellers"}
        </Link>
      </div>

      {/* Seller Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/4 mb-6 md:mb-0">
              {!logoError && seller.store_logo ? (
                <img
                  src={seller.store_logo}
                  alt={seller.store_name}
                  className="w-32 h-32 rounded-full object-cover border-2 border-gray-200"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-300">
                  <span className="text-gray-600 text-xl font-bold">
                    {seller.store_name?.charAt(0)?.toUpperCase() || 'S'}
                  </span>
                </div>
              )}
            </div>

            <div className="md:w-3/4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center mb-2">
                    <h1 className="text-2xl font-bold mr-2">
                      {seller.store_name}
                    </h1>
                    {(seller.status === "approved" || seller.status === "active") && (
                      <CheckCircleIcon className="h-6 w-6 text-green-500" title="Verified Seller" />
                    )}
                  </div>

                  <div className="flex items-center mb-4">
                    <div className="flex text-yellow-400 mr-2">
                      {renderStars(rating, "h-5 w-5")}
                    </div>
                    <span className="text-gray-600">
                      {rating.toFixed(1)} ({stats.total_sales || 0} sales)
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{followersCount}</div>
                    <div className="text-xs text-gray-500">Followers</div>
                  </div>
                  <button
                    onClick={handleFollowToggle}
                    disabled={!seller.user_id}
                    className={`px-6 py-3 rounded-lg transition-all duration-200 font-medium ${isFollowing
                      ? "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                      : "bg-green-600 text-white hover:bg-green-700 shadow-md hover:shadow-lg"
                      } ${!seller.user_id ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isFollowing ? (
                      <div className="flex items-center space-x-2">
                        <CheckCircleIcon className="h-5 w-5" />
                        <span>Following</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <PlusIcon className="h-5 w-5" />
                        <span>Follow</span>
                      </div>
                    )}
                  </button>
                </div>
              </div>

              <p className="text-gray-700 mb-4 leading-relaxed">
                {seller.description || "No description available."}
              </p>

              {/* Categories and Business Type */}
              {seller.business_type && (
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm border border-gray-200">
                    {seller.business_type}
                  </span>
                  {seller.categories && seller.categories.map((category, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm border border-gray-200"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              )}

              {/* Products, Rating, Sales, Since Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div className="border border-gray-200 p-3 rounded-lg bg-gray-50">
                  <div className="font-bold text-lg text-gray-900">
                    {productCount}
                  </div>
                  <div className="text-gray-600 text-sm">Products</div>
                </div>
                <div className="border border-gray-200 p-3 rounded-lg bg-gray-50">
                  <div className="font-bold text-lg text-gray-900">
                    {rating.toFixed(1)}
                  </div>
                  <div className="text-gray-600 text-sm">Rating</div>
                </div>
                <div className="border border-gray-200 p-3 rounded-lg bg-gray-50">
                  <div className="font-bold text-lg text-gray-900">
                    {stats.total_sales || 0}
                  </div>
                  <div className="text-gray-600 text-sm">Sales</div>
                </div>
                {/* <div className="border border-gray-200 p-3 rounded-lg bg-gray-50">
                  <div className="font-bold text-lg text-gray-900">
                    {followersCount}
                  </div>
                  <div className="text-gray-600 text-sm">Followers</div>
                </div> */}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <Tab.Group>
          <div className="border-b border-gray-200">
            <Tab.List className="-mb-px flex space-x-8">
              <Tab
                className={({ selected }) =>
                  classNames(
                    selected
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                    'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200'
                  )
                }
              >
                {t("sellers.products.title") || "Products"} ({productCount})
              </Tab>
              <Tab
                className={({ selected }) =>
                  classNames(
                    selected
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                    'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200'
                  )
                }
              >
                {t("sellers.reviews.title") || "Reviews"} ({reviewCount})
              </Tab>
              <Tab
                className={({ selected }) =>
                  classNames(
                    selected
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                    'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200'
                  )
                }
              >
                {t("sellers.about.title") || "About"}
              </Tab>
            </Tab.List>
          </div>

          <Tab.Panels className="mt-6">
            {/* Products Tab */}
            <Tab.Panel>
              {loading.products ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <div key={index} className="animate-pulse bg-gray-200 rounded-lg h-80"></div>
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                  <ShoppingBagIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900">{t("seller.no_products_found")}</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    This seller hasn't added any products yet.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </Tab.Panel>

            {/* Reviews Tab */}
            <Tab.Panel>
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{t("seller.customers_reviews")}</h3>
                      <div className="mt-1 flex items-center">
                        {renderStars(rating)}
                        <span className="ml-2 text-sm font-medium text-gray-900">
                          {rating.toFixed(1)} out of 5
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowReviewForm(true)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 transition-colors duration-200"
                    >
                      {t("seller.write_review") || "Write a Review"}
                    </button>
                  </div>

                  {/* Review Form */}
                  {showReviewForm && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-6 bg-gray-50 rounded-lg p-6 border border-gray-200"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-lg font-medium text-gray-900">{t("seller.write_review") || "Write a Review"}</h4>
                        <button
                          onClick={() => setShowReviewForm(false)}
                          className="text-gray-400 hover:text-gray-500 transition-colors"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      </div>
                      <form onSubmit={handleSubmitReview}>
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Rating
                          </label>
                          {renderInteractiveStars()}
                          <p className="text-sm text-gray-500 mt-1">
                            {reviewRating > 0 ? `You selected ${reviewRating} star${reviewRating > 1 ? 's' : ''}` : 'Select a rating'}
                          </p>
                        </div>

                        <div className="mb-4">
                          <label htmlFor="reviewComment" className="block text-sm font-medium text-gray-700 mb-2">
                            {t("seller.write_review") || "Your Review"}
                          </label>
                          <textarea
                            id="reviewComment"
                            rows={4}
                            value={reviewComment}
                            onChange={(e) => setReviewComment(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                            placeholder={t("seller.rating.placeholder") || "Write your review here..."}
                          />
                        </div>

                        <div className="flex space-x-3">
                          <button
                            type="submit"
                            disabled={submittingReview}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 transition-colors"
                          >
                            {submittingReview ? (
                              <>
                                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                                {t("seller.submitting") || "Submitting..."}
                              </>
                            ) : (
                              t("seller.submit_review") || "Submit Review"
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowReviewForm(false)}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                          >
                            {t("seller.cancel") || "Cancel"}
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  )}

                  {loading.reviews ? (
                    <div className="mt-6 space-y-6">
                      {Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className="animate-pulse bg-gray-200 rounded-lg h-24"></div>
                      ))}
                    </div>
                  ) : currentReviews.length === 0 ? (
                    <div className="mt-8 text-center py-12">
                      <ChatBubbleLeftIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-lg font-medium text-gray-900">No reviews yet</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        This seller doesn't have any reviews yet.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="mt-6 space-y-6">
                        {currentReviews.map(review => (
                          <ReviewCard key={review.id} review={review} />
                        ))}
                      </div>

                      {reviews.length > reviewsPerPage && (
                        <div className="mt-8">
                          <Pagination
                            itemsPerPage={reviewsPerPage}
                            totalItems={reviews.length}
                            currentPage={currentPage}
                            paginate={paginate}
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </Tab.Panel>

            {/* About Tab */}
            <Tab.Panel>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="p-6">
                      <h3 className="text-lg font-medium text-gray-900">{t("seller.about_seller") || "About the Seller"}</h3>
                      <p className="mt-4 text-gray-600 leading-relaxed">
                        {t("seller.no_description") || "No additional information provided."}
                      </p>

                      <h4 className="mt-6 text-md font-medium text-gray-900">{t("seller.business_information") || "Business Information"}</h4>
                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">{t("seller.business_type") || "Business Type"}</p>
                          <p className="mt-1 text-gray-900">{seller.business_type || "Not specified"}</p>
                        </div>
                        {seller.business_registration_number && (
                          <div>
                            <p className="text-sm font-medium text-gray-500">{t("seller.registration_number") || "Registration Number"}</p>
                            <p className="mt-1 text-gray-900">{seller.business_registration_number}</p>
                          </div>
                        )}
                        {seller.tax_id && (
                          <div>
                            <p className="text-sm font-medium text-gray-500">Tax ID</p>
                            <p className="mt-1 text-gray-900">{seller.tax_id}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-500">Member Since</p>
                          <p className="mt-1 text-gray-900">{memberSince}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="p-6">
                      <h3 className="text-lg font-medium text-gray-900">{t("seller.contact_information") || "Contact Information"}</h3>

                      <div className="mt-4 space-y-4">
                        {seller.address && (
                          <div className="flex">
                            <MapPinIcon className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
                            <p className="ml-3 text-gray-600">{seller.address}</p>
                          </div>
                        )}

                        {seller.contact_phone && (
                          <div className="flex">
                            <PhoneIcon className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
                            <p className="ml-3 text-gray-600">{seller.contact_phone}</p>
                          </div>
                        )}

                        {seller.contact_email && (
                          <div className="flex">
                            <EnvelopeIcon className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
                            <p className="ml-3 text-gray-600">{seller.contact_email}</p>
                          </div>
                        )}

                        {seller.website && (
                          <div className="flex">
                            <GlobeAltIcon className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
                            <a
                              href={seller.website.startsWith('http') ? seller.website : `https://${seller.website}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-3 text-green-600 hover:text-green-800 transition-colors duration-200"
                            >
                              {seller.website}
                            </a>
                          </div>
                        )}
                      </div>

                      <div className="mt-6">
                        <button className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors duration-200">
                          <ChatBubbleLeftIcon className="h-5 w-5 mr-2" />
                          Contact Seller
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
};

export default SellerProfile;