import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import api from "../utils/api";
import CategoryCard from "../components/ui/CategoryCard";

// Skeleton loader matching the CategoryCard shape
const CategoryCardSkeleton = () => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-pulse">
    <div className="aspect-square bg-gray-300"></div>
    <div className="p-3 sm:p-4 space-y-2">
      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
      <div className="h-6 bg-gray-300 rounded w-1/3"></div>
      <div className="h-3 bg-gray-300 rounded w-1/2"></div>
    </div>
  </div>
);

const CategoryBrowser = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchCategories = async () => {
      try {
        setLoading(true);
        // Fetch categories with necessary fields
        const response = await api.get("/categories?fields=id,name_en,image,products_count,children&with_products_only=true");
        
        if (!isMounted) return;

        let categoriesData = response.data.data || [];
        
        // Process each category to include total product count (including children) if needed
        // But we'll keep it simple – use products_count as total for root category
        // If you need children counts, you can extend later
        const processed = categoriesData.map(cat => ({
          ...cat,
          // Ensure we have a consistent structure for CategoryCard
          name_en: cat.name_en || cat.name,
          products_count: cat.products_count || 0,
          children_count: cat.children?.length || 0,
          image: cat.image || null,
        }));

        setCategories(processed);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
        if (isMounted) setError("Failed to load categories. Please try again later.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCategories();

    return () => { isMounted = false; };
  }, []);

  // Filter categories by search
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const query = searchQuery.toLowerCase();
    return categories.filter(cat => 
      (cat.name_en || "").toLowerCase().includes(query)
    );
  }, [categories, searchQuery]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Browse Categories | Pyonea Marketplace</title>
        <meta name="description" content="Explore product categories on Pyonea. Find electronics, fashion, home goods and more from trusted Myanmar sellers." />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Header – simple gradient with search */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <h1 className="text-4xl font-bold text-white mb-4">
                Browse Categories
              </h1>
              <p className="text-lg text-green-100 max-w-2xl mx-auto mb-8">
                Discover products across all categories
              </p>

              {/* Search Bar */}
              <div className="max-w-md mx-auto">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search categories..."
                    className="w-full pl-12 pr-10 py-3 rounded-lg border-0 focus:ring-2 focus:ring-white bg-white/10 backdrop-blur-sm text-white placeholder-white/70"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {loading ? (
            // Skeleton grid
            <div className="grid grid-cols-2 gap-3 sm:gap-5 sm:grid-cols-3 lg:grid-cols-6">
              {[...Array(12)].map((_, i) => (
                <CategoryCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredCategories.length > 0 ? (
            <>
              {/* Optional result count */}
              <p className="text-sm text-gray-500 mb-4">
                Showing {filteredCategories.length} {filteredCategories.length === 1 ? 'category' : 'categories'}
              </p>
              <div className="grid grid-cols-2 gap-3 sm:gap-5 sm:grid-cols-3 lg:grid-cols-6">
                {filteredCategories.map((category) => (
                  <CategoryCard key={category.id} category={category} />
                ))}
              </div>
            </>
          ) : (
            // Empty state
            <div className="text-center py-16">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <MagnifyingGlassIcon className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No categories found
              </h3>
              <p className="text-gray-600 max-w-md mx-auto mb-6">
                {searchQuery
                  ? `No categories match "${searchQuery}". Try a different search term.`
                  : "No categories available at the moment."}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
                >
                  Clear search
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CategoryBrowser;