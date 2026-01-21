import React, { useState, useEffect } from "react";
import {
  TruckIcon,
  UserIcon,
  CheckCircleIcon,
  ClockIcon,
  MapPinIcon,
  EyeIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  PhoneIcon,
  EnvelopeIcon,
  XCircleIcon 
} from "@heroicons/react/24/outline";
import api from "../../utils/api";

const PlatformLogistics = () => {
  const [platformDeliveries, setPlatformDeliveries] = useState([]);
  const [couriers, setCouriers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [assigningCourier, setAssigningCourier] = useState(null);

  useEffect(() => {
    fetchPlatformDeliveries();
    fetchCouriers();
  }, []);

  const fetchPlatformDeliveries = async () => {
    try {
      setLoading(true);
      const response = await api.get("/deliveries?delivery_method=platform");
      const deliveriesData = response.data.data.data || response.data.data || [];
      setPlatformDeliveries(deliveriesData);
    } catch (error) {
      console.error("Failed to fetch platform deliveries:", error);
      setPlatformDeliveries([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCouriers = async () => {
    try {
      const response = await api.get("/users?type=courier");
      setCouriers(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch couriers:", error);
      setCouriers([]);
    }
  };

  const handleAssignCourier = async (deliveryId, courierId) => {
    try {
      setAssigningCourier(deliveryId);
      const response = await api.post(`/deliveries/${deliveryId}/assign-courier`, {
        platform_courier_id: courierId,
        driver_name: couriers.find(c => c.id === courierId)?.name,
        driver_phone: couriers.find(c => c.id === courierId)?.phone,
        vehicle_type: "Motorcycle",
        vehicle_number: `VH-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
      });

      if (response.data.success) {
        await fetchPlatformDeliveries();
      }
    } catch (error) {
      console.error("Failed to assign courier:", error);
      alert(error.response?.data?.message || "Failed to assign courier");
    } finally {
      setAssigningCourier(null);
    }
  };

  const updateDeliveryStatus = async (deliveryId, status, notes = "") => {
    try {
      const response = await api.post(`/deliveries/${deliveryId}/status`, {
        status,
        notes,
        location: "Yangon, Myanmar" // This would come from GPS in real app
      });

      if (response.data.success) {
        await fetchPlatformDeliveries();
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
      default: return 'bg-gray-100 text-gray-800';
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
          Platform Logistics Management
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Manage platform delivery assignments and tracking
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Platform Deliveries</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{platformDeliveries.length}</p>
            </div>
            <div className="bg-blue-100 rounded-lg p-3">
              <TruckIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Assignment</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">
                {platformDeliveries.filter(d => !d.platform_courier_id).length}
              </p>
            </div>
            <div className="bg-yellow-100 rounded-lg p-3">
              <ClockIcon className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">
                {platformDeliveries.filter(d => ['picked_up', 'in_transit', 'out_for_delivery'].includes(d.status)).length}
              </p>
            </div>
            <div className="bg-purple-100 rounded-lg p-3">
              <TruckIcon className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {formatMMK(platformDeliveries.reduce((total, d) => total + (d.platform_delivery_fee || 0), 0))}
              </p>
            </div>
            <div className="bg-green-100 rounded-lg p-3">
              <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
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
                  Seller
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Assigned Courier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Delivery Fee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {platformDeliveries.map((delivery) => (
                <tr key={delivery.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{delivery.order?.order_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {delivery.supplier?.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(delivery.status)}`}>
                      {delivery.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {delivery.platform_courier ? (
                      <div className="flex items-center space-x-2">
                        <UserIcon className="h-4 w-4 text-gray-400" />
                        <span>{delivery.platform_courier.name}</span>
                      </div>
                    ) : (
                      <select
                        value=""
                        onChange={(e) => handleAssignCourier(delivery.id, parseInt(e.target.value))}
                        disabled={assigningCourier === delivery.id}
                        className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                      >
                        <option value="">Assign Courier</option>
                        {couriers.map((courier) => (
                          <option key={courier.id} value={courier.id}>
                            {courier.name} - {courier.phone}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatMMK(delivery.platform_delivery_fee || 0)}
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
                    
                    {/* Admin status update buttons */}
                    {delivery.status === 'awaiting_pickup' && (
                      <button
                        onClick={() => updateDeliveryStatus(delivery.id, 'picked_up', 'Package picked up by courier')}
                        className="text-xs bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700"
                      >
                        Mark Picked Up
                      </button>
                    )}
                    {delivery.status === 'picked_up' && (
                      <button
                        onClick={() => updateDeliveryStatus(delivery.id, 'in_transit', 'Package in transit to customer')}
                        className="text-xs bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700"
                      >
                        In Transit
                      </button>
                    )}
                    {delivery.status === 'in_transit' && (
                      <button
                        onClick={() => updateDeliveryStatus(delivery.id, 'out_for_delivery', 'Package out for delivery')}
                        className="text-xs bg-orange-600 text-white px-3 py-1 rounded hover:bg-orange-700"
                      >
                        Out for Delivery
                      </button>
                    )}
                    {delivery.status === 'out_for_delivery' && (
                      <button
                        onClick={() => updateDeliveryStatus(delivery.id, 'delivered', 'Package delivered successfully')}
                        className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                      >
                        Mark Delivered
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {platformDeliveries.length === 0 && (
          <div className="text-center py-12">
            <TruckIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Platform Deliveries
            </h3>
            <p className="text-gray-600">
              There are no platform logistics deliveries to manage.
            </p>
          </div>
        )}
      </div>

      {/* Delivery Details Modal */}
      {selectedDelivery && (
        <AdminDeliveryDetailsModal
          delivery={selectedDelivery}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onStatusUpdate={updateDeliveryStatus}
        />
      )}
    </div>
  );
};

// Admin Delivery Details Modal
const AdminDeliveryDetailsModal = ({ delivery, isOpen, onClose, onStatusUpdate }) => {
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
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">
                Platform Delivery Details - Order #{delivery.order?.order_number}
              </h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          <div className="bg-white px-6 py-4 max-h-96 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Delivery Information */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Delivery Information</h4>
                <div className="space-y-3">
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

                  {delivery.assigned_driver_name && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Assigned Driver:</label>
                      <p className="text-sm text-gray-900">{delivery.assigned_driver_name}</p>
                      <p className="text-xs text-gray-500">{delivery.assigned_driver_phone}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Information */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Order Information</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Seller:</label>
                    <p className="text-sm text-gray-900">{delivery.supplier?.name}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">Buyer:</label>
                    <p className="text-sm text-gray-900">
                      {delivery.order?.shipping_address?.full_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {delivery.order?.shipping_address?.phone}
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

            {/* Delivery Updates */}
            {delivery.delivery_updates && delivery.delivery_updates.length > 0 && (
              <div className="mt-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Delivery Updates</h4>
                <div className="space-y-3">
                  {delivery.delivery_updates.map((update, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <DocumentTextIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <span className="text-sm font-medium text-gray-900 capitalize">
                            {update.status.replace('_', ' ')}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(update.created_at).toLocaleString()}
                          </span>
                        </div>
                        {update.notes && (
                          <p className="text-sm text-gray-600 mt-1">{update.notes}</p>
                        )}
                        {update.location && (
                          <p className="text-xs text-gray-500 mt-1">
                            Location: {update.location}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
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

export default PlatformLogistics;