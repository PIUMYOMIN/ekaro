// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper function to normalize user roles with deep extraction
  const normalizeUserRoles = (userData) => {
    if (!userData) return userData;

    let roles = [];

    // Case 1: roles is an array of role objects
    if (userData.roles && Array.isArray(userData.roles)) {
      roles = userData.roles.map(role => {
        if (typeof role === 'object' && role !== null) {
          // Try different possible property names
          return role.name || role.role || role.title || JSON.stringify(role);
        }
        return role; // Already a string
      });
    }
    // Case 2: roles is a single object
    else if (userData.roles && typeof userData.roles === 'object') {
      roles = [userData.roles.name || userData.roles.role || JSON.stringify(userData.roles)];
    }
    // Case 3: roles is a single string
    else if (typeof userData.roles === 'string') {
      roles = [userData.roles];
    }
    // Case 4: use type field as fallback
    else if (userData.type) {
      roles = [userData.type];
    }
    // Case 5: check for role field (singular)
    else if (userData.role) {
      roles = [userData.role];
    }

    // Filter out any null/undefined and ensure strings
    roles = roles.filter(role => role).map(role => role.toString());

    return {
      ...userData,
      roles: roles,
      // For backward compatibility
      role: roles[0] || userData.type || userData.role || 'buyer'
    };
  };

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await api.get('/auth/me');
          const normalizedUser = normalizeUserRoles(response.data.data);
          setUser(normalizedUser);
          localStorage.setItem('user', JSON.stringify(normalizedUser));
        } catch (err) {
          console.error('Failed to load user from API', err);
          // Try to load from localStorage as fallback
          const savedUser = localStorage.getItem('user');
          if (savedUser) {
            try {
              const parsedUser = JSON.parse(savedUser);
              const normalizedUser = normalizeUserRoles(parsedUser);
              setUser(normalizedUser);
            } catch (parseError) {
              console.error('Failed to parse saved user', parseError);
              logout();
            }
          } else {
            logout();
          }
        }
      } else {
        // No token, try to load from localStorage
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          try {
            const parsedUser = JSON.parse(savedUser);
            const normalizedUser = normalizeUserRoles(parsedUser);
            setUser(normalizedUser);
          } catch (parseError) {
            console.error('Failed to parse saved user', parseError);
          }
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
      const normalizedUser = normalizeUserRoles(response.data.data.user);
      localStorage.setItem('user', JSON.stringify(normalizedUser));
      setUser(normalizedUser);
      return { success: true, user: normalizedUser };
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
      const normalizedUser = normalizeUserRoles(response.data.data.user);
      localStorage.setItem('user', JSON.stringify(normalizedUser));
      setUser(normalizedUser);
      return { success: true, user: normalizedUser };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Registration failed'
      };
    }
  };

  const logout = () => {
    // Immediate client-side cleanup
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);

    // Fire-and-forget server logout - ignore any errors
    api.post('/auth/logout').catch(() => {
      // This is expected to sometimes fail with 401 - that's OK!
    });
  };

  // Helper methods for role checks
  const hasRole = (role) => {
    if (!user) return false;

    // Check roles array
    if (user.roles && Array.isArray(user.roles)) {
      const hasRoleInArray = user.roles.some(r => {
        if (typeof r === 'string') return r === role;
        if (typeof r === 'object') return (r.name || r.role || r.title) === role;
        return false;
      });
      if (hasRoleInArray) return true;
    }

    // Check single role fields
    return user.role === role || user.type === role;
  };

  // Add method to get user's primary role
  const getPrimaryRole = () => {
    if (!user) return null;

    if (hasRole('admin')) return 'admin';
    if (hasRole('seller')) return 'seller';
    if (hasRole('buyer')) return 'buyer';

    return user.role || user.type || 'buyer';
  };

  const isBuyer = () => hasRole('buyer');
  const isSeller = () => hasRole('seller');
  const isAdmin = () => hasRole('admin');

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    canAddToCart: () => !!user,
    canAddToWishlist: () => !!user,
    isAuthenticated: !!user,
    // Role check methods
    isBuyer,
    isSeller,
    isAdmin,
    hasRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);