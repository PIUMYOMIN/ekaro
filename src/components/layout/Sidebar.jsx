// src/components/layout/Sidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Sidebar = () => {
  const { t } = useTranslation();

  const navigation = [
    {
      name: t("sidebar.dashboard"),
      href: "/seller/dashboard",
      icon: "dashboard"
    },
    {
      name: t("sidebar.products"),
      href: "/seller/products",
      icon: "inventory"
    },
    { name: t("sidebar.orders"), href: "/seller/orders", icon: "orders" },
    {
      name: t("sidebar.customers"),
      href: "/seller/customers",
      icon: "customers"
    },
    { name: t("sidebar.payments"), href: "/seller/payments", icon: "payments" },
    { name: t("sidebar.settings"), href: "/seller/settings", icon: "settings" }
  ];

  return (
    <div className="hidden md:flex md:w-64 bg-gray-800 text-white">
      <div className="w-full py-6">
        <div className="px-4 mb-6">
          <h2 className="text-2xl font-bold">မြန်မာ B2B</h2>
          <p className="text-gray-400 text-sm">
            {t("sidebar.seller_portal")}
          </p>
        </div>

        <nav className="mt-6">
          <ul className="space-y-1 px-2">
            {navigation.map(item =>
              <li key={item.name}>
                <NavLink
                  to={item.href}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-2 rounded-md ${isActive
                      ? "bg-gray-900 text-white font-medium"
                      : "text-gray-300 hover:bg-gray-700"}`}
                >
                  <span className="mr-3">
                    {item.icon}
                  </span>
                  <span>
                    {item.name}
                  </span>
                </NavLink>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
