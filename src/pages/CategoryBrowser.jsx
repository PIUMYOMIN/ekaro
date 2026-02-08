import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ChevronRightIcon, 
  FolderIcon, 
  ShoppingBagIcon,
  TagIcon,
  SparklesIcon,
  ArrowRightIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline";
import api from "../utils/api";

// Category Card Skeleton
const CategoryCardSkeleton = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
    <div className="h-48 bg-gradient-to-r from-gray-200 to-gray-300"></div>
    <div className="p-6">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
        </div>
        <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
      </div>
      <div className="space-y-3">
        <div className="h-3 bg-gray-300 rounded w-full"></div>
        <div className="h-3 bg-gray-300 rounded w-2/3"></div>
      </div>
      <div className="flex flex-wrap gap-2 mt-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-6 bg-gray-300 rounded w-16"></div>
        ))}
      </div>
    </div>
  </div>
);

const CategoryBrowser = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("with-products");

  useEffect(() => {
    let isMounted = true;
    
    const fetchCategories = async () => {
      try {
        setLoading(true);
        
        // Single API call with all necessary data
        const response = await api.get("/categories?include=children,products_count&with_products_only=true");
        
        if (!isMounted) return;
        
        let categoriesData = response.data.data || [];
        
        // Process categories to include total product counts
        const processedCategories = categoriesData.map(category => {
          // Calculate total products including children
          let totalProducts = category.products_count || 0;
          
          if (category.children && category.children.length > 0) {
            category.children.forEach(child => {
              totalProducts += child.products_count || 0;
            });
          }
          
          return {
            ...category,
            total_products: totalProducts,
            has_products: totalProducts > 0
          };
        });
        
        // Sort by product count
        processedCategories.sort((a, b) => b.total_products - a.total_products);
        
        setCategories(processedCategories);
        
      } catch (err) {
        console.error("Failed to fetch categories:", err);
        if (isMounted) {
          setError("Failed to load categories. Please try again later.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCategories();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Function to get featured subcategories (top 4 with products)
  const getFeaturedSubcategories = (category) => {
    if (!category.children || category.children.length === 0) return [];
    
    // Filter subcategories that have products
    const subcategoriesWithProducts = category.children.filter(child => {
      return (child.products_count || 0) > 0;
    });
    
    // Sort by products_count
    return subcategoriesWithProducts
      .sort((a, b) => (b.products_count || 0) - (a.products_count || 0))
      .slice(0, 4);
  };

  // Filter and search categories
  const filteredCategories = useMemo(() => {
    let filtered = [...categories];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(category => {
        const name = (category.name_en || category.name || "").toLowerCase();
        return name.includes(query);
      });
    }

    // Apply category filter
    switch (selectedFilter) {
      case "popular":
        // Already sorted by product count
        break;
      case "with-products":
        // Only show categories with products (should already be filtered by API)
        filtered = filtered.filter(category => category.has_products);
        break;
      case "featured":
        // Show featured categories with products
        filtered = filtered.filter(category => 
          (category.is_featured || category.featured) && category.has_products
        );
        break;
      default:
        // All categories, keep sorted by product count
        break;
    }

    return filtered;
  }, [categories, searchQuery, selectedFilter]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalCategories = categories.length;
    const totalProducts = categories.reduce((sum, cat) => sum + (cat.total_products || 0), 0);
    const categoriesWithProducts = categories.filter(cat => cat.has_products).length;
    const featuredCategories = categories.filter(cat => 
      (cat.is_featured || cat.featured) && cat.has_products
    ).length;

    return {
      totalCategories,
      totalProducts,
      categoriesWithProducts,
      featuredCategories,
      emptyCategories: totalCategories - categoriesWithProducts
    };
  }, [categories]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r from-green-600 to-emerald-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="animate-pulse">
              <div className="h-10 bg-green-500/30 rounded w-1/3 mx-auto mb-4"></div>
              <div className="h-6 bg-green-500/30 rounded w-2/3 mx-auto mb-8"></div>
              <div className="max-w-2xl mx-auto">
                <div className="h-12 bg-green-500/30 rounded"></div>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <CategoryCardSkeleton key={index} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
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
              Discover {stats.totalProducts.toLocaleString()} products across {stats.categoriesWithProducts} categories
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search categories..."
                  className="w-full px-6 py-4 pl-12 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <FolderIcon className="h-5 w-5 text-white/70" />
                </div>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setSelectedFilter("with-products")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              selectedFilter === "with-products"
                ? "bg-green-600 text-white shadow-sm"
                : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            <ShoppingBagIcon className="h-4 w-4" />
            <span className="font-medium">With Products</span>
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
              selectedFilter === "with-products" 
                ? 'bg-white/20 text-white' 
                : 'bg-gray-100 text-gray-600'
            }`}>
              {stats.categoriesWithProducts}
            </span>
          </button>
          
          <button
            onClick={() => setSelectedFilter("popular")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              selectedFilter === "popular"
                ? "bg-green-600 text-white shadow-sm"
                : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            <SparklesIcon className="h-4 w-4" />
            <span className="font-medium">Most Popular</span>
          </button>
          
          <button
            onClick={() => setSelectedFilter("featured")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              selectedFilter === "featured"
                ? "bg-green-600 text-white shadow-sm"
                : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            <TagIcon className="h-4 w-4" />
            <span className="font-medium">Featured</span>
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
              selectedFilter === "featured" 
                ? 'bg-white/20 text-white' 
                : 'bg-gray-100 text-gray-600'
            }`}>
              {stats.featuredCategories}
            </span>
          </button>
        </div>

        {/* Category Grid */}
        {filteredCategories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCategories.map((category) => {
              const featuredSubcategories = getFeaturedSubcategories(category);
              const totalProducts = category.total_products || 0;
              const hasProducts = category.has_products;

              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ y: -4 }}
                >
                  <Link
                    to={hasProducts ? `/products?category=${category.id}` : '#'}
                    className={`block bg-white rounded-xl shadow-sm border overflow-hidden group ${
                      hasProducts 
                        ? 'border-gray-200 hover:shadow-lg hover:border-green-500 cursor-pointer'
                        : 'border-gray-100 opacity-60 cursor-not-allowed'
                    } transition-all duration-300`}
                    onClick={(e) => {
                      if (!hasProducts) {
                        e.preventDefault();
                      }
                    }}
                  >
                    {/* Category Header */}
                    <div className="p-6 border-b border-gray-100">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className={`text-lg font-semibold line-clamp-1 ${
                            hasProducts 
                              ? 'text-gray-900 group-hover:text-green-700' 
                              : 'text-gray-500'
                          } transition-colors`}>
                            {category.name_en || category.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <ShoppingBagIcon className={`h-4 w-4 ${
                              hasProducts ? 'text-gray-400' : 'text-gray-300'
                            }`} />
                            <span className={`text-sm ${
                              hasProducts ? 'text-gray-600' : 'text-gray-400'
                            }`}>
                              {totalProducts} {totalProducts === 1 ? 'product' : 'products'}
                            </span>
                          </div>
                        </div>
                        {hasProducts ? (
                          <div className="p-2 bg-green-50 text-green-600 rounded-lg group-hover:bg-green-600 group-hover:text-white transition-colors">
                            <ChevronRightIcon className="h-5 w-5" />
                          </div>
                        ) : (
                          <div className="p-2 bg-gray-100 text-gray-400 rounded-lg">
                            <ChevronRightIcon className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Subcategories */}
                    {featuredSubcategories.length > 0 && (
                      <div className="p-6">
                        <div className="flex items-center gap-2 mb-3">
                          <TagIcon className="h-4 w-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-700">
                            Popular Subcategories
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {featuredSubcategories.map((subcat, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-xs px-3 py-1.5 rounded-full hover:bg-gray-200 transition-colors"
                            >
                              {subcat.name_en || subcat.name}
                              <span className="text-gray-500 text-xs">
                                ({subcat.products_count || 0})
                              </span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* No Products Message */}
                    {!hasProducts && (
                      <div className="p-6 bg-gray-50">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <ExclamationTriangleIcon className="h-4 w-4" />
                          <span>No products available in this category</span>
                        </div>
                      </div>
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="mx-auto w-24 h-24 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-6">
              <FolderIcon className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Categories Found
            </h3>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              {searchQuery 
                ? `No categories found for "${searchQuery}"`
                : "No categories with products available at the moment."}
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
            >
              <span>Browse All Products</span>
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryBrowser;