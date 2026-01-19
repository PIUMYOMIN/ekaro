import React, { useState } from "react";
import { 
  MagnifyingGlassIcon,
  BuildingStorefrontIcon,
  StarIcon,
  ShieldCheckIcon,
  MapPinIcon,
  EnvelopeIcon,
  PhoneIcon,
  UserCircleIcon,
  ArrowPathIcon as ArrowPathOutline
} from "@heroicons/react/24/outline";
import { 
  CheckIcon, 
  XMarkIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  PencilSquareIcon,
  ArrowPathIcon
} from "@heroicons/react/24/solid";
import DataTable from "../ui/DataTable";

const SellerManagement = ({
  sellers,
  loading,
  error,
  handleSellerStatus, // Keep this - it's passed from parent
  searchTerm,
  onSearchChange,
  pagination,
  onPageChange
}) => {
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [statusUpdateData, setStatusUpdateData] = useState({
    status: '',
    reason: '',
    notes: ''
  });

  // Rename this function to avoid conflict with prop
  const handleLocalStatusChange = async (sellerId, newStatus) => {
    const reason = newStatus === 'suspended' || newStatus === 'rejected' 
      ? prompt(`Please provide a reason for ${newStatus}:`) 
      : '';
    
    // Call the parent function
    await handleSellerStatus(sellerId, newStatus, reason);
  };

  const statusOptions = [
    { value: 'setup_pending', label: 'Setup Pending', color: 'gray' },
    { value: 'pending', label: 'Pending', color: 'yellow' },
    { value: 'approved', label: 'Approved', color: 'green' },
    { value: 'active', label: 'Active', color: 'green' },
    { value: 'rejected', label: 'Rejected', color: 'red' },
    { value: 'suspended', label: 'Suspended', color: 'red' },
    { value: 'closed', label: 'Closed', color: 'red' }
  ];

  const verificationLevels = {
    'unverified': { label: 'Unverified', color: 'gray' },
    'basic': { label: 'Basic', color: 'blue' },
    'verified': { label: 'Verified', color: 'green' },
    'premium': { label: 'Premium', color: 'purple' }
  };

  const columns = [
    {
      header: "Store",
      accessor: "store",
      cell: (row) => (
        <div className="flex items-center">
          {row.store_logo ? (
            <img
              src={row.store_logo.startsWith('http') ? row.store_logo : `/storage/${row.store_logo}`}
              alt={row.store_name}
              className="h-10 w-10 rounded-lg object-cover mr-3"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextElementSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div className={`${row.store_logo ? 'hidden' : 'flex'} h-10 w-10 rounded-lg bg-gray-200 items-center justify-center mr-3`}>
            <BuildingStorefrontIcon className="h-6 w-6 text-gray-400" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{row.store_name}</div>
            <div className="text-xs text-gray-500 flex items-center">
              <span className="mr-2">ID: {row.store_id || 'N/A'}</span>
              {row.verification_level && row.verification_level !== 'unverified' && (
                <span className={`px-1.5 py-0.5 rounded text-xs bg-${verificationLevels[row.verification_level]?.color || 'gray'}-100 text-${verificationLevels[row.verification_level]?.color || 'gray'}-800`}>
                  {verificationLevels[row.verification_level]?.label || row.verification_level}
                </span>
              )}
            </div>
          </div>
        </div>
      )
    },
    {
      header: "Owner",
      accessor: "owner",
      cell: (row) => (
        <div>
          <div className="flex items-center">
            <UserCircleIcon className="h-4 w-4 text-gray-400 mr-1" />
            <span className="font-medium">{row.user?.name || 'Unknown'}</span>
          </div>
          <div className="text-sm text-gray-500">{row.user?.email || 'No email'}</div>
        </div>
      )
    },
    {
      header: "Business Info",
      accessor: "business_info",
      cell: (row) => (
        <div className="space-y-1">
          <div className="flex items-center">
            <BuildingStorefrontIcon className="h-4 w-4 text-gray-400 mr-1" />
            <span className="text-sm">{row.business_type || 'Not specified'}</span>
          </div>
          <div className="flex items-center">
            <MapPinIcon className="h-4 w-4 text-gray-400 mr-1" />
            <span className="text-sm text-gray-600">{row.city}, {row.country}</span>
          </div>
        </div>
      )
    },
    {
      header: "Contact",
      accessor: "contact",
      cell: (row) => (
        <div className="space-y-1">
          <div className="flex items-center">
            <EnvelopeIcon className="h-4 w-4 text-gray-400 mr-1" />
            <span className="text-sm">{row.contact_email}</span>
          </div>
          <div className="flex items-center">
            <PhoneIcon className="h-4 w-4 text-gray-400 mr-1" />
            <span className="text-sm text-gray-600">{row.contact_phone}</span>
          </div>
        </div>
      )
    },
    {
      header: "Rating",
      accessor: "rating",
      cell: (row) => {
        const rating = row.reviews_avg_rating || 0;
        return (
          <div className="flex items-center">
            <div className="flex mr-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <StarIcon
                  key={star}
                  className={`h-4 w-4 ${
                    star <= rating
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-medium">{rating.toFixed(1)}</span>
            <span className="text-xs text-gray-500 ml-1">
              ({row.reviews_count || 0})
            </span>
          </div>
        );
      }
    },
    {
      header: "Stats",
      accessor: "stats",
      cell: (row) => (
        <div className="text-sm">
          <div className="flex items-center">
            <span className="text-gray-600 mr-2">Products:</span>
            <span className="font-medium">{row.products_count || 0}</span>
          </div>
          <div className="flex items-center">
            <span className="text-gray-600 mr-2">Orders:</span>
            <span className="font-medium">{row.total_orders || 0}</span>
          </div>
        </div>
      )
    },
    {
      header: "Status",
      accessor: "status",
      cell: (row) => {
        const statusConfig = {
          setup_pending: { color: 'gray', label: 'Setup Pending' },
          pending: { color: 'yellow', label: 'Pending' },
          approved: { color: 'green', label: 'Approved' },
          active: { color: 'green', label: 'Active' },
          rejected: { color: 'red', label: 'Rejected' },
          suspended: { color: 'red', label: 'Suspended' },
          closed: { color: 'red', label: 'Closed' }
        };
        
        const config = statusConfig[row.status] || { color: 'gray', label: row.status };
        
        return (
          <div className="space-y-1">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${config.color}-100 text-${config.color}-800`}>
              {config.label}
            </span>
            {row.document_status && row.document_status !== 'approved' && (
              <div className="text-xs text-gray-500">
                Docs: {row.document_status}
              </div>
            )}
          </div>
        );
      }
    },
    {
      header: "Created",
      accessor: "created_at",
      cell: (row) => (
        <div className="text-sm text-gray-600">
          {new Date(row.created_at).toLocaleDateString()}
          {row.verified_at && (
            <div className="text-xs text-green-600">
              Verified: {new Date(row.verified_at).toLocaleDateString()}
            </div>
          )}
        </div>
      )
    },
    {
      header: "Actions",
      accessor: "actions",
      cell: (row) => (
        <div className="flex flex-col space-y-2">
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
              className="text-gray-600 hover:text-gray-900 text-sm flex items-center"
              title="Edit Seller"
            >
              <PencilSquareIcon className="h-4 w-4 mr-1" />
              Edit
            </button>
          </div>
          
          <div className="flex space-x-2">
            {row.status === "pending" || row.status === "setup_pending" ? (
              <button
                onClick={() => handleLocalStatusChange(row.id, "approved")}
                className="text-green-600 hover:text-green-900 text-sm flex items-center"
                title="Approve Seller"
              >
                <CheckIcon className="h-4 w-4 mr-1" />
                Approve
              </button>
            ) : (row.status === "approved" || row.status === "active") ? (
              <button
                onClick={() => handleLocalStatusChange(row.id, "suspended")}
                className="text-red-600 hover:text-red-900 text-sm flex items-center"
                title="Suspend Seller"
              >
                <XMarkIcon className="h-4 w-4 mr-1" />
                Suspend
              </button>
            ) : null}
            
            {row.status === "suspended" && (
              <button
                onClick={() => handleLocalStatusChange(row.id, "active")}
                className="text-green-600 hover:text-green-900 text-sm flex items-center"
                title="Reactivate Seller"
              >
                <CheckIcon className="h-4 w-4 mr-1" />
                Reactivate
              </button>
            )}
          </div>
        </div>
      )
    }
  ];

  const handleStatusUpdate = async () => {
    if (!selectedSeller || !statusUpdateData.status) return;
    
    // Use the parent function
    await handleSellerStatus(
      selectedSeller.id, 
      statusUpdateData.status, 
      statusUpdateData.reason || statusUpdateData.notes
    );
    setSelectedSeller(null);
    setStatusUpdateData({ status: '', reason: '', notes: '' });
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-gray-800">
            {Array.isArray(sellers) ? sellers.length : 0}
          </div>
          <div className="text-sm text-gray-500">Total Sellers</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-green-600">
            {Array.isArray(sellers) 
              ? sellers.filter(s => s.status === 'active' || s.status === 'approved').length 
              : 0}
          </div>
          <div className="text-sm text-gray-500">Active Sellers</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-yellow-600">
            {Array.isArray(sellers) 
              ? sellers.filter(s => s.status === 'pending').length 
              : 0}
          </div>
          <div className="text-sm text-gray-500">Pending Review</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-red-600">
            {Array.isArray(sellers) 
              ? sellers.filter(s => s.status === 'suspended' || s.status === 'rejected').length 
              : 0}
          </div>
          <div className="text-sm text-gray-500">Suspended/Rejected</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-blue-600">
            {Array.isArray(sellers) 
              ? sellers.filter(s => s.verification_level === 'verified' || s.verification_level === 'premium').length 
              : 0}
          </div>
          <div className="text-sm text-gray-500">Verified Sellers</div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              Seller Management
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Manage all seller accounts, status, and verification
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
              onClick={() => window.open('/admin/seller-verification', '_blank')}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              <ShieldCheckIcon className="h-4 w-4 mr-2" />
              Verification Queue
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
            Error: {error.message || 'Failed to load sellers'}
          </div>
        )}

        {!loading && !error && (
          <>
            <DataTable
              columns={columns}
              data={Array.isArray(sellers) ? sellers : []}
              searchTerm={searchTerm}
              onSearchChange={onSearchChange}
            />

            {/* Pagination */}
            {pagination && pagination.total > pagination.per_page && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Showing <span className="font-medium">{pagination.from || 1}</span>{" "}
                  to <span className="font-medium">{pagination.to || sellers.length}</span> of{" "}
                  <span className="font-medium">{pagination.total || sellers.length}</span> results
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => onPageChange(pagination.current_page - 1)}
                    disabled={pagination.current_page === 1}
                    className="px-3 py-1 rounded-md border border-gray-300 text-sm font-medium disabled:opacity-50 hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1 text-sm">
                    Page {pagination.current_page} of {pagination.last_page}
                  </span>
                  <button
                    onClick={() => onPageChange(pagination.current_page + 1)}
                    disabled={pagination.current_page === pagination.last_page}
                    className="px-3 py-1 rounded-md border border-gray-300 text-sm font-medium disabled:opacity-50 hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Edit Modal */}
      {selectedSeller && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">
                Edit Seller: {selectedSeller.store_name}
              </h3>
              <button
                onClick={() => setSelectedSeller(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Basic Information</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Store Name
                    </label>
                    <input
                      type="text"
                      value={selectedSeller.store_name}
                      readOnly
                      className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Business Type
                    </label>
                    <input
                      type="text"
                      value={selectedSeller.business_type}
                      readOnly
                      className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Verification Level
                    </label>
                    <select
                      value={statusUpdateData.verification_level || selectedSeller.verification_level}
                      onChange={(e) => setStatusUpdateData({ ...statusUpdateData, verification_level: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      {Object.entries(verificationLevels).map(([value, config]) => (
                        <option key={value} value={value}>
                          {config.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Status Management</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={statusUpdateData.status || selectedSeller.status}
                      onChange={(e) => setStatusUpdateData({ ...statusUpdateData, status: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Document Status
                    </label>
                    <select
                      value={statusUpdateData.document_status || selectedSeller.document_status}
                      onChange={(e) => setStatusUpdateData({ ...statusUpdateData, document_status: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="not_submitted">Not Submitted</option>
                      <option value="pending">Pending</option>
                      <option value="under_review">Under Review</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes / Reason (Optional)
                </label>
                <textarea
                  value={statusUpdateData.notes}
                  onChange={(e) => setStatusUpdateData({ ...statusUpdateData, notes: e.target.value })}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Add notes or reason for status change..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                onClick={() => setSelectedSeller(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusUpdate}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerManagement;