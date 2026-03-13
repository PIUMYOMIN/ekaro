// src/pages/BuyerDashboard.jsx
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../../context/AuthContext';
import {
  ShoppingBagIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  CreditCardIcon,
  MapPinIcon,
  EyeIcon,
  TruckIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  HeartIcon,
  CogIcon,
  ChartBarIcon,
  HomeIcon,
  DocumentTextIcon,
  BuildingStorefrontIcon,
  PencilSquareIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import api from "../../utils/api";

// Utility functions
function formatMMK(amount) {
  return new Intl.NumberFormat("en-MM", {
    style: "currency",
    currency: "MMK",
    minimumFractionDigits: 0
  }).format(amount);
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}


// ---------- Status Badge Component ----------
const StatusBadge = ({ status }) => {
  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: ClockIcon,
        label: "Pending"
      },
      confirmed: {
        color: "bg-blue-100 text-blue-800 border-blue-200",
        icon: CheckCircleIcon,
        label: "Confirmed"
      },
      processing: {
        color: "bg-indigo-100 text-indigo-800 border-indigo-200",
        icon: ClockIcon,
        label: "Processing"
      },
      shipped: {
        color: "bg-purple-100 text-purple-800 border-purple-200",
        icon: TruckIcon,
        label: "Shipped"
      },
      delivered: {
        color: "bg-green-100 text-green-800 border-green-200",
        icon: CheckCircleIcon,
        label: "Delivered"
      },
      cancelled: {
        color: "bg-red-100 text-red-800 border-red-200",
        icon: XCircleIcon,
        label: "Cancelled"
      }
    };
    return configs[status] || configs.pending;
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${config.color}`}>
      <Icon className="h-3 w-3 mr-1" />
      {config.label}
    </span>
  );
};

// ---------- Delivery Status Badge (for tracking) ----------
const DeliveryStatusBadge = ({ status }) => {
  const getStatusConfig = (status) => {
    const configs = {
      pending: { color: "bg-yellow-100 text-yellow-800", icon: ClockIcon, label: "Pending" },
      awaiting_pickup: { color: "bg-blue-100 text-blue-800", icon: ClockIcon, label: "Awaiting Pickup" },
      picked_up: { color: "bg-indigo-100 text-indigo-800", icon: TruckIcon, label: "Picked Up" },
      in_transit: { color: "bg-purple-100 text-purple-800", icon: TruckIcon, label: "In Transit" },
      out_for_delivery: { color: "bg-orange-100 text-orange-800", icon: TruckIcon, label: "Out for Delivery" },
      delivered: { color: "bg-green-100 text-green-800", icon: CheckCircleIcon, label: "Delivered" },
      failed: { color: "bg-red-100 text-red-800", icon: XCircleIcon, label: "Failed" },
      cancelled: { color: "bg-gray-100 text-gray-800", icon: XCircleIcon, label: "Cancelled" }
    };
    return configs[status] || configs.pending;
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
      <Icon className="h-3 w-3 mr-1" />
      {config.label}
    </span>
  );
};

// ---------- Order Card ----------
const OrderCard = ({ order, onViewDetails }) => {
  // Try to get product from either item.product or item.product_data
  const firstItem = order.items?.[0] || {};
  const product = firstItem.product || firstItem.product_data || {};

  // Check both places for images
  const images = product.images || (product.product_data?.images) || [];
  const primaryImage = images.find(img => img.is_primary)?.url ||
    images[0]?.url ||
    "/placeholder-product.jpg";

  return (
    <div className="bg-white rounded-xl border border-gray-200 hover:shadow-md transition p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <img
            src={primaryImage}
            alt={firstItem.product_name || 'Product'}
            className="w-16 h-16 object-cover rounded-lg"
            onError={(e) => { e.target.src = "/placeholder-product.jpg"; }}
          />
          <div>
            <h3 className="font-medium text-gray-900">Order #{order.order_number}</h3>
            <p className="text-sm text-gray-500 mt-1">{order.items?.length} item(s)</p>
            <p className="text-sm text-gray-500">{formatDate(order.created_at)}</p>
          </div>
        </div>
        <StatusBadge status={order.status} />
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div>
          <span className="text-sm text-gray-600">Total:</span>
          <span className="ml-2 font-bold text-green-600">{formatMMK(order.total_amount)}</span>
        </div>
        <button
          onClick={() => onViewDetails(order)}
          className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100"
        >
          <EyeIcon className="h-4 w-4 mr-1" />
          View Details
        </button>
      </div>
    </div>
  );
};

// ---------- Order Details Modal with Real‑Time Delivery Tracking ----------
const OrderDetailsModal = ({ order, isOpen, onClose }) => {
  const [delivery, setDelivery] = useState(null);
  const [deliveryLoading, setDeliveryLoading] = useState(false);
  const [deliveryError, setDeliveryError] = useState(null);
  const pollingInterval = useRef(null);

  const fetchDelivery = async () => {
    if (deliveryLoading) return;
    setDeliveryLoading(true);
    setDeliveryError(null);
    try {
      const response = await api.get(`/deliveries?order_id=${order.id}`);
      // Extract the first delivery from the paginated response
      const deliveryData = response.data.data?.data?.[0] || null;
      setDelivery(deliveryData);
    } catch (err) {
      console.error("Failed to fetch delivery:", err);
      setDeliveryError("Could not load delivery information.");
    } finally {
      setDeliveryLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && order) {
      // Fetch immediately when modal opens
      fetchDelivery();

      // Then set up polling every 10 seconds
      pollingInterval.current = setInterval(fetchDelivery, 10000);
    }

    // Cleanup on modal close or component unmount
    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
        pollingInterval.current = null;
      }
    };
  }, [isOpen, order?.id]);

  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        <div className="relative bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-900">Order #{order.order_number}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <XCircleIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Delivery Tracking Section - at the top */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold flex items-center text-gray-800">
                  <TruckIcon className="h-6 w-6 mr-2 text-blue-600" />
                  Delivery Tracking
                </h4>
                {deliveryLoading && (
                  <ArrowPathIcon className="h-5 w-5 text-gray-400 animate-spin" />
                )}
              </div>

              {deliveryError ? (
                <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{deliveryError}</p>
              ) : delivery ? (
                <div className="space-y-6">
                  {/* Method & Tracking Number Row */}
                  <div className="flex flex-wrap items-center justify-between gap-4 bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <BuildingStorefrontIcon className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-gray-700">
                        {delivery.delivery_method === 'platform' ? 'Platform Logistics' : 'Self Delivery'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <DocumentTextIcon className="h-5 w-5 text-gray-500" />
                      <span className="font-mono text-sm bg-white px-3 py-1 rounded border">
                        {delivery.tracking_number || 'Not assigned'}
                      </span>
                    </div>
                  </div>

                  {/* Horizontal Stepper */}
                  {(() => {
                    // Define steps in order
                    const steps = [
                      { key: 'awaiting_pickup', label: 'Awaiting Pickup', icon: ClockIcon },
                      { key: 'picked_up', label: 'Picked Up', icon: TruckIcon },
                      { key: 'in_transit', label: 'In Transit', icon: ArrowPathIcon },
                      { key: 'out_for_delivery', label: 'Out for Delivery', icon: MapPinIcon },
                      { key: 'delivered', label: 'Delivered', icon: CheckCircleIcon }
                    ];

                    // Map status to step index
                    const statusToIndex = {
                      awaiting_pickup: 0,
                      picked_up: 1,
                      in_transit: 2,
                      out_for_delivery: 3,
                      delivered: 4
                    };

                    const currentStepIndex = statusToIndex[delivery.status] ?? -1;

                    // Get first occurrence timestamp for each status from updates
                    const statusFirstTime = {};
                    if (delivery.delivery_updates) {
                      // Sort by created_at ascending to get first occurrence
                      const updatesAsc = [...delivery.delivery_updates].sort(
                        (a, b) => new Date(a.created_at) - new Date(b.created_at)
                      );
                      updatesAsc.forEach(update => {
                        if (!statusFirstTime[update.status]) {
                          statusFirstTime[update.status] = update.created_at;
                        }
                      });
                    }

                    return (
                      <div className="relative">
                        {/* Progress Bar Background */}
                        <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 rounded-full" />
                        {/* Progress Fill */}
                        <div
                          className="absolute top-5 left-0 h-1 bg-green-500 rounded-full transition-all duration-500"
                          style={{
                            width: `${currentStepIndex >= 0
                              ? (currentStepIndex / (steps.length - 1)) * 100
                              : 0
                              }%`
                          }}
                        />

                        {/* Steps */}
                        <div className="relative flex justify-between">
                          {steps.map((step, index) => {
                            const isCompleted = currentStepIndex >= index;
                            const isCurrent = currentStepIndex === index;
                            const Icon = step.icon;

                            // Determine if this step has a timestamp
                            const timestamp = statusFirstTime[step.key];
                            const formattedTime = timestamp
                              ? new Date(timestamp).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                              : null;

                            return (
                              <div key={step.key} className="flex flex-col items-center w-20 md:w-24">
                                <div
                                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${isCompleted
                                    ? 'bg-green-500 border-green-500 text-white'
                                    : isCurrent
                                      ? 'bg-blue-500 border-blue-500 text-white'
                                      : 'bg-white border-gray-300 text-gray-400'
                                    }`}
                                >
                                  <Icon className="h-5 w-5" />
                                </div>
                                <span
                                  className={`text-xs font-medium mt-2 text-center ${isCompleted
                                    ? 'text-gray-700'
                                    : isCurrent
                                      ? 'text-blue-600'
                                      : 'text-gray-400'
                                    }`}
                                >
                                  {step.label}
                                </span>
                                {formattedTime && (
                                  <span className="text-[10px] text-gray-500 mt-1">
                                    {formattedTime}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Delivered Confirmation Banner */}
                  {delivery.status === 'delivered' && delivery.delivered_at && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
                      <CheckCircleIcon className="h-6 w-6 text-green-600 mr-3" />
                      <div>
                        <p className="font-medium text-green-800">Delivered</p>
                        <p className="text-sm text-green-600">
                          {formatDate(delivery.delivered_at)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <TruckIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">
                    The seller hasn't provided delivery details yet.<br />
                    Check back later.
                  </p>
                </div>
              )}
            </div>

            {/* Items */}
            <div>
              <h4 className="text-lg font-medium mb-3">Items</h4>
              <div className="space-y-3">
                {delivery?.order?.items ? (
                  // Use items from delivery (has full product data)
                  delivery.order.items.map((item) => {
                    const product = item.product || {};
                    const productImages = product.images || [];
                    const img = productImages.find(i => i.is_primary)?.url ||
                      productImages[0]?.url ||
                      "/placeholder-product.jpg";

                    return (
                      <div key={item.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <img src={img} alt={item.product_name} className="w-12 h-12 object-cover rounded" />
                          <div>
                            <p className="font-medium">{item.product_name}</p>
                            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatMMK(item.subtotal)}</p>
                          <p className="text-xs text-gray-500">{formatMMK(item.price)} each</p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  // Fall back to order items from orders list
                  order.items.map((item) => {
                    // For order items, images are in product_data
                    const productImages = item.product_data?.images || [];
                    const img = productImages.find(i => i.is_primary)?.url ||
                      productImages[0]?.url ||
                      "/placeholder-product.jpg";

                    return (
                      <div key={item.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <img src={img} alt={item.product_name} className="w-12 h-12 object-cover rounded" />
                          <div>
                            <p className="font-medium">{item.product_name}</p>
                            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatMMK(item.subtotal)}</p>
                          <p className="text-xs text-gray-500">{formatMMK(item.price)} each</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Shipping & Payment */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-medium mb-3">Shipping Address</h4>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="font-medium">{order.shipping_address?.full_name}</p>
                  <p className="text-sm text-gray-600">{order.shipping_address?.phone}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {order.shipping_address?.address}, {order.shipping_address?.city}
                  </p>
                </div>
              </div>
              <div>
                <h4 className="text-lg font-medium mb-3">Payment Information</h4>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Method:</span>
                    <span className="font-medium capitalize">{order.payment_method?.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-gray-600">Status:</span>
                    <span className={`font-medium ${order.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                      {order.payment_status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="border-t pt-4">
              <h4 className="text-lg font-medium mb-3">Order Summary</h4>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span>{formatMMK(order.subtotal_amount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping:</span>
                  <span>{formatMMK(order.shipping_fee)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax:</span>
                  <span>{formatMMK(order.tax_amount)}</span>
                </div>
                <div className="flex justify-between font-bold pt-2 border-t">
                  <span>Total:</span>
                  <span className="text-green-600">{formatMMK(order.total_amount)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-100"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ---------- Personal Information Tab ----------
const PersonalInfoTab = ({ user, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address || "",
    city: user?.city || "",
    state: user?.state || ""
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const response = await api.put("/users/profile", formData);
      if (response.data.success) {
        setMessage({ type: "success", text: "Profile updated successfully" });
        onUpdate(response.data.data); // update parent user state
        setIsEditing(false);
      }
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Update failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center text-green-600 hover:text-green-700"
          >
            <PencilSquareIcon className="h-5 w-5 mr-1" />
            Edit
          </button>
        )}
      </div>
      {message && (
        <div className={`mb-4 p-3 rounded ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message.text}
        </div>
      )}
      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center">
            <UserIcon className="h-5 w-5 text-gray-400 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Full Name</p>
              <p className="font-medium">{user?.name || "—"}</p>
            </div>
          </div>
          <div className="flex items-center">
            <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{user?.email || "—"}</p>
            </div>
          </div>
          <div className="flex items-center">
            <PhoneIcon className="h-5 w-5 text-gray-400 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="font-medium">{user?.phone || "—"}</p>
            </div>
          </div>
          <div className="flex items-start">
            <MapPinIcon className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Address</p>
              <p className="font-medium">{user?.address || "—"}</p>
              {(user?.city || user?.state) && (
                <p className="text-sm text-gray-600">{user?.city}{user?.city && user?.state ? ", " : ""}{user?.state}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ---------- Orders Tab ----------
const OrdersTab = ({ orders, onViewDetails }) => {
  const [filter, setFilter] = useState("all");
  const filteredOrders = orders.filter(order => filter === "all" || order.status === filter);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex flex-wrap items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">My Orders</h2>
          <div className="flex space-x-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBagIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No orders found</h3>
            <p className="text-gray-500 mt-2">Try a different filter or start shopping!</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredOrders.map(order => (
              <OrderCard key={order.id} order={order} onViewDetails={onViewDetails} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ---------- Wishlist Tab ----------
const WishlistTab = ({ navigate }) => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const response = await api.get("/wishlist");
      setWishlist(response.data.data || []);
    } catch (err) {
      setError("Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      await api.delete(`/wishlist/${productId}`);
      setWishlist(prev => prev.filter(item => item.id !== productId));
    } catch (err) {
      alert("Failed to remove item");
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  if (loading) return <div className="flex justify-center py-8"><div className="animate-spin h-8 w-8 border-t-2 border-green-500" /></div>;
  if (error) return <div className="text-red-600 text-center py-8">{error}</div>;

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">My Wishlist</h2>
      {wishlist.length === 0 ? (
        <div className="text-center py-12">
          <HeartIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Your wishlist is empty</h3>
          <p className="text-gray-500 mt-2">Start adding items you love!</p>
          <button
            onClick={() => navigate('/products')}
            className="mt-4 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700"
          >
            Browse Products
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {wishlist.map(item => (
            <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
              <div className="flex items-start space-x-3">
                <img
                  src={item.images?.[0] || "/placeholder-product.jpg"}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded"
                  onError={(e) => { e.target.src = "/placeholder-product.jpg"; }}
                />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 line-clamp-2">{item.name}</h3>
                  <p className="text-sm text-green-600 font-bold mt-1">{formatMMK(item.price)}</p>
                  <div className="mt-2 flex space-x-2">
                    <button
                      onClick={() => navigate(`/products/${item.slug || item.id}`)}
                      className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200"
                    >
                      View
                    </button>
                    <button
                      onClick={() => removeFromWishlist(item.id)}
                      className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ---------- Settings Tab ----------
const SettingsTab = () => {
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: ""
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.confirm_password) {
      setMessage({ type: "error", text: "New passwords do not match" });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      await api.put("/users/password", {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
        new_password_confirmation: passwordData.confirm_password
      });
      setMessage({ type: "success", text: "Password changed successfully" });
      setPasswordData({ current_password: "", new_password: "", confirm_password: "" });
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to change password" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Password Change */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Change Password</h2>
        {message && (
          <div className={`mb-4 p-3 rounded ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message.text}
          </div>
        )}
        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
            <input
              type="password"
              name="current_password"
              value={passwordData.current_password}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input
              type="password"
              name="new_password"
              value={passwordData.new_password}
              onChange={handleChange}
              required
              minLength={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
            <input
              type="password"
              name="confirm_password"
              value={passwordData.confirm_password}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>

      {/* Account Actions (Optional) */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Account</h2>
        <div className="space-y-3">
          <button className="flex items-center text-red-600 hover:text-red-700">
            <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
            Deactivate Account
          </button>
        </div>
      </div>
    </div>
  );
};

// ---------- Dashboard Tab ----------
const DashboardTab = ({ user, orders, onViewDetails, navigate }) => {
  const recentOrders = orders.slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome back, {user?.name}!</h1>
        <p className="text-green-100">Here's your buying activity overview</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{orders.length}</p>
            </div>
            <div className="bg-blue-100 rounded-lg p-3">
              <ShoppingBagIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Delivered</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {orders.filter(o => o.status === 'delivered').length}
              </p>
            </div>
            <div className="bg-green-100 rounded-lg p-3">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {orders.filter(o => ['pending', 'confirmed', 'processing'].includes(o.status)).length}
              </p>
            </div>
            <div className="bg-blue-100 rounded-lg p-3">
              <ClockIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Spent</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">
                {formatMMK(orders.reduce((total, order) => total + order.total_amount, 0))}
              </p>
            </div>
            <div className="bg-purple-100 rounded-lg p-3">
              <CreditCardIcon className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-orange-100 rounded-full p-2">
              <ChartBarIcon className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
              <p className="text-gray-600">Your latest purchasing activity</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/buyer/orders')}
            className="text-green-600 hover:text-green-700 font-medium"
          >
            View All Orders
          </button>
        </div>

        {recentOrders.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBagIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Orders Yet</h3>
            <p className="text-gray-600 mb-6">You haven't placed any orders yet.</p>
            <button
              onClick={() => navigate('/products')}
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recentOrders.map(order => (
              <OrderCard key={order.id} order={order} onViewDetails={onViewDetails} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ---------- Main BuyerDashboard ----------
const BuyerDashboard = () => {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();

  const { isEmailVerified } = useAuth();
  const [resending, setResending] = useState(false);

  const handleResendVerification = async () => {
    setResending(true);
    try {
      await api.post('/email/resend');
      alert('Verification email resent. Please check your inbox.');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to resend verification email.');
    } finally {
      setResending(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const ordersRes = await api.get("/orders");
      setOrders(ordersRes.data.data || []);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    }
  };

  // Handle modal close and refresh orders
  const handleModalClose = () => {
    setIsModalOpen(false);
    fetchOrders();
  };

  useEffect(() => {
    let interval;
    if (activeTab === 'dashboard' || activeTab === 'orders') {
      interval = setInterval(fetchOrders, 30000);
    }
    return () => clearInterval(interval);
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const userRes = await api.get("/auth/me");
      setUser(userRes.data.data || userRes.data);

      const ordersRes = await api.get("/orders");
      setOrders(ordersRes.data.data || []);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);


  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: HomeIcon },
    { id: 'personal', name: 'Personal Info', icon: UserIcon },
    { id: 'orders', name: 'Orders', icon: ShoppingBagIcon },
    { id: 'wishlist', name: 'Wishlist', icon: HeartIcon },
    { id: 'settings', name: 'Settings', icon: CogIcon }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardTab user={user} orders={orders} onViewDetails={handleViewDetails} navigate={navigate} />;
      case 'personal':
        return <PersonalInfoTab user={user} onUpdate={(updatedUser) => setUser(updatedUser)} />;
      case 'orders':
        return <OrdersTab orders={orders} onViewDetails={handleViewDetails} />;
      case 'wishlist':
        return <WishlistTab navigate={navigate} />;
      case 'settings':
        return <SettingsTab />;
      default:
        return null;
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {!isEmailVerified() && (
          <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <EnvelopeIcon className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Your email is not verified. Please check your inbox for the verification link.
                </p>
                <div className="mt-2">
                  <button
                    onClick={handleResendVerification}
                    disabled={resending}
                    className="text-sm bg-yellow-100 text-yellow-800 px-3 py-1 rounded hover:bg-yellow-200 disabled:opacity-50"
                  >
                    {resending ? 'Sending...' : 'Resend Verification Email'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Buyer Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your orders and profile</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-8">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-colors ${activeTab === tab.id
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{tab.name}</span>
                    </button>
                  );
                })}
              </nav>

              <div className="mt-8 pt-8 border-t border-gray-200">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Orders</span>
                    <span className="font-medium text-gray-900">{orders.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Member Since</span>
                    <span className="font-medium text-gray-900">
                      {user?.created_at ? new Date(user.created_at).getFullYear() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {renderTabContent()}
          </div>
        </div>

        <OrderDetailsModal
          order={selectedOrder}
          isOpen={isModalOpen}
          onClose={handleModalClose} />
      </div>
    </div>
  );
};

export default BuyerDashboard;