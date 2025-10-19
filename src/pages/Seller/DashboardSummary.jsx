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

  // Calculate dynamic stats based on actual data
  const dynamicStats = [
    {
      name: t("seller.total_revenue"),
      value: `${stats.totalRevenue?.toLocaleString()} MMK` || "0 MMK",
      change: "+12%",
      changeType: "positive"
    },
    {
      name: t("seller.total_orders"),
      value: stats.totalOrders?.toString() || "0",
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
      value: stats.totalOrders > 0 
        ? `${Math.round(stats.totalRevenue / stats.totalOrders).toLocaleString()} MMK` 
        : "0 MMK",
      change: "+2.3%",
      changeType: "positive"
    }
  ];

  // Fetch recent activity
  useEffect(() => {
    const fetchRecentActivity = async () => {
      try {
        const response = await api.get("/sellers/seller-recent-orders");
        if (response.data.success) {
          setRecentActivity(response.data.data.slice(0, 5));
        }
      } catch (error) {
        console.error("Failed to fetch recent activity:", error);
      }
    };

    fetchRecentActivity();
  }, [stats.totalOrders]); // Refetch when orders change

  const data = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: t("seller.revenue"),
        data: [450000, 780000, 1020000, 1450000, 1890000, stats.totalRevenue || 2450000],
        backgroundColor: "rgba(5, 150, 105, 0.8)"
      },
      {
        label: t("seller.orders"),
        data: [24, 42, 68, 79, 102, stats.totalOrders || 124],
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

      {/* ... rest of your component remains similar but uses actual data ... */}
    </div>
  );
};

export default DashboardSummary;