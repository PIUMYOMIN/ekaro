import React from "react";
import {
  UserGroupIcon, CubeIcon, ShoppingBagIcon, CurrencyDollarIcon,
  UsersIcon, CheckCircleIcon,
} from "@heroicons/react/24/outline";
import StatCard from "./StatCard";

const formatMMK = (n) =>
  new Intl.NumberFormat("my-MM", { style: "currency", currency: "MMK", minimumFractionDigits: 0 }).format(n || 0);

const DashboardOverview = ({ data, loading, error }) => {
  if (loading)
    return (
      <div className="flex justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500" />
      </div>
    );

  if (error)
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
        {error?.message || "Error loading dashboard data. Please refresh."}
      </div>
    );

  if (!data)
    return (
      <div className="p-6 text-gray-400 text-sm text-center">No data available.</div>
    );

  return (
    <div className="space-y-6">
      {/* Stat cards — use /admin/stats field names */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={data.total_users ?? data.user_count ?? 0}
          subtitle={`${data.active_users ?? 0} active`}
          icon={UserGroupIcon}
          iconColor="text-green-600"
          bgColor="bg-green-50"
        />
        <StatCard
          title="Total Products"
          value={data.total_products ?? data.product_count ?? 0}
          subtitle={`${data.active_products ?? 0} active`}
          icon={CubeIcon}
          iconColor="text-blue-600"
          bgColor="bg-blue-50"
        />
        <StatCard
          title="Total Orders"
          value={data.total_orders ?? data.order_count ?? 0}
          subtitle={`${data.pending_orders ?? 0} pending`}
          icon={ShoppingBagIcon}
          iconColor="text-purple-600"
          bgColor="bg-purple-50"
        />
        <StatCard
          title="Total Revenue"
          value={formatMMK(data.total_revenue ?? 0)}
          subtitle={`${formatMMK(data.pending_commissions ?? 0)} commission pending`}
          icon={CurrencyDollarIcon}
          iconColor="text-amber-600"
          bgColor="bg-amber-50"
          isString
        />
      </div>
    </div>
  );
};

export default DashboardOverview;