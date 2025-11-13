// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await api.get('/auth/me');
          setUser(response.data.data);
        } catch (err) {
          console.error('Failed to load user', err);
          logout();
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await api.post('/login', credentials);
      localStorage.setItem('token', response.data.data.token);
      const userData = response.data.data.user;
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return { success: true, user: userData };
    } catch (err) {
      return { 
        success: false, 
        message: err.response?.data?.message || 'Login failed' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/register', userData);
      localStorage.setItem('token', response.data.data.token);
      const registeredUser = response.data.data.user;
      
      // Normalize roles to array of strings
      if (registeredUser.roles) {
        if (Array.isArray(registeredUser.roles)) {
          // If it's an array of objects, extract the role names
          if (registeredUser.roles.length > 0 && typeof registeredUser.roles[0] === 'object') {
            registeredUser.roles = registeredUser.roles.map(role => role.name);
          }
          // If it's already array of strings, leave as is
        } else {
          // If it's a single string, convert to array
          registeredUser.roles = [registeredUser.roles];
        }
      }
      
      localStorage.setItem('user', JSON.stringify(registeredUser));
      setUser(registeredUser);
      return { success: true, user: registeredUser };
    } catch (err) {
      return { 
        success: false, 
        message: err.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    api.post('/auth/logout').catch(err => console.error('Logout error', err));
  };

  // Helper methods for cart and wishlist access
  const canAddToCart = () => {
    return !!user; // Any authenticated user can add to cart
  };

  const canAddToWishlist = () => {
    return !!user; // Any authenticated user can add to wishlist
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    canAddToCart,
    canAddToWishlist,
    isAuthenticated: !!user,
    // Helper methods for role checks (if still needed elsewhere)
    isBuyer: () => user?.role === 'buyer',
    isSeller: () => user?.role === 'seller',
    isAdmin: () => user?.role === 'admin',
    hasRole: (role) => user?.role === role,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);