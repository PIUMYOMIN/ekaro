import React, { createContext, useState, useContext, useEffect } from 'react';
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
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Fetch cart items from backend
  const fetchCartItems = async () => {
    // Don't fetch cart if user is not logged in
    if (!user) {
      setCartItems([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/cart');
      setCartItems(response.data.data.cart_items || []);
    } catch (error) {
      // Handle 403 (Forbidden) gracefully - should not happen now but keep for safety
      if (error.response?.status === 403) {
        console.log('Cart access not available');
        setCartItems([]);
      } else if (error.response?.status === 500) {
        console.error('Server error fetching cart:', error);
        setError('Server error while loading cart');
      } else {
        console.error('Failed to fetch cart items:', error);
        setError(error.response?.data?.message || 'Failed to fetch cart items');
      }
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Add item to cart
  const addToCart = async (product) => {
    if (!user) {
      throw new Error('Please login to add items to cart');
    }

    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/cart', {
        product_id: product.id,
        quantity: product.quantity || 1
      });

      // Refresh cart items
      await fetchCartItems();

      return {
        success: true,
        message: response.data.message || 'Product added to cart successfully'
      };
    } catch (error) {
      let errorMessage = 'Failed to add product to cart';
      
      if (error.response?.status === 403) {
        errorMessage = 'Cart functionality not available for your account type';
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data.message || errorMessage;
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error while adding to cart';
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Update quantity
  const updateQuantity = async (cartItemId, quantity) => {
    if (!user) {
      throw new Error('Please login to update cart');
    }

    setLoading(true);
    setError(null);
    try {
      await api.put(`/cart/${cartItemId}`, { quantity });
      
      // Refresh cart items
      await fetchCartItems();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update quantity';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Remove from cart
  const removeFromCart = async (cartItemId) => {
    if (!user) {
      throw new Error('Please login to modify cart');
    }

    setLoading(true);
    setError(null);
    try {
      await api.delete(`/cart/${cartItemId}`);
      
      // Refresh cart items
      await fetchCartItems();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to remove item from cart';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Clear cart
  const clearCart = async () => {
    if (!user) {
      throw new Error('Please login to clear cart');
    }

    setLoading(true);
    setError(null);
    try {
      await api.post('/cart/clear');
      
      // Refresh cart items
      await fetchCartItems();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to clear cart';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Calculate totals
  const subtotal = cartItems.reduce((total, item) => {
    return total + (Number(item.price) * Number(item.quantity));
  }, 0);
  
  const totalItems = cartItems.reduce((total, item) => {
    return total + Number(item.quantity);
  }, 0);

  // Initialize cart when user changes
  useEffect(() => {
    if (user) {
      fetchCartItems();
    } else {
      setCartItems([]);
    }
  }, [user]);

  const value = {
    cartItems,
    loading,
    error,
    subtotal,
    totalItems,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    fetchCartItems,
    refetchCart: fetchCartItems
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};