import React, { useState, useEffect, useCallback } from "react";
import {
  CheckIcon, XMarkIcon, MagnifyingGlassIcon, ArrowPathIcon,
  StarIcon as StarSolid, CheckCircleIcon, XCircleIcon,
} from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/24/solid";
import api from "../../utils/api";

const Stars = ({ rating }) => (
  <div className="flex">
    {[1,2,3,4,5].map(i => (
      <StarIcon key={i} className={`h-3.5 w-3.5 ${i <= rating ? "text-amber-400" : "text-gray-200"}`} />
    ))}
  </div>
);

const StatusBadge = ({ status }) => {
  const map = {
    pending:  "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
  };
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold capitalize
                      ${map[status] || "bg-gray-100 text-gray-600"}`}>
      {status || "pending"}
    </span>
  );
};

const ReviewTable = ({ reviews, onAction, actionLoading }) => {
  if (reviews.length === 0)
    return (
      <div className="py-14 text-center text-gray-400 text-sm">
        No reviews found.
      </div>
    );

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm divide-y divide-gray-100">
        <thead className="bg-gray-50">
          <tr>
            {["Reviewer", "Target", "Rating", "Comment", "Status", "Date", "Actions"].map(h => (
              <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {reviews.map(r => (
            <tr key={r.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 font-medium text-gray-900">{r.user?.name || r.reviewer_name || "—"}</td>
              <td className="px-4 py-3 text-gray-600">
                {r.seller?.store_name || r.product?.name_en || r.product?.name || "—"}
              </td>
              <td className="px-4 py-3"><Stars rating={r.rating} /></td>
              <td className="px-4 py-3 text-gray-600 max-w-[200px]">
                <p className="truncate">{r.comment || "—"}</p>
              </td>
              <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
              <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                {new Date(r.created_at).toLocaleDateString()}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  {r.status !== "approved" && (
                    <button
                      onClick={() => onAction(r.id, "approved")}
                      disabled={actionLoading === r.id}
                      className="flex items-center gap-1 text-xs text-green-700 hover:text-green-900
                                 font-medium disabled:opacity-50"
                    >
                      <CheckIcon className="h-3.5 w-3.5" /> Approve
                    </button>
                  )}
                  {r.status !== "rejected" && (
                    <button
                      onClick={() => onAction(r.id, "rejected")}
                      disabled={actionLoading === r.id}
                      className="flex items-center gap-1 text-xs text-red-600 hover:text-red-800
                                 font-medium disabled:opacity-50"
                    >
                      <XMarkIcon className="h-3.5 w-3.5" /> Reject
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const ReviewManagement = () => {
  const [tab, setTab]               = useState("seller"); // "seller" | "product"
  const [sellerReviews, setSellerR] = useState([]);
  const [productReviews, setProductR] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [search, setSearch]         = useState("");
  const [actionLoading, setActionL] = useState(null);
  const [toast, setToast]           = useState(null);

  const flash = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [sr, pr] = await Promise.allSettled([
        api.get("/admin/seller-reviews"),
        api.get("/admin/reviews"),
      ]);
      if (sr.status === "fulfilled") {
        const d = sr.value.data.data?.data || sr.value.data.data || [];
        setSellerR(Array.isArray(d) ? d : []);
      }
      if (pr.status === "fulfilled") {
        const d = pr.value.data.data?.data || pr.value.data.data || [];
        setProductR(Array.isArray(d) ? d : []);
      }
    } catch (err) {
      setError("Failed to load reviews.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleAction = async (reviewId, status) => {
    setActionL(reviewId);
    try {
      const isSeller = tab === "seller";
      const base     = isSeller ? "/admin/seller-reviews" : "/admin/reviews";
      const action   = status === "approved" ? "approve" : "reject";
      await api.post(`${base}/${reviewId}/${action}`);
      const update = (prev) =>
        prev.map(r => r.id === reviewId ? { ...r, status } : r);
      if (isSeller) setSellerR(update);
      else           setProductR(update);
      flash(`Review ${status} successfully.`);
    } catch (err) {
      flash(err.response?.data?.message || "Failed to update review.", "error");
    } finally {
      setActionL(null);
    }
  };

  const reviews = tab === "seller" ? sellerReviews : productReviews;
  const filtered = reviews.filter(r => {
    const q = search.toLowerCase();
    return !q ||
      (r.user?.name || r.reviewer_name || "").toLowerCase().includes(q) ||
      (r.seller?.store_name || r.product?.name_en || "").toLowerCase().includes(q) ||
      (r.comment || "").toLowerCase().includes(q);
  });

  return (
    <div className="space-y-4">
      {toast && (
        <div className={`flex items-center gap-2 p-3 rounded-xl text-sm font-medium
          ${toast.type === "success"
            ? "bg-green-50 text-green-800 border border-green-200"
            : "bg-red-50 text-red-700 border border-red-200"}`}>
          {toast.type === "success"
            ? <CheckCircleIcon className="h-4 w-4" />
            : <XCircleIcon className="h-4 w-4" />}
          {toast.msg}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Review Management</h2>
          <p className="text-sm text-gray-500">{filtered.length} reviews</p>
        </div>
        <button onClick={fetchAll}
          className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowPathIcon className="h-4 w-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit">
        {[["seller", "Seller Reviews"], ["product", "Product Reviews"]].map(([key, label]) => (
          <button key={key} onClick={() => { setTab(key); setSearch(""); }}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              tab === key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}>
            {label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search reviews…"
          className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-xl
                     focus:ring-2 focus:ring-green-500 focus:border-transparent" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-green-500" />
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-600 text-sm">
            {error} <button onClick={fetchAll} className="underline ml-1">Retry</button>
          </div>
        ) : (
          <ReviewTable reviews={filtered} onAction={handleAction} actionLoading={actionLoading} />
        )}
      </div>
    </div>
  );
};

export default ReviewManagement;