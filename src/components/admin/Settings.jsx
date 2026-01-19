import React from "react";
const Settings = () => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-6">
        System Settings
      </h3>
      <div className="space-y-6">
        <div className="bg-gray-50 p-6 rounded-xl">
          <h4 className="text-md font-medium text-gray-700 mb-4">
            General Settings
          </h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                Maintenance Mode
              </label>
              <button className="bg-gray-200 relative inline-flex h-6 w-11 items-center rounded-full">
                <span className="sr-only">Enable maintenance mode</span>
                <span className="translate-x-1 inline-block h-4 w-4 transform rounded-full bg-white"></span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;