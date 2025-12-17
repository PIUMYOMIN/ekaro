import { useState, useEffect } from 'react';
import api from '../utils/api';

export const useSellerOnboarding = () => {
  const [onboardingData, setOnboardingData] = useState(() => {
    const savedData = localStorage.getItem('seller_onboarding_data');
    try {
      return savedData ? JSON.parse(savedData) : {};
    } catch (error) {
      console.error('Error parsing onboarding data:', error);
      return {};
    }
  });

  const [currentStep, setCurrentStep] = useState('store-basic');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const response = await api.get('/seller/onboarding/status');
      if (response.data.success) {
        const { data } = response.data;
        
        if (data.has_profile) {
          setCurrentStep(data.current_step || 'store-basic');
          
          // If we have stored data but API says we're at a different step, 
          // clear local storage to avoid conflicts
          if (data.current_step && Object.keys(onboardingData).length > 0) {
            const stepOrder = ['store-basic', 'business-details', 'address', 'documents', 'review-submit'];
            const currentIndex = stepOrder.indexOf(currentStep);
            const apiIndex = stepOrder.indexOf(data.current_step);
            
            if (apiIndex < currentIndex) {
              // Clear local storage if API says we're behind
              clearOnboardingData();
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to check onboarding status:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOnboardingData = (newData) => {
    const updatedData = { ...onboardingData, ...newData };
    setOnboardingData(updatedData);
    localStorage.setItem('seller_onboarding_data', JSON.stringify(updatedData));
  };

  const clearOnboardingData = () => {
    setOnboardingData({});
    localStorage.removeItem('seller_onboarding_data');
  };

  const getCurrentStep = () => {
    return currentStep;
  };

  const getProgressPercentage = () => {
    const steps = ['store-basic', 'business-details', 'address', 'documents', 'review-submit'];
    const currentIndex = steps.indexOf(currentStep);
    return currentIndex >= 0 ? ((currentIndex + 1) / steps.length) * 100 : 0;
  };

  return {
    onboardingData,
    updateOnboardingData,
    clearOnboardingData,
    getCurrentStep,
    getProgressPercentage,
    loading
  };
};