import React, { useState } from "react";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/solid";
import DataTable from "../ui/DataTable";
const ReviewManagement = ({ reviews, loading, error, handleReviewStatus }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const columns = [
    { header: "ID", accessor: "id" },
    { header: "User", accessor: "user_name" },
    { header: "Product", accessor: "product_name" },
    { header: "Rating", accessor: "rating", isStars: true },
    { header: "Comment", accessor: "comment" },
    { header: "Status", accessor: "status", isStatus: true },
    { header: "Date", accessor: "date" },
    { header: "Actions", accessor: "actions" }
  ];

  const reviewData = reviews.map((review) => ({
    ...review,
    user_name: review.user?.name || "Unknown User",
    product_name: review.product?.name || "Unknown Product",
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

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            Review Management
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Manage product reviews and ratings
          </p>
        </div>
      </div>

      {loading && <div className="p-8 flex justify-center">Loading...</div>}
      {error && <div className="p-4 text-red-500">Error loading reviews</div>}

      {!loading && !error && (
        <DataTable
          columns={columns}
          data={reviewData}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
      )}
    </div>
  );
};

export default ReviewManagement;