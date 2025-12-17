// src/pages/Seller/SubmitOnboarding.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  CheckCircleIcon,
  ArrowLeftIcon,
  BuildingStorefrontIcon,
  DocumentTextIcon,
  MapPinIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { useSellerOnboarding } from '../../hooks/useSellerOnboarding';
import api from '../../utils/api';

const SubmitOnboarding = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { onboardingData, clearOnboardingData } = useSellerOnboarding();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Check if all required data is available
    if (!onboardingData.store_name || !onboardingData.business_type || !onboardingData.address) {
      navigate('/seller/onboarding/store-basic');
    }
  }, [onboardingData, navigate]);

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      // Submit all onboarding data
      const response = await api.post('/seller/complete-onboarding', onboardingData);
      
      if (response.data.success) {
        setSuccess(true);
        clearOnboardingData();
        
        // Redirect to seller dashboard after 3 seconds
        setTimeout(() => {
          navigate('/seller', { 
            state: { 
              success: true, 
              message: 'Seller onboarding completed successfully! Your store is now under review.' 
            } 
          });
        }, 3000);
      }
    } catch (error) {
      console.error('Failed to submit onboarding:', error);
      setError(error.response?.data?.message || 'Failed to complete onboarding. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditSection = (section) => {
    switch (section) {
      case 'store-basic':
        navigate('/seller/onboarding/store-basic');
        break;
      case 'business-details':
        navigate('/seller/onboarding/business-details');
        break;
      case 'documents':
        navigate('/seller/onboarding/documents');
        break;
      case 'address':
        navigate('/seller/onboarding/address');
        break;
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <div className="mx-auto h-20 w-20 bg-green-500 rounded-full flex items-center justify-center mb-6">
            <CheckCircleIcon className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">🎉 Congratulations!</h2>
          <p className="text-gray-600 mb-6">
            Your seller profile has been submitted successfully and is now under review.
          </p>
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Redirecting to seller dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto h-20 w-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
            <ShieldCheckIcon className="h-10 w-10 text-white" />
          </div>
          <h1 className="mt-6 text-3xl font-bold text-gray-900">
            Review & Submit
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Review your information before submitting for verification
          </p>
          <div className="mt-4 flex justify-center space-x-2">
            <div className="w-3 h-3 bg-green-600 rounded-full"></div>
            <div className="w-3 h-3 bg-green-600 rounded-full"></div>
            <div className="w-3 h-3 bg-green-600 rounded-full"></div>
            <div className="w-3 h-3 bg-green-600 rounded-full"></div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Review Sections */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
          {/* Store Basic Info */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-3">
                <BuildingStorefrontIcon className="h-6 w-6 text-green-600" />
                <h3 className="text-lg font-medium text-gray-900">Store Information</h3>
              </div>
              <button
                onClick={() => handleEditSection('store-basic')}
                className="text-sm text-green-600 hover:text-green-800"
              >
                Edit
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Store Name</p>
                <p className="font-medium">{onboardingData.store_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Business Type</p>
                <p className="font-medium">{onboardingData.business_type}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Contact Email</p>
                <p className="font-medium">{onboardingData.contact_email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Contact Phone</p>
                <p className="font-medium">{onboardingData.contact_phone}</p>
              </div>
            </div>
          </div>

          {/* Business Details */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-3">
                <DocumentTextIcon className="h-6 w-6 text-blue-600" />
                <h3 className="text-lg font-medium text-gray-900">Business Details</h3>
              </div>
              <button
                onClick={() => handleEditSection('business-details')}
                className="text-sm text-green-600 hover:text-green-800"
              >
                Edit
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {onboardingData.business_registration_number && (
                <div>
                  <p className="text-sm text-gray-500">Registration Number</p>
                  <p className="font-medium">{onboardingData.business_registration_number}</p>
                </div>
              )}
              {onboardingData.tax_id && (
                <div>
                  <p className="text-sm text-gray-500">Tax ID</p>
                  <p className="font-medium">{onboardingData.tax_id}</p>
                </div>
              )}
              {onboardingData.website && (
                <div>
                  <p className="text-sm text-gray-500">Website</p>
                  <p className="font-medium">{onboardingData.website}</p>
                </div>
              )}
              {onboardingData.account_number && (
                <div>
                  <p className="text-sm text-gray-500">Account Number</p>
                  <p className="font-medium">{onboardingData.account_number}</p>
                </div>
              )}
            </div>
          </div>

          {/* Documents Status */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-3">
                <ShieldCheckIcon className="h-6 w-6 text-purple-600" />
                <h3 className="text-lg font-medium text-gray-900">Documents</h3>
              </div>
              <button
                onClick={() => handleEditSection('documents')}
                className="text-sm text-green-600 hover:text-green-800"
              >
                Edit
              </button>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex-1">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Document Upload Status</span>
                  <span>Documents can be uploaded later</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '50%' }}></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  You can upload documents now or skip and upload later from your dashboard
                </p>
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-3">
                <MapPinIcon className="h-6 w-6 text-red-600" />
                <h3 className="text-lg font-medium text-gray-900">Address Information</h3>
              </div>
              <button
                onClick={() => handleEditSection('address')}
                className="text-sm text-green-600 hover:text-green-800"
              >
                Edit
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <p className="text-sm text-gray-500">Address</p>
                <p className="font-medium">{onboardingData.address}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">City</p>
                <p className="font-medium">{onboardingData.city}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">State/Region</p>
                <p className="font-medium">{onboardingData.state}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Country</p>
                <p className="font-medium">{onboardingData.country || 'Myanmar'}</p>
              </div>
              {onboardingData.postal_code && (
                <div>
                  <p className="text-sm text-gray-500">Postal Code</p>
                  <p className="font-medium">{onboardingData.postal_code}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6">
          <h4 className="font-medium text-yellow-900 mb-3">📋 Terms & Conditions</h4>
          <ul className="space-y-2 text-sm text-yellow-700">
            <li>• I confirm that all information provided is accurate and truthful</li>
            <li>• I agree to comply with the platform's terms of service</li>
            <li>• I understand that providing false information may result in account suspension</li>
            <li>• I authorize verification of the documents submitted</li>
            <li>• I agree to receive communications regarding my seller account</li>
          </ul>
        </div>

        {/* Submission Note */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
          <h4 className="font-medium text-blue-900 mb-2">ℹ️ What Happens Next?</h4>
          <ul className="space-y-2 text-sm text-blue-700">
            <li>• Your store profile will be created</li>
            <li>• You'll be redirected to the seller dashboard</li>
            <li>• You can upload verification documents anytime from the dashboard</li>
            <li>• Without verification documents, you can only list limited products</li>
            <li>• Full selling capabilities require document verification (1-3 business days)</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-between space-y-4 sm:space-y-0">
          <button
            onClick={() => navigate('/seller/onboarding/address')}
            className="flex items-center justify-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            <span>Back to Address Info</span>
          </button>

          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <CheckCircleIcon className="h-5 w-5" />
                  <span>Submit & Complete Onboarding</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmitOnboarding;