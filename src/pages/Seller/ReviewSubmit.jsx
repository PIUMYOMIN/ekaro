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

const TERMS = [
    {
        id: 'terms-accuracy',
        label: 'I confirm that all information provided is accurate and truthful.',
    },
    {
        id: 'terms-tos',
        label: "I agree to comply with Pyonea's terms of service and seller policies.",
    },
    {
        id: 'terms-suspension',
        label: 'I understand that providing false information may result in account suspension.',
    },
];

const ReviewSubmit = () => {
    const navigate = useNavigate();
    const { formData, saveStep, isLoading } = useOnboardingState();

    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Terms: track each checkbox independently
    const [termsChecked, setTermsChecked] = useState(
        () => Object.fromEntries(TERMS.map(t => [t.id, false]))
    );
    const allTermsAccepted = Object.values(termsChecked).every(Boolean);

    const toggleTerm = (id) =>
        setTermsChecked(prev => ({ ...prev, [id]: !prev[id] }));

    // ── Helpers ──────────────────────────────────────────────────────────────
    const getSafeValue = (obj, path, defaultValue = 'Not provided') => {
        if (!obj) return defaultValue;
        const keys = path.split('.');
        let result = obj;
        for (const key of keys) {
            if (result === undefined || result === null) return defaultValue;
            result = result[key];
        }
        return result === '' || result === null || result === undefined
            ? defaultValue
            : result;
    };

    const addressData       = formData.address          || {};
    const storeBasicData    = formData.store_basic       || {};
    const businessDetailsData = formData.business_details || {};

    const docsSubmitted =
        formData.documents?.documents_submitted ?? formData.documents_submitted;

    // ── Submit ───────────────────────────────────────────────────────────────
    const handleSubmit = async () => {
        setError('');

        // Guard: terms must all be accepted
        if (!allTermsAccepted) {
            setError('Please read and accept all Terms & Conditions before submitting.');
            return;
        }

        // Guard: documents must be complete
        if (docsSubmitted === false) {
            setError(
                'Your documents have not been submitted yet. ' +
                'Please go back to the Documents step, upload all required documents, ' +
                'and click "Continue" to mark them as complete.'
            );
            return;
        }

        setSubmitting(true);

        const result = await saveStep('review', { terms_accepted: true });

        if (result.success) {
            setSuccess(true);
            setTimeout(() => {
                navigate('/seller', {
                    state: {
                        success: true,
                        message: 'Seller onboarding completed successfully! Your store is now under review.',
                    },
                });
            }, 3000);
        } else {
            if (Array.isArray(result.errors) && result.errors.length > 0) {
                setError('Please complete the following before submitting: ' + result.errors.join(', '));
            } else {
                setError(result.message || 'Failed to submit onboarding. Please check all steps are complete.');
            }
        }

        setSubmitting(false);
    };

    const handleEditSection = (section) => navigate(`/seller/onboarding/${section}`);

    // ── Success screen ───────────────────────────────────────────────────────
    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4">
                <div className="max-w-md w-full text-center bg-white rounded-2xl shadow-lg p-8">
                    <div className="mx-auto h-20 w-20 bg-green-500 rounded-full flex items-center justify-center mb-6">
                        <CheckCircleIcon className="h-10 w-10 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Congratulations!</h2>
                    <p className="text-gray-600 mb-6">
                        Your seller profile has been submitted successfully and is now under review.
                    </p>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4" />
                    <p className="text-gray-500 text-sm">Redirecting to seller dashboard...</p>
                </div>
            </div>
        );
    }

    // ── Main render ──────────────────────────────────────────────────────────
    return (
        <OnboardingLayout
            title="Review & Submit"
            description="Review your information before submitting for verification"
            onBack={() => navigate('/seller/onboarding/documents')}
            onNext={handleSubmit}
            nextLabel="Submit Application"
            nextDisabled={submitting || isLoading || !allTermsAccepted}
            loading={submitting}
            showFooter={true}
        >
            <div className="p-4 sm:p-6">

                {/* Error banner */}
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
                        <div className="flex items-start gap-2">
                            <ExclamationCircleIcon className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <p className="text-red-700 text-sm">{error}</p>
                        </div>
                    </div>
                )}

                <div className="space-y-4 sm:space-y-6">

                    {/* Store Information */}
                    <div className="border border-gray-200 rounded-xl p-4 sm:p-6">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center space-x-3">
                                <BuildingStorefrontIcon className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 flex-shrink-0" />
                                <h3 className="text-base sm:text-lg font-medium text-gray-900">Store Information</h3>
                            </div>
                            <button
                                onClick={() => handleEditSection('store-basic')}
                                className="text-sm text-green-600 hover:text-green-800 hover:underline flex-shrink-0"
                            >
                                Edit
                            </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <div>
                                <p className="text-xs sm:text-sm text-gray-500">Store Name</p>
                                <p className="font-medium text-sm sm:text-base truncate">
                                    {getSafeValue(storeBasicData, 'store_name')}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs sm:text-sm text-gray-500">Business Type</p>
                                <p className="font-medium text-sm sm:text-base truncate">
                                    {getSafeValue(storeBasicData, 'business_type_slug')}
                                </p>
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs sm:text-sm text-gray-500">Contact Email</p>
                                <p
                                    className="font-medium text-sm sm:text-base truncate"
                                    title={getSafeValue(storeBasicData, 'contact_email')}
                                >
                                    {getSafeValue(storeBasicData, 'contact_email')}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs sm:text-sm text-gray-500">Contact Phone</p>
                                <p className="font-medium text-sm sm:text-base truncate">
                                    {getSafeValue(storeBasicData, 'contact_phone')}
                                </p>
                            </div>
                            {getSafeValue(storeBasicData, 'description', '') !== 'Not provided' && (
                                <div className="sm:col-span-2">
                                    <p className="text-xs sm:text-sm text-gray-500">Description</p>
                                    <p className="font-medium text-sm sm:text-base">
                                        {getSafeValue(storeBasicData, 'description')}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Business Details — only when data exists */}
                    {(businessDetailsData.business_registration_number ||
                        businessDetailsData.tax_id ||
                        businessDetailsData.website ||
                        businessDetailsData.account_number) && (
                        <div className="border border-gray-200 rounded-xl p-4 sm:p-6">
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center space-x-3">
                                    <DocumentTextIcon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 flex-shrink-0" />
                                    <h3 className="text-base sm:text-lg font-medium text-gray-900">Business Details</h3>
                                </div>
                                <button
                                    onClick={() => handleEditSection('business-details')}
                                    className="text-sm text-green-600 hover:text-green-800 hover:underline flex-shrink-0"
                                >
                                    Edit
                                </button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                {businessDetailsData.business_registration_number && (
                                    <div>
                                        <p className="text-xs sm:text-sm text-gray-500">Registration Number</p>
                                        <p className="font-medium text-sm sm:text-base truncate">
                                            {businessDetailsData.business_registration_number}
                                        </p>
                                    </div>
                                )}
                                {businessDetailsData.tax_id && (
                                    <div>
                                        <p className="text-xs sm:text-sm text-gray-500">Tax ID</p>
                                        <p className="font-medium text-sm sm:text-base truncate">
                                            {businessDetailsData.tax_id}
                                        </p>
                                    </div>
                                )}
                                {businessDetailsData.website && (
                                    <div>
                                        <p className="text-xs sm:text-sm text-gray-500">Website</p>
                                        <p className="font-medium text-sm sm:text-base truncate">
                                            {businessDetailsData.website}
                                        </p>
                                    </div>
                                )}
                                {businessDetailsData.account_number && (
                                    <div>
                                        <p className="text-xs sm:text-sm text-gray-500">Account Number</p>
                                        <p className="font-medium text-sm sm:text-base truncate">
                                            {businessDetailsData.account_number}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Address Information */}
                    <div className="border border-gray-200 rounded-xl p-4 sm:p-6">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center space-x-3">
                                <MapPinIcon className="h-5 w-5 sm:h-6 sm:w-6 text-red-600 flex-shrink-0" />
                                <h3 className="text-base sm:text-lg font-medium text-gray-900">Address Information</h3>
                            </div>
                            <button
                                onClick={() => handleEditSection('address')}
                                className="text-sm text-green-600 hover:text-green-800 hover:underline flex-shrink-0"
                            >
                                Edit
                            </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <div className="sm:col-span-2">
                                <p className="text-xs sm:text-sm text-gray-500">Address</p>
                                <p className="font-medium text-sm sm:text-base">
                                    {addressData.address || 'Not provided'}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs sm:text-sm text-gray-500">City</p>
                                <p className="font-medium text-sm sm:text-base truncate">
                                    {addressData.city || 'Not provided'}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs sm:text-sm text-gray-500">State / Region</p>
                                <p className="font-medium text-sm sm:text-base truncate">
                                    {addressData.state || 'Not provided'}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs sm:text-sm text-gray-500">Country</p>
                                <p className="font-medium text-sm sm:text-base truncate">
                                    {addressData.country || 'Not provided'}
                                </p>
                            </div>
                            {addressData.postal_code && (
                                <div>
                                    <p className="text-xs sm:text-sm text-gray-500">Postal Code</p>
                                    <p className="font-medium text-sm sm:text-base">{addressData.postal_code}</p>
                                </div>
                            )}
                            {addressData.location && (
                                <div>
                                    <p className="text-xs sm:text-sm text-gray-500">Location</p>
                                    <p className="font-medium text-sm sm:text-base">{addressData.location}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Documents Status */}
                    <div className="border border-gray-200 rounded-xl p-4 sm:p-6">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center space-x-3">
                                <DocumentIcon className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 flex-shrink-0" />
                                <h3 className="text-base sm:text-lg font-medium text-gray-900">Documents</h3>
                            </div>
                            <button
                                onClick={() => handleEditSection('documents')}
                                className="text-sm text-green-600 hover:text-green-800 hover:underline flex-shrink-0"
                            >
                                Edit
                            </button>
                        </div>

                        {docsSubmitted ? (
                            <div className="flex flex-wrap items-center gap-3">
                                <ShieldCheckIcon className="h-8 w-8 text-green-500 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-700">Documents submitted for review</p>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        Your documents have been uploaded and are ready for verification
                                    </p>
                                </div>
                                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium whitespace-nowrap">
                                    ✓ Submitted
                                </span>
                            </div>
                        ) : (
                            <div className="flex flex-wrap items-center gap-3">
                                <ExclamationCircleIcon className="h-8 w-8 text-amber-500 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-700">Documents not yet submitted</p>
                                    <p className="text-xs text-red-600 mt-0.5">
                                        Please go back and complete the Documents step before submitting.
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleEditSection('documents')}
                                    className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium hover:bg-amber-200 whitespace-nowrap"
                                >
                                    Complete →
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Terms and Conditions — interactive checkboxes */}
                <div className="mt-4 sm:mt-6 p-4 sm:p-6 bg-yellow-50 rounded-xl border border-yellow-200">
                    <h4 className="font-medium text-yellow-900 mb-3 flex items-center text-sm sm:text-base">
                        <DocumentIcon className="h-5 w-5 mr-2 flex-shrink-0" />
                        Terms &amp; Conditions
                    </h4>
                    <ul className="space-y-3">
                        {TERMS.map(term => (
                            <li key={term.id}>
                                <label
                                    htmlFor={term.id}
                                    className="flex items-start gap-3 cursor-pointer group"
                                >
                                    <input
                                        type="checkbox"
                                        id={term.id}
                                        checked={termsChecked[term.id]}
                                        onChange={() => toggleTerm(term.id)}
                                        className="mt-0.5 h-4 w-4 flex-shrink-0 rounded border-yellow-400 text-green-600 focus:ring-green-500 cursor-pointer"
                                    />
                                    <span className="text-sm text-yellow-800 group-hover:text-yellow-900 leading-snug">
                                        {term.label}
                                    </span>
                                </label>
                            </li>
                        ))}
                    </ul>

                    {/* Hint shown when not all terms are accepted yet */}
                    {!allTermsAccepted && (
                        <p className="mt-3 text-xs text-yellow-700 flex items-center gap-1.5">
                            <ExclamationCircleIcon className="h-4 w-4 flex-shrink-0" />
                            You must accept all three items to submit your application.
                        </p>
                    )}
                </div>

                {/* What Happens Next */}
                <div className="mt-4 sm:mt-6 p-4 sm:p-6 bg-blue-50 rounded-xl border border-blue-200">
                    <h4 className="font-medium text-blue-900 mb-3 flex items-center text-sm sm:text-base">
                        <ClockIcon className="h-5 w-5 mr-2 flex-shrink-0" />
                        What Happens Next?
                    </h4>
                    <ul className="space-y-2 text-sm text-blue-700">
                        {[
                            'Your store profile will be submitted for review.',
                            'Verification typically takes 1–3 business days.',
                            'You will receive an email notification when your store is approved.',
                            'Once approved, you can start listing and selling products.',
                        ].map(text => (
                            <li key={text} className="flex items-start gap-3">
                                <div className="h-2 w-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                                <span>{text}</span>
                            </li>
                        ))}
                    </ul>
                </div>

            </div>
        </OnboardingLayout>
    );
};

export default ReviewSubmit;