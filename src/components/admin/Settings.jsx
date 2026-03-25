import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";
import {
  KeyIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

/**
 * Admin Settings panel.
 * Contains the admin's own password change form.
 * System-level toggles (maintenance mode etc.) can be added here
 * once a backend endpoint exists for them.
 */
const Settings = () => {
  const { user } = useAuth();

  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password:     "",
    confirm_password: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg,     setPasswordMsg]     = useState(null);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.confirm_password) {
      setPasswordMsg({ type: "error", text: "New passwords do not match" });
      return;
    }
    if (passwordData.new_password.length < 8) {
      setPasswordMsg({ type: "error", text: "Password must be at least 8 characters" });
      return;
    }
    setPasswordLoading(true);
    setPasswordMsg(null);
    try {
      await api.put("/users/profile/password", {
        current_password:          passwordData.current_password,
        new_password:              passwordData.new_password,
        new_password_confirmation: passwordData.confirm_password,
      });
      setPasswordMsg({ type: "success", text: "Password changed successfully" });
      setPasswordData({ current_password: "", new_password: "", confirm_password: "" });
    } catch (err) {
      setPasswordMsg({ type: "error", text: err.response?.data?.message || "Failed to change password" });
    } finally {
      setPasswordLoading(false);
    }
  };

  const msgClass = (msg) =>
    msg?.type === "success"
      ? "bg-green-50 text-green-700 border border-green-200"
      : "bg-red-50 text-red-700 border border-red-200";

  return (
    <div className="space-y-6 max-w-2xl">

      {/* Account info */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center gap-3 mb-4">
          <ShieldCheckIcon className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Account</h3>
        </div>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex justify-between">
            <span className="font-medium text-gray-700">Name</span>
            <span>{user?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-gray-700">Email</span>
            <span>{user?.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-gray-700">Role</span>
            <span className="capitalize">{user?.type}</span>
          </div>
        </div>
      </div>

      {/* Password change */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center gap-3 mb-6">
          <KeyIcon className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
        </div>

        {passwordMsg && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${msgClass(passwordMsg)}`}>
            {passwordMsg.text}
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
          {[
            ["Current Password",    "current_password"],
            ["New Password",        "new_password"],
            ["Confirm New Password","confirm_password"],
          ].map(([label, name]) => (
            <div key={name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input
                type="password"
                name={name}
                value={passwordData[name]}
                onChange={(e) => setPasswordData(p => ({ ...p, [e.target.name]: e.target.value }))}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
              />
            </div>
          ))}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={passwordLoading}
              className="px-5 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
            >
              {passwordLoading ? "Changing…" : "Change Password"}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
};

export default Settings;