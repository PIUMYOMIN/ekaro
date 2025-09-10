import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Disclosure } from '@headlessui/react';
import { Bars3Icon, XMarkIcon, ShoppingCartIcon, UserIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCart } from '../../context/CartContext.jsx';

const Header = () => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${searchTerm}`);
      setShowMobileSearch(false);
    }
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleDashboardNavigation = () => {
    if (!user) return;
    
    if (user.roles?.includes('admin')) {
      navigate('/admin');
    } else if (user.roles?.includes('seller')) {
      navigate('/seller');
    } else {
      navigate('/buyer');
    }
  };

  const navigation = [
    { name: t('header.home'), href: '/' },
    { name: t('header.products'), href: '/products' },
    { name: t('header.sellers'), href: '/sellers' },
    { name: t('header.categories'), href: '/categories' },
  ];

  // Add role-specific navigation items
  const userNavigation = [
    { name: t('profile'), onClick: handleDashboardNavigation },
    { name: t('logout'), onClick: handleLogout }
  ];

  return (
    <Disclosure as="nav" className="bg-white shadow-lg sticky top-0 z-50">
      {({ open }) => (
        <>
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
            <div className="flex justify-between h-16">
              {/* Left side - Logo and mobile menu button */}
              <div className="flex items-center">
                <div className="flex-shrink-0 flex items-center">
                  <Link to="/" className="flex items-center">
                    <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-lg w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-white font-bold text-sm sm:text-base">
                      B2B
                    </div>
                    <span className="ml-2 text-lg sm:text-xl font-bold text-green-700 ">မြန်မာ B2B</span>
                  </Link>
                </div>
                
                {/* Desktop navigation */}
                <div className="hidden md:ml-4 md:flex md:space-x-2 lg:space-x-4">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className="px-2 py-1 lg:px-3 lg:py-2 text-gray-700 hover:text-green-700 hover:bg-green-50 rounded-md text-sm font-medium transition-colors duration-200"
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Center - Search bar (desktop) */}
              <div className="flex-1 flex items-center justify-end px-2 lg:px-4 lg:ml-6 max-w-lg">
                <form onSubmit={handleSearch} className="w-full hidden sm:block">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      id="search"
                      name="search"
                      className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-green-500 focus:border-green-500 text-sm"
                      placeholder={t('header.search')}
                      type="search"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </form>
                
                {/* Mobile search button */}
                <button
                  type="button"
                  className="sm:hidden p-2 text-gray-500 hover:text-green-600 focus:outline-none"
                  onClick={() => setShowMobileSearch(true)}
                  aria-label={t('header.search')}
                >
                  <MagnifyingGlassIcon className="h-5 w-5" />
                </button>
              </div>

              {/* Right side - User controls */}
              <div className="flex items-center">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  {/* Language switcher - Always visible on desktop */}
                  <div className="hidden sm:flex items-center bg-gray-100 rounded-md p-1">
                    <button
                      onClick={() => changeLanguage('en')}
                      className={`px-2 py-1 text-xs rounded-md ${i18n.language === 'en' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-700 hover:text-green-600'}`}
                    >
                      ENG
                    </button>
                    <button
                      onClick={() => changeLanguage('my')}
                      className={`px-2 py-1 text-xs rounded-md ${i18n.language === 'my' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-700 hover:text-green-600'}`}
                    >
                      မြန်မာ
                    </button>
                  </div>
                  
                  {/* Cart */}
                  <Link to="/cart" className="relative p-1 text-gray-700 hover:text-green-600">
                    <ShoppingCartIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                    {cartItems.length > 0 && (
                      <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform bg-red-600 rounded-full">
                        {cartItems.reduce((total, item) => total + item.quantity, 0)}
                      </span>
                    )}
                  </Link>
                  
                  {/* User profile */}
                  {user ? (
                    <div className="ml-1 relative group">
                      <button 
                        onClick={handleDashboardNavigation}
                        className="flex items-center space-x-1 focus:outline-none"
                      >
                        <div className="flex-shrink-0">
                          <div className="bg-gray-200 border-2 border-dashed rounded-full w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-xs text-gray-500">
                            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                        </div>
                        <div className="hidden lg:block text-left">
                          <div className="text-sm font-medium text-gray-900 truncate max-w-xs">{user.name}</div>
                          <div className="text-xs text-gray-500 capitalize">
                            {user.roles?.join(', ')}
                          </div>
                        </div>
                      </button>
                      
                      {/* Dropdown menu */}
                      <div className="hidden group-hover:block absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                        <div className="py-1">
                          {userNavigation.map((item) => (
                            <button
                              key={item.name}
                              onClick={item.onClick}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              {item.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Link to="/login" className="ml-1 flex items-center text-gray-700 hover:text-green-600 p-1 sm:p-1.5">
                      <UserIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                      <span className="ml-1 hidden sm:block">{t('header.login')}</span>
                    </Link>
                  )}
                </div>
              </div>

              {/* Mobile menu button */}
              <div className="flex items-center md:hidden">
                <Disclosure.Button className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500">
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

          {/* Mobile search overlay */}
          {showMobileSearch && (
            <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-start justify-center md:hidden pt-16">
              <div className="bg-white w-full p-3 shadow-lg flex items-center">
                <form
                  onSubmit={handleSearch}
                  className="flex-1 flex items-center"
                >
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      id="mobile-search"
                      name="mobile-search"
                      className="block w-full pl-9 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-green-500 focus:border-green-500 text-sm"
                      placeholder={t('header.search')}
                      type="search"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <button
                    type="button"
                    className="ml-2 p-2 text-gray-500 hover:text-red-600 focus:outline-none"
                    onClick={() => setShowMobileSearch(false)}
                    aria-label={t('header.close_search')}
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Mobile menu */}
          <Disclosure.Panel className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {/* Mobile search bar */}
              <div className="px-2 pb-2 border-b border-gray-200">
                <form onSubmit={handleSearch} className="flex">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      id="mobile-menu-search"
                      name="mobile-menu-search"
                      className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-green-500 focus:border-green-500 text-sm"
                      placeholder={t('header.search')}
                      type="search"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <button
                    type="submit"
                    className="ml-2 px-3 py-2 bg-green-600 text-white rounded-md text-sm font-medium"
                  >
                    {t('header.search')}
                  </button>
                </form>
              </div>
              
              {/* Navigation links */}
              {navigation.map((item) => (
                <Disclosure.Button
                  key={item.name}
                  as={Link}
                  to={item.href}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-green-700 hover:bg-green-50"
                >
                  {item.name}
                </Disclosure.Button>
              ))}
              
              {/* Mobile language switcher */}
              <div className="px-3 py-2 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex space-x-1">
                    <button
                      onClick={() => changeLanguage('en')}
                      className={`px-3 py-1 text-xs rounded-md ${i18n.language === 'en' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}
                    >
                      ENG
                    </button>
                    <button
                      onClick={() => changeLanguage('my')}
                      className={`px-3 py-1 text-xs rounded-md ${i18n.language === 'my' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}
                    >
                      မြန်မာ
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* User section */}
            <div className="pt-4 pb-3 border-t border-gray-200">
              {user ? (
                <>
                  <div className="flex items-center px-4">
                    <div className="flex-shrink-0">
                      <div className="bg-gray-200 border-2 border-dashed rounded-full w-10 h-10 flex items-center justify-center text-gray-500">
                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                    </div>
                    <div className="ml-3">
                      <div className="text-base font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm font-medium text-gray-500 capitalize">
                        {user.roles?.join(', ')}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1">
                    {userNavigation.map((item) => (
                      <Disclosure.Button
                        key={item.name}
                        as="button"
                        onClick={item.onClick}
                        className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                      >
                        {item.name}
                      </Disclosure.Button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="px-2 space-y-2">
                  <Disclosure.Button
                    as={Link}
                    to="/login"
                    className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-green-600 hover:bg-green-700"
                  >
                    {t('header.login')}
                  </Disclosure.Button>
                  <p className="text-center text-sm text-gray-600">
                    {t('header.new_user')}{' '}
                    <Disclosure.Button
                      as={Link}
                      to="/register"
                      className="font-medium text-green-600 hover:text-green-500"
                    >
                      {t('header.sign_up')}
                    </Disclosure.Button>
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