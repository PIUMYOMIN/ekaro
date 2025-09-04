// src/pages/Auth/Register.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import AuthLayout from './AuthLayout';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
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

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError('');
    
    try {
      const result = await registerUser({
        name: data.name,
        phone: `+95${data.phone}`,
        email: data.email,
        password: data.password,
        password_confirmation: data.confirmPassword,
        type: userType
      });
      
      if (result.success) {
        // Redirect based on user role
        const user = result.user;
        if (user.roles?.includes('admin')) {
          navigate('/admin');
        } else if (user.roles?.includes('seller')) {
          navigate('/seller');
        } else {
          navigate('/products');
        }
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('An error occurred during registration');
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <AuthLayout
      title="အကောင့်အသစ်ဖွင့်ရန်"
      subtitle="သင့်အကောင့်အသစ်ဖွင့်ရန်"
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
              အမည်
            </label>
            <input
              id="name"
              name="name"
              type="text"
              className={`appearance-none block w-full px-3 py-3 border ${errors.name ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`}
              {...register('name', { 
                required: 'အမည်ဖြည့်ရန် လိုအပ်ပါသည်'
              })}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>
          
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
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              အီးမေးလ် (optional)
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className={`appearance-none block w-full px-3 py-3 border ${errors.email ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm autofill:no`}
              {...register('email', { 
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'မှန်ကန်သောအီးမေးလ်လိပ်စာဖြည့်ပါ'
                }
              })}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>
          
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => setUserType('buyer')}
              className={`flex-1 py-2 px-4 border rounded-md ${userType === 'buyer' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-300'}`}
            >
              ဝယ်ယူသူ
            </button>
            <button
              type="button"
              onClick={() => setUserType('seller')}
              className={`flex-1 py-2 px-4 border rounded-md ${userType === 'seller' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-300'}`}
            >
              ရောင်းချသူ
            </button>
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
          
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              စကားဝှက်အတည်ပြုရန်
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              className={`appearance-none block w-full px-3 py-3 border ${errors.confirmPassword ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`}
              {...register('confirmPassword', { 
                required: 'စကားဝှက်အတည်ပြုရန် လိုအပ်ပါသည်',
                validate: value => 
                  value === watch('password') || 'စကားဝှက်များ တူညီရပါမည်'
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
            className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                အကောင့်ဖွင့်နေပါသည်...
              </>
            ) : (
              'အကောင့်ဖွင့်ရန်'
            )}
          </button>
        </div>
        
        <div className="mt-4 text-center text-sm">
          <span className="text-gray-600">အကောင့်ရှိပြီးသားလား? </span>
          <Link to="/login" className="font-medium text-green-600 hover:text-green-500">
            အကောင့်ဝင်ရန်
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Register;