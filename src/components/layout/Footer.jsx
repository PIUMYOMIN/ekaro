// src/components/layout/Footer.jsx
import React from "react";
import NewsletterWidget from "../ui/NewsletterWidget";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCookies } from "../../context/CookieContext";

const Footer = () => {
  const { t } = useTranslation();
  const { openBanner } = useCookies();

  return (
    <footer className="bg-gray-900 dark:bg-slate-950 text-white theme-transition">
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
                  to="/seller-guidelines"
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
                  to="/return-policy"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  {t("footer.returns")}
                </Link>
              </li>
              <li>
                <Link
                  to="/track-order"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Track Your Order
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
                  to="/legal"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  {t("footer.legal")}
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy-policy"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  {t("footer.privacy")}
                </Link>
              </li>
            
              <li>
                <button
                  onClick={openBanner}
                  className="text-gray-300 hover:text-white transition-colors text-left"
                >
                  Cookie Settings
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="mt-10 pt-8 border-t border-gray-700">
          <div className="max-w-md mx-auto lg:mx-0">
            <NewsletterWidget variant="footer" source="footer" />
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
                <a href="tel:+959792115547">{t("footer.phone")}</a>
              </p>
              <p className="text-gray-300">
                {t("footer.address")}
              </p>
              <p className="text-gray-300">
                <a href="mailto:contact@pyonea.com">{t("footer.email")}</a>
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">
                {t("footer.follow_us")}
              </h4>
              <div className="flex space-x-4">
                <a
                  href="https://facebook.com/pyoneaofficial"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  {t("footer.facebook")}
                </a>
                <a
                  href="https://twitter.com/pyoneaofficial"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  {t("footer.twitter")}
                </a>
                <a
                  href="https://linkedin.com/company/pyoneaofficial"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  {t("footer.linkedin")}
                </a>
                <a
                  href="https://instagram.com/pyoneaofficial"
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
            &copy; {new Date().getFullYear()}
          </p>
          <p className="text-gray-400 text-sm mt-2">
            {t("footer.copyright")}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;