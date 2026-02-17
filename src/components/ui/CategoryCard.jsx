// CategoryCard.jsx (updated responsive version)
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import { useTranslation } from "react-i18next";
import { DEFAULT_PLACEHOLDER } from "../../config";

const CategoryCard = ({ category }) => {
  const { t } = useTranslation();

  if (!category || category.products_count === 0) {
    return null;
  }

  const imageSrc = category.image || DEFAULT_PLACEHOLDER;

  return (
    <motion.div
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
      whileHover={{ scale: 1.03 }}
    >
      <Link to={`/products?category=${category.id}`} className="block">
        {/* Image container – responsive height */}
        <div className="relative h-24 sm:h-32 md:h-40 bg-gray-200 overflow-hidden">
          <LazyLoadImage
            src={imageSrc}
            alt={category.name_en}
            effect="blur"
            className="w-full h-full object-cover"
            placeholderSrc="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 300'%3E%3Crect width='300' height='300' fill='%23e5e7eb'/%3E%3C/svg%3E"
          />
          {/* Gradient overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          
          {/* Text overlay – responsive padding and font sizes */}
          <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 md:p-4">
            <h3 className="text-sm sm:text-base md:text-lg font-semibold text-white line-clamp-1">
              {category.name_en}
            </h3>
            <p className="text-xs sm:text-sm text-white/90">
              {category.products_count} {t("category.products")}
            </p>
            {/* Subcategories count – hidden on mobile */}
            {category.children_count > 0 && (
              <p className="hidden sm:block text-xs text-white/80">
                ({category.children_count}) {t("category.subcategories")}
              </p>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default CategoryCard;