// components/admin/ReviewManagement.js
import React, { useState, useEffect } from "react";
import { CheckIcon, XMarkIcon, MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import DataTable from "../ui/DataTable";
import api from "../../utils/api";

const ReviewManagement = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      // ✅ Correct endpoint for seller reviews
      const response = await api.get("/admin/seller-reviews");
      const reviewsData = response.data.data?.data || response.data.data || [];
      setReviews(Array.isArray(reviewsData) ? reviewsData : []);
    } catch (err) {
      console.error("Failed to fetch seller reviews:", err);
      setError(err.response?.data?.message || "Failed to load seller reviews");
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleReviewStatus = async (reviewId, status) => {
    try {
      let endpoint = "";
      let method = "POST";

      if (status === "approved") {
        endpoint = `/admin/seller-reviews/${reviewId}/approve`;
      } else if (status === "rejected") {
        endpoint = `/admin/seller-reviews/${reviewId}/reject`;
      } else {
        endpoint = `/admin/seller-reviews/${reviewId}/status`;
        method = "PUT";
      }

      const response = await api({
        method,
        url: endpoint,
        data: status !== "approved" && status !== "rejected" ? { status } : {}
      });

      if (response.data.success) {
        setReviews(reviews.map((review) =>
          review.id === reviewId ? { ...review, status } : review
        ));
        alert(`Review ${status} successfully`);
      }
    } catch (error) {
      console.error("Failed to update review status:", error);
      alert(error.response?.data?.message || "Failed to update review status");
    }
  };

  const columns = [
    { header: "ID", accessor: "id" },
    { header: "User", accessor: "user_name" },
    { header: "Seller", accessor: "seller_name" }, // Changed from Product
    { header: "Rating", accessor: "rating", isStars: true },
    { header: "Comment", accessor: "comment" },
    { header: "Status", accessor: "status", isStatus: true },
    { header: "Date", accessor: "date" },
    { header: "Actions", accessor: "actions" }
  ];

  const reviewData = reviews.map((review) => ({
    ...review,
    user_name: review.user?.name || "Unknown User",
    seller_name: review.seller?.store_name || "Unknown Seller", // ✅ Use store_name
    status: review.status || "pending",
    date: new Date(review.created_at).toLocaleDateString(),
    actions: (
      <div className="flex space-x-2">
        {review.status === "pending" && (
          <>
            <button
              className="text-green-600 hover:text-green-900 flex items-center"
              onClick={() => handleReviewStatus(review.id, "approved")}
              title="Approve Review"
            >
              <CheckIcon className="h-4 w-4 mr-1" />
              Approve
            </button>
            <button
              className="text-red-600 hover:text-red-900 flex items-center"
              onClick={() => handleReviewStatus(review.id, "rejected")}
              title="Reject Review"
            >
              <XMarkIcon className="h-4 w-4 mr-1" />
              Reject
            </button>
          </>
        )}
        {review.status === "approved" && (
          <button
            className="text-red-600 hover:text-red-900 flex items-center"
            onClick={() => handleReviewStatus(review.id, "rejected")}
            title="Reject Review"
          >
            <XMarkIcon className="h-4 w-4 mr-1" />
            Reject
          </button>
        )}
        {review.status === "rejected" && (
          <button
            className="text-green-600 hover:text-green-900 flex items-center"
            onClick={() => handleReviewStatus(review.id, "approved")}
            title="Approve Review"
          >
            <CheckIcon className="h-4 w-4 mr-1" />
            Approve
          </button>
        )}
      </div>
    )
  }));

  // Filter by search term
  const filteredReviews = reviewData.filter(review =>
    review.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.seller_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.comment?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Seller Review Management</h3>
          <p className="mt-1 text-sm text-gray-500">Manage reviews left by buyers for sellers</p>
        </div>
        <div className="relative max-w-xs">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search reviews..."
            className="block w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading && (
        <div className="p-8 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
        </div>
      )}

      {error && (
        <div className="p-4 text-red-500">
          Error loading seller reviews: {error}
        </div>
      )}

      {!loading && !error && (
        <DataTable
          columns={columns}
          data={filteredReviews}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
      )}
    </div>
  );
};

export default ReviewManagement;