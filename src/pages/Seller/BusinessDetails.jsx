// pages/Seller/BusinessDetails.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
    DocumentTextIcon,
    BuildingOfficeIcon,
    CreditCardIcon,
    GlobeAltIcon,
    InformationCircleIcon,
    ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import OnboardingLayout from '../../components/OnboardingLayout';
import { useOnboardingState } from '../../hooks/useOnboardingState';

const BusinessDetails = () => {
    const navigate = useNavigate();
    const { formData, saveStep, isLoading, businessTypeInfo } = useOnboardingState();
    const [error, setError] = useState('');
    const [isIndividual, setIsIndividual] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        trigger
    } = useForm({
        defaultValues: formData.business_details || {
            business_registration_number: '',
            tax_id: '',
            website: '',
            account_number: '',
            social_facebook: '',
            social_instagram: '',
            social_twitter: '',
            social_linkedin: ''
        }
    });

    useEffect(() => {
        if (businessTypeInfo) {
            setIsIndividual(businessTypeInfo.is_individual || false);
        }
    }, [businessTypeInfo]);

    const onSubmit = async (data) => {
        setError('');
        
        // Validate required fields for non-individual businesses
        if (!isIndividual) {
            if (!data.business_registration_number?.trim()) {
                setError('Business registration number is required');
                return;
            }
            if (!data.tax_id?.trim()) {
                setError('Tax ID is required');
                return;
            }
        }

        const result = await saveStep('business-details', data);
        
        if (result.success) {
            navigate(`/seller/onboarding/${result.nextStep}`);
        } else {
            setError(result.message || 'Failed to save business details');
        }
    };

    const handleContinue = async () => {
        const isValid = await trigger();
        if (isValid) {
            await onSubmit(watch());
        }
    };

    return (
        <OnboardingLayout
            title="Business Details"
            description={isIndividual ? "Add your business information" : "Enter your company registration details"}
            onBack={() => navigate('/seller/onboarding/store-basic')}
            onNext={handleContinue}
            nextLabel="Continue to Address"
            nextDisabled={isLoading}
            loading={isLoading}
        >
            <form onSubmit={handleSubmit(onSubmit)} className="p-6">
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
                        <div className="flex items-center">
                            <ExclamationCircleIcon className="h-5 w-5 text-red-500 mr-2" />
                            <p className="text-red-700">{error}</p>
                        </div>
                    </div>
                )}

                <div className="space-y-6">
                    {/* Business Registration Details - Only for non-individuals */}
                    {!isIndividual && (
                        <div className="border-b border-gray-200 pb-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                <BuildingOfficeIcon className="h-5 w-5 mr-2 text-blue-600" />
                                Business Registration
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Business Registration Number *
                                    </label>
                                    <input
                                        type="text"
                                        className={`mt-1 block w-full px-4 py-3 border ${
                                            errors.business_registration_number ? "border-red-300" : "border-gray-300"
                                        } rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500`}
                                        placeholder="Enter your business registration number"
                                        {...register("business_registration_number", {
                                            required: !isIndividual ? "Business registration number is required" : false
                                        })}
                                    />
                                    {errors.business_registration_number && (
                                        <p className="mt-1 text-sm text-red-600">{errors.business_registration_number.message}</p>
                                    )}
                                    <p className="mt-1 text-xs text-gray-500">
                                        As shown on your business registration certificate
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Tax Identification Number *
                                    </label>
                                    <input
                                        type="text"
                                        className={`mt-1 block w-full px-4 py-3 border ${
                                            errors.tax_id ? "border-red-300" : "border-gray-300"
                                        } rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500`}
                                        placeholder="Enter your tax ID"
                                        {...register("tax_id", {
                                            required: !isIndividual ? "Tax ID is required" : false
                                        })}
                                    />
                                    {errors.tax_id && (
                                        <p className="mt-1 text-sm text-red-600">{errors.tax_id.message}</p>
                                    )}
                                    <p className="mt-1 text-xs text-gray-500">
                                        Your official tax identification number
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Financial Information */}
                    <div className="border-b border-gray-200 pb-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                            <CreditCardIcon className="h-5 w-5 mr-2 text-purple-600" />
                            Financial Information (Optional)
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Bank Account Number
                                </label>
                                <input
                                    type="text"
                                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                    placeholder="Enter your bank account number"
                                    {...register("account_number")}
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    For receiving payments from sales (can be added later)
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Online Presence */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                            <GlobeAltIcon className="h-5 w-5 mr-2 text-indigo-600" />
                            Online Presence (Optional)
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Website
                                </label>
                                <div className="mt-1 flex rounded-xl shadow-sm">
                                    <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                                        https://
                                    </span>
                                    <input
                                        type="text"
                                        className="flex-1 min-w-0 block w-full px-3 py-3 rounded-none rounded-r-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                        placeholder="yourstore.com"
                                        {...register("website")}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Social Media Links
                                </label>
                                <div className="space-y-3">
                                    <div className="flex items-center">
                                        <span className="inline-flex items-center px-3 py-2 rounded-l-xl border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                                            facebook.com/
                                        </span>
                                        <input
                                            type="text"
                                            className="flex-1 rounded-none rounded-r-xl border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                            placeholder="yourpage"
                                            {...register("social_facebook")}
                                        />
                                    </div>
                                    <div className="flex items-center">
                                        <span className="inline-flex items-center px-3 py-2 rounded-l-xl border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                                            instagram.com/
                                        </span>
                                        <input
                                            type="text"
                                            className="flex-1 rounded-none rounded-r-xl border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                            placeholder="yourprofile"
                                            {...register("social_instagram")}
                                        />
                                    </div>
                                    <div className="flex items-center">
                                        <span className="inline-flex items-center px-3 py-2 rounded-l-xl border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                                            twitter.com/
                                        </span>
                                        <input
                                            type="text"
                                            className="flex-1 rounded-none rounded-r-xl border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                            placeholder="yourprofile"
                                            {...register("social_twitter")}
                                        />
                                    </div>
                                    <div className="flex items-center">
                                        <span className="inline-flex items-center px-3 py-2 rounded-l-xl border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                                            linkedin.com/in/
                                        </span>
                                        <input
                                            type="text"
                                            className="flex-1 rounded-none rounded-r-xl border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                            placeholder="yourprofile"
                                            {...register("social_linkedin")}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Information Card */}
                <div className="mt-6 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                    <div className="flex items-start">
                        <InformationCircleIcon className="h-5 w-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                        <div>
                            <p className="text-sm text-yellow-800">
                                <span className="font-medium">Next Step:</span> You'll need to provide your business address next.
                            </p>
                            <p className="text-xs text-yellow-700 mt-1">
                                Address information is required for customer deliveries and business verification.
                            </p>
                        </div>
                    </div>
                </div>
            </form>
        </OnboardingLayout>
    );
};

export default BusinessDetails;