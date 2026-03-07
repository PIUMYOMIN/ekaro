import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import { useTranslation } from "react-i18next";
import { PhotoIcon } from "@heroicons/react/24/outline";
import { DEFAULT_PLACEHOLDER } from "../../config";

const CategoryCard = ({ category }) => {
  const { t } = useTranslation();

  if (!category || category.products_count === 0) {
    return null;
  }

  const imageSrc = category.image || DEFAULT_PLACEHOLDER;
  const hasImage = imageSrc !== DEFAULT_PLACEHOLDER;

  return (
    <motion.div
      className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <Link to={`/products?category=${category.id}`} className="block">
        {/* Image container – square aspect ratio */}
        <div className="aspect-square bg-gray-100 overflow-hidden">
          {hasImage ? (
            <LazyLoadImage
              src={imageSrc}
              alt={category.name_en}
              effect="blur"
              className="w-full h-full object-cover"
              placeholderSrc="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 300'%3E%3Crect width='300' height='300' fill='%23f3f4f6'/%3E%3C/svg%3E"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100">
              <PhotoIcon className="h-10 w-10 text-gray-400" />
              <span className="mt-1 text-xs text-gray-500">No image</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-2 sm:p-4">
          {/* Category name – visible on all screens */}
          <h3 className="text-sm sm:text-base font-medium text-gray-900 line-clamp-2 min-h-[2.5rem] sm:min-h-[3rem]">
            {category.name_en}
          </h3>
          
          {/* Product count badge – hidden on mobile, visible on sm+ */}
          <div className="hidden sm:flex sm:items-center mt-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {category.products_count} {t("category.products")}
            </span>
          </div>

          {/* Subcategories count – hidden on mobile, visible on sm+ */}
          {category.children_count > 0 && (
            <p className="hidden sm:block mt-1 text-xs text-gray-500">
              {category.children_count} {t("category.subcategories")}
            </p>
          )}
        </div>
      </Link>
    </motion.div>
  );
};

export default CategoryCard;