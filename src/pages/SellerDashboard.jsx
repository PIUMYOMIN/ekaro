import React, { useState } from "react";
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
  DocumentTextIcon
} from "@heroicons/react/24/outline";
import Sidebar from "../components/layout/Sidebar";
import DashboardSummary from "../components/seller/DashboardSummary";
import OrderManagement from "../components/seller/OrderManagement";
import ProductManagement from "../components/seller/ProductManagement";
import SalesReports from "../components/seller/SalesReports";
import Reviews from "../components/seller/Reviews";
import Customers from "../components/seller/Customers";
import ShippingSettings from "../components/seller/ShippingSettings";
import StoreSettings from "../components/seller/StoreSettings";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const SellerDashboard = () => {
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    {
      name: t("seller.dashboard"),
      icon: ChartBarIcon,
      component: <DashboardSummary />
    },
    {
      name: t("seller.orders"),
      icon: ShoppingBagIcon,
      component: <OrderManagement />
    },
    {
      name: t("seller.products"),
      icon: CubeIcon,
      component: <ProductManagement />
    },
    {
      name: t("seller.sales"),
      icon: CurrencyDollarIcon,
      component: <SalesReports />
    },
    {
      name: t("seller.reviews"),
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
      component: <ShippingSettings />
    },
    { name: t("seller.settings"), icon: CogIcon, component: <StoreSettings /> }
  ];

  return (
    <Tab.Group>
      <div className="flex h-screen bg-gray-50">
        {/* Mobile sidebar toggle */}
        <div className="md:hidden fixed top-4 left-4 z-10">
          <button
            type="button"
            className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <span className="sr-only">
              {t("seller.open_sidebar")}
            </span>
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
        {sidebarOpen &&
          <div
            className="md:hidden fixed inset-0 z-20 bg-black bg-opacity-50"
            onClick={() => setSidebarOpen(false)}
          >
            <div
              className="fixed inset-y-0 left-0 max-w-xs w-full bg-white shadow-lg"
              onClick={e => e.stopPropagation()}
            >
              <Sidebar navigation={navigation} />
            </div>
          </div>}

        {/* Sidebar - Desktop */}
        <div className="hidden md:flex md:flex-shrink-0">
          <div className="flex flex-col w-64 border-r border-gray-200 bg-white">
            <div className="h-0 flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10" />
                <span className="ml-2 text-lg font-bold text-green-600">
                  {t("seller.seller_center")}
                </span>
              </div>
              <nav className="mt-5 flex-1 px-2 space-y-1">
                <Tab.List className="space-y-1">
                  {navigation.map(item =>
                    <Tab
                      key={item.name}
                      className={({ selected }) =>
                        classNames(
                          "group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full text-left",
                          selected
                            ? "bg-green-50 text-green-700"
                            : "text-gray-600 hover:text-green-700 hover:bg-green-50"
                        )}
                    >
                      <item.icon className="mr-3 h-6 w-6" aria-hidden="true" />
                      {item.name}
                    </Tab>
                  )}
                </Tab.List>
              </nav>
            </div>
            <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
              <div className="flex items-center">
                <div className="bg-gray-200 border-2 border-dashed rounded-full w-9 h-9" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">
                    Myanmar Supplier Co.
                  </p>
                  <p className="text-xs font-medium text-gray-500">
                    {t("seller.view_profile")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="max-w-7xl mx-auto">
              {/* Mobile Tabs */}
              <div className="md:hidden mb-6">
                <Tab.List className="flex space-x-1 rounded-xl bg-green-100 p-1 overflow-x-auto">
                  {navigation.map(item =>
                    <Tab
                      key={item.name}
                      className={({ selected }) =>
                        classNames(
                          "w-full rounded-lg py-2.5 text-sm font-medium leading-5",
                          "focus:outline-none focus:ring-2 ring-offset-2 ring-offset-green-400 ring-white ring-opacity-60",
                          selected
                            ? "bg-white shadow text-green-700"
                            : "text-gray-600 hover:bg-white/[0.12] hover:text-green-700"
                        )}
                    >
                      <div className="flex items-center justify-center">
                        <item.icon className="h-5 w-5 mr-2" />
                        <span>
                          {item.name}
                        </span>
                      </div>
                    </Tab>
                  )}
                </Tab.List>
              </div>

              {/* Tab Content */}
              <Tab.Panels className="mt-4">
                {navigation.map((item, idx) =>
                  <Tab.Panel key={idx}>
                    {item.component}
                  </Tab.Panel>
                )}
              </Tab.Panels>
            </div>
          </div>
        </div>
      </div>
    </Tab.Group>
  );
};

export default SellerDashboard;
