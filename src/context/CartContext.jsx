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
      const response = await api.get('/buyer/cart');
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

  // Add to cart
  const addToCart = async (productId, quantity = 1) => {
    if (!user) throw new Error('Please login');

    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/buyer/cart', {
        product_id: productId,
        quantity
      });

      // Refresh cart to get accurate data
      await fetchCartItems();

      return {
        success: true,
        message: response.data.message || 'Added to cart'
      };

    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add to cart';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Update quantity
  const updateQuantity = async (cartItemId, newQuantity) => {
    if (!user) throw new Error('Please login');
    
    // Find current item
    const currentItem = cartItems.find(item => item.id === cartItemId);
    if (!currentItem) return;

    // Optimistic update
    const oldCartItems = [...cartItems];
    const oldTotalItems = totalItems;
    const oldSubtotal = subtotal;
    
    const updatedItems = cartItems.map(item => 
      item.id === cartItemId 
        ? { ...item, quantity: newQuantity, subtotal: item.price * newQuantity }
        : item
    );
    
    const newSubtotal = updatedItems.reduce((sum, item) => sum + item.subtotal, 0);
    const newTotalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
    
    setCartItems(updatedItems);
    setSubtotal(newSubtotal);
    setTotalItems(newTotalItems);
    setCartSummary(prev => ({
      ...prev,
      subtotal: newSubtotal,
      tax: newSubtotal * prev.tax_rate,
      total: newSubtotal + prev.shipping_fee + (newSubtotal * prev.tax_rate)
    }));

    try {
      const response = await api.put(`/buyer/cart/${cartItemId}`, { quantity: newQuantity });
      await fetchCartItems();
      return response.data;
    } catch (err) {
      // Revert on error
      setCartItems(oldCartItems);
      setSubtotal(oldSubtotal);
      setTotalItems(oldTotalItems);
      await fetchCartItems();
      
      const msg = err.response?.data?.message || 'Failed to update quantity';
      setError(msg);
      throw new Error(msg);
    }
  };

  // Remove from cart
  const removeFromCart = async (cartItemId) => {
    if (!user) throw new Error('Please login');
    
    // Find current item
    const currentItem = cartItems.find(item => item.id === cartItemId);
    if (!currentItem) return;

    // Optimistic update
    const oldCartItems = [...cartItems];
    const oldTotalItems = totalItems;
    const oldSubtotal = subtotal;
    
    const updatedItems = cartItems.filter(item => item.id !== cartItemId);
    const newSubtotal = updatedItems.reduce((sum, item) => sum + item.subtotal, 0);
    const newTotalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
    
    setCartItems(updatedItems);
    setSubtotal(newSubtotal);
    setTotalItems(newTotalItems);
    setCartSummary(prev => ({
      ...prev,
      subtotal: newSubtotal,
      tax: newSubtotal * prev.tax_rate,
      total: newSubtotal + prev.shipping_fee + (newSubtotal * prev.tax_rate)
    }));

    try {
      const response = await api.delete(`/buyer/cart/${cartItemId}`);
      await fetchCartItems();
      return response.data;
    } catch (err) {
      // Revert on error
      setCartItems(oldCartItems);
      setSubtotal(oldSubtotal);
      setTotalItems(oldTotalItems);
      await fetchCartItems();
      
      const msg = err.response?.data?.message || 'Failed to remove item';
      setError(msg);
      throw new Error(msg);
    }
  };

  // Clear cart
  const clearCart = async () => {
    if (!user) throw new Error('Please login');

    // Optimistic clear
    const oldCartItems = [...cartItems];
    const oldTotalItems = totalItems;
    const oldSubtotal = subtotal;
    const oldCartSummary = { ...cartSummary };
    
    setCartItems([]);
    setTotalItems(0);
    setSubtotal(0);
    setCartSummary({
      shipping_fee: 0,
      tax_rate: 0,
      tax: 0,
      total: 0
    });

    try {
      const response = await api.post('/buyer/cart/clear');
      await fetchCartItems();
      return response.data;
    } catch (err) {
      // Revert on error
      setCartItems(oldCartItems);
      setTotalItems(oldTotalItems);
      setSubtotal(oldSubtotal);
      setCartSummary(oldCartSummary);
      await fetchCartItems();
      
      const msg = err.response?.data?.message || 'Failed to clear cart';
      setError(msg);
      throw new Error(msg);
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