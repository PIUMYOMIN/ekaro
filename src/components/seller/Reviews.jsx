// src/components/seller/Reviews.jsx
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  StarIcon,
  ChatBubbleLeftIcon,
  ArrowUturnLeftIcon,
  EllipsisVerticalIcon
} from "@heroicons/react/24/outline";

const Reviews = () => {
  const { t } = useTranslation();
  const [activeFilter, setActiveFilter] = useState("all");

  // Sample review data
  const reviews = [
    {
      id: 1,
      user: "Ko Min Aung",
      avatar: "",
      rating: 5,
      date: "2023-06-15",
      comment:
        "Fast delivery and the diamonds were credited immediately. Will buy again!",
      product: "Mobile Legends Diamonds",
      reply: "Thank you for your feedback! We appreciate your business.",
      replied: true
    },
    {
      id: 2,
      user: "Ma Hla Hla",
      avatar: "",
      rating: 4,
      date: "2023-06-12",
      comment:
        "Good service but took a bit longer than expected. Product was as described.",
      product: "PUBG Mobile UC",
      reply: "",
      replied: false
    },
    {
      id: 3,
      user: "U Ba Shwe",
      avatar: "",
      rating: 3,
      date: "2023-06-08",
      comment:
        "The UC was delivered but the amount was less than what I ordered. Had to contact support to fix it.",
      product: "PUBG Mobile UC",
      reply:
        "We apologize for the inconvenience. We have credited the remaining UC to your account.",
      replied: true
    },
    {
      id: 4,
      user: "Daw Mya Mya",
      avatar: "",
      rating: 5,
      date: "2023-06-05",
      comment:
        "Perfect transaction! Got my diamonds within 5 minutes. Highly recommended.",
      product: "Free Fire Diamonds",
      reply: "Thank you for choosing us!",
      replied: true
    },
    {
      id: 5,
      user: "Ko Zaw Zaw",
      avatar: "",
      rating: 2,
      date: "2023-06-01",
      comment:
        "Did not receive the product after payment. Had to wait for 3 hours and contact support multiple times.",
      product: "Valorant Points",
      reply:
        "We sincerely apologize for the delay. There was a technical issue that has been resolved.",
      replied: true
    }
  ];

  // Filter reviews based on rating
  const filteredReviews =
    activeFilter === "all"
      ? reviews
      : reviews.filter(
          review =>
            activeFilter === "5"
              ? review.rating === 5
              : activeFilter === "4"
                ? review.rating === 4
                : activeFilter === "3"
                  ? review.rating === 3
                  : activeFilter === "2"
                    ? review.rating === 2
                    : review.rating === 1
        );

  // Calculate average rating
  const averageRating =
    reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  const ratingCounts = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length,
    percent:
      reviews.filter(r => r.rating === rating).length / reviews.length * 100
  }));

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {t("seller.reviews")}
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
                {t("seller.based_on", { count: reviews.length })}
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
        <button
          onClick={() => setActiveFilter("all")}
          className={`px-4 py-2 rounded-full text-sm font-medium ${activeFilter ===
          "all"
            ? "bg-blue-100 text-blue-800"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
        >
          {t("seller.all_reviews")} ({reviews.length})
        </button>
        <button
          onClick={() => setActiveFilter("5")}
          className={`px-4 py-2 rounded-full text-sm font-medium ${activeFilter ===
          "5"
            ? "bg-green-100 text-green-800"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
        >
          5 {t("seller.star")} ({ratingCounts[0].count})
        </button>
        <button
          onClick={() => setActiveFilter("4")}
          className={`px-4 py-2 rounded-full text-sm font-medium ${activeFilter ===
          "4"
            ? "bg-green-100 text-green-800"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
        >
          4 {t("seller.star")} ({ratingCounts[1].count})
        </button>
        <button
          onClick={() => setActiveFilter("3")}
          className={`px-4 py-2 rounded-full text-sm font-medium ${activeFilter ===
          "3"
            ? "bg-yellow-100 text-yellow-800"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
        >
          3 {t("seller.star")} ({ratingCounts[2].count})
        </button>
        <button
          onClick={() => setActiveFilter("2")}
          className={`px-4 py-2 rounded-full text-sm font-medium ${activeFilter ===
          "2"
            ? "bg-orange-100 text-orange-800"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
        >
          2 {t("seller.star")} ({ratingCounts[3].count})
        </button>
        <button
          onClick={() => setActiveFilter("1")}
          className={`px-4 py-2 rounded-full text-sm font-medium ${activeFilter ===
          "1"
            ? "bg-red-100 text-red-800"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
        >
          1 {t("seller.star")} ({ratingCounts[4].count})
        </button>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {filteredReviews.map(review =>
          <div
            key={review.id}
            className="border border-gray-200 rounded-lg p-6"
          >
            <div className="flex justify-between">
              <div className="flex items-center">
                <div className="bg-gray-200 border-2 border-dashed rounded-full w-10 h-10" />
                <div className="ml-4">
                  <h4 className="font-medium text-gray-900">
                    {review.user}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {review.date}
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
                      fill={star <= review.rating ? "currentColor" : "none"}
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
                  {t("seller.for_product")}:
                </span>
                <span className="font-medium text-gray-900">
                  {review.product}
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
                        {t("seller.your_response")}
                      </h4>
                      <p className="mt-1 text-sm text-blue-700">
                        {review.reply}
                      </p>
                      <div className="mt-2 text-sm">
                        <button className="font-medium text-blue-600 hover:text-blue-500">
                          {t("seller.edit_response")}
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
      <div className="mt-8 flex items-center justify-between">
        <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
          {t("seller.previous")}
        </button>
        <div className="text-sm text-gray-700">
          {t("seller.page")} <span className="font-medium">1</span>{" "}
          {t("seller.of")} <span className="font-medium">3</span>
        </div>
        <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
          {t("seller.next")}
        </button>
      </div>
    </div>
  );
};

export default Reviews;
