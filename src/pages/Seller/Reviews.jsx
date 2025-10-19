// src/components/seller/Reviews.jsx
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  StarIcon,
  ChatBubbleLeftIcon,
  ArrowUturnLeftIcon,
  EllipsisVerticalIcon
} from "@heroicons/react/24/outline";
import api from "../../utils/api";

const Reviews = () => {
  const { t } = useTranslation();
  const [activeFilter, setActiveFilter] = useState("all");
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(
    () => {
      fetchReviews();
    },
    [currentPage]
  );

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await api.get(
        `seller/products/reviews?page=${currentPage}`
      );

      if (response.data.success) {
        setReviews(response.data.data.data);
        setTotalPages(response.data.data.last_page);
      }
    } catch (err) {
      setError(t("seller.failed_to_load_reviews"));
      console.error("Error fetching reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate average rating and counts from API data
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

  const ratingCounts = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length,
    percent:
      reviews.length > 0
        ? reviews.filter(r => r.rating === rating).length / reviews.length * 100
        : 0
  }));

  // Filter reviews based on rating
  const filteredReviews =
    activeFilter === "all"
      ? reviews
      : reviews.filter(review => review.rating === parseInt(activeFilter));

  const formatDate = dateString => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {t("seller.reviews.loading")}
        </h2>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
        </div>
      </div>;
  }

  if (error) {
    return <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {t("seller.reviews.error_title")}
        </h2>
        <div className="text-center text-red-500 py-8">
          {error}
        </div>
      </div>;
  }

  return <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {t("seller.reviews.title")}
      </h2>

      {/* Review Summary */}
      <div className="bg-gray-50 rounded-lg p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="text-5xl font-bold text-gray-900 mr-4">
              {averageRating.toFixed(1)}
            </div>
            <div>
              <div className="flex">
                {[1, 2, 3, 4, 5].map(star =>
                  <StarIcon
                    key={star}
                    className={`h-6 w-6 ${star <= Math.round(averageRating)
                      ? "text-yellow-400"
                      : "text-gray-300"}`}
                    fill={
                      star <= Math.round(averageRating)
                        ? "currentColor"
                        : "none"
                    }
                  />
                )}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {t("seller.reviews.based_on", { count: reviews.length })}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 md:flex md:space-x-6">
            {ratingCounts.map(({ rating, count, percent }) =>
              <div key={rating} className="flex items-center">
                <div className="w-24 bg-gray-200 rounded-full h-2.5 mr-3">
                  <div
                    className="bg-yellow-400 h-2.5 rounded-full"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-900 mr-1">
                    {rating}
                  </span>
                  <StarIcon className="h-4 w-4 text-yellow-400" />
                </div>
                <span className="text-sm text-gray-500 ml-1">
                  ({count})
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Review Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button onClick={() => setActiveFilter("all")} className={`px-4 py-2 rounded-full text-sm font-medium ${activeFilter === "all" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
          {t("seller.reviews.all_reviews")} ({reviews.length})
        </button>
        {ratingCounts.map(({ rating, count }) =>
          <button
            key={rating}
            onClick={() => setActiveFilter(rating.toString())}
            className={`px-4 py-2 rounded-full text-sm font-medium ${activeFilter ===
            rating.toString()
              ? rating === 5
                ? "bg-green-100 text-green-800"
                : rating === 4
                  ? "bg-green-100 text-green-800"
                  : rating === 3
                    ? "bg-yellow-100 text-yellow-800"
                    : rating === 2
                      ? "bg-orange-100 text-orange-800"
                      : "bg-red-100 text-red-800"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
          >
            {rating} {t("seller.reviews.star")} ({count})
          </button>
        )}
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {filteredReviews.length === 0 ? <div className="text-center py-8 text-gray-500">
              {t("seller.no_reviews_found")}
            </div> : filteredReviews.map(review =>
              <div
                key={review.id}
                className="border border-gray-200 rounded-lg p-6"
              >
                <div className="flex justify-between">
                  <div className="flex items-center">
                    <div className="bg-gray-200 border-2 border-dashed rounded-full w-10 h-10" />
                    <div className="ml-4">
                      <h4 className="font-medium text-gray-900">
                        {review.user.name}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {formatDate(review.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="flex mr-4">
                      {[1, 2, 3, 4, 5].map(star =>
                        <StarIcon
                          key={star}
                          className={`h-5 w-5 ${star <= review.rating
                            ? "text-yellow-400"
                            : "text-gray-300"}`}
                          fill={
                            star <= review.rating ? "currentColor" : "none"
                          }
                        />
                      )}
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                      <EllipsisVerticalIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-gray-700">
                    {review.comment}
                  </p>
                  <div className="mt-3 flex items-center text-sm text-gray-500">
                    <span className="mr-2">
                      {t("seller.reviews.for_product")}:
                    </span>
                    <span className="font-medium text-gray-900">
                      {review.product.name}
                    </span>
                  </div>
                </div>

                {review.reply
                  ? <div className="mt-4 bg-blue-50 rounded-lg p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <ChatBubbleLeftIcon className="h-5 w-5 text-blue-500" />
                        </div>
                        <div className="ml-3">
                          <h4 className="text-sm font-medium text-blue-800">
                            {t("seller.reviews.your_response")}
                          </h4>
                          <p className="mt-1 text-sm text-blue-700">
                            {review.reply}
                          </p>
                          <div className="mt-2 text-sm">
                            <button className="font-medium text-blue-600 hover:text-blue-500">
                              {t("seller.reviews.edit_response")}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  : <div className="mt-4">
                      <button className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800">
                        <ArrowUturnLeftIcon className="h-4 w-4 mr-1" />
                        {t("seller.reply_to_review")}
                      </button>
                    </div>}
              </div>
            )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && <div className="mt-8 flex items-center justify-between">
          <button onClick={() => setCurrentPage(prev =>
                Math.max(prev - 1, 1)
              )} disabled={currentPage === 1} className={`inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${currentPage === 1 ? "text-gray-400 bg-gray-100 cursor-not-allowed" : "text-gray-700 bg-white hover:bg-gray-50"}`}>
            {t("seller.previous")}
          </button>
          <div className="text-sm text-gray-700">
            {t("seller.page")} <span className="font-medium">
              {currentPage}
            </span> {t("seller.of")} <span className="font-medium">
              {totalPages}
            </span>
          </div>
          <button onClick={() => setCurrentPage(prev =>
                Math.min(prev + 1, totalPages)
              )} disabled={currentPage === totalPages} className={`inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${currentPage === totalPages ? "text-gray-400 bg-gray-100 cursor-not-allowed" : "text-gray-700 bg-white hover:bg-gray-50"}`}>
            {t("seller.next")}
          </button>
        </div>}
    </div>;
};

export default Reviews;
