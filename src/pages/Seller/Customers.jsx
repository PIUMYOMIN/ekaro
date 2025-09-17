// src/components/seller/Customers.jsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UserIcon, CreditCardIcon, ShoppingBagIcon, CalendarIcon } from '@heroicons/react/24/outline';

const Customers = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Sample customer data
  const customers = [
    {
      id: 1,
      name: 'Ko Min Aung',
      email: 'min.aung@example.com',
      phone: '+959123456789',
      orders: 12,
      totalSpent: 245000,
      lastOrder: '2023-06-15',
      status: 'active'
    },
    {
      id: 2,
      name: 'Ma Hla Hla',
      email: 'hla.hla@example.com',
      phone: '+959987654321',
      orders: 8,
      totalSpent: 156000,
      lastOrder: '2023-06-10',
      status: 'active'
    },
    {
      id: 3,
      name: 'U Ba Shwe',
      email: 'ba.shwe@example.com',
      phone: '+959112233445',
      orders: 5,
      totalSpent: 98000,
      lastOrder: '2023-05-28',
      status: 'inactive'
    },
    {
      id: 4,
      name: 'Daw Mya Mya',
      email: 'mya.mya@example.com',
      phone: '+959556677889',
      orders: 18,
      totalSpent: 367000,
      lastOrder: '2023-06-14',
      status: 'active'
    },
    {
      id: 5,
      name: 'Ko Zaw Zaw',
      email: 'zaw.zaw@example.com',
      phone: '+959998877665',
      orders: 3,
      totalSpent: 72000,
      lastOrder: '2023-04-15',
      status: 'inactive'
    }
  ];
  
  // Filter customers based on search query
  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone.includes(searchQuery)
  );

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">{t('seller.customers')}</h2>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {/* Inline SVG for search icon */}
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-12 py-2 border-gray-300 rounded-md"
              placeholder={t('seller.search_customers')}
            />
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
            {t('seller.new_customer')}
          </button>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-full">
              <UserIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">{t('seller.total_customers')}</p>
              <p className="text-xl font-bold text-gray-900">142</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-full">
              <ShoppingBagIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">{t('seller.active_customers')}</p>
              <p className="text-xl font-bold text-gray-900">98</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-full">
              <CreditCardIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">{t('seller.avg_order_value')}</p>
              <p className="text-xl font-bold text-gray-900">24,500 MMK</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="bg-yellow-100 p-3 rounded-full">
              <CalendarIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">{t('seller.new_this_month')}</p>
              <p className="text-xl font-bold text-gray-900">24</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Customers Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('seller.customer')}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('seller.contact')}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('seller.orders')}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('seller.total_spent')}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('seller.last_order')}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('seller.status')}
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">{t('seller.edit')}</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredCustomers.map((customer) => (
              <tr key={customer.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="bg-gray-200 border-2 border-dashed rounded-full w-8 h-8" />
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{customer.email}</div>
                  <div className="text-sm text-gray-500">{customer.phone}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{customer.orders}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{customer.totalSpent.toLocaleString()} MMK</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{customer.lastOrder}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    customer.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {customer.status === 'active' ? t('seller.active') : t('seller.inactive')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <a href="#" className="text-blue-600 hover:text-blue-900">
                    {t('seller.view')}
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      <div className="mt-6 flex items-center justify-between">
        <div className="text-sm text-gray-700">
          {t('seller.showing')} <span className="font-medium">1</span> {t('seller.to')} <span className="font-medium">5</span> {t('seller.of')} <span className="font-medium">142</span> {t('seller.customers')}
        </div>
        <div className="flex space-x-2">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            {t('seller.previous')}
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            {t('seller.next')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Customers;