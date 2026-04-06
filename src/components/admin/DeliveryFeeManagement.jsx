import React, { useState, useEffect, useCallback } from 'react';
import {
  TruckIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  BanknotesIcon,
} from '@heroicons/react/24/outline';
import api from '../../utils/api';

// ── Helpers ────────────────────────────────────────────────────────────────

const fmtK = (n) => {
  const v = Number(n) || 0;
  if (v >= 1_000_000) return (v / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (v >= 1_000)     return (v / 1_000).toFixed(1).replace(/\.0$/, '') + 'k';
  return v.toLocaleString();
};
const fmtMMK  = (n) => `${fmtK(n)} MMK`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

// ── Collect Modal ──────────────────────────────────────────────────────────

function CollectModal({ delivery, onClose, onConfirm, loading }) {
  const [form, setForm] = useState({ collection_ref: '', admin_notes: '' });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Mark Delivery Fee Collected</h3>
          <p className="text-sm text-gray-500 mt-1">Order: {delivery.order?.order_number}</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800 font-medium">Fee Amount</p>
            <p className="text-2xl font-bold text-blue-900 mt-1">{fmtMMK(delivery.platform_delivery_fee)}</p>
            <p className="text-xs text-blue-600 mt-1">From seller: {delivery.supplier?.name}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Collection Reference *</label>
            <input
              type="text"
              placeholder="e.g. bank transfer ref, receipt ID"
              value={form.collection_ref}
              onChange={e => setForm(f => ({ ...f, collection_ref: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Admin Notes (optional)</label>
            <textarea
              rows={2}
              placeholder="Any notes for internal records"
              value={form.admin_notes}
              onChange={e => setForm(f => ({ ...f, admin_notes: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
            />
          </div>
        </div>
        <div className="p-6 border-t border-gray-100 flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={() => onConfirm(delivery.id, form)}
            disabled={!form.collection_ref || loading}
            className="px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
          >
            {loading && <ArrowPathIcon className="h-4 w-4 animate-spin" />}
            Mark as Collected
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function DeliveryFeeManagement() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('');
  const [search, setSearch]   = useState('');
  const [modal, setModal]     = useState(null);
  const [acting, setActing]   = useState(false);
  const [toast, setToast]     = useState(null);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const load = useCallback(async (feeStatus = filter) => {
    setLoading(true);
    try {
      const res = await api.get('/admin/delivery-fees', { params: feeStatus ? { fee_status: feeStatus } : {} });
      setData(res.data.data);
    } catch {
      showToast('error', 'Failed to load delivery fees.');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const handleFilterChange = (s) => {
    setFilter(s);
    load(s);
  };

  const handleCollect = async (deliveryId, form) => {
    setActing(true);
    try {
      await api.post(`/admin/deliveries/${deliveryId}/collect-fee`, form);
      showToast('success', 'Delivery fee marked as collected.');
      setModal(null);
      load();
    } catch (err) {
      showToast('error', err?.response?.data?.message || 'Action failed.');
    } finally {
      setActing(false);
    }
  };

  const deliveries = (data?.deliveries?.data || []).filter(d => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      d.order?.order_number?.toLowerCase().includes(q) ||
      d.supplier?.name?.toLowerCase().includes(q)
    );
  });

  const summary = data?.summary || {};

  return (
    <div className="space-y-6 max-w-6xl mx-auto">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-lg shadow-lg text-sm font-medium flex items-center gap-2 ${
          toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {toast.type === 'success' ? <CheckCircleIcon className="h-4 w-4" /> : <XCircleIcon className="h-4 w-4" />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Delivery Fee Collections</h1>
          <p className="text-sm text-gray-500 mt-1">Track platform-managed delivery fees — quote, collect, and confirm manually.</p>
        </div>
        <button onClick={() => load()} className="flex items-center gap-2 text-sm text-gray-600 border border-gray-300 rounded-lg px-3 py-2 hover:bg-gray-50">
          <ArrowPathIcon className="h-4 w-4" /> Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Outstanding Count',   value: summary.outstanding_count || 0,   sub: 'Fees not yet collected',        Icon: ClockIcon,      color: 'border-yellow-400 bg-yellow-50' },
          { label: 'Outstanding Amount',  value: fmtMMK(summary.outstanding_amount), sub: 'Total owed to platform',      Icon: BanknotesIcon,  color: 'border-orange-400 bg-orange-50' },
          { label: 'Collected Count',     value: summary.collected_count || 0,     sub: 'Successfully collected',         Icon: CheckCircleIcon,color: 'border-green-400 bg-green-50' },
          { label: 'Collected Amount',    value: fmtMMK(summary.collected_amount), sub: 'Platform delivery revenue',      Icon: TruckIcon,      color: 'border-blue-400 bg-blue-50' },
        ].map(card => (
          <div key={card.label} className={`rounded-xl border-l-4 p-5 shadow-sm ${card.color}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{card.label}</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{card.value}</p>
                <p className="mt-0.5 text-xs text-gray-500">{card.sub}</p>
              </div>
              <card.Icon className="h-8 w-8 text-gray-300 flex-shrink-0" />
            </div>
          </div>
        ))}
      </div>

      {/* Policy reminder */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-900">
        <p className="font-semibold mb-1">How Delivery Fee Collection Works</p>
        <p className="text-xs text-blue-800 leading-relaxed">
          When a seller requests platform delivery, the admin manually quotes a fee based on distance, weight, and area.
          The fee is negotiated and agreed before dispatch — no fixed rate is enforced by the platform.
          Once the fee is received (via bank transfer or mobile payment), mark it as collected here with the reference number.
        </p>
      </div>

      {/* Filters + Search */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search order number or seller name…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div className="flex gap-2">
          {['', 'outstanding', 'collected'].map(s => (
            <button
              key={s}
              onClick={() => handleFilterChange(s)}
              className={`text-xs px-3 py-1.5 rounded-full border font-medium ${
                filter === s ? 'bg-green-600 text-white border-green-600' : 'text-gray-600 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16"><ArrowPathIcon className="h-8 w-8 text-gray-400 animate-spin" /></div>
      ) : deliveries.length === 0 ? (
        <div className="bg-gray-50 rounded-xl p-12 text-center">
          <TruckIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No platform delivery fees found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide border-b border-gray-200">
                <tr>
                  <th className="px-5 py-3 text-left">Order</th>
                  <th className="px-5 py-3 text-left">Seller</th>
                  <th className="px-5 py-3 text-right">Fee Quoted</th>
                  <th className="px-5 py-3 text-left">Delivery Status</th>
                  <th className="px-5 py-3 text-left">Fee Status</th>
                  <th className="px-5 py-3 text-left">Collected On</th>
                  <th className="px-5 py-3 text-left">Ref</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {deliveries.map(d => {
                  const isOutstanding = d.delivery_fee_status === 'outstanding';
                  const isCollected   = d.delivery_fee_status === 'collected';

                  return (
                    <tr key={d.id} className="hover:bg-gray-50">
                      <td className="px-5 py-4">
                        <p className="font-mono text-xs font-semibold text-gray-800">
                          {d.order?.order_number || `#${d.order_id}`}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">{fmtDate(d.created_at)}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-gray-900">{d.supplier?.name || '—'}</p>
                        <p className="text-xs text-gray-400">{d.supplier?.email}</p>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <p className="font-bold text-gray-900">{fmtMMK(d.platform_delivery_fee)}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${
                          d.status === 'delivered' ? 'bg-green-100 text-green-800 border-green-200' :
                          d.status === 'in_transit' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                          d.status === 'cancelled' ? 'bg-gray-100 text-gray-500 border-gray-200' :
                          'bg-yellow-100 text-yellow-800 border-yellow-200'
                        }`}>
                          {d.status?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${
                          isCollected   ? 'bg-green-100 text-green-800 border-green-200' :
                          isOutstanding ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                          'bg-gray-100 text-gray-500 border-gray-200'
                        }`}>
                          {d.delivery_fee_status === 'not_applicable' ? 'N/A' :
                           d.delivery_fee_status?.charAt(0).toUpperCase() + d.delivery_fee_status?.slice(1)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-500">
                        {fmtDate(d.delivery_fee_collected_at)}
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-500 max-w-28 truncate">
                        {d.delivery_fee_collection_ref || '—'}
                      </td>
                      <td className="px-5 py-4 text-right">
                        {isOutstanding && (
                          <button
                            onClick={() => setModal(d)}
                            className="text-xs font-medium bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700"
                          >
                            Mark Collected
                          </button>
                        )}
                        {isCollected && (
                          <span className="text-xs text-green-600 font-medium flex items-center gap-1 justify-end">
                            <CheckCircleIcon className="h-3.5 w-3.5" /> Done
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modal && (
        <CollectModal
          delivery={modal}
          onClose={() => setModal(null)}
          onConfirm={handleCollect}
          loading={acting}
        />
      )}
    </div>
  );
}
 