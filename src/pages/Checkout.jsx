import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  CubeIcon,
  CurrencyDollarIcon,
  TruckIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  MapPinIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  XCircleIcon,
  XMarkIcon,
  CheckCircleIcon,
  QrCodeIcon
} from "@heroicons/react/24/outline";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import MMQRPayment from "./MMQRPayment";
import PaymentSuccess from './PaymentSuccess';

// Utility functions
function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

function formatMMK(amount) {
  return new Intl.NumberFormat("en-MM", {
    style: "currency",
    currency: "MMK",
    minimumFractionDigits: 0
  }).format(amount);
}

export default function Checkout() {
  const { t } = useTranslation();
  const { cartItems, subtotal, totalItems, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);

  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [successOrder, setSuccessOrder] = useState(null);
  const [successPaymentData, setSuccessPaymentData] = useState(null);

  const [paymentAttempts, setPaymentAttempts] = useState(0);

  const [shippingAddress, setShippingAddress] = useState({
    full_name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    postal_code: "",
    country: "Myanmar"
  });
  const [paymentMethod, setPaymentMethod] = useState("mmqr");
  const [orderNotes, setOrderNotes] = useState("");

  const shippingFee = 5000;
  const taxRate = 0.05;
  const tax = subtotal * taxRate;
  const total = subtotal + shippingFee + tax;

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await api.get('/auth/me');
        const userData = response.data.data || response.data;
        setUserProfile(userData);

        // Pre-fill shipping address with user data
        setShippingAddress(prev => ({
          ...prev,
          full_name: userData.name || "",
          phone: userData.phone || "",
          address: userData.address || "",
          city: userData.city || "",
          state: userData.state || "",
          postal_code: userData.postal_code || ""
        }));
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
      }
    };

    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const handleInputChange = (field, value) => {
    setShippingAddress(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const createOrderWithPendingPayment = async () => {
    setLoading(true);
    try {
      const orderData = {
        items: cartItems.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price
        })),
        shipping_address: shippingAddress,
        payment_method: paymentMethod,
        payment_status: 'pending',
        notes: orderNotes,
        total_amount: total,
        subtotal_amount: subtotal,
        shipping_fee: shippingFee,
        tax_amount: tax
      };

      const response = await api.post('/orders', orderData);

      if (response.data.success) {
        const order = response.data.data.orders?.[0] || response.data.data.order;
        setCurrentOrder(order);
        setShowPaymentModal(true);
        setPaymentAttempts(prev => prev + 1);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to create order:", error);
      setSuccessMessage({
        type: 'error',
        message: error.response?.data?.message || "Failed to create order. Please try again."
      });
      setShowSuccessPopup(true);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (paymentData = null) => {
    setLoading(true);
    try {
      const orderData = {
        items: cartItems.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price
        })),
        shipping_address: shippingAddress,
        payment_method: paymentMethod,
        payment_status: paymentData ? 'paid' : 'pending',
        payment_data: paymentData,
        notes: orderNotes,
        total_amount: total,
        subtotal_amount: subtotal,
        shipping_fee: shippingFee,
        tax_amount: tax
      };

      const response = await api.post('/orders', orderData);

      if (response.data.success) {
        const order = response.data.data.orders?.[0] || response.data.data.order;
        setSuccessMessage({
          type: 'success',
          message: `Order created successfully! Order #${order?.order_number || ''}`
        });
        setShowSuccessPopup(true);

        // Clear cart on successful order
        setTimeout(() => {
          clearCart();
          navigate("/buyer");
        }, 2000);
      }
    } catch (error) {
      console.error("Failed to create order:", error);
      setSuccessMessage({
        type: 'error',
        message: error.response?.data?.message || "Failed to create order. Please try again."
      });
      setShowSuccessPopup(true);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmOrder = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    // Validate shipping address
    if (!shippingAddress.full_name || !shippingAddress.phone || !shippingAddress.address) {
      setSuccessMessage({
        type: 'error',
        message: 'Please fill in all required shipping information'
      });
      setShowSuccessPopup(true);
      return;
    }

    // For MMQR, show payment modal instead of immediately creating order
    if (paymentMethod === 'mmqr') {
      await createOrderWithPendingPayment();
    } else if (paymentMethod === 'cash_on_delivery') {
      await createOrder();
    } else {
      // For other payment methods, create order with pending payment
      await createOrderWithPendingPayment();
    }
  };

  const handleMMQRSuccess = async (paymentData) => {
    console.log('Payment success called with:', { paymentData, currentOrder });

    try {
      // Update order with successful payment
      const updateResponse = await api.patch(`/orders/${currentOrder.id}/payment`, {
        payment_status: 'paid',
        payment_data: paymentData
      });

      console.log('Payment update response:', updateResponse.data);

      setShowPaymentModal(false);

      // Fetch the complete order details with items
      const orderResponse = await api.get(`/orders/${currentOrder.id}`);
      console.log('Order details response:', orderResponse.data);

      if (orderResponse.data.success) {
        setSuccessOrder(orderResponse.data.data);
        setSuccessPaymentData(paymentData);
        setPaymentSuccess(true);

        console.log('Setting payment success to true - user can now download receipt');

        // Clear cart on successful payment
        clearCart();

        // Reset payment attempts
        setPaymentAttempts(0);
      } else {
        throw new Error('Failed to fetch order details');
      }
    } catch (error) {
      console.error("Failed to update payment status:", error);
      setSuccessMessage({
        type: 'error',
        message: 'Payment successful but failed to load order details. Please check your orders page.'
      });
      setShowSuccessPopup(true);
    }
  };

  const handleMMQRFailed = async (error) => {
    console.log('Payment failed called with:', error);

    try {
      if (currentOrder && currentOrder.id) {
        // Update order with failed payment
        await api.patch(`/orders/${currentOrder.id}/payment`, {
          payment_status: 'failed',
          payment_data: { error }
        });
      }

      setShowPaymentModal(false);

      // Don't clear cart on failed payment - allow retry
      setSuccessMessage({
        type: 'error',
        message: `Payment failed: ${error}. Please try again.`
      });
      setShowSuccessPopup(true);

    } catch (updateError) {
      console.error("Failed to update payment status:", updateError);
      setShowPaymentModal(false);
      setSuccessMessage({
        type: 'error',
        message: `Payment failed: ${error}. Please try again.`
      });
      setShowSuccessPopup(true);
    }
  };

  const paymentMethods = [
    {
      id: "mmqr",
      name: "MMQR Payment",
      description: "Scan QR code with any mobile banking app",
      icon: QrCodeIcon,
      color: "bg-blue-500"
    },
    {
      id: "kbz_pay",
      name: "KBZ Pay",
      description: "Pay with KBZ Pay mobile wallet",
      icon: CreditCardIcon,
      color: "bg-purple-500"
    },
    {
      id: "wave_pay",
      name: "Wave Pay",
      description: "Pay with Wave Pay mobile wallet",
      icon: CreditCardIcon,
      color: "bg-green-500"
    },
    {
      id: "cb_pay",
      name: "CB Pay",
      description: "Pay with CB Pay mobile wallet",
      icon: CreditCardIcon,
      color: "bg-red-500"
    },
    {
      id: "aya_pay",
      name: "AYA Pay",
      description: "Pay with AYA Pay mobile wallet",
      icon: CreditCardIcon,
      color: "bg-orange-500"
    },
    {
      id: "cash_on_delivery",
      name: "Cash on Delivery",
      description: "Pay when you receive your order",
      icon: CurrencyDollarIcon,
      color: "bg-yellow-500"
    }
  ];

  // If payment is successful, ONLY show PaymentSuccess component
  if (paymentSuccess && successOrder) {
    return (
      <PaymentSuccess
        order={successOrder}
        paymentData={successPaymentData}
        onClose={() => {
          setPaymentSuccess(false);
          navigate('/buyer');
        }}
      />
    );
  }

  // If cart is empty and we're not in any payment process, show empty cart
  if (cartItems.length === 0 && !showPaymentModal && !loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CubeIcon className="h-12 w-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Your cart is empty
            </h2>
            <p className="text-gray-600 mb-8">
              Add some products to your cart before checking out
            </p>
            <button
              onClick={() => navigate("/products")}
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Otherwise, show the normal checkout page
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* MMQR Payment Modal */}
        {showPaymentModal && currentOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Complete Your Payment</h3>
                  <button
                    onClick={() => {
                      setShowPaymentModal(false);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
              </div>
              <MMQRPayment
                key={paymentAttempts}
                amount={total}
                orderNumber={currentOrder.order_number}
                onPaymentSuccess={handleMMQRSuccess}
                onPaymentFailed={handleMMQRFailed}
              />
              <div className="p-4 border-t bg-gray-50">
                <p className="text-sm text-gray-600 text-center">
                  Having issues? <button
                    onClick={() => {
                      setShowPaymentModal(false);
                      setCurrentOrder(null);
                    }}
                    className="text-green-600 hover:text-green-700 font-medium"
                  >
                    Try a different payment method
                  </button>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Success/Error Popup */}
        {showSuccessPopup && (
          <div className="fixed top-4 right-4 z-50 max-w-sm">
            <div className={`rounded-lg shadow-lg p-4 ${successMessage.type === 'success'
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
              }`}>
              <div className="flex items-center">
                <div className={`flex-shrink-0 ${successMessage.type === 'success' ? 'text-green-400' : 'text-red-400'
                  }`}>
                  {successMessage.type === 'success' ? (
                    <CheckCircleIcon className="h-6 w-6" />
                  ) : (
                    <XCircleIcon className="h-6 w-6" />
                  )}
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${successMessage.type === 'success' ? 'text-green-800' : 'text-red-800'
                    }`}>
                    {successMessage.message}
                  </p>
                </div>
                <button
                  onClick={() => setShowSuccessPopup(false)}
                  className="ml-auto pl-3"
                >
                  <XMarkIcon className={`h-5 w-5 ${successMessage.type === 'success' ? 'text-green-400' : 'text-red-400'
                    }`} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600 mt-2">Complete your purchase</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Order Details & Forms */}
          <div className="space-y-6">
            {/* Shipping Information */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center mb-6">
                <MapPinIcon className="h-6 w-6 text-green-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Shipping Information
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={shippingAddress.full_name}
                      onChange={(e) => handleInputChange('full_name', e.target.value)}
                      className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="tel"
                      required
                      value={shippingAddress.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="09XXXXXXXXX"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address *
                  </label>
                  <textarea
                    required
                    value={shippingAddress.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter your complete address including township and city"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="City"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State/Region
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="State/Region"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.postal_code}
                    onChange={(e) => handleInputChange('postal_code', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Postal Code"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.country}
                    disabled
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                    placeholder="Country"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center mb-6">
                <CreditCardIcon className="h-6 w-6 text-green-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Payment Method
                </h2>
              </div>

              <div className="space-y-4">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className={classNames(
                      "border-2 rounded-lg p-4 cursor-pointer transition-all",
                      paymentMethod === method.id
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                    onClick={() => setPaymentMethod(method.id)}
                  >
                    <div className="flex items-center">
                      <div className={classNames(
                        "w-10 h-10 rounded-full flex items-center justify-center mr-4",
                        method.color
                      )}>
                        <method.icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{method.name}</h3>
                        <p className="text-sm text-gray-600">{method.description}</p>
                      </div>
                      <div className={classNames(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                        paymentMethod === method.id
                          ? "border-green-500 bg-green-500"
                          : "border-gray-300"
                      )}>
                        {paymentMethod === method.id && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Payment Method Instructions */}
              {paymentMethod === 'mmqr' && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>How MMQR works:</strong> After confirming your order, you'll see a QR code to scan with any mobile banking app that supports MMQR.
                  </p>
                </div>
              )}

              {paymentMethod === 'cash_on_delivery' && (
                <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Cash on Delivery:</strong> You'll pay the delivery person when you receive your order. An additional verification call may be made.
                  </p>
                </div>
              )}
            </div>

            {/* Order Notes */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Order Notes (Optional)
              </h3>
              <textarea
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Any special instructions for your order, delivery timing preferences, or additional information..."
              />
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Order Summary
              </h2>

              {/* Order Items */}
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-10 h-10 object-cover rounded"
                          onError={(e) => {
                            e.target.src = '/placeholder-product.jpg';
                          }}
                        />
                      </div>
                      <div className="max-w-[180px]">
                        <h4 className="font-medium text-gray-900 text-sm line-clamp-2">
                          {item.name}
                        </h4>
                        <p className="text-gray-500 text-sm">
                          Qty: {item.quantity}
                        </p>
                        {item.seller_name && (
                          <p className="text-gray-400 text-xs">
                            Sold by: {item.seller_name}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {formatMMK(item.price * item.quantity)}
                      </p>
                      <p className="text-gray-500 text-sm">
                        {formatMMK(item.price)} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 border-t border-gray-200 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal ({totalItems} items)</span>
                  <span className="text-gray-900">{formatMMK(subtotal)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-gray-900">{formatMMK(shippingFee)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax (5%)</span>
                  <span className="text-gray-900">{formatMMK(tax)}</span>
                </div>

                <div className="flex justify-between text-lg font-semibold border-t border-gray-200 pt-3">
                  <span className="text-gray-900">Total</span>
                  <span className="text-green-600">{formatMMK(total)}</span>
                </div>
              </div>

              {/* Security Badge */}
              <div className="mt-6 flex items-center justify-center space-x-2 text-sm text-gray-500">
                <ShieldCheckIcon className="h-4 w-4" />
                <span>Secure checkout · SSL encrypted</span>
              </div>

              {/* Confirm Order Button */}
              <button
                onClick={handleConfirmOrder}
                disabled={loading}
                className={classNames(
                  "w-full mt-6 py-4 px-6 rounded-lg font-semibold text-white transition-all",
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-xl"
                )}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing Order...
                  </div>
                ) : paymentMethod === 'cash_on_delivery' ? (
                  `Confirm Cash Order - ${formatMMK(total)}`
                ) : (
                  `Proceed to Payment - ${formatMMK(total)}`
                )}
              </button>

              {/* Continue Shopping */}
              <button
                onClick={() => navigate("/products")}
                className="w-full mt-3 py-3 px-6 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Continue Shopping
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <TruckIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900">Fast Delivery</p>
                  <p className="text-xs text-gray-600">2-5 business days</p>
                </div>
                <div>
                  <ShieldCheckIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900">Secure Payment</p>
                  <p className="text-xs text-gray-600">SSL Protected</p>
                </div>
              </div>
            </div>

            {/* Delivery Information */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Delivery Information
              </h3>
              <div className="space-y-3 text-sm text-gray-600">
                <p>
                  • Orders are processed within 24 hours
                </p>
                <p>
                  • Suppliers may contact you for delivery details
                </p>
                <p>
                  • Tracking information will be provided after shipment
                </p>
                <p>
                  • Free returns within 7 days for eligible items
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}