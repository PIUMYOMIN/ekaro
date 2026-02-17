import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const SearchFilters = ({ filters, onFilterChange, mobile = false }) => {
  const { t } = useTranslation();

  // Derive selected price range from filters
  const getSelectedPriceRange = () => {
    const { minPrice, maxPrice } = filters;
    if (!minPrice && !maxPrice) return '';
    if (minPrice === '' && maxPrice === '10000') return '0-10000';
    if (minPrice === '10000' && maxPrice === '50000') return '10000-50000';
    if (minPrice === '50000' && maxPrice === '100000') return '50000-100000';
    if (minPrice === '100000' && maxPrice === '') return '100000-';
    return '';
  };

  const [selectedPriceRange, setSelectedPriceRange] = useState(getSelectedPriceRange());

  // Sync local state when filters change externally
  useEffect(() => {
    setSelectedPriceRange(getSelectedPriceRange());
  }, [filters.minPrice, filters.maxPrice]);

  // Handle price range change (exclusive checkboxes)
  const handlePriceChange = (rangeValue) => {
    let newMin = '', newMax = '';
    if (rangeValue === '0-10000') { newMin = ''; newMax = '10000'; }
    else if (rangeValue === '10000-50000') { newMin = '10000'; newMax = '50000'; }
    else if (rangeValue === '50000-100000') { newMin = '50000'; newMax = '100000'; }
    else if (rangeValue === '100000-') { newMin = '100000'; newMax = ''; }
    // If the same range is clicked again, clear it
    else { newMin = ''; newMax = ''; }

    onFilterChange({ minPrice: newMin, maxPrice: newMax });
  };

  const priceRanges = [
    { value: '0-10000', label: t('filter.under_10000') },
    { value: '10000-50000', label: t('filter.10000_to_50000') },
    { value: '50000-100000', label: t('filter.50000_to_100000') },
    { value: '100000-', label: t('filter.over_100000') },
  ];

  return (
    <div className={`space-y-6 ${mobile ? 'px-1' : ''}`}>
      {/* Price Range Filter */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-2">
          {t('filter.price_range')}
        </h4>
        <div className="space-y-2">
          {priceRanges.map((range) => (
            <div key={range.value} className="flex items-center">
              <input
                type="checkbox"
                id={`price-${range.value}`}
                checked={selectedPriceRange === range.value}
                onChange={() => handlePriceChange(range.value)}
                className="h-4 w-4 border-gray-300 rounded text-green-600 focus:ring-green-500"
              />
              <label
                htmlFor={`price-${range.value}`}
                className="ml-3 text-sm text-gray-600"
              >
                {range.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Sort Order */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-2">
          {t('filter.sort_by')}
        </h4>
        <select
          value={`${filters.sortBy}:${filters.sortOrder}`}
          onChange={(e) => {
            const [sortBy, sortOrder] = e.target.value.split(':');
            onFilterChange({ sortBy, sortOrder });
          }}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
        >
          <option value="created_at:desc">{t('filter.newest')}</option>
          <option value="price:asc">{t('filter.price_low_to_high')}</option>
          <option value="price:desc">{t('filter.price_high_to_low')}</option>
          <option value="average_rating:desc">{t('filter.top_rated')}</option>
          <option value="review_count:desc">{t('filter.most_reviewed')}</option>
        </select>
      </div>
    </div>
  );
};

export default SearchFilters;