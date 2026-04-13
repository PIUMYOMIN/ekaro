import React, { useState, useEffect, useCallback } from "react";
import {
  MagnifyingGlassIcon, ArrowPathIcon, EyeIcon,
  ChevronLeftIcon, ChevronRightIcon, XMarkIcon,
  CheckCircleIcon, XCircleIcon,
} from "@heroicons/react/24/outline";
import api from "../../utils/api";

const STATUS_COLORS = {
  pending:   "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  processing:"bg-indigo-100 text-indigo-800",
  shipped:   "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const fmt = (n) =>
  new Intl.NumberFormat("my-MM", { style: "currency", currency: "MMK", minimumFractionDigits: 0 }).format(n || 0);

const Badge = ({ status }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                    ${STATUS_COLORS[status] || "bg-gray-100 text-gray-800"}`}>
    {status || "pending"}
  </span>
);

const OrderDetailModal = ({ order, onClose }) => {
  if (!order) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
          <h3 className="font-bold text-gray-900 dark:text-white">Order #{order.order_number || order.id}</h3>
          <button onClick={onClose} className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="px-6 py-5 space-y-5">
          {/* Meta */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><p className="text-gray-400 dark:text-gray-500 text-xs">Status</p><Badge status={order.status} /></div>
            <div><p className="text-gray-400 dark:text-gray-500 text-xs">Date</p><p className="font-medium text-gray-900 dark:text-white">{new Date(order.created_at).toLocaleString()}</p></div>
            <div><p className="text-gray-400 dark:text-gray-500 text-xs">Buyer</p><p className="font-medium text-gray-900 dark:text-white">{order.buyer?.name || "—"}</p></div>
            <div><p className="text-gray-400 dark:text-gray-500 text-xs">Payment</p><p className="font-medium text-gray-900 dark:text-white capitalize">{order.payment_method || "—"} · {order.payment_status || "—"}</p></div>
          </div>
          {/* Items */}
          {order.items?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Items</p>
              <div className="divide-y divide-gray-50 dark:divide-gray-700 border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden">
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-3 text-sm">
                    <span className="text-gray-700 dark:text-gray-300">{item.product_name} × {item.quantity}</span>
                    <span className="font-medium text-gray-900 dark:text-white">{fmt(item.subtotal)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Totals */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl px-4 py-3 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Subtotal</span><span className="text-gray-900 dark:text-white">{fmt(order.subtotal_amount)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Shipping</span><span className="text-gray-900 dark:text-white">{fmt(order.shipping_fee)}</span></div>
            {order.coupon_discount_amount > 0 && (
              <div className="flex justify-between text-green-700 dark:text-green-400"><span>Coupon</span><span>− {fmt(order.coupon_discount_amount)}</span></div>
            )}
            <div className="flex justify-between font-bold border-t border-gray-200 dark:border-gray-600 pt-2">
              <span className="text-gray-900 dark:text-white">Total</span><span className="text-green-700 dark:text-green-400">{fmt(order.total_amount)}</span>
            </div>
          </div>
          {/* Shipping address */}
          {order.shipping_address && (
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Ship To</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {order.shipping_address.name}<br />
                {order.shipping_address.address}, {order.shipping_address.city}<br />
                {order.shipping_address.phone}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const OrderManagement = () => {
  const [orders, setOrders]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [toast, setToast]         = useState(null);
  const [search, setSearch]       = useState("");
  const [statusFilter, setStatus] = useState("all");
  const [page, setPage]           = useState(1);
  const [selectedOrder, setSelected] = useState(null);
  const PER_PAGE = 15;

  const flash = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/orders");
      const data = res.data.data || res.data;
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load orders.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const updateStatus = async (orderId, status) => {
    try {
      // Dedicated action routes for specific transitions
      const actionMap = { confirmed: "confirm", shipped: "ship", cancelled: "cancel" };
      if (actionMap[status]) {
        await api.post(`/orders/${orderId}/${actionMap[status]}`);
      } else {
        // Admin generic status update (processing, delivered, etc.)
        await api.patch(`/orders/${orderId}/status`, { status });
      }
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
      flash("Order status updated.");
    } catch (err) {
      flash(err.response?.data?.message || "Failed to update status.", "error");
    }
  };

  // Filter + paginate
  const filtered = orders.filter(o => {
    const matchSearch = !search ||
      (o.order_number || "").toLowerCase().includes(search.toLowerCase()) ||
      (o.buyer?.name || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="space-y-4">
      {/* Toast */}
      {toast && (
        <div className={`flex items-center gap-2 p-3 rounded-xl text-sm font-medium
          ${toast.type === "success" ? "bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800"
          : "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800"}`}>
          {toast.type === "success"
            ? <CheckCircleIcon className="h-4 w-4 flex-shrink-0" />
            : <XCircleIcon className="h-4 w-4 flex-shrink-0" />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Order Management</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{filtered.length} orders</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchOrders}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <ArrowPathIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-48">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search order # or buyer…"
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-400 dark:placeholder-gray-500" />
        </div>
        <select value={statusFilter} onChange={e => { setStatus(e.target.value); setPage(1); }}
          className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-green-500">
          {["all","pending","confirmed","processing","shipped","delivered","cancelled"].map(s => (
            <option key={s} value={s}>{s === "all" ? "All Status" : s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-green-500" />
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-600 dark:text-red-400 text-sm">{error}
            <button onClick={fetchOrders} className="ml-2 underline">Retry</button>
          </div>
        ) : paginated.length === 0 ? (
          <div className="py-14 text-center text-gray-400 dark:text-gray-500 text-sm">
            {search || statusFilter !== "all" ? "No orders match your filters." : "No orders yet."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm divide-y divide-gray-100 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  {["Order #", "Date", "Buyer", "Amount", "Status", "Actions"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                {paginated.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                      #{order.order_number || order.id}
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                      {order.buyer?.name || "—"}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                      {fmt(order.total_amount)}
                    </td>
                    <td className="px-4 py-3">
                      <select value={order.status || "pending"}
                        onChange={e => updateStatus(order.id, e.target.value)}
                        className="text-xs border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-2 py-1 focus:ring-1 focus:ring-green-400">
                        {["pending","confirmed","processing","shipped","delivered","cancelled"].map(s => (
                          <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => setSelected(order)}
                        className="flex items-center gap-1 text-green-700 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 text-xs font-medium">
                        <EyeIcon className="h-3.5 w-3.5" /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-700 text-sm">
            <span className="text-gray-400 dark:text-gray-500">
              {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
            </span>
            <div className="flex gap-1">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed text-gray-500 dark:text-gray-400">
                <ChevronLeftIcon className="h-4 w-4" />
              </button>
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed text-gray-500 dark:text-gray-400">
                <ChevronRightIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selectedOrder && (
        <OrderDetailModal order={selectedOrder} onClose={() => setSelected(null)} />
      )}
    </div>
  );
};

export default OrderManagement;