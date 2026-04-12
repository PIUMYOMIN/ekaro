import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useTranslation } from "react-i18next";
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import AuthLayout from './AuthLayout';
import { EnvelopeIcon } from '@heroicons/react/24/outline';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import useSEO from '../../hooks/useSEO';

const Register = () => {
  const { t } = useTranslation();
  const { register: registerUser } = useAuth();
  const [searchParams] = useSearchParams();
  const refCode = searchParams.get('ref') || '';
  const [referrerName, setReferrerName] = React.useState('');
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState('buyer');
  const [agreed, setAgreed] = useState(false);
  const [agreedError, setAgreedError] = useState('');
  const { executeRecaptcha } = useGoogleReCaptcha();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm();

  const normalizeMyanmarPhone = (phone) => {
    let cleanPhone = phone.replace(/\D/g, '');

    if (cleanPhone.startsWith('09')) {
      return '+95' + cleanPhone.substring(1);
    } else if (cleanPhone.startsWith('9') && !cleanPhone.startsWith('95')) {
      return '+95' + cleanPhone;
    } else if (cleanPhone.startsWith('959')) {
      return '+' + cleanPhone;
    } else if (cleanPhone.startsWith('95') && !cleanPhone.startsWith('959')) {
      return '+9' + cleanPhone;
    } else if (phone.startsWith('+959')) {
      return phone;
    } else if (phone.startsWith('+95')) {
      return '+9' + phone.substring(1);
    } else {
      return phone.startsWith('+') ? phone : '+' + phone;
    }
  };

  const validateMyanmarPhone = (phone) => {
    if (!phone) return t('validation.required');

    const cleanPhone = phone.replace(/\D/g, '');

    // Check length: 7-9 digits after prefix
    const digitsOnly = cleanPhone.replace(/^(\+?959|09|9)/, '');
    if (digitsOnly.length < 7 || digitsOnly.length > 9) {
      return t('validation.invalidPhone');
    }

    const validPrefixes = ['09', '9', '959', '+959', '+95'];
    const hasValidPrefix = validPrefixes.some(prefix =>
      phone.startsWith(prefix)
    );

    if (!hasValidPrefix) {
      return t('validation.invalidPhone');
    }

    return true;
  };

  // Validate ref code from URL on mount
  React.useEffect(() => {
    if (!refCode) return;
    api.post('/referral/validate', { ref_code: refCode })
      .then(r => { if (r.data.success) setReferrerName(r.data.data.referrer_name); })
      .catch(() => {});
  }, [refCode]);

    const onSubmit = async (data) => {
    if (!agreed) {
      setAgreedError('You must agree to the Terms & Conditions and Privacy Policy.');
      return;
    }
    setAgreedError('');
    if (!executeRecaptcha) {
      setError('reCAPTCHA not ready');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const token = await executeRecaptcha('register');
      const normalizedPhone = normalizeMyanmarPhone(data.phone);

      const result = await registerUser({
        name: data.name,
        phone: normalizedPhone,
        email: data.email,
        password: data.password,
        password_confirmation: data.confirmPassword,
        type: userType,
        address: data.address,
        city: data.city,
        state: data.state,
        recaptcha_token: token,
        ...(refCode && { ref_code: refCode }),
      });

      if (result.success) {
        // Navigate to the dedicated verification page — user must verify before continuing
        navigate('/verify-email');
      } else {
        setError(result.message || t('register.error'));
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(t('register.error'));
    } finally {
      setIsLoading(false);
    }
  };


  const SeoComponent = useSEO({
    title: t('register.title'),
    description: t('register.subtitle'),
    noindex: true,
  });

  return (
    <>
      {SeoComponent}
              <AuthLayout
          title={t('register.title')}
          subtitle={t('register.subtitle')}
        >
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Referral banner */}
          {referrerName && (
            <div className="mt-4 flex items-center gap-2 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-xl px-4 py-3 text-sm">
              <span className="text-green-600">🎁</span>
              <span className="text-green-800 dark:text-green-200">
                You were referred by <strong>{referrerName}</strong>. Your account will be linked to their referral.
              </span>
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-slate-300">
                  {t('register.name.label')}
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  className={`appearance-none block w-full px-3 py-3 border ${errors.name ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-slate-600'} rounded-md shadow-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`}
                  placeholder={t('register.name.placeholder')}
                  {...register('name', {
                    required: t('validation.required'),
                    minLength: {
                      value: 2,
                      message: t('validation.minLength', { count: 2 })
                    }
                  })}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-slate-300">
                  {t('register.phone.label')}
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <div className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-500 dark:text-slate-300 text-sm">
                    <span className="mr-2 text-base">🇲🇲</span>
                    +95
                  </div>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    className={`flex-1 min-w-0 block w-full px-3 py-3 rounded-none rounded-r-md border ${errors.phone ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-slate-600'} shadow-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`}
                    placeholder="912345678"
                    {...register('phone', {
                      required: t('validation.required'),
                      validate: validateMyanmarPhone
                    })}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-slate-500">
                  {t('register.phone.examples') || 'Examples: 912345678, 0912345678, +95912345678'}
                </p>
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-slate-300">
                  {t('register.email.label')}
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className={`appearance-none block w-full px-3 py-3 border ${errors.email ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-slate-600'} rounded-md shadow-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`}
                  placeholder={t('register.email.placeholder')}
                  {...register('email', {
                    required: t('validation.required'),
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: t('validation.invalidEmail')
                    }
                  })}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  {t('register.accountType.label')}
                </label>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setUserType('buyer')}
                    className={`flex-1 py-3 px-4 border rounded-md text-sm font-medium transition-colors ${userType === 'buyer'
                        ? 'border-green-500 bg-green-50 text-green-700 shadow-sm'
                        : 'border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:border-gray-400 dark:hover:border-slate-400'
                      }`}
                  >
                    {t('register.accountType.buyer')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserType('seller')}
                    className={`flex-1 py-3 px-4 border rounded-md text-sm font-medium transition-colors ${userType === 'seller'
                        ? 'border-green-500 bg-green-50 text-green-700 shadow-sm'
                        : 'border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:border-gray-400 dark:hover:border-slate-400'
                      }`}
                  >
                    {t('register.accountType.seller')}
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-slate-500">
                  {userType === 'buyer'
                    ? t('register.accountType.buyerDescription')
                    : t('register.accountType.sellerDescription')
                  }
                </p>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-slate-300">
                  {t('register.password.label')}
                </label>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    className={`appearance-none block w-full px-3 py-3 pr-10 border ${errors.password ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-slate-600'} rounded-md shadow-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`}
                    placeholder={t('register.password.placeholder')}
                    {...register('password', {
                      required: t('validation.required'),
                      minLength: {
                        value: 6,
                        message: t('validation.minLength', { count: 6 })
                      }
                    })}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 focus:outline-none transition-colors"
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5" aria-hidden="true" />
                      ) : (
                        <EyeIcon className="h-5 w-5" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-slate-300">
                  {t('register.confirmPassword.label')}
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  className={`appearance-none block w-full px-3 py-3 border ${errors.confirmPassword ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-slate-600'} rounded-md shadow-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`}
                  placeholder={t('register.confirmPassword.placeholder')}
                  {...register('confirmPassword', {
                    required: t('validation.required'),
                    validate: value =>
                      value === watch('password') || t('validation.passwordMismatch')
                  })}
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            {/* ── Terms & Conditions ── */}
            <div className="space-y-1.5">
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex-shrink-0 mt-0.5">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={e => { setAgreed(e.target.checked); if (e.target.checked) setAgreedError(''); }}
                    className="sr-only"
                  />
                  <div className={`h-5 w-5 rounded border-2 flex items-center justify-center transition-colors ${
                    agreed ? 'bg-green-600 border-green-600' : agreedError ? 'border-red-400' : 'border-gray-300 group-hover:border-green-400'
                  }`}>
                    {agreed && (
                      <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2 6l3 3 5-5" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-sm text-gray-600 dark:text-slate-400 leading-snug">
                  I agree to Pyonea's{' '}
                  <a href="/terms" target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                    className="font-medium text-green-600 hover:underline">Terms &amp; Conditions</a>
                  {' and '}
                  <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                    className="font-medium text-green-600 hover:underline">Privacy Policy</a>
                  {userType === 'seller' && (<>{' and the '}
                    <a href="/seller-guidelines" target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                      className="font-medium text-green-600 hover:underline">Seller Guidelines</a>
                  </>)}
                </span>
              </label>
              {agreedError && <p className="text-sm text-red-600 pl-8">{agreedError}</p>}
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white transition-colors ${isLoading
                    ? 'bg-green-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
                  }`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('register.creatingAccount')}
                  </>
                ) : (
                  t('register.createAccount')
                )}
              </button>
            </div>

            <div className="mt-4 text-center text-sm">
              <span className="text-gray-600 dark:text-slate-400">{t('register.hasAccount')} </span>
              <Link to="/login" className="font-medium text-green-600 hover:text-green-500 transition-colors">
                {t('register.signIn')}
              </Link>
            </div>
          </form>
        </AuthLayout>
    </>
  );
};

export default Register;