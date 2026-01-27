// components/admin/SellerVerificationManagement.js
import React, { useState } from "react";
import { 
  MagnifyingGlassIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  DocumentIcon,
  UserCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  CheckIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";
import { 
  StarIcon,
  BuildingStorefrontIcon,
  MapPinIcon,
  EnvelopeIcon,
  PhoneIcon,
  ArrowRightIcon
} from "@heroicons/react/24/solid";
import DataTable from "../ui/DataTable";

const SellerVerificationManagement = ({
  pendingSellers,
  loading,
  error,
  handleVerifySeller,
  searchTerm,
  onSearchChange,
  refreshData
}) => {
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [verificationData, setVerificationData] = useState({
    verification_level: 'verified',
    badge_type: 'verified',
    notes: ''
  });
  const [rejectReason, setRejectReason] = useState('');

  // Handle verification approval
  const handleApprove = async (seller) => {
    if (!window.confirm(`Approve verification for ${seller.store_name}?`)) return;
    
    try {
      await handleVerifySeller(seller.id, 'approve', {
        verification_level: verificationData.verification_level,
        badge_type: verificationData.badge_type,
        notes: verificationData.notes || `Seller approved by admin on ${new Date().toLocaleDateString()}`
      });
      setSelectedSeller(null);
      setVerificationData({
        verification_level: 'verified',
        badge_type: 'verified',
        notes: ''
      });
    } catch (error) {
      console.error('Approval failed:', error);
      alert('Failed to approve seller: ' + error.message);
    }
  };

  // Handle verification rejection
  const handleReject = async (seller) => {
    if (!rejectReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    
    if (!window.confirm(`Reject verification for ${seller.store_name}?`)) return;
    
    try {
      await handleVerifySeller(seller.id, 'reject', {
        reason: rejectReason
      });
      setSelectedSeller(null);
      setRejectReason('');
    } catch (error) {
      console.error('Rejection failed:', error);
      alert('Failed to reject seller: ' + error.message);
    }
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'under_review': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'approved': return 'bg-green-100 text-green-800 border-green-300';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // Get document status
  const getDocumentStatus = (seller) => {
    const docs = [];
    
    if (seller.identity_document_front) docs.push('ID Front ✓');
    if (seller.identity_document_back) docs.push('ID Back ✓');
    if (seller.business_registration_document) docs.push('Business Reg ✓');
    if (seller.tax_registration_document) docs.push('Tax Reg ✓');
    
    return docs.length > 0 ? docs.join(', ') : 'No documents';
  };

  // Columns for verification table
  const columns = [
    {
      header: "Store Info",
      accessor: "store",
      cell: (row) => (
        <div className="flex items-center">
          {row.store_logo ? (
            <img
              src={row.store_logo.startsWith('http') ? row.store_logo : `/storage/${row.store_logo}`}
              alt={row.store_name}
              className="h-10 w-10 rounded-lg object-cover mr-3"
            />
          ) : (
            <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center mr-3">
              <BuildingStorefrontIcon className="h-6 w-6 text-gray-400" />
            </div>
          )}
          <div>
            <div className="font-medium text-gray-900">{row.store_name}</div>
            <div className="text-xs text-gray-500">
              ID: {row.store_id || 'N/A'}
            </div>
          </div>
        </div>
      )
    },
    {
      header: "Business Details",
      accessor: "business",
      cell: (row) => (
        <div className="space-y-1">
          <div className="flex items-center">
            <UserCircleIcon className="h-4 w-4 text-gray-400 mr-1" />
            <span>{row.user?.name || 'Unknown'}</span>
          </div>
          <div className="flex items-center">
            <EnvelopeIcon className="h-4 w-4 text-gray-400 mr-1" />
            <span className="text-sm text-gray-600">{row.contact_email}</span>
          </div>
          <div className="flex items-center">
            <BuildingStorefrontIcon className="h-4 w-4 text-gray-400 mr-1" />
            <span className="text-sm">{row.business_type || 'Not specified'}</span>
          </div>
        </div>
      )
    },
    {
      header: "Documents",
      accessor: "documents",
      cell: (row) => (
        <div className="space-y-1">
          <div className="flex items-center">
            <DocumentIcon className="h-4 w-4 text-gray-400 mr-1" />
            <span className="text-sm">{getDocumentStatus(row)}</span>
          </div>
          {row.document_status && (
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getStatusBadgeColor(row.document_status)}`}>
              {row.document_status}
            </span>
          )}
        </div>
      )
    },
    {
      header: "Submitted",
      accessor: "submitted",
      cell: (row) => (
        <div className="text-sm">
          <div className="flex items-center">
            <ClockIcon className="h-4 w-4 text-gray-400 mr-1" />
            <span>{new Date(row.documents_submitted_at || row.created_at).toLocaleDateString()}</span>
          </div>
          <div className="text-xs text-gray-500">
            {row.documents_submitted ? 'Documents submitted' : 'No submission'}
          </div>
        </div>
      )
    },
    {
      header: "Status",
      accessor: "status",
      cell: (row) => (
        <div className="space-y-1">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(row.verification_status)}`}>
            {row.verification_status}
          </span>
          <div className="text-xs text-gray-500">
            Profile: {row.status}
          </div>
        </div>
      )
    },
    {
      header: "Actions",
      accessor: "actions",
      cell: (row) => (
        <div className="flex space-x-2">
          <button
            onClick={() => window.open(`/sellers/${row.store_slug || row.id}`, "_blank")}
            className="text-blue-600 hover:text-blue-900 text-sm flex items-center"
            title="View Store"
          >
            <EyeIcon className="h-4 w-4 mr-1" />
            View
          </button>
          <button
            onClick={() => setSelectedSeller(row)}
            className="text-green-600 hover:text-green-900 text-sm flex items-center"
            title="Review Verification"
          >
            <ShieldCheckIcon className="h-4 w-4 mr-1" />
            Review
          </button>
          {row.documents && (
            <button
              onClick={() => window.open(`/admin/seller/${row.id}/documents`, "_blank")}
              className="text-purple-600 hover:text-purple-900 text-sm flex items-center"
              title="View Documents"
            >
              <DocumentIcon className="h-4 w-4 mr-1" />
              Docs
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-yellow-600">
            {Array.isArray(pendingSellers?.data) 
              ? pendingSellers.data.filter(s => s.verification_status === 'pending').length 
              : 0}
          </div>
          <div className="text-sm text-gray-500">Pending Review</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-blue-600">
            {Array.isArray(pendingSellers?.data) 
              ? pendingSellers.data.filter(s => s.verification_status === 'under_review').length 
              : 0}
          </div>
          <div className="text-sm text-gray-500">Under Review</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-green-600">
            {Array.isArray(pendingSellers?.data) 
              ? pendingSellers.data.filter(s => s.verification_status === 'verified').length 
              : 0}
          </div>
          <div className="text-sm text-gray-500">Verified</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-red-600">
            {Array.isArray(pendingSellers?.data) 
              ? pendingSellers.data.filter(s => s.verification_status === 'rejected').length 
              : 0}
          </div>
          <div className="text-sm text-gray-500">Rejected</div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              Seller Verification Queue
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Review and verify seller documents and information
            </p>
          </div>
          <div className="flex space-x-3">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search sellers..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 w-64"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
            <button
              onClick={refreshData}
              className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              <ArrowPathIcon className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {loading && (
          <div className="p-8 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
          </div>
        )}

        {error && (
          <div className="p-4 text-red-500 bg-red-50">
            Error: {error.message || 'Failed to load verification queue'}
          </div>
        )}

        {!loading && !error && (
          <DataTable
            columns={columns}
            data={Array.isArray(pendingSellers?.data) ? pendingSellers.data : pendingSellers || []}
            searchTerm={searchTerm}
            onSearchChange={onSearchChange}
          />
        )}
      </div>

      {/* Verification Review Modal */}
      {selectedSeller && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Review Verification: {selectedSeller.store_name}
                </h3>
                <p className="text-sm text-gray-500">ID: {selectedSeller.store_id}</p>
              </div>
              <button
                onClick={() => setSelectedSeller(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              {/* Left Column - Seller Info */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Seller Information</h4>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <UserCircleIcon className="h-5 w-5 text-gray-400 mr-2" />
                    <div>
                      <div className="font-medium">{selectedSeller.user?.name || 'Unknown'}</div>
                      <div className="text-sm text-gray-500">Owner</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-2" />
                    <div>
                      <div className="text-sm">{selectedSeller.contact_email}</div>
                      <div className="text-sm text-gray-500">Contact Email</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <PhoneIcon className="h-5 w-5 text-gray-400 mr-2" />
                    <div>
                      <div className="text-sm">{selectedSeller.contact_phone}</div>
                      <div className="text-sm text-gray-500">Contact Phone</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <BuildingStorefrontIcon className="h-5 w-5 text-gray-400 mr-2" />
                    <div>
                      <div className="text-sm">{selectedSeller.business_type || 'Not specified'}</div>
                      <div className="text-sm text-gray-500">Business Type</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <MapPinIcon className="h-5 w-5 text-gray-400 mr-2" />
                    <div>
                      <div className="text-sm">{selectedSeller.address}, {selectedSeller.city}</div>
                      <div className="text-sm text-gray-500">{selectedSeller.state}, {selectedSeller.country}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Verification Details */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Verification Details</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Verification Level
                    </label>
                    <select
                      value={verificationData.verification_level}
                      onChange={(e) => setVerificationData({...verificationData, verification_level: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
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
                      onChange={(e) => setVerificationData({...verificationData, badge_type: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="verified">Verified</option>
                      <option value="premium">Premium</option>
                      <option value="featured">Featured</option>
                      <option value="top_rated">Top Rated</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes (Optional)
                    </label>
                    <textarea
                      value={verificationData.notes}
                      onChange={(e) => setVerificationData({...verificationData, notes: e.target.value})}
                      rows={2}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="Add verification notes..."
                    />
                  </div>
                </div>

                {/* Rejection Section */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-2 text-red-600">Rejection Details</h4>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    rows={3}
                    className="w-full border border-red-300 rounded-md px-3 py-2 mb-3"
                    placeholder="Reason for rejection (required)..."
                  />
                </div>
              </div>
            </div>

            {/* Document Links */}
            <div className="mb-6 pt-6 border-t border-gray-200">
              <h4 className="font-medium text-gray-900 mb-3">Uploaded Documents</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {selectedSeller.identity_document_front && (
                  <a
                    href={selectedSeller.identity_document_front.startsWith('http') 
                      ? selectedSeller.identity_document_front 
                      : `/storage/${selectedSeller.identity_document_front}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center px-3 py-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100"
                  >
                    <DocumentIcon className="h-4 w-4 mr-2" />
                    ID Front
                  </a>
                )}
                {selectedSeller.identity_document_back && (
                  <a
                    href={selectedSeller.identity_document_back.startsWith('http') 
                      ? selectedSeller.identity_document_back 
                      : `/storage/${selectedSeller.identity_document_back}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center px-3 py-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100"
                  >
                    <DocumentIcon className="h-4 w-4 mr-2" />
                    ID Back
                  </a>
                )}
                {selectedSeller.business_registration_document && (
                  <a
                    href={selectedSeller.business_registration_document.startsWith('http') 
                      ? selectedSeller.business_registration_document 
                      : `/storage/${selectedSeller.business_registration_document}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center px-3 py-2 bg-green-50 text-green-700 rounded-md hover:bg-green-100"
                  >
                    <DocumentIcon className="h-4 w-4 mr-2" />
                    Business Reg
                  </a>
                )}
                {selectedSeller.tax_registration_document && (
                  <a
                    href={selectedSeller.tax_registration_document.startsWith('http') 
                      ? selectedSeller.tax_registration_document 
                      : `/storage/${selectedSeller.tax_registration_document}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center px-3 py-2 bg-green-50 text-green-700 rounded-md hover:bg-green-100"
                  >
                    <DocumentIcon className="h-4 w-4 mr-2" />
                    Tax Reg
                  </a>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between pt-6 border-t border-gray-200">
              <div className="flex space-x-3">
                <button
                  onClick={() => window.open(`/sellers/${selectedSeller.store_slug || selectedSeller.id}`, "_blank")}
                  className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  <EyeIcon className="h-4 w-4 mr-2" />
                  View Store
                </button>
                <button
                  onClick={() => window.open(`/admin/seller/${selectedSeller.id}/documents`, "_blank")}
                  className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  <DocumentIcon className="h-4 w-4 mr-2" />
                  All Documents
                </button>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => handleReject(selectedSeller)}
                  className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  <XMarkIcon className="h-4 w-4 mr-2" />
                  Reject Verification
                </button>
                <button
                  onClick={() => handleApprove(selectedSeller)}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  <CheckIcon className="h-4 w-4 mr-2" />
                  Approve Verification
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerVerificationManagement;