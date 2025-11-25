// src/hooks/useSellerOnboarding.js
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

const STORAGE_KEY = "seller_onboarding_data";

const initialData = {
  // Store Basic Info
  store_name: "",
  business_type: "",
  description: "",
  contact_email: "",
  contact_phone: "",
  store_logo: "",
  store_banner: "",

  // Business Details
  business_registration_number: "",
  tax_id: "",
  website: "",
  account_number: "",
  social_facebook: "",
  social_instagram: "",
  social_twitter: "",
  social_linkedin: "",

  // Address Info
  address: "",
  city: "",
  state: "",
  country: "Myanmar",
  postal_code: "",
  location: "",

  // Additional Info
  year_established: "",
  employees_count: "",
  production_capacity: ""
};

export const useSellerOnboarding = () => {
  const { t } = useTranslation();
  const [onboardingData, setOnboardingData] = useState(initialData);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    const loadData = () => {
      try {
        const savedData = localStorage.getItem(STORAGE_KEY);

        if (savedData) {
          const parsedData = JSON.parse(savedData);
          setOnboardingData(parsedData);
        }
      } catch (error) {
        console.error(
          "❌ Failed to parse onboarding data from localStorage:",
          error
        );
        // If parsing fails, clear corrupted data
        localStorage.removeItem(STORAGE_KEY);
      }
      setIsLoaded(true);
    };

    loadData();
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(
    () => {
      if (isLoaded) {
        console.log("💾 Saving to localStorage:", onboardingData);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(onboardingData));
      }
    },
    [onboardingData, isLoaded]
  );

  const updateOnboardingData = newData => {
    console.log("📝 Updating onboarding data:", newData);
    setOnboardingData(prev => ({
      ...prev,
      ...newData
    }));
  };

  const clearOnboardingData = () => {
    console.log("🗑️ Clearing onboarding data");
    localStorage.removeItem(STORAGE_KEY);
    setOnboardingData(initialData);
  };

  return {
    onboardingData,
    updateOnboardingData,
    clearOnboardingData,
    isLoaded
  };
};
