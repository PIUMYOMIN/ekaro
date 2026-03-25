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
  XCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import api from "../../utils/api";

const PlatformLogistics = () => {
  const [platformDeliveries, setPlatformDeliveries] = useState([]);
  const [couriers, setCouriers]                     = useState([]);
  const [loading, setLoading]                       = useState(true);
  const [error, setError]                           = useState(null);
  const [selectedDelivery, setSelectedDelivery]     = useState(null);
  const [isModalOpen, setIsModalOpen]               = useState(false);
  const [assigningCourier, setAssigningCourier]     = useState(null);
  const [actionError, setActionError]               = useState(null);

  useEffect(() => {
    fetchPlatformDeliveries();
    fetchCouriers();
  }, []);

  const fetchPlatformDeliveries = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/deliveries?delivery_method=platform");
      const data = response.data.data?.data || response.data.data || [];
      setPlatformDeliveries(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch platform deliveries:", err);
      setError("Failed to load deliveries. Please try again.");
      setPlatformDeliveries([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCouriers = async () => {
    try {
      // FIX: users don't have type=courier (migration only has buyer/seller/admin).
      // Fetch users with the 'courier' Spatie role instead, which is the correct
      // way couriers are identified in this codebase.
      const response = await api.get("/users?role=courier");
      setCouriers(response.data.data || []);
    } catch (err) {
      console.error("Failed to fetch couriers:", err);
      setCouriers([]);
    }
  };

  const handleAssignCourier = async (deliveryId, courierId) => {
    if (!courierId) return;
    const courier = couriers.find((c) => c.id === courierId);
    if (!courier) return;

    try {
      setAssigningCourier(deliveryId);
      setActionError(null);
      const response = await api.post(`/deliveries/${deliveryId}/assign-courier`, {
        platform_courier_id: courierId,
        driver_name:         courier.name,
        driver_phone:        courier.phone,
        vehicle_type:        "Motorcycle",
        // FIX: was generating a random vehicle number — removed. Vehicle info
        // should come from a courier profile, not randomly generated.
      });

      if (response.data.success) {
        await fetchPlatformDeliveries();
      }
    } catch (err) {
      console.error("Failed to assign courier:", err);
      setActionError(err.response?.data?.message || "Failed to assign courier");
    } finally {
      setAssigningCourier(null);
    }
  };

  const updateDeliveryStatus = async (deliveryId, status, notes = "") => {
    try {
      setActionError(null);
      const response = await api.post(`/deliveries/${deliveryId}/status`, {
        status,
        notes,
        location: "Yangon, Myanmar",
      });

      if (response.data.success) {
        await fetchPlatformDeliveries();
      }
    } catch (err) {
      console.error("Failed to update delivery status:", err);
      setActionError(err.response?.data?.message || "Failed to update status");
    }
  };

  const getStatusColor = (status) => {
    const map = {
      pending:          "bg-yellow-100 text-yellow-800",
      awaiting_pickup:  "bg-blue-100 text-blue-800",
      picked_up:        "bg-indigo-100 text-indigo-800",
      in_transit:       "bg-purple-100 text-purple-800",
      out_for_delivery: "bg-orange-100 text-orange-800",
      delivered:        "bg-green-100 text-green-800",
      failed:           "bg-red-100 text-red-800",
      cancelled:        "bg-gray-100 text-gray-800",
    };
    return map[status] ?? "bg-gray-100 text-gray-800";
  };

  // FIX: replaceAll so "out_for_delivery" → "out for delivery" (not "out for_delivery")
  const formatStatus = (status) => (status ?? "").replaceAll("_", " ");

  const formatMMK = (amount) =>
    new Intl.NumberFormat("en-MM", {
      style: "currency",
      currency: "MMK",
      minimumFractionDigits: 0,
    }).format(amount ?? 0);

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
        <h2 className="text-xl font-semibold text-gray-900">Platform Logistics Management</h2>
        <p className="mt-1 text-sm text-gray-500">Manage platform delivery assignments and tracking</p>
      </div>

      {/* Error banners */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <ExclamationCircleIcon className="h-5 w-5 flex-shrink-0" />
          {error}
          <button onClick={fetchPlatformDeliveries} className="ml-auto underline hover:no-underline">Retry</button>
        </div>
      )}
      {actionError && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <ExclamationCircleIcon className="h-5 w-5 flex-shrink-0" />
          {actionError}
          <button onClick={() => setActionError(null)} className="ml-auto"><XCircleIcon className="h-4 w-4" /></button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Deliveries</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{platformDeliveries.length}</p>
            </div>
            <div className="bg-blue-100 rounded-lg p-3"><TruckIcon className="h-6 w-6 text-blue-600" /></div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Assignment</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">
                {platformDeliveries.filter((d) => !d.platform_courier_id).length}
              </p>
            </div>
            <div className="bg-yellow-100 rounded-lg p-3"><ClockIcon className="h-6 w-6 text-yellow-600" /></div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">
                {platformDeliveries.filter((d) =>
                  ["picked_up", "in_transit", "out_for_delivery"].includes(d.status)
                ).length}
              </p>
            </div>
            <div className="bg-purple-100 rounded-lg p-3"><TruckIcon className="h-6 w-6 text-purple-600" /></div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {formatMMK(platformDeliveries.reduce((t, d) => t + (d.platform_delivery_fee || 0), 0))}
              </p>
            </div>
            <div className="bg-green-100 rounded-lg p-3"><CurrencyDollarIcon className="h-6 w-6 text-green-600" /></div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {["Order ID", "Seller", "Status", "Assigned Courier", "Delivery Fee", "Actions"].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {platformDeliveries.map((delivery) => (
                <tr key={delivery.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{delivery.order?.order_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {/* FIX: delivery.supplier (from supplier() relation) is the seller */}
                    {delivery.supplier?.name ?? "—"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(delivery.status)}`}>
                      {/* FIX: replaceAll so all underscores are replaced */}
                      {formatStatus(delivery.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {/* FIX: Laravel's load('platformCourier') returns camelCase key in JSON */}
                    {delivery.platformCourier ? (
                      <div className="flex items-center space-x-2">
                        <UserIcon className="h-4 w-4 text-gray-400" />
                        <span>{delivery.platformCourier.name}</span>
                      </div>
                    ) : (
                      <select
                        defaultValue=""
                        onChange={(e) => handleAssignCourier(delivery.id, parseInt(e.target.value))}
                        disabled={assigningCourier === delivery.id}
                        className="border border-gray-300 rounded-md px-2 py-1 text-sm disabled:opacity-50"
                      >
                        <option value="" disabled>
                          {couriers.length === 0 ? "No couriers available" : "Assign courier…"}
                        </option>
                        {couriers.map((courier) => (
                          <option key={courier.id} value={courier.id}>
                            {courier.name} — {courier.phone}
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
                      onClick={() => { setSelectedDelivery(delivery); setIsModalOpen(true); }}
                      className="text-green-600 hover:text-green-900"
                      title="View details"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>

                    {delivery.status === "awaiting_pickup" && (
                      <button
                        onClick={() => updateDeliveryStatus(delivery.id, "picked_up", "Package picked up by courier")}
                        className="text-xs bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700"
                      >
                        Mark Picked Up
                      </button>
                    )}
                    {delivery.status === "picked_up" && (
                      <button
                        onClick={() => updateDeliveryStatus(delivery.id, "in_transit", "Package in transit")}
                        className="text-xs bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700"
                      >
                        In Transit
                      </button>
                    )}
                    {delivery.status === "in_transit" && (
                      <button
                        onClick={() => updateDeliveryStatus(delivery.id, "out_for_delivery", "Out for delivery")}
                        className="text-xs bg-orange-600 text-white px-3 py-1 rounded hover:bg-orange-700"
                      >
                        Out for Delivery
                      </button>
                    )}
                    {delivery.status === "out_for_delivery" && (
                      <button
                        onClick={() => updateDeliveryStatus(delivery.id, "delivered", "Delivered successfully")}
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

        {platformDeliveries.length === 0 && !error && (
          <div className="text-center py-12">
            <TruckIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Platform Deliveries</h3>
            <p className="text-gray-600">There are no platform logistics deliveries to manage.</p>
          </div>
        )}
      </div>

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

// ── Admin Delivery Details Modal ──────────────────────────────────────────────
const AdminDeliveryDetailsModal = ({ delivery, isOpen, onClose, onStatusUpdate }) => {
  if (!isOpen) return null;

  const formatMMK = (amount) =>
    new Intl.NumberFormat("en-MM", { style: "currency", currency: "MMK", minimumFractionDigits: 0 }).format(amount ?? 0);

  // FIX: replaceAll so all underscores are replaced
  const formatStatus = (s) => (s ?? "").replaceAll("_", " ");

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={onClose} />
        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">
                Delivery Details — Order #{delivery.order?.order_number}
              </h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          <div className="bg-white px-6 py-4 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Delivery Information</h4>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-medium text-gray-700">Status</p>
                    <p className="text-gray-900 capitalize">{formatStatus(delivery.status)}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Delivery Fee</p>
                    <p className="text-gray-900">{formatMMK(delivery.platform_delivery_fee || 0)}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Tracking Number</p>
                    <p className="text-gray-900 font-mono">{delivery.tracking_number || "Not assigned"}</p>
                  </div>
                  {delivery.assigned_driver_name && (
                    <div>
                      <p className="font-medium text-gray-700">Assigned Driver</p>
                      <p className="text-gray-900">{delivery.assigned_driver_name}</p>
                      <p className="text-gray-500 text-xs">{delivery.assigned_driver_phone}</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Order Information</h4>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-medium text-gray-700">Seller</p>
                    <p className="text-gray-900">{delivery.supplier?.name ?? "—"}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Buyer</p>
                    <p className="text-gray-900">{delivery.order?.shipping_address?.full_name}</p>
                    <p className="text-gray-500 text-xs">{delivery.order?.shipping_address?.phone}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700 flex items-center gap-1">
                      <MapPinIcon className="h-4 w-4" /> Delivery Address
                    </p>
                    <p className="text-gray-900 mt-0.5">{delivery.delivery_address}</p>
                  </div>
                </div>
              </div>
            </div>

            {delivery.deliveryUpdates && delivery.deliveryUpdates.length > 0 && (
              <div className="mt-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Delivery Updates</h4>
                <div className="space-y-3">
                  {delivery.deliveryUpdates.map((update, i) => (
                    <div key={i} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <DocumentTextIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <span className="text-sm font-medium text-gray-900 capitalize">
                            {formatStatus(update.status)}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(update.created_at).toLocaleString()}
                          </span>
                        </div>
                        {update.notes && <p className="text-sm text-gray-600 mt-1">{update.notes}</p>}
                        {update.location && <p className="text-xs text-gray-500 mt-1">Location: {update.location}</p>}
                      </div>
                    </div>
                  ))}
                </div>
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

export default PlatformLogistics;