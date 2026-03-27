// src/components/shared/NotificationPreferences.jsx
// Used in both BuyerDashboard and SellerDashboard settings.
// Props: userType ('buyer'|'seller'), initialPrefs, onSaved
import React, { useState } from 'react';
import { CheckCircleIcon, BellIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import api from '../../utils/api';

const DEFAULT_PREFS = {
  // All users
  order_updates:        true,
  promotional_emails:   true,
  newsletter:           false,
  security_alerts:      true,
  // Seller only
  new_orders:           true,
  review_notifications: true,
  seller_updates:       true,
};

const BUYER_GROUPS = [
  {
    title: 'Order & Account',
    icon: '📦',
    items: [
      { key:'order_updates',      label:'Order updates',       hint:'Status changes, shipping, delivery confirmations' },
      { key:'security_alerts',    label:'Security alerts',     hint:'Login from new device, password changes' },
    ],
  },
  {
    title: 'Promotions & News',
    icon: '🎁',
    items: [
      { key:'promotional_emails', label:'Promotional emails',  hint:'Discounts, flash sales, special offers' },
      { key:'newsletter',         label:'Pyonea newsletter',   hint:'New sellers, product highlights, platform news' },
    ],
  },
];

const SELLER_GROUPS = [
  {
    title: 'Orders & Reviews',
    icon: '🛒',
    items: [
      { key:'new_orders',           label:'New orders',            hint:'Email when a buyer places an order in your store' },
      { key:'order_updates',        label:'Order status updates',  hint:'When order status changes (shipped, delivered, etc.)' },
      { key:'review_notifications', label:'Product reviews',       hint:'When a buyer leaves a review on your product' },
    ],
  },
  {
    title: 'Seller Updates',
    icon: '📋',
    items: [
      { key:'seller_updates',     label:'Seller announcements',  hint:'Policy changes, fee updates, platform news for sellers' },
      { key:'promotional_emails', label:'Promotional tips',      hint:'Best practices, seasonal selling tips, new features' },
    ],
  },
  {
    title: 'Account & Security',
    icon: '🔒',
    items: [
      { key:'security_alerts',    label:'Security alerts',       hint:'Login from new device, password changes' },
      { key:'newsletter',         label:'Pyonea newsletter',     hint:'General platform updates and highlights' },
    ],
  },
];

const Toggle = ({ checked, onChange, disabled }) => (
  <button onClick={onChange} disabled={disabled} type="button"
    className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none disabled:opacity-40
      ${checked ? 'bg-green-500' : 'bg-gray-200'}`}>
    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${checked ? 'translate-x-4' : 'translate-x-0'}`}/>
  </button>
);

const NotificationPreferences = ({ userType = 'buyer', initialPrefs = {}, onSaved }) => {
  const [prefs,   setPrefs]   = useState({ ...DEFAULT_PREFS, ...initialPrefs });
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [error,   setError]   = useState('');

  const set = (key, val) => setPrefs(p => ({ ...p, [key]: val }));

  const save = async () => {
    setSaving(true); setError(''); setSaved(false);
    try {
      await api.put('/notification-preferences', prefs);
      setSaved(true);
      if (onSaved) onSaved(prefs);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to save preferences.');
    } finally {
      setSaving(false);
    }
  };

  const groups = userType === 'seller' ? SELLER_GROUPS : BUYER_GROUPS;

  return (
    <div className="space-y-6 max-w-lg">
      <div className="flex items-start gap-3">
        <div className="p-2.5 bg-green-100 rounded-xl flex-shrink-0">
          <BellIcon className="h-5 w-5 text-green-700"/>
        </div>
        <div>
          <h3 className="text-base font-semibold text-gray-900">Email Notifications</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            Choose which emails you receive from Pyonea. You can change these at any time.
          </p>
        </div>
      </div>

      {groups.map(group => (
        <div key={group.title} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
            <span>{group.icon}</span>
            <span className="text-sm font-semibold text-gray-700">{group.title}</span>
          </div>
          <div className="divide-y divide-gray-50">
            {group.items.map(item => (
              <div key={item.key} className="flex items-center justify-between px-5 py-3.5 gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{item.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.hint}</p>
                </div>
                <Toggle
                  checked={prefs[item.key] ?? DEFAULT_PREFS[item.key] ?? false}
                  onChange={() => set(item.key, !(prefs[item.key] ?? DEFAULT_PREFS[item.key] ?? false))}
                  disabled={saving}
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Unsubscribe note */}
      <div className="flex items-start gap-2 px-1">
        <EnvelopeIcon className="h-4 w-4 text-gray-300 flex-shrink-0 mt-0.5"/>
        <p className="text-xs text-gray-400">
          Security alerts cannot be disabled — they protect your account.
          Transactional emails (order confirmations, password resets) are always sent regardless of preferences.
        </p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center gap-3">
        <button onClick={save} disabled={saving}
          className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-xl disabled:opacity-50 transition-colors">
          {saving ? 'Saving…' : 'Save Preferences'}
        </button>
        {saved && (
          <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
            <CheckCircleIcon className="h-4 w-4"/> Saved
          </span>
        )}
      </div>
    </div>
  );
};

export default NotificationPreferences;