// pages/Seller/AddressInfo.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
    MapPinIcon,
    GlobeAltIcon,
    InformationCircleIcon,
    ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import OnboardingLayout from '../../components/OnboardingLayout';
import { useOnboardingState } from '../../hooks/useOnboardingState';

const AddressInfo = () => {
    const navigate = useNavigate();
    const { formData, saveStep, isLoading } = useOnboardingState();
    const [error, setError] = useState('');

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        trigger
    } = useForm({
        defaultValues: formData.address || {
            address: '',
            city: '',
            state: '',
            country: 'Myanmar',
            postal_code: '',
            location: ''
        }
    });

    const countries = [
        'Myanmar'
    ];

    const myanmarStates = [
        'Yangon Region', 'Mandalay Region', 'Sagaing Region', 'Tanintharyi Region',
        'Bago Region', 'Magway Region', 'Ayeyarwady Region', 'Kachin State',
        'Kayah State', 'Kayin State', 'Chin State', 'Mon State',
        'Rakhine State', 'Shan State', 'Naypyidaw Union Territory'
    ];

    const onSubmit = async (data) => {
        setError('');
        const result = await saveStep('address', data);
        
        if (result.success) {
            navigate(`/seller/onboarding/${result.nextStep}`);
        } else {
            setError(result.message || 'Failed to save address information');
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
            title="Address Information"
            description="Where is your business located?"
            onBack={() => navigate('/seller/onboarding/business-details')}
            onNext={handleContinue}
            nextLabel="Continue to Documents"
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
                    {/* Address */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Full Address *
                        </label>
                        <textarea
                            rows={3}
                            className={`mt-1 block w-full px-4 py-3 border ${
                                errors.address ? "border-red-300" : "border-gray-300"
                            } rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500`}
                            placeholder="Building number, street name, ward, township"
                            {...register("address", {
                                required: "Address is required",
                                minLength: {
                                    value: 10,
                                    message: "Please provide a detailed address"
                                }
                            })}
                        />
                        {errors.address && (
                            <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                        )}
                        <p className="mt-1 text-xs text-gray-500">
                            Include building number, street name, ward, and township
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* City */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                City/Township *
                            </label>
                            <input
                                type="text"
                                className={`mt-1 block w-full px-4 py-3 border ${
                                    errors.city ? "border-red-300" : "border-gray-300"
                                } rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500`}
                                placeholder="Enter your city or township"
                                {...register("city", {
                                    required: "City/Township is required"
                                })}
                            />
                            {errors.city && (
                                <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
                            )}
                        </div>

                        {/* State/Region */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                State/Region *
                            </label>
                            <select
                                className={`mt-1 block w-full px-4 py-3 border ${
                                    errors.state ? "border-red-300" : "border-gray-300"
                                } rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500`}
                                {...register("state", {
                                    required: "State/Region is required"
                                })}
                            >
                                <option value="">Select State/Region</option>
                                {myanmarStates.map((state) => (
                                    <option key={state} value={state}>{state}</option>
                                ))}
                            </select>
                            {errors.state && (
                                <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Country */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Country *
                            </label>
                            <div className="relative">
                                <GlobeAltIcon className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                                <select
                                    className={`mt-1 block w-full pl-11 pr-4 py-3 border ${
                                        errors.country ? "border-red-300" : "border-gray-300"
                                    } rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500`}
                                    {...register("country", {
                                        required: "Country is required"
                                    })}
                                >
                                    {countries.map((country) => (
                                        <option key={country} value={country}>{country}</option>
                                    ))}
                                </select>
                            </div>
                            {errors.country && (
                                <p className="mt-1 text-sm text-red-600">{errors.country.message}</p>
                            )}
                        </div>

                        {/* Postal Code */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Postal Code (Optional)
                            </label>
                            <input
                                type="text"
                                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                placeholder="Postal code"
                                {...register("postal_code")}
                            />
                        </div>
                    </div>

                    {/* Location/Map (Optional) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Location Pin (Optional)
                        </label>
                        <input
                            type="text"
                            className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            placeholder="Google Maps link or coordinates"
                            {...register("location")}
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            Helps customers find your physical location. You can add this later.
                        </p>
                    </div>
                </div>

                {/* Information Card */}
                <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="flex items-start">
                        <InformationCircleIcon className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                        <div>
                            <p className="text-sm text-blue-700">
                                <span className="font-medium">Next Step:</span> You'll need to upload documents for verification.
                            </p>
                            <p className="text-xs text-blue-600 mt-1">
                                Required documents depend on your business type selected earlier.
                            </p>
                        </div>
                    </div>
                </div>
            </form>
        </OnboardingLayout>
    );
};

export default AddressInfo;