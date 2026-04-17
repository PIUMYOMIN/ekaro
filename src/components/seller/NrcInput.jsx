// src/components/seller/NrcInput.jsx
// Myanmar NRC (National Registration Card) structured input.
//
// All township data is stored in src/data/nrc-townships.json
// — do not embed data here; edit the JSON file instead.
//
// NRC format: {division}/{township_code}({type}){number}
// Example EN:  8/KaPaTa(N)123456
// Example MM:  ၈/ကပတ(နိုင်)၁၂၃၄၅၆

import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import nrcData from '../../data/nrc-townships.json';

// Re-export so other components (e.g. SellerVerificationManagement) can import
export const NRC_DIVISIONS = nrcData.divisions;
export const NRC_TYPES     = nrcData.types;
export const NRC_TOWNSHIPS = nrcData.townships;

// ── Helpers ───────────────────────────────────────────────────────────────────
const MM_DIGITS = '၀၁၂၃၄၅၆၇၈၉';
const toMM = (str) => String(str).replace(/\d/g, d => MM_DIGITS[d]);

const SELECT_CLS = [
  'w-full px-3 py-2 text-sm border border-gray-300 dark:border-slate-600',
  'rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100',
  'focus:ring-2 focus:ring-green-500 focus:outline-none',
].join(' ');

const LABEL_CLS = 'block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1';

