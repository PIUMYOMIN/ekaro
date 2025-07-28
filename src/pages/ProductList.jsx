// src/pages/ProductList.jsx
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ProductCard from "../components/ui/ProductCard";
import SearchFilters from "../components/marketplace/SearchFilters";
import CategorySelector from "../components/marketplace/CategorySelector";

const ProductList = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get search query from URL
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get("search") || "";

  useEffect(
    () => {
      // Simulate API call
      const fetchProducts = async () => {
        setLoading(true);
        try {
          // Mock data based on search query
          const mockProducts = [
            {
              id: 1,
              name: "Organic Rice",
              price: 45000,
              category: "Agriculture",
              rating: 4.5
            },
            {
              id: 2,
              name: "Handwoven Textiles",
              price: 25000,
              category: "Handicrafts",
              rating: 4.2
            }
            // ... more products
          ];

          // Filter based on search query
          const filtered = searchQuery
            ? mockProducts.filter(
                p =>
                  p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  p.category.toLowerCase().includes(searchQuery.toLowerCase())
              )
            : mockProducts;

          setProducts(filtered);
        } catch (error) {
          console.error("Failed to fetch products:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchProducts();
    },
    [searchQuery]
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/4">
          <div className="sticky top-4">
            <SearchFilters />
            <CategorySelector />
          </div>
        </div>

        <div className="md:w-3/4">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            {searchQuery
              ? `${t("productList.search_results_for")} "${searchQuery}"`
              : t("productList.all_products")}
          </h1>

          {loading
            ? <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500" />
              </div>
            : products.length > 0
              ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map(product =>
                    <ProductCard key={product.id} product={product} />
                  )}
                </div>
              : <div className="text-center py-12">
                  <h3 className="text-xl font-medium text-gray-900">
                    {t("productList.no_products")}
                  </h3>
                  <p className="mt-1 text-gray-500">
                    {t("productList.try_different_search")}
                  </p>
                </div>}
        </div>
      </div>
    </div>
  );
};

export default ProductList;
