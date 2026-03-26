// components/admin/SellerVerificationManagement.jsx
import React, { useState, useEffect } from "react";
import {
  MagnifyingGlassIcon,
  ShieldCheckIcon,
  EyeIcon,
  DocumentIcon,
  UserCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  CheckIcon,
  XMarkIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import {
  BuildingStorefrontIcon,
  MapPinIcon,
  EnvelopeIcon,
  PhoneIcon,
} from "@heroicons/react/24/solid";
import DataTable from "../ui/DataTable";
import api from "../../utils/api";

// Safe document URL helper — never crashes on null values
const docUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `/storage/${path}`;
};

const SellerVerificationManagement = () => {
  const [pendingSellers, setPendingSellers] = useState([]);
  const [loading, setLoading]              = useState(false);
  const [actionLoading, setActionLoading]  = useState(false);
  const [error, setError]                  = useState(null);
  const [actionError, setActionError]      = useState(null);
  const [actionSuccess, setActionSuccess]  = useState(null);
  const [searchTerm, setSearchTerm]        = useState("");
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [verificationData, setVerificationData] = useState({
    verification_level: "verified",
    badge_type: "verified",
    notes: "",
  });
  const [rejectReason, setRejectReason]    = useState("");

  // ── Confirm modal state — replaces window.confirm ─────────────────────
  // type: 'approve' | 'reject' | null
  const [confirmModal, setConfirmModal]    = useState(null);

  const fetchPendingSellers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/admin/seller/verification-review");
      // Handle both paginated { data: { data: [] } } and flat { data: [] }
      const data = response.data.data?.data ?? response.data.data ?? [];
      setPendingSellers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load verification queue");
      console.error("Error fetching sellers for verification:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingSellers();
    const interval = setInterval(() => {
      if (!selectedSeller) fetchPendingSellers();
    }, 30_000);
    return () => clearInterval(interval);
  }, [selectedSeller]);

  // ── Approve ────────────────────────────────────────────────────────────
  const handleApprove = async () => {
    if (!selectedSeller) return;
    setActionLoading(true);
    setActionError(null);
    try {
      await api.post(`/admin/seller/${selectedSeller.id}/verify`, {
        verification_level: verificationData.verification_level,
        badge_type:         verificationData.badge_type,
        notes:              verificationData.notes ||
          `Seller approved by admin on ${new Date().toLocaleDateString()}`,
      });
      setConfirmModal(null);
      setSelectedSeller(null);
      setVerificationData({ verification_level: "verified", badge_type: "verified", notes: "" });
      setActionSuccess(`${selectedSeller.store_name} has been verified successfully.`);
      await fetchPendingSellers();
    } catch (err) {
      setActionError(
        err.response?.data?.message ||
        (err.response?.data?.missing_fields
          ? "Profile incomplete: " + Object.values(err.response.data.missing_fields).join(", ")
          : err.message || "Failed to approve seller")
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ── Reject ─────────────────────────────────────────────────────────────
  const handleReject = async () => {
    if (!selectedSeller) return;
    if (!rejectReason.trim()) {
      setActionError("Please provide a reason for rejection before submitting.");
      return;
    }
    setActionLoading(true);
    setActionError(null);
    try {
      await api.post(`/admin/seller/${selectedSeller.id}/reject`, {
        reason: rejectReason,
      });
      setConfirmModal(null);
      setSelectedSeller(null);
      setRejectReason("");
      setActionSuccess(`${selectedSeller.store_name} has been rejected.`);
      await fetchPendingSellers();
    } catch (err) {
      setActionError(err.response?.data?.message || err.message || "Failed to reject seller");
    } finally {
      setActionLoading(false);
    }
  };

  const openConfirm = (type) => {
    if (type === "reject" && !rejectReason.trim()) {
      setActionError("Please enter a rejection reason before proceeding.");
      return;
    }
    setActionError(null);
    setConfirmModal(type);
  };

  const getStatusBadgeColor = (status) => {
    const map = {
      pending:      "bg-yellow-100 text-yellow-800 border-yellow-300",
      under_review: "bg-blue-100 text-blue-800 border-blue-300",
      verified:     "bg-green-100 text-green-800 border-green-300",
      rejected:     "bg-red-100 text-red-800 border-red-300",
    };
    return map[status] ?? "bg-gray-100 text-gray-800 border-gray-300";
  };

  const getDocumentStatus = (seller) => {
    const docs = [];
    if (seller.identity_document_front)         docs.push("ID Front ✓");
    if (seller.identity_document_back)          docs.push("ID Back ✓");
    if (seller.business_registration_document)  docs.push("Business Reg ✓");
    if (seller.tax_registration_document)       docs.push("Tax Reg ✓");
    return docs.length > 0 ? docs.join(", ") : "No documents";
  };

  const columns = [
    {
      header: "Store Info",
      accessor: "store",
      cell: (row) => (
        <div className="flex items-center">
          {row.store_logo ? (
            <img
              src={docUrl(row.store_logo)}
              alt={row.store_name}
              className="h-10 w-10 rounded-lg object-cover mr-3"
              onError={(e) => { e.target.style.display = "none"; }}
            />
          ) : (
            <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center mr-3 flex-shrink-0">
              <BuildingStorefrontIcon className="h-6 w-6 text-gray-400" />
            </div>
          )}
          <div>
            <div className="font-medium text-gray-900">{row.store_name}</div>
            <div className="text-xs text-gray-500">ID: {row.store_id || "N/A"}</div>
          </div>
        </div>
      ),
    },
    {
      header: "Business Details",
      accessor: "business",
      cell: (row) => (
        <div className="space-y-1 text-sm">
          <div className="flex items-center gap-1">
            <UserCircleIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <span>{row.user?.name || "Unknown"}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-600">
            <EnvelopeIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <span className="truncate max-w-[180px]">{row.contact_email}</span>
          </div>
          <div className="flex items-center gap-1">
            <BuildingStorefrontIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <span>{row.business_type || "Not specified"}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Documents",
      accessor: "documents",
      cell: (row) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-sm">
            <DocumentIcon className="h-4 w-4 text-gray-400" />
            <span>{getDocumentStatus(row)}</span>
          </div>
          {row.document_status && (
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border ${getStatusBadgeColor(row.document_status)}`}>
              {row.document_status}
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Submitted",
      accessor: "submitted",
      cell: (row) => (
        <div className="text-sm">
          <div className="flex items-center gap-1">
            <ClockIcon className="h-4 w-4 text-gray-400" />
            <span>{new Date(row.documents_submitted_at || row.created_at).toLocaleDateString()}</span>
          </div>
          <div className="text-xs text-gray-500 mt-0.5">
            {row.documents_submitted ? "Documents submitted" : "No submission"}
          </div>
        </div>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      cell: (row) => (
        <div className="space-y-1">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeColor(row.verification_status)}`}>
            {row.verification_status}
          </span>
          <div className="text-xs text-gray-500">Profile: {row.status}</div>
        </div>
      ),
    },
    {
      header: "Actions",
      accessor: "actions",
      cell: (row) => (
        <div className="flex gap-2 flex-wrap">
          <a
            href={`/sellers/${row.store_slug || row.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-900 text-sm flex items-center gap-1"
          >
            <EyeIcon className="h-4 w-4" /> View
          </a>
          <button
            onClick={() => setSelectedSeller(row)}
            className="text-green-600 hover:text-green-900 text-sm flex items-center gap-1"
          >
            <ShieldCheckIcon className="h-4 w-4" /> Review
          </button>
        </div>
      ),
    },
  ];

  const filteredSellers = pendingSellers.filter(
    (s) =>
      s.store_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.contact_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    pending:     pendingSellers.filter((s) => s.verification_status === "pending").length,
    underReview: pendingSellers.filter((s) => s.verification_status === "under_review").length,
    verified:    pendingSellers.filter((s) => s.verification_status === "verified").length,
    rejected:    pendingSellers.filter((s) => s.verification_status === "rejected").length,
  };

  return (
    <div className="space-y-6">

      {/* ── Confirm modal — replaces window.confirm ── */}
      {confirmModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4">
            {confirmModal === "approve" ? (
              <>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Verification</h3>
                <p className="text-sm text-gray-600 mb-1">
                  Verify <strong>{selectedSeller?.store_name}</strong> as{" "}
                  <strong>{verificationData.verification_level}</strong>?
                </p>
                <p className="text-xs text-gray-500 mb-4">
                  The seller will receive a verified badge and their store will become active.
                </p>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Rejection</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Reject verification for <strong>{selectedSeller?.store_name}</strong>?
                  The seller will be notified with your reason.
                </p>
              </>
            )}

            {actionError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {actionError}
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => { setConfirmModal(null); setActionError(null); }}
                disabled={actionLoading}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmModal === "approve" ? handleApprove : handleReject}
                disabled={actionLoading}
                className={`px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50 ${
                  confirmModal === "approve"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {actionLoading
                  ? "Processing..."
                  : confirmModal === "approve"
                  ? "Verify Seller"
                  : "Reject Verification"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Global success / error banners ── */}
      {actionSuccess && (
        <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-800">
          <CheckCircleIcon className="h-5 w-5 flex-shrink-0" />
          {actionSuccess}
          <button onClick={() => setActionSuccess(null)} className="ml-auto">
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Pending Review",  value: stats.pending,     color: "text-yellow-600" },
          { label: "Under Review",    value: stats.underReview, color: "text-blue-600"   },
          { label: "Verified",        value: stats.verified,    color: "text-green-600"  },
          { label: "Rejected",        value: stats.rejected,    color: "text-red-600"    },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-lg shadow p-4">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-sm text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex flex-wrap gap-3 items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Seller Verification Queue</h3>
            <p className="mt-0.5 text-sm text-gray-500">Review and verify seller documents</p>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search sellers..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 text-sm w-56"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={fetchPendingSellers}
              className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm gap-1.5"
            >
              <ArrowPathIcon className="h-4 w-4" /> Refresh
            </button>
          </div>
        </div>

        {loading && (
          <div className="p-8 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500" />
          </div>
        )}

        {error && !loading && (
          <div className="p-4 m-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-2">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-800">Error loading data</p>
                <p className="text-sm text-red-600 mt-0.5">{error}</p>
                <button onClick={fetchPendingSellers} className="mt-2 text-sm text-red-700 underline">
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && (
          <DataTable columns={columns} data={filteredSellers} striped hoverable />
        )}

        {!loading && !error && filteredSellers.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <ShieldCheckIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="font-medium">No sellers in verification queue</p>
            <p className="text-sm mt-1">Sellers who submit documents will appear here</p>
          </div>
        )}
      </div>

      {/* ── Review Modal ── */}
      {selectedSeller && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto z-50">
          <div className="relative top-10 mx-auto p-5 w-full max-w-4xl">
            <div className="bg-white rounded-xl shadow-xl overflow-hidden">

              {/* Modal header */}
              <div className="flex justify-between items-start px-6 py-4 border-b border-gray-200">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Review: {selectedSeller.store_name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-0.5">Store ID: {selectedSeller.store_id}</p>
                </div>
                <button
                  onClick={() => { setSelectedSeller(null); setActionError(null); }}
                  className="text-gray-400 hover:text-gray-600 mt-0.5"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="px-6 py-4">
                {/* Inline error */}
                {actionError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex gap-2">
                    <ExclamationTriangleIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    {actionError}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Seller Info */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Seller Information</h4>
                    <div className="space-y-3 text-sm">
                      {[
                        [UserCircleIcon,       selectedSeller.user?.name || "Unknown",           "Owner"],
                        [EnvelopeIcon,         selectedSeller.contact_email,                     "Contact Email"],
                        [PhoneIcon,            selectedSeller.contact_phone,                     "Contact Phone"],
                        [BuildingStorefrontIcon, selectedSeller.business_type || "Not specified","Business Type"],
                        [MapPinIcon,           `${selectedSeller.address || "—"}, ${selectedSeller.city || "—"}`, `${selectedSeller.state || ""} ${selectedSeller.country || "Myanmar"}`],
                      ].map(([Icon, value, label], i) => (
                        <div key={i} className="flex items-start gap-2">
                          <Icon className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="text-gray-900">{value}</div>
                            <div className="text-xs text-gray-500">{label}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Verification form */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Verification Settings</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Verification Level
                        </label>
                        <select
                          value={verificationData.verification_level}
                          onChange={(e) => setVerificationData({ ...verificationData, verification_level: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500"
                        >
                          <option value="basic">Basic</option>
                          <option value="verified">Verified</option>
                          <option value="premium">Premium</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Badge Type
                        </label>
                        <select
                          value={verificationData.badge_type}
                          onChange={(e) => setVerificationData({ ...verificationData, badge_type: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500"
                        >
                          <option value="verified">Verified</option>
                          <option value="premium">Premium</option>
                          <option value="featured">Featured</option>
                          <option value="top_rated">Top Rated</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Approval Notes
                        </label>
                        <textarea
                          value={verificationData.notes}
                          onChange={(e) => setVerificationData({ ...verificationData, notes: e.target.value })}
                          rows={2}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500"
                          placeholder="Optional notes..."
                        />
                      </div>

                      <div className="pt-3 border-t border-gray-200">
                        <label className="block text-sm font-medium text-red-600 mb-1">
                          Rejection Reason <span className="text-gray-500 font-normal">(required to reject)</span>
                        </label>
                        <textarea
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          rows={2}
                          className="w-full border border-red-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-400"
                          placeholder="Explain why this seller is rejected..."
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Documents */}
                <div className="mb-6 pt-4 border-t border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-3">Uploaded Documents</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      ["identity_document_front",        "ID Front",    "blue"],
                      ["identity_document_back",         "ID Back",     "blue"],
                      ["business_registration_document", "Business Reg","green"],
                      ["tax_registration_document",      "Tax Reg",     "green"],
                    ].map(([field, label, color]) => {
                      const url = docUrl(selectedSeller[field]);
                      return url ? (
                        <a
                          key={field}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex items-center gap-2 px-3 py-2 bg-${color}-50 text-${color}-700 rounded-lg hover:bg-${color}-100 text-sm`}
                        >
                          <DocumentIcon className="h-4 w-4 flex-shrink-0" />
                          {label}
                        </a>
                      ) : (
                        <div
                          key={field}
                          className="flex items-center gap-2 px-3 py-2 bg-gray-50 text-gray-400 rounded-lg text-sm"
                        >
                          <DocumentIcon className="h-4 w-4 flex-shrink-0" />
                          {label} — not uploaded
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Modal footer actions */}
              <div className="flex justify-between items-center px-6 py-4 bg-gray-50 border-t border-gray-200">
                <a
                  href={`/sellers/${selectedSeller.store_slug || selectedSeller.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-white text-sm"
                >
                  <EyeIcon className="h-4 w-4" /> View Store
                </a>

                <div className="flex gap-3">
                  <button
                    onClick={() => openConfirm("reject")}
                    disabled={actionLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm disabled:opacity-50"
                  >
                    <XCircleIcon className="h-4 w-4" />
                    Reject
                  </button>
                  <button
                    onClick={() => openConfirm("approve")}
                    disabled={actionLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm disabled:opacity-50"
                  >
                    <CheckCircleIcon className="h-4 w-4" />
                    Verify Seller
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerVerificationManagement;