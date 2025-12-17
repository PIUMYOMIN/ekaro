// src/components/SellerOnboardingRoute.jsx - Updated
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../utils/api";
import { useTranslation } from "react-i18next";

const SellerOnboardingRoute = ({ children }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user) {
        navigate("/login");
        return;
      }

      if (!user.roles?.includes("seller")) {
        navigate("/");
        return;
      }

      try {
        const response = await api.get("/seller/onboarding/status");
        const status = response.data.data;

        // If onboarding is complete and verified, redirect to dashboard
        if (status.onboarding_complete && status.verified) {
          navigate("/seller", { replace: true });
          return;
        }

        // If user is on a different step than they should be, redirect them
        const currentPath = location.pathname;
        const currentStep = currentPath.split('/').pop();
        
        // Map steps to check order
        const steps = ['store-basic', 'business-details', 'address', 'submit', 'documents'];
        const currentStepIndex = steps.indexOf(currentStep);
        const expectedStepIndex = steps.indexOf(status.current_step);

        // If user is trying to access a step that comes after their current step, redirect them
        if (currentStepIndex > expectedStepIndex && currentStep !== 'documents') {
          navigate(`/seller/onboarding/${status.current_step}`, { replace: true });
          return;
        }

        // Special case for documents - check if store info is submitted first
        if (currentStep === 'documents' && !status.onboarding_complete) {
          // Check if they have submitted store info
          const hasStoreInfo = status.profile?.store_name && 
                              status.profile?.business_type && 
                              status.profile?.address;
          
          if (!hasStoreInfo) {
            navigate('/seller/onboarding/store-basic', { replace: true });
            return;
          }
        }

      } catch (error) {
        console.log("Onboarding status endpoint not available:", error);
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