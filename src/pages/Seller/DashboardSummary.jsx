import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/solid";
import { Bar } from "react-chartjs-2";
import api from "../../utils/api";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const DashboardSummary = ({ storeData, stats, refreshData }) => {
  const { t } = useTranslation();
  const [recentActivity, setRecentActivity] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0
  });

  // Fetch dashboard data from API
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [salesSummaryResponse, recentOrdersResponse] = await Promise.all([
          api.get("/dashboard/seller/sales-summary"),
          api.get("/dashboard/seller/recent-orders")
        ]);

        if (salesSummaryResponse.data.success) {
          const salesData = salesSummaryResponse.data.data.sales || {};
          setDashboardStats({
            totalProducts: salesSummaryResponse.data.data.products?.total || 0,
            totalOrders: salesData.total_orders || 0,
            totalRevenue: salesData.total_revenue || 0,
            pendingOrders: salesSummaryResponse.data.data.orders_by_status?.pending || 0
          });
        }

        if (recentOrdersResponse.data.success) {
          setRecentActivity(recentOrdersResponse.data.data.slice(0, 5));
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      }
    };

    fetchDashboardData();
  }, [stats.totalOrders]); // Refetch when orders change

  // Calculate dynamic stats based on actual data
  const dynamicStats = [
    {
      name: t("seller.total_revenue"),
      value: `${dashboardStats.totalRevenue?.toLocaleString()} MMK` || "0 MMK",
      change: "+12%",
      changeType: "positive"
    },
    {
      name: t("seller.total_orders"),
      value: dashboardStats.totalOrders?.toString() || "0",
      change: "+5.4%",
      changeType: "positive"
    },
    {
      name: t("seller.conversion_rate"),
      value: "4.7%",
      change: "-1.2%",
      changeType: "negative"
    },
    {
      name: t("seller.avg_order_value"),
      value: dashboardStats.totalOrders > 0 
        ? `${Math.round(dashboardStats.totalRevenue / dashboardStats.totalOrders).toLocaleString()} MMK` 
        : "0 MMK",
      change: "+2.3%",
      changeType: "positive"
    }
  ];

  const data = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: t("seller.revenue"),
        data: [450000, 780000, 1020000, 1450000, 1890000, dashboardStats.totalRevenue || 2450000],
        backgroundColor: "rgba(5, 150, 105, 0.8)"
      },
      {
        label: t("seller.orders"),
        data: [24, 42, 68, 79, 102, dashboardStats.totalOrders || 124],
        backgroundColor: "rgba(16, 185, 129, 0.8)"
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top"
      },
      title: {
        display: true,
        text: t("seller.sales_overview")
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          {t("seller.overview")}
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          {t("seller.dashboard_summary")}
        </p>
      </div>

      {/* Store Status Banner */}
      {storeData && (
        <div className={`p-4 rounded-lg ${
          storeData.status === "approved" 
            ? "bg-green-50 border border-green-200" 
            : storeData.status === "pending"
            ? "bg-yellow-50 border border-yellow-200"
            : "bg-blue-50 border border-blue-200"
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-3 ${
                storeData.status === "approved" 
                  ? "bg-green-500" 
                  : storeData.status === "pending"
                  ? "bg-yellow-500 animate-pulse"
                  : "bg-blue-500"
              }`}></div>
              <div>
                <h3 className="font-semibold">
                  {storeData.status === "approved" 
                    ? "Store Active" 
                    : storeData.status === "pending"
                    ? "Pending Approval"
                    : "Setup Required"}
                </h3>
                <p className="text-sm opacity-75">
                  {storeData.status === "approved" 
                    ? "Your store is live and accepting orders" 
                    : storeData.status === "pending"
                    ? "Your store is under review by our team"
                    : "Please complete your store setup"}
                </p>
              </div>
            </div>
            <button
              onClick={refreshData}
              className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors"
            >
              Refresh Data
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {dynamicStats.map(stat =>
          <div
            key={stat.name}
            className="bg-white overflow-hidden shadow rounded-lg"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="bg-gray-200 border-2 border-dashed rounded-full w-12 h-12" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stat.value}
                      </div>
                      <div
                        className={`ml-2 flex items-baseline text-sm font-semibold ${stat.changeType ===
                        "positive"
                          ? "text-green-600"
                          : "text-red-600"}`}
                      >
                        {stat.changeType === "positive"
                          ? <ArrowUpIcon className="h-4 w-4 text-green-500" />
                          : <ArrowDownIcon className="h-4 w-4 text-red-500" />}
                        <span className="sr-only">
                          {stat.changeType === "positive"
                            ? t("seller.increased")
                            : t("seller.decreased")}{" "}
                          by
                        </span>
                        {stat.change}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <Bar data={data} options={options} />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="bg-white shadow rounded-lg p-6 lg:col-span-2">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {t("seller.recent_activity")}
          </h3>
          <div className="flow-root">
            <ul className="-mb-8">
              {recentActivity.map((order, idx) =>
                <li key={order.id}>
                  <div className="relative pb-8">
                    {idx !== recentActivity.length - 1
                      ? <span
                          className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                          aria-hidden="true"
                        />
                      : null}
                    <div className="relative flex space-x-3">
                      <div>
                        <span className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center ring-8 ring-white">
                          <svg
                            className="h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p className="text-sm text-gray-500">
                            {t("seller.order_completed")}{" "}
                            <span className="font-medium text-gray-900">
                              {order.order_number}
                            </span>
                          </p>
                          <p className="text-sm text-gray-500">
                            Customer: {order.buyer?.name}
                          </p>
                        </div>
                        <div className="text-right text-sm whitespace-nowrap text-gray-500">
                          <div className="font-medium text-gray-900">
                            {order.total_amount?.toLocaleString()} MMK
                          </div>
                          <time>{order.created_at}</time>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {t("seller.top_products")}
          </h3>
          <div className="space-y-4">
            {/* Top products will be fetched from API */}
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading top products...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSummary;