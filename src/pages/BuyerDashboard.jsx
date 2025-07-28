import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChartBarIcon,
  ShoppingBagIcon,
  CubeIcon,
  CurrencyDollarIcon,
  StarIcon,
  UserGroupIcon,
  TruckIcon,
  CogIcon,
  DocumentTextIcon,
  UserCircleIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  HomeIcon,
  CreditCardIcon
} from "@heroicons/react/24/outline";

// Utility functions
function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

function formatMMK(amount) {
  return amount.toLocaleString("en-MM", {
    style: "currency",
    currency: "MMK",
    minimumFractionDigits: 0
  });
}

// Dummy data for demonstration
const recentOrders = [
  {
    id: "ORD-12345",
    date: "2023-06-15",
    status: "Delivered",
    items: [
      { name: "Mobile Legends Diamonds", price: 25000, quantity: 1 },
      { name: "PUBG UC", price: 50000, quantity: 2 }
    ],
    total: 125000
  },
  {
    id: "ORD-12346",
    date: "2023-06-10",
    status: "Processing",
    items: [{ name: "Free Fire Diamonds", price: 30000, quantity: 3 }],
    total: 90000
  },
  {
    id: "ORD-12347",
    date: "2023-06-05",
    status: "Shipped",
    items: [
      { name: "Genshin Impact Genesis Crystals", price: 45000, quantity: 1 },
      { name: "Valorant Points", price: 35000, quantity: 1 }
    ],
    total: 80000
  }
];

const paymentMethods = [
  { id: 1, type: "KBZ Pay", last4: "1234", isDefault: true },
  { id: 2, type: "Wave Money", last4: "5678", isDefault: false },
  { id: 3, type: "Credit Card", last4: "9012", isDefault: false }
];

const BuyerDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const navigate = useNavigate();

  const stats = [
    { name: "Total Orders", value: 24, icon: ShoppingBagIcon },
    { name: "Pending Orders", value: 2, icon: ClockIcon },
    { name: "Total Spent", value: 985000, icon: CurrencyDollarIcon },
    { name: "Loyalty Points", value: 1245, icon: StarIcon }
  ];

  // Calculate total spent
  const totalSpent = recentOrders.reduce((sum, order) => sum + order.total, 0);

  // Calculate total orders
  const totalOrders = recentOrders.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Buyer Dashboard
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/")}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <HomeIcon className="h-5 w-5 mr-1" />
              Home
            </button>
            <div className="flex items-center">
              <UserCircleIcon className="h-8 w-8 text-gray-400" />
              <span className="ml-2 text-sm font-medium text-gray-700">
                John Doe
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex">
          {/* Sidebar Navigation */}
          <div className="w-64 pr-6">
            <nav className="space-y-1 bg-white rounded-lg shadow p-4">
              <button
                onClick={() => setActiveTab("dashboard")}
                className={classNames(
                  activeTab === "dashboard"
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-900 hover:bg-gray-50",
                  "group flex items-center px-3 py-2 text-sm font-medium rounded-md w-full"
                )}
              >
                <ChartBarIcon
                  className={classNames(
                    activeTab === "dashboard"
                      ? "text-blue-500"
                      : "text-gray-400 group-hover:text-gray-500",
                    "mr-3 h-6 w-6"
                  )}
                />
                Dashboard
              </button>

              <button
                onClick={() => setActiveTab("orders")}
                className={classNames(
                  activeTab === "orders"
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-900 hover:bg-gray-50",
                  "group flex items-center px-3 py-2 text-sm font-medium rounded-md w-full"
                )}
              >
                <ShoppingBagIcon
                  className={classNames(
                    activeTab === "orders"
                      ? "text-blue-500"
                      : "text-gray-400 group-hover:text-gray-500",
                    "mr-3 h-6 w-6"
                  )}
                />
                My Orders
              </button>

              <button
                onClick={() => setActiveTab("payments")}
                className={classNames(
                  activeTab === "payments"
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-900 hover:bg-gray-50",
                  "group flex items-center px-3 py-2 text-sm font-medium rounded-md w-full"
                )}
              >
                <CreditCardIcon
                  className={classNames(
                    activeTab === "payments"
                      ? "text-blue-500"
                      : "text-gray-400 group-hover:text-gray-500",
                    "mr-3 h-6 w-6"
                  )}
                />
                Payment Methods
              </button>

              <button
                onClick={() => setActiveTab("account")}
                className={classNames(
                  activeTab === "account"
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-900 hover:bg-gray-50",
                  "group flex items-center px-3 py-2 text-sm font-medium rounded-md w-full"
                )}
              >
                <UserGroupIcon
                  className={classNames(
                    activeTab === "account"
                      ? "text-blue-500"
                      : "text-gray-400 group-hover:text-gray-500",
                    "mr-3 h-6 w-6"
                  )}
                />
                Account Settings
              </button>

              <button
                onClick={() => setActiveTab("support")}
                className={classNames(
                  activeTab === "support"
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-900 hover:bg-gray-50",
                  "group flex items-center px-3 py-2 text-sm font-medium rounded-md w-full"
                )}
              >
                <DocumentTextIcon
                  className={classNames(
                    activeTab === "support"
                      ? "text-blue-500"
                      : "text-gray-400 group-hover:text-gray-500",
                    "mr-3 h-6 w-6"
                  )}
                />
                Support
              </button>
            </nav>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            {/* Dashboard Tab */}
            {activeTab === "dashboard" &&
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Dashboard Overview
                </h2>

                {/* Stats */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                  {stats.map(stat =>
                    <div
                      key={stat.name}
                      className="bg-white overflow-hidden shadow rounded-lg"
                    >
                      <div className="px-4 py-5 sm:p-6">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                            <stat.icon className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="ml-5 w-0 flex-1">
                            <dl>
                              <dt className="text-sm font-medium text-gray-500 truncate">
                                {stat.name}
                              </dt>
                              <dd className="flex items-baseline">
                                <div className="text-2xl font-semibold text-gray-900">
                                  {stat.name === "Total Spent"
                                    ? formatMMK(stat.value)
                                    : stat.value}
                                </div>
                              </dd>
                            </dl>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Recent Orders */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Recent Orders
                  </h3>
                  <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <ul className="divide-y divide-gray-200">
                      {recentOrders.slice(0, 3).map(order =>
                        <li key={order.id}>
                          <div className="px-4 py-4 flex items-center sm:px-6">
                            <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                              <div className="truncate">
                                <div className="flex text-sm">
                                  <p className="font-medium text-blue-600 truncate">
                                    Order #{order.id}
                                  </p>
                                  <p className="ml-4 flex-shrink-0 font-normal text-gray-500">
                                    {order.date}
                                  </p>
                                </div>
                                <div className="mt-2 flex">
                                  <div className="flex items-center text-sm text-gray-500">
                                    <CubeIcon
                                      className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                                      aria-hidden="true"
                                    />
                                    <p>
                                      {order.items.length} item{order.items.length > 1 ? "s" : ""}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div className="mt-4 flex-shrink-0 sm:mt-0 sm:ml-5">
                                <div className="flex items-center">
                                  <span className="mr-4 text-lg font-semibold text-gray-900">
                                    {formatMMK(order.total)}
                                  </span>
                                  <span
                                    className={classNames(
                                      order.status === "Delivered"
                                        ? "bg-green-100 text-green-800"
                                        : order.status === "Processing"
                                          ? "bg-yellow-100 text-yellow-800"
                                          : "bg-blue-100 text-blue-800",
                                      "px-2 py-1 text-xs rounded-full"
                                    )}
                                  >
                                    {order.status}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="ml-5 flex-shrink-0">
                              <ArrowRightIcon
                                className="h-5 w-5 text-gray-400"
                                aria-hidden="true"
                              />
                            </div>
                          </div>
                        </li>
                      )}
                    </ul>
                  </div>
                  <div className="mt-4 text-right">
                    <button
                      onClick={() => setActiveTab("orders")}
                      className="text-blue-600 hover:text-blue-900 font-medium"
                    >
                      View all orders →
                    </button>
                  </div>
                </div>

                {/* Quick Actions */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Quick Actions
                  </h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <button
                      onClick={() => navigate("/products")}
                      className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 text-center hover:bg-gray-50"
                    >
                      <ShoppingBagIcon className="h-10 w-10 mx-auto text-blue-600" />
                      <p className="mt-2 font-medium text-gray-900">Shop Now</p>
                      <p className="text-sm text-gray-500">
                        Browse our latest products
                      </p>
                    </button>

                    <button
                      onClick={() => setActiveTab("payments")}
                      className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 text-center hover:bg-gray-50"
                    >
                      <CreditCardIcon className="h-10 w-10 mx-auto text-blue-600" />
                      <p className="mt-2 font-medium text-gray-900">
                        Payment Methods
                      </p>
                      <p className="text-sm text-gray-500">
                        Manage your payment options
                      </p>
                    </button>

                    <button
                      onClick={() => setActiveTab("support")}
                      className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 text-center hover:bg-gray-50"
                    >
                      <DocumentTextIcon className="h-10 w-10 mx-auto text-blue-600" />
                      <p className="mt-2 font-medium text-gray-900">
                        Get Support
                      </p>
                      <p className="text-sm text-gray-500">
                        Contact our support team
                      </p>
                    </button>
                  </div>
                </div>
              </div>}

            {/* Orders Tab */}
            {activeTab === "orders" &&
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Order History
                </h2>

                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                  <ul className="divide-y divide-gray-200">
                    {recentOrders.map(order =>
                      <li key={order.id}>
                        <div className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-blue-600 truncate">
                              Order #{order.id}
                            </p>
                            <p className="text-sm text-gray-500 ml-2">
                              {order.date}
                            </p>
                            <p
                              className={classNames(
                                order.status === "Delivered"
                                  ? "bg-green-100 text-green-800"
                                  : order.status === "Processing"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-blue-100 text-blue-800",
                                "px-2 py-1 text-xs rounded-full"
                              )}
                            >
                              {order.status}
                            </p>
                          </div>
                          <div className="mt-2 sm:flex sm:justify-between">
                            <div className="sm:flex">
                              <p className="flex items-center text-sm text-gray-500">
                                <CubeIcon
                                  className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                                  aria-hidden="true"
                                />
                                {order.items.length} item{order.items.length > 1 ? "s" : ""}
                              </p>
                            </div>
                            <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                              <CurrencyDollarIcon
                                className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                                aria-hidden="true"
                              />
                              <p>
                                Total:{" "}
                                <span className="font-semibold">
                                  {formatMMK(order.total)}
                                </span>
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 border-t border-gray-200 pt-4">
                            <h4 className="text-sm font-medium text-gray-900">
                              Items
                            </h4>
                            <ul className="mt-2 divide-y divide-gray-200">
                              {order.items.map((item, itemIdx) =>
                                <li
                                  key={itemIdx}
                                  className="py-2 flex justify-between"
                                >
                                  <div className="flex">
                                    <span className="font-medium text-gray-900">
                                      {item.name}
                                    </span>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm text-gray-500">
                                      {formatMMK(item.price)} × {item.quantity}
                                    </p>
                                    <p className="text-sm font-medium text-gray-900">
                                      {formatMMK(item.price * item.quantity)}
                                    </p>
                                  </div>
                                </li>
                              )}
                            </ul>
                          </div>

                          <div className="mt-4 flex justify-end">
                            <button
                              type="button"
                              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                              View Details
                            </button>
                            {order.status === "Delivered" &&
                              <button
                                type="button"
                                className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                              >
                                Reorder
                              </button>}
                          </div>
                        </div>
                      </li>
                    )}
                  </ul>
                </div>

                {/* Pagination */}
                <div className="mt-6 flex items-center justify-between">
                  <button className="flex items-center text-gray-600 hover:text-gray-900">
                    <ArrowLeftIcon className="h-4 w-4 mr-1" />
                    Previous
                  </button>
                  <div className="text-sm text-gray-700">
                    Showing <span className="font-medium">1</span> to{" "}
                    <span className="font-medium">3</span> of{" "}
                    <span className="font-medium">24</span> orders
                  </div>
                  <button className="flex items-center text-gray-600 hover:text-gray-900">
                    Next
                    <ArrowRightIcon className="h-4 w-4 ml-1" />
                  </button>
                </div>
              </div>}

            {/* Payments Tab */}
            {activeTab === "payments" &&
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Payment Methods
                </h2>

                <div className="space-y-4">
                  {paymentMethods.map(method =>
                    <div
                      key={method.id}
                      className="border border-gray-200 rounded-lg p-4 flex justify-between items-center"
                    >
                      <div className="flex items-center">
                        <CreditCardIcon className="h-8 w-8 text-gray-500 mr-4" />
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {method.type}
                          </h3>
                          <p className="text-sm text-gray-500">
                            •••• •••• •••• {method.last4}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        {method.isDefault &&
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Default
                          </span>}
                        {!method.isDefault &&
                          <button className="text-sm font-medium text-blue-600 hover:text-blue-900">
                            Set as Default
                          </button>}
                        <button className="text-sm font-medium text-red-600 hover:text-red-900">
                          Remove
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-8">
                  <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                    <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                    Add New Payment Method
                  </button>
                </div>

                <div className="mt-10">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Payment History
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">
                      No recent payments found.
                    </p>
                  </div>
                </div>
              </div>}

            {/* Account Tab */}
            {activeTab === "account" &&
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Account Settings
                </h2>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Personal Information
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label
                          htmlFor="name"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Full Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          id="name"
                          defaultValue="John Doe"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="email"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Email Address
                        </label>
                        <input
                          type="email"
                          name="email"
                          id="email"
                          defaultValue="john.doe@example.com"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="phone"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          id="phone"
                          defaultValue="+959123456789"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>
                    </div>

                    <div className="mt-6">
                      <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                        Update Profile
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Security
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label
                          htmlFor="password"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Change Password
                        </label>
                        <input
                          type="password"
                          name="password"
                          id="password"
                          placeholder="Enter new password"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="confirm-password"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Confirm Password
                        </label>
                        <input
                          type="password"
                          name="confirm-password"
                          id="confirm-password"
                          placeholder="Confirm new password"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>
                    </div>

                    <div className="mt-6">
                      <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                        Change Password
                      </button>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Two-Factor Authentication
                      </h3>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-500">
                          Add an extra layer of security to your account
                        </p>
                        <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50">
                          Enable
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>}

            {/* Support Tab */}
            {activeTab === "support" &&
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Help & Support
                </h2>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                  <div className="bg-gray-50 rounded-lg p-6 text-center">
                    <DocumentTextIcon className="h-12 w-12 mx-auto text-blue-600" />
                    <h3 className="mt-4 text-lg font-medium text-gray-900">
                      FAQs
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Find answers to common questions
                    </p>
                    <button className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-900">
                      Browse FAQs
                    </button>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6 text-center">
                    <ChatBubbleLeftRightIcon className="h-12 w-12 mx-auto text-blue-600" />
                    <h3 className="mt-4 text-lg font-medium text-gray-900">
                      Live Chat
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Chat with our support team in real-time
                    </p>
                    <button className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                      Start Chat
                    </button>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6 text-center">
                    <EnvelopeIcon className="h-12 w-12 mx-auto text-blue-600" />
                    <h3 className="mt-4 text-lg font-medium text-gray-900">
                      Email Us
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Send us an email and we'll respond ASAP
                    </p>
                    <button className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-900">
                      support@example.com
                    </button>
                  </div>
                </div>

                <div className="mt-10">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Submit a Support Ticket
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="subject"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Subject
                      </label>
                      <input
                        type="text"
                        name="subject"
                        id="subject"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="order"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Related Order (optional)
                      </label>
                      <select
                        id="order"
                        name="order"
                        className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      >
                        <option>Select an order</option>
                        {recentOrders.map(order =>
                          <option key={order.id}>
                            #{order.id}
                          </option>
                        )}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="message"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Message
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows={4}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                      Submit Ticket
                    </button>
                  </div>
                </div>
              </div>}
          </div>
        </div>
      </main>
    </div>
  );
};

// Additional icons needed
function ClockIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function PlusIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
      />
    </svg>
  );
}

function ChatBubbleLeftRightIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />
    </svg>
  );
}

function EnvelopeIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  );
}

export default BuyerDashboard;
