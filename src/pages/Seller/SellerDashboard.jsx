import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Tab } from "@headlessui/react";
import {
  ChartBarIcon,
  ShoppingBagIcon,
  CubeIcon,
  CurrencyDollarIcon,
  StarIcon,
  UserGroupIcon,
  TruckIcon,
  CogIcon,
  BuildingStorefrontIcon,
} from "@heroicons/react/24/outline";
import Sidebar from "../../components/layout/Sidebar";
import DashboardSummary from "../../components/seller/DashboardSummary";
import OrderManagement from "../../components/seller/OrderManagement";
import ProductManagement from "../../components/seller/ProductManagement";
import SalesReports from "../../components/seller/SalesReports";
import Reviews from "../../components/seller/Reviews.jsx";
import Customers from "./Customers";
import ShippingSettings from "../../components/seller/ShippingSettings";
import StoreSettings from "../../components/seller/StoreSettings";
import MyStore from "../../components/seller/MyStore";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";
import { useLocation } from "react-router-dom";
import DeliveryManagement from "../../components/seller/DeliveryManagement";
import { useNavigate } from "react-router-dom";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const SellerDashboard = () => {
  const location = useLocation();
  const { state } = location;
  const { t } = useTranslation();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [storeData, setStoreData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [onboardingStatus, setOnboardingStatus] = useState(null);
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0
  });

  // Check onboarding status first
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user) return;

      try {
        // First, check if user is a seller
        if (user.type !== 'seller' && !user.roles?.includes('seller')) {
          // User is not a seller, redirect to appropriate page
          navigate('/');
          return;
        }

        // Check onboarding status
        const response = await api.get('/seller/onboarding/status');
        
        if (response.data.success) {
          const statusData = response.data.data;
          setOnboardingStatus(statusData);

          // If onboarding is not complete, redirect to onboarding
          if (statusData.needs_onboarding || !statusData.onboarding_complete) {
            console.log('Onboarding incomplete, redirecting to:', statusData.current_step);
            
            // Determine where to redirect
            let redirectPath = '/seller/onboarding/store-basic';
            
            if (statusData.current_step) {
              redirectPath = `/seller/onboarding/${statusData.current_step}`;
            }
            
            navigate(redirectPath, { replace: true });
            return;
          }

          // If onboarding is complete, fetch store data
          fetchStoreData();
        }
      } catch (error) {
        console.error("Failed to check onboarding status:", error);
        // If there's an error, assume onboarding needed
        navigate('/seller/onboarding/store-basic');
      }
    };

    checkOnboardingStatus();
  }, [user, navigate]);

  // Show success message if redirected from onboarding
  useEffect(() => {
    if (state?.success && state?.message) {
      // You can show a toast notification here
      console.log('🎉 Success:', state.message);
      
      // Clear the state to prevent showing the message again on refresh
      window.history.replaceState({}, document.title);
    }
  }, [state]);

  // Fetch store data and stats - only called if onboarding is complete
  const fetchStoreData = useCallback(async () => {
    try {
      const [storeResponse, statsResponse] = await Promise.all([
        api.get("/seller/my-store"),
        api.get("/seller/sales-summary")
      ]);

      setStoreData(storeResponse.data.data);

      if (statsResponse.data.success) {
        const salesData = statsResponse.data.data.sales || {};
        setStats({
          totalProducts: statsResponse.data.data.products?.total || 0,
          totalOrders: salesData.total_orders || 0,
          totalRevenue: salesData.total_revenue || 0,
          pendingOrders: statsResponse.data.data.orders_by_status?.pending || 0
        });
      }
    } catch (error) {
      console.error("Failed to fetch store data:", error);
      
      // If store data fetch fails, check if profile exists
      if (error.response?.status === 404) {
        // Profile doesn't exist, redirect to onboarding
        navigate('/seller/onboarding/store-basic');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Refresh function that can be passed to child components
  const refreshStoreData = useCallback(() => {
    fetchStoreData();
  }, [fetchStoreData]);

  useEffect(() => {
    if (user) {
      fetchStoreData();
    }
  }, [user, fetchStoreData]);

  // Set up polling for real-time updates (every 30 seconds)
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      fetchStoreData();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [user, fetchStoreData]);

  const navigation = [
    {
      name: t("seller.dashboard"),
      icon: ChartBarIcon,
      component: <DashboardSummary storeData={storeData} stats={stats} refreshData={refreshStoreData} />
    },
    {
      name: t("seller.my_store"),
      icon: BuildingStorefrontIcon,
      component: <MyStore storeData={storeData} stats={stats} refreshData={refreshStoreData} />
    },
    {
      name: t("seller.order.title"),
      icon: ShoppingBagIcon,
      component: <OrderManagement refreshData={refreshStoreData} />
    },
    {
      name: "Delivery Management",
      icon: TruckIcon,
      component: <DeliveryManagement refreshData={refreshStoreData} />
    },
    {
      name: t("seller.product.title"),
      icon: CubeIcon,
      component: <ProductManagement refreshData={refreshStoreData} />
    },
    {
      name: t("seller.sales"),
      icon: CurrencyDollarIcon,
      component: <SalesReports refreshData={refreshStoreData} />
    },
    {
      name: t("seller.reviews.title"),
      icon: StarIcon,
      component: <Reviews />
    },
    {
      name: t("seller.customers"),
      icon: UserGroupIcon,
      component: <Customers />
    },
    {
      name: t("seller.shipping"),
      icon: TruckIcon,
      component: <ShippingSettings storeData={storeData} />
    },
    {
      name: t("seller.settings"),
      icon: CogIcon,
      component: (
        <StoreSettings storeData={storeData} setStoreData={setStoreData} refreshData={refreshStoreData} />
      )
    }
  ];

  if (loading || !onboardingStatus) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-green-50 to-blue-50 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking your seller status...</p>
        </div>
      </div>
    );
  }

  // Show onboarding prompt if somehow still here but needs onboarding
  if (onboardingStatus.needs_onboarding || !onboardingStatus.onboarding_complete) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-green-50 to-blue-50 items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <BuildingStorefrontIcon className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Store Setup</h2>
          <p className="text-gray-600 mb-6">
            Before you can access your seller dashboard, you need to complete your store setup.
          </p>
          <div className="space-y-4">
            <button
              onClick={() => navigate('/seller/onboarding/store-basic')}
              className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-lg"
            >
              Start Store Setup
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Tab.Group>
      <div className="flex h-screen bg-gradient-to-br from-green-50 to-blue-50">
        {/* Status Indicators */}
        <div className="absolute top-4 left-4 md:left-auto md:right-4 z-10">
          <div className="flex items-center space-x-2 text-sm">
            {storeData?.status === "pending" && (
              <div className="flex items-center space-x-2 text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                <span>Pending Approval</span>
              </div>
            )}
            {storeData?.status === "approved" && (
              <div className="flex items-center space-x-2 text-green-600 bg-green-50 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Store Active</span>
              </div>
            )}
            {storeData?.status === "pending_setup" && (
              <div className="flex items-center space-x-2 text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span>Setup Required</span>
              </div>
            )}
          </div>
        </div>

        {/* Mobile sidebar toggle */}
        <div className="md:hidden fixed top-4 left-4 z-20">
          <button
            type="button"
            className="inline-flex items-center justify-center p-2 rounded-lg bg-white shadow-lg text-gray-500 hover:text-green-600 hover:bg-green-50 transition-all duration-200"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <span className="sr-only">{t("seller.open_sidebar")}</span>
            <svg
              className="h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        {/* Sidebar - Mobile */}
        {sidebarOpen && (
          <div
            className="md:hidden fixed inset-0 z-30 bg-black bg-opacity-50 transition-opacity"
            onClick={() => setSidebarOpen(false)}
          >
            <div
              className="fixed inset-y-0 left-0 max-w-xs w-full bg-white shadow-xl transform transition-transform"
              onClick={(e) => e.stopPropagation()}
            >
              <Sidebar
                navigation={navigation}
                onClose={() => setSidebarOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Sidebar - Desktop */}
        <div className="hidden md:flex md:flex-shrink-0">
          <div className="flex flex-col w-80 bg-white/80 backdrop-blur-lg border-r border-gray-200/60 shadow-xl">
            <div className="flex-1 flex flex-col pt-8 pb-4 overflow-y-auto">
              {/* Store Header */}
              <div className="flex items-center px-6 mb-8">
                <div className="relative">
                  {storeData?.store_logo ? (
                    <img
                      src={storeData.store_logo}
                      alt={storeData.store_name}
                      className="w-12 h-12 rounded-2xl object-cover border-2 border-green-200 shadow-lg"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <BuildingStorefrontIcon className="h-6 w-6 text-white" />
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
                </div>
                <div className="ml-4">
                  <h1 className="text-lg font-bold text-gray-900 truncate max-w-[180px]">
                    {storeData?.store_name || t("seller.seller_center")}
                  </h1>
                  <p className="text-sm text-green-600 font-medium">
                    Seller Account
                  </p>
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex-1 px-4 space-y-2">
                <Tab.List className="space-y-2">
                  {navigation.map((item) => (
                    <Tab
                      key={item.name}
                      className={({ selected }) =>
                        classNames(
                          "group flex items-center px-4 py-3 text-sm font-medium rounded-2xl w-full text-left transition-all duration-200",
                          selected
                            ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-200"
                            : "text-gray-600 hover:text-green-700 hover:bg-white hover:shadow-md"
                        )
                      }
                    >
                      <item.icon
                        className={classNames(
                          "mr-3 h-5 w-5 transition-all duration-200",
                          "group-[:not([class*='bg-gradient'])]:text-gray-400",
                          "group-hover:scale-110"
                        )}
                      />
                      {item.name}
                    </Tab>
                  ))}
                </Tab.List>
              </nav>
            </div>

            {/* User Profile Footer */}
            <div className="flex-shrink-0 border-t border-gray-200/60 p-6 bg-white/50">
              <div className="flex items-center">
                <div className="relative">
                  {user?.profile_photo ? (
                    <img
                      src={user.profile_photo}
                      alt={user.name}
                      className="w-10 h-10 rounded-xl object-cover border-2 border-green-200"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-600 rounded-xl flex items-center justify-center">
                      <span className="text-sm font-medium text-white">
                        {user?.name?.charAt(0)?.toUpperCase() || "U"}
                      </span>
                    </div>
                  )}
                </div>
                <div className="ml-3 min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.email}
                  </p>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                <div className="text-center p-2 bg-green-50 rounded-lg">
                  <div className="font-bold text-green-700">
                    {stats.totalProducts}
                  </div>
                  <div className="text-gray-600">Products</div>
                </div>
                <div className="text-center p-2 bg-blue-50 rounded-lg">
                  <div className="font-bold text-blue-700">
                    {stats.totalOrders}
                  </div>
                  <div className="text-gray-600">Orders</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header Bar */}
          <div className="flex-shrink-0 bg-white/80 backdrop-blur-lg border-b border-gray-200/60">
            <div className="flex items-center justify-between px-6 py-4">
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  Seller Center
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Manage your store and grow your business
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>Store Active</span>
                </div>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 sm:p-6">
              {/* Mobile Tabs */}
              <div className="md:hidden mb-6">
                <Tab.List className="flex space-x-2 rounded-2xl bg-white/80 backdrop-blur-lg p-2 shadow-lg overflow-x-auto">
                  {navigation.map((item) => (
                    <Tab
                      key={item.name}
                      className={({ selected }) =>
                        classNames(
                          "flex-1 min-w-[120px] rounded-xl py-3 text-sm font-medium leading-5 transition-all duration-200",
                          "focus:outline-none focus:ring-2 ring-offset-2 ring-offset-green-400 ring-white ring-opacity-60",
                          selected
                            ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg"
                            : "text-gray-600 hover:text-green-700 hover:bg-white hover:shadow-md"
                        )
                      }
                    >
                      <div className="flex flex-col items-center justify-center space-y-1">
                        <item.icon className="h-5 w-5" />
                        <span className="text-xs">{item.name}</span>
                      </div>
                    </Tab>
                  ))}
                </Tab.List>
              </div>

              {/* Tab Content */}
              <Tab.Panels className="mt-2">
                {navigation.map((item, idx) => (
                  <Tab.Panel key={idx} className="focus:outline-none">
                    {item.component}
                  </Tab.Panel>
                ))}
              </Tab.Panels>
            </div>
          </div>
        </div>
      </div>
    </Tab.Group>
  );
};

export default SellerDashboard;