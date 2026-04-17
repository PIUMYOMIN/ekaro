import React from "react";
import { useAuth } from "../../context/AuthContext";
import { ShieldCheckIcon } from "@heroicons/react/24/outline";
import ChangePasswordForm from "../Shared/ChangePasswordForm";

/**
 * Admin Settings panel.
 * System-level toggles (maintenance mode etc.) can be added here
 * once a backend endpoint exists for them.
 */
const Settings = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-2xl">

      {/* Account info */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <ShieldCheckIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Account</h3>
        </div>
        <div className="space-y-2 text-sm text-gray-600 dark:text-slate-400">
          <div className="flex justify-between">
            <span className="font-medium text-gray-700 dark:text-slate-300">Name</span>
            <span className="text-gray-900 dark:text-slate-100">{user?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-gray-700 dark:text-slate-300">Email</span>
            <span className="text-gray-900 dark:text-slate-100">{user?.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-gray-700 dark:text-slate-300">Role</span>
            <span className="capitalize text-gray-900 dark:text-slate-100">{user?.type}</span>
          </div>
        </div>
      </div>

      <ChangePasswordForm />

    </div>
  );
};

export default Settings;