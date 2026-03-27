// src/components/seller/StoreProfileEditor.jsx
// Single unified component for all seller profile management.
// Tabs: Basic Info · Images · Policies · Business Hours · Social · Documents · Password

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  BuildingStorefrontIcon, PhotoIcon, DocumentTextIcon,
  ClockIcon, GlobeAltIcon, FolderArrowDownIcon, KeyIcon,
  CheckCircleIcon, ExclamationCircleIcon, ArrowUpTrayIcon,
  TrashIcon, XMarkIcon, EyeIcon, BellIcon
} from '@heroicons/react/24/outline';
import api from '../../utils/api';
import NotificationPreferences from '../Shared/NotificationPreferences';

// ── Helpers ───────────────────────────────────────────────────────────────────
const DAYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
const DAY_LABELS = { monday:'Mon', tuesday:'Tue', wednesday:'Wed', thursday:'Thu', friday:'Fri', saturday:'Sat', sunday:'Sun' };
const DEFAULT_HOURS = Object.fromEntries(DAYS.map(d => [d, { open:'09:00', close:'18:00', closed: d==='sunday' }]));

const Toast = ({ msg, type }) => msg ? (
  <div className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-medium
    ${type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
    {type === 'success'
      ? <CheckCircleIcon className="h-4 w-4 flex-shrink-0"/>
      : <ExclamationCircleIcon className="h-4 w-4 flex-shrink-0"/>}
    {msg}
  </div>
) : null;

const FieldRow = ({ label, required, hint, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
    {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
  </div>
);

const Input = ({ className='', ...p }) => (
  <input className={`w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none ${className}`} {...p}/>
);
const Textarea = ({ className='', ...p }) => (
  <textarea className={`w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none resize-none ${className}`} {...p}/>
);
const Select = ({ children, className='', ...p }) => (
  <select className={`w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none bg-white ${className}`} {...p}>
    {children}
  </select>
);
const SaveBtn = ({ saving, onClick, label='Save Changes' }) => (
  <button onClick={onClick} disabled={saving}
    className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-xl disabled:opacity-50 transition-colors">
    {saving ? 'Saving…' : label}
  </button>
);

// ── ImageUploadBox ────────────────────────────────────────────────────────────
const ImageUploadBox = ({ label, hint, currentUrl, onUpload, onRemove, uploading, aspect='16/9', maxMB=5 }) => {
  const ref = useRef();
  return (
    <div>
      <p className="text-sm font-medium text-gray-700 mb-2">{label}</p>
      {currentUrl ? (
        <div className="relative group rounded-xl overflow-hidden border border-gray-200" style={{ aspectRatio: aspect }}>
          <img src={currentUrl} alt={label} className="w-full h-full object-cover"/>
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button onClick={() => ref.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-gray-900 rounded-lg text-xs font-medium hover:bg-gray-100">
              <PhotoIcon className="h-4 w-4"/> Change
            </button>
            <button onClick={onRemove}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700">
              <TrashIcon className="h-4 w-4"/> Remove
            </button>
          </div>
          {uploading && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"/>
            </div>
          )}
        </div>
      ) : (
        <button onClick={() => ref.current?.click()} disabled={uploading}
          className={`w-full border-2 border-dashed border-gray-300 hover:border-green-400 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-green-600 transition-colors disabled:opacity-50`}
          style={{ aspectRatio: aspect, minHeight: '120px' }}>
          {uploading
            ? <div className="animate-spin rounded-full h-8 w-8 border-2 border-green-500 border-t-transparent"/>
            : <>
                <ArrowUpTrayIcon className="h-8 w-8"/>
                <span className="text-sm font-medium">Upload {label}</span>
                <span className="text-xs">{hint || `JPG, PNG, WebP · max ${maxMB}MB`}</span>
              </>}
        </button>
      )}
      <input ref={ref} type="file" accept="image/*" className="hidden"
        onChange={e => { if (e.target.files[0]) onUpload(e.target.files[0]); e.target.value=''; }}/>
    </div>
  );
};

// ── PolicyEditor ──────────────────────────────────────────────────────────────
const PolicyEditor = ({ label, name, value, onChange, placeholder }) => {
  const [preview, setPreview] = useState(false);
  const wordCount = value ? value.trim().split(/\s+/).filter(Boolean).length : 0;
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-100">
        <span className="text-sm font-semibold text-gray-700">{label}</span>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">{wordCount} words</span>
          <button onClick={() => setPreview(v => !v)}
            className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg transition-colors ${preview ? 'bg-green-100 text-green-700' : 'text-gray-500 hover:text-gray-700'}`}>
            <EyeIcon className="h-3.5 w-3.5"/>{preview ? 'Edit' : 'Preview'}
          </button>
        </div>
      </div>
      {preview ? (
        <div className="px-4 py-3 min-h-[120px] text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
          {value || <span className="text-gray-400 italic">No content yet.</span>}
        </div>
      ) : (
        <Textarea name={name} value={value} onChange={onChange} placeholder={placeholder}
          rows={6} className="rounded-none border-0 focus:ring-0"/>
      )}
    </div>
  );
};

// ── DocumentRow ───────────────────────────────────────────────────────────────
const DocumentRow = ({ label, fieldName, value, onUpload, uploading, hint }) => {
  const ref = useRef();
  const isUrl = value && (value.startsWith('http') || value.startsWith('/storage'));
  return (
    <div className="flex items-start gap-4 py-4 border-b border-gray-50 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        {hint && <p className="text-xs text-gray-400 mt-0.5">{hint}</p>}
        {isUrl && (
          <a href={value} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-green-600 hover:text-green-700 mt-1">
            <EyeIcon className="h-3 w-3"/> View uploaded file
          </a>
        )}
      </div>
      <div className="flex-shrink-0">
        {uploading === fieldName ? (
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-green-500 border-t-transparent"/>
            Uploading…
          </div>
        ) : (
          <button onClick={() => ref.current?.click()}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors
              ${isUrl ? 'border-gray-200 text-gray-600 hover:bg-gray-50' : 'border-green-200 text-green-700 bg-green-50 hover:bg-green-100'}`}>
            <ArrowUpTrayIcon className="h-3.5 w-3.5"/>
            {isUrl ? 'Replace' : 'Upload'}
          </button>
        )}
        <input ref={ref} type="file" accept=".jpg,.jpeg,.png,.pdf,.webp" className="hidden"
          onChange={e => { if (e.target.files[0]) onUpload(fieldName, e.target.files[0]); e.target.value=''; }}/>
      </div>
      {isUrl && (
        <div className="flex-shrink-0 text-green-500">
          <CheckCircleIcon className="h-5 w-5"/>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
const TABS = [
  { id:'basic',     label:'Basic Info',      icon: BuildingStorefrontIcon },
  { id:'images',    label:'Images',          icon: PhotoIcon              },
  { id:'policies',  label:'Policies',        icon: DocumentTextIcon       },
  { id:'hours',     label:'Business Hours',  icon: ClockIcon              },
  { id:'social',    label:'Social Links',    icon: GlobeAltIcon           },
  { id:'documents', label:'Documents',       icon: FolderArrowDownIcon    },
  { id:'security',  label:'Password',        icon: KeyIcon                },
  { id:'notifications', label:'Notifications', icon: BellIcon },
];

const StoreProfileEditor = ({ storeData, refreshData }) => {
  const [tab, setTab]         = useState('basic');
  const [data, setData]       = useState(null);
  const [businessTypes, setBT] = useState([]);
  const [saving, setSaving]   = useState('');
  const [uploading, setUploading] = useState('');
  const [toast, setToast]     = useState({ msg:'', type:'success' });
  const [docUploading, setDocUploading] = useState('');

  const flash = (msg, type='success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg:'', type:'success' }), 3500);
  };

  // ── Load data ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!storeData) return;
    setData({
      // Basic
      store_name:     storeData.store_name     || '',
      store_description: storeData.store_description || '',
      business_type:  storeData.business_type  || '',
      business_type_id: storeData.business_type_id || '',
      contact_email:  storeData.contact_email  || '',
      contact_phone:  storeData.contact_phone  || '',
      website:        storeData.website        || '',
      address:        storeData.address        || '',
      city:           storeData.city           || '',
      state:          storeData.state          || '',
      country:        storeData.country        || '',
      postal_code:    storeData.postal_code    || '',
      year_established: storeData.year_established || '',
      employees_count: storeData.employees_count || '',
      account_number: storeData.account_number || '',
      // Policies
      return_policy:   storeData.return_policy   || '',
      shipping_policy: storeData.shipping_policy || '',
      warranty_policy: storeData.warranty_policy || '',
      privacy_policy:  storeData.privacy_policy  || '',
      terms_of_service: storeData.terms_of_service || '',
      // Business Hours
      business_hours_enabled: storeData.business_hours_enabled ?? false,
      business_hours: storeData.business_hours || DEFAULT_HOURS,
      // Social
      social_facebook:  storeData.social_facebook  || '',
      social_instagram: storeData.social_instagram || '',
      social_twitter:   storeData.social_twitter   || '',
      social_linkedin:  storeData.social_linkedin  || '',
      social_youtube:   storeData.social_youtube   || '',
      // Vacation
      vacation_mode:       storeData.vacation_mode       ?? false,
      vacation_message:    storeData.vacation_message    || '',
      vacation_start_date: storeData.vacation_start_date || '',
      vacation_end_date:   storeData.vacation_end_date   || '',
    });
  }, [storeData]);

  useEffect(() => {
    api.get('/business-types').then(r => setBT(r.data?.data || r.data || [])).catch(() => {});
  }, []);

  const set = (k, v) => setData(p => ({ ...p, [k]: v }));
  const setHour = (day, field, val) =>
    setData(p => ({ ...p, business_hours: { ...p.business_hours, [day]: { ...p.business_hours?.[day], [field]: val } } }));

  // ── Save basic info ───────────────────────────────────────────────────────
  const saveBasic = async () => {
    setSaving('basic');
    try {
      await api.put('/seller/my-store/update', {
        store_name: data.store_name, store_description: data.store_description,
        business_type: data.business_type, business_type_id: data.business_type_id || undefined,
        contact_email: data.contact_email, contact_phone: data.contact_phone,
        website: data.website || null, address: data.address, city: data.city,
        state: data.state, country: data.country, postal_code: data.postal_code || null,
        year_established: data.year_established || null,
        employees_count: data.employees_count || null,
        account_number: data.account_number || null,
      });
      flash('Store information saved.');
      if (refreshData) await refreshData();
    } catch (e) { flash(e.response?.data?.message || 'Failed to save.', 'error'); }
    finally { setSaving(''); }
  };

  // ── Logo upload ───────────────────────────────────────────────────────────
  const uploadLogo = async (file) => {
    setUploading('logo');
    try {
      const fd = new FormData(); fd.append('logo', file);
      await api.post('/seller/logo', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      flash('Logo updated.');
      if (refreshData) await refreshData();
    } catch (e) { flash('Logo upload failed.', 'error'); }
    finally { setUploading(''); }
  };

  const removeLogo = async () => {
    if (!confirm('Remove the store logo?')) return;
    setUploading('logo');
    try {
      await api.delete('/seller/logo');
      flash('Logo removed.');
      if (refreshData) await refreshData();
    } catch (e) { flash('Failed to remove logo.', 'error'); }
    finally { setUploading(''); }
  };

  // ── Banner upload ─────────────────────────────────────────────────────────
  const uploadBanner = async (file) => {
    setUploading('banner');
    try {
      const fd = new FormData(); fd.append('banner', file);
      await api.post('/seller/banner', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      flash('Banner updated.');
      if (refreshData) await refreshData();
    } catch (e) { flash('Banner upload failed.', 'error'); }
    finally { setUploading(''); }
  };

  const removeBanner = async () => {
    if (!confirm('Remove the store banner?')) return;
    setUploading('banner');
    try {
      await api.delete('/seller/banner');
      flash('Banner removed.');
      if (refreshData) await refreshData();
    } catch (e) { flash('Failed to remove banner.', 'error'); }
    finally { setUploading(''); }
  };

  // ── Save policies ─────────────────────────────────────────────────────────
  const savePolicies = async () => {
    setSaving('policies');
    try {
      await api.put('/seller/policies', {
        return_policy:   data.return_policy   || null,
        shipping_policy: data.shipping_policy || null,
        warranty_policy: data.warranty_policy || null,
        privacy_policy:  data.privacy_policy  || null,
        terms_of_service: data.terms_of_service || null,
      });
      flash('Policies saved.');
      if (refreshData) await refreshData();
    } catch (e) { flash('Failed to save policies.', 'error'); }
    finally { setSaving(''); }
  };

  // ── Save business hours ───────────────────────────────────────────────────
  const saveHours = async () => {
    setSaving('hours');
    try {
      await api.put('/seller/business-hours', {
        business_hours_enabled: data.business_hours_enabled,
        business_hours: data.business_hours,
        vacation_mode: data.vacation_mode,
        vacation_message: data.vacation_message || null,
        vacation_start_date: data.vacation_start_date || null,
        vacation_end_date: data.vacation_end_date || null,
      });
      flash('Hours saved.');
      if (refreshData) await refreshData();
    } catch (e) { flash('Failed to save hours.', 'error'); }
    finally { setSaving(''); }
  };

  // ── Save social ───────────────────────────────────────────────────────────
  const saveSocial = async () => {
    setSaving('social');
    try {
      await api.put('/seller/my-store/update', {
        social_facebook: data.social_facebook || null,
        social_instagram: data.social_instagram || null,
        social_twitter: data.social_twitter || null,
        social_linkedin: data.social_linkedin || null,
        social_youtube: data.social_youtube || null,
      });
      flash('Social links saved.');
      if (refreshData) await refreshData();
    } catch (e) { flash('Failed to save social links.', 'error'); }
    finally { setSaving(''); }
  };

  // ── Upload document ───────────────────────────────────────────────────────
  const uploadDocument = async (fieldName, file) => {
    setDocUploading(fieldName);
    try {
      const fd = new FormData();
      fd.append('document', file);
      fd.append('document_type', fieldName);
      await api.post('/seller/onboarding/documents', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      flash('Document uploaded.');
      if (refreshData) await refreshData();
    } catch (e) { flash(e.response?.data?.message || 'Upload failed.', 'error'); }
    finally { setDocUploading(''); }
  };

  // ── Change password ───────────────────────────────────────────────────────
  const [pwd, setPwd] = useState({ current:'', next:'', confirm:'' });
  const [pwdSaving, setPwdSaving] = useState(false);
  const savePassword = async () => {
    if (!pwd.current || !pwd.next) { flash('Fill in all password fields.', 'error'); return; }
    if (pwd.next !== pwd.confirm)  { flash('Passwords do not match.', 'error'); return; }
    if (pwd.next.length < 8)       { flash('Password must be at least 8 characters.', 'error'); return; }
    setPwdSaving(true);
    try {
      await api.put('/users/profile/password', {
        current_password: pwd.current,
        new_password: pwd.next,
        new_password_confirmation: pwd.confirm,
      });
      flash('Password changed successfully.');
      setPwd({ current:'', next:'', confirm:'' });
    } catch (e) { flash(e.response?.data?.message || 'Failed to change password.', 'error'); }
    finally { setPwdSaving(false); }
  };

  // ── Loading state ─────────────────────────────────────────────────────────
  if (!data) return (
    <div className="flex justify-center items-center h-48">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-500"/>
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-0">
      <Toast msg={toast.msg} type={toast.type}/>

      {/* ── Tab Bar ─────────────────────────────────────────────────────── */}
      <div className="flex overflow-x-auto gap-1 pb-1 mb-6 border-b border-gray-100 scrollbar-hide">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-xl whitespace-nowrap flex-shrink-0 transition-colors
              ${tab === t.id ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
            <t.icon className="h-4 w-4 flex-shrink-0"/>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── BASIC INFO ──────────────────────────────────────────────────── */}
      {tab === 'basic' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FieldRow label="Store Name" required>
              <Input value={data.store_name} onChange={e => set('store_name', e.target.value)} placeholder="Your store name"/>
            </FieldRow>
            <FieldRow label="Business Type">
              <Select value={data.business_type_id} onChange={e => set('business_type_id', e.target.value)}>
                <option value="">Select type…</option>
                {businessTypes.map(bt => <option key={bt.id} value={bt.id}>{bt.name}</option>)}
              </Select>
            </FieldRow>
            <FieldRow label="Contact Email" required>
              <Input type="email" value={data.contact_email} onChange={e => set('contact_email', e.target.value)}/>
            </FieldRow>
            <FieldRow label="Contact Phone" required>
              <Input type="tel" value={data.contact_phone} onChange={e => set('contact_phone', e.target.value)} placeholder="+959..."/>
            </FieldRow>
            <FieldRow label="Website">
              <Input type="url" value={data.website} onChange={e => set('website', e.target.value)} placeholder="https://yourstore.com"/>
            </FieldRow>
            <FieldRow label="Bank Account Number" hint="For payouts">
              <Input value={data.account_number} onChange={e => set('account_number', e.target.value)}/>
            </FieldRow>
          </div>

          <FieldRow label="Store Description" hint="Shown on your public profile. Describe what you sell and your unique value.">
            <Textarea rows={4} value={data.store_description} onChange={e => set('store_description', e.target.value)} placeholder="Tell customers about your store…"/>
          </FieldRow>

          <div className="border-t border-gray-100 pt-5">
            <p className="text-sm font-semibold text-gray-700 mb-4">Store Address</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <FieldRow label="Street Address">
                <Input value={data.address} onChange={e => set('address', e.target.value)} placeholder="Street / Building"/>
              </FieldRow>
              <FieldRow label="City">
                <Input value={data.city} onChange={e => set('city', e.target.value)}/>
              </FieldRow>
              <FieldRow label="State / Region">
                <Input value={data.state} onChange={e => set('state', e.target.value)}/>
              </FieldRow>
              <FieldRow label="Country">
                <Input value={data.country} onChange={e => set('country', e.target.value)} placeholder="Myanmar"/>
              </FieldRow>
              <FieldRow label="Postal Code">
                <Input value={data.postal_code} onChange={e => set('postal_code', e.target.value)}/>
              </FieldRow>
              <FieldRow label="Year Established">
                <Input type="number" min="1900" max={new Date().getFullYear()} value={data.year_established} onChange={e => set('year_established', e.target.value)}/>
              </FieldRow>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <SaveBtn saving={saving === 'basic'} onClick={saveBasic}/>
          </div>
        </div>
      )}

      {/* ── IMAGES ──────────────────────────────────────────────────────── */}
      {tab === 'images' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <ImageUploadBox
              label="Store Logo"
              hint="Square · JPG, PNG, WebP · max 2MB · Shown in search results and your store header"
              currentUrl={storeData?.store_logo}
              onUpload={uploadLogo}
              onRemove={removeLogo}
              uploading={uploading === 'logo'}
              aspect="1/1"
              maxMB={2}
            />
            <ImageUploadBox
              label="Store Banner"
              hint="16:9 landscape · JPG, PNG, WebP · max 5MB · Displayed at the top of your store page"
              currentUrl={storeData?.store_banner}
              onUpload={uploadBanner}
              onRemove={removeBanner}
              uploading={uploading === 'banner'}
              aspect="16/9"
              maxMB={5}
            />
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-800">
            <strong>Tips:</strong> Use a square logo (min 200×200px) with a transparent or white background.
            Banner images look best at 1200×675px. Both images are shown on your public store page.
          </div>
        </div>
      )}

      {/* ── POLICIES ────────────────────────────────────────────────────── */}
      {tab === 'policies' && (
        <div className="space-y-4">
          <p className="text-sm text-gray-500 mb-2">
            Policies are shown on your public store page. Be clear and specific — buyers read these before purchasing.
          </p>
          {[
            { name:'return_policy',   label:'Return & Refund Policy', placeholder:'e.g. Items can be returned within 7 days of delivery for a full refund. Products must be unused and in original packaging…' },
            { name:'shipping_policy', label:'Shipping Policy',        placeholder:'e.g. We ship Monday–Friday. Orders placed before 12 PM are dispatched same day. Delivery takes 2–5 business days…' },
            { name:'warranty_policy', label:'Warranty Policy',        placeholder:'e.g. All electronics carry a 6-month manufacturer warranty. Contact us within 30 days of purchase for warranty claims…' },
            { name:'privacy_policy',  label:'Privacy Policy',         placeholder:'e.g. We collect your name, email and delivery address solely to process orders. We do not share your information with third parties…' },
            { name:'terms_of_service',label:'Terms of Service',       placeholder:'e.g. By placing an order you agree to our terms. Prices are in MMK and include applicable taxes…' },
          ].map(p => (
            <PolicyEditor key={p.name} label={p.label} name={p.name}
              value={data[p.name]} placeholder={p.placeholder}
              onChange={e => set(p.name, e.target.value)}/>
          ))}
          <div className="flex justify-end pt-2">
            <SaveBtn saving={saving === 'policies'} onClick={savePolicies}/>
          </div>
        </div>
      )}

      {/* ── BUSINESS HOURS ──────────────────────────────────────────────── */}
      {tab === 'hours' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-900">Show Business Hours</p>
              <p className="text-xs text-gray-400 mt-0.5">Display your operating hours on your public store page</p>
            </div>
            <button onClick={() => set('business_hours_enabled', !data.business_hours_enabled)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${data.business_hours_enabled ? 'bg-green-500' : 'bg-gray-200'}`}>
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${data.business_hours_enabled ? 'translate-x-5' : 'translate-x-0'}`}/>
            </button>
          </div>

          {data.business_hours_enabled && (
            <div className="border border-gray-100 rounded-xl overflow-hidden">
              {DAYS.map((day, i) => {
                const h = data.business_hours?.[day] || { open:'09:00', close:'18:00', closed: false };
                return (
                  <div key={day} className={`flex items-center gap-4 px-5 py-3 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                    <span className="w-12 text-sm font-medium text-gray-700">{DAY_LABELS[day]}</span>
                    <button onClick={() => setHour(day, 'closed', !h.closed)}
                      className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border-2 border-transparent transition-colors ${!h.closed ? 'bg-green-500' : 'bg-gray-200'}`}>
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ${!h.closed ? 'translate-x-4' : 'translate-x-0'}`}/>
                    </button>
                    {!h.closed ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input type="time" value={h.open} onChange={e => setHour(day, 'open', e.target.value)}
                          className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:ring-1 focus:ring-green-500 focus:outline-none"/>
                        <span className="text-gray-400 text-sm">–</span>
                        <input type="time" value={h.close} onChange={e => setHour(day, 'close', e.target.value)}
                          className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:ring-1 focus:ring-green-500 focus:outline-none"/>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400 italic flex-1">Closed</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Vacation mode */}
          <div className="border-t border-gray-100 pt-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-semibold text-gray-900">Vacation Mode</p>
                <p className="text-xs text-gray-400 mt-0.5">Pause your store while you're away. Customers will see your vacation message.</p>
              </div>
              <button onClick={() => set('vacation_mode', !data.vacation_mode)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${data.vacation_mode ? 'bg-amber-500' : 'bg-gray-200'}`}>
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${data.vacation_mode ? 'translate-x-5' : 'translate-x-0'}`}/>
              </button>
            </div>
            {data.vacation_mode && (
              <div className="space-y-3">
                <FieldRow label="Vacation Message">
                  <Textarea rows={2} value={data.vacation_message} onChange={e => set('vacation_message', e.target.value)}
                    placeholder="e.g. We are away until Jan 20. Orders placed now will ship on Jan 21."/>
                </FieldRow>
                <div className="grid grid-cols-2 gap-3">
                  <FieldRow label="From">
                    <Input type="date" value={data.vacation_start_date} onChange={e => set('vacation_start_date', e.target.value)}/>
                  </FieldRow>
                  <FieldRow label="Until">
                    <Input type="date" value={data.vacation_end_date} onChange={e => set('vacation_end_date', e.target.value)}/>
                  </FieldRow>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <SaveBtn saving={saving === 'hours'} onClick={saveHours}/>
          </div>
        </div>
      )}

      {/* ── SOCIAL LINKS ────────────────────────────────────────────────── */}
      {tab === 'social' && (
        <div className="space-y-5">
          <p className="text-sm text-gray-500">Social links appear on your public store page and help customers find and follow you.</p>
          {[
            { name:'social_facebook',  label:'Facebook',  placeholder:'https://facebook.com/yourpage' },
            { name:'social_instagram', label:'Instagram', placeholder:'https://instagram.com/yourhandle' },
            { name:'social_twitter',   label:'X / Twitter', placeholder:'https://x.com/yourhandle' },
            { name:'social_linkedin',  label:'LinkedIn',  placeholder:'https://linkedin.com/in/yourprofile' },
            { name:'social_youtube',   label:'YouTube',   placeholder:'https://youtube.com/@yourchannel' },
          ].map(s => (
            <FieldRow key={s.name} label={s.label}>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400 w-24 flex-shrink-0">{s.placeholder.split('/')[2]}</span>
                <Input type="url" value={data[s.name]} onChange={e => set(s.name, e.target.value)} placeholder={s.placeholder}/>
              </div>
            </FieldRow>
          ))}
          <div className="flex justify-end pt-2">
            <SaveBtn saving={saving === 'social'} onClick={saveSocial}/>
          </div>
        </div>
      )}

      {/* ── DOCUMENTS ───────────────────────────────────────────────────── */}
      {tab === 'documents' && (
        <div className="space-y-3">
          <p className="text-sm text-gray-500 mb-4">
            Required documents for seller verification. Accepted formats: JPG, PNG, PDF, WebP · max 5MB each.
          </p>
          <div className="bg-white border border-gray-100 rounded-xl divide-y divide-gray-50">
            <DocumentRow
              label="Business Registration Certificate"
              fieldName="business_registration_document"
              value={storeData?.business_registration_document}
              onUpload={uploadDocument}
              uploading={docUploading}
              hint="Official company registration document"
            />
            <DocumentRow
              label="Tax Registration Document"
              fieldName="tax_registration_document"
              value={storeData?.tax_registration_document}
              onUpload={uploadDocument}
              uploading={docUploading}
              hint="TIN or tax registration certificate"
            />
            <DocumentRow
              label="Identity Document (Front)"
              fieldName="identity_document_front"
              value={storeData?.identity_document_front}
              onUpload={uploadDocument}
              uploading={docUploading}
              hint="NRC, passport, or driving licence — front side"
            />
            <DocumentRow
              label="Identity Document (Back)"
              fieldName="identity_document_back"
              value={storeData?.identity_document_back}
              onUpload={uploadDocument}
              uploading={docUploading}
              hint="NRC, passport, or driving licence — back side"
            />
          </div>
          {storeData?.verification_status && (
            <div className={`mt-4 flex items-center gap-2 px-4 py-3 rounded-xl text-sm
              ${storeData.verification_status === 'verified' ? 'bg-green-50 border border-green-200 text-green-800'
                : storeData.verification_status === 'rejected' ? 'bg-red-50 border border-red-200 text-red-800'
                : 'bg-amber-50 border border-amber-200 text-amber-800'}`}>
              <CheckCircleIcon className="h-4 w-4 flex-shrink-0"/>
              <span>Verification status: <strong className="capitalize">{storeData.verification_status}</strong>
                {storeData.verification_notes && ` — ${storeData.verification_notes}`}
              </span>
            </div>
          )}
        </div>
      )}

      {/* ── PASSWORD ────────────────────────────────────────────────────── */}
      {tab === 'security' && (
        <div className="max-w-md space-y-5">
          <p className="text-sm text-gray-500">Update your account password. Use at least 8 characters with a mix of letters and numbers.</p>
          {[
            { key:'current', label:'Current Password' },
            { key:'next',    label:'New Password',     hint:'Minimum 8 characters' },
            { key:'confirm', label:'Confirm New Password' },
          ].map(f => (
            <FieldRow key={f.key} label={f.label} hint={f.hint}>
              <Input type="password" value={pwd[f.key]} onChange={e => setPwd(p => ({ ...p, [f.key]: e.target.value }))} placeholder="••••••••"/>
            </FieldRow>
          ))}
          <SaveBtn saving={pwdSaving} onClick={savePassword} label="Change Password"/>
        </div>
      )}
    </div>
  );
};

export default StoreProfileEditor;