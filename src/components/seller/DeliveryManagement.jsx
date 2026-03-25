// src/components/seller/DeliveryManagement.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
  TruckIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  MapPinIcon,
  EyeIcon,
  DocumentTextIcon,
  BuildingStorefrontIcon,
} from "@heroicons/react/24/outline";
import api from "../../utils/api";

// FIX: single shared formatMMK — removed the duplicate defined later in the file
function formatMMK(amount) {
  return new Intl.NumberFormat("en-MM", {
    style: "currency",
    currency: "MMK",
    minimumFractionDigits: 0,
  }).format(amount ?? 0);
}

function getStatusColor(status) {
  switch (status) {
    case "pending":           return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "awaiting_pickup":   return "bg-blue-100 text-blue-800 border-blue-200";
    case "picked_up":         return "bg-indigo-100 text-indigo-800 border-indigo-200";
    case "in_transit":        return "bg-purple-100 text-purple-800 border-purple-200";
    case "out_for_delivery":  return "bg-orange-100 text-orange-800 border-orange-200";
    case "delivered":         return "bg-green-100 text-green-800 border-green-200";
    case "failed":            return "bg-red-100 text-red-800 border-red-200";
    case "cancelled":         return "bg-gray-100 text-gray-800 border-gray-200";
    default:                  return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

function getStatusIcon(status) {
  switch (status) {
    case "delivered": return <CheckCircleIcon className="h-4 w-4" />;
    case "failed":    return <XCircleIcon className="h-4 w-4" />;
    case "picked_up":
    case "in_transit":
    case "out_for_delivery": return <TruckIcon className="h-4 w-4" />;
    default:          return <ClockIcon className="h-4 w-4" />;
  }
}

// FIX: replaceAll so multi-underscore statuses like out_for_delivery render correctly
function humanStatus(status) {
  return (status ?? "").replaceAll("_", " ");
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────
const DeliveryManagement = ({ refreshData }) => {
  const [deliveries, setDeliveries]               = useState([]);
  const [loading, setLoading]                     = useState(true);
  const [error, setError]                         = useState(null);
  const [selectedDelivery, setSelectedDelivery]   = useState(null);
  const [isModalOpen, setIsModalOpen]             = useState(false);
  const [showDeliveryMethodModal, setShowDeliveryMethodModal] = useState(false);
  const [selectedOrder, setSelectedOrder]         = useState(null);
  // FIX: track which delivery is mid-request to disable its action button
  const [actionLoading, setActionLoading]         = useState(null);

  const fetchDeliveries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/deliveries");
      const data = response.data.data?.data ?? response.data.data ?? [];
      setDeliveries(data);
    } catch (err) {
      console.error("Failed to fetch deliveries:", err);
      setError("Failed to load deliveries. Please try again.");
      setDeliveries([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDeliveries();
  }, [fetchDeliveries]);

  // FIX: pass real package weight so fee isn't always the same fixed amount
  const calculatePlatformFee = (weight = 5, distance = 0) => {
    return 5000 + weight * 100 + distance * 200;
  };

  const handleChooseDeliveryMethod = async (order, method, pickupAddress) => {
    try {
      setActionLoading(order.id);
      const weight = order.delivery?.package_weight ?? 5;
      const platformFee = method === "platform" ? calculatePlatformFee(weight) : 0;

      const response = await api.post(`/seller/delivery/${order.id}/delivery-method`, {
        delivery_method:       method,
        platform_delivery_fee: platformFee,
        // FIX: pickup address comes from the form, not hard-coded
        pickup_address: pickupAddress,
      });

      if (response.data.success) {
        await fetchDeliveries();
        if (refreshData) refreshData();
        setShowDeliveryMethodModal(false);
        setSelectedOrder(null);
      }
    } catch (err) {
      console.error("Failed to set delivery method:", err);
      setError(err.response?.data?.message ?? "Failed to set delivery method");
    } finally {
      setActionLoading(null);
    }
  };

  const updateDeliveryStatus = async (deliveryId, status, notes = "") => {
    try {
      setActionLoading(deliveryId);
      const response = await api.post(`/deliveries/${deliveryId}/status`, { status, notes });
      if (response.data.success) {
        await fetchDeliveries();
        if (refreshData) refreshData();
      }
    } catch (err) {
      console.error("Failed to update delivery status:", err);
      setError(err.response?.data?.message ?? "Failed to update status");
    } finally {
      setActionLoading(null);
    }
  };

  const uploadDeliveryProof = async (deliveryId, file, recipientName, recipientPhone) => {
    try {
      setActionLoading(deliveryId);
      const formData = new FormData();
      formData.append("delivery_proof",  file);
      formData.append("recipient_name",  recipientName);
      formData.append("recipient_phone", recipientPhone);

      const response = await api.post(`/deliveries/${deliveryId}/proof`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        await fetchDeliveries();
        if (refreshData) refreshData();
        setIsModalOpen(false);
        setSelectedDelivery(null);
      }
    } catch (err) {
      console.error("Failed to upload delivery proof:", err);
      setError(err.response?.data?.message ?? "Failed to upload proof");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Delivery Management</h2>
        <p className="mt-1 text-sm text-gray-500">
          Choose delivery methods and track your order deliveries
        </p>
      </div>

      {/* FIX: inline error banner instead of alert() */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex justify-between items-center">
          <span className="text-sm">{error}</span>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
            <XCircleIcon className="h-5 w-5" />
          </button>
        </div>
      )}

      {showDeliveryMethodModal && selectedOrder && (
        <DeliveryMethodModal
          order={selectedOrder}
          loading={actionLoading === selectedOrder.id}
          onClose={() => { setShowDeliveryMethodModal(false); setSelectedOrder(null); }}
          onMethodSelect={handleChooseDeliveryMethod}
          calculatePlatformFee={calculatePlatformFee}
        />
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {["Order ID", "Customer", "Delivery Method", "Status", "Delivery Fee", "Actions"].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {deliveries.length > 0 ? (
                deliveries.map((delivery) => (
                  <tr key={delivery.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{delivery.order?.order_number ?? delivery.order_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {delivery.order?.shipping_address?.full_name ?? "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {delivery.delivery_method === "platform" ? (
                        <span className="flex items-center gap-1">
                          <BuildingStorefrontIcon className="h-4 w-4 text-blue-600" />
                          Platform Logistics
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <TruckIcon className="h-4 w-4 text-gray-600" />
                          Self Delivery
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(delivery.status)}`}>
                        {getStatusIcon(delivery.status)}
                        <span className="capitalize">{humanStatus(delivery.status)}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatMMK(delivery.platform_delivery_fee)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <button
                        onClick={() => { setSelectedDelivery(delivery); setIsModalOpen(true); }}
                        className="text-green-600 hover:text-green-900"
                        title="View details"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>

                      {delivery.status === "pending" && (
                        <button
                          disabled={actionLoading === delivery.id}
                          onClick={() => { setSelectedOrder(delivery.order); setShowDeliveryMethodModal(true); }}
                          className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                          Choose Method
                        </button>
                      )}

                      {delivery.status === "awaiting_pickup" && delivery.delivery_method === "supplier" && (
                        <button
                          disabled={actionLoading === delivery.id}
                          onClick={() => updateDeliveryStatus(delivery.id, "picked_up", "Items picked up from warehouse")}
                          className="text-xs bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700 disabled:opacity-50"
                        >
                          {actionLoading === delivery.id ? "..." : "Mark Picked Up"}
                        </button>
                      )}

                      {delivery.status === "picked_up" && delivery.delivery_method === "supplier" && (
                        <button
                          disabled={actionLoading === delivery.id}
                          onClick={() => updateDeliveryStatus(delivery.id, "in_transit", "On the way to customer")}
                          className="text-xs bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 disabled:opacity-50"
                        >
                          {actionLoading === delivery.id ? "..." : "In Transit"}
                        </button>
                      )}

                      {delivery.status === "in_transit" && delivery.delivery_method === "supplier" && (
                        <button
                          disabled={actionLoading === delivery.id}
                          onClick={() => updateDeliveryStatus(delivery.id, "out_for_delivery", "Out for delivery")}
                          className="text-xs bg-orange-600 text-white px-3 py-1 rounded hover:bg-orange-700 disabled:opacity-50"
                        >
                          {actionLoading === delivery.id ? "..." : "Out for Delivery"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <TruckIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Deliveries Found</h3>
                    <p className="text-gray-600">You don't have any deliveries to manage yet.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedDelivery && (
        <DeliveryDetailsModal
          delivery={selectedDelivery}
          isOpen={isModalOpen}
          actionLoading={actionLoading}
          onClose={() => { setIsModalOpen(false); setSelectedDelivery(null); }}
          onStatusUpdate={updateDeliveryStatus}
          onProofUpload={uploadDeliveryProof}
        />
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Delivery Method Selection Modal
// FIX: added pickupAddress input so it's no longer hard-coded
// ─────────────────────────────────────────────────────────────────────────────
const DeliveryMethodModal = ({ order, loading, onClose, onMethodSelect, calculatePlatformFee }) => {
  const [selectedMethod, setSelectedMethod] = useState("supplier");
  const [pickupAddress, setPickupAddress]   = useState("");
  const [addressError, setAddressError]     = useState("");

  const weight = order?.delivery?.package_weight ?? order?.package_weight ?? 5;

  const handleConfirm = () => {
    if (!pickupAddress.trim()) {
      setAddressError("Pickup address is required");
      return;
    }
    onMethodSelect(order, selectedMethod, pickupAddress.trim());
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={onClose} />

        <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg z-10">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">Choose Delivery Method</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <XCircleIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="px-6 py-4 space-y-4">
            {/* Self Delivery */}
            <div
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                selectedMethod === "supplier" ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => setSelectedMethod("supplier")}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
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

            {/* Platform Logistics */}
            <div
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                selectedMethod === "platform" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => setSelectedMethod("platform")}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <BuildingStorefrontIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Platform Logistics</h4>
                    <p className="text-sm text-gray-600">We handle delivery for you</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-blue-600">{formatMMK(calculatePlatformFee(weight))}</p>
                  <p className="text-xs text-gray-500">Platform service fee</p>
                </div>
              </div>
            </div>

            {/* Benefits */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h5 className="font-medium text-gray-900 mb-2">Benefits:</h5>
              <ul className="text-sm text-gray-600 space-y-1">
                {selectedMethod === "supplier" ? (
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

            {/* FIX: pickup address input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pickup Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={pickupAddress}
                onChange={(e) => { setPickupAddress(e.target.value); setAddressError(""); }}
                placeholder="e.g. No. 12, Merchant St, Yangon"
                className={`w-full px-3 py-2 border rounded-lg text-sm ${
                  addressError ? "border-red-400" : "border-gray-300"
                } focus:outline-none focus:ring-2 focus:ring-green-500`}
              />
              {addressError && <p className="text-xs text-red-500 mt-1">{addressError}</p>}
            </div>
          </div>

          <div className="bg-gray-50 px-6 py-3 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Confirm Delivery Method"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Delivery Details Modal
// FIX: reset proof form state after successful upload; use deliveryUpdates (camelCase)
// ─────────────────────────────────────────────────────────────────────────────
const DeliveryDetailsModal = ({ delivery, isOpen, actionLoading, onClose, onStatusUpdate, onProofUpload }) => {
  const [showProofUpload, setShowProofUpload] = useState(false);
  const [proofFile, setProofFile]             = useState(null);
  const [recipientName, setRecipientName]     = useState("");
  const [recipientPhone, setRecipientPhone]   = useState("");
  const [proofError, setProofError]           = useState("");

  if (!isOpen) return null;

  const resetProofForm = () => {
    setShowProofUpload(false);
    setProofFile(null);
    setRecipientName("");
    setRecipientPhone("");
    setProofError("");
  };

  const handleProofUpload = async () => {
    if (!proofFile || !recipientName.trim() || !recipientPhone.trim()) {
      setProofError("Please fill all fields and select a proof image");
      return;
    }
    setProofError("");
    await onProofUpload(delivery.id, proofFile, recipientName, recipientPhone);
    resetProofForm();
  };

  // FIX: use deliveryUpdates (camelCase) — the key Laravel Eloquent serialises to
  const updates = delivery.deliveryUpdates ?? [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={onClose} />

        <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-4xl z-10">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">
              Delivery Details — Order #{delivery.order?.order_number}
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <XCircleIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Delivery info */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Delivery Information</h4>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Method: </span>
                    <span className="capitalize">{delivery.delivery_method}</span>
                    {delivery.delivery_method === "platform" && (
                      <span className="ml-2 text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                        Platform Logistics
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Status: </span>
                    <span className="capitalize">{humanStatus(delivery.status)}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Delivery Fee: </span>
                    {formatMMK(delivery.platform_delivery_fee)}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Tracking Number: </span>
                    <span className="font-mono">{delivery.tracking_number ?? "Not assigned"}</span>
                  </div>
                </div>
              </div>

              {/* Address info */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Address Information</h4>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-medium text-gray-700 flex items-center gap-1">
                      <MapPinIcon className="h-4 w-4" /> Pickup Address
                    </p>
                    <p className="text-gray-900 mt-1">{delivery.pickup_address ?? "Not specified"}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700 flex items-center gap-1">
                      <MapPinIcon className="h-4 w-4" /> Delivery Address
                    </p>
                    <p className="text-gray-900 mt-1">{delivery.delivery_address}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tracking timeline */}
            {updates.length > 0 && (
              <div className="mt-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Delivery Updates</h4>
                <div className="space-y-3">
                  {updates.map((update, index) => (
                    <div key={update.id ?? index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <DocumentTextIcon className="h-5 w-5 text-gray-400 mt-0.5 shrink-0" />
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <span className="text-sm font-medium text-gray-900 capitalize">
                            {humanStatus(update.status)}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(update.created_at).toLocaleString()}
                          </span>
                        </div>
                        {update.notes && (
                          <p className="text-sm text-gray-600 mt-1">{update.notes}</p>
                        )}
                        {update.location && (
                          <p className="text-xs text-gray-500 mt-1">Location: {update.location}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Proof upload */}
            {delivery.status === "out_for_delivery" && delivery.delivery_method === "supplier" && (
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
                      {proofError && (
                        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
                          {proofError}
                        </p>
                      )}
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
                      <div className="flex gap-2">
                        <button
                          onClick={handleProofUpload}
                          disabled={actionLoading === delivery.id}
                          className="flex-1 bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
                        >
                          {actionLoading === delivery.id ? "Uploading..." : "Submit Proof"}
                        </button>
                        <button
                          onClick={resetProofForm}
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

          <div className="bg-gray-50 px-6 py-3 flex justify-end">
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