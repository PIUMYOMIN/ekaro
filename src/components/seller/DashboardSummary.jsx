import React, { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  ShoppingBagIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  StarIcon,
  TruckIcon,
} from "@heroicons/react/24/solid";
import { Bar, Doughnut } from "react-chartjs-2";
import api from "../../utils/api";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const DashboardSummary = ({ storeData, stats, refreshData, onSetupClick }) => {
  const { t } = useTranslation();
  const [dashboardData, setDashboardData] = useState({
    orders: { total: 0, byStatus: {}, recent: [] },
    sales: { totalRevenue: 0, monthlyTrend: [], averageOrderValue: 0 },
    products: { total: 0, active: 0, lowStock: 0 },
    customers: { total: 0, repeatCustomers: 0 },
    deliveries: { total: 0, byStatus: {} }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const initialFetchDone = useRef(false);

  // Setup Checklist Component (unchanged)
  const SetupChecklist = ({ storeData, onSetupClick }) => {
    const checklistItems = [
      {
        id: 1,
        label: "Store Profile Complete",
        completed: storeData?.store_name && storeData?.contact_email && storeData?.contact_phone,
        action: "Complete profile",
        step: "my-store"
      },
      {
        id: 2,
        label: "Store Logo Uploaded",
        completed: !!storeData?.store_logo,
        action: "Upload logo",
        step: "my-store"
      },
      {
        id: 3,
        label: "Business Details",
        completed: storeData?.business_registration_number || storeData?.business_type === "individual",
        action: "Add details",
        step: "my-store"
      },
      {
        id: 4,
        label: "Payment Method Set",
        completed: !!storeData?.account_number,
        action: "Set up payment",
        step: "my-store"
      },
      {
        id: 5,
        label: "Shipping Configured",
        completed: storeData?.shipping_enabled || false,
        action: "Configure shipping",
        step: "shipping"
      }
    ];

    const completedCount = checklistItems.filter(item => item.completed).length;
    const totalCount = checklistItems.length;
    const progress = (completedCount / totalCount) * 100;

    if (completedCount === totalCount) return null;

    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200 mb-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-blue-900">Store Setup Checklist</h3>
          <span className="text-sm text-blue-700">
            {completedCount}/{totalCount} completed
          </span>
        </div>

        <div className="space-y-3">
          {checklistItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between">
              <div className="flex items-center">
                {item.completed ? (
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-blue-300 mr-2"></div>
                )}
                <span className={`text-sm ${item.completed ? 'text-gray-600' : 'text-gray-900'}`}>
                  {item.label}
                </span>
              </div>
              {!item.completed && (
                item.id === 5 ? (
                  <span className="text-xs text-gray-500 italic">Turn on Shipping in the Shipping tab</span>
                ) : (
                  <button
                    onClick={() => onSetupClick && onSetupClick(item.step)}
                    className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1 rounded-lg transition-colors"
                  >
                    {item.action}
                  </button>
                )
              )}
            </div>
          ))}
        </div>

        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Setup Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>
    );
  };

  // Fetch dashboard data – only once on mount and when refreshData is called
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [salesSummaryResponse, recentOrdersResponse, deliveriesResponse] = await Promise.all([
        api.get("/seller/sales-summary").catch(err => ({ data: { success: false, data: {} } })),
        api.get("/seller/recent-orders?limit=8").catch(err => ({ data: { success: false, data: [] } })),
        api.get("/deliveries?stats=true").catch(err => ({ data: { success: false, data: {} } }))
      ]);

      // Process sales summary
      if (salesSummaryResponse.data?.success) {
        const salesData = salesSummaryResponse.data.data || {};
        setDashboardData(prev => ({
          ...prev,
          orders: {
            total: salesData.sales?.total_orders || 0,
            byStatus: salesData.orders_by_status || {},
            recent: recentOrdersResponse.data?.data || []
          },
          sales: {
            totalRevenue: salesData.sales?.total_revenue || 0,
            monthlyTrend: salesData.recent_trend || [],
            averageOrderValue: salesData.sales?.average_order_value || 0
          },
          products: {
            total: salesData.products?.total || 0,
            active: salesData.products?.active || 0,
            lowStock: salesData.products?.low_stock || 0
          }
        }));
      }

      // Process delivery stats
      if (deliveriesResponse.data?.success) {
        const deliveryStats = deliveriesResponse.data.data?.delivery_stats || {};
        setDashboardData(prev => ({
          ...prev,
          deliveries: {
            total: deliveryStats.total || 0,
            byStatus: deliveryStats.by_status || {}
          }
        }));
      }

    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch (with Strict Mode guard)
  useEffect(() => {
    if (!initialFetchDone.current) {
      initialFetchDone.current = true;
      fetchDashboardData();
    }
  }, [fetchDashboardData]);

  // Allow parent to refresh data (e.g., after an update)
  useEffect(() => {
    if (refreshData) {
      fetchDashboardData();
    }
  }, [refreshData, fetchDashboardData]);

  // Calculate metrics (with fallbacks)
  const calculateMetrics = () => {
    const orders = dashboardData.orders.byStatus || {};
    const deliveries = dashboardData.deliveries.byStatus || {};

    return {
      successOrders: orders.delivered || 0,
      pendingOrders: orders.pending || 0,
      processingOrders: (orders.confirmed || 0) + (orders.processing || 0),
      cancelledOrders: orders.cancelled || 0,
      deliveredOrders: deliveries.delivered || 0,
      inTransitOrders: (deliveries.in_transit || 0) + (deliveries.out_for_delivery || 0),
      pendingDelivery: deliveries.pending || deliveries.awaiting_pickup || 0,
      totalRevenue: dashboardData.sales.totalRevenue,
      averageOrderValue: dashboardData.sales.averageOrderValue,
      conversionRate: dashboardData.orders.total > 0
        ? ((orders.delivered || 0) / dashboardData.orders.total * 100).toFixed(1)
        : 0,
      totalProducts: dashboardData.products.total,
      activeProducts: dashboardData.products.active,
      lowStockProducts: dashboardData.products.lowStock || 0
    };
  };

  const metrics = calculateMetrics();

  // Stats cards (use actual metrics)
  const statsCards = [
    {
      id: 1,
      name: "Total Revenue",
      value: `${metrics.totalRevenue?.toLocaleString() || 0} MMK`,
      icon: CurrencyDollarIcon,
      change: "+12.5%", // This could be dynamic later
      changeType: "positive",
      description: "Total sales revenue"
    },
    {
      id: 2,
      name: "Success Orders",
      value: metrics.successOrders.toString(),
      icon: CheckCircleIcon,
      change: "+8.2%",
      changeType: "positive",
      description: "Completed orders"
    },
    {
      id: 3,
      name: "Pending Orders",
      value: metrics.pendingOrders.toString(),
      icon: ClockIcon,
      change: "-3.1%",
      changeType: "negative",
      description: "Orders awaiting confirmation"
    },
    {
      id: 4,
      name: "Processing Orders",
      value: metrics.processingOrders.toString(),
      icon: ShoppingBagIcon,
      change: "+5.7%",
      changeType: "positive",
      description: "Orders in progress"
    },
    {
      id: 5,
      name: "Active Products",
      value: metrics.activeProducts.toString(),
      icon: StarIcon,
      change: "+2.3%",
      changeType: "positive",
      description: "Listed products"
    },
    {
      id: 6,
      name: "Total Customers",
      value: dashboardData.customers.total.toString(),
      icon: UserGroupIcon,
      change: "+15.4%",
      changeType: "positive",
      description: "Unique buyers"
    }
  ];

  // Chart data
  const orderStatusData = {
    labels: ['Delivered', 'Pending', 'Processing', 'Cancelled'],
    datasets: [
      {
        data: [
          metrics.successOrders,
          metrics.pendingOrders,
          metrics.processingOrders,
          metrics.cancelledOrders
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(251, 191, 36)',
          'rgb(59, 130, 246)',
          'rgb(239, 68, 68)'
        ],
        borderWidth: 2
      }
    ]
  };

  const salesTrendData = {
    labels: dashboardData.sales.monthlyTrend.map(item => {
      if (!item?.date) return '';
      const date = new Date(item.date);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: 'Daily Revenue (MMK)',
        data: dashboardData.sales.monthlyTrend.map(item => item?.revenue || 0),
        backgroundColor: 'rgba(5, 150, 105, 0.8)',
        borderColor: 'rgb(5, 150, 105)',
        borderWidth: 2,
        borderRadius: 4
      },
      {
        label: 'Orders Count',
        data: dashboardData.sales.monthlyTrend.map(item => item?.orders_count || 0),
        backgroundColor: 'rgba(16, 185, 129, 0.6)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 2,
        borderRadius: 4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Sales Performance' }
    },
    scales: { y: { beginAtZero: true } }
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' },
      title: { display: true, text: 'Order Status Distribution' }
    }
  };

  if (loading && !dashboardData.orders.total) {
    return (
      <div className="space-y-6">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-700 mb-4">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {t("seller.overview")}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {t("seller.dashboard_summary")}
          </p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
        >
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Setup Checklist */}
      <SetupChecklist storeData={storeData} onSetupClick={onSetupClick} />

      {/* Store Status Banner */}
      {storeData && (
        <div className={`p-4 rounded-lg ${storeData.status === "approved"
            ? "bg-green-50 border border-green-200"
            : storeData.status === "pending"
              ? "bg-yellow-50 border border-yellow-200"
              : "bg-blue-50 border border-blue-200"
          }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-3 ${storeData.status === "approved"
                  ? "bg-green-500"
                  : storeData.status === "pending"
                    ? "bg-yellow-500 animate-pulse"
                    : "bg-blue-500"
                }`}></div>
              <div>
                <h3 className="font-semibold">
                  {storeData.status === "approved"
                    ? "Store Active"
                    : storeData.status === "pending"
                      ? "Pending Approval"
                      : "Setup Required"}
                </h3>
                <p className="text-sm opacity-75">
                  {storeData.status === "approved"
                    ? "Your store is live and accepting orders"
                    : storeData.status === "pending"
                      ? "Your store is under review by our team"
                      : "Please complete your store setup"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {statsCards.map((stat) => {
          const IconComponent = stat.icon;
          return (
            <div
              key={stat.id}
              className="bg-white overflow-hidden shadow rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`p-3 rounded-lg ${stat.changeType === "positive"
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                      }`}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-gray-500">
                      {stat.name}
                    </p>
                    <div className="flex items-baseline">
                      <p className="text-2xl font-semibold text-gray-900">
                        {stat.value}
                      </p>
                      <div
                        className={`ml-2 flex items-baseline text-sm font-semibold ${stat.changeType === "positive"
                            ? "text-green-600"
                            : "text-red-600"
                          }`}
                      >
                        {stat.changeType === "positive" ? (
                          <ArrowUpIcon className="h-4 w-4 text-green-500" />
                        ) : (
                          <ArrowDownIcon className="h-4 w-4 text-red-500" />
                        )}
                        <span className="sr-only">
                          {stat.changeType === "positive" ? "Increased" : "Decreased"} by
                        </span>
                        {stat.change}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {stat.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend Chart */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Sales Trend (Last 7 Days)
          </h3>
          {dashboardData.sales.monthlyTrend.length > 0 ? (
            <Bar data={salesTrendData} options={chartOptions} height={300} />
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">
              No sales data available
            </div>
          )}
        </div>

        {/* Order Distribution Chart */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Order Status Distribution
          </h3>
          <div className="h-64 flex items-center justify-center">
            {dashboardData.orders.total > 0 ? (
              <Doughnut data={orderStatusData} options={doughnutOptions} />
            ) : (
              <p className="text-gray-400">No orders yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="bg-white shadow rounded-lg p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Orders
          </h3>
          <div className="space-y-4">
            {dashboardData.orders.recent.length > 0 ? (
              dashboardData.orders.recent.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${order.status === 'delivered' ? 'bg-green-500' :
                        order.status === 'pending' ? 'bg-yellow-500' :
                          order.status === 'cancelled' ? 'bg-red-500' : 'bg-blue-500'
                      }`}></div>
                    <div>
                      <p className="font-medium text-gray-900">
                        #{order.order_number}
                      </p>
                      <p className="text-sm text-gray-500">
                        {order.buyer?.name || 'Customer'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {order.total_amount_formatted || `${order.total_amount?.toLocaleString()} MMK`}
                    </p>
                    <p className="text-sm text-gray-500 capitalize">
                      {order.status}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <ShoppingBagIcon className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p>No recent orders</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Stats
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Order Completion Rate</span>
              <span className="font-semibold text-green-600">
                {metrics.conversionRate}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Avg. Order Value</span>
              <span className="font-semibold text-gray-900">
                {metrics.averageOrderValue?.toLocaleString()} MMK
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Low Stock Products</span>
              <span className="font-semibold text-red-600">
                {metrics.lowStockProducts}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Delivery Success Rate</span>
              <span className="font-semibold text-green-600">
                {metrics.deliveredOrders > 0 ?
                  Math.round((metrics.deliveredOrders / dashboardData.deliveries.total) * 100) : 0
                }%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSummary;