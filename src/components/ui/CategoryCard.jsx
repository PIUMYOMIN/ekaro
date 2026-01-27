import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import { useTranslation } from "react-i18next";

const CategoryCard = ({ category }) => {
  const { t } = useTranslation();

  return <motion.div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300" whileHover={{ scale: 1.03 }}>
      <Link to={`/products?category=${category.id}`} className="block">
        <div className="relative h-40 bg-gray-200 overflow-hidden">
          <LazyLoadImage src={category.image || `https://source.unsplash.com/random/300x300?${category.name_en}`} alt={category.name_en} effect="blur" className="w-full h-full object-cover" placeholderSrc="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 300'%3E%3Crect width='300' height='300' fill='%23e5e7eb'/%3E%3C/svg%3E" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-lg font-semibold text-white">
              {category.name_en}
            </h3>
            <p className="text-sm text-white/90">
              {category.count} {t("category.products")}
            </p>
            <p className="text-white/90">
              ({category.children.length})
            </p>
          </div>
        </div>
      </Link>
    </motion.div>;
};

export default CategoryCard;
