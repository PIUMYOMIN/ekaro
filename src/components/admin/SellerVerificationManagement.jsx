import React, { useState, useEffect } from "react";
import {
  BuildingStorefrontIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  UserIcon,
  CheckCircleIcon,
  ClockIcon,
  MagnifyingGlassIcon as MagnifyingGlassOutline,
  ArrowPathIcon as ArrowPathOutline
} from "@heroicons/react/24/outline";
import {
  CheckCircleIcon as CheckCircleSolid,
  XCircleIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  EyeIcon,
  DocumentIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon
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
    notes: '',
  });
  const [activeTab, setActiveTab] = useState('profile');
  const [stats, setStats] = useState({
    total: 0,
    withIdentityDocs: 0,
    withBusinessDocs: 0,
    pendingVerification: 0,
    pendingDocuments: 0,
    completedVerification: 0
  });

  // Extract sellers data from API response
  const sellersData = React.useMemo(() => {
    // Handle different API response structures
    if (Array.isArray(pendingSellers)) {
      return pendingSellers;
    } else if (pendingSellers?.data) {
      // If response has data property
      return Array.isArray(pendingSellers.data) ? pendingSellers.data : [];
    } else if (pendingSellers?.data?.data) {
      // If response has data.data property (pagination)
      return Array.isArray(pendingSellers.data.data) ? pendingSellers.data.data : [];
    }
    return [];
  }, [pendingSellers]);

  // Update stats when sellers data changes
  useEffect(() => {
    if (Array.isArray(sellersData) && sellersData.length > 0) {
      const newStats = {
        total: sellersData.length,
        withIdentityDocs: sellersData.filter(s => 
          s.identity_document_front || 
          s.documents?.identity_document_front ||
          (s.document_status && s.document_status !== 'not_submitted')
        ).length,
        withBusinessDocs: sellersData.filter(s => 
          s.business_registration_document || 
          s.documents?.business_registration_document
        ).length,
        pendingVerification: sellersData.filter(s => 
          s.verification_status === 'pending' || 
          s.verification_status === 'under_review'
        ).length,
        pendingDocuments: sellersData.filter(s => 
          s.document_status === 'pending' || 
          s.document_status === 'under_review'
        ).length,
        completedVerification: sellersData.filter(s => 
          s.verification_status === 'verified' && 
          s.document_status === 'approved'
        ).length
      };
      setStats(newStats);
    }
  }, [sellersData]);

  // Calculate profile completion percentage
  const calculateProfileCompletion = (seller) => {
    const requiredFields = [
      'store_name',
      'business_type',
      'contact_email',
      'contact_phone',
      'address',
      'city',
      'state',
      'country'
    ];

    let completed = 0;
    requiredFields.forEach(field => {
      if (seller[field] && seller[field].toString().trim() !== '') completed++;
    });

    return Math.round((completed / requiredFields.length) * 100);
  };

  // Check document completion
  const checkDocumentStatus = (seller) => {
    // Check if seller is individual or business
    const isIndividual = seller.business_type === 'individual';
    
    const documents = {
      identity_document_front: seller.identity_document_front || (seller.documents?.identity_document_front?.url),
      identity_document_back: seller.identity_document_back || (seller.documents?.identity_document_back?.url),
    };

    // Add business documents only for non-individual sellers
    if (!isIndividual) {
      documents.business_registration_document = seller.business_registration_document || (seller.documents?.business_registration_document?.url);
      documents.tax_registration_document = seller.tax_registration_document || (seller.documents?.tax_registration_document?.url);
      documents.business_certificate = seller.business_certificate || (seller.documents?.business_certificate?.url);
    }

    const uploaded = Object.values(documents).filter(doc => doc).length;
    const total = Object.keys(documents).length;

    return {
      uploaded,
      total,
      percentage: total > 0 ? Math.round((uploaded / total) * 100) : 0,
      allUploaded: uploaded === total,
      isIndividual
    };
  };

  // Get document URLs - handle both storage paths and full URLs
  const getDocumentUrl = (seller, documentField) => {
    // First check if documents are structured in seller.documents
    if (seller.documents && seller.documents[documentField]) {
      const doc = seller.documents[documentField];
      if (typeof doc === 'string') return doc;
      if (doc.url) return doc.url;
      if (doc.path) return doc.path;
    }

    // Fallback to direct field
    if (!seller[documentField]) return null;

    const docPath = seller[documentField];

    // If it's already a full URL
    if (docPath.startsWith('http://') || docPath.startsWith('https://')) {
      return docPath;
    }

    // If it's a storage path, prepend the storage URL
    if (docPath.startsWith('storage/')) {
      return `${window.location.origin}/${docPath}`;
    }

    // If it's a relative path without storage prefix
    if (docPath.includes('sellers/') || docPath.includes('documents/')) {
      return `${window.location.origin}/storage/${docPath}`;
    }

    // For Laravel storage paths
    if (docPath.startsWith('app/')) {
      const cleanPath = docPath.replace('app/', '');
      return `${window.location.origin}/storage/${cleanPath}`;
    }

    // Default: assume it's a relative path from storage
    return `${window.location.origin}/storage/${docPath}`;
  };

  // Get document display name
  const getDocumentLabel = (seller, documentField) => {
    if (seller.documents && seller.documents[documentField]) {
      const doc = seller.documents[documentField];
      if (doc.label) return doc.label;
      if (doc.name) return doc.name;
    }

    // Map field names to readable labels
    const labelMap = {
      'identity_document_front': 'Identity Document (Front)',
      'identity_document_back': 'Identity Document (Back)',
      'business_registration_document': 'Business Registration',
      'tax_registration_document': 'Tax Registration',
      'business_certificate': 'Business Certificate',
      'store_logo': 'Store Logo',
      'store_banner': 'Store Banner'
    };

    return labelMap[documentField] || documentField.replace(/_/g, ' ');
  };

  const columns = [
    {
      header: "Store",
      accessor: "store_name",
      cell: (row) => (
        <div className="flex items-center">
          {row.store_logo ? (
            <img
              src={getDocumentUrl(row, 'store_logo')}
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
              <span className="mr-2">ID: {row.store_id || row.id}</span>
              {row.verification_status === 'verified' && (
                <span className="px-1.5 py-0.5 rounded text-xs bg-green-100 text-green-800">
                  Verified
                </span>
              )}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">
              {row.business_type === 'individual' ? 'Individual' : 'Business'}
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
          <div className="font-medium text-gray-900 flex items-center">
            <UserIcon className="h-4 w-4 text-gray-400 mr-1" />
            {row.user?.name || 'Unknown'}
          </div>
          <div className="text-sm text-gray-500">{row.user?.email}</div>
          <div className="text-xs text-gray-500">{row.contact_phone}</div>
        </div>
      )
    },
    {
      header: "Document Status",
      accessor: "documents",
      cell: (row) => {
        const docStatus = checkDocumentStatus(row);
        const documentStatus = row.document_status || 'not_submitted';
        const verificationStatus = row.verification_status || 'pending';

        return (
          <div className="w-full">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className={`px-2 py-0.5 text-xs rounded-full ${documentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                documentStatus === 'under_review' ? 'bg-blue-100 text-blue-800' :
                  documentStatus === 'approved' ? 'bg-green-100 text-green-800' :
                    documentStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                }`}>
                {documentStatus.replace(/_/g, ' ')}
              </span>
              <span className={`px-2 py-0.5 text-xs rounded-full ${verificationStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                verificationStatus === 'under_review' ? 'bg-blue-100 text-blue-800' :
                  verificationStatus === 'verified' ? 'bg-green-100 text-green-800' :
                    verificationStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                }`}>
                {verificationStatus.replace(/_/g, ' ')}
              </span>
            </div>
            <div className="text-xs text-gray-700 mb-1">
              {docStatus.uploaded} of {docStatus.total} required documents
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${docStatus.percentage >= 75 ? 'bg-green-500' :
                  docStatus.percentage >= 50 ? 'bg-yellow-500' :
                    docStatus.percentage >= 25 ? 'bg-orange-500' :
                      'bg-red-500'
                  }`}
                style={{ width: `${docStatus.percentage}%` }}
              ></div>
            </div>
            {row.documents_submitted && (
              <div className="text-xs text-green-600 mt-1">
                Submitted: {row.documents_submitted_at ?
                  new Date(row.documents_submitted_at).toLocaleDateString() :
                  'Awaiting submission'}
              </div>
            )}
          </div>
        );
      }
    },
    {
      header: "Profile Status",
      accessor: "status",
      cell: (row) => {
        const statusConfig = {
          setup_pending: { color: 'gray', label: 'Setup Pending', icon: ClockIcon },
          pending: { color: 'yellow', label: 'Pending Review', icon: ClockIcon },
          approved: { color: 'green', label: 'Approved', icon: CheckCircleIcon },
          active: { color: 'green', label: 'Active', icon: CheckCircleIcon },
          rejected: { color: 'red', label: 'Rejected', icon: XCircleIcon },
          suspended: { color: 'red', label: 'Suspended', icon: ExclamationTriangleIcon },
        };

        const config = statusConfig[row.status] || { color: 'gray', label: row.status, icon: ClockIcon };
        const IconComponent = config.icon;

        return (
          <div className="flex items-center">
            <IconComponent className={`h-5 w-5 text-${config.color}-500 mr-2`} />
            <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${config.color}-100 text-${config.color}-800`}>
              {config.label}
            </span>
          </div>
        );
      }
    },
    {
      header: "Submitted",
      accessor: "submitted_date",
      cell: (row) => {
        const date = row.onboarding_completed_at || row.documents_submitted_at || row.created_at;
        return (
          <div className="text-sm">
            {date ? (
              <>
                <div className="text-gray-900 font-medium">
                  {new Date(date).toLocaleDateString()}
                </div>
                <div className="text-gray-500 text-xs">
                  {new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </>
            ) : (
              <span className="text-gray-400">Not submitted</span>
            )}
          </div>
        );
      }
    },
    {
      header: "Actions",
      accessor: "actions",
      cell: (row) => {
        const hasDocuments = row.identity_document_front || 
          row.business_registration_document || 
          (row.documents && Object.keys(row.documents).length > 0);
        
        return (
          <div className="flex flex-col space-y-2">
            <button
              onClick={() => setSelectedSeller(row)}
              className="text-blue-600 hover:text-blue-900 text-sm flex items-center justify-center"
              disabled={!hasDocuments}
            >
              <EyeIcon className="h-4 w-4 mr-1" />
              {hasDocuments ? 'Review Documents' : 'No Docs'}
            </button>
            
            {hasDocuments && (row.document_status === 'pending' || row.document_status === 'under_review' || !row.document_status) && (
              <div className="flex space-x-1">
                <button
                  onClick={() => {
                    if (window.confirm(`Approve ${row.store_name}'s documents?`)) {
                      handleVerifySeller(row.id, 'approve', {
                        verification_level: 'verified',
                        badge_type: 'verified',
                        notes: `Documents approved by admin on ${new Date().toLocaleDateString()}`,
                        document_status: 'approved'
                      });
                    }
                  }}
                  className="text-green-600 hover:text-green-900 text-xs flex items-center px-2 py-1 bg-green-50 rounded"
                >
                  <CheckCircleSolid className="h-3 w-3 mr-1" />
                  Approve Docs
                </button>
                <button
                  onClick={() => {
                    const reason = prompt(`Reason for rejecting ${row.store_name}'s documents:`);
                    if (reason) {
                      handleVerifySeller(row.id, 'reject', {
                        reason: reason,
                        document_status: 'rejected'
                      });
                    }
                  }}
                  className="text-red-600 hover:text-red-900 text-xs flex items-center px-2 py-1 bg-red-50 rounded"
                >
                  <XCircleIcon className="h-3 w-3 mr-1" />
                  Reject Docs
                </button>
              </div>
            )}
            
            {row.document_status === 'approved' && row.verification_status !== 'verified' && (
              <button
                onClick={() => {
                  handleVerifySeller(row.id, 'approve', {
                    verification_level: 'verified',
                    badge_type: 'verified',
                    notes: 'Verified after document approval',
                    document_status: 'approved'
                  });
                }}
                className="text-green-600 hover:text-green-900 text-xs flex items-center px-2 py-1 bg-green-50 rounded"
              >
                <ShieldCheckIcon className="h-3 w-3 mr-1" />
                Complete Verification
              </button>
            )}
          </div>
        );
      }
    }
  ];

  const handleVerificationSubmit = async () => {
    if (!selectedSeller) return;

    try {
      await handleVerifySeller(selectedSeller.id, 'approve', {
        ...verificationData,
        document_status: 'approved'
      });
      setSelectedSeller(null);
      setVerificationData({
        verification_level: 'verified',
        badge_type: 'verified',
        notes: '',
      });
      if (refreshData) refreshData();
    } catch (error) {
      alert(`Failed to verify seller: ${error.message}`);
    }
  };

  // Render document preview
  const renderDocumentPreview = (seller, documentField) => {
    const documentUrl = getDocumentUrl(seller, documentField);
    if (!documentUrl) return null;

    const label = getDocumentLabel(seller, documentField);
    const isImage = documentUrl.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i);

    return (
      <div className="mb-4 p-3 border border-gray-200 rounded-md bg-gray-50">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-gray-900">{label}</h4>
          <span className="text-xs text-gray-500">
            {seller[documentField] ? 'Uploaded' : 'From documents object'}
          </span>
        </div>
        {isImage ? (
          <div className="relative">
            <a href={documentUrl} target="_blank" rel="noopener noreferrer" className="block">
              <img
                src={documentUrl}
                alt={label}
                className="max-h-48 w-auto rounded border border-gray-300 hover:opacity-90 transition-opacity mx-auto"
                onError={(e) => {
                  e.target.style.display = 'none';
                  const fallback = e.target.parentElement?.nextElementSibling;
                  if (fallback) fallback.style.display = 'block';
                }}
              />
            </a>
            <div className="hidden mt-2 text-center">
              <a
                href={documentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center justify-center"
              >
                <DocumentIcon className="h-4 w-4 mr-1" />
                View document (Image failed to load)
              </a>
            </div>
          </div>
        ) : (
          <a
            href={documentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center p-3 bg-white rounded-md border border-gray-200 hover:bg-gray-100 transition-colors"
          >
            <DocumentIcon className="h-5 w-5 text-gray-500 mr-2" />
            <span className="text-sm text-gray-700">View {label}</span>
          </a>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-gray-800">
            {stats.total}
          </div>
          <div className="text-sm text-gray-500">Total for Review</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-blue-600">
            {stats.withIdentityDocs}
          </div>
          <div className="text-sm text-gray-500">With Identity Docs</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-green-600">
            {stats.withBusinessDocs}
          </div>
          <div className="text-sm text-gray-500">With Business Docs</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-yellow-600">
            {stats.pendingDocuments}
          </div>
          <div className="text-sm text-gray-500">Pending Documents</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-purple-600">
            {stats.completedVerification}
          </div>
          <div className="text-sm text-gray-500">Verified</div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              Seller Document Verification
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Review and verify seller documents and identity proofs
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
              className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
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
          <div className="p-4 text-red-500 bg-red-50 flex items-center">
            <ExclamationCircleIcon className="h-5 w-5 mr-2" />
            <div>
              <div className="font-medium">Error loading verification data</div>
              <div className="text-sm">{error.message || 'Please try again'}</div>
            </div>
          </div>
        )}

        {!loading && !error && (!Array.isArray(sellersData) || sellersData.length === 0) && (
          <div className="p-8 text-center text-gray-500">
            <ShieldCheckIcon className="h-12 w-12 mx-auto text-gray-300 mb-2" />
            <p className="text-lg">No sellers with documents pending verification</p>
            <p className="text-sm mt-1">All seller documents have been reviewed</p>
          </div>
        )}

        {!loading && !error && Array.isArray(sellersData) && sellersData.length > 0 && (
          <DataTable
            columns={columns}
            data={sellersData}
            searchTerm={searchTerm}
            onSearchChange={onSearchChange}
          />
        )}
      </div>

      {/* Verification Modal */}
      {selectedSeller && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-6xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Verify Seller: {selectedSeller.store_name}
                </h3>
                <div className="flex items-center space-x-3 text-sm text-gray-500 mt-1">
                  <span>ID: {selectedSeller.store_id || selectedSeller.id}</span>
                  <span>•</span>
                  <span>Type: {selectedSeller.business_type === 'individual' ? 'Individual' : 'Business'}</span>
                  <span>•</span>
                  <span>Status: {selectedSeller.status}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedSeller(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8">
                {['profile', 'documents', 'verification'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </nav>
            </div>

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Store Information</h4>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm text-gray-500">Store Name</dt>
                      <dd className="text-sm font-medium">{selectedSeller.store_name}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">Business Type</dt>
                      <dd className="text-sm font-medium capitalize">{selectedSeller.business_type}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">Store ID</dt>
                      <dd className="text-sm font-medium">{selectedSeller.store_id || selectedSeller.id}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">Description</dt>
                      <dd className="text-sm text-gray-700">{selectedSeller.description || 'No description provided'}</dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Contact Information</h4>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm text-gray-500">Contact Email</dt>
                      <dd className="text-sm font-medium">{selectedSeller.contact_email}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">Contact Phone</dt>
                      <dd className="text-sm font-medium">{selectedSeller.contact_phone}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">Owner</dt>
                      <dd className="text-sm font-medium">
                        {selectedSeller.user?.name || 'Unknown'} ({selectedSeller.user?.email})
                      </dd>
                    </div>
                  </dl>

                  {selectedSeller.business_type !== 'individual' && (
                    <>
                      <h4 className="font-medium text-gray-900 mb-3 mt-4">Business Details</h4>
                      <dl className="space-y-3">
                        <div>
                          <dt className="text-sm text-gray-500">Business Registration Number</dt>
                          <dd className="text-sm font-medium">{selectedSeller.business_registration_number || 'Not provided'}</dd>
                        </div>
                        <div>
                          <dt className="text-sm text-gray-500">Tax ID</dt>
                          <dd className="text-sm font-medium">{selectedSeller.tax_id || 'Not provided'}</dd>
                        </div>
                      </dl>
                    </>
                  )}
                </div>

                <div className="col-span-2">
                  <h4 className="font-medium text-gray-900 mb-3">Address Information</h4>
                  <dl className="grid grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm text-gray-500">Address</dt>
                      <dd className="text-sm font-medium">{selectedSeller.address}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">City</dt>
                      <dd className="text-sm font-medium">{selectedSeller.city}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">State/Region</dt>
                      <dd className="text-sm font-medium">{selectedSeller.state}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">Country</dt>
                      <dd className="text-sm font-medium">{selectedSeller.country}</dd>
                    </div>
                    {selectedSeller.postal_code && (
                      <div>
                        <dt className="text-sm text-gray-500">Postal Code</dt>
                        <dd className="text-sm font-medium">{selectedSeller.postal_code}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>
            )}

            {/* Documents Tab */}
            {activeTab === 'documents' && (
              <div className="mb-6">
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Uploaded Documents</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-3">Identity Documents</h5>
                      {renderDocumentPreview(selectedSeller, 'identity_document_front')}
                      {renderDocumentPreview(selectedSeller, 'identity_document_back')}

                      {!getDocumentUrl(selectedSeller, 'identity_document_front') && 
                       !getDocumentUrl(selectedSeller, 'identity_document_back') && (
                        <div className="text-gray-400 text-sm mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                          No identity documents uploaded
                        </div>
                      )}
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-3">Business Documents</h5>
                      {selectedSeller.business_type !== 'individual' ? (
                        <>
                          {renderDocumentPreview(selectedSeller, 'business_registration_document')}
                          {renderDocumentPreview(selectedSeller, 'tax_registration_document')}
                          {renderDocumentPreview(selectedSeller, 'business_certificate')}

                          {!getDocumentUrl(selectedSeller, 'business_registration_document') &&
                           !getDocumentUrl(selectedSeller, 'tax_registration_document') && (
                            <div className="text-gray-400 text-sm p-3 bg-yellow-50 border border-yellow-200 rounded">
                              No business documents uploaded
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-gray-500 text-sm p-3 bg-gray-50 border border-gray-200 rounded">
                          Individual seller - Business documents not required
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Additional Documents */}
                {(selectedSeller.additional_documents && selectedSeller.additional_documents.length > 0) && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-3">Additional Documents</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedSeller.additional_documents.map((doc, index) => {
                        const docUrl = doc.url || getDocumentUrl({ additional_documents: doc.path }, 'additional_documents');
                        return (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md border border-gray-200">
                            <div className="flex items-center">
                              <DocumentTextIcon className="h-5 w-5 text-gray-500 mr-2" />
                              <div>
                                <span className="text-sm font-medium text-gray-700">{doc.name || `Additional Document ${index + 1}`}</span>
                                {doc.type && <div className="text-xs text-gray-500">{doc.type}</div>}
                              </div>
                            </div>
                            {docUrl && (
                              <a
                                href={docUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 text-sm"
                              >
                                View
                              </a>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Verification Tab */}
            {activeTab === 'verification' && (
              <div className="mb-6">
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Current Status</h4>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <dt className="text-sm text-gray-500">Account Status</dt>
                      <dd className={`text-sm font-medium capitalize px-2 py-1 rounded-full inline-block ${selectedSeller.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        selectedSeller.status === 'approved' ? 'bg-green-100 text-green-800' :
                          selectedSeller.status === 'active' ? 'bg-green-100 text-green-800' :
                            selectedSeller.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                        }`}>
                        {selectedSeller.status}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">Verification Status</dt>
                      <dd className={`text-sm font-medium capitalize px-2 py-1 rounded-full inline-block ${selectedSeller.verification_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        selectedSeller.verification_status === 'under_review' ? 'bg-blue-100 text-blue-800' :
                          selectedSeller.verification_status === 'verified' ? 'bg-green-100 text-green-800' :
                            selectedSeller.verification_status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                        }`}>
                        {selectedSeller.verification_status || 'pending'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">Document Status</dt>
                      <dd className={`text-sm font-medium capitalize px-2 py-1 rounded-full inline-block ${selectedSeller.document_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        selectedSeller.document_status === 'under_review' ? 'bg-blue-100 text-blue-800' :
                          selectedSeller.document_status === 'approved' ? 'bg-green-100 text-green-800' :
                            selectedSeller.document_status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                        }`}>
                        {selectedSeller.document_status || 'not_submitted'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">Documents Submitted</dt>
                      <dd className={`text-sm font-medium capitalize px-2 py-1 rounded-full inline-block ${selectedSeller.documents_submitted ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                        {selectedSeller.documents_submitted ? 'Yes' : 'No'}
                      </dd>
                    </div>
                  </div>

                  {selectedSeller.document_rejection_reason && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                      <dt className="text-sm font-medium text-red-800 mb-1">Previous Rejection Reason</dt>
                      <dd className="text-sm text-red-700">{selectedSeller.document_rejection_reason}</dd>
                    </div>
                  )}

                  {selectedSeller.verification_notes && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-md mt-3">
                      <dt className="text-sm font-medium text-blue-800 mb-1">Previous Verification Notes</dt>
                      <dd className="text-sm text-blue-700">{selectedSeller.verification_notes}</dd>
                    </div>
                  )}
                </div>

                {/* Verification Options */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Verification Options</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Verification Level
                      </label>
                      <select
                        value={verificationData.verification_level}
                        onChange={(e) => setVerificationData({ ...verificationData, verification_level: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      >
                        <option value="basic">Basic</option>
                        <option value="verified">Verified</option>
                        <option value="premium">Premium</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        Basic: Identity verified • Verified: Full verification • Premium: Premium features
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Badge Type
                      </label>
                      <select
                        value={verificationData.badge_type}
                        onChange={(e) => setVerificationData({ ...verificationData, badge_type: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      >
                        <option value="verified">Verified Badge</option>
                        <option value="premium">Premium Badge</option>
                        <option value="featured">Featured Seller</option>
                        <option value="top_rated">Top Rated</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        Badge shown on seller's profile
                      </p>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Verification Notes (Visible to Seller)
                  </label>
                  <textarea
                    value={verificationData.notes}
                    onChange={(e) => setVerificationData({ ...verificationData, notes: e.target.value })}
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Add notes for the seller (e.g., 'Identity documents verified successfully')..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This note will be visible to the seller in their verification status
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-6 border-t border-gray-200">
              <div className="text-sm text-gray-500">
                Seller ID: {selectedSeller.id} • User ID: {selectedSeller.user_id}
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setSelectedSeller(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const reason = prompt('Reason for rejection:', verificationData.notes || 'Documents do not meet requirements');
                    if (reason !== null && reason.trim() !== '') {
                      handleVerifySeller(selectedSeller.id, 'reject', {
                        reason: reason.trim(),
                        document_status: 'rejected'
                      });
                      setSelectedSeller(null);
                    }
                  }}
                  className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50"
                >
                  Reject Documents
                </button>
                <button
                  onClick={handleVerificationSubmit}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
                >
                  <CheckCircleSolid className="h-4 w-4 mr-1" />
                  Approve & Verify
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