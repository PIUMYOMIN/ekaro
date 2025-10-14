// src/components/SellerOnboardingRoute.jsx
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../utils/api';
import {useTranslation} from 'react-i18next';

const SellerOnboardingRoute = ({ children }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user) {
        navigate('/login');
        return;
      }

      try {
        console.log('Checking onboarding status for user...');
        
        const response = await api.get('/sellers/onboarding-status');
        const status = response.data.data;
        
        console.log('Onboarding status:', status);

        // If user is not a seller, redirect to home
        if (!status.is_seller) {
          console.log('User is not a seller, redirecting to home');
          navigate('/');
          return;
        }

        // ✅ UPDATED: If onboarding is complete, redirect to dashboard
        if (status.onboarding_complete) {
          console.log('Onboarding complete, redirecting to dashboard');
          navigate('/seller/dashboard');
          return;
        }

        // ✅ UPDATED: If user has profile but onboarding not started/completed
        if (status.needs_onboarding) {
          // If user hasn't started onboarding (pending_setup) or is in progress
          const currentStepMap = {
            'store-basic': '/seller/onboarding/store-basic',
            'business-details': '/seller/onboarding/business-details', 
            'address': '/seller/onboarding/address',
            'complete': '/seller/dashboard'
          };

          const expectedPath = currentStepMap[status.current_step];
          
          // Redirect to appropriate step if not already there
          if (expectedPath && location.pathname !== expectedPath) {
            console.log('Redirecting to step:', status.current_step);
            navigate(expectedPath);
            return;
          }
        }

        // Allow access to the requested route
        console.log('Allowing access to onboarding route');

      } catch (error) {
        console.error('Error checking onboarding status:', error);
        
        // If endpoint doesn't exist, allow access to onboarding
        if (error.response?.status === 404) {
          console.log('Onboarding endpoint not found, allowing access');
        } else {
          console.error('Failed to check onboarding status');
        }
      } finally {
        setLoading(false);
      }
    };

    checkOnboardingStatus();
  }, [user, navigate, location]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking seller status...</p>
        </div>
      </div>
    );
  }

  return children;
};

export default SellerOnboardingRoute;