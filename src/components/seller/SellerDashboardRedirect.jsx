// components/SellerDashboardRedirect.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const SellerDashboardRedirect = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user) return;

      try {
        const response = await api.get('/seller/onboarding/status');
        
        if (response.data.success) {
          const statusData = response.data.data;
          
          if (statusData.needs_onboarding || !statusData.onboarding_complete) {
            // Redirect to onboarding
            navigate(`/seller/onboarding/${statusData.current_step || 'store-basic'}`);
          } else {
            // Redirect to dashboard
            navigate('/seller/dashboard');
          }
        }
      } catch (error) {
        console.error('Failed to check onboarding status:', error);
        // Default to onboarding if there's an error
        navigate('/seller/onboarding/store-basic');
      }
    };

    checkOnboardingStatus();
  }, [user, navigate]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Checking seller status...</p>
      </div>
    </div>
  );
};

export default SellerDashboardRedirect;