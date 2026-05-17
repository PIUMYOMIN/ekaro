// src/context/SubscriptionContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { useAuth } from './AuthContext';

const SubscriptionContext = createContext();

export const SubscriptionProvider = ({ children }) => {
  const { user, isSeller } = useAuth();
  const [subscription, setSubscription] = useState(null);  // full subscription object
  const [loading, setLoading]           = useState(false);

  const fetchSubscription = useCallback(async () => {
    if (!user || !isSeller()) return;
    setLoading(true);
    try {
      const res = await api.get('/seller/subscription');
      setSubscription(res.data.data ?? null);
    } catch {
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  }, [user, isSeller]);

  // Fetch once on login / user change
  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  // Clear on logout
  useEffect(() => {
    if (!user) setSubscription(null);
  }, [user]);

  /**
   * Check whether the seller's active plan includes a feature.
   * Falls back to false (Basic) when subscription hasn't loaded yet.
   *
   * Usage:  hasFeature('analytics_enabled')
   */
  const hasFeature = (flag) => {
    return subscription?.plan?.[flag] === true;
  };

  return (
    <SubscriptionContext.Provider value={{ subscription, loading, hasFeature, refetch: fetchSubscription }}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => useContext(SubscriptionContext);