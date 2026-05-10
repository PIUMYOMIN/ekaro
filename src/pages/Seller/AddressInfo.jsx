// pages/Seller/AddressInfo.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
    MapPinIcon,
    GlobeAltIcon,
    InformationCircleIcon,
    ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import OnboardingLayout from '../../components/OnboardingLayout';
import { useOnboardingState } from '../../hooks/useOnboardingState';
import myanmarLocations from '../../data/myanmar-locations-eng.json';

const AddressInfo = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { formData, saveStep, isLoading } = useOnboardingState();
    const [error, setError] = useState('');

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        setValue,
        trigger
    } = useForm({
        defaultValues: formData.address || {
            address: '',
            city: '',
            township: '',
            state: '',
            country: 'Myanmar',
            postal_code: '',
            location: ''
        }
    });

    const countries = ['Myanmar'];

    const [cities, setCities] = useState([]);
    const [townships, setTownships] = useState([]);

    const handleStateChange = (event) => {
        const selectedState = event.target.value;
        const stateData = myanmarLocations.locations.find(
            (location) => location.region_state === selectedState
        );
        setCities(stateData ? stateData.cities.map((city) => city.city) : []);
        setTownships([]);
        setValue('city', '');
        setValue('township', '');
    };

    const handleCityChange = (event) => {
        const selectedCity = event.target.value;
        const cityData = myanmarLocations.locations
            .flatMap((location) => location.cities)
            .find((city) => city.city === selectedCity);
        setTownships(cityData ? cityData.townships : []);
        setValue('township', '');
    };

    const onSubmit = async (data) => {
        setError('');
        const result = await saveStep('address', data);

        if (result.success) {
            navigate(`/seller/onboarding/${result.nextStep}`);
        } else {
            setError(result.message || t('seller_onboarding.addressInfo.error_save'));
        }
    };

    const handleContinue = async () => {
        const isValid = await trigger();
        if (isValid) {
            await onSubmit(watch());
        }
    };

    const inputClass = (hasError) =>
        `mt-1 block w-full px-4 py-3 border ${
            hasError ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
        } rounded-xl shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500`;

    return (
        <OnboardingLayout
            title={t("seller_onboarding.addressInfo.title")}
            description={t("seller_onboarding.addressInfo.subtitle")}
            onBack={() => navigate('/seller/onboarding/business-details')}
            onNext={handleContinue}
            nextLabel={t("seller_onboarding.addressInfo.continue_to_delivery_zones")}
            nextDisabled={isLoading}
            loading={isLoading}
        >
            <form onSubmit={handleSubmit(onSubmit)} className="p-6">
                {error && (
                    <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                        <div className="flex items-center">
                            <ExclamationCircleIcon className="h-5 w-5 text-red-500 mr-2" />
                            <p className="text-red-700 dark:text-red-400">{error}</p>
                        </div>
                    </div>
                )}

                <div className="space-y-6">
                    {/* Address */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            {t("seller_onboarding.addressInfo.full_address")} *
                        </label>
                        <textarea
                            rows={3}
                            className={inputClass(errors.address)}
                            placeholder={t("seller_onboarding.addressInfo.address_hint")}
                            {...register("address", {
                                required: t("seller_onboarding.addressInfo.error_address"),
                                minLength: {
                                    value: 10,
                                    message: t("seller_onboarding.addressInfo.error_address_detail")
                                }
                            })}
                        />
                        {errors.address && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.address.message}</p>
                        )}
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            {t("seller_onboarding.addressInfo.address_hint")}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t("seller_onboarding.addressInfo.stateRegion.label")} *
                            </label>
                            <select
                                className={inputClass(errors.state)}
                                {...register("state", {
                                    required: t("seller_onboarding.addressInfo.stateRegion.error"),
                                    onChange: handleStateChange,
                                })}
                            >
                                <option value="">{t("seller_onboarding.addressInfo.select_state")}</option>
                                {myanmarLocations.locations.map((location) => (
                                    <option key={location.region_state} value={location.region_state}>
                                        {location.region_state}
                                    </option>
                                ))}
                            </select>
                            {errors.state && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.state.message}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t("seller_onboarding.addressInfo.city.label")} *
                            </label>
                            <select
                                className={inputClass(errors.city)}
                                {...register("city", {
                                    required: t("seller_onboarding.addressInfo.error_city"),
                                    onChange: handleCityChange,
                                })}
                                disabled={cities.length === 0}
                            >
                                <option value="">{t("seller_onboarding.addressInfo.select_city")}</option>
                                {cities.map((city) => (
                                    <option key={city} value={city}>
                                        {city}
                                    </option>
                                ))}
                            </select>
                            {errors.city && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.city.message}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t("seller_onboarding.addressInfo.township.label")} *
                            </label>
                            <select
                                className={inputClass(errors.township)}
                                {...register("township", {
                                    required: t("seller_onboarding.addressInfo.error_township")
                                })}
                                disabled={townships.length === 0}
                            >
                                <option value="">{t("seller_onboarding.addressInfo.select_township")}</option>
                                {townships.map((township) => (
                                    <option key={township} value={township}>
                                        {township}
                                    </option>
                                ))}
                            </select>
                            {errors.township && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.township.message}</p>
                            )}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t("seller_onboarding.addressInfo.country.label")} *
                            </label>
                            <div className="relative">
                                <GlobeAltIcon className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 dark:text-gray-500" />
                                <select
                                    className={`mt-1 block w-full pl-11 pr-4 py-3 border ${
                                        errors.country ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                                    } rounded-xl shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500`}
                                    {...register("country", {
                                        required: t("seller_onboarding.addressInfo.country.error")
                                    })}
                                >
                                    {countries.map((country) => (
                                        <option key={country} value={country}>{country}</option>
                                    ))}
                                </select>
                            </div>
                            {errors.country && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.country.message}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t("seller_onboarding.addressInfo.postalCode.label")} ({t("seller_onboarding.businessDetails.optional")})
                            </label>
                            <input
                                type="text"
                                className={inputClass(false)}
                                placeholder={t("seller_onboarding.addressInfo.postalCode.placeholder")}
                                {...register("postal_code")}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t("seller_onboarding.addressInfo.location_pin")} ({t("seller_onboarding.businessDetails.optional")})
                            </label>
                            <input
                                type="text"
                                className={inputClass(false)}
                                placeholder={t("seller_onboarding.addressInfo.location_placeholder")}
                                {...register("location")}
                            />
                        </div>
                    </div>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {t("seller_onboarding.addressInfo.location_hint")}
                    </p>
                </div>

                {/* Information Card */}
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start">
                        <InformationCircleIcon className="h-5 w-5 text-blue-500 dark:text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
                        <div>
                            <p className="text-sm text-blue-700 dark:text-blue-300">
                                <span className="font-medium">{t("seller_onboarding.addressInfo.info_next")}</span> {t("seller_onboarding.addressInfo.info_delivery_text")}
                            </p>
                            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                {t("seller_onboarding.addressInfo.info_delivery_note")}
                            </p>
                        </div>
                    </div>
                </div>
            </form>
        </OnboardingLayout>
    );
};

export default AddressInfo;
