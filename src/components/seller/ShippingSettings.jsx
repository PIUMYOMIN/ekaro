import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import api from "../../utils/api";
import {
  TruckIcon, CheckCircleIcon, XCircleIcon, ArrowPathIcon,
  PlusIcon, TrashIcon,
} from "@heroicons/react/24/outline";

const ShippingSettings = ({ storeData }) => {
  const { t } = useTranslation();
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [toast, setToast]       = useState(null);
  const [settings, setSettings] = useState({
    enabled:                 false,
    free_shipping_threshold: 0,
    default_shipping_fee:    5000,
    processing_time:         "1-2 days",
    shipping_notes:          "",
  });

  const flash = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Fetch shipping settings from backend (self-contained — not relying on storeData prop)
  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/seller/shipping/settings");
      if (res.data.success) {
        const d = res.data.data || {};
        setSettings({
          enabled:                 d.enabled                 ?? false,
          free_shipping_threshold: d.free_shipping_threshold ?? 0,
          default_shipping_fee:    d.default_shipping_fee    ?? 5000,
          processing_time:         d.processing_time         ?? "1-2 days",
          shipping_notes:          d.shipping_notes          ?? "",
        });
      }
    } catch {
      // Fallback to storeData prop if available
      if (storeData) {
        setSettings(prev => ({
          ...prev,
          enabled:                 storeData.shipping_enabled          ?? false,
          free_shipping_threshold: storeData.free_shipping_threshold   ?? 0,
        }));
      }
    } finally {
      setLoading(false);
    }
  }, [storeData]);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const handleToggle = () => setSettings(p => ({ ...p, enabled: !p.enabled }));

  const set = (k, v) => setSettings(p => ({ ...p, [k]: v }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put("/seller/shipping/settings", settings);
      if (res.data.success) {
        flash("Shipping settings saved successfully.");
      } else {
        // Show first validation error if present, else message
        const errs = res.data.errors;
        const firstErr = errs ? Object.values(errs).flat()[0] : null;
        flash(firstErr || res.data.message || "Failed to save.", "error");
      }
    } catch (err) {
      const errs = err.response?.data?.errors;
      const firstErr = errs ? Object.values(errs).flat()[0] : null;
      flash(firstErr || err.response?.data?.message || "Failed to save shipping settings.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-green-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100 flex items-center gap-2">
            <TruckIcon className="h-5 w-5 text-green-600" />
            Shipping Settings
          </h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
            Configure how your store handles shipping and delivery.
          </p>
        </div>
        <button onClick={fetchSettings}
          className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowPathIcon className="h-4 w-4" />
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`flex items-center gap-2 p-3 rounded-xl text-sm font-medium
          ${toast.type === "success"
            ? "bg-green-50 border border-green-200 text-green-800"
            : "bg-red-50 border border-red-200 text-red-700"}`}>
          {toast.type === "success"
            ? <CheckCircleIcon className="h-4 w-4" />
            : <XCircleIcon className="h-4 w-4" />}
          {toast.msg}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-5">

        {/* Enable toggle */}
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-slate-100">Enable Shipping</h3>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                Allow buyers to have orders shipped to their address.
              </p>
            </div>
            <button type="button" onClick={handleToggle}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full transition-colors duration-200
                          focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1
                          ${settings.enabled ? "bg-green-500" : "bg-gray-300"}`}
              role="switch" aria-checked={settings.enabled}>
              <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white
                                shadow transition duration-200 ${settings.enabled ? "translate-x-5" : "translate-x-0"}`} />
            </button>
          </div>
        </div>

        {/* Settings (only when enabled) */}
        {settings.enabled && (
          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-5 space-y-5">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300 border-b border-gray-100 dark:border-slate-700 pb-3">
              Shipping Configuration
            </h3>

            {/* Default shipping fee */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1">
                Default Shipping Fee (MMK)
              </label>
              <input
                type="number" min="0" step="100"
                value={settings.default_shipping_fee}
                onChange={e => set("default_shipping_fee", Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500"
              />
              <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
                Used when no delivery zone matches the buyer's location.
              </p>
            </div>

            {/* Free shipping threshold */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1">
                Free Shipping Threshold (MMK) — 0 to disable
              </label>
              <input
                type="number" min="0" step="1000"
                value={settings.free_shipping_threshold}
                onChange={e => set("free_shipping_threshold", Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500"
              />
              <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
                Orders above this amount qualify for free shipping.
              </p>
            </div>

            {/* Processing time */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1">
                Processing Time
              </label>
              <select
                value={settings.processing_time}
                onChange={e => set("processing_time", e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-xl
                           focus:ring-2 focus:ring-green-500 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100">
                <option value="same_day">Same day</option>
                <option value="1_2_days">1–2 days</option>
                <option value="3_5_days">3–5 days</option>
                <option value="5_7_days">5–7 days</option>
                <option value="custom">Custom (specify in notes)</option>
              </select>
            </div>

            {/* Shipping notes */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1">
                Shipping Notes (shown to buyers)
              </label>
              <textarea
                rows={3}
                value={settings.shipping_notes}
                onChange={e => set("shipping_notes", e.target.value)}
                placeholder="e.g. We ship nationwide. Remote areas may take additional time."
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-green-500 resize-none bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500"
              />
            </div>
          </div>
        )}

        {/* Save */}
        <button type="submit" disabled={saving}
          className="w-full py-3 bg-green-600 text-white text-sm font-semibold rounded-xl
                     hover:bg-green-700 disabled:opacity-50 transition-colors">
          {saving ? "Saving…" : "Save Shipping Settings"}
        </button>
      </form>
    </div>
  );
};

export default ShippingSettings;