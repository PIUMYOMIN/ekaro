// src/components/SellerOnboardingRoute.jsx - Add debugging
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

      // ONLY redirect when onboarding is complete
      if (status.onboarding_complete) {
        navigate("/seller", { replace: true });
        return;
      }

      // Allow access to any onboarding step if not complete
      
    } catch (error) {
      console.log("Onboarding status endpoint not available");
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