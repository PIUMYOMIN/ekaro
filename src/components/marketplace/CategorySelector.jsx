import React from 'react';
import { useTranslation } from 'react-i18next';

const CategorySelector = ({ mobile = false }) => {
  const { t } = useTranslation();
  
  const categories = [
    { id: 'agriculture', name: 'Agriculture', count: 120 },
    { id: 'handicrafts', name: 'Handicrafts', count: 86 },
    { id: 'textiles', name: 'Textiles', count: 64 },
    { id: 'furniture', name: 'Furniture', count: 42 },
    { id: 'food', name: 'Food & Beverage', count: 95 },
    { id: 'construction', name: 'Construction', count: 37 },
  ];

  return (
    <div className={`space-y-4 ${mobile ? 'px-1' : ''}`}>
      {categories.map((category) => (
        <div key={category.id} className="flex items-center">
          <input
            id={`category-${category.id}`}
            name={`category[]`}
            type="checkbox"
            className={`h-4 w-4 border-gray-300 rounded text-green-600 focus:ring-green-500 ${mobile ? 'mr-2' : 'mr-3'}`}
          />
          <label
            htmlFor={`category-${category.id}`}
            className="text-sm text-gray-600"
          >
            {category.name} ({category.count})
          </label>
        </div>
      ))}
    </div>
  );
};

export default CategorySelector;