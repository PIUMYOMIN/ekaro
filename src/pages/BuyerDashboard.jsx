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
  XCircleIcon
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
          <div key={item.id} className="flex items-center justify-between py-2">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <img
                  src={item.product_data?.images?.[0]?.url || item.product_data?.image || '/placeholder-product.jpg'}
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
        </div>
      </div>
    </div>
  );
};

// Order Details Modal
const OrderDetailsModal = ({ order, isOpen, onClose }) => {
  if (!isOpen || !order) return null;

  const getDeliveryProgress = (status) => {
    const steps = [
      { key: 'pending', label: 'Order Placed', completed: true },
      { key: 'confirmed', label: 'Confirmed', completed: ['confirmed', 'processing', 'shipped', 'delivered'].includes(status) },
      { key: 'processing', label: 'Processing', completed: ['processing', 'shipped', 'delivered'].includes(status) },
      { key: 'shipped', label: 'Shipped', completed: ['shipped', 'delivered'].includes(status) },
      { key: 'delivered', label: 'Delivered', completed: status === 'delivered' }
    ];
    return steps;
  };

  const progressSteps = getDeliveryProgress(order.status);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
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
          <div className="bg-white px-6 py-4 max-h-96 overflow-y-auto">
            {/* Delivery Progress */}
            <div className="mb-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Delivery Progress</h4>
              <div className="flex items-center justify-between">
                {progressSteps.map((step, index) => (
                  <div key={step.key} className="flex flex-col items-center flex-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      step.completed 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      {step.completed ? (
                        <CheckCircleIcon className="h-5 w-5" />
                      ) : (
                        <span>{index + 1}</span>
                      )}
                    </div>
                    <span className={`text-xs mt-2 text-center ${
                      step.completed ? 'text-green-600 font-medium' : 'text-gray-500'
                    }`}>
                      {step.label}
                    </span>
                    {index < progressSteps.length - 1 && (
                      <div className={`h-1 flex-1 mt-4 ${
                        step.completed ? 'bg-green-500' : 'bg-gray-200'
                      }`}></div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                        <span className={`font-medium ${
                          order.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'
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

const BuyerDashboard = () => {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="bg-green-100 rounded-full p-3">
                  <UserIcon className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Profile</h2>
                  <p className="text-gray-600">Your account information</p>
                </div>
              </div>

              {user && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="font-medium text-gray-900">{user.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium text-gray-900">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <PhoneIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium text-gray-900">{user.phone || 'Not provided'}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <CreditCardIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Account Number</p>
                      <p className="font-medium text-gray-900">{user.account_number || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Orders Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-100 rounded-full p-3">
                    <ShoppingBagIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
                    <p className="text-gray-600">Track and manage your orders</p>
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
                      onViewDetails={handleViewDetails}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Quick Stats */}
            {orders.length > 0 && (
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-4 text-center border border-gray-200">
                  <div className="text-2xl font-bold text-gray-900">{orders.length}</div>
                  <div className="text-sm text-gray-600">Total Orders</div>
                </div>
                <div className="bg-white rounded-xl p-4 text-center border border-gray-200">
                  <div className="text-2xl font-bold text-green-600">
                    {orders.filter(o => o.status === 'delivered').length}
                  </div>
                  <div className="text-sm text-gray-600">Delivered</div>
                </div>
                <div className="bg-white rounded-xl p-4 text-center border border-gray-200">
                  <div className="text-2xl font-bold text-blue-600">
                    {orders.filter(o => ['pending', 'confirmed', 'processing'].includes(o.status)).length}
                  </div>
                  <div className="text-sm text-gray-600">In Progress</div>
                </div>
                <div className="bg-white rounded-xl p-4 text-center border border-gray-200">
                  <div className="text-2xl font-bold text-purple-600">
                    {orders.filter(o => o.status === 'shipped').length}
                  </div>
                  <div className="text-sm text-gray-600">Shipped</div>
                </div>
              </div>
            )}
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