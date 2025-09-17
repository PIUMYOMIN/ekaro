import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useCart } from "../context/CartContext";

const Cart = () => {
  const { t } = useTranslation();
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    subtotal,
    totalItems,
    clearCart
  } = useCart();
  const navigate = useNavigate();

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

  return <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto lg:max-w-none">
        <h1 className="text-3xl font-extrabold text-gray-900">
          {t("cart.title")}
        </h1>

        {cartItems.length === 0 ? <div className="mt-12 text-center">
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-32 h-32 mx-auto" />
              <h2 className="mt-6 text-2xl font-bold text-gray-900">
                {t("cart.empty_title")}
              </h2>
              <p className="mt-2 text-lg text-gray-500">
                {t("cart.empty_message")}
              </p>
              <div className="mt-10">
                <Link to="/products" className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700">
                  {t("cart.shop_now")}
                </Link>
              </div>
            </div> : <div className="mt-8 lg:grid lg:grid-cols-12 lg:gap-x-12">
              <section className="lg:col-span-7">
                <ul className="divide-y divide-gray-200">
                  {cartItems.map(item =>
                    <li key={item.id} className="py-6 flex">
                      <div className="flex-shrink-0 w-24 h-24 rounded-md overflow-hidden">
                        <img
                          src={"" + item.image}
                          alt={item.name}
                          className="w-full h-full object-center object-cover"
                        />
                      </div>

                      <div className="ml-4 flex-1 flex flex-col sm:flex-row">
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <h4 className="text-sm font-medium text-gray-900">
                              {item.name}
                            </h4>
                            <p className="ml-4 text-sm font-medium text-green-700">
                              {formatMMK(item.price)}
                            </p>
                          </div>
                          <p className="mt-1 text-sm text-gray-500">
                            {item.category}
                          </p>
                          <div className="mt-4 flex-1 flex items-end">
                            <div className="flex items-center border border-gray-300 rounded">
                              <button
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity - 1)}
                                className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={e =>
                                  updateQuantity(
                                    item.id,
                                    parseInt(e.target.value) || 1
                                  )}
                                className="w-12 text-center border-0 focus:ring-0"
                              />
                              <button
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity + 1)}
                                className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                              >
                                +
                              </button>
                            </div>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              type="button"
                              className="ml-4 text-sm font-medium text-green-600 hover:text-green-500"
                            >
                              <span>
                                {t("cart.remove")}
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  )}
                </ul>

                <div className="mt-8">
                  <button onClick={clearCart} className="text-sm font-medium text-red-600 hover:text-red-500">
                    {t("cart.clear_cart")}
                  </button>
                </div>
              </section>

              <section className="mt-16 bg-gray-50 rounded-lg px-4 py-6 sm:p-6 lg:p-8 lg:mt-0 lg:col-span-5">
                <h2 className="text-lg font-medium text-gray-900">
                  {t("cart.order_summary")}
                </h2>

                <dl className="mt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <dt className="text-sm text-gray-600">
                      {t("cart.subtotal")}
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
                      {t("cart.tax")}
                    </dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {formatMMK(tax)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                    <dt className="text-base font-medium text-gray-900">
                      {t("cart.total")}
                    </dt>
                    <dd className="text-base font-medium text-gray-900">
                      {formatMMK(total)}
                    </dd>
                  </div>
                </dl>

                <div className="mt-6">
                  <button onClick={() => navigate("/checkout")} className="w-full bg-green-600 border border-transparent rounded-md py-3 px-4 flex items-center justify-center text-base font-medium text-white hover:bg-green-700">
                    {t("cart.checkout")}
                  </button>
                </div>
              </section>
            </div>}
      </div>
    </div>;
};

export default Cart;
