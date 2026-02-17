import React from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronRightIcon } from '@heroicons/react/24/outline';

const CategorySelector = ({ categories, selectedCategory, onCategorySelect, mobile = false }) => {
  const { t } = useTranslation();

  // Filter out categories with zero products (including recursively)
  const filterZeroProductCategories = (cats) => {
    return cats
      .map(cat => ({
        ...cat,
        children: cat.children ? filterZeroProductCategories(cat.children) : []
      }))
      .filter(cat => cat.products_count > 0 || (cat.children && cat.children.length > 0));
  };

  const filteredCategories = filterZeroProductCategories(categories);

  // Recursive render function
  const renderCategory = (category, depth = 0) => {
    const isSelected = selectedCategory === String(category.id);
    const hasChildren = category.children && category.children.length > 0;

    return (
      <div key={category.id} className="select-none">
        <div
          className={`flex items-center justify-between py-2 px-2 rounded-md cursor-pointer transition-colors ${
            isSelected
              ? 'bg-green-100 text-green-800 font-medium'
              : 'hover:bg-gray-100 text-gray-700'
          } ${depth > 0 ? 'ml-4' : ''}`}
          onClick={() => onCategorySelect(category.id)}
        >
          <span className="text-sm truncate pr-2">
            {category.name_en || category.name}
          </span>
          <div className="flex items-center space-x-2">
            {category.products_count > 0 && (
              <span className="text-xs text-gray-500">
                ({category.products_count})
              </span>
            )}
            {hasChildren && (
              <ChevronRightIcon className="h-4 w-4 text-gray-400" />
            )}
          </div>
        </div>
        {/* Recursively render children */}
        {hasChildren &&
          category.children.map((child) => renderCategory(child, depth + 1))}
      </div>
    );
  };

  const isAllSelected = selectedCategory === null || selectedCategory === '';

  return (
    <div className={`space-y-1 ${mobile ? 'px-1' : ''}`}>
      {/* All Categories option */}
      <div
        className={`flex items-center justify-between py-2 px-2 rounded-md cursor-pointer transition-colors ${
          isAllSelected
            ? 'bg-green-100 text-green-800 font-medium'
            : 'hover:bg-gray-100 text-gray-700'
        }`}
        onClick={() => onCategorySelect(null)}
      >
        <span className="text-sm">{t('categories.all_categories')}</span>
      </div>

      {/* Render filtered root categories */}
      {filteredCategories
        .filter((cat) => !cat.parent_id)
        .map((rootCat) => renderCategory(rootCat))}
    </div>
  );
};

export default CategorySelector;