// src/components/VerificationStatusBadge.jsx
import React from 'react';
import {
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  StarIcon,
  TrophyIcon,
  RocketIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

const VerificationStatusBadge = ({ status, badge, size = 'md' }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'verified':
        return {
          icon: CheckCircleIcon,
          color: 'green',
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          label: 'Verified'
        };
      case 'pending':
        return {
          icon: ClockIcon,
          color: 'yellow',
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-800',
          label: 'Pending Verification'
        };
      case 'rejected':
        return {
          icon: XCircleIcon,
          color: 'red',
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          label: 'Rejected'
        };
      default:
        return {
          icon: ShieldCheckIcon,
          color: 'gray',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          label: 'Not Verified'
        };
    }
  };

  const getBadgeConfig = (badgeType) => {
    switch (badgeType) {
      case 'premium':
        return {
          icon: StarIcon,
          color: 'gold',
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-800',
          label: 'Premium Seller'
        };
      case 'top_rated':
        return {
          icon: TrophyIcon,
          color: 'blue',
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-800',
          label: 'Top Rated'
        };
      case 'fast_shipper':
        return {
          icon: RocketIcon,
          color: 'purple',
          bgColor: 'bg-purple-100',
          textColor: 'text-purple-800',
          label: 'Fast Shipper'
        };
      case 'verified':
        return {
          icon: CheckCircleIcon,
          color: 'green',
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          label: 'Verified'
        };
      default:
        return null;
    }
  };

  const statusConfig = getStatusConfig();
  const badgeConfig = badge ? getBadgeConfig(badge) : null;
  const StatusIcon = statusConfig.icon;
  const BadgeIcon = badgeConfig?.icon;

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  return (
    <div className="flex items-center space-x-2">
      {/* Status Badge */}
      <div className={`inline-flex items-center ${sizeClasses[size]} rounded-full ${statusConfig.bgColor} ${statusConfig.textColor} font-medium`}>
        <StatusIcon className={`h-4 w-4 mr-1 text-${statusConfig.color}-500`} />
        <span>{statusConfig.label}</span>
      </div>

      {/* Additional Badge (if any) */}
      {badgeConfig && (
        <div className={`inline-flex items-center ${sizeClasses[size]} rounded-full ${badgeConfig.bgColor} ${badgeConfig.textColor} font-medium`}>
          <BadgeIcon className={`h-4 w-4 mr-1 text-${badgeConfig.color}-500`} />
          <span>{badgeConfig.label}</span>
        </div>
      )}
    </div>
  );
};

export default VerificationStatusBadge;