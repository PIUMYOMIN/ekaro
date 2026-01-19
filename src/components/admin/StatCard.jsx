import React from "react";
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from "@heroicons/react/24/outline";
const StatCard = ({ title, value, change, icon: Icon, iconColor, bgColor }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <div className="flex items-center">
        <div className={`p-3 ${bgColor} rounded-lg`}>
          <Icon className={`h-8 w-8 ${iconColor}`} />
        </div>
        <div className="ml-4">
          <p className="text-gray-500">{title}</p>
          <h3 className="text-2xl font-bold">{value}</h3>
        </div>
      </div>
      <div className="mt-4 flex items-center text-sm">
        {change > 0 ? (
          <span className="text-green-600 flex items-center">
            <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />+{change}%
          </span>
        ) : (
          <span className="text-red-600 flex items-center">
            <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
            {change}%
          </span>
        )}
        <span className="ml-2 text-gray-500">from last month</span>
      </div>
    </div>
  );
};

export default StatCard;