// ── Component ─────────────────────────────────────────────────────────────────
export default function NrcInput({ value = {}, onChange, error = {} }) {
  const { i18n } = useTranslation();
  const isMM = i18n.language === 'my';

  const townships = useMemo(
    () => NRC_TOWNSHIPS[value.nrc_division] || [],
    [value.nrc_division]
  );

  const preview = useMemo(() => {
    const { nrc_division: d, nrc_township_code: tc,
            nrc_township_mm: tmm, nrc_type: tp, nrc_number: num } = value;
    if (!d || !tc || !tp || !num) return null;
    const typeLabel = NRC_TYPES.find(t => t.value === tp)?.mm || tp;
    return {
      en: `${d}/${tc}(${tp})${num}`,
      mm: tmm ? `${toMM(d)}/${tmm}(${typeLabel})${toMM(num)}` : null,
    };
  }, [value]);

  const handleDivision = (e) =>
    onChange({ ...value, nrc_division: e.target.value, nrc_township_code: '', nrc_township_mm: '' });

  const handleTownship = (e) => {
    const t = townships.find(t => t.code === e.target.value);
    onChange({ ...value, nrc_township_code: t?.code || '', nrc_township_mm: t?.mm || '' });
  };

  const set = (field) => (e) => onChange({ ...value, [field]: e.target.value });

  return (
    <div className="space-y-4">

      {/* Title */}
      <div>
        <span className="block text-sm font-semibold text-gray-800 dark:text-slate-200">
          Myanmar NRC Number
          <span className="ml-1 text-xs font-normal text-gray-400 dark:text-slate-500">
            — မှတ်ပုံတင်နံပါတ်
          </span>
        </span>
        <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
          {isMM
            ? 'တိုင်းဒေသကြီး / ပြည်နယ်၊ မြို့နယ်ကုဒ်၊ အမျိုးအစားနှင့် နံပါတ် ရွေးချယ်ပါ'
            : 'Select division, township code, ID type, then enter the serial number'}
        </p>
      </div>

      {/* Row 1: Division + Township + Type */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">

        {/* Division */}
        <div>
          <label className={LABEL_CLS}>
            {isMM ? 'တိုင်း / ပြည်နယ်' : 'Division'}
            <span className="text-red-500 ml-0.5">*</span>
          </label>
          <select value={value.nrc_division || ''} onChange={handleDivision} className={SELECT_CLS}>
            <option value="">{isMM ? 'ရွေးချယ်ပါ' : 'Select'}</option>
            {NRC_DIVISIONS.map(d => (
              <option key={d.value} value={d.value}>
                {d.value}/ — {isMM ? d.mm : d.en}
              </option>
            ))}
          </select>
          {error.nrc_division && <p className="text-xs text-red-500 mt-1">{error.nrc_division}</p>}
        </div>

        {/* Township code */}
        <div className="sm:col-span-2">
          <label className={LABEL_CLS}>
            {isMM ? 'မြို့နယ်ကုဒ်' : 'Township Code'}
            <span className="text-red-500 ml-0.5">*</span>
          </label>
          <select
            value={value.nrc_township_code || ''}
            onChange={handleTownship}
            disabled={!value.nrc_division}
            className={SELECT_CLS + (!value.nrc_division ? ' opacity-50 cursor-not-allowed' : '')}
          >
            <option value="">
              {!value.nrc_division
                ? (isMM ? 'တိုင်းဒေသကြီးအရင်ရွေးပါ' : 'Select division first')
                : (isMM ? 'မြို့နယ်ကုဒ်ရွေးချယ်ပါ' : 'Select township code')}
            </option>
            {townships.map(t => (
              <option key={t.code} value={t.code}>
                {t.code} / {t.mm} — {t.township}
              </option>
            ))}
          </select>
          {error.nrc_township_code && <p className="text-xs text-red-500 mt-1">{error.nrc_township_code}</p>}
        </div>

        {/* ID Type */}
        <div>
          <label className={LABEL_CLS}>
            {isMM ? 'အမျိုးအစား' : 'ID Type'}
            <span className="text-red-500 ml-0.5">*</span>
          </label>
          <select value={value.nrc_type || ''} onChange={set('nrc_type')} className={SELECT_CLS}>
            <option value="">{isMM ? 'ရွေးချယ်ပါ' : 'Select'}</option>
            {NRC_TYPES.map(t => (
              <option key={t.value} value={t.value}>
                {t.en} ({t.mm}) — {t.label}
              </option>
            ))}
          </select>
          {error.nrc_type && <p className="text-xs text-red-500 mt-1">{error.nrc_type}</p>}
        </div>
      </div>

      {/* Row 2: Serial number */}
      <div>
        <label className={LABEL_CLS}>
          {isMM ? 'မှတ်ပုံတင်နံပါတ်' : 'Registration Number'}
          <span className="text-red-500 ml-0.5">*</span>
          <span className="ml-1 font-normal text-gray-400 dark:text-slate-500">
            {isMM ? '(ဂဏန်း ၆ လုံး)' : '(6 digits)'}
          </span>
        </label>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={10}
          placeholder="123456"
          value={value.nrc_number || ''}
          onChange={(e) => onChange({ ...value, nrc_number: e.target.value.replace(/[^0-9]/g, '') })}
          className={[
            'w-full sm:w-48 px-3 py-2 text-sm border rounded-lg font-mono',
            'bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100',
            'placeholder-gray-400 dark:placeholder-slate-500',
            'focus:ring-2 focus:ring-green-500 focus:outline-none',
            error.nrc_number
              ? 'border-red-500 dark:border-red-500'
              : 'border-gray-300 dark:border-slate-600',
          ].join(' ')}
        />
        {error.nrc_number && <p className="text-xs text-red-500 mt-1">{error.nrc_number}</p>}
      </div>

      {/* Live preview */}
      {preview && (
        <div className="rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 px-4 py-3">
          <p className="text-xs font-semibold text-green-700 dark:text-green-300 mb-1 uppercase tracking-wide">
            {isMM ? 'NRC နံပါတ် အကြိုကြည့်ရှုမှု' : 'NRC Preview'}
          </p>
          <p className="text-lg font-mono font-bold text-green-900 dark:text-green-200 tracking-widest">
            {preview.en}
          </p>
          {preview.mm && (
            <p className="text-sm text-green-700 dark:text-green-300 mt-0.5">{preview.mm}</p>
          )}
        </div>
      )}

    </div>
  );
}