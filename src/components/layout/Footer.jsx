// src/components/layout/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-lg font-semibold mb-4">{t('footer.company')}</h3>
          <ul className="space-y-2">
            <li><Link to="/about-us" className="text-gray-300 hover:text-white">{t('footer.about')}</Link></li>
            <li><Link to="/contact" className="text-gray-300 hover:text-white">{t('footer.contact')}</Link></li>
            <li><Link to="/careers" className="text-gray-300 hover:text-white">{t('footer.careers')}</Link></li>
            <li><Link to="/blog" className="text-gray-300 hover:text-white">{t('footer.blog')}</Link></li>
          </ul>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-4">{t('footer.sellers')}</h3>
          <ul className="space-y-2">
            <li><Link to="/seller/register" className="text-gray-300 hover:text-white">{t('footer.become_seller')}</Link></li>
            <li><Link to="/seller/guidelines" className="text-gray-300 hover:text-white">{t('footer.seller_guidelines')}</Link></li>
            <li><Link to="/pricing" className="text-gray-300 hover:text-white">{t('footer.pricing')}</Link></li>
            <li><Link to="/resources" className="text-gray-300 hover:text-white">{t('footer.resources')}</Link></li>
          </ul>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-4">{t('footer.support')}</h3>
          <ul className="space-y-2">
            <li><Link to="/help-center" className="text-gray-300 hover:text-white">{t('footer.help_center')}</Link></li>
            <li><Link to="/faq" className="text-gray-300 hover:text-white">{t('footer.faq')}</Link></li>
            <li><Link to="/shipping" className="text-gray-300 hover:text-white">{t('footer.shipping')}</Link></li>
            <li><Link to="/returns" className="text-gray-300 hover:text-white">{t('footer.returns')}</Link></li>
          </ul>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-4">{t('footer.legal')}</h3>
          <ul className="space-y-2">
            <li><Link to="/privacy" className="text-gray-300 hover:text-white">{t('footer.privacy')}</Link></li>
            <li><Link to="/terms" className="text-gray-300 hover:text-white">{t('footer.terms')}</Link></li>
            <li><Link to="/security" className="text-gray-300 hover:text-white">{t('footer.security')}</Link></li>
            <li><Link to="/compliance" className="text-gray-300 hover:text-white">{t('footer.compliance')}</Link></li>
          </ul>
        </div>
      </div>
      
      <div className="mt-12 pt-8 border-t border-gray-700 text-center">
        <p>&copy; {new Date().getFullYear()} {t('footer.copyright')}</p>
      </div>
    </footer>
  );
};

export default Footer;