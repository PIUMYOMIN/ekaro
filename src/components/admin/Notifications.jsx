import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { CheckCircleIcon, XCircleIcon, BellIcon } from '@heroicons/react/24/outline';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'unread'

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/admin/notifications');
      setNotifications(response.data.notifications || []);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.post(`/admin/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n)
      );
    } catch (error) {
      console.error('Failed to mark as read', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post('/admin/notifications/read-all');
      setNotifications(prev =>
        prev.map(n => ({ ...n, read_at: new Date().toISOString() }))
      );
    } catch (error) {
      console.error('Failed to mark all as read', error);
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read_at;
    return true;
  });

  const getIcon = (type) => {
    switch (type) {
      case 'order':
        return <ShoppingBagIcon className="h-5 w-5 text-blue-500" />;
      case 'user':
        return <UserGroupIcon className="h-5 w-5 text-green-500" />;
      case 'dispute':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'payment':
        return <CurrencyDollarIcon className="h-5 w-5 text-yellow-500" />;
      default:
        return <BellIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('my-MM', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading notifications...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">အကြောင်းကြားချက်များ</h1>
        <button
          onClick={markAllAsRead}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
        >
          အားလုံးဖတ်ပြီးမှတ်ရန်
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex border-b mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 font-medium ${filter === 'all' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
        >
          အားလုံး
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 font-medium ${filter === 'unread' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
        >
          မဖတ်ရသေး
          {notifications.filter(n => !n.read_at).length > 0 && (
            <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
              {notifications.filter(n => !n.read_at).length}
            </span>
          )}
        </button>
      </div>

      {filteredNotifications.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <BellIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">အကြောင်းကြားချက်များ မရှိပါ။</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotifications.map(notification => (
            <div
              key={notification.id}
              className={`bg-white rounded-lg shadow-md p-4 flex items-start hover:shadow-lg transition-shadow ${
                !notification.read_at ? 'border-l-4 border-blue-500' : ''
              }`}
            >
              <div className="flex-shrink-0 mr-4">
                {getIcon(notification.type)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{notification.title}</h3>
                    <p className="text-gray-600 mt-1">{notification.message}</p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDate(notification.created_at)}
                  </div>
                </div>
                {notification.link && (
                  <a
                    href={notification.link}
                    className="text-blue-600 text-sm hover:underline mt-2 inline-block"
                  >
                    ကြည့်ရှုရန်
                  </a>
                )}
              </div>
              {!notification.read_at && (
                <button
                  onClick={() => markAsRead(notification.id)}
                  className="ml-4 text-green-600 hover:text-green-800"
                  title="ဖတ်ပြီးမှတ်ရန်"
                >
                  <CheckCircleIcon className="h-5 w-5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;