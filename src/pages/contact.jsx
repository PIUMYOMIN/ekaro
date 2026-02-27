import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../utils/api';

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm();

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setSubmitError('');
    try {
      await api.post('/contact', data);
      setSubmitSuccess(true);
      reset();
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (error) {
      setSubmitError(error.response?.data?.message || 'ဆက်သွယ်ရန်မအောင်မြင်ပါ');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">ဆက်သွယ်ရန်</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact Info */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">ဆက်သွယ်ရန်အချက်အလက်များ</h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <svg className="h-6 w-6 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <div>
                  <p className="font-medium">ဖုန်း</p>
                  <p className="text-gray-600">+95 9 123 456 789</p>
                </div>
              </div>
              <div className="flex items-start">
                <svg className="h-6 w-6 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <div>
                  <p className="font-medium">အီးမေးလ်</p>
                  <p className="text-gray-600">support@myanmarb2b.com</p>
                </div>
              </div>
              <div className="flex items-start">
                <svg className="h-6 w-6 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <p className="font-medium">လိပ်စာ</p>
                  <p className="text-gray-600">အမှတ် ၁၂၃၊ စီးပွားရေးလမ်း၊ ရန်ကုန်မြို့</p>
                </div>
              </div>
            </div>

            <div className="mt-6 border-t pt-6">
              <h3 className="font-medium mb-2">လုပ်ငန်းချိန်</h3>
              <p className="text-gray-600">တနင်္လာနေ့ - သောကြာနေ့: ၉:၀၀ နံနက် - ၅:၀၀ ညနေ</p>
              <p className="text-gray-600">စနေနေ့: ၉:၀၀ နံနက် - ၁:၀၀ နေ့လယ်</p>
              <p className="text-gray-600">တနင်္ဂနွေနေ့: ပိတ်သည်</p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">မက်ဆေ့ချ်ပို့ရန်</h2>

            {submitSuccess && (
              <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
                <p className="text-sm text-green-700">သင့်မက်ဆေ့ချ်ကို ပေးပို့ပြီးပါပြီ။ ကျေးဇူးတင်ပါသည်။</p>
              </div>
            )}

            {submitError && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                <p className="text-sm text-red-700">{submitError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">အမည်</label>
                <input
                  type="text"
                  className={`w-full border rounded p-2 ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                  {...register('name', { required: 'အမည်ဖြည့်ရန် လိုအပ်ပါသည်' })}
                />
                {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">အီးမေးလ်</label>
                <input
                  type="email"
                  className={`w-full border rounded p-2 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                  {...register('email', {
                    required: 'အီးမေးလ်ဖြည့်ရန် လိုအပ်ပါသည်',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'မှန်ကန်သောအီးမေးလ်လိပ်စာဖြည့်ပါ'
                    }
                  })}
                />
                {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ဖုန်းနံပါတ်</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">+95</span>
                  <input
                    type="tel"
                    className={`w-full pl-12 border rounded p-2 ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                    {...register('phone', {
                      pattern: {
                        value: /^[0-9]{7,10}$/,
                        message: 'မြန်မာနိုင်ငံဖုန်းနံပါတ်မှန်ကန်စွာထည့်ပါ'
                      }
                    })}
                  />
                </div>
                {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">အကြောင်းအရာ</label>
                <input
                  type="text"
                  className={`w-full border rounded p-2 ${errors.subject ? 'border-red-500' : 'border-gray-300'}`}
                  {...register('subject', { required: 'အကြောင်းအရာဖြည့်ရန် လိုအပ်ပါသည်' })}
                />
                {errors.subject && <p className="text-red-600 text-sm mt-1">{errors.subject.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">မက်ဆေ့ချ်</label>
                <textarea
                  rows="4"
                  className={`w-full border rounded p-2 ${errors.message ? 'border-red-500' : 'border-gray-300'}`}
                  {...register('message', { required: 'မက်ဆေ့ချ်ဖြည့်ရန် လိုအပ်ပါသည်' })}
                ></textarea>
                {errors.message && <p className="text-red-600 text-sm mt-1">{errors.message.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50"
              >
                {isSubmitting ? 'ပေးပို့နေသည်...' : 'မက်ဆေ့ချ်ပို့ရန်'}
              </button>
            </form>
          </div>
        </div>

        {/* Map (optional placeholder) */}
        <div className="mt-8 bg-gray-200 h-64 rounded-lg flex items-center justify-center">
          <p className="text-gray-600">မြေပုံအား ဤနေရာတွင် ပြသမည်</p>
        </div>
      </div>
    </div>
  );
};

export default Contact;