// src/components/layout/Footer.jsx
import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              {t("footer.company")}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/about-us"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  {t("footer.about")}
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  {t("footer.contact")}
                </Link>
              </li>
              <li>
                <Link
                  to="/careers"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  {t("footer.careers")}
                </Link>
              </li>
              <li>
                <Link
                  to="/blog"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  {t("footer.blog")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Sellers Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              {t("footer.sellers")}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/register"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  {t("footer.become_seller")}
                </Link>
              </li>
              <li>
                <Link
                  to="/seller/guidelines"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  {t("footer.seller_guidelines")}
                </Link>
              </li>
              <li>
                <Link
                  to="/pricing"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  {t("footer.pricing")}
                </Link>
              </li>
              <li>
                <Link
                  to="/resources"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  {t("footer.resources")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              {t("footer.support")}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/help"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  {t("footer.help_center")}
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  {t("footer.faq")}
                </Link>
              </li>
              <li>
                <Link
                  to="/shipping"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  {t("footer.shipping")}
                </Link>
              </li>
              <li>
                <Link
                  to="/returns"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  {t("footer.returns")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              {t("footer.legal")}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/privacy"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  {t("footer.privacy")}
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  {t("footer.terms")}
                </Link>
              </li>
              <li>
                <Link
                  to="/security"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  {t("footer.security")}
                </Link>
              </li>
              <li>
                <Link
                  to="/compliance"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  {t("footer.compliance")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-8 pt-8 border-t border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold mb-2">
                {t("footer.contact_info")}
              </h4>
              <p className="text-gray-300">
                {t("footer.address")}
              </p>
              <p className="text-gray-300">
                {t("footer.phone")}
              </p>
              <p className="text-gray-300">
                {t("footer.email")}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">
                {t("footer.follow_us")}
              </h4>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  {t("footer.facebook")}
                </a>
                <a
                  href="#"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  {t("footer.twitter")}
                </a>
                <a
                  href="#"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  {t("footer.linkedin")}
                </a>
                <a
                  href="#"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  {t("footer.instagram")}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-gray-700 text-center">
          <p className="text-gray-300">
            &copy; {new Date().getFullYear()} {t("footer.copyright")}
          </p>
          <p className="text-gray-400 text-sm mt-2">
            {t("footer.rights_reserved")}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
