// src/components/seller/OrderManagement.jsx
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  CheckCircleIcon,
  ClockIcon,
  TruckIcon,
  XCircleIcon
} from "@heroicons/react/24/solid";

const OrderManagement = () => {
  const { t } = useTranslation();
  const [selectedStatus, setSelectedStatus] = useState("all");

  const statuses = [
    { id: "all", name: t("order.all_orders") },
    { id: "pending", name: t("order.pending") },
    { id: "processing", name: t("order.processing") },
    { id: "shipped", name: t("order.shipped") },
    { id: "delivered", name: t("order.delivered") },
    { id: "cancelled", name: t("order.cancelled") }
  ];

  const orders = [
    {
      id: "ORD-00123",
      date: "2023-05-15",
      customer: "Aung Ko Ko",
      amount: "145,000 MMK",
      status: "pending",
      items: 3
    },
    {
      id: "ORD-00124",
      date: "2023-05-14",
      customer: "Hla Hla",
      amount: "98,500 MMK",
      status: "processing",
      items: 2
    },
    {
      id: "ORD-00125",
      date: "2023-05-13",
      customer: "Mya Mya",
      amount: "245,000 MMK",
      status: "shipped",
      items: 5
    },
    {
      id: "ORD-00126",
      date: "2023-05-12",
      customer: "Zaw Zaw",
      amount: "78,000 MMK",
      status: "delivered",
      items: 1
    },
    {
      id: "ORD-00127",
      date: "2023-05-11",
      customer: "Thida",
      amount: "210,000 MMK",
      status: "cancelled",
      items: 4
    }
  ];

  const filteredOrders =
    selectedStatus === "all"
      ? orders
      : orders.filter(order => order.status === selectedStatus);

  const getStatusIcon = status => {
    switch (status) {
      case "pending":
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case "processing":
        return <ClockIcon className="h-5 w-5 text-blue-500" />;
      case "shipped":
        return <TruckIcon className="h-5 w-5 text-indigo-500" />;
      case "delivered":
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case "cancelled":
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = status => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-indigo-100 text-indigo-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          {t("order.order_management")}
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          {t("order.manage_your_orders")}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {statuses.map(status =>
          <button
            key={status.id}
            className={`px-4 py-2 rounded-full text-sm font-medium ${selectedStatus ===
            status.id
              ? "bg-green-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
            onClick={() => setSelectedStatus(status.id)}
          >
            {status.name}
          </button>
        )}
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {t("order.order_id")}
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {t("order.date")}
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {t("order.customer")}
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {t("order.items")}
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {t("order.amount")}
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {t("order.status")}
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {t("order.action")}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map(order =>
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.customer}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.items}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {order.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {getStatusIcon(order.status)}
                      <span className="ml-1 capitalize">
                        {t(`order.${order.status}`)}
                      </span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button className="text-green-600 hover:text-green-900">
                      {t("order.view_details")}
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
          <div className="text-sm text-gray-500">
            {t("order.showing")} <span className="font-medium">1-5</span>{" "}
            {t("order.of")} <span className="font-medium">24</span>{" "}
            {t("order.results")}
          </div>
          <div className="flex space-x-2">
            <button className="px-3 py-1 rounded-md bg-white border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50">
              {t("order.previous")}
            </button>
            <button className="px-3 py-1 rounded-md bg-white border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50">
              {t("order.next")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderManagement;
