import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  CheckCircleIcon,
  ClockIcon,
  TruckIcon,
  XCircleIcon,
  EyeIcon,
  ShoppingBagIcon
} from "@heroicons/react/24/solid";
import api from "../../utils/api";

const OrderManagement = () => {
  const { t } = useTranslation();
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const statuses = [
    { id: "all", name: t("seller.order.all_orders") },
    { id: "pending", name: t("seller.order.pending") },
    { id: "confirmed", name: t("seller.order.confirmed") },
    { id: "processing", name: t("seller.order.processing") },
    { id: "shipped", name: t("seller.order.shipped") },
    { id: "delivered", name: t("seller.order.delivered") },
    { id: "cancelled", name: t("seller.order.cancelled") }
  ];

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get("/orders");
      setOrders(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      let endpoint = "";
      let data = {};

      switch (status) {
        case "confirmed":
          endpoint = `confirm`;
          break;
        case "processing":
          endpoint = `process`;
          break;
        case "shipped":
          endpoint = `ship`;
          data = {
            tracking_number: `TRK-${orderId}`,
            shipping_carrier: "Standard Shipping"
          };
          break;
        default:
          return;
      }

      const response = await api.post(`/orders/${orderId}/${endpoint}`, data);

      if (response.data.success) {
        await fetchOrders(); // Refresh orders
        // Show success message
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error(`Failed to update order status to ${status}:`, error);
      const errorMessage = error.response?.data?.message || error.message;
      alert(`Failed to update order: ${errorMessage}`);
    }
  };

  const filteredOrders =
    selectedStatus === "all"
      ? orders
      : orders.filter((order) => order.status === selectedStatus);

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case "confirmed":
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

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
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

  const formatMMK = (amount) => {
    return new Intl.NumberFormat("en-MM", {
      style: "currency",
      currency: "MMK",
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          {t("seller.order.order_management")}
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          {t("seller.order.manage_your_orders")}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {statuses.map((status) => (
          <button
            key={status.id}
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              selectedStatus === status.id
                ? "bg-green-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            onClick={() => setSelectedStatus(status.id)}
          >
            {status.name}
          </button>
        ))}
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
              {filteredOrders.map((order) => {
                const shippingAddress =
                  typeof order.shipping_address === "string"
                    ? JSON.parse(order.shipping_address)
                    : order.shipping_address;

                return (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{order.order_number || order.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {shippingAddress?.full_name || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.items?.length || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {formatMMK(order.total_amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {getStatusIcon(order.status)}
                        <span className="ml-1 capitalize">{order.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 space-x-2">
                      <button
                        onClick={() => handleViewDetails(order)}
                        className="text-green-600 hover:text-green-900"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      {order.status === "pending" && (
                        <button
                          onClick={() =>
                            updateOrderStatus(order.id, "confirmed")
                          }
                          className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                        >
                          Confirm
                        </button>
                      )}
                      {order.status === "confirmed" && (
                        <button
                          onClick={() => updateOrderStatus(order.id, "shipped")}
                          className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                        >
                          Ship
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <ShoppingBagIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Orders Found
            </h3>
            <p className="text-gray-600">
              No orders match the selected criteria.
            </p>
          </div>
        )}

        <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
          <div className="text-sm text-gray-500">
            {t("order.showing")}{" "}
            <span className="font-medium">1-{filteredOrders.length}</span>{" "}
            {t("order.of")}{" "}
            <span className="font-medium">{filteredOrders.length}</span>{" "}
            {t("order.results")}
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onStatusUpdate={updateOrderStatus}
        />
      )}
    </div>
  );
};

// Order Details Modal Component
const OrderDetailsModal = ({ order, isOpen, onClose, onStatusUpdate }) => {
  if (!isOpen) return null;

  const shippingAddress =
    typeof order.shipping_address === "string"
      ? JSON.parse(order.shipping_address)
      : order.shipping_address;

  const formatMMK = (amount) => {
    return new Intl.NumberFormat("en-MM", {
      style: "currency",
      currency: "MMK",
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">
                Order Details - #{order.order_number || order.id}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          <div className="bg-white px-6 py-4 max-h-96 overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Order Items */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">
                  Order Items
                </h4>
                <div className="space-y-3">
                  {order.items?.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-white rounded-lg border border-gray-200 flex items-center justify-center">
                          {item.product_data?.images?.[0] ? (
                            <img
                              src={item.product_data.images[0]}
                              alt={item.product_name}
                              className="w-10 h-10 object-cover rounded"
                            />
                          ) : (
                            <CubeIcon className="h-6 w-6 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-900 text-sm">
                            {item.product_name}
                          </h5>
                          <p className="text-xs text-gray-500">
                            Qty: {item.quantity}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatMMK(item.price)} each
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 text-sm">
                          {formatMMK(item.subtotal)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Information */}
              <div className="space-y-6">
                {/* Shipping Information */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-3">
                    Shipping Information
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600">
                      <p className="font-medium">
                        {shippingAddress?.full_name}
                      </p>
                      <p>{shippingAddress?.phone}</p>
                      <p className="mt-1">{shippingAddress?.address}</p>
                      <p>
                        {shippingAddress?.city}, {shippingAddress?.state}
                        {shippingAddress?.postal_code &&
                          `, ${shippingAddress.postal_code}`}
                      </p>
                      <p>{shippingAddress?.country}</p>
                    </div>
                  </div>
                </div>

                {/* Order Summary */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-3">
                    Order Summary
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="font-medium">
                          {formatMMK(order.subtotal_amount)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Shipping Fee:</span>
                        <span className="font-medium">
                          {formatMMK(order.shipping_fee)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tax:</span>
                        <span className="font-medium">
                          {formatMMK(order.tax_amount)}
                        </span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-gray-200">
                        <span className="text-lg font-semibold text-gray-900">
                          Total:
                        </span>
                        <span className="text-lg font-semibold text-green-600">
                          {formatMMK(order.total_amount)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-6 py-3 flex justify-end space-x-3">
            {order.status === "pending" && (
              <button
                onClick={() => {
                  onStatusUpdate(order.id, "confirmed");
                  onClose();
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
              >
                Confirm Order
              </button>
            )}
            {order.status === "confirmed" && (
              <button
                onClick={() => {
                  onStatusUpdate(order.id, "shipped");
                  onClose();
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
              >
                Mark as Shipped
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderManagement;
