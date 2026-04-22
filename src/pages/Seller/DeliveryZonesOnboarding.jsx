import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import OnboardingLayout from '../../components/OnboardingLayout';
import DeliveryZones from '../../components/seller/DeliveryZones';

const DeliveryZonesOnboarding = () => {
  const navigate = useNavigate();

  return (
    <OnboardingLayout
      title="Delivery Zones"
      description="Choose where you deliver and set the shipping fee for each delivery area before continuing."
      showFooter={false}
      currentStepOverride="delivery-zones"
    >
      <div className="p-6 space-y-6">
        <button
          type="button"
          onClick={() => navigate('/seller/onboarding/address')}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-green-700 dark:text-slate-300 dark:hover:text-green-400"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Address
        </button>

        <DeliveryZones
          showHeader={false}
          saveButtonLabel="Save Delivery Zones & Continue"
          onSaveSuccess={() => navigate('/seller/onboarding/documents')}
        />
      </div>
    </OnboardingLayout>
  );
};

export default DeliveryZonesOnboarding;
