// src/pages/ProductList.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import api from "../utils/api";
import ProductCard from "../components/ui/ProductCard";
import SearchFilters from "../components/marketplace/SearchFilters";
import CategorySelector from "../components/marketplace/CategorySelector";
import {formatMMK} from "../components/ui/ProductCard"

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

  // Get search query from URL
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get("search") || "";

  useEffect(() => {
    // Set search input from URL query
    setSearchInput(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        // Build query parameters
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

        // Use the public endpoint for products without version prefix
        const response = await api.get(`/products?${params.toString()}`);
        
        // Handle response structure
        const productsData = response.data.data || [];
        setProducts(Array.isArray(productsData) ? productsData : []);

      } catch (error) {
        console.error("Failed to fetch products:", error);
        setError(t("productList.fetch_error"));
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await api.get("/categories");
        const categoriesData = response.data.data || [];
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };

    fetchProducts();
    fetchCategories();
  }, [searchQuery, selectedCategory, filters, t]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchInput.trim())}`);
    } else {
      navigate('/products');
    }
  };

  const handleFilterChange = newFilters => {
    setFilters({ ...filters, ...newFilters });
  };

  const handleCategoryChange = categoryId => {
    setSelectedCategory(categoryId === selectedCategory ? null : categoryId);
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
              placeholder={t("productList.search_placeholder")}
              className="block w-full pl-10 pr-3 py-4 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-green-500 focus:border-green-500 text-lg"
            />
            <div className="absolute inset-y-0 right-0 flex items-center">
              <button
                type="submit"
                className="bg-green-600 text-white px-6 py-2 rounded-r-lg h-full hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {t("productList.search")}
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters sidebar */}
        <div className="md:w-1/4">
          <div className="sticky top-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">{t("productList.filters")}</h2>
              <button
                onClick={clearFilters}
                className="text-sm text-green-600 hover:text-green-700"
              >
                {t("productList.clear_all")}
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
              {searchQuery
                ? `${t("productList.search_results_for")} "${searchQuery}"`
                : t("productList.all_products")}
            </h1>
            
            {products.length > 0 && (
              <div className="text-sm text-gray-600">
                {t("productList.showing")} {products.length} {t("productList.products")}
              </div>
            )}
          </div>

          {error && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-yellow-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    {error}
                  </p>
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
                  {t("productList.sort_by")}:
                </label>
                <select
                  value={`${filters.sortBy}_${filters.sortOrder}`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split('_');
                    handleFilterChange({ sortBy, sortOrder });
                  }}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                >
                  <option value="created_at_desc">{t("productList.newest")}</option>
                  <option value="created_at_asc">{t("productList.oldest")}</option>
                  <option value="price_asc">{t("productList.price_low_high")}</option>
                  <option value="price_desc">{t("productList.price_high_low")}</option>
                  <option value="name_asc">{t("productList.name_a_z")}</option>
                  <option value="name_desc">{t("productList.name_z_a")}</option>
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
                {t("productList.no_products")}
              </h3>
              <p className="mt-1 text-gray-500">
                {t("productList.try_different_search")}
              </p>
              <button
                onClick={clearFilters}
                className="mt-4 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                {t("productList.clear_filters")}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductList;