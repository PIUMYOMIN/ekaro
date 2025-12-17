import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const OnboardingGuard = ({ children, currentStep }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkStep = async () => {
      try {
        const response = await api.get('/seller/onboarding/status');
        const { data } = response.data;
        
        if (data.needs_onboarding && data.current_step !== currentStep) {
          // Redirect to correct step
          navigate(`/seller/onboarding/${data.current_step}`);
        }
      } catch (error) {
        console.error('Failed to check onboarding step:', error);
      }
    };

    checkStep();
  }, [currentStep, navigate]);

  return <>{children}</>;
};

export default OnboardingGuard;