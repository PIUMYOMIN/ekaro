// src/pages/ProductList.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import api from "../utils/api";
import ProductCard from "../components/ui/ProductCard";
import SearchFilters from "../components/marketplace/SearchFilters";
import CategorySelector from "../components/marketplace/CategorySelector";

const ProductList = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [filters, setFilters] = useState({
    minPrice: "",
    maxPrice: "",
    sortBy: "created_at",
    sortOrder: "desc"
  });

  // Get query parameters from URL
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get("search") || "";
  const categoryQuery = queryParams.get("category") || "";

  useEffect(() => {
    setSearchInput(searchQuery);
    if (categoryQuery) {
      setSelectedCategory(categoryQuery);
    }
  }, [searchQuery, categoryQuery]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();

        if (searchQuery) {
          params.append("search", searchQuery);
        }

        if (selectedCategory) {
          params.append("category_id", selectedCategory);
        }

        Object.keys(filters).forEach(key => {
          if (filters[key]) {
            params.append(key, filters[key]);
          }
        });

        const response = await api.get("/products", { params });
        const productsData = response.data.data || response.data || [];
        setProducts(Array.isArray(productsData) ? productsData : []);

      } catch (error) {
        console.error("Failed to fetch products:", error);
        setError(t('products.fetch_error'));
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await api.get("/categories");
        const categoriesData = response.data.data || response.data || [];
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };

    fetchProducts();
    fetchCategories();
  }, [searchQuery, selectedCategory, filters, t]);

  const getCategoryName = (categoryId) => {
    const findCategory = (categories, id) => {
      for (const category of categories) {
        if (category.id == categoryId) return category.name;
        if (category.children) {
          const found = findCategory(category.children, id);
          if (found) return found;
        }
      }
      return null;
    };
    
    return findCategory(categories, categoryId) || t('products.category_id', { id: categoryId });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    
    if (searchInput.trim()) {
      params.append("search", encodeURIComponent(searchInput.trim()));
    }
    
    if (selectedCategory) {
      params.append("category", selectedCategory);
    }
    
    navigate(`/products?${params.toString()}`);
  };

  const handleFilterChange = newFilters => {
    setFilters({ ...filters, ...newFilters });
  };

  const handleCategoryChange = categoryId => {
    const newCategoryId = categoryId === selectedCategory ? null : categoryId;
    setSelectedCategory(newCategoryId);
    
    const params = new URLSearchParams();
    
    if (searchQuery) {
      params.append("search", searchQuery);
    }
    
    if (newCategoryId) {
      params.append("category", newCategoryId);
    }
    
    navigate(`/products?${params.toString()}`);
  };

  const clearFilters = () => {
    setFilters({
      minPrice: "",
      maxPrice: "",
      sortBy: "created_at",
      sortOrder: "desc"
    });
    setSelectedCategory(null);
    setSearchInput("");
    navigate('/products');
  };

  const getPageTitle = () => {
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
  };

  // Sort options for dropdown
  const sortOptions = [
    { value: "created_at_desc", label: t('products.sort.newest') },
    { value: "created_at_asc", label: t('products.sort.oldest') },
    { value: "price_asc", label: t('products.sort.price_low_high') },
    { value: "price_desc", label: t('products.sort.price_high_low') },
    { value: "name_asc", label: t('products.sort.name_a_z') },
    { value: "name_desc", label: t('products.sort.name_z_a') },
  ];

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
              onChange={(e) => setSearchInput(e.target.value)}
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
                    navigate(`/products?category=${selectedCategory || ''}`);
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
                    navigate(`/products?search=${searchQuery || ''}`);
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
              {getPageTitle()}
            </h1>
            
            {products.length > 0 && (
              <div className="text-sm text-gray-600">
                {t('products.showing_count', { count: products.length })}
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

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500" />
            </div>
          ) : products.length > 0 ? (
            <>
              {/* Sorting options */}
              <div className="mb-6 flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700">
                  {t('products.sort_by')}:
                </label>
                <select
                  value={`${filters.sortBy}_${filters.sortOrder}`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split('_');
                    handleFilterChange({ sortBy, sortOrder });
                  }}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onClick={() => navigate(`/products/${product.id}`)}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
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
      </div>
    </div>
  );
};

export default ProductList;