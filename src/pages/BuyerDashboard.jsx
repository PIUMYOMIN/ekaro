// src/pages/BuyerDashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingBagIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  CreditCardIcon,
  CalendarIcon,
  MapPinIcon,
  EyeIcon,
  TruckIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  HeartIcon,
  CogIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  HomeIcon,
  DocumentTextIcon,
  BuildingStorefrontIcon
} from "@heroicons/react/24/outline";
import api from "../utils/api";

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

// Enhanced Order Tracking Component
const EnhancedOrderTracking = ({ order }) => {
  const [delivery, setDelivery] = useState(null);
  const [trackingUpdates, setTrackingUpdates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeliveryInfo();
  }, [order]);

  const fetchDeliveryInfo = async () => {
    try {
      setLoading(true);
      // Fetch delivery information for this order
      const response = await api.get(`/dashboard/deliveries?order_id=${order.id}`);
      const deliveries = response.data.data?.data || response.data.data || [];
      
      if (deliveries.length > 0) {
        const orderDelivery = deliveries.find(d => d.order_id === order.id) || deliveries[0];
        setDelivery(orderDelivery);
        
        // Fetch tracking updates if available
        if (orderDelivery.id) {
          try {
            const trackingResponse = await api.get(`/dashboard/deliveries/${orderDelivery.id}/tracking`);
            setTrackingUpdates(trackingResponse.data.data?.updates || []);
          } catch (error) {
            console.error("Failed to fetch tracking updates:", error);
            setTrackingUpdates([]);
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch delivery info:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDeliveryProgressSteps = (status) => {
    const steps = [
      { 
        key: 'order_placed', 
        label: 'Order Placed', 
        completed: true,
        description: 'Your order has been confirmed',
        icon: CheckCircleIcon
      },
      { 
        key: 'awaiting_pickup', 
        label: 'Awaiting Pickup', 
        completed: ['awaiting_pickup', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered'].includes(status),
        description: 'Seller is preparing your order',
        icon: ClockIcon
      },
      { 
        key: 'picked_up', 
        label: 'Picked Up', 
        completed: ['picked_up', 'in_transit', 'out_for_delivery', 'delivered'].includes(status),
        description: 'Package picked up from seller',
        icon: TruckIcon
      },
      { 
        key: 'in_transit', 
        label: 'In Transit', 
        completed: ['in_transit', 'out_for_delivery', 'delivered'].includes(status),
        description: 'Package is on the way',
        icon: TruckIcon
      },
      { 
        key: 'out_for_delivery', 
        label: 'Out for Delivery', 
        completed: ['out_for_delivery', 'delivered'].includes(status),
        description: 'Package is out for delivery today',
        icon: TruckIcon
      },
      { 
        key: 'delivered', 
        label: 'Delivered', 
        completed: status === 'delivered',
        description: 'Package delivered successfully',
        icon: CheckCircleIcon
      }
    ];
    return steps;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!delivery) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <ClockIcon className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-yellow-800 mb-2">
          Tracking Information Pending
        </h3>
        <p className="text-yellow-700">
          The seller is preparing your order. Tracking information will be available soon.
        </p>
      </div>
    );
  }

  const progressSteps = getDeliveryProgressSteps(delivery.status);
  const currentStepIndex = progressSteps.findIndex(step => 
    step.key === delivery.status || 
    (delivery.status === 'pending' && step.key === 'order_placed') ||
    (delivery.status === 'confirmed' && step.key === 'awaiting_pickup') ||
    (delivery.status === 'processing' && step.key === 'awaiting_pickup')
  );

  return (
    <div className="space-y-6">
      {/* Current Status */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              delivery.status === 'delivered' ? 'bg-green-100' : 
              delivery.status === 'out_for_delivery' ? 'bg-orange-100' :
              delivery.status === 'in_transit' ? 'bg-purple-100' :
              'bg-blue-100'
            }`}>
              <TruckIcon className={`h-6 w-6 ${
                delivery.status === 'delivered' ? 'text-green-600' : 
                delivery.status === 'out_for_delivery' ? 'text-orange-600' :
                delivery.status === 'in_transit' ? 'text-purple-600' :
                'text-blue-600'
              }`} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {delivery.delivery_method === 'platform' ? 'Platform Logistics' : 'Seller Delivery'}
              </h3>
              <p className="text-gray-600">
                {delivery.tracking_number ? `Tracking #: ${delivery.tracking_number}` : 'Tracking number will be assigned soon'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Current Status</p>
            <p className="text-lg font-semibold text-green-600 capitalize">
              {delivery.status.replace('_', ' ')}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Visualization */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-6">Delivery Progress</h4>
        <div className="flex items-center justify-between relative">
          {/* Progress Line */}
          <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 -z-10">
            <div 
              className="h-1 bg-green-500 transition-all duration-500"
              style={{ 
                width: `${(currentStepIndex / (progressSteps.length - 1)) * 100}%` 
              }}
            ></div>
          </div>
          
          {progressSteps.map((step, index) => {
            const StepIcon = step.icon;
            const isCompleted = step.completed;
            const isCurrent = index === currentStepIndex;
            
            return (
              <div key={step.key} className="flex flex-col items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                  isCompleted 
                    ? 'bg-green-500 border-green-500 text-white' 
                    : isCurrent
                    ? 'bg-white border-green-500 text-green-500'
                    : 'bg-white border-gray-300 text-gray-400'
                }`}>
                  <StepIcon className="h-5 w-5" />
                </div>
                <div className="mt-3 text-center">
                  <p className={`text-sm font-medium ${
                    isCompleted ? 'text-green-700' : 
                    isCurrent ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {step.label}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 max-w-[100px]">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tracking Updates */}
      {trackingUpdates.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Tracking History</h4>
          <div className="space-y-4">
            {trackingUpdates.map((update, index) => (
              <div key={update.id || index} className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <DocumentTextIcon className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 capitalize">
                      {update.status?.replace('_', ' ') || 'Status Update'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {update.created_at ? new Date(update.created_at).toLocaleString() : 'Recent'}
                    </p>
                  </div>
                  {update.notes && (
                    <p className="text-sm text-gray-600 mt-1">{update.notes}</p>
                  )}
                  {update.location && (
                    <div className="flex items-center mt-1 text-xs text-gray-500">
                      <MapPinIcon className="h-3 w-3 mr-1" />
                      {update.location}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delivery Information */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Delivery Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-2">Delivery Method</h5>
            <div className="flex items-center space-x-2">
              {delivery.delivery_method === 'platform' ? (
                <>
                  <BuildingStorefrontIcon className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-gray-900">Platform Logistics</span>
                </>
              ) : (
                <>
                  <TruckIcon className="h-4 w-4 text-gray-600" />
                  <span className="text-sm text-gray-900">Seller Delivery</span>
                </>
              )}
            </div>
          </div>
          
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-2">Estimated Delivery</h5>
            <p className="text-sm text-gray-900">
              {delivery.estimated_delivery_date 
                ? new Date(delivery.estimated_delivery_date).toLocaleDateString()
                : 'To be confirmed'
              }
            </p>
          </div>

          {delivery.assigned_driver_name && (
            <div className="md:col-span-2">
              <h5 className="text-sm font-medium text-gray-700 mb-2">Assigned Driver</h5>
              <p className="text-sm text-gray-900">{delivery.assigned_driver_name}</p>
              {delivery.assigned_driver_phone && (
                <p className="text-xs text-gray-500">{delivery.assigned_driver_phone}</p>
              )}
            </div>
          )}

          <div className="md:col-span-2">
            <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <MapPinIcon className="h-4 w-4 mr-1" />
              Delivery Address
            </h5>
            <p className="text-sm text-gray-900 whitespace-pre-line">
              {delivery.delivery_address || order.shipping_address?.address}
            </p>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-blue-900 mb-4">
          Need Help?
        </h4>
        <div className="space-y-2 text-sm text-blue-800">
          <p>If you have any questions about your delivery, please contact:</p>
          <div className="mt-3 space-y-1">
            <p><strong>Seller:</strong> {order.seller?.name || 'Store'}</p>
            {delivery.assigned_driver_phone && delivery.delivery_method === 'platform' && (
              <p><strong>Delivery Driver:</strong> {delivery.assigned_driver_phone}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Status Badge Component
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
  const IconComponent = config.icon;

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${config.color}`}>
      <IconComponent className="h-4 w-4 mr-1" />
      {config.label}
    </span>
  );
};

// Order Card Component
const OrderCard = ({ order, onViewDetails }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="bg-green-100 rounded-lg p-2">
            <ShoppingBagIcon className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              Order #{order.order_number}
            </h3>
            <div className="flex items-center space-x-2 mt-1">
              <CalendarIcon className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-500">
                {formatDate(order.created_at)}
              </span>
            </div>
          </div>
        </div>
        <div className="mt-3 sm:mt-0">
          <StatusBadge status={order.status} />
        </div>
      </div>

      {/* Order Items Preview */}
      <div className="mb-4">
        {order.items?.slice(0, 2).map((item, index) => (
          <div key={item.id || index} className="flex items-center justify-between py-2">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <img
                  src={
                    item.product_data?.images?.find(img => img.is_primary)?.url ||
                    item.product_data?.images?.[0]?.url ||
                    item.product?.images?.find(img => img.is_primary)?.url ||
                    item.product?.images?.[0]?.url ||
                    '/placeholder-product.jpg'
                  }
                  alt={item.product_name}
                  className="w-8 h-8 object-cover rounded"
                  onError={(e) => {
                    e.target.src = '/placeholder-product.jpg';
                  }}
                />
              </div>

              <div>
                <h4 className="font-medium text-gray-900 text-sm line-clamp-1">
                  {item.product_name}
                </h4>
                <p className="text-gray-500 text-xs">
                  Qty: {item.quantity} × {formatMMK(item.price)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium text-gray-900 text-sm">
                {formatMMK(item.subtotal)}
              </p>
            </div>
          </div>
        ))}

        {order.items?.length > 2 && (
          <div className="text-center pt-2 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              +{order.items.length - 2} more items
            </p>
          </div>
        )}
      </div>

      {/* Order Summary */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div>
          <p className="text-sm text-gray-600">Total</p>
          <p className="text-lg font-semibold text-green-600">
            {formatMMK(order.total_amount)}
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onViewDetails(order)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <EyeIcon className="h-4 w-4 mr-1" />
            Details
          </button>
          {/* Track Order button for orders that are shipped or in delivery */}
          {(order.status === 'shipped' || order.status === 'processing' || order.status === 'confirmed') && (
            <button
              onClick={() => onViewDetails(order)}
              className="inline-flex items-center px-3 py-2 border border-green-300 rounded-lg text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <TruckIcon className="h-4 w-4 mr-1" />
              Track
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Order Details Modal
const OrderDetailsModal = ({ order, isOpen, onClose }) => {
  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full">
          {/* Header */}
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">
                Order Details - #{order.order_number}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 transition-colors"
              >
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white px-6 py-4 max-h-[80vh] overflow-y-auto">
            {/* Enhanced Delivery Tracking */}
            <div className="mb-6">
              <EnhancedOrderTracking order={order} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
              {/* Order Items */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Order Items</h4>
                <div className="space-y-3">
                  {order.items?.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-white rounded-lg border border-gray-200 flex items-center justify-center">
                          <img
                            src={item.product_data?.images?.[0]?.url || item.product_data?.image || '/placeholder-product.jpg'}
                            alt={item.product_name}
                            className="w-10 h-10 object-cover rounded"
                            onError={(e) => {
                              e.target.src = '/placeholder-product.jpg';
                            }}
                          />
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-900 text-sm">{item.product_name}</h5>
                          <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                          <p className="text-xs text-gray-500">{formatMMK(item.price)} each</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 text-sm">{formatMMK(item.subtotal)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Information */}
              <div className="space-y-6">
                {/* Shipping Information */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-3">Shipping Information</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div className="text-sm text-gray-600">
                        <p className="font-medium">{order.shipping_address?.full_name}</p>
                        <p>{order.shipping_address?.phone}</p>
                        <p className="mt-1">{order.shipping_address?.address}</p>
                        <p>
                          {order.shipping_address?.city}, {order.shipping_address?.state}
                          {order.shipping_address?.postal_code && `, ${order.shipping_address.postal_code}`}
                        </p>
                        <p>{order.shipping_address?.country}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Information */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-3">Payment Information</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600 space-y-2">
                      <div className="flex justify-between">
                        <span>Payment Method:</span>
                        <span className="font-medium capitalize">
                          {order.payment_method?.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Payment Status:</span>
                        <span className={`font-medium ${order.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'
                          }`}>
                          {order.payment_status?.charAt(0).toUpperCase() + order.payment_status?.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">{formatMMK(order.subtotal_amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping Fee:</span>
                    <span className="font-medium">{formatMMK(order.shipping_fee)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax ({order.tax_rate * 100}%):</span>
                    <span className="font-medium">{formatMMK(order.tax_amount)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200">
                    <span className="text-lg font-semibold text-gray-900">Total:</span>
                    <span className="text-lg font-semibold text-green-600">
                      {formatMMK(order.total_amount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-3 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Tab Components (Keep the existing DashboardTab, PersonalInfoTab, OrdersTab, WishlistTab, SettingsTab components exactly as they are in your original file)

const DashboardTab = ({ user, orders, onViewDetails, navigate }) => {
  // ... (Keep the exact same implementation from your original file)
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
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

        {orders.length === 0 ? (
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
            {orders.slice(0, 4).map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onViewDetails={onViewDetails}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const PersonalInfoTab = ({ user }) => {
  // ... (Keep the exact same implementation from your original file)
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm p-6">
        {/* ... existing personal info implementation ... */}
      </div>
    </div>
  );
};

const OrdersTab = ({ orders, onViewDetails, navigate }) => {
  // ... (Keep the exact same implementation from your original file)
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm p-6">
        {/* ... existing orders implementation ... */}
      </div>
    </div>
  );
};

const WishlistTab = ({ navigate }) => {
  // ... (Keep the exact same implementation from your original file)
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm p-6">
        {/* ... existing wishlist implementation ... */}
      </div>
    </div>
  );
};

const SettingsTab = () => {
  // ... (Keep the exact same implementation from your original file)
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm p-6">
        {/* ... existing settings implementation ... */}
      </div>
    </div>
  );
};

// Main Component
const BuyerDashboard = () => {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: HomeIcon },
    { id: 'personal', name: 'Personal Information', icon: UserIcon },
    { id: 'orders', name: 'Orders', icon: ShoppingBagIcon },
    { id: 'wishlist', name: 'Wishlist', icon: HeartIcon },
    { id: 'settings', name: 'Settings', icon: CogIcon },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Get user profile
        const userResponse = await api.get("/auth/me");
        setUser(userResponse.data.data || userResponse.data);

        // Get user orders
        const ordersResponse = await api.get("/orders");
        setOrders(ordersResponse.data.data || []);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardTab user={user} orders={orders} onViewDetails={handleViewDetails} navigate={navigate} />;
      case 'personal':
        return <PersonalInfoTab user={user} />;
      case 'orders':
        return <OrdersTab orders={orders} onViewDetails={handleViewDetails} navigate={navigate} />;
      case 'wishlist':
        return <WishlistTab navigate={navigate} />;
      case 'settings':
        return <SettingsTab />;
      default:
        return <DashboardTab user={user} orders={orders} onViewDetails={handleViewDetails} navigate={navigate} />;
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Buyer Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your orders and profile</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-8">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-colors ${activeTab === tab.id
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      <IconComponent className="h-5 w-5" />
                      <span className="font-medium">{tab.name}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Quick Stats in Sidebar */}
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

        {/* Order Details Modal */}
        <OrderDetailsModal
          order={selectedOrder}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      </div>
    </div>
  );
};

export default BuyerDashboard;