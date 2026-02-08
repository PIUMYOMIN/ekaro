import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import { useTranslation } from "react-i18next";

const CategoryCard = ({ category }) => {
  const { t } = useTranslation();

  const getImageUrl = (image) => {
    if (!image) return '/placeholder-category.jpg';
    
    if (image.startsWith('http')) {
      return image;
    }
    
    // Convert storage path to URL
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
    return `${baseUrl}/storage/${image.replace('public/', '')}`;
  };

  const hasChildren = category.children_count > 0 || (category.children && category.children.length > 0);
  const productCount = category.count || category.products_count || 0;
  const childrenCount = category.childrenCount || category.children_count || (category.children ? category.children.length : 0);

  return (
    <motion.div 
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col"
      whileHover={{ y: -5 }}
    >
      <Link 
        to={hasChildren ? `/categories?parent=${category.id}` : `/products?category=${category.id}`} 
        className="block flex-grow"
      >
        <div className="relative h-40 bg-gray-200 overflow-hidden">
          <LazyLoadImage
            src={category.image ? getImageUrl(category.image) : '/placeholder-category.jpg'}
            alt={category.name_en}
            effect="blur"
            className="w-full h-full object-cover"
            placeholderSrc="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 300'%3E%3Crect width='300' height='300' fill='%23e5e7eb'/%3E%3C/svg%3E"
            onError={(e) => {
              e.target.src = '/placeholder-category.jpg';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          
          {/* Badges */}
          <div className="absolute top-2 right-2 flex flex-col gap-1">
            {productCount > 0 && (
              <span className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                {productCount} {t("category.products")}
              </span>
            )}
            {hasChildren && (
              <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                {childrenCount} {t("category.subcategories")}
              </span>
            )}
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-lg font-semibold text-white mb-1">
              {category.name_en}
            </h3>
            {category.name_mm && (
              <p className="text-sm text-white/90 mb-1">
                {category.name_mm}
              </p>
            )}
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/80">
                {hasChildren 
                  ? t("category.click_to_view_subcategories")
                  : t("category.click_to_view_products")
                }
              </span>
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
          </div>
        </div>
      </Link>
      
      {/* Description (if available) */}
      {category.description_en && (
        <div className="p-3 border-t border-gray-100">
          <p className="text-sm text-gray-600 line-clamp-2">
            {category.description_en}
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default CategoryCard;