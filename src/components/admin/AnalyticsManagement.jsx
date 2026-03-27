import React, { useState, useEffect } from "react";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import api from "../../utils/api";
import { exportToExcel, mmkCell, todayStr } from "../../utils/exportExcel";

const fmtK = (n) => {
  const v = Number(n) || 0;
  if (v >= 1_000_000_000) return (v / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "B";
  if (v >= 1_000_000)     return (v / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (v >= 1_000)         return (v / 1_000).toFixed(1).replace(/\.0$/, "") + "k";
  return v.toLocaleString();
};
const fmtMMK = (n) => `${fmtK(n)} MMK`;

const ExportBtn = ({ label, onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="text-xs px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-1.5 disabled:opacity-60 transition-colors"
  >
    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
    {disabled ? "Exporting…" : label}
  </button>
);

const AnalyticsManagement = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/admin");
        const d = res.data?.data || res.data;
        setData(d);
      } catch (e) {
        setError("Failed to load analytics data.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const doExport = async (key, fn) => {
    setExporting(key);
    try { await fn(); } catch (e) { alert(e.message); } finally { setExporting(""); }
  };

  const exportRevenue = () => doExport("revenue", async () => {
    const monthly = data?.monthly_revenue || [];
    const rows = [
      ["Pyonea Platform Revenue Report", `Exported: ${new Date().toLocaleString()}`],
      [],
      ["SUMMARY"],
      ["Metric", "Amount (MMK)"],
      ["Total GMV",           mmkCell(data?.total_revenue)],
      ["Platform Revenue",    mmkCell(data?.platform_revenue)],
      ["Commission (5%)",     mmkCell(data?.total_commission)],
      ["Tax Collected (5%)",  mmkCell(data?.total_tax)],
      ["Pending Revenue",     mmkCell(data?.pending_commission)],
      ["Collected Revenue",   mmkCell(data?.collected_revenue)],
      [],
      ["MONTHLY BREAKDOWN"],
      ["Month", "Platform Revenue (MMK)", "Commission (MMK)", "Tax (MMK)"],
      ...monthly.map(r => [r.month, mmkCell(r.revenue), mmkCell(r.commission), mmkCell(r.tax)]),
    ];
    await exportToExcel(rows, "Platform Revenue", `pyonea-admin-revenue-${todayStr()}.xlsx`);
  });

  const exportMonthly = () => doExport("monthly", async () => {
    const monthly = data?.monthly_revenue || [];
    const rows = [
      ["Month", "Platform Revenue (MMK)", "Commission (MMK)", "Tax (MMK)"],
      ...monthly.map(r => [r.month, mmkCell(r.revenue), mmkCell(r.commission), mmkCell(r.tax)]),
    ];
    await exportToExcel(rows, "Monthly Revenue", `pyonea-monthly-revenue-${todayStr()}.xlsx`);
  });

  const exportSummary = () => doExport("summary", async () => {
    const rows = [
      ["Metric", "Value"],
      ["Total Users",         data?.user_count        ?? 0],
      ["Total Sellers",       data?.seller_count       ?? 0],
      ["Total Products",      data?.product_count      ?? 0],
      ["Total Orders",        data?.order_count        ?? 0],
      ["Pending Orders",      data?.pending_orders     ?? 0],
      ["Total GMV (MMK)",     mmkCell(data?.total_revenue)],
      ["Platform Revenue (MMK)", mmkCell(data?.platform_revenue)],
      ["Commission 5% (MMK)", mmkCell(data?.total_commission)],
      ["Tax 5% (MMK)",        mmkCell(data?.total_tax)],
    ];
    await exportToExcel(rows, "Platform Summary", `pyonea-summary-${todayStr()}.xlsx`);
  });

  if (loading) return (
    <div className="flex justify-center items-center h-48">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-500" />
    </div>
  );
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  const monthly = (data?.monthly_revenue || []).map(r => ({
    month: r.month,
    revenue: Number(r.revenue) || 0,
    commission: Number(r.commission) || 0,
    tax: Number(r.tax) || 0,
  }));

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Revenue Analytics</h2>
          <p className="text-sm text-gray-500 mt-0.5">Platform commission and tax revenue overview</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <ExportBtn label="Export Summary"       onClick={exportSummary} disabled={!!exporting} />
          <ExportBtn label="Export Monthly"       onClick={exportMonthly} disabled={!!exporting} />
          <ExportBtn label="Export Full Report"   onClick={exportRevenue} disabled={!!exporting} />
        </div>
      </div>

      {/* ── KPI cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total GMV",         value: fmtMMK(data?.total_revenue),     color: "text-emerald-700", bg: "bg-emerald-50" },
          { label: "Platform Revenue",  value: fmtMMK(data?.platform_revenue),  color: "text-teal-700",    bg: "bg-teal-50"    },
          { label: "Commission (5%)",   value: fmtMMK(data?.total_commission),  color: "text-amber-700",   bg: "bg-amber-50"   },
          { label: "Tax (5%)",          value: fmtMMK(data?.total_tax),         color: "text-rose-700",    bg: "bg-rose-50"    },
        ].map(c => (
          <div key={c.label} className={`rounded-xl p-4 ${c.bg}`}>
            <p className="text-xs font-medium text-gray-500">{c.label}</p>
            <p className={`text-lg font-bold ${c.color} mt-1 break-all`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* ── Monthly revenue chart ── */}
      {monthly.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700">Monthly Platform Revenue</h3>
            <ExportBtn label="Export" onClick={exportMonthly} disabled={!!exporting} />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#666" }} />
                <YAxis tickFormatter={v => fmtK(v)} tick={{ fontSize: 11, fill: "#666" }} />
                <Tooltip formatter={(v) => [`${fmtK(v)} MMK`]} />
                <Legend />
                <Bar dataKey="revenue"    name="Platform Revenue" fill="#14b8a6" radius={[4,4,0,0]} />
                <Bar dataKey="commission" name="Commission 5%"     fill="#f59e0b" radius={[4,4,0,0]} />
                <Bar dataKey="tax"        name="Tax 5%"            fill="#f43f5e" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ── Monthly table ── */}
      {monthly.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-50">
            <h3 className="text-sm font-semibold text-gray-700">Monthly Breakdown</h3>
            <ExportBtn label="Export" onClick={exportMonthly} disabled={!!exporting} />
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {["Month","Platform Revenue","Commission (5%)","Tax (5%)"].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {monthly.map(r => (
                  <tr key={r.month} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5 font-medium text-gray-900">{r.month}</td>
                    <td className="px-4 py-2.5 font-semibold text-teal-700">{fmtMMK(r.revenue)}</td>
                    <td className="px-4 py-2.5 text-amber-700">{fmtMMK(r.commission)}</td>
                    <td className="px-4 py-2.5 text-rose-700">{fmtMMK(r.tax)}</td>
                  </tr>
                ))}
                <tr className="bg-gray-50 font-semibold">
                  <td className="px-4 py-2.5 text-gray-700">Total</td>
                  <td className="px-4 py-2.5 text-teal-700">{fmtMMK(monthly.reduce((s,r)=>s+r.revenue,0))}</td>
                  <td className="px-4 py-2.5 text-amber-700">{fmtMMK(monthly.reduce((s,r)=>s+r.commission,0))}</td>
                  <td className="px-4 py-2.5 text-rose-700">{fmtMMK(monthly.reduce((s,r)=>s+r.tax,0))}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {monthly.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p className="text-sm">No revenue data yet. Revenue will appear here once orders are placed.</p>
        </div>
      )}
    </div>
  );
};

export default AnalyticsManagement;