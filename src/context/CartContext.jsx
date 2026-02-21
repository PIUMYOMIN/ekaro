// src/context/CartContext.jsx
import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';
import api from '../utils/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [cartSummary, setCartSummary] = useState({
    shipping_fee: 0,
    tax_rate: 0,
    tax: 0,
    total: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch cart from server
  const fetchCartItems = useCallback(async () => {
    if (!user) {
      resetCart();
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/cart');
      const cartData = response.data.data || {};
      setCartItems(cartData.cart_items || []);
      setSubtotal(cartData.subtotal || 0);
      setTotalItems(cartData.total_items || 0);
      setCartSummary(cartData.summary || {
        shipping_fee: 0,
        tax_rate: 0,
        tax: 0,
        total: 0
      });
    } catch (err) {
      console.error('Failed to fetch cart:', err);
      setError(err.response?.data?.message || 'Failed to fetch cart');
      resetCart();
    } finally {
      setLoading(false);
    }
  }, [user]);

  const resetCart = () => {
    setCartItems([]);
    setSubtotal(0);
    setTotalItems(0);
    setCartSummary({ shipping_fee: 0, tax_rate: 0, tax: 0, total: 0 });
  };

  // Add to cart with optimistic update
  const addToCart = async (productId, quantity = 1) => {
  if (!user) throw new Error('Please login');

  setLoading(true);
  setError(null);

  // 🔥 Optimistic update
  setTotalItems(prev => prev + quantity);

  try {
    const response = await api.post('/cart', {
      product_id: productId,
      quantity
    });

    // 🔥 Always sync with backend to ensure accuracy
    await fetchCartItems();

    return {
      success: true,
      message: response.data.message || 'Added to cart'
    };

  } catch (err) {
    // 🔥 Revert optimistic update safely
    setTotalItems(prev => Math.max(prev - quantity, 0));

    const msg =
      err.response?.data?.message || 'Failed to add to cart';

    setError(msg);
    throw new Error(msg);

  } finally {
    setLoading(false);
  }
};

  // Update quantity with optimistic update
  const updateQuantity = async (cartItemId, newQuantity) => {
    const itemIndex = cartItems.findIndex(item => item.id === cartItemId);
    if (itemIndex === -1) return;

    const oldQuantity = cartItems[itemIndex].quantity;
    const quantityDiff = newQuantity - oldQuantity;

    // Optimistic update
    setTotalItems(prev => prev + quantityDiff);
    // Also update the item locally (optional, but better)
    const updatedItems = [...cartItems];
    updatedItems[itemIndex].quantity = newQuantity;
    updatedItems[itemIndex].subtotal = updatedItems[itemIndex].price * newQuantity;
    setCartItems(updatedItems);

    setLoading(true);
    try {
      await api.put(`/cart/${cartItemId}`, { quantity: newQuantity });
      await fetchCartItems(); // sync
    } catch (err) {
      // Revert
      setTotalItems(prev => prev - quantityDiff);
      await fetchCartItems(); // fetch actual state
      const msg = err.response?.data?.message || 'Failed to update';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (cartItemId) => {
    const item = cartItems.find(i => i.id === cartItemId);
    if (!item) return;

    // Optimistic remove
    setTotalItems(prev => prev - item.quantity);
    setCartItems(prev => prev.filter(i => i.id !== cartItemId));

    setLoading(true);
    try {
      await api.delete(`/cart/${cartItemId}`);
      await fetchCartItems();
    } catch (err) {
      await fetchCartItems();
      const msg = err.response?.data?.message || 'Failed to remove';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    // Optimistic clear
    const oldTotal = totalItems;
    setTotalItems(0);
    setCartItems([]);
    setSubtotal(0);
    setCartSummary({ shipping_fee: 0, tax_rate: 0, tax: 0, total: 0 });

    setLoading(true);
    try {
      await api.post('/cart/clear');
      await fetchCartItems();
    } catch (err) {
      setTotalItems(oldTotal);
      await fetchCartItems();
      const msg = err.response?.data?.message || 'Failed to clear';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartItems();
  }, [fetchCartItems]);

  const value = useMemo(() => ({
    cartItems,
    cartSummary,
    subtotal,
    totalItems,
    loading,
    error,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    refetchCart: fetchCartItems
  }), [
    cartItems, cartSummary, subtotal, totalItems, loading, error,
    addToCart, updateQuantity, removeFromCart, clearCart, fetchCartItems
  ]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};