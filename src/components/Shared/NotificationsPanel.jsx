// src/components/Shared/NotificationsPanel.jsx
// Reusable notification panel — used in Buyer, Seller, and Admin dashboards
import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BellIcon, CheckCircleIcon, TrashIcon,
  ShoppingBagIcon, StarIcon, BuildingStorefrontIcon,
  InformationCircleIcon, XMarkIcon,
} from '@heroicons/react/24/outline';
import { BellAlertIcon } from '@heroicons/react/24/solid';
import api from '../../utils/api';

// ── Icon per notification type ───────────────────────────────────────────────
const typeIcon = (type) => {
  const cls = 'h-5 w-5 flex-shrink-0';
  switch (type) {
    case 'order_placed':
    case 'order_status_changed':
    case 'new_order':       return <ShoppingBagIcon  className={`${cls} text-blue-500`} />;
    case 'product_review':  return <StarIcon          className={`${cls} text-yellow-500`} />;
    case 'seller_approved': return <BuildingStorefrontIcon className={`${cls} text-green-500`} />;
    case 'seller_rejected': return <XMarkIcon         className={`${cls} text-red-500`} />;
    case 'welcome':         return <BellIcon          className={`${cls} text-green-400`} />;
    default:                return <InformationCircleIcon className={`${cls} text-gray-400`} />;
  }
};

// Relative time — "2 minutes ago", "yesterday" etc.
const relativeTime = (dateStr) => {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60)         return 'Just now';
  if (diff < 3600)       return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)      return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800)     return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString('en-GB', { day:'2-digit', month:'short' });
};

