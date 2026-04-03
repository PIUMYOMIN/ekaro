import React, { useState, useEffect, useCallback } from "react";
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import api from "../../utils/api";

// ── Formatters ────────────────────────────────────────────────────────────────
const fmtK = (n) => {
  const v = Number(n) || 0;
  if (v >= 1_000_000_000) return (v / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "B";
  if (v >= 1_000_000)     return (v / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (v >= 1_000)         return (v / 1_000).toFixed(1).replace(/\.0$/, "") + "k";
  return v.toLocaleString();
};
const fmtMMK = (n) => `${fmtK(n)} MMK`;
const fullMMK = (n) =>
  new Intl.NumberFormat("my-MM", { style: "currency", currency: "MMK", minimumFractionDigits: 0 })
    .format(Number(n) || 0);

// ── KPI card ──────────────────────────────────────────────────────────────────
const KPI = ({ label, value, color, bg }) => (
  <div className={`rounded-xl p-4 ${bg}`}>
    <p className="text-xs font-medium text-gray-500">{label}</p>
    <p className={`text-lg font-bold ${color} mt-1 break-all`}>{value}</p>
  </div>
);

// ── Export button (no alert — uses inline error) ──────────────────────────────
const ExportBtn = ({ label, onClick, disabled }) => (
  <button onClick={onClick} disabled={disabled}
    className="text-xs px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white
               rounded-lg flex items-center gap-1.5 disabled:opacity-60 transition-colors">
    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
    {disabled ? "Exporting…" : label}
  </button>
);

// ── Main component ────────────────────────────────────────────────────────────
const AnalyticsManagement = () => {
  const [stats,    setStats]    = useState(null);   // from /admin/stats
  const [monthly,  setMonthly]  = useState([]);     // from /admin/monthly-revenue
  const [commissions, setComm]  = useState([]);     // from /admin/commission-summary
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [exportErr, setExportErr] = useState("");
  const [exporting, setExporting] = useState("");

  // ── Fetch all three endpoints in parallel ─────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [statsRes, monthlyRes, commRes] = await Promise.allSettled([
        api.get("/admin/stats"),
        api.get("/admin/monthly-revenue"),
        api.get("/admin/commission-summary"),
      ]);

      if (statsRes.status === "fulfilled" && statsRes.value.data.success) {
        setStats(statsRes.value.data.data);
      }
      if (monthlyRes.status === "fulfilled" && monthlyRes.value.data.success) {
        const raw = monthlyRes.value.data.data || [];
        setMonthly(raw.map(r => ({
          month:      r.month,
          revenue:    Number(r.revenue) || 0,
        })));
      }
      if (commRes.status === "fulfilled" && commRes.value.data.success) {
        const raw = commRes.value.data.data || [];
        setComm(raw.map(r => ({
          month:    r.month,
          paid:     Number(r.paid_commissions)    || 0,
          pending:  Number(r.pending_commissions) || 0,
        })));
      }
    } catch {
      setError("Failed to load analytics. Please refresh.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── CSV export (no xlsx dependency needed for simple export) ─────────────
  const exportCSV = (filename, headers, rows) => {
    const lines = [headers.join(","), ...rows.map(r => r.map(v => `"${v}"`).join(","))];
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const doExport = async (key, fn) => {
    setExporting(key);
    setExportErr("");
    try { fn(); }
    catch (e) { setExportErr(e.message || "Export failed."); }
    finally { setExporting(""); }
  };

  const exportMonthly = () => doExport("monthly", () =>
    exportCSV(
      `pyonea-monthly-revenue-${new Date().toISOString().slice(0,10)}.csv`,
      ["Month", "Revenue (MMK)"],
      monthly.map(r => [r.month, r.revenue])
    )
  );

  const exportCommissions = () => doExport("commissions", () =>
    exportCSV(
      `pyonea-commissions-${new Date().toISOString().slice(0,10)}.csv`,
      ["Month", "Paid (MMK)", "Pending (MMK)"],
      commissions.map(r => [r.month, r.paid, r.pending])
    )
  );

  const exportSummary = () => doExport("summary", () =>
    exportCSV(
      `pyonea-summary-${new Date().toISOString().slice(0,10)}.csv`,
      ["Metric", "Value"],
      [
        ["Total Users",       stats?.total_users       ?? 0],
        ["Active Users",      stats?.active_users      ?? 0],
        ["Total Products",    stats?.total_products    ?? 0],
        ["Active Products",   stats?.active_products   ?? 0],
        ["Total Orders",      stats?.total_orders      ?? 0],
        ["Pending Orders",    stats?.pending_orders    ?? 0],
        ["Completed Orders",  stats?.completed_orders  ?? 0],
        ["Total Revenue MMK", stats?.total_revenue     ?? 0],
        ["Pending Commissions MMK", stats?.pending_commissions ?? 0],
        ["Paid Commissions MMK",    stats?.paid_commissions    ?? 0],
      ]
    )
  );

  // ── Merge monthly revenue + commissions for the combined chart ─────────────
  const combinedChart = monthly.map(mr => {
    const cm = commissions.find(c => c.month === mr.month) || { paid: 0, pending: 0 };
    return { month: mr.month, revenue: mr.revenue, paid: cm.paid, pending: cm.pending };
  });

  const totalRevenue     = monthly.reduce((s, r) => s + r.revenue, 0);
  const totalPaid        = commissions.reduce((s, r) => s + r.paid, 0);
  const totalPending     = commissions.reduce((s, r) => s + r.pending, 0);

  if (loading)
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-500" />
      </div>
    );

  if (error)
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-3">
        {error}
        <button onClick={fetchAll} className="underline font-medium">Retry</button>
      </div>
    );

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Revenue Analytics</h2>
          <p className="text-sm text-gray-500 mt-0.5">Platform revenue, commissions and order trends</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <ExportBtn label="Export Summary"     onClick={exportSummary}     disabled={!!exporting} />
          <ExportBtn label="Export Monthly"     onClick={exportMonthly}     disabled={!!exporting} />
          <ExportBtn label="Export Commissions" onClick={exportCommissions} disabled={!!exporting} />
        </div>
      </div>

      {/* Export error inline */}
      {exportErr && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {exportErr}
        </div>
      )}

      {/* ── KPI cards — from /admin/stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPI label="Total Revenue"        value={fmtMMK(stats?.total_revenue)}         color="text-emerald-700" bg="bg-emerald-50" />
        <KPI label="Paid Commissions"     value={fmtMMK(stats?.paid_commissions)}      color="text-teal-700"    bg="bg-teal-50"    />
        <KPI label="Pending Commissions"  value={fmtMMK(stats?.pending_commissions)}   color="text-amber-700"   bg="bg-amber-50"   />
        <KPI label="Total Orders"         value={(stats?.total_orders ?? 0).toLocaleString()} color="text-blue-700" bg="bg-blue-50" />
      </div>

      {/* ── Stats grid — users / products ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Users",      value: stats?.total_users     ?? 0 },
          { label: "Active Users",     value: stats?.active_users    ?? 0 },
          { label: "Total Products",   value: stats?.total_products  ?? 0 },
          { label: "Pending Orders",   value: stats?.pending_orders  ?? 0 },
        ].map(s => (
          <div key={s.label} className="bg-white border border-gray-100 rounded-xl p-4">
            <p className="text-xs font-medium text-gray-500">{s.label}</p>
            <p className="text-xl font-bold text-gray-900 mt-1">{Number(s.value).toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* ── Monthly revenue chart ── */}
      {monthly.length > 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700">Monthly Order Revenue (Last 12 months)</h3>
            <ExportBtn label="Export" onClick={exportMonthly} disabled={!!exporting} />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#666" }} />
                <YAxis tickFormatter={fmtK} tick={{ fontSize: 10, fill: "#666" }} />
                <Tooltip formatter={(v) => [fullMMK(v), "Revenue"]} />
                <Bar dataKey="revenue" name="Revenue" fill="#10b981" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 p-10 text-center text-gray-400 text-sm">
          No revenue data yet. Revenue will appear here once orders are delivered.
        </div>
      )}

      {/* ── Commission trend chart ── */}
      {commissions.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700">Commission Trend (Last 12 months)</h3>
            <ExportBtn label="Export" onClick={exportCommissions} disabled={!!exporting} />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={commissions} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#666" }} />
                <YAxis tickFormatter={fmtK} tick={{ fontSize: 10, fill: "#666" }} />
                <Tooltip formatter={(v, name) => [fullMMK(v), name]} />
                <Legend />
                <Line dataKey="paid"    name="Paid"    stroke="#10b981" strokeWidth={2} dot={false} />
                <Line dataKey="pending" name="Pending" stroke="#f59e0b" strokeWidth={2} dot={false} strokeDasharray="4 2" />
              </LineChart>
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
                  {["Month", "Revenue (MMK)", "Paid Commission", "Pending Commission"].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {combinedChart.map(r => (
                  <tr key={r.month} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5 font-medium text-gray-900">{r.month}</td>
                    <td className="px-4 py-2.5 font-semibold text-emerald-700">{fullMMK(r.revenue)}</td>
                    <td className="px-4 py-2.5 text-teal-700">{fullMMK(r.paid)}</td>
                    <td className="px-4 py-2.5 text-amber-700">{fullMMK(r.pending)}</td>
                  </tr>
                ))}
                <tr className="bg-gray-50 font-semibold">
                  <td className="px-4 py-2.5 text-gray-700">Total</td>
                  <td className="px-4 py-2.5 text-emerald-700">{fullMMK(totalRevenue)}</td>
                  <td className="px-4 py-2.5 text-teal-700">{fullMMK(totalPaid)}</td>
                  <td className="px-4 py-2.5 text-amber-700">{fullMMK(totalPending)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsManagement;