import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import api from "../../utils/api";
import { 
  TruckIcon
} from "@heroicons/react/24/solid";

const ShippingSettings = ({ storeData }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [shippingSettings, setShippingSettings] = useState({
    enabled: false,
    delivery_areas: [],
    shipping_methods: [],
    free_shipping_threshold: 0,
    shipping_rates: {}
  });

  useEffect(() => {
    // Load existing shipping settings
    if (storeData) {
      setShippingSettings({
        enabled: storeData.shipping_enabled || false,
        delivery_areas: storeData.delivery_areas || [],
        shipping_methods: storeData.shipping_methods || [],
        free_shipping_threshold: storeData.free_shipping_threshold || 0,
        shipping_rates: storeData.shipping_rates || {}
      });
    }
  }, [storeData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await api.put('/seller/shipping/settings', shippingSettings);
      if (response.data.success) {
        setMessage({
          type: "success",
          text: "Shipping settings updated successfully!"
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Failed to update shipping settings"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {t("seller.shipping")}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Configure shipping options for your store
          </p>
        </div>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`p-4 rounded-xl ${message.type === "success" ? "bg-green-50" : "bg-red-50"}`}>
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Enable/Disable Shipping */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Enable Shipping</h3>
              <p className="text-sm text-gray-500">Allow customers to select shipping options</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={shippingSettings.enabled}
                onChange={(e) => setShippingSettings(prev => ({
                  ...prev,
                  enabled: e.target.checked
                }))}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>

          {/* More shipping settings would go here... */}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors font-medium disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Shipping Settings"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShippingSettings;