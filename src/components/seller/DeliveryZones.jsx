// components/seller/DeliveryZones.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ChevronDownIcon,
  ChevronRightIcon,
  TruckIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';
import api from '../../utils/api';
import { useTranslation } from 'react-i18next';

// ─── Myanmar Location Tree ────────────────────────────────────────────────────
// 14 States/Regions + 1 Union Territory
// Includes major cities and key townships for Yangon & Mandalay.
// Other states include top-level cities only; expand as needed.
const MYANMAR_LOCATIONS = [
  {
    state: 'Yangon Region',
    cities: [
      {
        city: 'Yangon', townships: [
          'Sanchaung', 'Kamaryut', 'Hlaing', 'Insein', 'Mayangon',
          'North Okkalapa', 'South Okkalapa', 'Thaketa', 'Thingangyun',
          'Tamwe', 'Yankin', 'Pazundaung', 'Botahtaung', 'Kyauktada',
          'Pabedan', 'Lanmadaw', 'Latha', 'Mingalar Taung Nyunt',
          'Bahan', 'Dagon', 'South Dagon', 'East Dagon', 'North Dagon',
          'Dagon Seikkan', 'Dawbon', 'Shwe Pyi Thar', 'Hlaing Thar Yar',
          'Hmawbi', 'Htantabin', 'Mingaladon', 'Seik Gyee Kya', 'Twantay',
        ],
      },
      { city: 'Thanlyin',  townships: ['Thanlyin', 'Kyauktan', 'Hline'] },
      { city: 'Pathein',   townships: ['Pathein', 'Bogale', 'Maubin'] },
    ],
  },
  {
    state: 'Mandalay Region',
    cities: [
      {
        city: 'Mandalay', townships: [
          'Chanayethazan', 'Chan Aye Tharzan', 'Mahar Aung Myay',
          'Amarapura', 'Patheingyi', 'Pyigyidagun', 'Mahaaungmyay',
          'Aungmyaythazan', 'Pyigyitagon',
        ],
      },
      { city: 'Pyin Oo Lwin', townships: ['Pyin Oo Lwin', 'Madaya', 'Singu'] },
      { city: 'Meikhtila',    townships: ['Meikhtila', 'Mahlaing', 'Thazi'] },
      { city: 'Nyaung-U',     townships: ['Nyaung-U', 'Bagan'] },
    ],
  },
  {
    state: 'Naypyidaw Union Territory',
    cities: [
      {
        city: 'Naypyidaw', townships: [
          'Ottarathiri', 'Dekkhinathiri', 'Pobbathiri', 'Zabuthiri',
          'Tatkon', 'Pyinmana', 'Lewe',
        ],
      },
    ],
  },
  {
    state: 'Sagaing Region',
    cities: [
      { city: 'Sagaing',   townships: ['Sagaing', 'Myinmu', 'Pale'] },
      { city: 'Monywa',    townships: ['Monywa', 'Budalin', 'Ayadaw'] },
      { city: 'Shwebo',    townships: ['Shwebo', 'Kanbalu', 'Tabayin'] },
      { city: 'Katha',     townships: ['Katha', 'Indaw', 'Tigyaing'] },
    ],
  },
  {
    state: 'Bago Region',
    cities: [
      { city: 'Bago',      townships: ['Bago', 'Taungoo', 'Pyay'] },
      { city: 'Pyay',      townships: ['Pyay', 'Paungde', 'Nattalin'] },
    ],
  },
  {
    state: 'Magway Region',
    cities: [
      { city: 'Magway',    townships: ['Magway', 'Yenangyaung', 'Pakokku'] },
      { city: 'Pakokku',   townships: ['Pakokku', 'Myaing', 'Yesagyo'] },
    ],
  },
  {
    state: 'Ayeyarwady Region',
    cities: [
      { city: 'Hinthada',  townships: ['Hinthada', 'Myanaung', 'Kyangin'] },
      { city: 'Maubin',    townships: ['Maubin', 'Wakema', 'Nyaungdon'] },
    ],
  },
  {
    state: 'Shan State',
    cities: [
      { city: 'Taunggyi',  townships: ['Taunggyi', 'Hopong', 'Lawksawk'] },
      { city: 'Lashio',    townships: ['Lashio', 'Hsipaw', 'Kyaukme'] },
    ],
  },
  {
    state: 'Kachin State',
    cities: [
      { city: 'Myitkyina', townships: ['Myitkyina', 'Waingmaw', 'Momauk'] },
      { city: 'Bhamo',     townships: ['Bhamo', 'Shwegu', 'Mogaung'] },
    ],
  },
  {
    state: 'Kayah State',
    cities: [
      { city: 'Loikaw',    townships: ['Loikaw', 'Hpasaung', 'Mese'] },
    ],
  },
  {
    state: 'Kayin State',
    cities: [
      { city: 'Hpa-an',    townships: ['Hpa-an', 'Kawkareik', 'Myawaddy'] },
    ],
  },
  {
    state: 'Mon State',
    cities: [
      { city: 'Mawlamyine', townships: ['Mawlamyine', 'Thaton', 'Kyaikto'] },
    ],
  },
  {
    state: 'Rakhine State',
    cities: [
      { city: 'Sittwe',    townships: ['Sittwe', 'Kyaukpyu', 'Thandwe'] },
    ],
  },
  {
    state: 'Chin State',
    cities: [
      { city: 'Hakha',     townships: ['Hakha', 'Falam', 'Tedim'] },
    ],
  },
  {
    state: 'Tanintharyi Region',
    cities: [
      { city: 'Dawei',     townships: ['Dawei', 'Myeik', 'Kawthaung'] },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatMMK = (n) =>
  new Intl.NumberFormat('my-MM', { style: 'currency', currency: 'MMK', minimumFractionDigits: 0 }).format(n || 0);

// Build a flat lookup key from area fields
const zoneKey = (z) => [z.area_type, z.country, z.state, z.city, z.township]
  .filter(Boolean).join('|');

// Convert saved DB zones array → Map<key, zone>
const buildZoneMap = (zones) => {
  const map = {};
  zones.forEach((z) => { map[zoneKey(z)] = z; });
  return map;
};

// ─── FeeInput ────────────────────────────────────────────────────────────────
const FeeInput = ({ value, onChange, placeholder }) => (
  <div className="flex items-center gap-1">
    <input
      type="number"
      min="0"
      step="100"
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      onClick={(e) => e.stopPropagation()}
      placeholder={placeholder}
      className="w-24 border border-gray-300 dark:border-slate-600 rounded px-2 py-1 text-xs bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:ring-1 focus:ring-green-500 dark:focus:ring-green-400 focus:outline-none"
    />
    <span className="text-xs text-gray-400 dark:text-slate-500">MMK</span>
  </div>
);

// ─── DaysInput ───────────────────────────────────────────────────────────────
const DaysInput = ({ min, max, onChange }) => (
  <div className="flex items-center gap-1">
    <input
      type="number"
      min="1"
      max="30"
      value={min}
      onChange={(e) => onChange(Number(e.target.value), max)}
      onClick={(e) => e.stopPropagation()}
      className="w-10 border border-gray-300 dark:border-slate-600 rounded px-1 py-1 text-xs text-center bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:ring-1 focus:ring-green-500 dark:focus:ring-green-400 focus:outline-none"
    />
    <span className="text-xs text-gray-400 dark:text-slate-500">–</span>
    <input
      type="number"
      min="1"
      max="30"
      value={max}
      onChange={(e) => onChange(min, Number(e.target.value))}
      onClick={(e) => e.stopPropagation()}
      className="w-10 border border-gray-300 dark:border-slate-600 rounded px-1 py-1 text-xs text-center bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:ring-1 focus:ring-green-500 dark:focus:ring-green-400 focus:outline-none"
    />
    <span className="text-xs text-gray-400 dark:text-slate-500">days</span>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const DeliveryZones = ({
  onSaveSuccess,
  showHeader = true,
  showFooter = true,
  saveButtonLabel,
}) => {
  const { t } = useTranslation();
  // selected: Set of zone keys the seller has checked
  const [selected, setSelected]     = useState(new Set());
  // fees: Map<key, { fee, freeThreshold, daysMin, daysMax }>
  const [fees, setFees]             = useState({});
  // expanded: Set of state names that have their city list open
  const [expanded, setExpanded]     = useState(new Set());
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState(null);
  const [success, setSuccess]       = useState(false);
  // Whole Myanmar shortcut
  const [wholeMyanmar, setWholeMyanmar] = useState(false);

  // ── Load existing zones from backend ──────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/seller/delivery-areas');
        if (res.data.success) {
          const zones = res.data.data || [];
          const newSelected = new Set();
          const newFees = {};

          zones.forEach((z) => {
            const k = zoneKey(z);
            newSelected.add(k);
            newFees[k] = {
              fee:          Number(z.shipping_fee) || 0,
              freeThreshold: Number(z.free_shipping_threshold) || 0,
              daysMin:      z.estimated_delivery_days_min || 3,
              daysMax:      z.estimated_delivery_days_max || 5,
            };
          });

          // Check if whole Myanmar is selected (single country-level zone)
          const wmKey = 'country|Myanmar';
          if (newSelected.has(wmKey)) setWholeMyanmar(true);

          setSelected(newSelected);
          setFees(newFees);
        }
      } catch (e) {
        console.error('Failed to load delivery zones:', e);
        setError('Failed to load your delivery zones.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ── Default fee object ─────────────────────────────────────────────────
  const defaultFee = () => ({ fee: 3000, freeThreshold: 0, daysMin: 3, daysMax: 5 });

  // ── Get or create fee entry for a key ──────────────────────────────────
  const getFee = useCallback((key) => fees[key] || defaultFee(), [fees]);

  // ── Update fee field ───────────────────────────────────────────────────
  const setFeeField = useCallback((key, field, value) => {
    setFees((prev) => ({
      ...prev,
      [key]: { ...(prev[key] || defaultFee()), [field]: value },
    }));
  }, []);

  // ── Build keys for a state and all its children ────────────────────────
  const stateKeys = useCallback((stateName) => {
    const keys = [];
    const loc = MYANMAR_LOCATIONS.find((l) => l.state === stateName);
    if (!loc) return keys;
    keys.push(`state|Myanmar|${stateName}`);
    loc.cities.forEach((c) => {
      keys.push(`city|Myanmar|${stateName}|${c.city}`);
      c.townships.forEach((t) => keys.push(`township|Myanmar|${stateName}|${c.city}|${t}`));
    });
    return keys;
  }, []);

  const cityKeys = useCallback((stateName, cityName) => {
    const loc   = MYANMAR_LOCATIONS.find((l) => l.state === stateName);
    const city  = loc?.cities.find((c) => c.city === cityName);
    if (!city) return [];
    return [
      `city|Myanmar|${stateName}|${cityName}`,
      ...city.townships.map((t) => `township|Myanmar|${stateName}|${cityName}|${t}`),
    ];
  }, []);

  // ── Checkbox logic ─────────────────────────────────────────────────────
  const toggleWhole = () => {
    setWholeMyanmar((prev) => {
      const next = !prev;
      if (next) {
        // Store only the country-level key — the backend stores a single country zone.
        // Individual state/city/township selections are cleared.
        setSelected(new Set(['country|Myanmar']));
        if (!fees['country|Myanmar']) setFees((f) => ({ ...f, 'country|Myanmar': defaultFee() }));
      } else {
        setSelected(new Set());
      }
      return next;
    });
  };

  const toggleState = (stateName) => {
    const keys     = stateKeys(stateName);
    const stateKey = `state|Myanmar|${stateName}`;
    const isOn     = selected.has(stateKey);
    if (!isOn) {
      // Initialise fees for new keys outside the state updater
      const toInit = keys.filter((k) => !fees[k]);
      if (toInit.length) setFees((f) => Object.assign({}, f, Object.fromEntries(toInit.map((k) => [k, defaultFee()]))));
    }
    setSelected((prev) => {
      const next = new Set(prev);
      if (isOn) {
        keys.forEach((k) => next.delete(k));
      } else {
        keys.forEach((k) => next.add(k));
      }
      return next;
    });
    setWholeMyanmar(false);
  };

  const toggleCity = (stateName, cityName) => {
    const keys    = cityKeys(stateName, cityName);
    const cityKey = `city|Myanmar|${stateName}|${cityName}`;
    const isOn    = selected.has(cityKey);
    if (!isOn) {
      const toInit = keys.filter((k) => !fees[k]);
      if (toInit.length) setFees((f) => Object.assign({}, f, Object.fromEntries(toInit.map((k) => [k, defaultFee()]))));
    }
    setSelected((prev) => {
      const next = new Set(prev);
      if (isOn) {
        keys.forEach((k) => next.delete(k));
      } else {
        keys.forEach((k) => next.add(k));
        // Auto-check state if all cities in it are now selected
        const loc = MYANMAR_LOCATIONS.find((l) => l.state === stateName);
        const allCitiesSelected = loc?.cities.every((c) =>
          next.has(`city|Myanmar|${stateName}|${c.city}`)
        );
        if (allCitiesSelected) next.add(`state|Myanmar|${stateName}`);
      }
      return next;
    });
    setWholeMyanmar(false);
  };

  const toggleTownship = (stateName, cityName, township) => {
    const tKey = `township|Myanmar|${stateName}|${cityName}|${township}`;
    if (!selected.has(tKey) && !fees[tKey]) {
      setFees((f) => ({ ...f, [tKey]: defaultFee() }));
    }
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(tKey)) {
        next.delete(tKey);
        // Uncheck parent city if any township is now unchecked
        next.delete(`city|Myanmar|${stateName}|${cityName}`);
        next.delete(`state|Myanmar|${stateName}`);
      } else {
        next.add(tKey);
        // Auto-check city if all its townships are selected
        const loc  = MYANMAR_LOCATIONS.find((l) => l.state === stateName);
        const city = loc?.cities.find((c) => c.city === cityName);
        const allT = city?.townships.every((t) =>
          next.has(`township|Myanmar|${stateName}|${cityName}|${t}`)
        );
        if (allT) {
          next.add(`city|Myanmar|${stateName}|${cityName}`);
          // Auto-check state if all cities are now selected
          const allC = loc?.cities.every((c) =>
            next.has(`city|Myanmar|${stateName}|${c.city}`)
          );
          if (allC) next.add(`state|Myanmar|${stateName}`);
        }
      }
      return next;
    });
    setWholeMyanmar(false);
  };

  // Indeterminate state helpers
  const stateIndeterminate = (stateName) => {
    const loc    = MYANMAR_LOCATIONS.find((l) => l.state === stateName);
    const allKeys = stateKeys(stateName).slice(1); // exclude state key itself
    const someOn  = allKeys.some((k) => selected.has(k));
    const allOn   = allKeys.every((k) => selected.has(k));
    return someOn && !allOn;
  };

  const cityIndeterminate = (stateName, cityName) => {
    const loc  = MYANMAR_LOCATIONS.find((l) => l.state === stateName);
    const city = loc?.cities.find((c) => c.city === cityName);
    const tKeys = city?.townships.map((t) => `township|Myanmar|${stateName}|${cityName}|${t}`) || [];
    const someOn = tKeys.some((k) => selected.has(k));
    const allOn  = tKeys.every((k) => selected.has(k));
    return someOn && !allOn;
  };

  // ── Save ───────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    let zones;
    if (wholeMyanmar) {
      // One country-level zone rather than hundreds of individual rows.
      const f = fees['country|Myanmar'] || defaultFee();
      zones = [{
        area_type:                   'country',
        country:                     'Myanmar',
        state:                       null,
        city:                        null,
        township:                    null,
        shipping_fee:                f.fee,
        free_shipping_threshold:     f.freeThreshold || null,
        estimated_delivery_days_min: f.daysMin,
        estimated_delivery_days_max: f.daysMax,
        is_active:                   true,
      }];
    } else {
      zones = Array.from(selected).map((key) => {
        const parts    = key.split('|');
        const areaType = parts[0];
        const f        = fees[key] || defaultFee();
        return {
          area_type:                   areaType,
          country:                     'Myanmar',
          state:                       parts[2] || null,
          city:                        parts[3] || null,
          township:                    parts[4] || null,
          shipping_fee:                f.fee,
          free_shipping_threshold:     f.freeThreshold || null,
          estimated_delivery_days_min: f.daysMin,
          estimated_delivery_days_max: f.daysMax,
          is_active:                   true,
        };
      });
    }

    try {
      const res = await api.post('/seller/delivery-areas/sync', { zones });
      if (res.data.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 4000);
        if (onSaveSuccess) {
          await onSaveSuccess();
        }
        return true;
      } else {
        setError(res.data.message || 'Failed to save zones');
      }
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to save delivery zones');
    } finally {
      setSaving(false);
    }

    return false;
  };

  // ── Summary counts ─────────────────────────────────────────────────────
  const summary = useMemo(() => {
    const states    = [...selected].filter((k) => k.startsWith('state|')).length;
    const cities    = [...selected].filter((k) => k.startsWith('city|')).length;
    const townships = [...selected].filter((k) => k.startsWith('township|')).length;
    return { states, cities, townships };
  }, [selected]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      {showHeader && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <TruckIcon className="h-5 w-5 text-green-600" />
              {t('seller.delivery_zones.title')}
            </h2>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
              {t('seller.delivery_zones.subtitle')}
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving || selected.size === 0}
            className="flex items-center gap-2 px-5 py-2 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />{t('seller.delivery_zones.saving')}</>
            ) : (
              <>{saveButtonLabel || t('seller.delivery_zones.save_zones')}</>
            )}
          </button>
        </div>
      )}

      {/* Feedback banners */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-300">
          <ExclamationCircleIcon className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-sm text-green-700 dark:text-green-300">
          <CheckCircleIcon className="h-4 w-4 flex-shrink-0" />
          {t('seller.delivery_zones.saved')}
        </div>
      )}

      {/* Summary badge */}
      {selected.size > 0 && (
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="px-2.5 py-1 bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 rounded-full font-medium">
            {summary.states} {summary.states === 1 ? t('seller.delivery_zones.state') : t('seller.delivery_zones.states')}
          </span>
          <span className="px-2.5 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 rounded-full font-medium">
            {summary.cities} {summary.cities === 1 ? t('seller.delivery_zones.city') : t('seller.delivery_zones.cities')}
          </span>
          <span className="px-2.5 py-1 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300 rounded-full font-medium">
            {summary.townships} {summary.townships === 1 ? t('seller.delivery_zones.township') : t('seller.delivery_zones.townships')}
          </span>
        </div>
      )}

      {/* Column headers */}
      <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-slate-700/50 rounded-xl text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wide">
        <span className="flex-1">{t('seller.delivery_zones.location')}</span>
        <span className="w-32 text-right">{t('seller.delivery_zones.shipping_fee')}</span>
        <span className="w-28 text-right">{t('seller.delivery_zones.est_days')}</span>
      </div>

      {/* ── Whole Myanmar shortcut ── */}
      <div className={`border-2 rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3 transition-colors ${
        wholeMyanmar ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-600'
      }`}>
        <label className="flex items-center gap-3 flex-1 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={wholeMyanmar}
            onChange={toggleWhole}
            className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
          />
          <GlobeAltIcon className="h-5 w-5 text-green-600 flex-shrink-0" />
          <div>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">{t('seller.delivery_zones.whole_myanmar')}</span>
            <p className="text-xs text-gray-500 dark:text-slate-400">{t('seller.delivery_zones.whole_myanmar_sub')}</p>
          </div>
        </label>

        {wholeMyanmar && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pl-7 sm:pl-0">
            <FeeInput
              value={getFee('country|Myanmar').fee}
              onChange={(v) => setFeeField('country|Myanmar', 'fee', v)}
            />
            <DaysInput
              min={getFee('country|Myanmar').daysMin}
              max={getFee('country|Myanmar').daysMax}
              onChange={(min, max) => {
                setFeeField('country|Myanmar', 'daysMin', min);
                setFeeField('country|Myanmar', 'daysMax', max);
              }}
            />
          </div>
        )}
      </div>

      {/* ── State / City / Township tree ── */}
      {!wholeMyanmar && (
        <div className="space-y-3">
          {MYANMAR_LOCATIONS.map((loc) => {
            const stKey      = `state|Myanmar|${loc.state}`;
            const isStateOn  = selected.has(stKey);
            const isStateInd = stateIndeterminate(loc.state);
            const isExpanded = expanded.has(loc.state);

            return (
              <div key={loc.state} className="border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden">

                {/* State row */}
                <div
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                    isStateOn || isStateInd ? 'bg-green-50 dark:bg-green-900/20' : 'bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700/50'
                  }`}
                  onClick={() => setExpanded((prev) => {
                    const n = new Set(prev);
                    n.has(loc.state) ? n.delete(loc.state) : n.add(loc.state);
                    return n;
                  })}
                >
                  <input
                    type="checkbox"
                    checked={isStateOn}
                    ref={(el) => { if (el) el.indeterminate = isStateInd; }}
                    onChange={() => toggleState(loc.state)}
                    onClick={(e) => e.stopPropagation()}
                    className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500 flex-shrink-0"
                  />
                  <span className="flex-1 text-sm font-semibold text-gray-900 dark:text-white">{loc.state}</span>

                  {(isStateOn || isStateInd) && (
                    <div
                      className="flex flex-col sm:flex-row items-start sm:items-center gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <FeeInput
                        value={getFee(stKey).fee}
                        onChange={(v) => setFeeField(stKey, 'fee', v)}
                      />
                      <DaysInput
                        min={getFee(stKey).daysMin}
                        max={getFee(stKey).daysMax}
                        onChange={(min, max) => {
                          setFeeField(stKey, 'daysMin', min);
                          setFeeField(stKey, 'daysMax', max);
                        }}
                      />
                    </div>
                  )}

                  <span className="text-gray-400 dark:text-slate-500 ml-1 flex-shrink-0">
                    {isExpanded
                      ? <ChevronDownIcon className="h-4 w-4" />
                      : <ChevronRightIcon className="h-4 w-4" />
                    }
                  </span>
                </div>

                {/* Cities */}
                {isExpanded && (
                  <div className="border-t border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50">
                    {loc.cities.map((cityObj) => {
                      const cKey     = `city|Myanmar|${loc.state}|${cityObj.city}`;
                      const isCityOn  = selected.has(cKey);
                      const isCityInd = cityIndeterminate(loc.state, cityObj.city);
                      const isCityExp = expanded.has(cKey);

                      return (
                        <div key={cityObj.city} className="border-b border-gray-100 dark:border-slate-700 last:border-0">

                          {/* City row */}
                          <div
                            className={`flex items-center gap-3 px-6 py-2.5 cursor-pointer transition-colors ${
                              isCityOn || isCityInd ? 'bg-blue-50/60 dark:bg-blue-900/20' : 'hover:bg-gray-100/60 dark:hover:bg-slate-700/40'
                            }`}
                            onClick={() => setExpanded((prev) => {
                              const n = new Set(prev);
                              n.has(cKey) ? n.delete(cKey) : n.add(cKey);
                              return n;
                            })}
                          >
                            <input
                              type="checkbox"
                              checked={isCityOn}
                              ref={(el) => { if (el) el.indeterminate = isCityInd; }}
                              onChange={() => toggleCity(loc.state, cityObj.city)}
                              onClick={(e) => e.stopPropagation()}
                              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 flex-shrink-0"
                            />
                            <span className="flex-1 text-sm font-medium text-gray-800 dark:text-slate-200">{cityObj.city}</span>

                            {(isCityOn || isCityInd) && (
                              <div
                                className="flex flex-col sm:flex-row items-start sm:items-center gap-2"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <FeeInput
                                  value={getFee(cKey).fee}
                                  onChange={(v) => setFeeField(cKey, 'fee', v)}
                                />
                                <DaysInput
                                  min={getFee(cKey).daysMin}
                                  max={getFee(cKey).daysMax}
                                  onChange={(min, max) => {
                                    setFeeField(cKey, 'daysMin', min);
                                    setFeeField(cKey, 'daysMax', max);
                                  }}
                                />
                              </div>
                            )}

                            <span className="text-gray-400 dark:text-slate-500 ml-1 flex-shrink-0">
                              {isCityExp
                                ? <ChevronDownIcon className="h-3.5 w-3.5" />
                                : <ChevronRightIcon className="h-3.5 w-3.5" />
                              }
                            </span>
                          </div>

                          {/* Townships */}
                          {isCityExp && (
                            <div className="bg-white dark:bg-slate-800 border-t border-gray-100 dark:border-slate-700">
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1 px-8 py-2">
                                {cityObj.townships.map((township) => {
                                  const tKey = `township|Myanmar|${loc.state}|${cityObj.city}|${township}`;
                                  const isTOn = selected.has(tKey);
                                  return (
                                    <div key={township} className={`flex flex-col gap-1 p-2 rounded-lg transition-colors ${
                                      isTOn ? 'bg-indigo-50 dark:bg-indigo-900/20' : 'hover:bg-gray-50 dark:hover:bg-slate-700/50'
                                    }`}>
                                      <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                          type="checkbox"
                                          checked={isTOn}
                                          onChange={() => toggleTownship(loc.state, cityObj.city, township)}
                                          className="h-3.5 w-3.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <span className="text-xs text-gray-700 dark:text-slate-300">{township}</span>
                                      </label>
                                      {isTOn && (
                                        <div className="pl-5 flex flex-col gap-1">
                                          <FeeInput
                                            value={getFee(tKey).fee}
                                            onChange={(v) => setFeeField(tKey, 'fee', v)}
                                          />
                                          <DaysInput
                                            min={getFee(tKey).daysMin}
                                            max={getFee(tKey).daysMax}
                                            onChange={(min, max) => {
                                              setFeeField(tKey, 'daysMin', min);
                                              setFeeField(tKey, 'daysMax', max);
                                            }}
                                          />
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {selected.size === 0 && !wholeMyanmar && (
        <div className="text-center py-10 text-gray-400 dark:text-slate-500">
          <TruckIcon className="h-10 w-10 mx-auto mb-2" />
          <p className="text-sm">{t('seller.delivery_zones.no_zones')}</p>
          <p className="text-xs mt-1">{t('seller.delivery_zones.no_zones_hint')}</p>
        </div>
      )}

      {/* Save footer */}
      {showFooter && selected.size > 0 && (
        <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-slate-700">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 disabled:opacity-50"
          >
            {saving
              ? t('seller.delivery_zones.saving')
              : (saveButtonLabel || t('seller.delivery_zones.save_n_zones', { count: selected.size }))}
          </button>
        </div>
      )}
    </div>
  );
};

export default DeliveryZones;