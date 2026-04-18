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
    if (!onboardingData.store_name || !onboardingData.business_type || !onboardingData.address) {
      navigate('/seller/onboarding/store-basic');
    }
  }, [onboardingData, navigate]);

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/seller/complete-onboarding', onboardingData);

      if (response.data.success) {
        setSuccess(true);
        clearOnboardingData();

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
    navigate(`/seller/onboarding/${section}`);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:bg-gray-900 dark:from-gray-900 dark:to-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <div className="mx-auto h-20 w-20 bg-green-500 rounded-full flex items-center justify-center mb-6">
            <CheckCircleIcon className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">🎉 Congratulations!</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Your seller profile has been submitted successfully and is now under review.
          </p>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Redirecting to seller dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  const labelClass = "text-sm text-gray-500 dark:text-gray-400";
  const valueClass = "font-medium text-gray-900 dark:text-gray-100";
  const editBtnClass = "text-sm text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300";
  const sectionDividerClass = "border-b border-gray-200 dark:border-gray-700";

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:bg-gray-900 dark:from-gray-900 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto h-20 w-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
            <ShieldCheckIcon className="h-10 w-10 text-white" />
          </div>
          <h1 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
            Review &amp; Submit
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
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
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
            <p className="text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Review Sections */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
          {/* Store Basic Info */}
          <div className={`p-6 ${sectionDividerClass}`}>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-3">
                <BuildingStorefrontIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Store Information</h3>
              </div>
              <button onClick={() => handleEditSection('store-basic')} className={editBtnClass}>Edit</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className={labelClass}>Store Name</p>
                <p className={valueClass}>{onboardingData.store_name}</p>
              </div>
              <div>
                <p className={labelClass}>Business Type</p>
                <p className={valueClass}>{onboardingData.business_type}</p>
              </div>
              <div>
                <p className={labelClass}>Contact Email</p>
                <p className={valueClass}>{onboardingData.contact_email}</p>
              </div>
              <div>
                <p className={labelClass}>Contact Phone</p>
                <p className={valueClass}>{onboardingData.contact_phone}</p>
              </div>
            </div>
          </div>

          {/* Business Details */}
          <div className={`p-6 ${sectionDividerClass}`}>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-3">
                <DocumentTextIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Business Details</h3>
              </div>
              <button onClick={() => handleEditSection('business-details')} className={editBtnClass}>Edit</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {onboardingData.business_registration_number && (
                <div>
                  <p className={labelClass}>Registration Number</p>
                  <p className={valueClass}>{onboardingData.business_registration_number}</p>
                </div>
              )}
              {onboardingData.tax_id && (
                <div>
                  <p className={labelClass}>Tax ID</p>
                  <p className={valueClass}>{onboardingData.tax_id}</p>
                </div>
              )}
              {onboardingData.website && (
                <div>
                  <p className={labelClass}>Website</p>
                  <p className={valueClass}>{onboardingData.website}</p>
                </div>
              )}
              {onboardingData.account_number && (
                <div>
                  <p className={labelClass}>Account Number</p>
                  <p className={valueClass}>{onboardingData.account_number}</p>
                </div>
              )}
            </div>
          </div>

          {/* Documents Status */}
          <div className={`p-6 ${sectionDividerClass}`}>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-3">
                <ShieldCheckIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Documents</h3>
              </div>
              <button onClick={() => handleEditSection('documents')} className={editBtnClass}>Edit</button>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex-1">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                  <span>Document Upload Status</span>
                  <span>Documents can be uploaded later</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '50%' }}></div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  You can upload documents now or skip and upload later from your dashboard
                </p>
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-3">
                <MapPinIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Address Information</h3>
              </div>
              <button onClick={() => handleEditSection('address')} className={editBtnClass}>Edit</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <p className={labelClass}>Address</p>
                <p className={valueClass}>{onboardingData.address}</p>
              </div>
              <div>
                <p className={labelClass}>City</p>
                <p className={valueClass}>{onboardingData.city}</p>
              </div>
              <div>
                <p className={labelClass}>State/Region</p>
                <p className={valueClass}>{onboardingData.state}</p>
              </div>
              <div>
                <p className={labelClass}>Country</p>
                <p className={valueClass}>{onboardingData.country || 'Myanmar'}</p>
              </div>
              {onboardingData.postal_code && (
                <div>
                  <p className={labelClass}>Postal Code</p>
                  <p className={valueClass}>{onboardingData.postal_code}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6 mb-6">
          <h4 className="font-medium text-yellow-900 dark:text-yellow-200 mb-3">📋 Terms &amp; Conditions</h4>
          <ul className="space-y-2 text-sm text-yellow-700 dark:text-yellow-400">
            <li>• I confirm that all information provided is accurate and truthful</li>
            <li>• I agree to comply with the platform's terms of service</li>
            <li>• I understand that providing false information may result in account suspension</li>
            <li>• I authorize verification of the documents submitted</li>
            <li>• I agree to receive communications regarding my seller account</li>
          </ul>
        </div>

        {/* Submission Note */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 mb-6">
          <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">ℹ️ What Happens Next?</h4>
          <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
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
            className="flex items-center justify-center space-x-2 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            <span>Back to Address Info</span>
          </button>

          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <CheckCircleIcon className="h-5 w-5" />
                  <span>Submit &amp; Complete Onboarding</span>
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
