// src/components/seller/DeliveryManagement.jsx
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  TruckIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  MapPinIcon,
  EyeIcon,
  DocumentTextIcon
} from "@heroicons/react/24/outline";
import api from "../../utils/api";

const DeliveryManagement = ({ refreshData }) => {
  const { t } = useTranslation();
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const response = await api.get("/dashboard/deliveries");
      
      // Handle the paginated response structure
      if (response.data.success) {
        // The deliveries array is in response.data.data.data for paginated responses
        const deliveriesData = response.data.data.data || response.data.data || [];
        setDeliveries(deliveriesData);
      } else {
        setDeliveries([]);
      }
    } catch (error) {
      console.error("Failed to fetch deliveries:", error);
      setDeliveries([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChooseDeliveryMethod = async (orderId, method, fee = 0) => {
    try {
      const response = await api.post(`/dashboard/orders/${orderId}/delivery-method`, {
        delivery_method: method,
        platform_delivery_fee: fee,
        pickup_address: "Supplier Warehouse Address" // This should come from seller profile
      });

      if (response.data.success) {
        await fetchDeliveries();
        if (refreshData) refreshData();
      }
    } catch (error) {
      console.error("Failed to set delivery method:", error);
      alert(error.response?.data?.message || "Failed to set delivery method");
    }
  };

  const updateDeliveryStatus = async (deliveryId, status, notes = "") => {
    try {
      const response = await api.post(`/dashboard/deliveries/${deliveryId}/status`, {
        status,
        notes
      });

      if (response.data.success) {
        await fetchDeliveries();
        if (refreshData) refreshData();
      }
    } catch (error) {
      console.error("Failed to update delivery status:", error);
      alert(error.response?.data?.message || "Failed to update status");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'awaiting_pickup': return 'bg-blue-100 text-blue-800';
      case 'picked_up': return 'bg-indigo-100 text-indigo-800';
      case 'in_transit': return 'bg-purple-100 text-purple-800';
      case 'out_for_delivery': return 'bg-orange-100 text-orange-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <ClockIcon className="h-4 w-4" />;
      case 'awaiting_pickup': return <ClockIcon className="h-4 w-4" />;
      case 'picked_up': return <TruckIcon className="h-4 w-4" />;
      case 'in_transit': return <TruckIcon className="h-4 w-4" />;
      case 'out_for_delivery': return <TruckIcon className="h-4 w-4" />;
      case 'delivered': return <CheckCircleIcon className="h-4 w-4" />;
      case 'failed': return <XCircleIcon className="h-4 w-4" />;
      default: return <ClockIcon className="h-4 w-4" />;
    }
  };

  const formatMMK = (amount) => {
    return new Intl.NumberFormat("en-MM", {
      style: "currency",
      currency: "MMK",
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          Delivery Management
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Manage your order deliveries and choose delivery methods
        </p>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Delivery Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Delivery Fee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Estimated Delivery
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {deliveries && deliveries.length > 0 ? (
                deliveries.map((delivery) => (
                  <tr key={delivery.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{delivery.order?.order_number || `ORD-${delivery.order_id}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                      {delivery.delivery_method}
                      {delivery.delivery_method === 'platform' && (
                        <span className="ml-2 text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                          Platform Logistics
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(delivery.status)}`}>
                        {getStatusIcon(delivery.status)}
                        <span className="ml-1 capitalize">
                          {delivery.status.replace('_', ' ')}
                        </span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatMMK(delivery.platform_delivery_fee || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {delivery.estimated_delivery_date ? 
                        new Date(delivery.estimated_delivery_date).toLocaleDateString() : 
                        'Not set'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <button
                        onClick={() => {
                          setSelectedDelivery(delivery);
                          setIsModalOpen(true);
                        }}
                        className="text-green-600 hover:text-green-900"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      
                      {/* Action buttons based on status */}
                      {delivery.status === 'pending' && (
                        <div className="flex space-x-2 mt-1">
                          <button
                            onClick={() => handleChooseDeliveryMethod(delivery.order_id, 'supplier')}
                            className="text-xs bg-gray-600 text-white px-2 py-1 rounded hover:bg-gray-700"
                          >
                            Self Delivery
                          </button>
                          <button
                            onClick={() => handleChooseDeliveryMethod(delivery.order_id, 'platform', 5000)}
                            className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                          >
                            Use Platform
                          </button>
                        </div>
                      )}
                      
                      {delivery.status === 'awaiting_pickup' && delivery.delivery_method === 'supplier' && (
                        <button
                          onClick={() => updateDeliveryStatus(delivery.id, 'picked_up', 'Items picked up from warehouse')}
                          className="text-xs bg-indigo-600 text-white px-2 py-1 rounded hover:bg-indigo-700"
                        >
                          Mark Picked Up
                        </button>
                      )}
                      
                      {delivery.status === 'picked_up' && delivery.delivery_method === 'supplier' && (
                        <button
                          onClick={() => updateDeliveryStatus(delivery.id, 'in_transit', 'On the way to customer')}
                          className="text-xs bg-purple-600 text-white px-2 py-1 rounded hover:bg-purple-700"
                        >
                          In Transit
                        </button>
                      )}
                      
                      {delivery.status === 'in_transit' && delivery.delivery_method === 'supplier' && (
                        <button
                          onClick={() => updateDeliveryStatus(delivery.id, 'out_for_delivery', 'Out for delivery')}
                          className="text-xs bg-orange-600 text-white px-2 py-1 rounded hover:bg-orange-700"
                        >
                          Out for Delivery
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <TruckIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No Deliveries Found
                    </h3>
                    <p className="text-gray-600">
                      You don't have any deliveries to manage yet.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delivery Details Modal */}
      {selectedDelivery && (
        <DeliveryDetailsModal
          delivery={selectedDelivery}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onStatusUpdate={updateDeliveryStatus}
        />
      )}
    </div>
  );
};

// Delivery Details Modal Component
const DeliveryDetailsModal = ({ delivery, isOpen, onClose, onStatusUpdate }) => {
  if (!isOpen) return null;

  const formatMMK = (amount) => {
    return new Intl.NumberFormat("en-MM", {
      style: "currency",
      currency: "MMK",
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">
                Delivery Details - Order #{delivery.order?.order_number || `ORD-${delivery.order_id}`}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          <div className="bg-white px-6 py-4 max-h-96 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Delivery Information */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">
                  Delivery Information
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Method:</label>
                    <p className="text-sm text-gray-900 capitalize">
                      {delivery.delivery_method}
                      {delivery.delivery_method === 'platform' && (
                        <span className="ml-2 text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                          Platform Logistics
                        </span>
                      )}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">Status:</label>
                    <p className="text-sm text-gray-900 capitalize">
                      {delivery.status.replace('_', ' ')}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">Delivery Fee:</label>
                    <p className="text-sm text-gray-900">
                      {formatMMK(delivery.platform_delivery_fee || 0)}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">Tracking Number:</label>
                    <p className="text-sm text-gray-900 font-mono">
                      {delivery.tracking_number || 'Not assigned'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">
                  Address Information
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      <MapPinIcon className="h-4 w-4 mr-1" />
                      Pickup Address:
                    </label>
                    <p className="text-sm text-gray-900 mt-1">
                      {delivery.pickup_address || 'Not specified'}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      <MapPinIcon className="h-4 w-4 mr-1" />
                      Delivery Address:
                    </label>
                    <p className="text-sm text-gray-900 mt-1">
                      {delivery.delivery_address}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Information */}
            {delivery.order && (
              <div className="mt-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">
                  Order Information
                </h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <label className="font-medium text-gray-700">Order Total:</label>
                      <p className="text-gray-900">{formatMMK(delivery.order.total_amount)}</p>
                    </div>
                    <div>
                      <label className="font-medium text-gray-700">Order Status:</label>
                      <p className="text-gray-900 capitalize">{delivery.order.status}</p>
                    </div>
                    <div>
                      <label className="font-medium text-gray-700">Payment Status:</label>
                      <p className="text-gray-900 capitalize">{delivery.order.payment_status}</p>
                    </div>
                    <div>
                      <label className="font-medium text-gray-700">Order Date:</label>
                      <p className="text-gray-900">
                        {new Date(delivery.order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-gray-50 px-6 py-3 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryManagement;