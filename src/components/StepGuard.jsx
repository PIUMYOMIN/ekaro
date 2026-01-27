// components/StepGuard.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const StepGuard = ({ children, step }) => {
  const [isValid, setIsValid] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    const validateStep = async () => {
      if (!user) {
        navigate('/login');
        return;
      }

      // Check if user is a seller
      if (user.type !== 'seller' && !user.roles?.includes('seller')) {
        navigate('/');
        return;
      }

      try {
        const response = await api.get('/seller/onboarding/status');
        
        if (response.data.success) {
          const statusData = response.data.data;
          
          // If onboarding is complete, redirect to dashboard
          if (statusData.onboarding_complete && !statusData.needs_onboarding) {
            navigate('/seller/dashboard');
            return;
          }

          // Check if user can access this step
          const currentStep = statusData.current_step;
          const stepOrder = ['store-basic', 'business-details', 'address', 'documents', 'review-submit'];
          
          const currentIndex = stepOrder.indexOf(currentStep);
          const requestedIndex = stepOrder.indexOf(step);

          if (requestedIndex < 0) {
            // Invalid step
            navigate('/seller/onboarding/store-basic');
          } else if (requestedIndex > currentIndex) {
            // Trying to skip ahead - redirect to current step
            navigate(`/seller/onboarding/${currentStep}`);
          } else {
            // Valid step
            setIsValid(true);
          }
        }
      } catch (error) {
        console.error('Step validation failed:', error);
        navigate('/seller/onboarding/store-basic');
      } finally {
        setLoading(false);
      }
    };

    validateStep();
  }, [user, navigate, step, location]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Validating onboarding step...</p>
        </div>
      </div>
    );
  }

  return isValid ? children : null;
};

export default StepGuard;