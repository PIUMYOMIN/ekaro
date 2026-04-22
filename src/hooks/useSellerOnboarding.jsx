// hooks/useSellerOnboarding.js
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { resolveSellerOnboardingStep } from '../utils/sellerOnboarding';

export const useSellerOnboarding = () => {
  const [onboardingStatus, setOnboardingStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const checkOnboarding = async () => {
    try {
      setLoading(true);
      const response = await api.get('/seller/onboarding/status');
      
      if (response.data.success) {
        const statusData = response.data.data;
        setOnboardingStatus(statusData);
        
        if (statusData.needs_onboarding || !statusData.onboarding_complete) {
          const step = await resolveSellerOnboardingStep(statusData);
          navigate(`/seller/onboarding/${step}`);
          return false;
        }
        return true;
      }
    } catch (error) {
      console.error('Onboarding check failed:', error);
      navigate('/seller/onboarding/store-basic');
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkOnboarding();
  }, []);

  return { onboardingStatus, loading, checkOnboarding };
};