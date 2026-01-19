import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  ChartBarIcon,
  ShoppingBagIcon,
  UserGroupIcon,
  CurrencyDollarIcon
} from "@heroicons/react/24/outline";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import api from "../../utils/api";

const SalesReports = ({ refreshData }) => {
  const { t } = useTranslation();
  const [timeRange, setTimeRange] = useState("month");
  const [salesData, setSalesData] = useState({
    monthlyData: [],
    weeklyData: [],
    topProducts: [],
    summary: {
      totalSales: 0,
      totalOrders: 0,
      newCustomers: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [summaryResponse, topProductsResponse] = await Promise.all([
          api.get("/seller/sales-summary"),
          api.get("/seller/top-products")
        ]);

        if (summaryResponse.data.success) {
          const data = summaryResponse.data.data;
          
          // Process sales trend data
          const trendData = data.recent_trend || [];
          const monthlyData = trendData.map(item => ({
            month: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            sales: parseFloat(item.revenue) || 0,
            orders: parseInt(item.orders_count) || 0
          }));

          // Create weekly data (last 7 days from trend)
          const weeklyData = trendData.slice(-7).map(item => ({
            day: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }),
            sales: parseFloat(item.revenue) || 0,
            orders: parseInt(item.orders_count) || 0
          }));

          // Calculate summary from sales data
          setSalesData({
            monthlyData,
            weeklyData,
            topProducts: salesData.topProducts, // Keep existing top products
            summary: {
              totalSales: parseFloat(data.sales?.total_revenue) || 0,
              totalOrders: parseInt(data.sales?.total_orders) || 0,
              newCustomers: parseInt(data.customers?.total) || 0
            }
          });
        } else {
          throw new Error(summaryResponse.data.message || "Failed to fetch sales summary");
        }

        if (topProductsResponse.data.success) {
          const topProducts = topProductsResponse.data.data.map(product => ({
            id: product.id,
            name: product.name || "Unnamed Product",
            sales: product.total_sold || 0,
            revenue: parseFloat(product.total_revenue) || 0
          }));
          
          setSalesData(prev => ({
            ...prev,
            topProducts
          }));
        } else {
          throw new Error(topProductsResponse.data.message || "Failed to fetch top products");
        }

      } catch (error) {
        console.error("Failed to fetch sales data:", error);
        setError(error.message || "Failed to load sales data");
        setSalesData({
          monthlyData: [],
          weeklyData: [],
          topProducts: [],
          summary: {
            totalSales: 0,
            totalOrders: 0,
            newCustomers: 0
          }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSalesData();
  }, [timeRange, refreshData]);

  const data = timeRange === "month" ? salesData.monthlyData : salesData.weeklyData;

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Data</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {t("seller.sales_reports")}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {t("seller.sales_analytics_and_insights")}
          </p>
        </div>
        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          <div className="relative">
            <select
              value={timeRange}
              onChange={e => setTimeRange(e.target.value)}
              className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="week">{t("seller.this_week")}</option>
              <option value="month">{t("seller.this_month")}</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="fill-current h-4 w-4" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
          <button className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg flex items-center transition-colors">
            <LocalDownloadIcon className="h-5 w-5 mr-1" />
            {t("seller.export_report")}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center">
            <div className="bg-blue-500 p-3 rounded-xl">
              <CurrencyDollarIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-blue-700">
                {t("seller.total_sales")}
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {salesData.summary.totalSales.toLocaleString()} MMK
              </p>
            </div>
          </div>
          <p className="mt-3 text-sm text-green-600 flex items-center">
            <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            {salesData.summary.totalSales > 0 ? "+0%" : "0%"} {t("seller.increase")}
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
          <div className="flex items-center">
            <div className="bg-purple-500 p-3 rounded-xl">
              <ShoppingBagIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-purple-700">
                {t("seller.total_orders")}
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {salesData.summary.totalOrders}
              </p>
            </div>
          </div>
          <p className="mt-3 text-sm text-green-600 flex items-center">
            <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            {salesData.summary.totalOrders > 0 ? "+0%" : "0%"} {t("seller.increase")}
          </p>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 border border-yellow-200">
          <div className="flex items-center">
            <div className="bg-yellow-500 p-3 rounded-xl">
              <UserGroupIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-yellow-700">
                {t("seller.new_customers")}
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {salesData.summary.newCustomers}
              </p>
            </div>
          </div>
          <p className="mt-3 text-sm text-green-600 flex items-center">
            <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            {salesData.summary.newCustomers > 0 ? "+0%" : "0%"} {t("seller.increase")}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Overview Chart */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t("seller.sales_overview")}
          </h3>
          <div className="h-72">
            {data.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey={timeRange === "month" ? "month" : "day"}
                    tick={{ fill: '#666' }}
                  />
                  <YAxis tick={{ fill: '#666' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.5rem'
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke="#10B981"
                    strokeWidth={2}
                    activeDot={{ r: 6 }}
                    name={t("seller.sales_amount")}
                  />
                  <Line
                    type="monotone"
                    dataKey="orders"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    name={t("seller.order_count")}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-500">
                <ChartBarIcon className="h-12 w-12 mb-3" />
                <p>No sales data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Revenue by Product Chart */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t("seller.revenue_by_product")}
          </h3>
          <div className="h-72">
            {salesData.topProducts.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData.topProducts.slice(0, 5)} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#666' }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis tick={{ fill: '#666' }} />
                  <Tooltip
                    formatter={(value) => [`${value.toLocaleString()} MMK`, t("seller.revenue")]}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.5rem'
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="revenue"
                    fill="#8B5CF6"
                    name={t("seller.revenue")}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-500">
                <ChartBarIcon className="h-12 w-12 mb-3" />
                <p>No product data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Selling Products Table */}
      <div className="bg-white rounded-xl shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {t("seller.top_selling_products")}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {t("seller.best_performing_products")}
          </p>
        </div>

        <div className="overflow-x-auto">
          {salesData.topProducts.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("seller.product")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("seller.sold")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("seller.revenue")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("seller.performance")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("seller.actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {salesData.topProducts.slice(0, 5).map(product => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-gray-300 to-gray-400 rounded-lg flex items-center justify-center">
                          <ChartBarIcon className="h-5 w-5 text-white" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {product.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {product.sales}
                      </div>
                      <div className="text-sm text-gray-500">
                        units
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {product.revenue.toLocaleString()} MMK
                      </div>
                      <div className="text-sm text-gray-500">
                        revenue
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.sales > 80
                          ? 'bg-green-100 text-green-800'
                          : product.sales > 50
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                        {product.sales > 80 ? 'High' : product.sales > 50 ? 'Medium' : 'Low'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-green-600 hover:text-green-900 mr-4">
                        {t("seller.view")}
                      </button>
                      <button className="text-blue-600 hover:text-blue-900">
                        {t("seller.edit")}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12">
              <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">{t("seller.no_products_found")}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper icons
function LocalDownloadIcon(props) {
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
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
      />
    </svg>
  );
}

export default SalesReports;