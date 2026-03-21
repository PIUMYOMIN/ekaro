// pages/AdminDashboard.js (excerpt – only relevant changes shown)
import React, { useState, useEffect } from "react";
import { Tab } from "@headlessui/react";
import {
  ChartBarIcon,
  UserGroupIcon,
  ShoppingBagIcon,
  CubeIcon,
  CurrencyDollarIcon,
  CogIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  StarIcon,
  TruckIcon,
  ShieldCheckIcon,
  BriefcaseIcon,
  BellIcon,
  EnvelopeIcon
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";
import Sidebar from "../../components/layout/Sidebar";
import PlatformLogistics from "../../components/admin/PlatformLogistics";
import BusinessTypeManagement from "../../components/admin/BusinessTypeManagement";
import UserManagement from "../../components/admin/UserManagement";
import SellersManagement from "../../components/admin/SellersManagement";
import DashboardOverview from "../../components/admin/DashboardOverview";
import ProductManagement from "../../components/admin/ProductManagement";          // self‑contained
import ReviewManagement from "../../components/admin/ReviewManagement";
import OrderManagement from "../../components/admin/OrderManagement";
import AnalyticsManagement from "../../components/admin/AnalyticsManagement";
import CategoryManagement from "../../components/admin/CategoryManagement";        // self‑contained
import SellerVerificationManagement from "../../components/admin/SellerVerificationManagement";
import Notifications from "../../components/admin/Notifications";
import Settings from "../../components/admin/Settings";
import ContactMessagesManagement from '../../components/admin/ContactMessagesManagement';
import SEO from "../../components/SEO/seo";

const AdminDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  // State for components that still need props (only DashboardOverview and OrderManagement)
  const [dashboardData, setDashboardData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [mainSearchTerm, setMainSearchTerm] = useState("");

  // Loading states
  const [isDashboardLoading, setIsDashboardLoading] = useState(false);
  const [isOrdersLoading, setIsOrdersLoading] = useState(false);

  // Error states
  const [dashboardError, setDashboardError] = useState(null);
  const [ordersError, setOrdersError] = useState(null);

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  // Dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsDashboardLoading(true);
      setDashboardError(null);
      try {
        const response = await api.get("/admin");
        setDashboardData(response.data);
      } catch (error) {
        setDashboardError(error);
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsDashboardLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // Orders tab
  useEffect(() => {
    if (activeTab !== 6) return;
    const fetchOrders = async () => {
      setIsOrdersLoading(true);
      setOrdersError(null);
      try {
        const response = await api.get("/orders");
        const ordersData = response.data.data || response.data;
        setOrders(Array.isArray(ordersData) ? ordersData : []);
      } catch (error) {
        setOrdersError(error);
        console.error("Error fetching orders:", error);
      } finally {
        setIsOrdersLoading(false);
      }
    };
    fetchOrders();
  }, [activeTab]);

  // Refresh handler (only for components that still need it)
  const handleRefresh = async () => {
    switch (activeTab) {
      case 0:
        setIsDashboardLoading(true);
        try {
          const response = await api.get("/admin");
          setDashboardData(response.data);
        } catch (error) {
          setDashboardError(error);
        } finally {
          setIsDashboardLoading(false);
        }
        break;
      case 6:
        setIsOrdersLoading(true);
        try {
          const response = await api.get("/orders");
          const ordersData = response.data.data || response.data;
          setOrders(Array.isArray(ordersData) ? ordersData : []);
        } catch (error) {
          setOrdersError(error);
        } finally {
          setIsOrdersLoading(false);
        }
        break;
      default:
        break;
    }
  };

  // Order status update (still needed)
  const updateOrderStatus = async (orderId, status) => {
    try {
      let endpoint = "";
      if (status === "confirmed") endpoint = "confirm";
      else if (status === "shipped") endpoint = "ship";
      else if (status === "cancelled") endpoint = "cancel";

      if (endpoint) {
        await api.post(`/orders/${orderId}/${endpoint}`);
      } else {
        await api.put(`/orders/${orderId}`, { status });
      }

      setOrders(orders.map((order) =>
        order.id === orderId ? { ...order, status } : order
      ));
    } catch (error) {
      console.error("Failed to update order status:", error);
    }
  };

  const navigation = [
    {
      name: t("dashboard"),
      icon: ChartBarIcon,
      component: <DashboardOverview data={dashboardData} loading={isDashboardLoading} error={dashboardError} />
    },
    {
      name: "Notifications",
      icon: BellIcon,
      component: <Notifications />
    },
    {
      name: "Contact Messages",
      icon: EnvelopeIcon,
      component: <ContactMessagesManagement />
    },
    {
      name: t("users"),
      icon: UserGroupIcon,
      component: <UserManagement />
    },
    {
      name: "Sellers",
      icon: UserGroupIcon,
      component: <SellersManagement />
    },
    {
      name: "Seller Verification",
      icon: ShieldCheckIcon,
      component: <SellerVerificationManagement />
    },
    {
      name: t("seller.product.title"),
      icon: CubeIcon,
      component: <ProductManagement />
    },
    {
      name: t("Seller Reviews"),
      icon: StarIcon,
      component: <ReviewManagement />
    },
    {
      name: t("orders"),
      icon: ShoppingBagIcon,
      component: (
        <OrderManagement
          orders={orders}
          loading={isOrdersLoading}
          error={ordersError}
          updateOrderStatus={updateOrderStatus}
        />
      )
    },
    {
      name: "Platform Logistics",
      icon: TruckIcon,
      component: <PlatformLogistics />
    },
    {
      name: "Categories",
      icon: CubeIcon,
      component: <CategoryManagement />
    },
    {
      name: "Business Types",
      icon: BriefcaseIcon,
      component: <BusinessTypeManagement />
    },
    {
      name: t("analytics"),
      icon: CurrencyDollarIcon,
      component: <AnalyticsManagement products={[]} />
    },
    {
      name: t("settings"),
      icon: CogIcon,
      component: <Settings />
    }
  ];

  return (
    <>
      <SEO
        title="Admin Dashboard"
        description="Manage users, products, orders, and more in the admin dashboard."
        url="/admin/dashboard"
        noindex={true}
      />
      <Tab.Group selectedIndex={activeTab} onChange={setActiveTab}>
        <div className="flex h-screen bg-gray-50">
          {/* Mobile sidebar toggle */}
          <div className="md:hidden fixed top-4 left-4 z-10">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <span className="sr-only">{t("sidebar.open")}</span>
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Mobile overlay */}
          {sidebarOpen && (
            <div className="md:hidden fixed inset-0 z-20 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)}>
              <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-white shadow-lg" onClick={(e) => e.stopPropagation()}>
                <Sidebar navigation={navigation} />
              </div>
            </div>
          )}

          {/* Desktop sidebar */}
          <div className="hidden md:flex md:flex-shrink-0">
            <div className="flex flex-col w-64 border-r border-gray-200 bg-white">
              <div className="h-0 flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                <div className="flex items-center flex-shrink-0 px-4">
                  <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10" />
                  <span className="ml-2 text-lg font-bold text-green-600">{t("app_name")}</span>
                </div>
                <nav className="mt-5 flex-1 px-2 space-y-1">
                  <Tab.List className="space-y-1">
                    {navigation.map((item) => (
                      <Tab
                        key={item.name}
                        className={({ selected }) =>
                          `group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full text-left ${
                            selected
                              ? "bg-green-50 text-green-700"
                              : "text-gray-600 hover:text-green-700 hover:bg-green-50"
                          }`
                        }
                      >
                        <item.icon className="mr-3 h-6 w-6" aria-hidden="true" />
                        {item.name}
                      </Tab>
                    ))}
                  </Tab.List>
                </nav>
              </div>
              <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
                <div className="flex items-center">
                  <div className="bg-gray-200 border-2 border-dashed rounded-full w-9 h-9" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-700">{t("admin.user")}</p>
                    <p className="text-xs font-medium text-gray-500">{t("admin.role")}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="bg-white shadow-sm">
              <div className="px-4 py-4 sm:px-6 flex justify-between items-center">
                <div className="relative w-full max-w-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder={t("search.placeholder")}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    value={mainSearchTerm}
                    onChange={(e) => setMainSearchTerm(e.target.value)}
                  />
                </div>
                <button
                  className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  onClick={handleRefresh}
                >
                  <ArrowPathIcon className="h-4 w-4 mr-2" />
                  {t("refresh")}
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <div className="max-w-7xl mx-auto">
                <div className="md:hidden mb-6">
                  <Tab.List className="flex space-x-1 rounded-xl bg-green-100 p-1 overflow-x-auto">
                    {navigation.map((item) => (
                      <Tab
                        key={item.name}
                        className={({ selected }) =>
                          `w-full rounded-lg py-2.5 text-sm font-medium leading-5 focus:outline-none focus:ring-2 ring-offset-2 ring-offset-green-400 ring-white ring-opacity-60 ${
                            selected
                              ? "bg-white shadow text-green-700"
                              : "text-gray-600 hover:bg-white/[0.12] hover:text-green-700"
                          }`
                        }
                      >
                        <div className="flex items-center justify-center">
                          <item.icon className="h-5 w-5 mr-2" />
                          <span>{item.name}</span>
                        </div>
                      </Tab>
                    ))}
                  </Tab.List>
                </div>

                <Tab.Panels className="mt-4">
                  {navigation.map((item, idx) => (
                    <Tab.Panel key={idx}>{item.component}</Tab.Panel>
                  ))}
                </Tab.Panels>
              </div>
            </div>
          </div>
        </div>
      </Tab.Group>
    </>
  );
};

export default AdminDashboard;