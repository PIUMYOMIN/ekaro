import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
    BuildingStorefrontIcon,
    PhotoIcon,
    InformationCircleIcon,
    ChevronDownIcon,
    UserIcon,
    BuildingOfficeIcon,
    TruckIcon,
    UsersIcon,
    ExclamationCircleIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';
import OnboardingLayout from '../../components/OnboardingLayout';
import { useOnboardingState } from '../../hooks/useOnboardingState';
import api from '../../utils/api';

const StoreBasicInfo = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { formData, saveStep, isLoading, businessTypeInfo } = useOnboardingState();
    const [businessTypes, setBusinessTypes] = useState([]);
    const [storeLogoPreview, setStoreLogoPreview] = useState('');
    const [storeBannerPreview, setStoreBannerPreview] = useState('');
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [uploadingBanner, setUploadingBanner] = useState(false);
    const [error, setError] = useState('');
    const [logoPath, setLogoPath] = useState('');
    const [bannerPath, setBannerPath] = useState('');
    const [logoUploaded, setLogoUploaded] = useState(false);
    const [bannerUploaded, setBannerUploaded] = useState(false);

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
        // Load existing logo/banner if available
        if (formData.store_logo) {
            setStoreLogoPreview(formData.store_logo);
            setLogoUploaded(true);
        }
        if (formData.store_banner) {
            setStoreBannerPreview(formData.store_banner);
            setBannerUploaded(true);
        }
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
        setError('');
        
        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await api.post('/seller/onboarding/storeLogo', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            if (response.data.success) {
                const { url, path } = response.data.data;
                setStoreLogoPreview(url);
                setLogoPath(path);
                setLogoUploaded(true);
                
                // Store the URL in the form field
                setValue('store_logo', url, { shouldValidate: true });
                
                return url;
            } else {
                setError(response.data.message || 'Failed to upload logo');
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message || 'Failed to upload logo';
            setError(errorMsg);
            console.error('Logo upload error:', error);
        } finally {
            setUploadingLogo(false);
        }
    };

    const handleBannerUpload = async (file) => {
        if (!file) return;
        
        setUploadingBanner(true);
        setError('');
        
        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await api.post('/seller/onboarding/storeBanner', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            if (response.data.success) {
                const { url, path } = response.data.data;
                setStoreBannerPreview(url);
                setBannerPath(path);
                setBannerUploaded(true);
                
                // Store the URL in the form field
                setValue('store_banner', url, { shouldValidate: true });
                
                return url;
            } else {
                setError(response.data.message || 'Failed to upload banner');
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message || 'Failed to upload banner';
            setError(errorMsg);
            console.error('Banner upload error:', error);
        } finally {
            setUploadingBanner(false);
        }
    };

    const handleRemoveLogo = () => {
        setStoreLogoPreview('');
        setLogoPath('');
        setLogoUploaded(false);
        setValue('store_logo', '', { shouldValidate: true });
    };

    const handleRemoveBanner = () => {
        setStoreBannerPreview('');
        setBannerPath('');
        setBannerUploaded(false);
        setValue('store_banner', '', { shouldValidate: true });
    };

    const onSubmit = async (data) => {
        setError('');
        
        // Validate required fields
        if (!data.store_name?.trim()) {
            setError(t('Store name is required'));
            return;
        }

        if (!data.business_type_slug) {
            setError(t('Please select a business type'));
            return;
        }

        if (!data.contact_email?.trim()) {
            setError(t('Contact email is required'));
            return;
        }

        if (!data.contact_phone?.trim()) {
            setError(t('Contact phone is required'));
            return;
        }

        // Prepare data with logo/banner URLs
        const submitData = {
            ...data,
            store_logo: storeLogoPreview, // Pass the URL
            store_banner: storeBannerPreview // Pass the URL
        };

        const result = await saveStep('store-basic', submitData);
        
        if (result.success) {
            // Check next step from response
            const nextStep = result.nextStep || 'business-details';
            navigate(`/seller/onboarding/${nextStep}`);
        } else {
            // Handle backend errors
            if (result.errors) {
                const errorMessages = Object.values(result.errors).flat().join(', ');
                setError(errorMessages);
            } else {
                setError(result.message || 'Failed to save store information');
            }
        }
    };

    const handleContinue = async () => {
        const isValid = await trigger();
        if (isValid) {
            const formValues = watch();
            await onSubmit(formValues);
        } else {
            // Scroll to first error
            const firstError = Object.keys(errors)[0];
            if (firstError) {
                const element = document.getElementsByName(firstError)[0];
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    element.focus();
                }
            }
        }
    };

    return (
        <OnboardingLayout
            title={t("Store Basic Information")}
            description={t("Let's start by setting up your store's basic information")}
            onBack={() => navigate('/seller')}
            onNext={handleContinue}
            nextLabel={t("Continue to Business Details")}
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
                                Store Logo {!logoUploaded && '*'}
                            </label>
                            <div className="space-y-3">
                                <div className="relative">
                                    <div className={`w-32 h-32 rounded-2xl border-2 ${logoUploaded ? 'border-green-300' : 'border-dashed border-gray-300'} flex items-center justify-center ${logoUploaded ? 'bg-green-50' : 'bg-gray-50'} overflow-hidden mx-auto`}>
                                        {storeLogoPreview ? (
                                            <>
                                                <img
                                                    src={storeLogoPreview}
                                                    alt="Store logo preview"
                                                    className="w-full h-full object-cover"
                                                />
                                                {logoUploaded && (
                                                    <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1">
                                                        <CheckCircleIcon className="h-4 w-4 text-white" />
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <BuildingStorefrontIcon className="h-8 w-8 text-gray-400" />
                                        )}
                                    </div>
                                </div>
                                <div className="flex flex-col space-y-2">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleLogoUpload(e.target.files[0])}
                                        className="hidden"
                                        id="logo-upload"
                                        disabled={uploadingLogo}
                                    />
                                    <div className="flex space-x-2">
                                        <label
                                            htmlFor="logo-upload"
                                            className={`flex-1 text-center px-4 py-2 border rounded-lg cursor-pointer transition-colors ${
                                                uploadingLogo 
                                                    ? 'bg-blue-50 border-blue-300 text-blue-700' 
                                                    : 'border-gray-300 hover:bg-gray-50 text-gray-700'
                                            }`}
                                        >
                                            {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
                                        </label>
                                        {logoUploaded && (
                                            <button
                                                type="button"
                                                onClick={handleRemoveLogo}
                                                className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 text-center">
                                        Recommended: 400x400px, Max 2MB (JPG, PNG, SVG)
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Banner Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                {t("Store Banner")} {t("(Optional)")}
                            </label>
                            <div className="space-y-3">
                                <div className="relative">
                                    <div className={`w-full h-32 rounded-2xl border-2 ${bannerUploaded ? 'border-green-300' : 'border-dashed border-gray-300'} flex items-center justify-center ${bannerUploaded ? 'bg-green-50' : 'bg-gray-50'} overflow-hidden`}>
                                        {storeBannerPreview ? (
                                            <>
                                                <img
                                                    src={storeBannerPreview}
                                                    alt="Store banner preview"
                                                    className="w-full h-full object-cover"
                                                />
                                                {bannerUploaded && (
                                                    <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1">
                                                        <CheckCircleIcon className="h-4 w-4 text-white" />
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <PhotoIcon className="h-8 w-8 text-gray-400" />
                                        )}
                                    </div>
                                </div>
                                <div className="flex flex-col space-y-2">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleBannerUpload(e.target.files[0])}
                                        className="hidden"
                                        id="banner-upload"
                                        disabled={uploadingBanner}
                                    />
                                    <div className="flex space-x-2">
                                        <label
                                            htmlFor="banner-upload"
                                            className={`flex-1 text-center px-4 py-2 border rounded-lg cursor-pointer transition-colors ${
                                                uploadingBanner 
                                                    ? 'bg-blue-50 border-blue-300 text-blue-700' 
                                                    : 'border-gray-300 hover:bg-gray-50 text-gray-700'
                                            }`}
                                        >
                                            {uploadingBanner ? 'Uploading...' : 'Upload Banner'}
                                        </label>
                                        {bannerUploaded && (
                                            <button
                                                type="button"
                                                onClick={handleRemoveBanner}
                                                className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 text-center">
                                        Recommended: 1200x300px, Max 5MB (JPG, PNG)
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Hidden fields for logo/banner URLs */}
                    <input type="hidden" {...register('store_logo')} />
                    <input type="hidden" {...register('store_banner')} />

                    {/* Store Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            {t("Store Name")} *
                        </label>
                        <input
                            type="text"
                            name="store_name"
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
                        <p className="mt-1 text-xs text-gray-500">
                            {t("This will appear as your store's public name")}
                        </p>
                    </div>

                    {/* Business Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            {t("Business Type *")}
                        </label>
                        <div className="mt-1 relative">
                            <select
                                name="business_type_slug"
                                className={`block w-full px-4 py-3 border ${
                                    errors.business_type_slug ? "border-red-300" : "border-gray-300"
                                } rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none bg-white`}
                                {...register("business_type_slug", {
                                    required: "Business type is required"
                                })}
                            >
                                <option value="">Select business type</option>
                                {businessTypes.map((type) => (
                                    <option key={type.slug_en} value={type.slug_en}>
                                        {type.name_en}
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
                            name="contact_email"
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
                        <p className="mt-1 text-xs text-gray-500">
                            This email will be used for store-related communications
                        </p>
                    </div>

                    {/* Contact Phone */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Contact Phone *
                        </label>
                        <input
                            type="tel"
                            name="contact_phone"
                            className={`mt-1 block w-full px-4 py-3 border ${
                                errors.contact_phone ? "border-red-300" : "border-gray-300"
                            } rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500`}
                            placeholder="+95 123 456 789"
                            {...register("contact_phone", {
                                required: "Contact phone is required",
                                pattern: {
                                    value: /^\+?[0-9\s\-\(\)]+$/,
                                    message: "Invalid phone number"
                                }
                            })}
                        />
                        {errors.contact_phone && (
                            <p className="mt-1 text-sm text-red-600">{errors.contact_phone.message}</p>
                        )}
                        <p className="mt-1 text-xs text-gray-500">
                            Include country code (e.g., +95 for Myanmar)
                        </p>
                    </div>

                    {/* Store Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Store Description (Optional)
                        </label>
                        <textarea
                            rows={3}
                            name="description"
                            className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            placeholder="Describe your store and what you offer..."
                            {...register("description", {
                                maxLength: {
                                    value: 2000,
                                    message: "Description must be less than 2000 characters"
                                }
                            })}
                        />
                        {errors.description && (
                            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                        )}
                        <p className="mt-1 text-xs text-gray-500">
                            This will be displayed on your store page. Max 2000 characters.
                        </p>
                    </div>
                </div>

                {/* Business Type Info */}
                {selectedBusinessType && (
                    <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                        <div className="flex items-start">
                            <div className={`p-2 rounded-lg bg-blue-100 mr-3`}>
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
                                        )) || (
                                            <li className="text-blue-600">No specific document requirements</li>
                                        )}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Form Status */}
                <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-900">Form Status</p>
                            <div className="flex items-center space-x-4 mt-2">
                                <div className="flex items-center">
                                    <div className={`w-3 h-3 rounded-full mr-2 ${logoUploaded ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                                    <span className="text-xs text-gray-600">Logo: {logoUploaded ? 'Uploaded' : 'Required'}</span>
                                </div>
                                <div className="flex items-center">
                                    <div className={`w-3 h-3 rounded-full mr-2 ${bannerUploaded ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                    <span className="text-xs text-gray-600">Banner: {bannerUploaded ? 'Uploaded' : 'Optional'}</span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-500">Required fields are marked with *</p>
                        </div>
                    </div>
                </div>
            </form>
        </OnboardingLayout>
    );
};

export default StoreBasicInfo;