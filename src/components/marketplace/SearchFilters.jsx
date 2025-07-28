import React from 'react';
import { useTranslation } from 'react-i18next';

const SearchFilters = ({ mobile = false }) => {
  const { t } = useTranslation();

  const filters = [
    {
      id: 'price',
      name: t('product.price_range'),
      options: [
        { value: '0-10000', label: 'Under 10,000 MMK' },
        { value: '10000-50000', label: '10,000 - 50,000 MMK' },
        { value: '50000-100000', label: '50,000 - 100,000 MMK' },
        { value: '100000-', label: 'Over 100,000 MMK' },
      ],
    },
    {
      id: 'seller',
      name: t('product.seller_type'),
      options: [
        { value: 'verified', label: t('product.verified_sellers') },
        { value: 'premium', label: t('product.premium_sellers') },
        { value: 'local', label: t('product.local_sellers') },
      ],
    },
  ];

  return (
    <div className={`space-y-6 ${mobile ? 'px-1' : ''}`}>
      {filters.map((section) => (
        <div key={section.id}>
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            {section.name}
          </h4>
          <div className="space-y-3">
            {section.options.map((option, optionIdx) => (
              <div key={option.value} className="flex items-center">
                <input
                  id={`filter-${section.id}-${optionIdx}`}
                  name={`${section.id}[]`}
                  defaultValue={option.value}
                  type="checkbox"
                  className={`h-4 w-4 border-gray-300 rounded text-green-600 focus:ring-green-500 ${mobile ? 'mr-2' : 'mr-3'}`}
                />
                <label
                  htmlFor={`filter-${section.id}-${optionIdx}`}
                  className="text-sm text-gray-600"
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SearchFilters;