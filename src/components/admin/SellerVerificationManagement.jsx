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
import { NRC_TYPES } from "../seller/NrcInput";

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
  const [nrcPanel, setNrcPanel]     = useState(null);  // { seller, status, notes }
  const [statusPanel, setStatusPanel] = useState(null);  // { seller, status, reason }
  const [nrcLoading, setNrcLoading]   = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

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

  const NRC_STATUS_CFG = {
    unverified: { label: 'Unverified',  cls: 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400' },
    pending:    { label: 'Pending',     cls: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' },
    verified:   { label: '✓ Verified',  cls: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' },
    mismatch:   { label: '⚠ Mismatch', cls: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300' },
    rejected:   { label: '✕ Rejected',  cls: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' },
  };

  const STORE_STATUS_OPTS = [
    { v: 'active',        label: '🟢 Active' },
    { v: 'approved',      label: '✅ Approved' },
    { v: 'pending',       label: '⏳ Pending Review' },
    { v: 'suspended',     label: '🔴 Suspended' },
    { v: 'rejected',      label: '❌ Rejected' },
    { v: 'closed',        label: '🚫 Closed' },
    { v: 'setup_pending', label: '🔧 Setup Pending' },
  ];

  const handleNrcVerify = async () => {
    if (!nrcPanel) return;
    setNrcLoading(true);
    try {
      await api.post(`/admin/seller/${nrcPanel.seller.id}/verify-nrc`, {
        nrc_verification_status: nrcPanel.status,
        nrc_verification_notes:  nrcPanel.notes || null,
      });
      setNrcPanel(null);
      setActionSuccess('NRC verification status updated.');
      await fetchPendingSellers();
    } catch (e) { setActionError(e.response?.data?.message || 'NRC verify failed.'); }
    finally { setNrcLoading(false); }
  };

  const handleSetStatus = async () => {
    if (!statusPanel) return;
    setStatusLoading(true);
    try {
      await api.patch(`/admin/seller/${statusPanel.seller.id}/set-status`, {
        status: statusPanel.status,
        reason: statusPanel.reason || null,
      });
      setStatusPanel(null);
      setActionSuccess(`Seller status changed to ${statusPanel.status}.`);
      await fetchPendingSellers();
    } catch (e) { setActionError(e.response?.data?.message || 'Status change failed.'); }
    finally { setStatusLoading(false); }
  };

  const getStatusBadgeColor = (status) => {
    const map = {
      pending:      "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700",
      under_review: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700",
      verified:     "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-300 dark:border-green-700",
      rejected:     "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-300 dark:border-red-700",
    };
    return map[status] ?? "bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-slate-300 border-gray-300 dark:border-slate-600";
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
            <div className="h-10 w-10 rounded-lg bg-gray-200 dark:bg-slate-700 flex items-center justify-center mr-3 flex-shrink-0">
              <BuildingStorefrontIcon className="h-6 w-6 text-gray-400 dark:text-slate-500" />
            </div>
          )}
          <div>
            <div className="font-medium text-gray-900 dark:text-slate-100">{row.store_name}</div>
            <div className="text-xs text-gray-500 dark:text-slate-400">ID: {row.store_id || "N/A"}</div>
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
            <UserCircleIcon className="h-4 w-4 text-gray-400 dark:text-slate-500 flex-shrink-0" />
            <span className="dark:text-slate-200">{row.user?.name || "Unknown"}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-600 dark:text-slate-400">
            <EnvelopeIcon className="h-4 w-4 text-gray-400 dark:text-slate-500 flex-shrink-0" />
            <span className="truncate max-w-[180px]">{row.contact_email}</span>
          </div>
          <div className="flex items-center gap-1">
            <BuildingStorefrontIcon className="h-4 w-4 text-gray-400 dark:text-slate-500 flex-shrink-0" />
            <span className="dark:text-slate-200">{row.business_type || "Not specified"}</span>
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
            <DocumentIcon className="h-4 w-4 text-gray-400 dark:text-slate-500" />
            <span className="dark:text-slate-200">{getDocumentStatus(row)}</span>
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
            <ClockIcon className="h-4 w-4 text-gray-400 dark:text-slate-500" />
            <span className="dark:text-slate-200">{new Date(row.documents_submitted_at || row.created_at).toLocaleDateString()}</span>
          </div>
          <div className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
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
          <div className="text-xs text-gray-500 dark:text-slate-400">Profile: {row.status}</div>
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
            className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 text-sm flex items-center gap-1"
          >
            <EyeIcon className="h-4 w-4" /> View
          </a>
          <button
            onClick={() => setSelectedSeller(row)}
            className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 text-sm flex items-center gap-1"
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
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl p-6 max-w-sm w-full mx-4">
            {confirmModal === "approve" ? (
              <>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-2">Confirm Verification</h3>
                <p className="text-sm text-gray-600 dark:text-slate-300 mb-1">
                  Verify <strong>{selectedSeller?.store_name}</strong> as{" "}
                  <strong>{verificationData.verification_level}</strong>?
                </p>
                <p className="text-xs text-gray-500 dark:text-slate-400 mb-4">
                  The seller will receive a verified badge and their store will become active.
                </p>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-2">Confirm Rejection</h3>
                <p className="text-sm text-gray-600 dark:text-slate-300 mb-4">
                  Reject verification for <strong>{selectedSeller?.store_name}</strong>?
                  The seller will be notified with your reason.
                </p>
              </>
            )}

            {actionError && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300">
                {actionError}
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => { setConfirmModal(null); setActionError(null); }}
                disabled={actionLoading}
                className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50"
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
        <div className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-sm text-green-800 dark:text-green-300">
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
          <div key={s.label} className="bg-white dark:bg-slate-800 rounded-lg shadow p-4">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 flex flex-wrap gap-3 items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100">Seller Verification Queue</h3>
            <p className="mt-0.5 text-sm text-gray-500 dark:text-slate-400">Review and verify seller documents</p>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
              <input
                type="text"
                placeholder="Search sellers..."
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-green-500 text-sm w-56 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={fetchPendingSellers}
              className="flex items-center px-3 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-md hover:bg-gray-200 dark:hover:bg-slate-600 text-sm gap-1.5"
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
          <div className="p-4 m-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-start gap-2">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-500 dark:text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-800 dark:text-red-300">Error loading data</p>
                <p className="text-sm text-red-600 dark:text-red-400 mt-0.5">{error}</p>
                <button onClick={fetchPendingSellers} className="mt-2 text-sm text-red-700 dark:text-red-400 underline">
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
          <div className="text-center py-12 text-gray-500 dark:text-slate-400">
            <ShieldCheckIcon className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-slate-600" />
            <p className="font-medium">No sellers in verification queue</p>
            <p className="text-sm mt-1">Sellers who submit documents will appear here</p>
          </div>
        )}
      </div>

      {/* ── Review Modal ── */}
      {selectedSeller && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 dark:bg-black/60 overflow-y-auto z-50">
          <div className="relative top-10 mx-auto p-5 w-full max-w-4xl">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl overflow-hidden">

              {/* Modal header */}
              <div className="flex justify-between items-start px-6 py-4 border-b border-gray-200 dark:border-slate-700">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                    Review: {selectedSeller.store_name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">Store ID: {selectedSeller.store_id}</p>
                </div>
                <button
                  onClick={() => { setSelectedSeller(null); setActionError(null); }}
                  className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 mt-0.5"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="px-6 py-4">
                {/* Inline error */}
                {actionError && (
                  <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300 flex gap-2">
                    <ExclamationTriangleIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    {actionError}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Seller Info */}
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-slate-100 mb-3">Seller Information</h4>
                    <div className="space-y-3 text-sm">
                      {[
                        [UserCircleIcon,       selectedSeller.user?.name || "Unknown",           "Owner"],
                        [EnvelopeIcon,         selectedSeller.contact_email,                     "Contact Email"],
                        [PhoneIcon,            selectedSeller.contact_phone,                     "Contact Phone"],
                        [BuildingStorefrontIcon, selectedSeller.business_type || "Not specified","Business Type"],
                        [MapPinIcon,           `${selectedSeller.address || "—"}, ${selectedSeller.city || "—"}`, `${selectedSeller.state || ""} ${selectedSeller.country || "Myanmar"}`],
                      ].map(([Icon, value, label], i) => (
                        <div key={i} className="flex items-start gap-2">
                          <Icon className="h-4 w-4 text-gray-400 dark:text-slate-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="text-gray-900 dark:text-slate-100">{value}</div>
                            <div className="text-xs text-gray-500 dark:text-slate-400">{label}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Verification form */}
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-slate-100 mb-3">Verification Settings</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                          Verification Level
                        </label>
                        <select
                          value={verificationData.verification_level}
                          onChange={(e) => setVerificationData({ ...verificationData, verification_level: e.target.value })}
                          className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                        >
                          <option value="basic">Basic</option>
                          <option value="verified">Verified</option>
                          <option value="premium">Premium</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                          Badge Type
                        </label>
                        <select
                          value={verificationData.badge_type}
                          onChange={(e) => setVerificationData({ ...verificationData, badge_type: e.target.value })}
                          className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                        >
                          <option value="verified">Verified</option>
                          <option value="premium">Premium</option>
                          <option value="featured">Featured</option>
                          <option value="top_rated">Top Rated</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                          Approval Notes
                        </label>
                        <textarea
                          value={verificationData.notes}
                          onChange={(e) => setVerificationData({ ...verificationData, notes: e.target.value })}
                          rows={2}
                          className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500"
                          placeholder="Optional notes..."
                        />
                      </div>

                      <div className="pt-3 border-t border-gray-200 dark:border-slate-700">
                        <label className="block text-sm font-medium text-red-600 dark:text-red-400 mb-1">
                          Rejection Reason <span className="text-gray-500 dark:text-slate-400 font-normal">(required to reject)</span>
                        </label>
                        <textarea
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          rows={2}
                          className="w-full border border-red-200 dark:border-red-800 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-400 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500"
                          placeholder="Explain why this seller is rejected..."
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* NRC side-by-side verification — always visible so admin can check/verify */}
                <div className="mb-5 pt-4 border-t border-gray-200 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900 dark:text-slate-100">🪪 NRC Verification</h4>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        (NRC_STATUS_CFG[selectedSeller.nrc_verification_status] || NRC_STATUS_CFG.unverified).cls
                      }`}>
                        {(NRC_STATUS_CFG[selectedSeller.nrc_verification_status] || NRC_STATUS_CFG.unverified).label}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* NRC number breakdown */}
                      <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4">
                        <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide mb-2">Submitted NRC</p>
                        <p className="font-mono text-lg font-bold text-indigo-900 dark:text-indigo-200 tracking-widest">
                          {selectedSeller.nrc_full || '—'}
                        </p>
                        {selectedSeller.nrc_full_mm && (
                          <p className="text-sm text-indigo-700 dark:text-indigo-300 mt-0.5">{selectedSeller.nrc_full_mm}</p>
                        )}
                        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                          {[
                            ["Division", selectedSeller.nrc_division],
                            ["Township", (selectedSeller.nrc_township_code || '') + (selectedSeller.nrc_township_mm ? ' (' + selectedSeller.nrc_township_mm + ')' : '')],
                            ["Type", (NRC_TYPES.find(t => t.value === selectedSeller.nrc_type) || {}).en || selectedSeller.nrc_type],
                            ["Number", selectedSeller.nrc_number],
                          ].filter(([,v]) => v).map(([k,v]) => (
                            <div key={k}>
                              <span className="text-indigo-500 dark:text-indigo-400">{k}</span>
                              <p className="font-medium text-indigo-900 dark:text-indigo-200">{v}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      {/* NRC image + quick verdict buttons */}
                      <div className="flex flex-col gap-3">
                        {selectedSeller.identity_document_front && (
                          <a href={docUrl(selectedSeller.identity_document_front)} target="_blank" rel="noopener noreferrer"
                            className="block overflow-hidden rounded-xl border-2 border-indigo-300 dark:border-indigo-700 hover:border-indigo-500 transition-colors">
                            <img src={docUrl(selectedSeller.identity_document_front)} alt="NRC Front"
                              className="w-full h-36 object-cover" />
                            <div className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium text-center">NRC Front — click to enlarge</div>
                          </a>
                        )}
                        {selectedSeller.identity_document_back && (
                          <a href={docUrl(selectedSeller.identity_document_back)} target="_blank" rel="noopener noreferrer"
                            className="block overflow-hidden rounded-xl border-2 border-indigo-200 dark:border-indigo-800 hover:border-indigo-500 transition-colors">
                            <img src={docUrl(selectedSeller.identity_document_back)} alt="NRC Back"
                              className="w-full h-28 object-cover" />
                            <div className="px-3 py-1.5 bg-indigo-400 text-white text-xs font-medium text-center">NRC Back</div>
                          </a>
                        )}
                        <div className="grid grid-cols-2 gap-2">
                          {["verified","mismatch","rejected","pending"].map(st => (
                            <button key={st}
                              onClick={() => setNrcPanel({ seller: selectedSeller, status: st, notes: '' })}
                              className={`py-1.5 px-2 text-xs font-semibold rounded-lg border-2 transition-colors ${
                                (NRC_STATUS_CFG[st] || NRC_STATUS_CFG.unverified).cls
                              } border-current hover:opacity-80`}>
                              {(NRC_STATUS_CFG[st] || NRC_STATUS_CFG.unverified).label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                </div>

                {/* Documents */}
                <div className="mb-6 pt-4 border-t border-gray-200 dark:border-slate-700">
                  <h4 className="font-medium text-gray-900 dark:text-slate-100 mb-3">Uploaded Documents</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      ["identity_document_front",        "ID Front",    "blue"],
                      ["identity_document_back",         "ID Back",     "blue"],
                      ["business_registration_document", "Business Reg","green"],
                      ["tax_registration_document",      "Tax Reg",     "green"],
                    ].map(([field, label, color]) => {
                      const url = docUrl(selectedSeller[field]);
                      const colorClasses = color === 'blue'
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50'
                        : 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/50';
                      return url ? (
                        <a
                          key={field}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${colorClasses}`}
                        >
                          <DocumentIcon className="h-4 w-4 flex-shrink-0" />
                          {label}
                        </a>
                      ) : (
                        <div
                          key={field}
                          className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-slate-700 text-gray-400 dark:text-slate-500 rounded-lg text-sm"
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
              <div className="flex justify-between items-center px-6 py-4 bg-gray-50 dark:bg-slate-900/50 border-t border-gray-200 dark:border-slate-700">
                <a
                  href={`/sellers/${selectedSeller.store_slug || selectedSeller.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-sm"
                >
                  <EyeIcon className="h-4 w-4" /> View Store
                </a>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStatusPanel({ seller: selectedSeller, status: selectedSeller.status || "pending", reason: "" })}
                    className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 text-sm font-medium"
                  >
                    ⚡ Change Status
                  </button>
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
      {/* ── NRC Verify Modal ──────────────────────────────────── */}
      {nrcPanel && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-slate-100">🪪 NRC Verification</h3>
              <button onClick={() => setNrcPanel(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300"><XMarkIcon className="h-5 w-5" /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-3 font-mono text-lg font-bold text-indigo-900 dark:text-indigo-200 tracking-widest text-center">
                {nrcPanel.seller.nrc_full || '—'}
              </div>
              {nrcPanel.seller.nrc_full_mm && (
                <p className="text-center text-sm text-indigo-600 dark:text-indigo-400">{nrcPanel.seller.nrc_full_mm}</p>
              )}
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1">NRC Verification Result</label>
                <select value={nrcPanel.status} onChange={e => setNrcPanel(p => ({ ...p, status: e.target.value }))}
                  className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                  {Object.entries(NRC_STATUS_CFG).map(([v, {label}]) => (
                    <option key={v} value={v}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1">Admin Notes (optional)</label>
                <textarea rows={3} value={nrcPanel.notes} onChange={e => setNrcPanel(p => ({ ...p, notes: e.target.value }))}
                  placeholder="e.g. NRC matches document, photo clear..."
                  className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none" />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 dark:border-slate-700 flex justify-end gap-3">
              <button onClick={() => setNrcPanel(null)} className="px-4 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-lg text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700">Cancel</button>
              <button onClick={handleNrcVerify} disabled={nrcLoading}
                className="px-5 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                {nrcLoading ? 'Saving…' : 'Save NRC Status'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Status Change Modal ──────────────────────────────────── */}
      {statusPanel && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-slate-100">⚡ Change Seller Status</h3>
              <button onClick={() => setStatusPanel(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300"><XMarkIcon className="h-5 w-5" /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <p className="text-sm text-gray-600 dark:text-slate-400">Store: <strong className="text-gray-900 dark:text-slate-100">{statusPanel.seller.store_name}</strong></p>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-2">New Status</label>
                <div className="grid grid-cols-2 gap-2">
                  {STORE_STATUS_OPTS.map(opt => (
                    <button key={opt.v} onClick={() => setStatusPanel(p => ({ ...p, status: opt.v }))}
                      className={`py-2 px-3 text-xs font-semibold rounded-xl border-2 transition-all ${
                        statusPanel.status === opt.v
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                          : 'border-gray-200 dark:border-slate-600 hover:border-gray-400 dark:hover:border-slate-400'
                      } text-gray-800 dark:text-slate-200`}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1">Reason (optional)</label>
                <textarea rows={2} value={statusPanel.reason} onChange={e => setStatusPanel(p => ({ ...p, reason: e.target.value }))}
                  placeholder="Reason for status change..."
                  className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-green-500 focus:outline-none resize-none" />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 dark:border-slate-700 flex justify-end gap-3">
              <button onClick={() => setStatusPanel(null)} className="px-4 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-lg text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700">Cancel</button>
              <button onClick={handleSetStatus} disabled={statusLoading}
                className="px-5 py-2 text-sm font-semibold bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50">
                {statusLoading ? 'Saving…' : 'Apply Status'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerVerificationManagement;