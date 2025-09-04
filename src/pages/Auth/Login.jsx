// src/pages/Auth/Login.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import AuthLayout from './AuthLayout';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError('');
    
    try {
      const result = await login({
        phone: `0${data.phone}`,
        password: data.password
      });
      
      if (result.success) {
        // Redirect based on user role
        const user = result.user;
        if (user.roles?.includes('admin')) {
          navigate('/admin');
        } else if (user.roles?.includes('seller')) {
          navigate('/seller');
        } else if (user.roles?.includes('buyer')) {
          navigate('/products');
        } else {
          navigate('/admin');
        }
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <AuthLayout
      title="အကောင့်ဝင်ရန်"
      subtitle="သင့်အကောင့်သို့ ဝင်ရောက်ရန်"
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
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              ဖုန်းနံပါတ်
            </label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">+95</span>
              </div>
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                className={`appearance-none block w-full px-3 pl-12 py-3 border ${errors.phone ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`}
                placeholder="9xxxxxxxx"
                {...register('phone', { 
                  required: 'ဖုန်းနံပါတ်ဖြည့်ရန် လိုအပ်ပါသည်',
                  pattern: {
                    value: /^[0-9]{7,10}$/,
                    message: 'မြန်မာနိုင်ငံဖုန်းနံပါတ်မှန်ကန်စွာထည့်ပါ'
                  }
                })}
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              စကားဝှက်
            </label>
            <div className="mt-1 relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                className={`appearance-none block w-full px-3 py-3 border ${errors.password ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`}
                {...register('password', { 
                  required: 'စကားဝှက်ဖြည့်ရန် လိုအပ်ပါသည်',
                  minLength: {
                    value: 6,
                    message: 'စကားဝှက်သည် အနည်းဆုံး ၆ လုံးရှိရပါမည်'
                  }
                })}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-500 focus:outline-none"
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
              ကျွန်ုပ်ကိုမှတ်ထားပါ
            </label>
          </div>

          <div className="text-sm">
            <Link to="/forgot-password" className="font-medium text-green-600 hover:text-green-500">
              စကားဝှက်မေ့နေပါသလား?
            </Link>
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                အကောင့်ဝင်နေပါသည်...
              </>
            ) : (
              'အကောင့်ဝင်ရန်'
            )}
          </button>
        </div>
        
        <div className="mt-4 text-center text-sm">
          <span className="text-gray-600">အကောင့်မရှိသေးပါက </span>
          <Link to="/register" className="font-medium text-green-600 hover:text-green-500">
            အကောင့်အသစ်ဖွင့်ရန်
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
              သို့မဟုတ် ဆက်လက်အသုံးပြုရန်
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