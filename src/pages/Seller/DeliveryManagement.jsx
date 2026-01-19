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
  DocumentTextIcon,
  CurrencyDollarIcon,
  BuildingStorefrontIcon
} from "@heroicons/react/24/outline";
import api from "../../utils/api";

const DeliveryManagement = ({ refreshData }) => {
  const { t } = useTranslation();
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDeliveryMethodModal, setShowDeliveryMethodModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const response = await api.get("/deliveries");
      const deliveriesData = response.data.data.data || response.data.data || [];
      setDeliveries(deliveriesData);
    } catch (error) {
      console.error("Failed to fetch deliveries:", error);
      setDeliveries([]);
    } finally {
      setLoading(false);
    }
  };

  const calculatePlatformFee = (weight = 5, distance = 10) => {
    const baseFee = 5000;
    const weightFee = weight * 100;
    const distanceFee = distance * 200;
    return baseFee + weightFee + distanceFee;
  };

  const handleChooseDeliveryMethod = async (order, method) => {
    try {
      let platformFee = 0;
      if (method === 'platform') {
        platformFee = calculatePlatformFee();
      }

      const response = await api.post(`/orders/${order.id}/delivery-method`, {
        delivery_method: method,
        platform_delivery_fee: platformFee,
        pickup_address: "Supplier Warehouse, Yangon, Myanmar" // This should come from seller profile
      });

      if (response.data.success) {
        await fetchDeliveries();
        if (refreshData) refreshData();
        setShowDeliveryMethodModal(false);
        setSelectedOrder(null);
      }
    } catch (error) {
      console.error("Failed to set delivery method:", error);
      alert(error.response?.data?.message || "Failed to set delivery method");
    }
  };

  const updateDeliveryStatus = async (deliveryId, status, notes = "") => {
    try {
      const response = await api.post(`/deliveries/${deliveryId}/status`, {
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

  const uploadDeliveryProof = async (deliveryId, file, recipientName, recipientPhone) => {
    try {
      const formData = new FormData();
      formData.append('delivery_proof', file);
      formData.append('recipient_name', recipientName);
      formData.append('recipient_phone', recipientPhone);

      const response = await api.post(`/deliveries/${deliveryId}/proof`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        await fetchDeliveries();
        if (refreshData) refreshData();
      }
    } catch (error) {
      console.error("Failed to upload delivery proof:", error);
      alert(error.response?.data?.message || "Failed to upload proof");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'awaiting_pickup': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'picked_up': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'in_transit': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'out_for_delivery': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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
          Choose delivery methods and track your order deliveries
        </p>
      </div>

      {/* Delivery Method Selection Modal */}
      {showDeliveryMethodModal && selectedOrder && (
        <DeliveryMethodModal
          order={selectedOrder}
          onClose={() => {
            setShowDeliveryMethodModal(false);
            setSelectedOrder(null);
          }}
          onMethodSelect={handleChooseDeliveryMethod}
          calculatePlatformFee={calculatePlatformFee}
        />
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Customer
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
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {deliveries && deliveries.length > 0 ? (
                deliveries.map((delivery) => (
                  <tr key={delivery.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{delivery.order?.order_number || delivery.order_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {delivery.order?.shipping_address?.full_name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                      {delivery.delivery_method === 'platform' ? (
                        <span className="flex items-center">
                          <BuildingStorefrontIcon className="h-4 w-4 mr-1 text-blue-600" />
                          Platform Logistics
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <TruckIcon className="h-4 w-4 mr-1 text-gray-600" />
                          Self Delivery
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
                        <button
                          onClick={() => {
                            setSelectedOrder(delivery.order);
                            setShowDeliveryMethodModal(true);
                          }}
                          className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                        >
                          Choose Method
                        </button>
                      )}
                      
                      {delivery.status === 'awaiting_pickup' && delivery.delivery_method === 'supplier' && (
                        <button
                          onClick={() => updateDeliveryStatus(delivery.id, 'picked_up', 'Items picked up from warehouse')}
                          className="text-xs bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700"
                        >
                          Mark Picked Up
                        </button>
                      )}
                      
                      {delivery.status === 'picked_up' && delivery.delivery_method === 'supplier' && (
                        <button
                          onClick={() => updateDeliveryStatus(delivery.id, 'in_transit', 'On the way to customer')}
                          className="text-xs bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700"
                        >
                          In Transit
                        </button>
                      )}
                      
                      {delivery.status === 'in_transit' && delivery.delivery_method === 'supplier' && (
                        <button
                          onClick={() => updateDeliveryStatus(delivery.id, 'out_for_delivery', 'Out for delivery')}
                          className="text-xs bg-orange-600 text-white px-3 py-1 rounded hover:bg-orange-700"
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
          onProofUpload={uploadDeliveryProof}
        />
      )}
    </div>
  );
};

// Delivery Method Selection Modal
const DeliveryMethodModal = ({ order, onClose, onMethodSelect, calculatePlatformFee }) => {
  const [selectedMethod, setSelectedMethod] = useState('supplier');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">
                Choose Delivery Method
              </h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          <div className="bg-white px-6 py-4">
            <div className="space-y-4">
              {/* Self Delivery Option */}
              <div
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  selectedMethod === 'supplier'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedMethod('supplier')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <TruckIcon className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Self Delivery</h4>
                      <p className="text-sm text-gray-600">You arrange and manage delivery</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">Free</p>
                    <p className="text-xs text-gray-500">No platform fee</p>
                  </div>
                </div>
              </div>

              {/* Platform Logistics Option */}
              <div
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  selectedMethod === 'platform'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedMethod('platform')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <BuildingStorefrontIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Platform Logistics</h4>
                      <p className="text-sm text-gray-600">We handle delivery for you</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-600">{formatMMK(calculatePlatformFee())}</p>
                    <p className="text-xs text-gray-500">Platform service fee</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Benefits List */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h5 className="font-medium text-gray-900 mb-2">Benefits:</h5>
              <ul className="text-sm text-gray-600 space-y-1">
                {selectedMethod === 'supplier' ? (
                  <>
                    <li>• Full control over delivery process</li>
                    <li>• Direct communication with customer</li>
                    <li>• No additional platform fees</li>
                    <li>• Flexible delivery scheduling</li>
                  </>
                ) : (
                  <>
                    <li>• Professional logistics service</li>
                    <li>• Real-time tracking for customers</li>
                    <li>• Delivery confirmation system</li>
                    <li>• Platform manages customer communication</li>
                  </>
                )}
              </ul>
            </div>
          </div>

          <div className="bg-gray-50 px-6 py-3 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() => onMethodSelect(order, selectedMethod)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
            >
              Confirm Delivery Method
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Delivery Details Modal
const DeliveryDetailsModal = ({ delivery, isOpen, onClose, onStatusUpdate, onProofUpload }) => {
  const [showProofUpload, setShowProofUpload] = useState(false);
  const [proofFile, setProofFile] = useState(null);
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');

  if (!isOpen) return null;

  const formatMMK = (amount) => {
    return new Intl.NumberFormat("en-MM", {
      style: "currency",
      currency: "MMK",
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleProofUpload = () => {
    if (!proofFile || !recipientName || !recipientPhone) {
      alert('Please fill all fields and select a proof image');
      return;
    }
    onProofUpload(delivery.id, proofFile, recipientName, recipientPhone);
    setShowProofUpload(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">
                Delivery Details - Order #{delivery.order?.order_number}
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
                <h4 className="text-lg font-medium text-gray-900 mb-4">Address Information</h4>
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

            {/* Proof Upload Section */}
            {delivery.status === 'out_for_delivery' && delivery.delivery_method === 'supplier' && (
              <div className="mt-6">
                {!showProofUpload ? (
                  <button
                    onClick={() => setShowProofUpload(true)}
                    className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700"
                  >
                    Upload Delivery Proof
                  </button>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h5 className="font-medium text-yellow-800 mb-3">Upload Delivery Proof</h5>
                    <div className="space-y-3">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setProofFile(e.target.files[0])}
                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      <input
                        type="text"
                        placeholder="Recipient Name"
                        value={recipientName}
                        onChange={(e) => setRecipientName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <input
                        type="text"
                        placeholder="Recipient Phone"
                        value={recipientPhone}
                        onChange={(e) => setRecipientPhone(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={handleProofUpload}
                          className="flex-1 bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700"
                        >
                          Submit Proof
                        </button>
                        <button
                          onClick={() => setShowProofUpload(false)}
                          className="flex-1 bg-gray-500 text-white py-2 rounded-lg font-medium hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
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

// Utility function
function formatMMK(amount) {
  return new Intl.NumberFormat("en-MM", {
    style: "currency",
    currency: "MMK",
    minimumFractionDigits: 0
  }).format(amount);
}

export default DeliveryManagement;