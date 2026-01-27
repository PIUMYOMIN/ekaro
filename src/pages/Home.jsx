import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { LazyLoadImage } from "react-lazy-load-image-component";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

import ProductCard from "../components/ui/ProductCard";
import SellerCard from "../components/ui/SellerCard";
import CategoryCard from "../components/ui/CategoryCard";

const Home = () => {
  const { t } = useTranslation();
  const { user, isAuthenticated, isSeller, isBuyer, isAdmin } = useAuth();
  const navigate = useNavigate();
  
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [topSellers, setTopSellers] = useState([]);
  const [transformedSellers, setTransformedSellers] = useState([]);
  const [loading, setLoading] = useState({
    categories: true,
    products: true,
    sellers: true
  });

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading({ categories: true, products: true, sellers: true });
      
      try {
        await Promise.all([
          fetchCategories(),
          fetchTopSellers(),
          fetchProducts()
        ]);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading({ categories: false, products: false, sellers: false });
      }
    };

    fetchAllData();
  }, [t]);

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      
      // Handle different response structures
      let categoriesData = [];
      if (res.data.success && res.data.data) {
        categoriesData = res.data.data;
      } else if (Array.isArray(res.data)) {
        categoriesData = res.data;
      } else {
        categoriesData = [];
      }

      // Process categories to get root categories and add product counts
      const rootCategories = categoriesData.filter(cat => !cat.parent_id || cat.parent_id === null);
      
      // For each root category, get all descendant categories
      const processedCategories = await Promise.all(
        rootCategories.map(async (category) => {
          try {
            // Fetch products for this category and its descendants
            const productsRes = await api.get(`/products?category=${category.id}&per_page=1`);
            const productCount = productsRes.data.meta?.total || 0;
            
            return {
              ...category,
              productCount: productCount,
              // Count children
              childrenCount: category.children ? category.children.length : 0
            };
          } catch (error) {
            console.error(`Error fetching products for category ${category.id}:`, error);
            return {
              ...category,
              productCount: 0,
              childrenCount: category.children ? category.children.length : 0
            };
          }
        })
      );

      setCategories(processedCategories.slice(0, 6)); // Show only first 6
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      setCategories([]);
    }
  };

  const fetchTopSellers = async () => {
    try {
      const res = await api.get("/sellers?top=true");
      const sellersData = res.data.data || res.data || [];
      setTopSellers(sellersData);

      const transformed = sellersData.map(seller => ({
        id: seller.id,
        name: seller.store_name || seller.business_name || t("home.unnamed_seller"),
        category: seller.business_type || seller.category || t("home.general_merchant"),
        rating: seller.reviews_avg_rating || seller.rating || 0,
        reviewCount: seller.reviews_count || 0,
        products: seller.products_count || seller.total_products || 0,
        verified: seller.status === "approved" || seller.status === "active" || seller.is_verified || false,
        image: seller.logo || seller.profile_image || null,
        originalData: seller
      }));
      setTransformedSellers(transformed);
    } catch (err) {
      console.error("Failed to fetch top sellers:", err);
      setTransformedSellers([]);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await api.get("/products?featured=true&per_page=8");
      setProducts(res.data.data || res.data || []);
    } catch (err) {
      console.error("Failed to fetch featured products:", err);
      setProducts([]);
    }
  };

  const handleCTAClick = () => {
    if (!isAuthenticated) {
      navigate('/register');
    } else if (isSeller()) {
      navigate('/seller/dashboard');
    } else if (isBuyer()) {
      navigate('/products');
    } else if (isAdmin()) {
      navigate('/admin/dashboard');
    } else {
      navigate('/register');
    }
  };

  const getCTAButtonText = () => {
    if (!isAuthenticated) {
      return t("home.become_seller");
    } else if (isSeller()) {
      return t("home.sell_now");
    } else if (isBuyer()) {
      return t("home.shop_now");
    } else if (isAdmin()) {
      return t("home.dashboard");
    } else {
      return t("home.get_started");
    }
  };

  const getCTAButtonLink = () => {
    if (!isAuthenticated) {
      return "/register";
    } else if (isSeller()) {
      return "/seller/dashboard";
    } else if (isBuyer()) {
      return "/products";
    } else if (isAdmin()) {
      return "/admin/dashboard";
    } else {
      return "/register";
    }
  };

  // If loading, show skeleton
  if (loading.categories && loading.products && loading.sellers) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse space-y-8">
            {/* Hero skeleton */}
            <div className="h-64 bg-gray-300 rounded-lg"></div>
            
            {/* Categories skeleton */}
            <div>
              <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-40 bg-gray-300 rounded-lg"></div>
                ))}
              </div>
            </div>
            
            {/* Products skeleton */}
            <div>
              <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-64 bg-gray-300 rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-green-600 to-emerald-700">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gray-900 opacity-40" />
        </div>
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5 }} 
            className="text-center"
          >
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              {t("home.hero_title")}
            </h1>
            <p className="mt-6 text-xl text-green-100 max-w-3xl mx-auto">
              {t("home.hero_subtitle")}
            </p>
            <div className="mt-10 flex justify-center">
              <div className="rounded-md shadow">
                <Link 
                  to={getCTAButtonLink()} 
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-green-700 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
                >
                  {getCTAButtonText()}
                </Link>
              </div>
              <div className="ml-4 rounded-md shadow">
                <Link 
                  to="/products" 
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-900 bg-opacity-60 hover:bg-opacity-70 md:py-4 md:text-lg md:px-10"
                >
                  {t("home.browse_products")}
                </Link>
              </div>
            </div>
            {isAuthenticated && isBuyer() && (
              <div className="mt-4">
                <Link 
                  to="/register-seller" 
                  className="inline-block text-white hover:text-green-200 font-medium text-sm"
                >
                  {t("home.become_seller_link")} →
                </Link>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Featured Categories */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">
              {t("home.popular_categories")}
            </h2>
            <Link 
              to="/categories" 
              className="inline-block mt-2 text-green-600 hover:text-green-800 font-medium"
            >
              {t("home.browse_all_categories")} →
            </Link>
          </div>
          
          {categories.length > 0 ? (
            <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => (
                <CategoryCard 
                  key={category.id} 
                  category={{
                    ...category,
                    count: category.productCount || 0,
                    children: category.children || []
                  }} 
                />
              ))}
            </div>
          ) : (
            <div className="mt-10 text-center py-12">
              <p className="text-gray-500 text-lg">{t("home.no_categories_found")}</p>
              <Link 
                to="/categories" 
                className="inline-block mt-4 text-green-600 hover:text-green-800 font-medium"
              >
                {t("home.browse_categories")}
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900">
                {t("home.featured_products")}
              </h2>
            </div>
            <Link 
              to="/products" 
              className="text-green-600 hover:text-green-800 font-medium"
            >
              {t("home.view_all")} →
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
            {products.length > 0 ? (
              products.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onClick={() => console.log("Add to cart:", product.id)}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500">{t("home.no_featured_products")}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Top Sellers */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900">
                {t("home.top_sellers")}
              </h2>
            </div>
            <Link 
              to="/sellers" 
              className="text-green-600 hover:text-green-800 font-medium"
            >
              {t("home.view_all")} →
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {transformedSellers.length > 0 ? (
              transformedSellers.map(seller => (
                <SellerCard key={seller.id} seller={seller} />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500">{t("home.no_top_sellers")}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-16 bg-gradient-to-r from-green-50 to-emerald-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-green-600 font-semibold tracking-wide uppercase">
              {t("home.why_us")}
            </h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              {t("home.why_choose_us")}
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              {t("home.why_choose_us_subtitle")}
            </p>
          </div>
          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {t("home.secure_payments")}
                  </h3>
                  <p className="mt-2 text-base text-gray-500">
                    {t("home.secure_payments_desc")}
                  </p>
                </div>
              </div>

              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {t("home.business_specific")}
                  </h3>
                  <p className="mt-2 text-base text-gray-500">
                    {t("home.business_specific_desc")}
                  </p>
                </div>
              </div>

              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {t("home.fast_transactions")}
                  </h3>
                  <p className="mt-2 text-base text-gray-500">
                    {t("home.fast_transactions_desc")}
                  </p>
                </div>
              </div>

              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {t("home.support")}
                  </h3>
                  <p className="mt-2 text-base text-gray-500">
                    {t("home.support_desc")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-green-700 rounded-lg shadow-xl overflow-hidden">
            <div className="px-6 py-12 md:py-16 md:px-12 lg:flex lg:items-center">
              <div className="lg:w-0 lg:flex-1">
                <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                  {t("home.cta_title")}
                </h2>
                <p className="mt-4 max-w-3xl text-lg text-green-100">
                  {t("home.cta_subtitle")}
                </p>
              </div>
              <div className="mt-8 lg:mt-0 lg:ml-8">
                <div className="inline-flex rounded-md shadow">
                  <Link 
                    to={getCTAButtonLink()} 
                    className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-green-700 bg-white hover:bg-gray-50"
                  >
                    {getCTAButtonText()}
                  </Link>
                </div>
                {isAuthenticated && isBuyer() && (
                  <div className="mt-3 text-center">
                    <Link 
                      to="/register-seller" 
                      className="inline-block text-green-100 hover:text-white text-sm font-medium"
                    >
                      {t("home.become_seller_link")} →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;