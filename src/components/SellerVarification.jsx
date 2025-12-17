// src/components/SellerVerificationStatus.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  CheckCircleIcon, 
  ClockIcon, 
  ExclamationCircleIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import api from '../utils/api';

const SellerVerificationStatus = () => {
  const { t } = useTranslation();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVerificationStatus();
  }, []);

  const fetchVerificationStatus = async () => {
    try {
      const response = await api.get('/seller/verification-status');
      setStatus(response.data.data);
    } catch (error) {
      console.error('Failed to fetch verification status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </div>
    );
  }

  if (!status) {
    return null;
  }

  const getStatusConfig = () => {
    switch (status.verification_status) {
      case 'verified':
        return {
          icon: ShieldCheckIcon,
          color: 'green',
          bgColor: 'bg-green-50',
          textColor: 'text-green-700',
          borderColor: 'border-green-200',
          title: 'Verified Seller',
          description: 'Your store has been verified and is now active.'
        };
      case 'pending':
        return {
          icon: ClockIcon,
          color: 'yellow',
          bgColor: 'bg-yellow-50',
          textColor: 'text-yellow-700',
          borderColor: 'border-yellow-200',
          title: 'Under Review',
          description: 'Your store is being reviewed. This usually takes 1-3 business days.'
        };
      case 'rejected':
        return {
          icon: XCircleIcon,
          color: 'red',
          bgColor: 'bg-red-50',
          textColor: 'text-red-700',
          borderColor: 'border-red-200',
          title: 'Verification Rejected',
          description: status.admin_notes || 'Please update your information and try again.'
        };
      default:
        return {
          icon: DocumentTextIcon,
          color: 'gray',
          bgColor: 'bg-gray-50',
          textColor: 'text-gray-700',
          borderColor: 'border-gray-200',
          title: 'Setup Required',
          description: 'Complete your seller profile to apply for verification.'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className={`rounded-lg ${config.bgColor} ${config.borderColor} border p-4`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <Icon className={`h-6 w-6 ${config.textColor}`} />
        </div>
        <div className="ml-3">
          <h3 className={`text-sm font-medium ${config.textColor}`}>
            {config.title}
          </h3>
          <div className={`mt-2 text-sm ${config.textColor}`}>
            <p>{config.description}</p>
          </div>
          
          {status.missing_fields && status.missing_fields.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-900">Required Information:</h4>
              <ul className="mt-2 text-sm text-gray-700 space-y-1">
                {status.missing_fields.map((field, index) => (
                  <li key={index} className="flex items-center">
                    <ExclamationCircleIcon className="h-4 w-4 text-red-500 mr-2" />
                    {field}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {status.verification_status === 'pending' && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center text-sm text-gray-500">
                <ClockIcon className="h-4 w-4 mr-2" />
                Submitted on {new Date(status.submitted_at).toLocaleDateString()}
              </div>
            </div>
          )}
          
          {status.verification_status === 'verified' && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center text-sm text-gray-500">
                <CheckCircleIcon className="h-4 w-4 mr-2" />
                Verified on {new Date(status.verified_at).toLocaleDateString()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerVerificationStatus;