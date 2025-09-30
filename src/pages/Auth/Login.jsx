// src/pages/Auth/Login.jsx
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom'; // Added useLocation
import { useForm } from 'react-hook-form';
import { useTranslation } from "react-i18next";
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import AuthLayout from './AuthLayout';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext'; // Added useCart

const Login = () => {
  const { t } = useTranslation();
  const { login } = useAuth();
  const { addToCart } = useCart(); // Added cart context
  const navigate = useNavigate();
  const location = useLocation(); // Added location hook
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  // Get the redirect state from location
  const from = location.state?.from || '';
  const productId = location.state?.productId;
  const returnTo = location.state?.returnTo || '/products';

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

  const handleLoginSuccess = async (user) => {
    try {
      // If user was trying to add to cart before login
      if (from === 'cart-add' && productId) {
        try {
          // Automatically add the product to cart after successful login
          await addToCart({
            id: productId,
            quantity: 1
          });
          
          // Show success message or navigate to cart
          console.log('Product automatically added to cart after login');
          
          // Option 1: Redirect to cart page
          // navigate('/cart');
          
          // Option 2: Redirect back to original page with success state
          navigate(returnTo, { 
            state: { 
              message: 'Product added to cart successfully!',
              messageType: 'success'
            }
          });
        } catch (cartError) {
          console.error('Failed to add product to cart after login:', cartError);
          // Still redirect but show error message
          navigate(returnTo, { 
            state: { 
              message: 'Logged in successfully, but failed to add product to cart. Please try again.',
              messageType: 'error'
            }
          });
        }
      } else {
        // Normal redirect based on user role
        if (user.roles?.includes('admin')) {
          navigate('/admin');
        } else if (user.roles?.includes('seller')) {
          navigate('/seller');
        } else if (user.roles?.includes('buyer')) {
          navigate(returnTo);
        } else {
          navigate('/admin');
        }
      }
    } catch (error) {
      console.error('Error in login success handler:', error);
      // Fallback redirect
      navigate(returnTo);
    }
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError('');
    
    try {
      const normalizedPhone = normalizeMyanmarPhone(data.phone);
      
      const result = await login({
        phone: normalizedPhone,
        password: data.password
      });
      
      if (result.success) {
        await handleLoginSuccess(result.user);
      } else {
        setError(result.message || t('login.invalidCredentials'));
      }
    } catch (err) {
      setError(t('login.error'));
    } finally {
      setIsLoading(false);
    }
  };

  // Show informative message if user was redirected from cart
  const showRedirectMessage = from === 'cart-add' && productId;

  return (
    <AuthLayout
      title={t('login.title')}
      subtitle={t('login.subtitle')}
    >
      {/* Redirect Info Message */}
      {showRedirectMessage && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                {t('login.redirectMessage') || 'Please login to add items to your cart. The product will be automatically added after login.'}
              </p>
            </div>
          </div>
        </div>
      )}
      
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
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              {t('login.phone.label')}
            </label>
            <div className="mt-1">
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                className={`appearance-none block w-full px-3 py-3 border ${errors.phone ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`}
                placeholder={t('login.phone.placeholder')}
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
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              {t('login.password.label')}
            </label>
            <div className="mt-1 relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                className={`appearance-none block w-full px-3 py-3 pr-10 border ${errors.password ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`}
                placeholder={t('login.password.placeholder')}
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
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              {...register('remember')}
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
              {t('login.remember')}
            </label>
          </div>

          <div className="text-sm">
            <Link to="/forgot-password" className="font-medium text-green-600 hover:text-green-500">
              {t('login.forgotPassword')}
            </Link>
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
                {showRedirectMessage 
                  ? (t('login.signingInAndAdding') || 'Logging in & Adding to Cart...') 
                  : t('login.signingIn')
                }
              </>
            ) : (
              showRedirectMessage 
                ? (t('login.signInAndAdd') || 'Login & Add to Cart') 
                : t('login.signIn')
            )}
          </button>
        </div>
        
        <div className="mt-4 text-center text-sm">
          <span className="text-gray-600">{t('login.noAccount')} </span>
          <Link 
            to="/register" 
            state={location.state} // Pass the same state to register page
            className="font-medium text-green-600 hover:text-green-500"
          >
            {t('login.register')}
          </Link>
        </div>
      </form>
      
      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">
              {t('login.orContinue')}
            </span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
          >
            <div className="bg-gray-200 border-2 border-dashed rounded-full w-5 h-5" />
            <span className="ml-2">Facebook</span>
          </button>

          <button
            type="button"
            className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
          >
            <div className="bg-gray-200 border-2 border-dashed rounded-full w-5 h-5" />
            <span className="ml-2">Google</span>
          </button>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Login;