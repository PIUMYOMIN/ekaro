// src/components/seller/DashboardSummary.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import { ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/solid";
import { Bar } from "react-chartjs-2";
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

const DashboardSummary = () => {
  const { t } = useTranslation();

  const stats = [
    {
      name: t("seller.total_revenue"),
      value: "2,450,000 MMK",
      change: "+12%",
      changeType: "positive"
    },
    {
      name: t("seller.total_orders"),
      value: "124",
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
      value: "19,758 MMK",
      change: "+2.3%",
      changeType: "positive"
    }
  ];

  const data = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: t("seller.revenue"),
        data: [450000, 780000, 1020000, 1450000, 1890000, 2450000],
        backgroundColor: "rgba(5, 150, 105, 0.8)"
      },
      {
        label: t("seller.orders"),
        data: [24, 42, 68, 79, 102, 124],
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
        <h2 className="text-xl font-semibold text-gray-900">
          {t("seller.overview")}
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          {t("seller.dashboard_summary")}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(stat =>
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
              {[1, 2, 3, 4, 5].map((item, idx) =>
                <li key={idx}>
                  <div className="relative pb-8">
                    {idx !== 4
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
                              #ORD-00{item * 23}
                            </span>
                          </p>
                        </div>
                        <div className="text-right text-sm whitespace-nowrap text-gray-500">
                          <time dateTime="2023-05-01">1 hour ago</time>
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
            {[1, 2, 3, 4].map(item =>
              <div key={item} className="flex items-start">
                <div className="bg-gray-200 border-2 border-dashed rounded-md w-16 h-16" />
                <div className="ml-4 flex-1">
                  <h4 className="font-medium text-gray-900">
                    Organic Rice - Grade A
                  </h4>
                  <div className="flex items-center mt-1">
                    <p className="text-sm text-gray-500">
                      {t("seller.sold")}: 124
                    </p>
                    <span className="mx-2 text-gray-300">•</span>
                    <p className="text-sm text-gray-500">
                      {t("seller.revenue")}: 1,240,000 MMK
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSummary;
