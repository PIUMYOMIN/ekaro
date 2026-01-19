import React from "react";
import { UserGroupIcon, CubeIcon, ShoppingBagIcon, CurrencyDollarIcon } from "@heroicons/react/24/outline";
import StatCard from "./StatCard";
const DashboardOverview = ({ data, loading, error }) => {
  if (loading)
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  if (error)
    return <div className="p-4 text-red-500">Error loading dashboard data</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={data?.user_count || 0}
          change={5}
          icon={UserGroupIcon}
          iconColor="text-green-600"
          bgColor="bg-green-100"
        />
        <StatCard
          title="Total Products"
          value={data?.product_count || 0}
          change={12}
          icon={CubeIcon}
          iconColor="text-blue-600"
          bgColor="bg-blue-100"
        />
        <StatCard
          title="Total Orders"
          value={data?.order_count || 0}
          change={8}
          icon={ShoppingBagIcon}
          iconColor="text-purple-600"
          bgColor="bg-purple-100"
        />
        <StatCard
          title="Total Revenue"
          value={
            data?.total_revenue?.toLocaleString("en-US", {
              style: "currency",
              currency: "USD",
              minimumFractionDigits: 0
            }) || "$0"
          }
          change={15}
          icon={CurrencyDollarIcon}
          iconColor="text-yellow-600"
          bgColor="bg-yellow-100"
        />
      </div>
    </div>
  );
};

export default DashboardOverview;