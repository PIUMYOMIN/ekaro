// src/components/GuestRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (user) {

    const roles = Array.isArray(user.roles) ? user.roles : [];

    if (roles.includes('admin') || user.type === 'admin') return <Navigate to="/admin" replace />;
    if (roles.includes('seller') || user.type === 'seller') return <Navigate to="/seller" replace />;
    if (roles.includes('buyer') || user.type === 'buyer') return <Navigate to="/buyer" replace />;

    return <Navigate to="/" replace />;
  }

  return children;
};

export default GuestRoute;