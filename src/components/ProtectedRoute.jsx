// src/components/ProtectedRoute.jsx - Enhanced version
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, roles = [] }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login with return url
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Check if user has required roles
  if (roles.length > 0) {
    const hasRequiredRole = roles.some(role => 
      user?.roles?.includes(role) || user?.role === role || user?.type === role
    );
    
    if (!hasRequiredRole) {
      // Redirect to appropriate dashboard based on user role
      if (user?.roles?.includes('admin') || user?.role === 'admin') {
        return <Navigate to="/admin" replace />;
      } else if (user?.roles?.includes('seller') || user?.role === 'seller') {
        return <Navigate to="/seller" replace />;
      } else {
        return <Navigate to="/buyer" replace />;
      }
    }
  }

  return children;
};

export default ProtectedRoute;