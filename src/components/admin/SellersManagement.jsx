// components/admin/SellersManagement.js
import React, { useState, useEffect } from "react";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowsUpDownIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import api from "../../utils/api";
import DataTable from "../ui/DataTable";

const SellersManagement = () => {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [sortField, setSortField] = useState("created_at");
  const [sortDirection, setSortDirection] = useState("desc");
  const [selectedSellers, setSelectedSellers] = useState([]);

  // Fetch sellers from API
  const fetchSellers = async (page = currentPage, search = searchTerm, status = statusFilter) => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        per_page: 15,
        search: search || undefined,
        ...(status !== "all" && { status }),
      };
      const response = await api.get("/admin/sellers", { params });
      if (response.data.success) {
        const data = response.data.data;
        setSellers(data.data || []);
        setPagination({
          current_page: data.current_page,
          per_page: data.per_page,
          total: data.total,
          last_page: data.last_page,
          from: data.from,
          to: data.to,
        });
      } else {
        setSellers(response.data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch sellers:", err);
      setError(err.response?.data?.message || "Failed to load sellers");
      setSellers([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchSellers(1, searchTerm, statusFilter);
  }, []);

  // Re-fetch when filters change
  useEffect(() => {
    fetchSellers(currentPage, searchTerm, statusFilter);
  }, [searchTerm, statusFilter, currentPage]);

  // Handle status update (approve/reject/suspend, etc.)
  const handleStatusUpdate = async (sellerId, newStatus, reason = "") => {
    try {
      const response = await api.put(`/admin/seller/${sellerId}/status`, {
        status: newStatus,
        reason,
      });
      if (response.data.success) {
        alert(`Seller status updated to ${newStatus} successfully`);
        // Update local state
        setSellers(prev =>
          prev.map(seller =>
            seller.id === sellerId ? { ...seller, status: newStatus } : seller
          )
        );
      }
    } catch (error) {
      console.error("Error updating seller status:", error);
      const message = error.response?.data?.message || error.message || "Failed to update seller status";
      alert(message);
    }
  };

  // Toggle selection for bulk actions
  const toggleSelection = (sellerId) => {
    setSelectedSellers(prev =>
      prev.includes(sellerId) ? prev.filter(id => id !== sellerId) : [...prev, sellerId]
    );
  };

  const toggleAllSelection = () => {
    if (selectedSellers.length === sellers.length) {
      setSelectedSellers([]);
    } else {
      setSelectedSellers(sellers.map(s => s.id));
    }
  };

  // Handle column sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Client‑side sorting (could be moved to server)
  const sortedSellers = [...sellers].sort((a, b) => {
    let aVal = a[sortField] || "";
    let bVal = b[sortField] || "";
    if (sortField === "rating") {
      aVal = a.reviews_avg_rating || 0;
      bVal = b.reviews_avg_rating || 0;
    }
    if (sortField === "products_count") {
      aVal = a.products_count || 0;
      bVal = b.products_count || 0;
    }
    if (typeof aVal === "string") aVal = aVal.toLowerCase();
    if (typeof bVal === "string") bVal = bVal.toLowerCase();
    return sortDirection === "asc" ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
  });

  // Helper: format date
  const formatDate = (dateStr) => (dateStr ? new Date(dateStr).toLocaleDateString() : "N/A");

  // Helper: status badge styling
  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
      case "active":
        return { bg: "bg-green-100", text: "text-green-800", icon: CheckCircleIcon, label: "Approved" };
      case "pending":
        return { bg: "bg-yellow-100", text: "text-yellow-800", icon: ClockIcon, label: "Pending" };
      case "rejected":
      case "suspended":
        return { bg: "bg-red-100", text: "text-red-800", icon: XCircleIcon, label: "Rejected" };
      case "closed":
        return { bg: "bg-gray-100", text: "text-gray-800", icon: null, label: "Closed" };
      default:
        return { bg: "bg-gray-100", text: "text-gray-800", icon: null, label: status || "Unknown" };
    }
  };

  // DataTable columns definition
  const columns = [
    {
      header: (
        <input
          type="checkbox"
          checked={selectedSellers.length === sellers.length && sellers.length > 0}
          onChange={toggleAllSelection}
          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
        />
      ),
      accessor: "selection",
      width: "50px",
    },
    { header: "Store ID", accessor: "store_id" },
    { header: "Store Name", accessor: "store_name" },
    { header: "Email", accessor: "contact_email" },
    { header: "Phone", accessor: "contact_phone" },
    { header: "Business Type", accessor: "business_type" },
    {
      header: (
        <button onClick={() => handleSort("status")} className="flex items-center">
          Status
          {sortField === "status" && <ArrowsUpDownIcon className="h-4 w-4 ml-1" />}
        </button>
      ),
      accessor: "status",
    },
    {
      header: (
        <button onClick={() => handleSort("rating")} className="flex items-center">
          Rating
          {sortField === "rating" && <ArrowsUpDownIcon className="h-4 w-4 ml-1" />}
        </button>
      ),
      accessor: "rating",
    },
    {
      header: (
        <button onClick={() => handleSort("products_count")} className="flex items-center">
          Products
          {sortField === "products_count" && <ArrowsUpDownIcon className="h-4 w-4 ml-1" />}
        </button>
      ),
      accessor: "products_count",
    },
    {
      header: (
        <button onClick={() => handleSort("created_at")} className="flex items-center">
          Created
          {sortField === "created_at" && <ArrowsUpDownIcon className="h-4 w-4 ml-1" />}
        </button>
      ),
      accessor: "created_at",
    },
    { header: "Actions", accessor: "actions", width: "200px" },
  ];

  // Map seller data to table rows
  const sellerData = sortedSellers.map((seller) => {
    const badge = getStatusBadge(seller.status);
    const StatusIcon = badge.icon;
    return {
      ...seller,
      selection: (
        <input
          type="checkbox"
          checked={selectedSellers.includes(seller.id)}
          onChange={() => toggleSelection(seller.id)}
          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
        />
      ),
      store_id: seller.store_id || "N/A",
      store_name: seller.store_name || "N/A",
      contact_email: seller.contact_email || "N/A",
      contact_phone: seller.contact_phone || "N/A",
      business_type: seller.business_type || "N/A",
      status: (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
          {StatusIcon && <StatusIcon className="h-3 w-3 mr-1" />}
          {badge.label}
        </span>
      ),
      rating: seller.reviews_avg_rating ? seller.reviews_avg_rating.toFixed(1) : "0.0",
      products_count: seller.products_count || 0,
      created_at: formatDate(seller.created_at),
      actions: (
        <div className="flex space-x-2 items-center">
          <button
            className="p-1 text-gray-600 hover:text-gray-900"
            title="View Store"
            onClick={() => window.open(`/sellers/${seller.id}`, "_blank")}
          >
            <EyeIcon className="h-4 w-4" />
          </button>
          <select
            value={seller.status}
            onChange={(e) => handleStatusUpdate(seller.id, e.target.value)}
            className="text-xs border border-gray-300 rounded px-2 py-1 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-green-500"
          >
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="active">Active</option>
            <option value="rejected">Rejected</option>
            <option value="suspended">Suspended</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      ),
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Seller Management</h1>
          <p className="mt-1 text-sm text-gray-600">Manage all sellers in your marketplace</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search Sellers</label>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Store name, email..."
                className="block w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 sm:text-sm"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 sm:text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="active">Active</option>
              <option value="rejected">Rejected</option>
              <option value="suspended">Suspended</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          {/* Reset Filters */}
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setCurrentPage(1);
              }}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <FunnelIcon className="h-4 w-4 mr-2" />
              Reset Filters
            </button>
          </div>
        </div>

        {/* Stats */}
        {pagination && (
          <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500">
            <span>Total: {pagination.total}</span>
            <span>•</span>
            <span>Showing {pagination.from}–{pagination.to}</span>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-lg shadow p-8 flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mb-4"></div>
          <p className="text-gray-600">Loading sellers...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading sellers</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => fetchSellers(currentPage, searchTerm, statusFilter)}
                  className="text-sm font-medium text-red-600 hover:text-red-500"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {sortedSellers.length > 0 ? (
            <DataTable columns={columns} data={sellerData} striped hoverable />
          ) : (
            <div className="p-12 text-center">
              <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || statusFilter !== "all"
                  ? "No sellers found matching your criteria"
                  : "No sellers yet"}
              </h3>
              <p className="text-gray-500">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Sellers will appear here once they register."}
              </p>
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.last_page > 1 && (
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Page {pagination.current_page} of {pagination.last_page}
              </div>
              <div className="flex space-x-2">
                <button
                  disabled={pagination.current_page === 1}
                  onClick={() => setCurrentPage(pagination.current_page - 1)}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  disabled={pagination.current_page === pagination.last_page}
                  onClick={() => setCurrentPage(pagination.current_page + 1)}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SellersManagement;