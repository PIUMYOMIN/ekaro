// src/pages/Auth/Register.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useTranslation } from "react-i18next";
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import AuthLayout from './AuthLayout';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const { t } = useTranslation();
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState('buyer');
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm();

  const normalizeMyanmarPhone = (phone) => {
    let cleanPhone = phone.replace(/\D/g, '');
    
    if (cleanPhone.startsWith('0')) {
      return '+95' + cleanPhone.substring(1);
    } else if (cleanPhone.startsWith('9')) {
      return '+95' + cleanPhone;
    } else if (cleanPhone.startsWith('95')) {
      return '+' + cleanPhone;
    } else if (cleanPhone.startsWith('959')) {
      return '+' + cleanPhone;
    } else {
      return phone.startsWith('+') ? phone : '+' + phone;
    }
  };

  const validateMyanmarPhone = (phone) => {
    if (!phone) return t('validation.required');
    
    const cleanPhone = phone.replace(/\D/g, '');
    
    if (cleanPhone.length < 7 || cleanPhone.length > 10) {
      return t('validation.invalidPhone');
    }
    
    const validPrefixes = ['0', '9', '95', '959'];
    const hasValidPrefix = validPrefixes.some(prefix => 
      cleanPhone.startsWith(prefix) || 
      phone.startsWith('+95') || 
      phone.startsWith('+959')
    );
    
    if (!hasValidPrefix) {
      return t('validation.invalidPhone');
    }
    
    return true;
  };

  const onSubmit = async (data) => {
  setIsLoading(true);
  setError('');
  
  try {
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
      state: data.state
    });
    
    console.log('Registration completed, checking result...');
    
    if (result.success) {
      const user = result.user;
      
      console.log('User object:', user);
      console.log('User type:', user.type);
      console.log('User roles:', user.roles);
      
      const isSeller = user.type === 'seller' || user.roles?.includes('seller');
      console.log('Is seller:', isSeller);
      
      if (isSeller) {
        console.log('Navigating to seller onboarding...');
        
        // Clear any existing localStorage data for fresh start
        localStorage.removeItem('seller_onboarding_data');
        
        // Navigate to seller onboarding
        navigate('/seller/onboarding/store-basic', { replace: true });
      } else if (user.roles?.includes('admin')) {
        navigate('/admin', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } else {
      console.log('Registration failed:', result.message);
      setError(result.message || t('register.error'));
    }
  } catch (err) {
    console.error('Registration error:', err);
    setError(t('register.error'));
  } finally {
    setIsLoading(false);
  }
};

  return (
    <AuthLayout
      title={t('register.title')}
      subtitle={t('register.subtitle')}
    >
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              {t('register.name.label')}
            </label>
            <input
              id="name"
              name="name"
              type="text"
              className={`appearance-none block w-full px-3 py-3 border ${errors.name ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`}
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
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              {t('register.phone.label')}
            </label>
            <div className="mt-1">
              <input
                id="phone"
                name="phone"
                type="tel"
                className={`appearance-none block w-full px-3 py-3 border ${errors.phone ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`}
                placeholder={t('register.phone.placeholder')}
                {...register('phone', { 
                  required: t('validation.required'),
                  validate: validateMyanmarPhone
                })}
              />
              <p className="mt-1 text-xs text-gray-500">
                {t('register.phone.examples')}
              </p>
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              {t('register.email.label')}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className={`appearance-none block w-full px-3 py-3 border ${errors.email ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`}
              placeholder={t('register.email.placeholder')}
              {...register('email', { 
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('register.accountType.label')}
            </label>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setUserType('buyer')}
                className={`flex-1 py-3 px-4 border rounded-md text-sm font-medium transition-colors ${
                  userType === 'buyer' 
                    ? 'border-green-500 bg-green-50 text-green-700 shadow-sm' 
                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                {t('register.accountType.buyer')}
              </button>
              <button
                type="button"
                onClick={() => setUserType('seller')}
                className={`flex-1 py-3 px-4 border rounded-md text-sm font-medium transition-colors ${
                  userType === 'seller' 
                    ? 'border-green-500 bg-green-50 text-green-700 shadow-sm' 
                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                {t('register.accountType.seller')}
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              {userType === 'buyer' 
                ? t('register.accountType.buyerDescription')
                : t('register.accountType.sellerDescription')
              }
            </p>
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              {t('register.password.label')}
            </label>
            <div className="mt-1 relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                className={`appearance-none block w-full px-3 py-3 pr-10 border ${errors.password ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`}
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
                  className="text-gray-400 hover:text-gray-500 focus:outline-none transition-colors"
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
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              {t('register.confirmPassword.label')}
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              className={`appearance-none block w-full px-3 py-3 border ${errors.confirmPassword ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`}
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

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white transition-colors ${
              isLoading 
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
          <span className="text-gray-600">{t('register.hasAccount')} </span>
          <Link to="/login" className="font-medium text-green-600 hover:text-green-500 transition-colors">
            {t('register.signIn')}
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Register;