// src/components/seller/StoreSettings.jsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  CogIcon, 
  UserCircleIcon, 
  CreditCardIcon, 
  GlobeAltIcon, 
  LockClosedIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

const StoreSettings = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('general');
  const [storeInfo, setStoreInfo] = useState({
    name: 'Myanmar Game Topup',
    description: 'Your trusted source for game topups and digital goods in Myanmar',
    email: 'contact@myanmartopup.com',
    phone: '+959123456789',
    address: '123 Digital Street, Yangon, Myanmar',
    currency: 'MMK',
    timezone: 'Asia/Yangon'
  });
  
  const [paymentMethods, setPaymentMethods] = useState([
    { id: 1, name: 'KBZ Pay', enabled: true },
    { id: 2, name: 'Wave Money', enabled: true },
    { id: 3, name: 'CB Bank', enabled: false },
    { id: 4, name: 'Visa/Mastercard', enabled: true },
  ]);
  
  const [securitySettings, setSecuritySettings] = useState({
    twoFactor: false,
    loginAlerts: true,
    sessionTimeout: 30
  });
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setStoreInfo(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handlePaymentToggle = (id) => {
    setPaymentMethods(paymentMethods.map(method => 
      method.id === id ? { ...method, enabled: !method.enabled } : method
    ));
  };
  
  const handleSecurityChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSecuritySettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">{t('seller.store_settings')}</h2>
      
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('general')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'general'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center">
              <CogIcon className="h-5 w-5 mr-2" />
              {t('seller.general')}
            </div>
          </button>
          
          <button
            onClick={() => setActiveTab('payments')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'payments'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center">
              <CreditCardIcon className="h-5 w-5 mr-2" />
              {t('seller.payments')}
            </div>
          </button>
          
          <button
            onClick={() => setActiveTab('shipping')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'shipping'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center">
              <TruckIcon className="h-5 w-5 mr-2" />
              {t('seller.shipping')}
            </div>
          </button>
          
          <button
            onClick={() => setActiveTab('security')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'security'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center">
              <LockClosedIcon className="h-5 w-5 mr-2" />
              {t('seller.security')}
            </div>
          </button>
        </nav>
      </div>
      
      {/* Tab Content */}
      <div className="mt-8">
        {/* General Settings */}
        {activeTab === 'general' && (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">{t('seller.store_information')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('seller.store_name')}
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={storeInfo.name}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('seller.store_email')}
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={storeInfo.email}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('seller.phone_number')}
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={storeInfo.phone}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('seller.address')}
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={storeInfo.address}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('seller.store_description')}
                  </label>
                  <textarea
                    name="description"
                    value={storeInfo.description}
                    onChange={handleInputChange}
                    rows="4"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  ></textarea>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">{t('seller.regional_settings')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('seller.currency')}
                  </label>
                  <select
                    name="currency"
                    value={storeInfo.currency}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="MMK">Myanmar Kyat (MMK)</option>
                    <option value="USD">US Dollar (USD)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('seller.timezone')}
                  </label>
                  <select
                    name="timezone"
                    value={storeInfo.timezone}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Asia/Yangon">(GMT+6:30) Yangon</option>
                    <option value="Asia/Bangkok">(GMT+7:00) Bangkok</option>
                    <option value="Asia/Singapore">(GMT+8:00) Singapore</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md">
                {t('seller.save_changes')}
              </button>
            </div>
          </div>
        )}
        
        {/* Payment Settings */}
        {activeTab === 'payments' && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-6">{t('seller.payment_methods')}</h3>
            
            <div className="space-y-4">
              {paymentMethods.map((method) => (
                <div key={method.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10" />
                    <div className="ml-4">
                      <h4 className="font-medium text-gray-900">{method.name}</h4>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <span className={`mr-4 text-sm ${
                      method.enabled ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {method.enabled ? t('seller.enabled') : t('seller.disabled')}
                    </span>
                    <button
                      onClick={() => handlePaymentToggle(method.id)}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        method.enabled ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          method.enabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 bg-blue-50 rounded-lg p-4">
              <div className="flex">
                <InformationCircleIcon className="h-5 w-5 text-blue-400 flex-shrink-0" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">{t('seller.payment_info_title')}</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>{t('seller.payment_info_content')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Shipping Settings */}
        {activeTab === 'shipping' && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-6">{t('seller.shipping_options')}</h3>
            
            <div className="space-y-6">
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <TruckIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-xl font-bold text-gray-900">Standard Delivery</h3>
                      <p className="text-sm text-gray-500">3-5 days • 3,000 MMK</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {t('seller.enabled')}
                  </span>
                </div>
                
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">{t('seller.available_regions')}</h4>
                    <div className="mt-1 flex flex-wrap">
                      <span className="mr-2 mb-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Yangon
                      </span>
                      <span className="mr-2 mb-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Mandalay
                      </span>
                      <span className="mr-2 mb-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Naypyitaw
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-green-100 p-3 rounded-full">
                      <TruckIcon className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-xl font-bold text-gray-900">Express Delivery</h3>
                      <p className="text-sm text-gray-500">1-2 days • 5,000 MMK</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {t('seller.enabled')}
                  </span>
                </div>
                
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">{t('seller.available_regions')}</h4>
                    <div className="mt-1 flex flex-wrap">
                      <span className="mr-2 mb-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Yangon
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-yellow-100 p-3 rounded-full">
                      <TruckIcon className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-xl font-bold text-gray-900">Free Shipping</h3>
                      <p className="text-sm text-gray-500">5-7 days • 0 MMK</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {t('seller.disabled')}
                  </span>
                </div>
                
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">{t('seller.available_regions')}</h4>
                    <div className="mt-1 flex flex-wrap">
                      <span className="mr-2 mb-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        All regions
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Security Settings */}
        {activeTab === 'security' && (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">{t('seller.account_security')}</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{t('seller.two_factor_auth')}</h4>
                    <p className="text-sm text-gray-500">{t('seller.two_factor_desc')}</p>
                  </div>
                  <div className="flex items-center">
                    <span className={`mr-4 text-sm ${
                      securitySettings.twoFactor ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {securitySettings.twoFactor ? t('seller.enabled') : t('seller.disabled')}
                    </span>
                    <button
                      onClick={() => setSecuritySettings({...securitySettings, twoFactor: !securitySettings.twoFactor})}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        securitySettings.twoFactor ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          securitySettings.twoFactor ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{t('seller.login_alerts')}</h4>
                    <p className="text-sm text-gray-500">{t('seller.login_alerts_desc')}</p>
                  </div>
                  <div className="flex items-center">
                    <span className={`mr-4 text-sm ${
                      securitySettings.loginAlerts ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {securitySettings.loginAlerts ? t('seller.enabled') : t('seller.disabled')}
                    </span>
                    <button
                      onClick={() => setSecuritySettings({...securitySettings, loginAlerts: !securitySettings.loginAlerts})}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        securitySettings.loginAlerts ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          securitySettings.loginAlerts ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
                
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-gray-900">{t('seller.session_timeout')}</h4>
                      <p className="text-sm text-gray-500">{t('seller.session_timeout_desc')}</p>
                    </div>
                    <div className="w-32">
                      <select
                        name="sessionTimeout"
                        value={securitySettings.sessionTimeout}
                        onChange={handleSecurityChange}
                        className="block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="15">15 minutes</option>
                        <option value="30">30 minutes</option>
                        <option value="60">1 hour</option>
                        <option value="120">2 hours</option>
                        <option value="0">Never</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">{t('seller.password_settings')}</h3>
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="max-w-lg">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
                    {t('seller.change_password')}
                  </button>
                  <p className="mt-3 text-sm text-gray-500">
                    {t('seller.password_change_note')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper icons
function TruckIcon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

export default StoreSettings;