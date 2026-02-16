import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import api from "../utils/api";
import ProductCard from "../components/ui/ProductCard";
import SearchFilters from "../components/marketplace/SearchFilters";
import CategorySelector from "../components/marketplace/CategorySelector";

// Skeleton components (unchanged)
const ProductCardSkeleton = () => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-full animate-pulse">
    <div className="w-full h-48 bg-gray-300"></div>
    <div className="p-4 flex flex-col flex-grow">
      <div className="flex-grow space-y-2">
        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
        <div className="h-3 bg-gray-300 rounded w-1/2"></div>
        <div className="h-3 bg-gray-300 rounded w-full"></div>
        <div className="h-3 bg-gray-300 rounded w-2/3"></div>
      </div>
      <div className="pt-4">
        <div className="h-8 bg-gray-300 rounded"></div>
      </div>
    </div>
  </div>
);

const ProductList = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  // Get query parameters from URL – use "category" (not "category_id")
  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const searchQuery = queryParams.get("search") || "";
  const categoryQuery = queryParams.get("category") || "";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(categoryQuery || null);
  const [searchInput, setSearchInput] = useState(searchQuery);
  const [filters, setFilters] = useState({
    minPrice: "",
    maxPrice: "",
    sortBy: "created_at",
    sortOrder: "desc"
  });
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Debounced search – waits 500ms after user stops typing
  const debouncedSearch = useMemo(() => {
    let timeout;
    return (value) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        const params = new URLSearchParams();
        if (value.trim()) {
          params.append("search", encodeURIComponent(value.trim()));
        }
        if (selectedCategory) {
          params.append("category", selectedCategory);
        }
        navigate(`/products?${params.toString()}`);
      }, 500);
    };
  }, [navigate, selectedCategory]);

  // Sync state with URL parameters when they change (e.g., back/forward navigation)
  useEffect(() => {
    setSearchInput(searchQuery);
    setSelectedCategory(categoryQuery || null);
    setPage(1);
    setHasMore(true);
  }, [searchQuery, categoryQuery]);

  // Reset pagination when filters change
  useEffect(() => {
    setPage(1);
    setHasMore(true);
  }, [searchQuery, selectedCategory, filters]);

  // Fetch products (main function)
  const fetchProducts = useCallback(async (reset = false) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.append("per_page", "12");
      params.append("page", reset ? "1" : page.toString());

      if (searchQuery) {
        params.append("search", searchQuery);
      }

      // Send the selected category ID – backend will include descendants automatically
      if (selectedCategory) {
        params.append("category", selectedCategory); // 👈 use "category" parameter
      }

      // Add selected fields to reduce payload
      params.append("fields", "id,name_en,name_mm,price,images,average_rating,review_count,quantity,is_active,moq,min_order_unit,category_id,seller_id,is_on_sale");

      // Add filter parameters
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params.append(key, filters[key]);
        }
      });

      const response = await api.get("/products", { params });
      const productsData = response.data.data || response.data || [];

      if (reset) {
        setProducts(Array.isArray(productsData) ? productsData : []);
      } else {
        setProducts(prev => [...prev, ...(Array.isArray(productsData) ? productsData : [])]);
      }

      // Check if there are more products
      if (productsData.length < 12) {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
      setError(t('products.fetch_error'));
      if (reset) {
        setProducts([]);
      }
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, filters, page, t]);

  // Fetch categories for sidebar filter
  const fetchCategories = useCallback(async () => {
    try {
      const response = await api.get("/categories?fields=id,name_en,parent_id,children");
      const categoriesData = response.data.data || response.data || [];
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  }, []);

  // Initial load: get categories and products
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Trigger product fetch when dependencies change
  useEffect(() => {
    fetchProducts(true);
  }, [fetchProducts]);

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 500 &&
        !loading &&
        hasMore
      ) {
        setPage(prev => prev + 1);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading, hasMore]);

  // Load more when page changes
  useEffect(() => {
    if (page > 1) {
      fetchProducts(false);
    }
  }, [page, fetchProducts]);

  // Helper to find category name from ID
  const getCategoryName = useCallback((categoryId) => {
    const findCategory = (cats, id) => {
      for (const cat of cats) {
        if (cat.id == id) return cat.name_en || cat.name;
        if (cat.children) {
          const found = findCategory(cat.children, id);
          if (found) return found;
        }
      }
      return null;
    };
    return findCategory(categories, categoryId) || t('products.category_id', { id: categoryId });
  }, [categories, t]);

  // Handlers
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    debouncedSearch(searchInput);
  };

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPage(1);
    setHasMore(true);
  }, []);

  const handleCategoryChange = useCallback((categoryId) => {
    const newCategoryId = categoryId === selectedCategory ? null : categoryId;
    setSelectedCategory(newCategoryId);
    setPage(1);
    setHasMore(true);

    const params = new URLSearchParams();
    if (searchInput) {
      params.append("search", encodeURIComponent(searchInput.trim()));
    }
    if (newCategoryId) {
      params.append("category", newCategoryId);
    }
    navigate(`/products?${params.toString()}`);
  }, [selectedCategory, searchInput, navigate]);

  const clearFilters = useCallback(() => {
    setFilters({
      minPrice: "",
      maxPrice: "",
      sortBy: "created_at",
      sortOrder: "desc"
    });
    setSelectedCategory(null);
    setSearchInput("");
    setPage(1);
    setHasMore(true);
    navigate('/products');
  }, [navigate]);

  // Page title based on current filters
  const getPageTitle = useMemo(() => {
    if (searchQuery && selectedCategory) {
      return t('products.search_results_category', {
        query: searchQuery,
        category: getCategoryName(selectedCategory)
      });
    } else if (searchQuery) {
      return t('products.search_results', { query: searchQuery });
    } else if (selectedCategory) {
      return t('products.category_products', { category: getCategoryName(selectedCategory) });
    } else {
      return t('products.all_products');
    }
  }, [searchQuery, selectedCategory, getCategoryName, t]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search Box */}
      <div className="mb-8">
        <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                debouncedSearch(e.target.value);
              }}
              placeholder={t('products.search_placeholder')}
              className="block w-full pl-10 pr-3 py-4 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-green-500 focus:border-green-500 text-lg"
            />
            <div className="absolute inset-y-0 right-0 flex items-center">
              <button
                type="submit"
                className="bg-green-600 text-white px-6 py-2 rounded-r-lg h-full hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {t('products.search')}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Active Filters Display */}
      {(searchQuery || selectedCategory) && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-blue-800">
              {t('products.active_filters')}:
            </span>

            {searchQuery && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {t('products.search_filter', { query: searchQuery })}
                <button
                  onClick={() => {
                    setSearchInput("");
                    const params = new URLSearchParams();
                    if (selectedCategory) params.append("category", selectedCategory);
                    navigate(`/products?${params.toString()}`);
                  }}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            )}

            {selectedCategory && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {t('products.category_filter', { category: getCategoryName(selectedCategory) })}
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    const params = new URLSearchParams();
                    if (searchQuery) params.append("search", searchQuery);
                    navigate(`/products?${params.toString()}`);
                  }}
                  className="ml-2 text-green-600 hover:text-green-800"
                >
                  ×
                </button>
              </span>
            )}

            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-800 ml-auto"
            >
              {t('products.clear_all')}
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters sidebar */}
        <div className="md:w-1/4">
          <div className="sticky top-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {t('products.filters')}
              </h2>
              <button
                onClick={clearFilters}
                className="text-sm text-green-600 hover:text-green-700"
              >
                {t('products.clear_all')}
              </button>
            </div>

            <SearchFilters
              filters={filters}
              onFilterChange={handleFilterChange}
            />

            <CategorySelector
              categories={categories}
              selectedCategory={selectedCategory}
              onCategorySelect={handleCategoryChange}
            />
          </div>
        </div>

        {/* Main product listing */}
        <div className="md:w-3/4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              {getPageTitle}
            </h1>
            {products.length > 0 && (
              <div className="text-sm text-gray-600">
                {t('products.showing_count', { count: products.length })}
                {hasMore && ' + more'}
              </div>
            )}
          </div>

          {error && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading && products.length === 0 ? (
              [...Array(6)].map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))
            ) : products.length > 0 ? (
              <>
                {products.map(product => (
                  <ProductCard
                    key={`${product.id}-${product.updated_at || ''}`}
                    product={product}
                    onClick={() => navigate(`/products/${product.id}`)}
                  />
                ))}

                {/* Show skeletons for loading more */}
                {loading && page > 1 && (
                  [...Array(3)].map((_, i) => (
                    <ProductCardSkeleton key={`skeleton-${i}`} />
                  ))
                )}
              </>
            ) : (
              <div className="col-span-full text-center py-12">
                <h3 className="text-xl font-medium text-gray-900">
                  {t('products.no_products_found')}
                </h3>
                <p className="mt-1 text-gray-500">
                  {t('products.try_adjusting_search')}
                </p>
                <button
                  onClick={clearFilters}
                  className="mt-4 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                >
                  {t('products.clear_filters')}
                </button>
              </div>
            )}
          </div>

          {/* Loading indicator at bottom */}
          {loading && (
            <div className="flex justify-center items-center h-20 mt-6">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500" />
            </div>
          )}

          {/* No more products */}
          {!hasMore && products.length > 0 && (
            <div className="text-center py-6 text-gray-500">
              {t('products.no_more_products')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductList;