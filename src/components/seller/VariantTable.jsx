// components/seller/VariantTable.jsx
// Editable table of generated variants for the seller.
// Each row lets the seller set price, quantity, moq, sku, and toggle active.
//
// Props:
//   productId    — the product ID
//   onUpdated    — () => void  called after any variant save

import React, { useState, useEffect, useCallback } from "react";
import api from "../../utils/api";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";

// ── helpers ───────────────────────────────────────────────────────────────────

const fmt = (n) => (n == null ? "" : String(n));

// ── sub-component: single editable cell ──────────────────────────────────────

const EditableCell = ({ value, type = "text", min, step, onChange, className = "" }) => (
  <input
    type={type}
    min={min}
    step={step}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className={`w-full px-2 py-1.5 border border-gray-200 dark:border-slate-600 rounded-lg text-sm
               bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100
               focus:ring-2 focus:ring-green-500 focus:border-transparent ${className}`}
  />
);

// ── main component ────────────────────────────────────────────────────────────

const VariantTable = ({ productId, onUpdated }) => {
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [genDefaults, setGenDefaults] = useState({ price: "", quantity: "0", moq: "" });
  const [saving, setSaving] = useState({}); // { [variantId]: bool }
  const [errors, setErrors] = useState({});  // { [variantId]: string }
  const [globalError, setGlobalError] = useState("");
  const [showGenForm, setShowGenForm] = useState(false);

  const fetchVariants = useCallback(async () => {
    if (!productId) return;
    setLoading(true);
    try {
      const res = await api.get(`/seller/products/${productId}/variants`);
      setVariants(res.data.data ?? []);
    } catch {
      setGlobalError("Failed to load variants.");
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => { fetchVariants(); }, [fetchVariants]);

  // ── local state per row ────────────────────────────────────────────────────

  const [edits, setEdits] = useState({});

  useEffect(() => {
    const init = {};
    variants.forEach((v) => {
      if (!edits[v.id]) {
        init[v.id] = {
          price:         fmt(v.price),
          quantity:      fmt(v.quantity),
          quantity_unit: v.quantity_unit ?? "",
          moq:           fmt(v.moq),
          sku:           v.sku ?? "",
          is_active:     v.is_active,
        };
      }
    });
    if (Object.keys(init).length > 0) {
      setEdits((prev) => ({ ...prev, ...init }));
    }
  }, [variants]);

  const updateEdit = (variantId, field, value) => {
    setEdits((prev) => ({
      ...prev,
      [variantId]: { ...prev[variantId], [field]: value },
    }));
  };

  // ── save single variant ────────────────────────────────────────────────────

  const saveVariant = async (variant) => {
    const row = edits[variant.id];
    if (!row) return;

    setSaving((prev) => ({ ...prev, [variant.id]: true }));
    setErrors((prev) => ({ ...prev, [variant.id]: "" }));

    try {
      await api.put(`/seller/products/${productId}/variants/${variant.id}`, {
        price:         parseFloat(row.price),
        quantity:      parseFloat(row.quantity),
        quantity_unit: row.quantity_unit || null,
        moq:           row.moq ? parseInt(row.moq) : null,
        sku:           row.sku || null,
        is_active:     row.is_active,
      });
      onUpdated?.();
    } catch (err) {
      const msg = err.response?.data?.message ?? "Save failed.";
      setErrors((prev) => ({ ...prev, [variant.id]: msg }));
    } finally {
      setSaving((prev) => ({ ...prev, [variant.id]: false }));
    }
  };

  // ── toggle active ──────────────────────────────────────────────────────────

  const toggleActive = async (variant) => {
    try {
      const res = await api.patch(
        `/seller/products/${productId}/variants/${variant.id}/toggle`
      );
      setVariants((prev) =>
        prev.map((v) =>
          v.id === variant.id ? { ...v, is_active: res.data.is_active } : v
        )
      );
      updateEdit(variant.id, "is_active", res.data.is_active);
      onUpdated?.();
    } catch {
      setErrors((prev) => ({ ...prev, [variant.id]: "Toggle failed." }));
    }
  };

  // ── delete variant ─────────────────────────────────────────────────────────

  const deleteVariant = async (variant) => {
    if (!window.confirm(`Delete variant "${variant.label}"?`)) return;
    try {
      await api.delete(`/seller/products/${productId}/variants/${variant.id}`);
      setVariants((prev) => prev.filter((v) => v.id !== variant.id));
      onUpdated?.();
    } catch {
      setErrors((prev) => ({ ...prev, [variant.id]: "Delete failed." }));
    }
  };

  // ── generate combinations ──────────────────────────────────────────────────

  const generateVariants = async () => {
    if (!genDefaults.price) {
      setGlobalError("Please enter a default price before generating.");
      return;
    }
    setGenerating(true);
    setGlobalError("");
    try {
      await api.post(`/seller/products/${productId}/variants/generate`, {
        price:    parseFloat(genDefaults.price),
        quantity: parseFloat(genDefaults.quantity || "0"),
        moq:      genDefaults.moq ? parseInt(genDefaults.moq) : null,
      });
      await fetchVariants();
      setShowGenForm(false);
      onUpdated?.();
    } catch (err) {
      setGlobalError(err.response?.data?.message ?? "Generation failed.");
    } finally {
      setGenerating(false);
    }
  };

  // ── render ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-500 dark:text-slate-400 text-sm py-6 justify-center">
        <ArrowPathIcon className="h-4 w-4 animate-spin" /> Loading variants…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-slate-100">
            Variants
            {variants.length > 0 && (
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({variants.length} total)
              </span>
            )}
          </h3>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
            Each row is one purchasable combination. Set price and stock per variant.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => { setShowGenForm((v) => !v); setGlobalError(""); }}
            className="flex items-center gap-1.5 px-3 py-2 bg-green-600 text-white
                       rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
          >
            <PlusIcon className="h-4 w-4" />
            {variants.length > 0 ? "Generate More" : "Generate Variants"}
          </button>
          <button
            type="button"
            onClick={fetchVariants}
            className="p-2 border border-gray-300 dark:border-slate-600 rounded-lg
                       text-gray-500 hover:text-gray-700 transition-colors"
            title="Refresh"
          >
            <ArrowPathIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Generate defaults form */}
      {showGenForm && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700
                        rounded-xl p-4 space-y-3">
          <p className="text-sm font-medium text-green-800 dark:text-green-300">
            Auto-generate all option combinations. Set defaults applied to every new variant:
          </p>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1">
                Default Price *
              </label>
              <input
                type="number" min="0" step="0.01"
                value={genDefaults.price}
                onChange={(e) => setGenDefaults((p) => ({ ...p, price: e.target.value }))}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm
                           bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1">
                Default Qty
              </label>
              <input
                type="number" min="0" step="0.001"
                value={genDefaults.quantity}
                onChange={(e) => setGenDefaults((p) => ({ ...p, quantity: e.target.value }))}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm
                           bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1">
                Default MOQ
              </label>
              <input
                type="number" min="1"
                value={genDefaults.moq}
                onChange={(e) => setGenDefaults((p) => ({ ...p, moq: e.target.value }))}
                placeholder="Inherit"
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm
                           bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setShowGenForm(false)}
              className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm text-gray-600 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={generateVariants}
              disabled={generating}
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium
                         hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {generating ? "Generating…" : "Generate"}
            </button>
          </div>
        </div>
      )}

      {globalError && (
        <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400
                        bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg px-3 py-2">
          <ExclamationCircleIcon className="h-4 w-4 flex-shrink-0" />
          {globalError}
        </div>
      )}

      {variants.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed border-gray-200 dark:border-slate-700
                        rounded-xl text-gray-400 dark:text-slate-500 text-sm">
          No variants yet. Save your options first, then click "Generate Variants".
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-slate-700">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-slate-800 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left">Variant</th>
                <th className="px-3 py-3 text-left w-28">Price</th>
                <th className="px-3 py-3 text-left w-24">Qty</th>
                <th className="px-3 py-3 text-left w-20">Unit</th>
                <th className="px-3 py-3 text-left w-20">MOQ</th>
                <th className="px-3 py-3 text-left w-32">SKU</th>
                <th className="px-3 py-3 text-center w-20">Active</th>
                <th className="px-3 py-3 text-right w-28">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {variants.map((variant) => {
                const row = edits[variant.id] ?? {};
                const isSaving = saving[variant.id];
                const rowErr = errors[variant.id];

                return (
                  <React.Fragment key={variant.id}>
                    <tr className={`bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors
                                   ${!row.is_active ? "opacity-60" : ""}`}>
                      {/* Variant label */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          {variant.option_values?.map((ov) => (
                            <span key={ov.value_id}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs
                                             bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300">
                              {ov.option_type === "color" && ov.meta?.hex && (
                                <span className="inline-block w-3 h-3 rounded-full border border-gray-300"
                                      style={{ backgroundColor: ov.meta.hex }} />
                              )}
                              {ov.label}
                            </span>
                          ))}
                        </div>
                      </td>
                      {/* Price */}
                      <td className="px-3 py-2">
                        <EditableCell type="number" min="0" step="0.01"
                          value={row.price ?? ""} onChange={(v) => updateEdit(variant.id, "price", v)} />
                      </td>
                      {/* Qty */}
                      <td className="px-3 py-2">
                        <EditableCell type="number" min="0" step="0.001"
                          value={row.quantity ?? ""} onChange={(v) => updateEdit(variant.id, "quantity", v)} />
                      </td>
                      {/* Unit */}
                      <td className="px-3 py-2">
                        <EditableCell value={row.quantity_unit ?? ""}
                          onChange={(v) => updateEdit(variant.id, "quantity_unit", v)} />
                      </td>
                      {/* MOQ */}
                      <td className="px-3 py-2">
                        <EditableCell type="number" min="1"
                          value={row.moq ?? ""} onChange={(v) => updateEdit(variant.id, "moq", v)} />
                      </td>
                      {/* SKU */}
                      <td className="px-3 py-2">
                        <EditableCell value={row.sku ?? ""}
                          onChange={(v) => updateEdit(variant.id, "sku", v)} />
                      </td>
                      {/* Active toggle */}
                      <td className="px-3 py-2 text-center">
                        <button type="button" onClick={() => toggleActive(variant)}
                          className={`w-10 h-5 rounded-full transition-colors relative ${
                            row.is_active ? "bg-green-500" : "bg-gray-300 dark:bg-slate-600"
                          }`}>
                          <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                            row.is_active ? "left-5" : "left-0.5"
                          }`} />
                        </button>
                      </td>
                      {/* Actions */}
                      <td className="px-3 py-2">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => saveVariant(variant)}
                            disabled={isSaving}
                            className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium
                                       hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center gap-1"
                          >
                            {isSaving ? (
                              <ArrowPathIcon className="h-3 w-3 animate-spin" />
                            ) : (
                              <CheckCircleIcon className="h-3 w-3" />
                            )}
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteVariant(variant)}
                            className="px-2 py-1.5 text-red-500 hover:text-red-700 text-xs rounded-lg
                                       hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          >
                            Del
                          </button>
                        </div>
                      </td>
                    </tr>
                    {rowErr && (
                      <tr className="bg-white dark:bg-slate-900">
                        <td colSpan={8} className="px-4 pb-2">
                          <span className="text-xs text-red-500">{rowErr}</span>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default VariantTable;