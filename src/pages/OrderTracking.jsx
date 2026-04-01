// src/pages/OrderTracking.jsx
import React, { useState, useEffect, useRef } from "react";
import useSEO from "../hooks/useSEO";
import { useSearchParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../utils/api";

// ─── Status helpers ───────────────────────────────────────────────────────────
const ORDER_STEPS = [
  { key: "pending",    labelKey: "buyer_dashboard.order_status.pending",    icon: "🛍️" },
  { key: "confirmed",  labelKey: "buyer_dashboard.order_status.confirmed",        icon: "✅" },
  { key: "processing", labelKey: "buyer_dashboard.order_status.processing",       icon: "⚙️" },
  { key: "shipped",    labelKey: "buyer_dashboard.order_status.shipped",          icon: "🚚" },
  { key: "delivered",  labelKey: "buyer_dashboard.order_status.delivered",        icon: "📦" },
];

const DELIVERY_STEPS = [
  { key: "pending",          label: "Awaiting Pickup",   icon: "⏳" },
  { key: "awaiting_pickup",  label: "Ready for Pickup",  icon: "📍" },
  { key: "picked_up",        label: "Picked Up",         icon: "✋" },
  { key: "in_transit",       label: "In Transit",        icon: "🚛" },
  { key: "out_for_delivery", labelKey: "order_tracking.out_for_delivery",  icon: "🏃" },
  { key: "delivered",        label: "Delivered",         icon: "🎉" },
];

const STATUS_COLORS = {
  pending:          "bg-amber-100 text-amber-700 border-amber-200",
  confirmed:        "bg-blue-100 text-blue-700 border-blue-200",
  processing:       "bg-purple-100 text-purple-700 border-purple-200",
  shipped:          "bg-cyan-100 text-cyan-700 border-cyan-200",
  delivered:        "bg-green-100 text-green-700 border-green-200",
  cancelled:        "bg-red-100 text-red-700 border-red-200",
  refunded:         "bg-gray-100 text-gray-600 border-gray-200",
  awaiting_pickup:  "bg-orange-100 text-orange-700 border-orange-200",
  picked_up:        "bg-indigo-100 text-indigo-700 border-indigo-200",
  in_transit:       "bg-cyan-100 text-cyan-700 border-cyan-200",
  out_for_delivery: "bg-blue-100 text-blue-700 border-blue-200",
  failed:           "bg-red-100 text-red-700 border-red-200",
  paid:             "bg-green-100 text-green-700 border-green-200",
  unpaid:           "bg-red-100 text-red-700 border-red-200",
};

const fmt = (n) =>
  new Intl.NumberFormat("my-MM", {
    style: "currency", currency: "MMK", minimumFractionDigits: 0,
  }).format(n || 0);

// Fixed: removed useSEO from inside fmtDate
const fmtDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};

const fmtDateShort = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
};

const statusLabel = (s) =>
  s ? s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "—";

