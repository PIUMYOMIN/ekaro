import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Disclosure, Menu } from '@headlessui/react';
import {
  Bars3Icon, XMarkIcon, ShoppingCartIcon,
  UserIcon, MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCart } from '../../context/CartContext.jsx';
import Logo from '../../assets/images/logo.png';

const Header = () => {
  const { t, i18n }         = useTranslation();
  const { user, logout, hasRole } = useAuth();
  const { totalItems }      = useCart();
  const navigate            = useNavigate();
  const location            = useLocation();

  // ── Active link helper ────────────────────────────────────────────────
  // Exact match for '/', prefix match for everything else
  const isActive = (href) =>
    href === '/'
      ? location.pathname === '/'
      : location.pathname.startsWith(href);

  // ── Search ────────────────────────────────────────────────────────────
  const urlSearchQuery = useMemo(
    () => new URLSearchParams(location.search).get('search') || '',
    [location.search]
  );

  const [searchTerm, setSearchTerm]           = useState(urlSearchQuery);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  // Stable ref so the debounce timeout survives re-renders
  const debounceRef    = useRef(null);
  const isSyncingRef   = useRef(false);

  // Sync input when URL changes (back/forward navigation)
  useEffect(() => {
    isSyncingRef.current = true;
    setSearchTerm(urlSearchQuery);
    requestAnimationFrame(() => { isSyncingRef.current = false; });
  }, [urlSearchQuery]);

  // FIX: stable debounce — timeout stored in a ref, not inside useCallback closure
  const debouncedNavigate = useCallback((value) => {
    if (isSyncingRef.current) return;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(location.search);
      // FIX: don't double-encode — URLSearchParams.set() encodes automatically
      if (value.trim()) {
        params.set('search', value.trim());
      } else {
        params.delete('search');
      }
      navigate(`/products?${params.toString()}`, { replace: true });
    }, 500);
  }, [location.search, navigate]);

  useEffect(() => {
    debouncedNavigate(searchTerm);
  }, [searchTerm, debouncedNavigate]);

  // Immediate navigation on form submit
  const handleSearch = (e) => {
    e?.preventDefault();
    clearTimeout(debounceRef.current);
    const params = new URLSearchParams();
    if (searchTerm.trim()) params.set('search', searchTerm.trim());
    navigate(`/products${params.toString() ? '?' + params.toString() : ''}`);
    setShowMobileSearch(false);
  };

  // ── Auth helpers ──────────────────────────────────────────────────────
  const changeLanguage = (lng) => i18n.changeLanguage(lng);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handleDashboard = () => {
    if (!user) { navigate('/login'); return; }
    if (hasRole('admin') || user.type === 'admin')   { navigate('/admin/dashboard');  return; }
    if (hasRole('seller') || user.type === 'seller') { navigate('/seller/dashboard'); return; }
    navigate('/buyer/dashboard');
  };

  const getDisplayRole = () => {
    if (!user) return '';
    if (user.roles?.length) {
      return user.roles
        .map(r => t(`roles.${typeof r === 'string' ? r : r.name}`, typeof r === 'string' ? r : r.name))
        .join(', ');
    }
    return t(`roles.${user.type || user.role || 'buyer'}`, user.type || user.role || 'Buyer');
  };

  // Only show cart to buyers (or guests who might be buyers)
  const showCart = !user || user.type === 'buyer';

  // ── Nav items ─────────────────────────────────────────────────────────
  const navigation = [
    { name: t('header.home'),       href: '/' },
    { name: t('header.products'),   href: '/products' },
    { name: t('header.sellers'),    href: '/sellers' },
    { name: t('header.categories'), href: '/categories' },
  ];

  const userNavigation = [
    { name: t('header.profile'), onClick: handleDashboard },
    { name: t('header.logout'),  onClick: handleLogout },
  ];

  // ── Shared class builders ─────────────────────────────────────────────
  const desktopLinkClass = (href) =>
    `px-2 py-1 lg:px-3 lg:py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
      isActive(href)
        ? 'text-green-700 bg-green-50 font-semibold'
        : 'text-gray-700 hover:text-green-700 hover:bg-green-50'
    }`;

  const mobileLinkClass = (href) =>
    `block px-3 py-2.5 rounded-md text-base font-medium transition-colors duration-150 ${
      isActive(href)
        ? 'text-green-700 bg-green-50 font-semibold border-l-4 border-green-600 pl-2'
        : 'text-gray-700 hover:text-green-700 hover:bg-green-50'
    }`;

  return (
    <Disclosure as="nav" className="bg-white shadow-md sticky top-0 z-50">
      {({ open, close }) => (
        <>
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
            <div className="flex items-center h-16 gap-2">

              {/* ── Logo ───────────────────────────────────────────── */}
              <div className="flex-shrink-0 flex items-center">
                <Link to="/" className="flex items-center gap-2">
                  <img
                    src={Logo}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg object-contain"
                    alt="Pyonea"
                  />
                  <span className="text-lg sm:text-xl font-semibold text-green-800 hidden xs:block">
                    {t('header.logo_text')}
                  </span>
                </Link>
              </div>

              {/* ── Desktop nav ────────────────────────────────────── */}
              <div className="hidden md:flex md:items-center md:gap-1 lg:gap-2 ml-2">
                {navigation.map((item) => (
                  <Link key={item.href} to={item.href} className={desktopLinkClass(item.href)}>
                    {item.name}
                  </Link>
                ))}
              </div>

              {/* ── Search (desktop) ───────────────────────────────── */}
              <div className="flex-1 flex justify-center px-2 lg:px-4 max-w-md mx-auto">
                <form onSubmit={handleSearch} className="w-full hidden sm:block">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    <input
                      className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg
                                 bg-white placeholder-gray-400 text-sm
                                 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder={t('header.search_placeholder')}
                      type="search"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </form>
              </div>

              {/* ── Right controls ─────────────────────────────────── */}
              <div className="flex items-center gap-1 sm:gap-2">

                {/* Language switcher — desktop only */}
                <div className="hidden sm:flex items-center bg-gray-100 rounded-lg p-0.5">
                  {['en', 'my'].map((lng) => (
                    <button
                      key={lng}
                      onClick={() => changeLanguage(lng)}
                      className={`px-2 py-1 text-xs rounded-md transition-colors ${
                        i18n.language === lng
                          ? 'bg-white text-green-700 shadow-sm font-medium'
                          : 'text-gray-600 hover:text-green-600'
                      }`}
                    >
                      {lng === 'en' ? 'ENG' : t('header.burmese')}
                    </button>
                  ))}
                </div>

                {/* Mobile search button */}
                <button
                  type="button"
                  className="sm:hidden p-2 text-gray-500 hover:text-green-600 rounded-lg hover:bg-gray-100"
                  onClick={() => setShowMobileSearch(true)}
                  aria-label={t('header.search')}
                >
                  <MagnifyingGlassIcon className="h-5 w-5" />
                </button>

                {/* Cart — buyers and guests only */}
                {showCart && (
                  <Link
                    to="/cart"
                    className="relative p-2 text-gray-700 hover:text-green-600 rounded-lg hover:bg-gray-100"
                    aria-label="Cart"
                  >
                    <ShoppingCartIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                    {totalItems > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white
                                       text-[10px] font-bold w-4 h-4 flex items-center
                                       justify-center rounded-full leading-none">
                        {totalItems > 9 ? '9+' : totalItems}
                      </span>
                    )}
                  </Link>
                )}

                {/* User menu */}
                {user ? (
                  <Menu as="div" className="relative">
                    <Menu.Button className="flex items-center gap-1.5 rounded-full
                                            focus:outline-none focus:ring-2 focus:ring-green-500
                                            focus:ring-offset-2 p-1">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-green-100 border-2
                                      border-green-200 flex items-center justify-center
                                      text-green-700 font-semibold text-sm flex-shrink-0">
                        {user.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className="hidden lg:block text-left">
                        <div className="text-sm font-medium text-gray-900 max-w-[120px] truncate">
                          {user.name}
                        </div>
                        <div className="text-xs text-gray-500 capitalize">{getDisplayRole()}</div>
                      </div>
                    </Menu.Button>

                    <Menu.Items className="absolute right-0 mt-2 w-48 rounded-xl shadow-lg
                                           bg-white ring-1 ring-black ring-opacity-5
                                           z-50 focus:outline-none overflow-hidden">
                      <div className="py-1">
                        {userNavigation.map((item) => (
                          <Menu.Item key={item.name}>
                            {({ active }) => (
                              <button
                                onClick={item.onClick}
                                className={`w-full text-left px-4 py-2 text-sm text-gray-700 ${
                                  active ? 'bg-gray-50 text-green-700' : ''
                                }`}
                              >
                                {item.name}
                              </button>
                            )}
                          </Menu.Item>
                        ))}
                      </div>
                    </Menu.Items>
                  </Menu>
                ) : (
                  <Link
                    to="/login"
                    className="p-2 text-gray-700 hover:text-green-600 rounded-lg hover:bg-gray-100"
                    aria-label="Login"
                  >
                    <UserIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </Link>
                )}

                {/* ── Hamburger — INSIDE right controls, always last ── */}
                <Disclosure.Button
                  className="md:hidden p-2 rounded-lg text-gray-500 hover:text-gray-700
                             hover:bg-gray-100 focus:outline-none focus:ring-2
                             focus:ring-inset focus:ring-green-500"
                  aria-label={t('header.open_menu')}
                >
                  {open
                    ? <XMarkIcon  className="h-6 w-6" aria-hidden />
                    : <Bars3Icon  className="h-6 w-6" aria-hidden />}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          {/* ── Mobile search overlay ─────────────────────────────── */}
          {showMobileSearch && (
            <div className="fixed inset-0 z-[60] bg-black/40 flex items-start md:hidden">
              <div className="w-full bg-white shadow-lg px-3 py-3 flex items-center gap-2 mt-0">
                <form onSubmit={handleSearch} className="flex-1 relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2
                                                   h-4 w-4 text-gray-400 pointer-events-none" />
                  <input
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm
                               focus:outline-none focus:ring-2 focus:ring-green-500
                               focus:border-transparent"
                    placeholder={t('header.search_placeholder')}
                    type="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoFocus
                  />
                </form>
                <button
                  type="button"
                  onClick={() => setShowMobileSearch(false)}
                  className="p-2 text-gray-500 hover:text-red-500 flex-shrink-0"
                  aria-label={t('header.close_search')}
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}

          {/* ── Mobile menu panel ─────────────────────────────────── */}
          <Disclosure.Panel className="md:hidden border-t border-gray-100">
            {/* Nav links */}
            <nav className="px-2 pt-2 pb-1 space-y-0.5">
              {navigation.map((item) => (
                <Disclosure.Button
                  key={item.href}
                  as={Link}
                  to={item.href}
                  onClick={() => close()}
                  className={mobileLinkClass(item.href)}
                >
                  {item.name}
                </Disclosure.Button>
              ))}
            </nav>

            {/* Language + User */}
            <div className="px-3 py-3 border-t border-gray-100 space-y-3">
              {/* Language switcher */}
              <div className="flex items-center gap-2">
                {['en', 'my'].map((lng) => (
                  <button
                    key={lng}
                    onClick={() => changeLanguage(lng)}
                    className={`flex-1 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                      i18n.language === lng
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {lng === 'en' ? 'English' : t('header.burmese')}
                  </button>
                ))}
              </div>

              {/* User info + actions */}
              {user ? (
                <div>
                  <div className="flex items-center gap-3 mb-2 px-1">
                    <div className="w-10 h-10 rounded-full bg-green-100 border-2 border-green-200
                                    flex items-center justify-center text-green-700
                                    font-semibold flex-shrink-0">
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{user.name}</div>
                      <div className="text-xs text-gray-500 capitalize">{getDisplayRole()}</div>
                    </div>
                  </div>
                  {userNavigation.map((item) => (
                    <Disclosure.Button
                      key={item.name}
                      as="button"
                      onClick={item.onClick}
                      className="block w-full text-left px-3 py-2 text-sm font-medium
                                 text-gray-600 hover:text-green-700 hover:bg-green-50 rounded-lg"
                    >
                      {item.name}
                    </Disclosure.Button>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  <Disclosure.Button
                    as={Link}
                    to="/login"
                    className="w-full flex items-center justify-center py-2 rounded-lg
                               bg-green-600 text-white text-sm font-medium hover:bg-green-700"
                  >
                    {t('header.login')}
                  </Disclosure.Button>
                  <p className="text-center text-xs text-gray-500">
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