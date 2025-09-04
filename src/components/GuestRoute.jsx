// src/components/GuestRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (user) {
    const roles = user.roles?.map(r => r.name) || [];

    if (roles.includes('admin')) return <Navigate to="/admin" replace />;
    if (roles.includes('seller')) return <Navigate to="/seller" replace />;
    if (roles.includes('buyer')) return <Navigate to="/buyer" replace />;
    
    return <Navigate to="/" replace />;
  }

  return children;
};

export default GuestRoute;
