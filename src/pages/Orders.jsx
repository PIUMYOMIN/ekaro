import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { 
  ShoppingBagIcon,
  ClockIcon,
  CheckCircleIcon,
  TruckIcon,
  HomeIcon,
  XCircleIcon,
  ArrowPathIcon,
  EyeIcon,
  CalendarIcon,
  CurrencyDollarIcon
} from "@heroicons/react/24/outline";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

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
        icon: ArrowPathIcon,
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
      },
      refunded: {
        color: "bg-gray-100 text-gray-800 border-gray-200",
        icon: CurrencyDollarIcon,
        label: "Refunded"
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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      {/* Order Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-green-100 rounded-lg p-3">
              <ShoppingBagIcon className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
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
      </div>

      {/* Order Items Preview */}
      <div className="p-6">
        <div className="space-y-4">
          {order.items?.slice(0, 2).map((item, index) => (
            <div key={item.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
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
                  <h4 className="font-medium text-gray-900 text-sm line-clamp-1">
                    {item.product_name}
                  </h4>
                  <p className="text-gray-500 text-sm">
                    Qty: {item.quantity} × {formatMMK(item.price)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900">
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
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="text-lg font-semibold text-green-600">
                {formatMMK(order.total_amount)}
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => onViewDetails(order)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <EyeIcon className="h-4 w-4 mr-2" />
                View Details
              </button>
              
              {order.status === 'pending' && (
                <button
                  onClick={() => handleCancelOrder(order.id)}
                  className="inline-flex items-center px-4 py-2 border border-red-300 rounded-lg text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <XCircleIcon className="h-4 w-4 mr-2" />
                  Cancel
                </button>
              )}
            </div>
          </div>
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Order Items */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Order Items</h4>
                <div className="space-y-4">
                  {order.items?.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-16 h-16 bg-white rounded-lg border border-gray-200 flex items-center justify-center">
                          <img
                            src={item.product_data?.images?.[0]?.url || item.product_data?.image || '/placeholder-product.jpg'}
                            alt={item.product_name}
                            className="w-14 h-14 object-cover rounded"
                            onError={(e) => {
                              e.target.src = '/placeholder-product.jpg';
                            }}
                          />
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-900">{item.product_name}</h5>
                          <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                          <p className="text-sm text-gray-500">{formatMMK(item.price)} each</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{formatMMK(item.subtotal)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Information */}
              <div className="space-y-6">
                {/* Status & Dates */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-3">Order Status</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Current Status:</span>
                      <StatusBadge status={order.status} />
                    </div>
                    <div className="text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Order Date:</span>
                        <span>{formatDate(order.created_at)}</span>
                      </div>
                      {order.delivered_at && (
                        <div className="flex justify-between mt-1">
                          <span>Delivered Date:</span>
                          <span>{formatDate(order.delivered_at)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-3">Shipping Address</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <HomeIcon className="h-5 w-5 text-gray-400 mt-0.5" />
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

// Main Orders Page Component
const Orders = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch orders
  const fetchOrders = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get('/orders');
      setOrders(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      setError(error.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      await api.post(`/orders/${orderId}/cancel`);
      alert('Order cancelled successfully!');
      fetchOrders(); // Refresh orders list
    } catch (error) {
      console.error('Failed to cancel order:', error);
      alert(error.response?.data?.message || 'Failed to cancel order');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Login</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to view your orders.</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700"
          >
            Login Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
              <p className="text-gray-600 mt-2">View and manage your orders</p>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <button
                onClick={fetchOrders}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                <ArrowPathIcon className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <Link
                to="/products"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <ShoppingBagIcon className="h-4 w-4 mr-2" />
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
            <XCircleIcon className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-red-800 mb-2">Failed to Load Orders</h3>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={fetchOrders}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && orders.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <ShoppingBagIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No Orders Yet</h3>
            <p className="text-gray-600 mb-6">You haven't placed any orders yet.</p>
            <Link
              to="/products"
              className="inline-flex items-center px-6 py-3 border border-transparent rounded-lg text-base font-medium text-white bg-green-600 hover:bg-green-700"
            >
              <ShoppingBagIcon className="h-5 w-5 mr-2" />
              Start Shopping
            </Link>
          </div>
        )}

        {/* Orders List */}
        {!loading && !error && orders.length > 0 && (
          <div className="space-y-6">
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onViewDetails={handleViewDetails}
                onCancelOrder={handleCancelOrder}
              />
            ))}
          </div>
        )}

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

export default Orders;