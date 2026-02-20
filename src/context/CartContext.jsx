// src/context/CartContext.jsx
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
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

  // Fetch cart items from backend
  const fetchCartItems = useCallback(async () => {
    if (!user) {
      setCartItems([]);
      setSubtotal(0);
      setTotalItems(0);
      setCartSummary({ shipping_fee: 0, tax_rate: 0, tax: 0, total: 0 });
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/cart');
      console.log('Cart API response:', response.data);

      const cartData = response.data.data || {};
      const items = cartData.cart_items || [];
      const subtotalValue = cartData.subtotal || 0;
      const totalItemsValue = cartData.total_items || 0;
      const summary = cartData.summary || {
        shipping_fee: 0,
        tax_rate: 0,
        tax: 0,
        total: 0
      };

      setCartItems(items);
      setSubtotal(subtotalValue);
      setTotalItems(totalItemsValue);
      setCartSummary(summary);
    } catch (err) {
      console.error('Failed to fetch cart items:', err);
      setError(err.response?.data?.message || 'Failed to fetch cart items');
      setCartItems([]);
      setSubtotal(0);
      setTotalItems(0);
      setCartSummary({ shipping_fee: 0, tax_rate: 0, tax: 0, total: 0 });
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Add item to cart
  const addToCart = async (productId, quantity = 1) => {
    if (!user) {
      throw new Error('Please login to add items to cart');
    }

    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/cart', {
        product_id: productId,
        quantity
      });

      // Refresh cart after successful add
      await fetchCartItems();

      return {
        success: true,
        message: response.data.message || 'Product added to cart successfully'
      };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to add product to cart';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Update quantity
  const updateQuantity = async (cartItemId, newQuantity) => {
    if (!user) {
      throw new Error('Please login to update cart');
    }

    setLoading(true);
    setError(null);
    try {
      await api.put(`/cart/${cartItemId}`, { quantity: newQuantity });
      await fetchCartItems(); // refresh
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update quantity';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Remove item from cart
  const removeFromCart = async (cartItemId) => {
    if (!user) {
      throw new Error('Please login to modify cart');
    }

    setLoading(true);
    setError(null);
    try {
      await api.delete(`/cart/${cartItemId}`);
      await fetchCartItems(); // refresh
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to remove item from cart';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    if (!user) {
      throw new Error('Please login to clear cart');
    }

    setLoading(true);
    setError(null);
    try {
      await api.post('/cart/clear');
      await fetchCartItems(); // refresh
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to clear cart';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch when user changes
  useEffect(() => {
    fetchCartItems();
  }, [fetchCartItems]);

  const value = {
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
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};