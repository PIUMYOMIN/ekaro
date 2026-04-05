import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { XMarkIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useCart } from "../context/CartContext";
import SEO from "../components/SEO/SEO";

const Cart = () => {
  const { t } = useTranslation();
  const {
    cartItems,
    cartSummary,
    removeFromCart,
    updateQuantity,
    subtotal,
    totalItems,
    clearCart,
    loading
  } = useCart();
  const navigate = useNavigate();
  const [clearingCart, setClearingCart] = useState(false);
  const [updatingItemId, setUpdatingItemId] = useState(null);
  const [removingItemId, setRemovingItemId] = useState(null);

  const formatMMK = amount => {
    return new Intl.NumberFormat("my-MM", {
      style: "currency",
      currency: "MMK",
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const getItemImage = (item) => {
    if (item.image) return item.image;
    return '/placeholder-product.jpg';
  };

  const handleUpdateQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) return;
    if (updatingItemId === cartItemId) return;
    
    setUpdatingItemId(cartItemId);
    try {
      await updateQuantity(cartItemId, newQuantity);
    } catch (error) {
      alert(error.message);
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleRemoveItem = async (cartItemId) => {
    if (removingItemId === cartItemId) return;
    
    if (window.confirm("Are you sure you want to remove this item?")) {
      setRemovingItemId(cartItemId);
      try {
        await removeFromCart(cartItemId);
      } catch (error) {
        alert(error.message);
      } finally {
        setRemovingItemId(null);
      }
    }
  };

  const handleClearCart = async () => {
    if (window.confirm("Are you sure you want to clear your entire cart?")) {
      setClearingCart(true);
      try {
        await clearCart();
      } catch (error) {
        alert(error.message);
      } finally {
        setClearingCart(false);
      }
    }
  };

  const hasUnavailableItems = cartItems.some(item => !item.is_available);
  const hasQuantityIssues = cartItems.some(item => !item.is_quantity_valid);
  const canCheckout = cartItems.length > 0 && !hasUnavailableItems && !hasQuantityIssues;

  if (loading && cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <SEO title="My Cart" description="Your shopping cart on Pyonea." noindex={true} />
      <div className="max-w-2xl mx-auto lg:max-w-none">
        <h1 className="text-3xl font-extrabold text-gray-900">
          Cart ({totalItems} {totalItems === 1 ? "item" : "items"})
        </h1>

        {cartItems.length === 0 ? (
          <div className="mt-12 text-center">
            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-32 h-32 mx-auto flex items-center justify-center">
              <XMarkIcon className="h-12 w-12 text-gray-400" />
            </div>
            <h2 className="mt-6 text-2xl font-bold text-gray-900">Your cart is empty</h2>
            <p className="mt-2 text-lg text-gray-500">Start adding some products!</p>
            <div className="mt-10">
              <Link 
                to="/products" 
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        ) : (
          <>
            {(hasUnavailableItems || hasQuantityIssues) && (
              <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <p className="text-sm text-yellow-700">
                  {hasUnavailableItems && "Some items are no longer available. "}
                  {hasQuantityIssues && "Some items have quantity issues. "}
                  Please review your cart before checkout.
                </p>
              </div>
            )}

            <div className="mt-8 lg:grid lg:grid-cols-12 lg:gap-x-12">
              <section className="lg:col-span-7">
                <ul className="divide-y divide-gray-200">
                  {cartItems.map(item => {
                    const isUpdating = updatingItemId === item.id;
                    const isRemoving = removingItemId === item.id;
                    
                    return (
                      <li key={item.id} className={`py-6 flex ${isRemoving ? 'opacity-50' : ''}`}>
                        <div className="flex-shrink-0 w-24 h-24 rounded-md overflow-hidden border border-gray-200">
                          <img
                            src={getItemImage(item)}
                            alt={item.name}
                            className="w-full h-full object-center object-contain"
                            onError={(e) => e.target.src = '/placeholder-product.jpg'}
                          />
                        </div>

                        <div className="ml-4 flex-1 flex flex-col">
                          <div className="flex justify-between">
                            <div className="flex-1">
                              <h4 className="text-lg font-medium text-gray-900">
                                <Link to={`/products/${item.product_id}`}>
                                  {item.name}
                                </Link>
                              </h4>
                              <p className="mt-1 text-sm text-gray-500">{item.category}</p>
                              <p className="mt-1 text-sm text-gray-500">Stock: {item.stock}</p>

                              {!item.is_available && (
                                <p className="mt-1 text-sm text-red-500 font-medium">
                                  ⚠️ Product no longer available
                                </p>
                              )}

                              {item.is_available && !item.is_quantity_valid && (
                                <p className="mt-1 text-sm text-red-500 font-medium">
                                  ⚠️ Only {item.stock} items available
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-green-700">
                                {formatMMK(item.price)}
                              </p>
                              <p className="text-sm text-gray-500 mt-1">
                                {formatMMK(item.subtotal)}
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 flex items-center justify-between">
                            <div className="flex items-center border border-gray-300 rounded">
                              <button
                                onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                disabled={item.quantity <= 1 || isUpdating || !item.is_available}
                                className="px-3 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                              >
                                -
                              </button>
                              <div className="relative">
                                <input
                                  type="number"
                                  min="1"
                                  max={item.stock}
                                  value={item.quantity}
                                  onChange={e => {
                                    const newQuantity = parseInt(e.target.value) || 1;
                                    if (newQuantity >= 1 && newQuantity <= item.stock) {
                                      handleUpdateQuantity(item.id, newQuantity);
                                    }
                                  }}
                                  disabled={isUpdating || !item.is_available}
                                  className="w-12 text-center border-0 focus:ring-0 bg-transparent"
                                />
                                {isUpdating && (
                                  <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"></div>
                                  </div>
                                )}
                              </div>
                              <button
                                onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                disabled={item.quantity >= item.stock || isUpdating || !item.is_available}
                                className="px-3 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                              >
                                +
                              </button>
                            </div>
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              disabled={isRemoving}
                              className="flex items-center text-red-600 hover:text-red-500 disabled:opacity-50"
                            >
                              {isRemoving ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-1"></div>
                                  <span className="text-sm">Removing...</span>
                                </>
                              ) : (
                                <>
                                  <TrashIcon className="h-4 w-4 mr-1" />
                                  <span className="text-sm">Remove</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>

                <div className="mt-8">
                  <button 
                    onClick={handleClearCart}
                    disabled={clearingCart}
                    className="flex items-center text-sm font-medium text-red-600 hover:text-red-500 disabled:opacity-50"
                  >
                    {clearingCart ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
                        Clearing...
                      </>
                    ) : (
                      <>
                        <TrashIcon className="h-4 w-4 mr-1" />
                        Clear Cart
                      </>
                    )}
                  </button>
                </div>
              </section>

              <section className="mt-16 bg-gray-50 rounded-lg px-6 py-6 lg:mt-0 lg:col-span-5">
                <h2 className="text-lg font-medium text-gray-900">Order Summary</h2>

                <dl className="mt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <dt className="text-sm text-gray-600">Subtotal ({totalItems} items)</dt>
                    <dd className="text-sm font-medium text-gray-900">{formatMMK(subtotal)}</dd>
                  </div>
                  <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                    <dt className="text-sm text-gray-600">Shipping <span className="text-xs text-gray-400 font-normal">(est.)</span></dt>
                    <dd className="text-sm font-medium text-gray-900">{formatMMK(cartSummary?.shipping_fee || 0)}</dd>
                  </div>
                  <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                    <dt className="text-sm text-gray-600">Tax (5%)</dt>
                    <dd className="text-sm font-medium text-gray-900">{formatMMK(cartSummary?.tax ?? 0)}</dd>
                  </div>
                  <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                    <dt className="text-lg font-bold text-gray-900">Estimated Total</dt>
                    <dd className="text-lg font-bold text-gray-900">{formatMMK(cartSummary?.total || 0)}</dd>
                  </div>
                </dl>

                <div className="mt-6 space-y-3">
                  <button 
                    onClick={() => navigate("/checkout")}
                    disabled={!canCheckout}
                    className={`w-full rounded-md py-3 px-4 text-base font-medium text-white ${
                      canCheckout 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : 'bg-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Proceed to Checkout
                  </button>
                  <Link 
                    to="/products"
                    className="w-full bg-white border border-gray-300 rounded-md py-3 px-4 text-center text-base font-medium text-gray-700 hover:bg-gray-50 block"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </section>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Cart;