// ── Main component ────────────────────────────────────────────────────────────
const NotificationsPanel = () => {
  const { t } = useTranslation();
  const [items,       setItems]       = useState([]);
  const [unread,      setUnread]      = useState(0);
  const [loading,     setLoading]     = useState(true);
  const [filter,      setFilter]      = useState('all'); // 'all' | 'unread'
  const [page,        setPage]        = useState(1);
  const [hasMore,     setHasMore]     = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchNotifications = useCallback(async (reset = true) => {
    reset ? setLoading(true) : setLoadingMore(true);
    try {
      const p = reset ? 1 : page;
      const res = await api.get('/notifications', {
        params: { per_page: 20, page: p, ...(filter === 'unread' ? { unread: true } : {}) }
      });
      const { data, unread_count, meta } = res.data;
      setUnread(unread_count ?? 0);
      setItems(prev => reset ? data : [...prev, ...data]);
      setHasMore(meta.current_page < meta.last_page);
      if (!reset) setPage(p + 1);
    } catch { /* silent */ }
    finally { reset ? setLoading(false) : setLoadingMore(false); }
  }, [filter, page]);

  useEffect(() => {
    setPage(1);
    fetchNotifications(true);
  }, [filter]);               // eslint-disable-line react-hooks/exhaustive-deps

  const markRead = async (id) => {
    await api.post(`/notifications/${id}/read`).catch(() => {});
    setItems(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
    setUnread(u => Math.max(0, u - 1));
  };

  const markAllRead = async () => {
    await api.post('/notifications/read-all').catch(() => {});
    setItems(prev => prev.map(n => ({ ...n, read_at: n.read_at ?? new Date().toISOString() })));
    setUnread(0);
  };

  const remove = async (id) => {
    await api.delete(`/notifications/${id}`).catch(() => {});
    setItems(prev => prev.filter(n => n.id !== id));
    setUnread(u => Math.max(0, u - 1));
  };

  const clearAll = async () => {
    await api.delete('/notifications').catch(() => {});
    setItems([]);
    setUnread(0);
  };

  const visible = filter === 'unread' ? items.filter(n => !n.read_at) : items;

  return (
    <div className="space-y-4">

      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          {unread > 0
            ? <BellAlertIcon className="h-5 w-5 text-green-600" />
            : <BellIcon      className="h-5 w-5 text-gray-500" />}
          Notifications
          {unread > 0 && (
            <span className="bg-green-600 text-white text-xs font-semibold
                             px-2 py-0.5 rounded-full">
              {unread}
            </span>
          )}
        </h2>
        <div className="flex gap-2">
          {unread > 0 && (
            <button onClick={markAllRead}
              className="text-xs text-green-700 hover:text-green-900 font-medium
                         border border-green-200 hover:border-green-400
                         px-2.5 py-1 rounded-lg transition-colors">
              Mark all read
            </button>
          )}
          {items.length > 0 && (
            <button onClick={clearAll}
              className="text-xs text-red-500 hover:text-red-700 font-medium
                         border border-red-200 hover:border-red-400
                         px-2.5 py-1 rounded-lg transition-colors">
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* ── Filter tabs ─────────────────────────────────────── */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {['all', 'unread'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors
              ${filter === f
                ? 'bg-white text-green-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'}`}>
            {f === 'all' ? 'All' : `Unread${unread > 0 ? ` (${unread})` : ''}`}
          </button>
        ))}
      </div>

      {/* ── List ────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="space-y-0 divide-y divide-gray-50">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start gap-3 p-4 animate-pulse">
                <div className="h-8 w-8 bg-gray-200 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <BellIcon className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">
              {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {visible.map(n => {
              const data    = typeof n.data === 'string' ? JSON.parse(n.data) : n.data;
              const isUnread = !n.read_at;
              return (
                <div key={n.id}
                  className={`flex items-start gap-3 p-4 transition-colors
                    ${isUnread ? 'bg-green-50/60 hover:bg-green-50' : 'hover:bg-gray-50'}`}>

                  {/* icon */}
                  <div className={`mt-0.5 p-1.5 rounded-full flex-shrink-0
                    ${isUnread ? 'bg-white shadow-sm' : 'bg-gray-100'}`}>
                    {typeIcon(data?.type)}
                  </div>

                  {/* content */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-snug
                      ${isUnread ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                      {data?.message || 'New notification'}
                    </p>
                    {data?.order_number && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        Order #{data.order_number}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {relativeTime(n.created_at)}
                    </p>
                  </div>

                  {/* actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {isUnread && (
                      <button onClick={() => markRead(n.id)}
                        title="Mark as read"
                        className="p-1.5 text-green-500 hover:text-green-700
                                   hover:bg-green-100 rounded-lg transition-colors">
                        <CheckCircleIcon className="h-4 w-4" />
                      </button>
                    )}
                    <button onClick={() => remove(n.id)}
                      title="Remove"
                      className="p-1.5 text-gray-300 hover:text-red-500
                                 hover:bg-red-50 rounded-lg transition-colors">
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>

                  {/* unread dot */}
                  {isUnread && (
                    <span className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0 mt-1.5" />
                  )}
                </div>
              );
            })}

            {/* load more */}
            {hasMore && (
              <div className="p-4 text-center">
                <button
                  onClick={() => fetchNotifications(false)}
                  disabled={loadingMore}
                  className="text-sm text-green-700 font-medium hover:text-green-900
                             disabled:opacity-50">
                  {loadingMore ? 'Loading…' : 'Load more'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Bell badge for headers/sidebars ──────────────────────────────────────────
export const NotificationBell = ({ onClick }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    api.get('/notifications?per_page=1').then(r => {
      setCount(r.data.unread_count ?? 0);
    }).catch(() => {});

    // Poll every 60s
    const id = setInterval(() => {
      api.get('/notifications?per_page=1').then(r => {
        setCount(r.data.unread_count ?? 0);
      }).catch(() => {});
    }, 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <button onClick={onClick}
      className="relative p-2 text-gray-500 hover:text-gray-700
                 hover:bg-gray-100 rounded-xl transition-colors">
      {count > 0
        ? <BellAlertIcon className="h-5 w-5 text-green-600" />
        : <BellIcon      className="h-5 w-5" />}
      {count > 0 && (
        <span className="absolute top-1 right-1 bg-green-500 text-white
                         text-[10px] font-bold w-4 h-4 flex items-center
                         justify-center rounded-full leading-none">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </button>
  );
};

export default NotificationsPanel;