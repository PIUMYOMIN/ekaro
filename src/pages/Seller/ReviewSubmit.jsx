// pages/Seller/ReviewSubmit.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    CheckCircleIcon,
    BuildingStorefrontIcon,
    DocumentTextIcon,
    MapPinIcon,
    DocumentIcon,
    ClockIcon,
    ShieldCheckIcon,
    ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import OnboardingLayout from '../../components/OnboardingLayout';
import { useOnboardingState } from '../../hooks/useOnboardingState';

const ReviewSubmit = () => {
    const navigate = useNavigate();
    const { formData, saveStep, isLoading } = useOnboardingState();
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Helper function to safely get nested values
    const getSafeValue = (obj, path, defaultValue = 'Not provided') => {
        if (!obj) return defaultValue;
        
        const keys = path.split('.');
        let result = obj;
        
        for (const key of keys) {
            if (result === undefined || result === null) {
                return defaultValue;
            }
            result = result[key];
        }
        
        return result === '' || result === null || result === undefined ? defaultValue : result;
    };

    // Get address data safely
    const addressData = formData.address || {};
    const storeBasicData = formData.store_basic || {};
    const businessDetailsData = formData.business_details || {};

    const handleSubmit = async () => {
        setError('');
        setSubmitting(true);

        const result = await saveStep('review', {});
        
        if (result.success) {
            setSuccess(true);
            // Redirect after 3 seconds
            setTimeout(() => {
                navigate('/seller', {
                    state: {
                        success: true,
                        message: 'Seller onboarding completed successfully! Your store is now under review.'
                    }
                });
            }, 3000);
        } else {
            setError(result.message || 'Failed to submit onboarding');
        }
        
        setSubmitting(false);
    };

    const handleEditSection = (section) => {
        navigate(`/seller/onboarding/${section}`);
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
                <div className="max-w-md w-full text-center bg-white rounded-2xl shadow-lg p-8">
                    <div className="mx-auto h-20 w-20 bg-green-500 rounded-full flex items-center justify-center mb-6">
                        <CheckCircleIcon className="h-10 w-10 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">🎉 Congratulations!</h2>
                    <p className="text-gray-600 mb-6">
                        Your seller profile has been submitted successfully and is now under review.
                    </p>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
                    <p className="text-gray-500">Redirecting to seller dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <OnboardingLayout
            title="Review & Submit"
            description="Review your information before submitting for verification"
            onBack={() => navigate('/seller/onboarding/documents')}
            onNext={handleSubmit}
            nextLabel="Submit & Complete Onboarding"
            nextDisabled={submitting || isLoading}
            loading={submitting}
            showFooter={true}
        >
            <div className="p-6">
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
                        <div className="flex items-center">
                            <ExclamationCircleIcon className="h-5 w-5 text-red-500 mr-2" />
                            <p className="text-red-700">{error}</p>
                        </div>
                    </div>
                )}

                <div className="space-y-6">
                    {/* Store Basic Info */}
                    <div className="border border-gray-200 rounded-xl p-6">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center space-x-3">
                                <BuildingStorefrontIcon className="h-6 w-6 text-green-600" />
                                <h3 className="text-lg font-medium text-gray-900">Store Information</h3>
                            </div>
                            <button
                                onClick={() => handleEditSection('store-basic')}
                                className="text-sm text-green-600 hover:text-green-800 hover:underline"
                            >
                                Edit
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">Store Name</p>
                                <p className="font-medium">{getSafeValue(storeBasicData, 'store_name')}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Business Type</p>
                                <p className="font-medium">{getSafeValue(storeBasicData, 'business_type_slug')}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Contact Email</p>
                                <p className="font-medium">{getSafeValue(storeBasicData, 'contact_email')}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Contact Phone</p>
                                <p className="font-medium">{getSafeValue(storeBasicData, 'contact_phone')}</p>
                            </div>
                            {getSafeValue(storeBasicData, 'description', '') !== 'Not provided' && (
                                <div className="md:col-span-2">
                                    <p className="text-sm text-gray-500">Description</p>
                                    <p className="font-medium">{getSafeValue(storeBasicData, 'description')}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Business Details - Only show if there's data */}
                    {(businessDetailsData.business_registration_number || businessDetailsData.tax_id || 
                      businessDetailsData.website || businessDetailsData.account_number) && (
                        <div className="border border-gray-200 rounded-xl p-6">
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center space-x-3">
                                    <DocumentTextIcon className="h-6 w-6 text-blue-600" />
                                    <h3 className="text-lg font-medium text-gray-900">Business Details</h3>
                                </div>
                                <button
                                    onClick={() => handleEditSection('business-details')}
                                    className="text-sm text-green-600 hover:text-green-800 hover:underline"
                                >
                                    Edit
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {businessDetailsData.business_registration_number && (
                                    <div>
                                        <p className="text-sm text-gray-500">Registration Number</p>
                                        <p className="font-medium">{businessDetailsData.business_registration_number}</p>
                                    </div>
                                )}
                                {businessDetailsData.tax_id && (
                                    <div>
                                        <p className="text-sm text-gray-500">Tax ID</p>
                                        <p className="font-medium">{businessDetailsData.tax_id}</p>
                                    </div>
                                )}
                                {businessDetailsData.website && (
                                    <div>
                                        <p className="text-sm text-gray-500">Website</p>
                                        <p className="font-medium">{businessDetailsData.website}</p>
                                    </div>
                                )}
                                {businessDetailsData.account_number && (
                                    <div>
                                        <p className="text-sm text-gray-500">Account Number</p>
                                        <p className="font-medium">{businessDetailsData.account_number}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Address Information */}
                    <div className="border border-gray-200 rounded-xl p-6">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center space-x-3">
                                <MapPinIcon className="h-6 w-6 text-red-600" />
                                <h3 className="text-lg font-medium text-gray-900">Address Information</h3>
                            </div>
                            <button
                                onClick={() => handleEditSection('address')}
                                className="text-sm text-green-600 hover:text-green-800 hover:underline"
                            >
                                Edit
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <p className="text-sm text-gray-500">Address</p>
                                <p className="font-medium">{addressData.address || 'Not provided'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">City</p>
                                <p className="font-medium">{addressData.city || 'Not provided'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">State/Region</p>
                                <p className="font-medium">{addressData.state || 'Not provided'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Country</p>
                                <p className="font-medium">{addressData.country || 'Not provided'}</p>
                            </div>
                            {addressData.postal_code && (
                                <div>
                                    <p className="text-sm text-gray-500">Postal Code</p>
                                    <p className="font-medium">{addressData.postal_code}</p>
                                </div>
                            )}
                            {addressData.location && (
                                <div>
                                    <p className="text-sm text-gray-500">Location</p>
                                    <p className="font-medium">{addressData.location}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Documents Status */}
                    <div className="border border-gray-200 rounded-xl p-6">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center space-x-3">
                                <DocumentIcon className="h-6 w-6 text-purple-600" />
                                <h3 className="text-lg font-medium text-gray-900">Documents</h3>
                            </div>
                            <button
                                onClick={() => handleEditSection('documents')}
                                className="text-sm text-green-600 hover:text-green-800 hover:underline"
                            >
                                Edit
                            </button>
                        </div>
                        <div className="flex items-center space-x-3">
                            <ShieldCheckIcon className="h-8 w-8 text-green-500" />
                            <div className="flex-1">
                                <p className="text-sm text-gray-700">Documents submitted for review</p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Your documents have been uploaded and are ready for verification
                                </p>
                            </div>
                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                ✓ Submitted
                            </span>
                        </div>
                    </div>
                </div>

                {/* Terms and Conditions */}
                <div className="mt-6 p-6 bg-yellow-50 rounded-xl border border-yellow-200">
                    <h4 className="font-medium text-yellow-900 mb-3 flex items-center">
                        <DocumentIcon className="h-5 w-5 mr-2" />
                        Terms & Conditions
                    </h4>
                    <ul className="space-y-2 text-sm text-yellow-700">
                        <li className="flex items-start">
                            <CheckCircleIcon className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                            <span>I confirm that all information provided is accurate and truthful</span>
                        </li>
                        <li className="flex items-start">
                            <CheckCircleIcon className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                            <span>I agree to comply with the platform's terms of service</span>
                        </li>
                        <li className="flex items-start">
                            <CheckCircleIcon className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                            <span>I understand that providing false information may result in account suspension</span>
                        </li>
                    </ul>
                </div>

                {/* What Happens Next */}
                <div className="mt-6 p-6 bg-blue-50 rounded-xl border border-blue-200">
                    <h4 className="font-medium text-blue-900 mb-3 flex items-center">
                        <ClockIcon className="h-5 w-5 mr-2" />
                        What Happens Next?
                    </h4>
                    <ul className="space-y-2 text-sm text-blue-700">
                        <li className="flex items-start">
                            <div className="h-2 w-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                            <span>Your store profile will be submitted for review</span>
                        </li>
                        <li className="flex items-start">
                            <div className="h-2 w-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                            <span>Verification typically takes 1-3 business days</span>
                        </li>
                        <li className="flex items-start">
                            <div className="h-2 w-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                            <span>You will receive an email notification when your store is approved</span>
                        </li>
                        <li className="flex items-start">
                            <div className="h-2 w-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                            <span>Once approved, you can start listing and selling products</span>
                        </li>
                    </ul>
                </div>
            </div>
        </OnboardingLayout>
    );
};

export default ReviewSubmit;