// ─── Step Progress Bar (fixed: removed useSEO) ────────────────────────────────
const StepBar = ({ steps, current }) => {
  const cancelled = current === "cancelled" || current === "refunded" || current === "failed";
  const activeIdx = cancelled ? -1 : steps.findIndex((s) => s.key === current);

  return (
    <div className="flex items-start gap-0 w-full">
      {steps.map((step, i) => {
        const done    = !cancelled && i < activeIdx;
        const active  = !cancelled && i === activeIdx;
        const future  = cancelled || i > activeIdx;

        return (
          <div key={step.key} className="flex-1 flex flex-col items-center relative">
            {/* connector left */}
            {i > 0 && (
              <div
                className={`absolute left-0 top-5 h-0.5 w-1/2 transition-colors duration-500 ${
                  done ? "bg-green-500" : "bg-gray-200"
                }`}
              />
            )}
            {/* connector right */}
            {i < steps.length - 1 && (
              <div
                className={`absolute right-0 top-5 h-0.5 w-1/2 transition-colors duration-500 ${
                  done || active ? "bg-green-500" : "bg-gray-200"
                }`}
              />
            )}

            {/* circle */}
            <div
              className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 transition-all duration-300 ${
                cancelled
                  ? "bg-red-50 border-red-200 opacity-40"
                  : done
                  ? "bg-green-500 border-green-500 shadow-md shadow-green-200"
                  : active
                  ? "bg-white border-green-500 shadow-lg shadow-green-100 scale-110"
                  : "bg-gray-50 border-gray-200 opacity-50"
              }`}
            >
              {done ? "✓" : step.icon}
            </div>

            <p
              className={`mt-2 text-center text-[11px] sm:text-xs font-medium leading-tight px-1 ${
                active ? "text-green-700" : done ? "text-gray-700" : "text-gray-400"
              }`}
            >
              {t(step.labelKey, step.key)}
            </p>
          </div>
        );
      })}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const OrderTracking = () => {
  const { t } = useTranslation();
  // ✅ Hook moved to top level of component
  const SeoComponent = useSEO({
    title: "Order Tracking | Pyonea",
    description: "Track your order status and delivery updates on Pyonea.",
    url: "/order-tracking",
    noindex: true,
  });

  const [searchParams, setSearchParams] = useSearchParams();
  const [input, setInput]     = useState(searchParams.get("order") || "");
  const [email, setEmail]     = useState("");
  const [order, setOrder]     = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const resultRef = useRef(null);

  // Auto-search if ?order= in URL
  useEffect(() => {
    const num = searchParams.get("order");
    if (num) {
      setInput(num);
      doSearch(num);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const doSearch = async (num = input) => {
    const trimmed = (num || "").trim().toUpperCase();
    if (!trimmed) {
      setError("Please enter an order number.");
      return;
    }
    setLoading(true);
    setError("");
    setOrder(null);

    try {
      const params = email.trim() ? { email: email.trim() } : {};
      const res = await api.get(`/track/${trimmed}`, { params });
      if (res.data.success) {
        setOrder(res.data.data);
        setSearchParams({ order: trimmed }, { replace: true });
        setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
      } else {
        setError(res.data.message || "Order not found.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Order not found. Please check your order number and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    doSearch();
  };

  return (
    <>
      {SeoComponent}
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50/30">

        {/* ── Hero banner ── */}
        <div className="relative bg-gradient-to-r from-green-700 to-emerald-600 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -top-16 -right-16 w-80 h-80 rounded-full bg-white" />
            <div className="absolute -bottom-20 -left-10 w-64 h-64 rounded-full bg-white" />
          </div>
          <div className="relative max-w-3xl mx-auto px-4 pt-14 pb-20 text-center">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-5">
              <span className="text-white/90 text-xs font-medium tracking-wide uppercase">Real-time tracking</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
              Track Your Order
            </h1>
            <p className="text-green-100 text-base sm:text-lg max-w-xl mx-auto">
              Enter your order number to get live updates on your shipment status.
            </p>
          </div>
        </div>

        {/* ── Search card ── */}
        <div className="max-w-2xl mx-auto px-4 -mt-8 relative z-10">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Order Number <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value.toUpperCase())}
                    placeholder="e.g. ORD-2024-000123"
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl text-sm font-mono
                      focus:outline-none focus:border-green-500 transition-colors placeholder:font-sans placeholder:text-gray-400"
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-green-600 text-white rounded-xl text-sm font-semibold
                      hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed
                      transition-all duration-200 shadow-sm hover:shadow-green-200 hover:shadow-md flex items-center gap-2 whitespace-nowrap"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Searching…
                      </>
                    ) : (
                      <>🔍 Track</>
                    )}
                  </button>
                </div>
              </div>

              {/* Optional email verification */}
              <details className="group">
                <summary className="text-xs text-gray-500 cursor-pointer select-none hover:text-green-600 transition-colors list-none flex items-center gap-1">
                  <span className="group-open:rotate-90 transition-transform inline-block">▶</span>
                  Add email for additional verification (optional)
                </summary>
                <div className="mt-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email used when ordering"
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm
                      focus:outline-none focus:border-green-500 transition-colors"
                  />
                </div>
              </details>

              {error && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <span className="text-red-500 mt-0.5 flex-shrink-0">⚠️</span>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
            </form>

            <div className="mt-5 pt-5 border-t border-gray-100 flex flex-wrap gap-x-6 gap-y-2 text-xs text-gray-400">
              <span className="flex items-center gap-1.5"><span>📧</span> Check your confirmation email for order number</span>
              <span className="flex items-center gap-1.5"><span>🔒</span> Your data is kept private</span>
            </div>
          </div>
        </div>

        {/* ── Results ── */}
        {order && (
          <div ref={resultRef} className="max-w-3xl mx-auto px-4 py-10 space-y-6">

            {/* Order header */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Order Number</p>
                  <h2 className="text-xl font-bold text-gray-900 font-mono">{order.order_number}</h2>
                  <p className="text-xs text-gray-400 mt-1">Placed on {fmtDate(order.created_at)}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${STATUS_COLORS[order.status] || "bg-gray-100 text-gray-600 border-gray-200"}`}>
                    {statusLabel(order.status)}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${STATUS_COLORS[order.payment_status] || "bg-gray-100 text-gray-600 border-gray-200"}`}>
                    {statusLabel(order.payment_status)}
                  </span>
                </div>
              </div>

              {/* Estimated delivery */}
              {order.estimated_delivery && order.status !== "delivered" && order.status !== "cancelled" && (
                <div className="mt-4 flex items-center gap-3 p-3 bg-green-50 border border-green-100 rounded-xl">
                  <span className="text-2xl">📅</span>
                  <div>
                    <p className="text-xs text-green-600 font-medium">{t("order_tracking.estimated_delivery")}</p>
                    <p className="text-sm font-semibold text-green-800">{fmtDateShort(order.estimated_delivery)}</p>
                  </div>
                </div>
              )}
              {order.delivered_at && (
                <div className="mt-4 flex items-center gap-3 p-3 bg-green-50 border border-green-100 rounded-xl">
                  <span className="text-2xl">🎉</span>
                  <div>
                    <p className="text-xs text-green-600 font-medium">Delivered On</p>
                    <p className="text-sm font-semibold text-green-800">{fmtDate(order.delivered_at)}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Order status stepper */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-6 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-green-500 rounded-full block" />
                Order Progress
              </h3>
              {order.status === "cancelled" || order.status === "refunded" ? (
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
                  <span className="text-2xl">❌</span>
                  <div>
                    <p className="font-semibold text-red-700">{statusLabel(order.status)}</p>
                    <p className="text-xs text-red-500 mt-0.5">This order has been {order.status}.</p>
                  </div>
                </div>
              ) : (
                <StepBar steps={ORDER_STEPS} current={order.status} />
              )}
            </div>

            {/* Delivery tracking */}
            {order.delivery && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-blue-500 rounded-full block" />
                    t("order_tracking.delivery_tracking")
                  </h3>
                  {order.delivery.tracking_number && (
                    <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-1.5 border border-gray-200">
                      <span className="text-xs text-gray-500">{t("order_tracking.tracking_number")}</span>
                      <span className="text-xs font-mono font-bold text-gray-800">{order.delivery.tracking_number}</span>
                    </div>
                  )}
                </div>

                {/* Delivery stepper */}
                {order.delivery.status !== "cancelled" && order.delivery.status !== "failed" ? (
                  <StepBar steps={DELIVERY_STEPS} current={order.delivery.status} />
                ) : (
                  <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
                    <span className="text-2xl">❌</span>
                    <div>
                      <p className="font-semibold text-red-700">{statusLabel(order.delivery.status)}</p>
                      {order.delivery.failure_reason && (
                        <p className="text-xs text-red-500 mt-0.5">{order.delivery.failure_reason}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Delivery meta */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                  {order.delivery.carrier_name && (
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">Carrier</p>
                      <p className="text-sm font-semibold text-gray-800">{order.delivery.carrier_name}</p>
                    </div>
                  )}
                  {order.delivery.method && (
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">Method</p>
                      <p className="text-sm font-semibold text-gray-800 capitalize">{order.delivery.method}</p>
                    </div>
                  )}
                  {order.delivery.estimated_delivery_date && (
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">Est. Delivery</p>
                      <p className="text-sm font-semibold text-gray-800">{fmtDateShort(order.delivery.estimated_delivery_date)}</p>
                    </div>
                  )}
                </div>

                {/* Update timeline */}
                {order.delivery.updates?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Update History</p>
                    <div className="space-y-0">
                      {[...order.delivery.updates].reverse().map((upd, i) => (
                        <div key={i} className="flex gap-4 relative">
                          {/* vertical line */}
                          {i < order.delivery.updates.length - 1 && (
                            <div className="absolute left-[13px] top-8 bottom-0 w-0.5 bg-gray-100" />
                          )}
                          {/* dot */}
                          <div className="flex-shrink-0 w-7 h-7 rounded-full bg-green-100 border-2 border-green-300 flex items-center justify-center mt-0.5 z-10">
                            <div className="w-2 h-2 rounded-full bg-green-500" />
                          </div>
                          <div className="pb-5">
                            <p className="text-sm font-semibold text-gray-800">{statusLabel(upd.status)}</p>
                            {upd.location && <p className="text-xs text-gray-500 mt-0.5">📍 {upd.location}</p>}
                            {upd.notes && <p className="text-xs text-gray-500 mt-0.5">{upd.notes}</p>}
                            <p className="text-[11px] text-gray-400 mt-1">{fmtDate(upd.created_at)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Order items */}
            {order.items?.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-purple-500 rounded-full block" />
                  Items Ordered ({order.items.length})
                </h3>
                <div className="divide-y divide-gray-50">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                      {/* Image */}
                      <div className="w-14 h-14 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden border border-gray-200">
                        {item.image ? (
                          <img src={item.image} alt={item.product_name} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = "none"; }} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300 text-xl">📦</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{item.product_name}</p>
                        {item.product_sku && <p className="text-[11px] text-gray-400 mt-0.5 font-mono">SKU: {item.product_sku}</p>}
                        <p className="text-xs text-gray-500 mt-0.5">{fmt(item.price)} × {item.quantity}</p>
                      </div>
                      <p className="text-sm font-bold text-gray-800 flex-shrink-0">{fmt(item.subtotal)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Summary + Seller + Address in 2-col grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

              {/* Order summary */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-amber-500 rounded-full block" />
                  Payment Summary
                </h3>
                <div className="space-y-2 text-sm">
                  {[
                    { label: "Subtotal",  value: fmt(order.subtotal_amount) },
                    { label: "Shipping",  value: fmt(order.shipping_fee) },
                    { label: "Tax",       value: fmt(order.tax_amount) },
                    ...(order.coupon_discount_amount > 0
                      ? [{ label: "Coupon Discount", value: `− ${fmt(order.coupon_discount_amount)}`, red: true }]
                      : []),
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between text-gray-500">
                      <span>{row.label}</span>
                      <span className={row.red ? "text-red-600 font-medium" : ""}>{row.value}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold text-gray-900 pt-3 border-t border-gray-100 mt-2">
                    <span>Total</span>
                    <span className="text-green-700">{fmt(order.total_amount)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 pt-1">
                    <span>Payment Method</span>
                    <span className="capitalize font-medium text-gray-600">{statusLabel(order.payment_method)}</span>
                  </div>
                </div>
              </div>

              {/* Seller + Address */}
              <div className="space-y-4">
                {order.seller && (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Sold by</p>
                    <div className="flex items-center gap-3">
                      {order.seller.store_logo ? (
                        <img src={order.seller.store_logo} alt={order.seller.store_name} className="w-10 h-10 rounded-lg object-cover border border-gray-200" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-green-700 font-bold text-sm">
                          {order.seller.store_name?.[0]?.toUpperCase() || "S"}
                        </div>
                      )}
                      <p className="text-sm font-semibold text-gray-800">{order.seller.store_name}</p>
                    </div>
                  </div>
                )}

                {order.shipping_address && (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Shipping To</p>
                    <div className="text-sm text-gray-700 space-y-0.5">
                      {order.shipping_address.name && <p className="font-semibold">{order.shipping_address.name}</p>}
                      {order.shipping_address.address && <p>{order.shipping_address.address}</p>}
                      {[order.shipping_address.city, order.shipping_address.state].filter(Boolean).join(", ") && (
                        <p>{[order.shipping_address.city, order.shipping_address.state].filter(Boolean).join(", ")}</p>
                      )}
                      {order.shipping_address.phone && (
                        <p className="text-gray-500 text-xs mt-1">📞 {order.shipping_address.phone}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Track another order */}
            <div className="text-center py-4">
              <button
                onClick={() => { setOrder(null); setInput(""); setEmail(""); setSearchParams({}); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                className="text-sm text-green-600 hover:text-green-800 font-medium transition-colors underline underline-offset-2"
              >
                Track a different order
              </button>
            </div>
          </div>
        )}

        {/* ── Info section ── */}
        {!order && !loading && (
          <div className="max-w-3xl mx-auto px-4 py-14">
            <h2 className="text-center text-base font-semibold text-gray-500 mb-8">How Tracking Works</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {[
                { icon: "📋", title: "Find Your Order Number", desc: "Check your order confirmation email or your account's order history for the order number." },
                { icon: "🔍", title: "Enter & Search", desc: "Type your order number in the search field above and click Track to see real-time status." },
                { icon: "📦", title: "Follow Your Package", desc: "See a full timeline from order placement through to delivery at your door." },
              ].map((card) => (
                <div key={card.title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
                  <div className="text-4xl mb-3">{card.icon}</div>
                  <p className="font-semibold text-gray-800 mb-2 text-sm">{card.title}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{card.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 bg-green-50 border border-green-100 rounded-2xl p-6 text-center">
              <p className="text-sm text-green-800 font-medium mb-1">Need help with your order?</p>
              <p className="text-xs text-green-600 mb-4">Our support team is happy to assist you with any questions.</p>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition-colors"
              >
                Contact Support
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default OrderTracking;