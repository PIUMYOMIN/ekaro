import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowRightIcon,
  ArrowLeftIcon,
  DocumentIcon,
  CheckCircleIcon,
  CloudArrowUpIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  EyeIcon,
  XMarkIcon,
  DocumentCheckIcon
} from "@heroicons/react/24/outline";
import api from "../../utils/api";
import { useSellerOnboarding } from "../../hooks/useSellerOnboarding";

const DocumentUpload = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { onboardingData } = useSellerOnboarding();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [requirements, setRequirements] = useState([]);
  const [uploadedDocuments, setUploadedDocuments] = useState({});
  const [isIndividual, setIsIndividual] = useState(false);
  const [businessTypeInfo, setBusinessTypeInfo] = useState(null);
  const [documentsComplete, setDocumentsComplete] = useState(false);

  useEffect(() => {
    fetchDocumentRequirements();
  }, []);

  const fetchDocumentRequirements = async () => {
    try {
      setLoading(true);
      const response = await api.get('/seller/document-requirements');
      if (response.data.success) {
        const data = response.data.data;
        console.log("Document requirements:", data);
        
        setRequirements(data.requirements || []);
        setUploadedDocuments(data.uploaded_documents || {});
        setIsIndividual(data.is_individual);
        setBusinessTypeInfo(data.business_type_info);
        
        // Check if all required documents are uploaded
        const allRequiredUploaded = data.requirements
          .filter(req => req.required)
          .every(req => data.uploaded_documents[req.type]?.uploaded);
        
        setDocumentsComplete(allRequiredUploaded);
      }
    } catch (error) {
      console.error('Failed to fetch document requirements:', error);
      setError('Failed to load document requirements');
    } finally {
      setLoading(false);
    }
  };

  const validateFile = (file, requirement) => {
    // Check file type
    const validExtensions = requirement.accepted_formats?.split(',') || ['jpg', 'jpeg', 'png', 'pdf'];
    const fileExt = file.name.split('.').pop().toLowerCase();
    
    if (!validExtensions.includes(fileExt)) {
      return `Invalid file type. Accepted: ${requirement.accepted_formats || 'jpg, jpeg, png, pdf'}`;
    }

    // Check file size
    const maxSize = requirement.max_size?.includes('5MB') ? 5 * 1024 * 1024 : 2 * 1024 * 1024;
    if (file.size > maxSize) {
      return `File too large. Max size: ${requirement.max_size || '2MB'}`;
    }

    return null;
  };

  const handleFileUpload = async (field, file, requirement) => {
    if (!file) return;

    const validationError = validateFile(file, requirement);
    if (validationError) {
      setError(validationError);
      return;
    }

    setUploading({ ...uploading, [field]: true });
    setError("");
    setSuccess("");

    const formData = new FormData();
    formData.append('document_type', field);
    formData.append('document', file);

    try {
      const response = await api.post('/seller/onboarding/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // ✅ CHECK SUCCESS STATUS
      if (response.data.success) {
        setUploadedDocuments({
          ...uploadedDocuments,
          [field]: {
            uploaded: true,
            url: response.data.data.url,
            name: file.name
          }
        });
        
        setSuccess(`${requirement.label} uploaded successfully!`);
        setTimeout(() => setSuccess(""), 3000);
        
        // Refresh document requirements
        await fetchDocumentRequirements();
      } else {
        setError(response.data.message || 'Failed to upload document');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to upload document');
    } finally {
      setUploading({ ...uploading, [field]: false });
    }
  };

  const handleRemoveDocument = async (field) => {
    try {
      const response = await api.delete(`/seller/documents/${field}`);
      
      // ✅ CHECK SUCCESS STATUS
      if (response.data.success) {
        setUploadedDocuments({
          ...uploadedDocuments,
          [field]: { uploaded: false, url: null, name: null }
        });
        
        setSuccess('Document removed successfully');
        setTimeout(() => setSuccess(""), 3000);
        
        // Refresh document requirements
        await fetchDocumentRequirements();
      } else {
        setError(response.data.message || 'Failed to remove document');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to remove document');
    }
  };

  const handleViewDocument = (field) => {
    if (uploadedDocuments[field]?.url) {
      window.open(uploadedDocuments[field].url, '_blank');
    }
  };

  const handleContinue = async () => {
    setLoading(true);
    setError("");
    
    try {
      // Check required documents
      const missing = [];
      requirements.forEach(req => {
        if (req.required && !uploadedDocuments[req.type]?.uploaded) {
          missing.push(req.label);
        }
      });

      if (missing.length > 0) {
        setError(`Please upload required documents: ${missing.join(', ')}`);
        setLoading(false);
        return;
      }

      // ✅ CALL API TO MARK DOCUMENTS AS COMPLETE
      const response = await api.post('/seller/onboarding/mark-documents-complete');
      
      // ✅ CHECK SUCCESS STATUS
      if (response.data.success) {
        setError("");
        setSuccess("Documents submitted successfully!");
        
        // Navigate to review after a brief delay
        setTimeout(() => {
          navigate('/seller/onboarding/review-submit');
        }, 1000);
      } else {
        setError(response.data.message || "Failed to save document status");
      }
    } catch (error) {
      console.error("Error marking documents complete:", error);
      
      if (error.response) {
        if (error.response.status === 422) {
          const missingDocs = error.response.data.missing_documents || [];
          setError(`Please upload all required documents: ${missingDocs.join(', ')}`);
        } else {
          setError(error.response.data.message || "Failed to save document status");
        }
      } else if (error.request) {
        setError("No response from server. Please check your connection.");
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const getDocumentStatus = () => {
    const requiredDocs = requirements.filter(req => req.required);
    const uploadedRequired = requiredDocs.filter(
      req => uploadedDocuments[req.type]?.uploaded
    ).length;
    
    return `${uploadedRequired}/${requiredDocs.length} required documents uploaded`;
  };

  if (loading && requirements.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading document requirements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-green-600 rounded-full flex items-center justify-center">
            <DocumentIcon className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Document Verification
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Step 4 of 5 • Upload required documents for verification
          </p>
          <div className="mt-4 flex justify-center space-x-2">
            <div className="w-3 h-3 bg-green-600 rounded-full"></div>
            <div className="w-3 h-3 bg-green-600 rounded-full"></div>
            <div className="w-3 h-3 bg-green-600 rounded-full"></div>
            <div className="w-3 h-3 bg-green-600 rounded-full"></div>
            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
          </div>
          <div className="mt-4">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              documentsComplete ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {getDocumentStatus()}
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
            <div className="flex justify-between items-start">
              <div className="flex">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
              <button onClick={() => setError("")} className="text-red-500 hover:text-red-700">
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
            <div className="flex justify-between items-start">
              <div className="flex">
                <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                <p className="text-sm text-green-700">{success}</p>
              </div>
              <button onClick={() => setSuccess("")} className="text-green-500 hover:text-green-700">
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {/* Business Type Info */}
          {businessTypeInfo && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-start">
                <InformationCircleIcon className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-blue-900 mb-1">Business Type: {businessTypeInfo.name}</h3>
                  <p className="text-sm text-blue-700">
                    {isIndividual 
                      ? "As an individual seller, you need to upload identity documents."
                      : "As a business seller, you need to upload business registration, tax, and identity documents."
                    }
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Document Requirements Info */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex items-start">
              <InformationCircleIcon className="h-5 w-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-yellow-900">Document Requirements</h3>
                <div className="mt-1 text-sm text-yellow-700 space-y-1">
                  <p>• All documents must be clear and readable</p>
                  <p>• Accepted formats: PDF, JPG, JPEG, PNG</p>
                  <p>• Files should not exceed 5MB (2MB for images)</p>
                  <p>• Documents will be reviewed within 1-3 business days</p>
                </div>
              </div>
            </div>
          </div>

          {/* Document Upload Sections */}
          {requirements.map((requirement) => (
            <div key={requirement.type} className="bg-white p-6 rounded-xl shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium text-gray-900">
                      {requirement.label}
                      {requirement.required && <span className="text-red-500 ml-1">*</span>}
                    </h3>
                    {uploadedDocuments[requirement.type]?.uploaded && (
                      <CheckCircleIcon className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{requirement.description}</p>
                  <div className="text-xs text-gray-500 mt-2 space-y-1">
                    <div>
                      <span className="font-medium">Accepted formats:</span> {requirement.accepted_formats || 'jpg, jpeg, png, pdf'}
                    </div>
                    <div>
                      <span className="font-medium">Max file size:</span> {requirement.max_size || '2MB'}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-400 whitespace-nowrap">
                  {requirement.required ? 'Required' : 'Optional'}
                </div>
              </div>

              {uploadedDocuments[requirement.type]?.uploaded ? (
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <DocumentIcon className="h-8 w-8 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900 truncate max-w-xs">
                        {uploadedDocuments[requirement.type].name || 'Uploaded document'}
                      </p>
                      <div className="flex space-x-3 mt-1">
                        <button
                          onClick={() => handleViewDocument(requirement.type)}
                          className="text-sm text-green-600 hover:text-green-700 flex items-center"
                        >
                          <EyeIcon className="h-4 w-4 inline mr-1" />
                          View Document
                        </button>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveDocument(requirement.type)}
                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove document"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="file"
                    id={`file-${requirement.type}`}
                    accept={requirement.accepted_formats || '.pdf,.jpg,.jpeg,.png'}
                    onChange={(e) => handleFileUpload(requirement.type, e.target.files[0], requirement)}
                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                    disabled={uploading[requirement.type]}
                  />
                  <label
                    htmlFor={`file-${requirement.type}`}
                    className={`flex flex-col items-center justify-center h-40 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200 ${
                      uploading[requirement.type]
                        ? 'border-blue-300 bg-blue-50'
                        : 'border-gray-300 hover:border-green-400 hover:bg-green-50'
                    }`}
                  >
                    {uploading[requirement.type] ? (
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
                        <span className="text-sm text-blue-600">Uploading...</span>
                      </div>
                    ) : (
                      <>
                        <CloudArrowUpIcon className="h-12 w-12 text-gray-400 mb-3" />
                        <span className="text-sm text-gray-600">Click to upload {requirement.label}</span>
                        <span className="text-xs text-gray-500 mt-1">
                          {requirement.accepted_formats || 'PDF, JPG, JPEG, PNG'} • Max {requirement.max_size || '2MB'}
                        </span>
                      </>
                    )}
                  </label>
                </div>
              )}
            </div>
          ))}

          {/* Navigation */}
          <div className="flex justify-between pt-6 border-t border-gray-200">
            <button
              onClick={() => navigate('/seller/onboarding/address')}
              className="flex items-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              <span>Back to Address</span>
            </button>
            <button
              onClick={handleContinue}
              disabled={loading || Object.keys(uploading).some(key => uploading[key]) || !documentsComplete}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <DocumentCheckIcon className="h-5 w-5" />
                  <span>Continue to Review</span>
                  <ArrowRightIcon className="h-5 w-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentUpload;