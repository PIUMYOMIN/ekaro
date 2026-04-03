import React, { useState, useEffect, useCallback } from "react";
import {
  TruckIcon, UserIcon, CheckCircleIcon, ClockIcon, MapPinIcon,
  EyeIcon, DocumentTextIcon, CurrencyDollarIcon, XCircleIcon,
  ExclamationCircleIcon, ArrowPathIcon, UserGroupIcon,
} from "@heroicons/react/24/outline";
import api from "../../utils/api";

// ── Helpers ───────────────────────────────────────────────────────────────────
const STATUS_COLORS = {
  pending:          "bg-yellow-100 text-yellow-800",
  awaiting_pickup:  "bg-blue-100 text-blue-800",
  picked_up:        "bg-indigo-100 text-indigo-800",
  in_transit:       "bg-purple-100 text-purple-800",
  out_for_delivery: "bg-orange-100 text-orange-800",
  delivered:        "bg-green-100 text-green-800",
  failed:           "bg-red-100 text-red-800",
  cancelled:        "bg-gray-100 text-gray-800",
};

const fmt = (s) => (s ?? "").replace(/_/g, " ");
const fmtMMK = (n) =>
  new Intl.NumberFormat("my-MM", { style: "currency", currency: "MMK", minimumFractionDigits: 0 })
    .format(n ?? 0);

const StatusBadge = ({ status }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                    ${STATUS_COLORS[status] ?? "bg-gray-100 text-gray-800"}`}>
    {fmt(status)}
  </span>
);

// ── Detail modal ──────────────────────────────────────────────────────────────
const DeliveryModal = ({ delivery, onClose, onStatusUpdate }) => {
  if (!delivery) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
          <h3 className="text-lg font-bold text-gray-900">
            Delivery — Order #{delivery.order?.order_number ?? delivery.order_id}
          </h3>
          <button onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
            <XCircleIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
            {/* Delivery info */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-700 text-xs uppercase tracking-wide">Delivery Info</h4>
              <dl className="space-y-2">
                <div><dt className="text-gray-400 text-xs">Status</dt>
                  <dd><StatusBadge status={delivery.status} /></dd></div>
                <div><dt className="text-gray-400 text-xs">Tracking #</dt>
                  <dd className="font-mono text-gray-900">{delivery.tracking_number || "Not assigned"}</dd></div>
                <div><dt className="text-gray-400 text-xs">Delivery Fee</dt>
                  <dd className="font-semibold text-gray-900">{fmtMMK(delivery.platform_delivery_fee)}</dd></div>
                {(delivery.assigned_driver_name || delivery.platform_courier?.name) && (
                  <div><dt className="text-gray-400 text-xs">Driver</dt>
                    <dd className="text-gray-900">
                      {delivery.assigned_driver_name || delivery.platform_courier?.name}
                      {delivery.assigned_driver_phone && (
                        <span className="text-gray-400 text-xs ml-1">· {delivery.assigned_driver_phone}</span>
                      )}
                    </dd></div>
                )}
              </dl>
            </div>

            {/* Order info */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-700 text-xs uppercase tracking-wide">Order Info</h4>
              <dl className="space-y-2">
                <div><dt className="text-gray-400 text-xs">Seller</dt>
                  <dd className="text-gray-900">{delivery.supplier?.name ?? "—"}</dd></div>
                <div><dt className="text-gray-400 text-xs">Buyer</dt>
                  <dd className="text-gray-900">
                    {delivery.order?.shipping_address?.name ?? delivery.order?.shipping_address?.full_name ?? "—"}
                    {delivery.order?.shipping_address?.phone && (
                      <span className="text-gray-400 text-xs ml-1">· {delivery.order.shipping_address.phone}</span>
                    )}
                  </dd></div>
                <div><dt className="text-gray-400 text-xs flex items-center gap-1">
                    <MapPinIcon className="h-3 w-3" /> Address</dt>
                  <dd className="text-gray-900 leading-snug">{delivery.delivery_address || "—"}</dd></div>
              </dl>
            </div>
          </div>

          {/* Tracking timeline */}
          {delivery.delivery_updates?.length > 0 || delivery.deliveryUpdates?.length > 0 ? (
            <div>
              <h4 className="font-semibold text-gray-700 text-xs uppercase tracking-wide mb-3">Tracking History</h4>
              <div className="space-y-2">
                {(delivery.delivery_updates || delivery.deliveryUpdates).map((upd, i) => (
                  <div key={i} className="flex gap-3 p-3 bg-gray-50 rounded-xl text-sm">
                    <DocumentTextIcon className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-900 capitalize">{fmt(upd.status)}</span>
                        <span className="text-xs text-gray-400 flex-shrink-0">
                          {new Date(upd.created_at).toLocaleString()}
                        </span>
                      </div>
                      {upd.notes && <p className="text-gray-600 mt-0.5 text-xs">{upd.notes}</p>}
                      {upd.location && <p className="text-gray-400 mt-0.5 text-xs">📍 {upd.location}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="px-6 py-3 bg-gray-50 flex justify-end rounded-b-2xl">
          <button onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-white">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Assign courier modal ──────────────────────────────────────────────────────
// Since no 'courier' role/type exists, admin manually enters driver details
// OR picks from any seller/admin user as a courier.
const AssignModal = ({ delivery, candidates, onAssign, onClose }) => {
  const [mode, setMode]   = useState("manual"); // "manual" | "user"
  const [form, setForm]   = useState({
    platform_courier_id: "",
    driver_name:  delivery.assigned_driver_name  || "",
    driver_phone: delivery.assigned_driver_phone || "",
    vehicle_type: delivery.assigned_vehicle_type || "Motorcycle",
    vehicle_number: delivery.assigned_vehicle_number || "",
  });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleUserSelect = (e) => {
    const uid = e.target.value;
    const user = candidates.find(c => String(c.id) === uid);
    set("platform_courier_id", uid);
    if (user) {
      set("driver_name",  user.name  || "");
      set("driver_phone", user.phone || "");
    }
  };

  const submit = async () => {
    if (!form.driver_name.trim()) return;
    setSaving(true);
    await onAssign(delivery.id, form);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">Assign Courier</h3>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
            <XCircleIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4 text-sm">
          {/* Mode toggle */}
          <div className="flex gap-2">
            {[["manual","Enter manually"],["user","Pick from users"]].map(([m, label]) => (
              <button key={m} onClick={() => setMode(m)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors
                  ${mode === m ? "bg-green-600 text-white border-green-600" : "border-gray-300 text-gray-600 hover:bg-gray-50"}`}>
                {label}
              </button>
            ))}
          </div>

          {mode === "user" && candidates.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Select User</label>
              <select value={form.platform_courier_id} onChange={handleUserSelect}
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-green-500">
                <option value="">— Choose a user —</option>
                {candidates.map(u => (
                  <option key={u.id} value={u.id}>{u.name} · {u.phone || u.email || u.type}</option>
                ))}
              </select>
            </div>
          )}

          {/* Driver details */}
          {[
            ["driver_name",   "Driver Name *",    "text",  "e.g. Ko Aung"],
            ["driver_phone",  "Driver Phone",     "tel",   "+959..."],
            ["vehicle_type",  "Vehicle Type",     "text",  "Motorcycle / Van / Truck"],
            ["vehicle_number","Vehicle Number",   "text",  "e.g. 1A/1234"],
          ].map(([k, label, type, ph]) => (
            <div key={k}>
              <label className="block text-xs font-semibold text-gray-500 mb-1">{label}</label>
              <input type={type} value={form[k]} placeholder={ph}
                onChange={e => set(k, e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-green-500" />
            </div>
          ))}
        </div>

        <div className="px-5 py-3 bg-gray-50 flex justify-end gap-2 rounded-b-2xl">
          <button onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-xl text-sm text-gray-700 hover:bg-white">
            Cancel
          </button>
          <button onClick={submit} disabled={saving || !form.driver_name.trim()}
            className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-xl
                       hover:bg-green-700 disabled:opacity-50">
            {saving ? "Assigning…" : "Assign"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
const PlatformLogistics = () => {
  const [deliveries, setDeliveries]         = useState([]);
  const [candidates, setCandidates]         = useState([]); // users who can be couriers
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState("");
  const [actionError, setActionError]       = useState("");
  const [actionSuccess, setActionSuccess]   = useState("");
  const [viewDelivery, setViewDelivery]     = useState(null);
  const [assignDelivery, setAssignDelivery] = useState(null);
  const [page, setPage]                     = useState(1);
  const [lastPage, setLastPage]             = useState(1);

  const flash = (msg, type = "success") => {
    if (type === "success") { setActionSuccess(msg); setTimeout(() => setActionSuccess(""), 3000); }
    else                    { setActionError(msg);   setTimeout(() => setActionError(""), 4000); }
  };

  // ── Fetch platform deliveries (paginated) ──────────────────────────────────
  const fetchDeliveries = useCallback(async (pg = 1) => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/deliveries", {
        params: { delivery_method: "platform", per_page: 15, page: pg },
      });
      // data = paginator: { data:[...], current_page, last_page, ... }
      const paginator = res.data.data;
      const items = Array.isArray(paginator?.data) ? paginator.data
                  : Array.isArray(paginator)        ? paginator
                  : [];
      setDeliveries(items);
      setLastPage(paginator?.last_page ?? 1);
      setPage(paginator?.current_page ?? pg);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load deliveries.");
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Fetch potential couriers — all non-buyer users ─────────────────────────
  // No 'courier' role/type exists. We fetch sellers + admins as assignable users.
  const fetchCandidates = useCallback(async () => {
    try {
      const [sellers, admins] = await Promise.allSettled([
        api.get("/users", { params: { role: "seller", per_page: 100 } }),
        api.get("/users", { params: { role: "admin",  per_page: 100 } }),
      ]);
      const all = [
        ...(sellers.status === "fulfilled" ? (sellers.value.data.data?.data ?? sellers.value.data.data ?? []) : []),
        ...(admins.status  === "fulfilled" ? (admins.value.data.data?.data  ?? admins.value.data.data  ?? []) : []),
      ];
      // Deduplicate by id
      const seen = new Set();
      setCandidates(all.filter(u => { if (seen.has(u.id)) return false; seen.add(u.id); return true; }));
    } catch {
      setCandidates([]);
    }
  }, []);

  useEffect(() => { fetchDeliveries(1); fetchCandidates(); }, [fetchDeliveries, fetchCandidates]);

  // ── Assign courier ─────────────────────────────────────────────────────────
  const handleAssign = async (deliveryId, form) => {
    try {
      setActionError("");
      const payload = {
        driver_name:    form.driver_name   || null,
        driver_phone:   form.driver_phone  || null,
        vehicle_type:   form.vehicle_type  || null,
        vehicle_number: form.vehicle_number || null,
      };
      if (form.platform_courier_id) payload.platform_courier_id = Number(form.platform_courier_id);
      await api.post(`/deliveries/${deliveryId}/assign-courier`, payload);
      setAssignDelivery(null);
      flash("Courier assigned.");
      fetchDeliveries(page);
    } catch (err) {
      flash(err.response?.data?.message || "Failed to assign courier.", "error");
    }
  };

  // ── Update status ──────────────────────────────────────────────────────────
  const updateStatus = async (deliveryId, status, notes = "") => {
    try {
      setActionError("");
      await api.post(`/deliveries/${deliveryId}/status`, { status, notes });
      flash(`Status updated to "${fmt(status)}".`);
      fetchDeliveries(page);
    } catch (err) {
      flash(err.response?.data?.message || "Failed to update status.", "error");
    }
  };

  // ── Stats ──────────────────────────────────────────────────────────────────
  const stats = {
    total:    deliveries.length,
    pending:  deliveries.filter(d => !d.platform_courier_id && d.status !== "delivered").length,
    active:   deliveries.filter(d => ["picked_up","in_transit","out_for_delivery"].includes(d.status)).length,
    revenue:  deliveries.reduce((s, d) => s + (Number(d.platform_delivery_fee) || 0), 0),
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Platform Logistics</h2>
          <p className="text-sm text-gray-500 mt-0.5">Manage platform delivery assignments and tracking</p>
        </div>
        <button onClick={() => fetchDeliveries(page)}
          className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowPathIcon className="h-4 w-4" />
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <ExclamationCircleIcon className="h-4 w-4 flex-shrink-0" />
          {error}
          <button onClick={() => fetchDeliveries(page)} className="ml-auto underline text-xs">Retry</button>
        </div>
      )}
      {actionError && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <ExclamationCircleIcon className="h-4 w-4 flex-shrink-0" />
          {actionError}
          <button onClick={() => setActionError("")} className="ml-auto">
            <XCircleIcon className="h-4 w-4" />
          </button>
        </div>
      )}
      {actionSuccess && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-800">
          <CheckCircleIcon className="h-4 w-4 flex-shrink-0" />
          {actionSuccess}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total", value: stats.total,   color: "text-blue-700",   bg: "bg-blue-50",   icon: TruckIcon },
          { label: "Unassigned", value: stats.pending, color: "text-yellow-700", bg: "bg-yellow-50", icon: ClockIcon },
          { label: "In Progress", value: stats.active, color: "text-purple-700", bg: "bg-purple-50", icon: TruckIcon },
          { label: "Revenue",  value: fmtMMK(stats.revenue), color: "text-green-700",  bg: "bg-green-50",  icon: CurrencyDollarIcon },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-xl p-4`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500">{s.label}</p>
                <p className={`text-xl font-bold ${s.color} mt-1`}>{s.value}</p>
              </div>
              <s.icon className={`h-5 w-5 ${s.color} opacity-60`} />
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-14">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-green-500" />
          </div>
        ) : deliveries.length === 0 ? (
          <div className="py-14 text-center text-gray-400">
            <TruckIcon className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">No platform deliveries found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  {["Order #","Seller","Status","Courier / Driver","Fee","Actions"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {deliveries.map(d => {
                  // Laravel serializes belongsTo as snake_case: platform_courier
                  const courier = d.platform_courier ?? d.platformCourier;
                  return (
                    <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        #{d.order?.order_number ?? d.order_id}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {d.supplier?.name ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={d.status} />
                      </td>
                      <td className="px-4 py-3">
                        {courier || d.assigned_driver_name ? (
                          <div className="flex items-center gap-1.5">
                            <UserIcon className="h-3.5 w-3.5 text-gray-400" />
                            <div>
                              <p className="text-gray-900 text-xs font-medium">
                                {courier?.name ?? d.assigned_driver_name}
                              </p>
                              {d.assigned_driver_phone && (
                                <p className="text-gray-400 text-[10px]">{d.assigned_driver_phone}</p>
                              )}
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setAssignDelivery(d)}
                            className="flex items-center gap-1 text-xs text-green-700 border border-green-300
                                       bg-green-50 hover:bg-green-100 px-2.5 py-1 rounded-lg transition-colors">
                            <UserGroupIcon className="h-3.5 w-3.5" /> Assign Courier
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-700 whitespace-nowrap text-xs font-medium">
                        {fmtMMK(d.platform_delivery_fee)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <button onClick={() => setViewDelivery(d)} title="View details"
                            className="p-1.5 text-gray-500 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors">
                            <EyeIcon className="h-4 w-4" />
                          </button>

                          {d.status === "awaiting_pickup" && (
                            <button onClick={() => updateStatus(d.id, "picked_up", "Package picked up by courier")}
                              className="text-xs bg-indigo-600 text-white px-2.5 py-1 rounded-lg hover:bg-indigo-700">
                              Picked Up
                            </button>
                          )}
                          {d.status === "picked_up" && (
                            <button onClick={() => updateStatus(d.id, "in_transit", "Package in transit")}
                              className="text-xs bg-purple-600 text-white px-2.5 py-1 rounded-lg hover:bg-purple-700">
                              In Transit
                            </button>
                          )}
                          {d.status === "in_transit" && (
                            <button onClick={() => updateStatus(d.id, "out_for_delivery", "Out for delivery")}
                              className="text-xs bg-orange-500 text-white px-2.5 py-1 rounded-lg hover:bg-orange-600">
                              Out for Delivery
                            </button>
                          )}
                          {d.status === "out_for_delivery" && (
                            <button onClick={() => updateStatus(d.id, "delivered", "Delivered successfully")}
                              className="text-xs bg-green-600 text-white px-2.5 py-1 rounded-lg hover:bg-green-700">
                              Delivered ✓
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && lastPage > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-sm">
            <span className="text-gray-400 text-xs">Page {page} of {lastPage}</span>
            <div className="flex gap-1">
              <button disabled={page === 1} onClick={() => fetchDeliveries(page - 1)}
                className="px-3 py-1 border border-gray-200 rounded-lg text-xs disabled:opacity-40 hover:bg-gray-50">
                Previous
              </button>
              <button disabled={page === lastPage} onClick={() => fetchDeliveries(page + 1)}
                className="px-3 py-1 border border-gray-200 rounded-lg text-xs disabled:opacity-40 hover:bg-gray-50">
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {viewDelivery && (
        <DeliveryModal
          delivery={viewDelivery}
          onClose={() => setViewDelivery(null)}
          onStatusUpdate={updateStatus}
        />
      )}
      {assignDelivery && (
        <AssignModal
          delivery={assignDelivery}
          candidates={candidates}
          onAssign={handleAssign}
          onClose={() => setAssignDelivery(null)}
        />
      )}
    </div>
  );
};

export default PlatformLogistics;