// src/components/buyer/OrderTracking.jsx
import React, { useState, useEffect } from "react";
import {
  TruckIcon,
  CheckCircleIcon,
  ClockIcon,
  MapPinIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline";
import api from "../utils/api";

const OrderTracking = ({ order }) => {
  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trackingUpdates, setTrackingUpdates] = useState([]);

  useEffect(() => {
    if (order) {
      fetchDeliveryInfo();
    }
  }, [order]);

  const fetchDeliveryInfo = async () => {
    try {
      setLoading(true);
      // Fetch delivery information for this order
      const response = await api.get(`/dashboard/deliveries?order_id=${order.id}`);
      const deliveries = response.data.data.data || response.data.data || [];
      
      if (deliveries.length > 0) {
        const orderDelivery = deliveries.find(d => d.order_id === order.id) || deliveries[0];
        setDelivery(orderDelivery);
        
        // Fetch tracking updates if available
        if (orderDelivery.id) {
          const trackingResponse = await api.get(`/dashboard/deliveries/${orderDelivery.id}/tracking`);
          setTrackingUpdates(trackingResponse.data.data.updates || []);
        }
      }
    } catch (error) {
      console.error("Failed to fetch delivery info:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDeliveryStatusConfig = (status) => {
    const configs = {
      pending: {
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: ClockIcon,
        label: "Waiting for Seller",
        description: "Seller is preparing your order"
      },
      awaiting_pickup: {
        color: "bg-blue-100 text-blue-800 border-blue-200",
        icon: ClockIcon,
        label: "Awaiting Pickup",
        description: "Waiting for pickup from warehouse"
      },
      picked_up: {
        color: "bg-indigo-100 text-indigo-800 border-indigo-200",
        icon: TruckIcon,
        label: "Picked Up",
        description: "Package has been picked up"
      },
      in_transit: {
        color: "bg-purple-100 text-purple-800 border-purple-200",
        icon: TruckIcon,
        label: "In Transit",
        description: "Package is on the way"
      },
      out_for_delivery: {
        color: "bg-orange-100 text-orange-800 border-orange-200",
        icon: TruckIcon,
        label: "Out for Delivery",
        description: "Package is out for delivery today"
      },
      delivered: {
        color: "bg-green-100 text-green-800 border-green-200",
        icon: CheckCircleIcon,
        label: "Delivered",
        description: "Package has been delivered"
      },
      failed: {
        color: "bg-red-100 text-red-800 border-red-200",
        icon: ExclamationTriangleIcon,
        label: "Delivery Failed",
        description: "Delivery attempt failed"
      },
      cancelled: {
        color: "bg-gray-100 text-gray-800 border-gray-200",
        icon: ExclamationTriangleIcon,
        label: "Cancelled",
        description: "Delivery was cancelled"
      }
    };

    return configs[status] || configs.pending;
  };

  const getDeliveryProgressSteps = (status) => {
    const steps = [
      { 
        key: 'pending', 
        label: 'Order Confirmed', 
        completed: true,
        description: 'Your order has been confirmed'
      },
      { 
        key: 'awaiting_pickup', 
        label: 'Awaiting Pickup', 
        completed: ['awaiting_pickup', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered'].includes(status),
        description: 'Waiting for package pickup'
      },
      { 
        key: 'picked_up', 
        label: 'Picked Up', 
        completed: ['picked_up', 'in_transit', 'out_for_delivery', 'delivered'].includes(status),
        description: 'Package picked up from seller'
      },
      { 
        key: 'in_transit', 
        label: 'In Transit', 
        completed: ['in_transit', 'out_for_delivery', 'delivered'].includes(status),
        description: 'Package is on the way'
      },
      { 
        key: 'out_for_delivery', 
        label: 'Out for Delivery', 
        completed: ['out_for_delivery', 'delivered'].includes(status),
        description: 'Package is out for delivery'
      },
      { 
        key: 'delivered', 
        label: 'Delivered', 
        completed: status === 'delivered',
        description: 'Package delivered successfully'
      }
    ];
    return steps;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!delivery) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <ClockIcon className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-yellow-800 mb-2">
          Tracking Information Pending
        </h3>
        <p className="text-yellow-700">
          The seller is preparing your order. Tracking information will be available soon.
        </p>
      </div>
    );
  }

  const statusConfig = getDeliveryStatusConfig(delivery.status);
  const StatusIcon = statusConfig.icon;
  const progressSteps = getDeliveryProgressSteps(delivery.status);

  return (
    <div className="space-y-6">
      {/* Current Status Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-full ${statusConfig.color.replace('bg-', 'bg-').replace('text-', 'text-').split(' ')[0]}`}>
              <StatusIcon className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {statusConfig.label}
              </h3>
              <p className="text-gray-600">{statusConfig.description}</p>
            </div>
          </div>
          {delivery.tracking_number && (
            <div className="text-right">
              <p className="text-sm text-gray-600">Tracking Number</p>
              <p className="font-mono font-semibold text-gray-900">
                {delivery.tracking_number}
              </p>
            </div>
          )}
        </div>

        {/* Estimated Delivery */}
        {delivery.estimated_delivery_date && (
          <div className="bg-gray-50 rounded-lg p-4 mt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ClockIcon className="h-5 w-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">
                  Estimated Delivery
                </span>
              </div>
              <span className="text-sm text-gray-900 font-medium">
                {formatDate(delivery.estimated_delivery_date)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Progress Steps */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-6">
          Delivery Progress
        </h4>
        <div className="space-y-4">
          {progressSteps.map((step, index) => (
            <div key={step.key} className="flex items-start space-x-4">
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                step.completed 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-200 text-gray-500'
              }`}>
                {step.completed ? (
                  <CheckCircleIcon className="h-5 w-5" />
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${
                  step.completed ? 'text-green-700' : 'text-gray-500'
                }`}>
                  {step.label}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {step.description}
                </p>
                {step.completed && trackingUpdates.find(u => u.status === step.key) && (
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDate(trackingUpdates.find(u => u.status === step.key).created_at)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tracking Updates */}
      {trackingUpdates.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-6">
            Tracking History
          </h4>
          <div className="space-y-4">
            {trackingUpdates.map((update, index) => (
              <div key={update.id} className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <DocumentTextIcon className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 capitalize">
                      {update.status.replace('_', ' ')}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDate(update.created_at)}
                    </p>
                  </div>
                  {update.notes && (
                    <p className="text-sm text-gray-600 mt-1">{update.notes}</p>
                  )}
                  {update.location && (
                    <div className="flex items-center mt-1 text-xs text-gray-500">
                      <MapPinIcon className="h-3 w-3 mr-1" />
                      {update.location}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delivery Information */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          Delivery Information
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-2">Delivery Method</h5>
            <p className="text-sm text-gray-900 capitalize">
              {delivery.delivery_method === 'platform' ? 'Platform Logistics' : 'Seller Delivery'}
            </p>
          </div>
          
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-2">Carrier</h5>
            <p className="text-sm text-gray-900">
              {delivery.carrier_name || (delivery.delivery_method === 'platform' ? 'Platform Logistics' : 'Seller')}
            </p>
          </div>

          <div className="md:col-span-2">
            <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <MapPinIcon className="h-4 w-4 mr-1" />
              Delivery Address
            </h5>
            <p className="text-sm text-gray-900 whitespace-pre-line">
              {delivery.delivery_address}
            </p>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-blue-900 mb-4">
          Need Help?
        </h4>
        <div className="space-y-2 text-sm text-blue-800">
          <p>If you have any questions about your delivery, please contact:</p>
          <div className="mt-3 space-y-1">
            <p><strong>Seller:</strong> {order.seller?.name || 'Store'}</p>
            {delivery.assigned_driver_phone && (
              <p><strong>Delivery Driver:</strong> {delivery.assigned_driver_phone}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;