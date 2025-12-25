// pages/Seller/StoreBasicInfo.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
    BuildingStorefrontIcon,
    PhotoIcon,
    InformationCircleIcon,
    ChevronDownIcon,
    UserIcon,
    BuildingOfficeIcon,
    TruckIcon,
    UsersIcon,
    ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import OnboardingLayout from '../../components/OnboardingLayout';
import { useOnboardingState } from '../../hooks/useOnboardingState';
import api from '../../utils/api';

const StoreBasicInfo = () => {
    const navigate = useNavigate();
    const { formData, saveStep, isLoading, businessTypeInfo } = useOnboardingState();
    const [businessTypes, setBusinessTypes] = useState([]);
    const [storeLogoPreview, setStoreLogoPreview] = useState('');
    const [storeBannerPreview, setStoreBannerPreview] = useState('');
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [uploadingBanner, setUploadingBanner] = useState(false);
    const [error, setError] = useState('');

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        trigger
    } = useForm({
        defaultValues: formData.store_basic || {
            store_name: '',
            business_type_slug: '',
            contact_email: '',
            contact_phone: '',
            description: ''
        }
    });

    const selectedBusinessSlug = watch('business_type_slug');
    const selectedBusinessType = businessTypes.find(bt => bt.slug === selectedBusinessSlug);

    useEffect(() => {
        fetchBusinessTypes();
        if (formData.store_logo) setStoreLogoPreview(formData.store_logo);
        if (formData.store_banner) setStoreBannerPreview(formData.store_banner);
    }, [formData]);

    const fetchBusinessTypes = async () => {
        try {
            const response = await api.get('/business-types');
            if (response.data.success) {
                setBusinessTypes(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch business types:', error);
            setError('Failed to load business types');
        }
    };

    const getBusinessTypeIcon = (iconName) => {
        const icons = {
            'user': <UserIcon className="h-5 w-5" />,
            'building': <BuildingOfficeIcon className="h-5 w-5" />,
            'store': <BuildingOfficeIcon className="h-5 w-5" />,
            'truck': <TruckIcon className="h-5 w-5" />,
            'users': <UsersIcon className="h-5 w-5" />,
            'default': <BuildingOfficeIcon className="h-5 w-5" />
        };
        return icons[iconName] || icons.default;
    };

    const handleLogoUpload = async (file) => {
        if (!file) return;
        
        setUploadingLogo(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await api.post('/products/upload-image', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            if (response.data.success) {
                setStoreLogoPreview(response.data.data.url);
                setValue('store_logo', response.data.data.url, { shouldValidate: true });
                return response.data.data.url;
            }
        } catch (error) {
            setError('Failed to upload logo');
        } finally {
            setUploadingLogo(false);
        }
    };

    const handleBannerUpload = async (file) => {
        if (!file) return;
        
        setUploadingBanner(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await api.post('/products/upload-image', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            if (response.data.success) {
                setStoreBannerPreview(response.data.data.url);
                setValue('store_banner', response.data.data.url, { shouldValidate: true });
                return response.data.data.url;
            }
        } catch (error) {
            setError('Failed to upload banner');
        } finally {
            setUploadingBanner(false);
        }
    };

    const onSubmit = async (data) => {
        setError('');
        
        // Validate required fields
        if (!data.business_type_slug) {
            setError('Please select a business type');
            return;
        }

        const result = await saveStep('store-basic', data);
        
        if (result.success) {
            navigate(`/seller/onboarding/${result.nextStep}`);
        } else {
            setError(result.message || 'Failed to save store information');
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
            title="Store Basic Information"
            description="Let's start by setting up your store's basic information"
            onBack={() => navigate('/seller')}
            onNext={handleContinue}
            nextLabel="Continue to Business Details"
            nextDisabled={isLoading || uploadingLogo || uploadingBanner}
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
                    {/* Store Media Uploads */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Logo Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Store Logo *
                            </label>
                            <div className="space-y-3">
                                <div className="relative">
                                    <div className="w-32 h-32 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden mx-auto">
                                        {storeLogoPreview ? (
                                            <img
                                                src={storeLogoPreview}
                                                alt="Store logo preview"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <BuildingStorefrontIcon className="h-8 w-8 text-gray-400" />
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleLogoUpload(e.target.files[0])}
                                        className="hidden"
                                        id="logo-upload"
                                        disabled={uploadingLogo}
                                    />
                                    <label
                                        htmlFor="logo-upload"
                                        className="block w-full text-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                                    >
                                        {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
                                    </label>
                                    <p className="text-xs text-gray-500 mt-1 text-center">
                                        Recommended: 400x400px, Max 2MB
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Banner Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Store Banner (Optional)
                            </label>
                            <div className="space-y-3">
                                <div className="relative">
                                    <div className="w-full h-32 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden">
                                        {storeBannerPreview ? (
                                            <img
                                                src={storeBannerPreview}
                                                alt="Store banner preview"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <PhotoIcon className="h-8 w-8 text-gray-400" />
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleBannerUpload(e.target.files[0])}
                                        className="hidden"
                                        id="banner-upload"
                                        disabled={uploadingBanner}
                                    />
                                    <label
                                        htmlFor="banner-upload"
                                        className="block w-full text-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                                    >
                                        {uploadingBanner ? 'Uploading...' : 'Upload Banner'}
                                    </label>
                                    <p className="text-xs text-gray-500 mt-1 text-center">
                                        Recommended: 1200x300px, Max 5MB
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Store Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Store Name *
                        </label>
                        <input
                            type="text"
                            className={`mt-1 block w-full px-4 py-3 border ${
                                errors.store_name ? "border-red-300" : "border-gray-300"
                            } rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500`}
                            placeholder="Enter your store name"
                            {...register("store_name", {
                                required: "Store name is required",
                                minLength: {
                                    value: 2,
                                    message: "Store name must be at least 2 characters"
                                }
                            })}
                        />
                        {errors.store_name && (
                            <p className="mt-1 text-sm text-red-600">{errors.store_name.message}</p>
                        )}
                    </div>

                    {/* Business Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Business Type *
                        </label>
                        <div className="mt-1 relative">
                            <select
                                className={`block w-full px-4 py-3 border ${
                                    errors.business_type_slug ? "border-red-300" : "border-gray-300"
                                } rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none bg-white`}
                                {...register("business_type_slug", {
                                    required: "Business type is required"
                                })}
                            >
                                <option value="">Select business type</option>
                                {businessTypes.map((type) => (
                                    <option key={type.slug} value={type.slug}>
                                        {type.name}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                            </div>
                        </div>
                        {errors.business_type_slug && (
                            <p className="mt-1 text-sm text-red-600">{errors.business_type_slug.message}</p>
                        )}
                    </div>

                    {/* Contact Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Contact Email *
                        </label>
                        <input
                            type="email"
                            className={`mt-1 block w-full px-4 py-3 border ${
                                errors.contact_email ? "border-red-300" : "border-gray-300"
                            } rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500`}
                            placeholder="contact@yourstore.com"
                            {...register("contact_email", {
                                required: "Contact email is required",
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: "Invalid email address"
                                }
                            })}
                        />
                        {errors.contact_email && (
                            <p className="mt-1 text-sm text-red-600">{errors.contact_email.message}</p>
                        )}
                    </div>

                    {/* Contact Phone */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Contact Phone *
                        </label>
                        <input
                            type="tel"
                            className={`mt-1 block w-full px-4 py-3 border ${
                                errors.contact_phone ? "border-red-300" : "border-gray-300"
                            } rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500`}
                            placeholder="+95 123 456 789"
                            {...register("contact_phone", {
                                required: "Contact phone is required"
                            })}
                        />
                        {errors.contact_phone && (
                            <p className="mt-1 text-sm text-red-600">{errors.contact_phone.message}</p>
                        )}
                    </div>

                    {/* Store Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Store Description (Optional)
                        </label>
                        <textarea
                            rows={3}
                            className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            placeholder="Describe your store and what you offer..."
                            {...register("description")}
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            This will be displayed on your store page
                        </p>
                    </div>
                </div>

                {/* Business Type Info */}
                {selectedBusinessType && (
                    <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                        <div className="flex items-start">
                            <div className={`p-2 rounded-lg bg-${selectedBusinessType.color}-100 mr-3`}>
                                {getBusinessTypeIcon(selectedBusinessType.icon)}
                            </div>
                            <div className="flex-1">
                                <h4 className="font-medium text-blue-900">{selectedBusinessType.name}</h4>
                                <p className="text-sm text-blue-700 mt-1">{selectedBusinessType.description}</p>
                                <div className="mt-3">
                                    <p className="text-xs font-medium text-blue-800">Document Requirements:</p>
                                    <ul className="mt-1 text-xs text-blue-700 space-y-1">
                                        {selectedBusinessType.document_requirements?.map((req, index) => (
                                            <li key={index} className="flex items-start">
                                                <span className="mr-2">•</span>
                                                <span>{req.label} {req.required ? '(Required)' : '(Optional)'}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </form>
        </OnboardingLayout>
    );
};

export default StoreBasicInfo;