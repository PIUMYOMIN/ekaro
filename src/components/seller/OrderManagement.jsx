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
        await fetchOrders();
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
    }).format(amount || 0);
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("order.order_id")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("order.date")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("order.customer")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("order.items")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("order.amount")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("order.status")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
  const { t } = useTranslation();
  
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
    }).format(amount || 0);
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
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <ClockIcon className="h-4 w-4" />;
      case "confirmed":
      case "processing":
        return <ClockIcon className="h-4 w-4" />;
      case "shipped":
        return <TruckIcon className="h-4 w-4" />;
      case "delivered":
        return <CheckCircleIcon className="h-4 w-4" />;
      case "cancelled":
        return <XCircleIcon className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* Modal Header */}
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {t("order.order_details") || "Order Details"} - #{order.order_number || order.id}
                </h3>
                <span className={`inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                  {getStatusIcon(order.status)}
                  <span className="capitalize">{order.status}</span>
                </span>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 transition-colors"
              >
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          <div className="bg-white px-6 py-4 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Order Items Section */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <ShoppingBagIcon className="h-5 w-5 text-gray-500" />
                  {t("order.items") || "Order Items"} ({order.items?.length || 0})
                </h4>
                <div className="space-y-3">
                  {order.items?.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      {/* Product Image - Direct URL from backend */}
                      <div className="flex-shrink-0 w-16 h-16 bg-white rounded-lg border border-gray-200 overflow-hidden flex items-center justify-center">
                        <img
                          src={item.product_data?.images?.[0]?.url || '/placeholder-product.png'}
                          alt={item.product_name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/placeholder-product.png';
                          }}
                        />
                      </div>
                      
                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h5 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2">
                          {item.product_name}
                        </h5>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <span className="font-medium">Qty:</span> {item.quantity}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="font-medium">Price:</span> {formatMMK(item.price)}
                          </span>
                          {item.product_sku && (
                            <span className="flex items-center gap-1">
                              <span className="font-medium">SKU:</span> {item.product_sku}
                            </span>
                          )}
                        </div>
                        {/* Show specifications if available */}
                        {item.product_data?.specifications && Object.keys(item.product_data.specifications).length > 0 && (
                          <div className="mt-1 text-xs text-gray-400">
                            {Object.entries(item.product_data.specifications).slice(0, 2).map(([key, value]) => (
                              <span key={key} className="inline-block mr-2">
                                {key}: {value}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {/* Subtotal */}
                      <div className="flex-shrink-0 text-right">
                        <p className="font-semibold text-gray-900 text-sm">
                          {formatMMK(item.subtotal)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Information Section */}
              <div className="space-y-6">
                {/* Shipping Information */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <TruckIcon className="h-5 w-5 text-gray-500" />
                    {t("order.shipping_info") || "Shipping Information"}
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600 space-y-1">
                      <p className="font-medium text-gray-900">
                        {shippingAddress?.full_name || t("order.na")}
                      </p>
                      {shippingAddress?.phone && (
                        <p className="flex items-center gap-1">
                          <span className="text-xs">📞</span> {shippingAddress.phone}
                        </p>
                      )}
                      {shippingAddress?.email && (
                        <p className="flex items-center gap-1">
                          <span className="text-xs">✉️</span> {shippingAddress.email}
                        </p>
                      )}
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <p>{shippingAddress?.address || t("order.na")}</p>
                        {shippingAddress?.city && (
                          <p>
                            {shippingAddress.city}
                            {shippingAddress?.state && `, ${shippingAddress.state}`}
                            {shippingAddress?.postal_code && ` ${shippingAddress.postal_code}`}
                          </p>
                        )}
                        {shippingAddress?.country && <p>{shippingAddress.country}</p>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Summary */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <ShoppingBagIcon className="h-5 w-5 text-gray-500" />
                    {t("order.summary") || "Order Summary"}
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t("order.subtotal") || "Subtotal"}:</span>
                        <span className="font-medium">
                          {formatMMK(order.subtotal_amount)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t("order.shipping_fee") || "Shipping Fee"}:</span>
                        <span className="font-medium">
                          {formatMMK(order.shipping_fee || 0)}
                        </span>
                      </div>
                      {order.tax_amount > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">{t("order.tax") || "Tax"}:</span>
                          <span className="font-medium">
                            {formatMMK(order.tax_amount)}
                          </span>
                        </div>
                      )}
                      {order.discount_amount > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">{t("order.discount") || "Discount"}:</span>
                          <span className="font-medium text-red-600">
                            -{formatMMK(order.discount_amount)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between pt-2 border-t border-gray-200 mt-2">
                        <span className="text-base font-semibold text-gray-900">
                          {t("order.total") || "Total"}:
                        </span>
                        <span className="text-lg font-semibold text-green-600">
                          {formatMMK(order.total_amount)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Delivery Information */}
                {order.delivery && (
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <TruckIcon className="h-5 w-5 text-gray-500" />
                      {t("order.delivery_info") || "Delivery Information"}
                    </h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Delivery Method:</span>
                          <span className="font-medium capitalize">{order.delivery.delivery_method || 'N/A'}</span>
                        </div>
                        {order.delivery.tracking_number && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Tracking Number:</span>
                            <span className="font-medium">{order.delivery.tracking_number}</span>
                          </div>
                        )}
                        {order.delivery.estimated_delivery_date && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Est. Delivery:</span>
                            <span className="font-medium">
                              {new Date(order.delivery.estimated_delivery_date).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        {order.delivery.carrier_name && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Carrier:</span>
                            <span className="font-medium">{order.delivery.carrier_name}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-600">Delivery Status:</span>
                          <span className={`font-medium capitalize ${
                            order.delivery.status === 'delivered' ? 'text-green-600' : 
                            order.delivery.status === 'cancelled' ? 'text-red-600' : 'text-blue-600'
                          }`}>
                            {order.delivery.status || 'pending'}
                          </span>
                        </div>
                        {/* Delivery Proof Image */}
                        {order.delivery.delivery_proof_image && (
                          <div className="mt-2 pt-2 border-t border-gray-200">
                            <span className="text-gray-600 block mb-1">Delivery Proof:</span>
                            <img
                              src={order.delivery.delivery_proof_image}
                              alt="Delivery Proof"
                              className="max-w-full h-auto rounded-lg border border-gray-200"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Order Notes */}
                {order.order_notes && (
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-3">
                      {t("order.notes") || "Order Notes"}
                    </h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600">{order.order_notes}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="bg-gray-50 px-6 py-3 flex justify-end space-x-3 border-t border-gray-200">
            {order.status === "pending" && (
              <button
                onClick={() => {
                  onStatusUpdate(order.id, "confirmed");
                  onClose();
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                {t("order.confirm_order") || "Confirm Order"}
              </button>
            )}
            {order.status === "confirmed" && (
              <button
                onClick={() => {
                  onStatusUpdate(order.id, "shipped");
                  onClose();
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                {t("order.mark_as_shipped") || "Mark as Shipped"}
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              {t("common.close") || "Close"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderManagement;