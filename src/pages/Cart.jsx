import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { XMarkIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useCart } from "../context/CartContext";

const Cart = () => {
  const { t } = useTranslation();
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    subtotal,
    totalItems,
    clearCart,
    loading
  } = useCart();
  const navigate = useNavigate();
  const [clearingCart, setClearingCart] = useState(false);

  const shippingFee = 5000;
  const taxRate = 0.05;
  const tax = subtotal * taxRate;
  const total = subtotal + shippingFee + tax;

  const formatMMK = amount => {
    return new Intl.NumberFormat("my-MM", {
      style: "currency",
      currency: "MMK",
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleUpdateQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      await updateQuantity(cartItemId, newQuantity);
    } catch (error) {
      console.error("Failed to update quantity:", error);
      alert(error.message);
    }
  };

  const handleRemoveItem = async cartItemId => {
    if (window.confirm("Are you sure you want to remove this item from cart?")) {
      try {
        await removeFromCart(cartItemId);
      } catch (error) {
        console.error("Failed to remove item:", error);
        alert(error.message);
      }
    }
  };

  const handleClearCart = async () => {
    if (window.confirm("Are you sure you want to clear your entire cart?")) {
      setClearingCart(true);
      try {
        await clearCart();
      } catch (error) {
        console.error("Failed to clear cart:", error);
        alert(error.message);
      } finally {
        setClearingCart(false);
      }
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto lg:max-w-none">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto lg:max-w-none">
        <h1 className="text-3xl font-extrabold text-gray-900">
          {t("cart.title")} ({totalItems} {totalItems === 1 ? "item" : "items"})
        </h1>

        {cartItems.length === 0 ? (
          <div className="mt-12 text-center">
            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-32 h-32 mx-auto flex items-center justify-center">
              <XMarkIcon className="h-12 w-12 text-gray-400" />
            </div>
            <h2 className="mt-6 text-2xl font-bold text-gray-900">
              {t("cart.empty_title")}
            </h2>
            <p className="mt-2 text-lg text-gray-500">
              {t("cart.empty_message")}
            </p>
            <div className="mt-10">
              <Link 
                to="/products" 
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 transition-colors"
              >
                {t("cart.shop_now")}
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-8 lg:grid lg:grid-cols-12 lg:gap-x-12">
            <section className="lg:col-span-7">
              <ul className="divide-y divide-gray-200">
                {cartItems.map(item => (
                  <li key={item.id} className="py-6 flex">
                    <div className="flex-shrink-0 w-24 h-24 rounded-md overflow-hidden border border-gray-200">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-center object-cover"
                        onError={(e) => {
                          e.target.src = '/placeholder-product.jpg';
                        }}
                      />
                    </div>

                    <div className="ml-4 flex-1 flex flex-col">
                      <div className="flex justify-between">
                        <div className="flex-1">
                          <h4 className="text-lg font-medium text-gray-900 hover:text-green-700">
                            <Link to={`/products/${item.product_id}`}>
                              {item.name}
                            </Link>
                          </h4>
                          <p className="mt-1 text-sm text-gray-500">
                            {item.category}
                          </p>
                          <p className="mt-1 text-sm text-gray-500">
                            Stock: {item.stock}
                          </p>

                          {!item.is_available && (
                            <p className="mt-1 text-sm text-red-500">
                              Product no longer available
                            </p>
                          )}

                          {!item.is_quantity_valid && (
                            <p className="mt-1 text-sm text-red-500">
                              Quantity exceeds available stock
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-700">
                            {formatMMK(item.price)}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            {formatMMK(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center border border-gray-300 rounded">
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="px-3 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="1"
                            max={item.stock}
                            value={item.quantity}
                            onChange={e => {
                              const newQuantity = parseInt(e.target.value) || 1;
                              handleUpdateQuantity(item.id, newQuantity);
                            }}
                            className="w-12 text-center border-0 focus:ring-0 bg-transparent"
                          />
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.stock}
                            className="px-3 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          type="button"
                          className="flex items-center text-red-600 hover:text-red-500 transition-colors"
                        >
                          <TrashIcon className="h-4 w-4 mr-1" />
                          <span className="text-sm font-medium">Remove</span>
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <button 
                  onClick={handleClearCart}
                  disabled={clearingCart}
                  className="flex items-center text-sm font-medium text-red-600 hover:text-red-500 disabled:opacity-50 transition-colors"
                >
                  {clearingCart ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
                      Clearing...
                    </>
                  ) : (
                    <>
                      <TrashIcon className="h-4 w-4 mr-1" />
                      {t("cart.clear_cart")}
                    </>
                  )}
                </button>
              </div>
            </section>

            <section className="mt-16 bg-gray-50 rounded-lg px-6 py-6 lg:mt-0 lg:col-span-5">
              <h2 className="text-lg font-medium text-gray-900">
                {t("cart.order_summary")}
              </h2>

              <dl className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-gray-600">
                    {t("cart.subtotal")} ({totalItems} {totalItems === 1 ? "item" : "items"})
                  </dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {formatMMK(subtotal)}
                  </dd>
                </div>
                <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                  <dt className="text-sm text-gray-600">
                    {t("cart.shipping")}
                  </dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {formatMMK(shippingFee)}
                  </dd>
                </div>
                <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                  <dt className="text-sm text-gray-600">
                    {t("cart.tax")} (5%)
                  </dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {formatMMK(tax)}
                  </dd>
                </div>
                <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                  <dt className="text-lg font-bold text-gray-900">
                    {t("cart.total")}
                  </dt>
                  <dd className="text-lg font-bold text-gray-900">
                    {formatMMK(total)}
                  </dd>
                </div>
              </dl>

              <div className="mt-6 space-y-3">
                <button 
                  onClick={() => navigate("/checkout")}
                  className="w-full bg-green-600 border border-transparent rounded-md py-3 px-4 flex items-center justify-center text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                >
                  {t("cart.checkout")}
                </button>
                <Link 
                  to="/products"
                  className="w-full bg-white border border-gray-300 rounded-md py-3 px-4 flex items-center justify-center text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;