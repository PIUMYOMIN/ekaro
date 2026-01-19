// components/SellerRouteGuard.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const SellerRouteGuard = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    checkSellerStatus();
  }, []);

  const checkSellerStatus = async () => {
    try {
      const response = await api.get('/seller/onboarding/status');
      
      if (response.data.success) {
        const statusData = response.data.data;
        
        if (statusData.needs_onboarding || !statusData.onboarding_complete) {
          navigate(`/seller/onboarding/${statusData.current_step || 'store-basic'}`);
        }
      }
    } catch (error) {
      navigate('/seller/onboarding/store-basic');
    }
  };

  return children;
};

export default SellerRouteGuard;