// components/seller/ProductOptionsEditor.jsx
// Seller-facing UI for defining product options (Color, Size, etc.)
// and their predefined values before generating/creating variants.
//
// Props:
//   productId  — the product ID (required; options are saved via API)
//   onSaved    — () => void  called after options are successfully saved

import React, { useState, useEffect } from "react";
import api from "../../utils/api";
import {
  PlusIcon,
  TrashIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowsUpDownIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";

// ── constants ─────────────────────────────────────────────────────────────────

const OPTION_TYPES = [
  { value: "color",  label: "Color",       hint: "Shows colour swatches. Add a hex code per value." },
  { value: "size",   label: "Size",        hint: "Shows S/M/L/XL pill buttons." },
  { value: "text",   label: "Text",        hint: "Shows plain text pill buttons." },
  { value: "image",  label: "Image",       hint: "Shows thumbnail swatches. Add an image URL per value." },
  { value: "input",  label: "Custom Input",hint: "Buyer types a value (e.g. engraving text). No predefined values needed." },
];

const emptyOption = () => ({
  _id: Math.random().toString(36).slice(2),  // local key only
  name: "",
  type: "text",
  is_required: true,
  values: [],
});

const emptyValue = () => ({
  _id: Math.random().toString(36).slice(2),
  label: "",
  value: "",
  meta: {},
});

// ── helper ────────────────────────────────────────────────────────────────────

const slugify = (str) =>
  str.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

// ── sub-components ────────────────────────────────────────────────────────────

const ValueRow = ({ optType, val, onChange, onRemove }) => (
  <div className="flex items-center gap-2 py-1.5 group">
    <div className="flex-1 grid grid-cols-2 gap-2">
      {/* Label */}
      <input
        type="text"
        placeholder="Label (e.g. Red)"
        value={val.label}
        onChange={(e) => {
          onChange({ ...val, label: e.target.value, value: slugify(e.target.value) });
        }}
        className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm
                   bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100
                   focus:ring-2 focus:ring-green-500 focus:border-transparent"
      />
      {/* Hex colour / image URL */}
      {optType === "color" && (
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={val.meta?.hex ?? "#000000"}
            onChange={(e) => onChange({ ...val, meta: { ...val.meta, hex: e.target.value } })}
            className="h-9 w-12 rounded cursor-pointer border border-gray-300 dark:border-slate-600 bg-transparent"
            title="Pick colour"
          />
          <input
            type="text"
            placeholder="#000000"
            value={val.meta?.hex ?? ""}
            onChange={(e) => onChange({ ...val, meta: { ...val.meta, hex: e.target.value } })}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm
                       bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100
                       focus:ring-2 focus:ring-green-500"
          />
        </div>
      )}
      {optType === "image" && (
        <input
          type="url"
          placeholder="https://…/image.jpg"
          value={val.meta?.image_url ?? ""}
          onChange={(e) => onChange({ ...val, meta: { ...val.meta, image_url: e.target.value } })}
          className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm
                     bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100
                     focus:ring-2 focus:ring-green-500"
        />
      )}
      {optType !== "color" && optType !== "image" && (
        <input
          type="text"
          placeholder="Slug (auto-filled)"
          value={val.value}
          onChange={(e) => onChange({ ...val, value: slugify(e.target.value) })}
          className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm
                     bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-400
                     focus:ring-2 focus:ring-green-500"
        />
      )}
    </div>
    <button
      type="button"
      onClick={onRemove}
      className="p-1.5 text-gray-400 hover:text-red-500 rounded opacity-0 group-hover:opacity-100 transition-opacity"
    >
      <TrashIcon className="h-4 w-4" />
    </button>
  </div>
);

const OptionBlock = ({ option, onChange, onRemove }) => {
  const [open, setOpen] = useState(true);
  const typeInfo = OPTION_TYPES.find((t) => t.value === option.type);

  const addValue = () =>
    onChange({ ...option, values: [...option.values, emptyValue()] });

  const updateValue = (idx, updated) => {
    const values = [...option.values];
    values[idx] = updated;
    onChange({ ...option, values });
  };

  const removeValue = (idx) =>
    onChange({ ...option, values: option.values.filter((_, i) => i !== idx) });

  return (
    <div className="border border-gray-200 dark:border-slate-600 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-slate-800 cursor-pointer select-none"
           onClick={() => setOpen((v) => !v)}>
        <ArrowsUpDownIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />

        <input
          type="text"
          placeholder="Option name (e.g. Color)"
          value={option.name ?? ""}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => onChange({ ...option, name: e.target.value })}
          className="flex-1 px-3 py-1.5 border border-gray-300 dark:border-slate-500 rounded-lg
                     text-sm font-semibold bg-white dark:bg-slate-700
                     text-gray-800 dark:text-slate-200 placeholder-gray-400
                     focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />

        <select
          value={option.type}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => onChange({ ...option, type: e.target.value, values: [] })}
          className="text-xs border border-gray-300 dark:border-slate-600 rounded-lg px-2 py-1
                     bg-white dark:bg-slate-700 text-gray-700 dark:text-slate-300"
        >
          {OPTION_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>

        <label className="flex items-center gap-1 text-xs text-gray-500 dark:text-slate-400"
               onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={option.is_required}
            onChange={(e) => onChange({ ...option, is_required: e.target.checked })}
            className="rounded text-green-600"
          />
          Required
        </label>

        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="p-1.5 text-gray-400 hover:text-red-500 rounded"
        >
          <TrashIcon className="h-4 w-4" />
        </button>

        {open
          ? <ChevronUpIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
          : <ChevronDownIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />}
      </div>

      {/* Body */}
      {open && (
        <div className="px-4 py-3 bg-white dark:bg-slate-900 space-y-1">
          <p className="text-xs text-gray-500 dark:text-slate-400 mb-2">{typeInfo?.hint}</p>

          {option.type !== "input" ? (
            <>
              {/* Column headers */}
              {option.values.length > 0 && (
                <div className="grid grid-cols-2 gap-2 text-xs font-medium text-gray-500 dark:text-slate-400 px-0 mb-1">
                  <span>Label</span>
                  <span>{option.type === "color" ? "Hex colour" : option.type === "image" ? "Image URL" : "Slug"}</span>
                </div>
              )}

              {option.values.map((val, idx) => (
                <ValueRow
                  key={val._id}
                  optType={option.type}
                  val={val}
                  onChange={(updated) => updateValue(idx, updated)}
                  onRemove={() => removeValue(idx)}
                />
              ))}

              <button
                type="button"
                onClick={addValue}
                className="mt-2 flex items-center gap-1 text-sm text-green-600 dark:text-green-400
                           hover:text-green-700 font-medium"
              >
                <PlusIcon className="h-4 w-4" /> Add value
              </button>
            </>
          ) : (
            <p className="text-sm text-gray-500 dark:text-slate-400 italic">
              No predefined values — the buyer will type their own.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

// ── main component ────────────────────────────────────────────────────────────

const ProductOptionsEditor = ({ productId, onSaved }) => {
  const [options, setOptions] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load existing options when editing
  useEffect(() => {
    if (!productId) return;
    api.get(`/seller/products/${productId}/options`)
      .then((res) => {
        const loaded = (res.data.data ?? []).map((opt) => ({
          ...opt,
          _id: String(opt.id),
          values: (opt.values ?? []).map((v) => ({ ...v, _id: String(v.id) })),
        }));
        if (loaded.length > 0) setOptions(loaded);
      })
      .catch(() => {}); // Silently ignore — new product has no options yet
  }, [productId]);

  const addOption = () =>
    setOptions((prev) => [...prev, emptyOption()]);

  const updateOption = (idx, updated) => {
    const next = [...options];
    next[idx] = updated;
    setOptions(next);
  };

  const removeOption = (idx) =>
    setOptions((prev) => prev.filter((_, i) => i !== idx));

  const handleSave = async () => {
    setError("");
    setSuccess("");

    // Basic validation
    for (let i = 0; i < options.length; i++) {
      const opt = options[i];
      if (!opt.name || !String(opt.name).trim()) {
        setError(`Option #${i + 1} is missing a name. Fill it in or remove it.`);
        return;
      }
      if (opt.type !== "input" && opt.values.length === 0) {
        setError(`Option "${opt.name}" needs at least one value.`);
        return;
      }
      for (const v of opt.values) {
        if (!v.label || !v.label.trim()) {
          setError(`All values in option "${opt.name}" need a label.`);
          return;
        }
      }
    }

    setSaving(true);
    try {
      await api.post(`/seller/products/${productId}/options`, {
        options: options.map((opt, i) => ({
          name:        opt.name,
          type:        opt.type,
          position:    i + 1,
          is_required: opt.is_required,
          values: (opt.values ?? []).map((v, vi) => ({
            label:    v.label,
            value:    v.value || slugify(v.label),
            meta:     Object.keys(v.meta ?? {}).length > 0 ? v.meta : null,
            position: vi + 1,
          })),
        })),
      });
      setSuccess("Options saved! Now generate your variants below.");
      onSaved?.();
    } catch (err) {
      const msgs = err.response?.data?.errors
        ? Object.values(err.response.data.errors).flat().join(", ")
        : err.response?.data?.message ?? "Failed to save options.";
      setError(msgs);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-slate-100">
            Product Options
          </h3>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
            Define the choices buyers can select (e.g. Color, Size).
          </p>
        </div>
        <button
          type="button"
          onClick={addOption}
          className="flex items-center gap-1.5 px-3 py-2 bg-green-600 text-white
                     rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
        >
          <PlusIcon className="h-4 w-4" /> Add Option
        </button>
      </div>

      {options.length === 0 && (
        <div className="text-center py-10 border-2 border-dashed border-gray-300 dark:border-slate-600
                        rounded-xl text-gray-400 dark:text-slate-500">
          <p className="text-sm">No options yet.</p>
          <p className="text-xs mt-1">Click "Add Option" to define Color, Size, etc.</p>
        </div>
      )}

      <div className="space-y-3">
        {options.map((opt, idx) => (
          <OptionBlock
            key={opt._id}
            option={opt}
            onChange={(updated) => updateOption(idx, updated)}
            onRemove={() => removeOption(idx)}
          />
        ))}
      </div>

      {error && (
        <div className="flex items-start gap-2 text-sm text-red-600 dark:text-red-400
                        bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700
                        rounded-lg px-3 py-2">
          <ExclamationCircleIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-start gap-2 text-sm text-green-700 dark:text-green-400
                        bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700
                        rounded-lg px-3 py-2">
          <CheckCircleIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
          {success}
        </div>
      )}

      {options.length > 0 && (
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="w-full py-2.5 bg-green-600 text-white rounded-lg font-medium text-sm
                     hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          {saving ? "Saving…" : "Save Options"}
        </button>
      )}
    </div>
  );
};

export default ProductOptionsEditor;