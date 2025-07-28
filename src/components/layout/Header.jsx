import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Disclosure } from '@headlessui/react';
import {Bars3Icon,XMarkIcon,ShoppingCartIcon,UserIcon} from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCart } from '../../context/CartContext.jsx';

const Header = () => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${searchTerm}`);
    }
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const navigation = [
    { name: t('header.home'), href: '/' },
    { name: t('header.products'), href: '/products' },
    { name: t('header.sellers'), href: '/sellers' },
    { name: t('header.categories'), href: '/categories' },
  ];

  return (
    <Disclosure as="nav" className="bg-white shadow">
      {({ open }) => (
        <>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <Link to="/">
                    <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
                  </Link>
                  <span className="ml-2 text-xl font-bold text-green-700">မြန်မာ B2B</span>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className="border-transparent text-gray-900 hover:border-green-500 hover:text-green-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="flex-1 flex items-center justify-center px-2 lg:ml-6 lg:justify-end">
                <form onSubmit={handleSearch} className="w-full max-w-lg">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <input
                      id="search"
                      name="search"
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-green-500 focus:border-green-500 sm:text-sm"
                      placeholder={t('header.search')}
                      type="search"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </form>
              </div>
              <div className="flex items-center">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => changeLanguage('en')}
                    className={`px-2 py-1 text-sm rounded ${i18n.language === 'en' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                  >
                    EN
                  </button>
                  <button
                    onClick={() => changeLanguage('my')}
                    className={`px-2 py-1 text-sm rounded ${i18n.language === 'my' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                  >
                    မြန်မာ
                  </button>
                  
                  <Link to="/cart" className="relative p-1 text-gray-700 hover:text-green-600">
                    <ShoppingCartIcon className="h-6 w-6" />
                    {cartItems.length > 0 && (
                      <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                        {cartItems.reduce((total, item) => total + item.quantity, 0)}
                      </span>
                    )}
                  </Link>
                  
                  {user ? (
                    <div className="ml-3 relative">
                      <div className="flex items-center space-x-2">
                        <div className="flex-shrink-0">
                          <div className="bg-gray-200 border-2 border-dashed rounded-full w-8 h-8" />
                        </div>
                        <div className="hidden md:block">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-xs text-gray-500">{user.role}</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Link to="/login" className="ml-4 flex items-center text-gray-700 hover:text-green-600">
                      <UserIcon className="h-6 w-6" />
                      <span className="ml-1 hidden md:block">{t('header.login')}</span>
                    </Link>
                  )}
                </div>
              </div>
              <div className="-mr-2 flex items-center sm:hidden">
                <Disclosure.Button className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500">
                  <span className="sr-only">{t('header.open_menu')}</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="sm:hidden">
            <div className="pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="border-transparent text-gray-900 hover:bg-gray-50 hover:border-green-500 hover:text-green-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
                >
                  {item.name}
                </Link>
              ))}
            </div>
            <div className="pt-4 pb-3 border-t border-gray-200">
              {user ? (
                <div className="flex items-center px-4">
                  <div className="flex-shrink-0">
                    <div className="bg-gray-200 border-2 border-dashed rounded-full w-10 h-10" />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-900">{user.name}</div>
                    <div className="text-sm font-medium text-gray-500">{user.email}</div>
                  </div>
                </div>
              ) : (
                <div className="px-4">
                  <Link
                    to="/login"
                    className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-green-600 hover:bg-green-700"
                  >
                    {t('header.login')}
                  </Link>
                  <p className="mt-3 text-center text-sm text-gray-500">
                    {t('header.new_user')}{' '}
                    <Link to="/register" className="font-medium text-green-600 hover:text-green-500">
                      {t('header.sign_up')}
                    </Link>
                  </p>
                </div>
              )}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
};

export default Header;