import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const Register = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch("password");

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError('');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, this would be an API call to your backend
      console.log('Registration data:', data);
      
      // Redirect to dashboard after successful registration
      navigate('/');
    } catch (err) {
      setError(t('register.error_message'));
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="first-name" className="block text-sm font-medium text-gray-700">
            {t('register.first_name_label')}
          </label>
          <input
            type="text"
            id="first-name"
            className={`appearance-none block w-full px-3 py-3 border ${errors.firstName ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`}
            {...register('firstName', { required: t('register.first_name_required') })}
          />
          {errors.firstName && (
            <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="last-name" className="block text-sm font-medium text-gray-700">
            {t('register.last_name_label')}
          </label>
          <input
            type="text"
            id="last-name"
            className={`appearance-none block w-full px-3 py-3 border ${errors.lastName ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`}
            {...register('lastName', { required: t('register.last_name_required') })}
          />
          {errors.lastName && (
            <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
          )}
        </div>
      </div>
      
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
          {t('register.phone_label')}
        </label>
        <div className="mt-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">+95</span>
          </div>
          <input
            id="phone"
            type="tel"
            className={`appearance-none block w-full px-3 pl-12 py-3 border ${errors.phone ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`}
            placeholder={t('register.phone_placeholder')}
            {...register('phone', { 
              required: t('register.phone_required'),
              pattern: {
                value: /^[0-9]{7,10}$/,
                message: t('register.phone_invalid')
              }
            })}
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
          )}
        </div>
      </div>
      
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          {t('register.email_label')} <span className="text-gray-400">({t('register.optional')})</span>
        </label>
        <input
          id="email"
          type="email"
          className={`appearance-none block w-full px-3 py-3 border ${errors.email ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`}
          {...register('email', { 
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: t('register.email_invalid')
            }
          })}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>
      
      <div className="flex justify-end mt-6">
        <button
          type="button"
          onClick={() => setStep(2)}
          className="py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          {t('register.next_step')}
        </button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div>
        <label htmlFor="account-type" className="block text-sm font-medium text-gray-700">
          {t('register.account_type_label')}
        </label>
        <div className="mt-1 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="relative">
            <input
              className="sr-only"
              id="buyer"
              type="radio"
              value="buyer"
              {...register('accountType', { required: t('register.account_type_required') })}
            />
            <label 
              htmlFor="buyer" 
              className="relative cursor-pointer bg-white border border-gray-300 rounded-lg shadow-sm p-4 flex focus:outline-none"
            >
              <div className="flex-1 flex">
                <div className="flex flex-col">
                  <span className="block text-sm font-medium text-gray-900">
                    {t('register.buyer')}
                  </span>
                  <span className="mt-1 flex items-center text-sm text-gray-500">
                    {t('register.buyer_description')}
                  </span>
                </div>
              </div>
              <svg 
                className="h-5 w-5 text-green-600 absolute top-4 right-4" 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 20 20" 
                fill="currentColor"
                aria-hidden="true"
              >
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </label>
          </div>
          
          <div className="relative">
            <input
              className="sr-only"
              id="seller"
              type="radio"
              value="seller"
              {...register('accountType', { required: t('register.account_type_required') })}
            />
            <label 
              htmlFor="seller" 
              className="relative cursor-pointer bg-white border border-gray-300 rounded-lg shadow-sm p-4 flex focus:outline-none"
            >
              <div className="flex-1 flex">
                <div className="flex flex-col">
                  <span className="block text-sm font-medium text-gray-900">
                    {t('register.seller')}
                  </span>
                  <span className="mt-1 flex items-center text-sm text-gray-500">
                    {t('register.seller_description')}
                  </span>
                </div>
              </div>
              <svg 
                className="h-5 w-5 text-green-600 absolute top-4 right-4" 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 20 20" 
                fill="currentColor"
                aria-hidden="true"
              >
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </label>
          </div>
        </div>
        {errors.accountType && (
          <p className="mt-2 text-sm text-red-600">{errors.accountType.message}</p>
        )}
      </div>
      
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          {t('register.password_label')}
        </label>
        <input
          id="password"
          type="password"
          className={`appearance-none block w-full px-3 py-3 border ${errors.password ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`}
          {...register('password', { 
            required: t('register.password_required'),
            minLength: {
              value: 8,
              message: t('register.password_min_length')
            },
            pattern: {
              value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
              message: t('register.password_strength')
            }
          })}
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
        )}
        <p className="mt-2 text-xs text-gray-500">
          {t('register.password_requirements')}
        </p>
      </div>
      
      <div>
        <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
          {t('register.confirm_password_label')}
        </label>
        <input
          id="confirm-password"
          type="password"
          className={`appearance-none block w-full px-3 py-3 border ${errors.confirmPassword ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`}
          {...register('confirmPassword', { 
            required: t('register.confirm_password_required'),
            validate: value => 
              value === password || t('register.passwords_mismatch')
          })}
        />
        {errors.confirmPassword && (
          <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
        )}
      </div>
      
      <div className="flex items-center">
        <input
          id="terms"
          name="terms"
          type="checkbox"
          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
          {...register('terms', { required: t('register.terms_required') })}
        />
        <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
          {t('register.agree_to')}{' '}
          <Link to="/terms" className="font-medium text-green-600 hover:text-green-500">
            {t('register.terms')}
          </Link>{' '}
          {t('register.and')}{' '}
          <Link to="/privacy" className="font-medium text-green-600 hover:text-green-500">
            {t('register.privacy_policy')}
          </Link>
        </label>
      </div>
      {errors.terms && (
        <p className="mt-1 text-sm text-red-600">{errors.terms.message}</p>
      )}
      
      <div className="flex justify-between mt-6">
        <button
          type="button"
          onClick={() => setStep(1)}
          className="py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          {t('register.back')}
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className={`py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
        >
          {isLoading ? t('register.creating_account') : t('register.create_account')}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <div className="mx-auto h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
            <div className="bg-gray-200 border-2 border-dashed rounded-full w-12 h-12" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {t('register.title')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {t('register.already_have_account')}{' '}
            <Link to="/login" className="font-medium text-green-600 hover:text-green-500">
              {t('register.sign_in')}
            </Link>
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {step === 1 ? renderStep1() : renderStep2()}
        </form>
      </motion.div>
    </div>
  );
};

export default Register;