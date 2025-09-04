// src/components/ProtectedRoute.jsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, roles = [] }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div>Loading...</div>;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const userRoleNames = user.roles?.map(r => r.name) || [];

  if (roles.length > 0 && !roles.some(role => userRoleNames.includes(role))) {
    if (userRoleNames.includes('admin')) {
      return <Navigate to="/admin" replace />;
    } else if (userRoleNames.includes('seller')) {
      return <Navigate to="/seller" replace />;
    }
    return <Navigate to="/products" replace />;
  }

  return children;
};

export default ProtectedRoute;
