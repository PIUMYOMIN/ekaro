// src/pages/Admin/Dashboard.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import Sidebar from "../../components/layout/Sidebar";

const Dashboard = () => {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="flex-1 bg-gray-100">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold text-gray-900">
              {t("adminDashboard.title")}
            </h1>
          </div>
        </header>

        <main>
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
                <p className="text-gray-500">
                  {t("adminDashboard.welcome")}
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
