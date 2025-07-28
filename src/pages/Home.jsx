import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { LazyLoadImage } from "react-lazy-load-image-component";

import ProductCard from "../components/ui/ProductCard";
import SellerCard from "../components/ui/SellerCard";
import CategoryCard from "../components/ui/CategoryCard";

const Home = () => {
  const { t } = useTranslation();

  // Mock data
  const featuredProducts = [
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
    },
    {
      id: 3,
      name: "Teak Furniture",
      price: 350000,
      category: "Furniture",
      rating: 4.8
    },
    {
      id: 4,
      name: "Myanmar Coffee Beans",
      price: 18000,
      category: "Food & Beverage",
      rating: 4.3
    }
  ];

  const topSellers = [
    { id: 1, name: "Golden Harvest", category: "Agriculture", rating: 4.7 },
    { id: 2, name: "Yangon Crafts", category: "Handicrafts", rating: 4.5 },
    { id: 3, name: "Mandalay Woodworks", category: "Furniture", rating: 4.9 },
    { id: 4, name: "Shan Coffee Co.", category: "Food & Beverage", rating: 4.6 }
  ];

  const categories = [
    { id: 1, name: "Agriculture", count: 245 },
    { id: 2, name: "Handicrafts", count: 187 },
    { id: 3, name: "Textiles", count: 156 },
    { id: 4, name: "Furniture", count: 98 },
    { id: 5, name: "Food & Beverage", count: 210 },
    { id: 6, name: "Construction", count: 76 }
  ];

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
                  to="/register"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-green-700 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
                >
                  {t("home.become_seller")}
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
          </motion.div>
        </div>
      </div>

      {/* Featured Categories */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">
              {t("home.categories_title")}
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              {t("home.categories_subtitle")}
            </p>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map(category =>
              <CategoryCard key={category.id} category={category} />
            )}
          </div>
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
              <p className="mt-2 text-lg text-gray-500">
                {t("home.featured_products_subtitle")}
              </p>
            </div>
            <Link
              to="/products"
              className="text-green-600 hover:text-green-800 font-medium"
            >
              {t("home.view_all")} →
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
            {featuredProducts.map(product =>
              <ProductCard key={product.id} product={product} />
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
              <p className="mt-2 text-lg text-gray-500">
                {t("home.top_sellers_subtitle")}
              </p>
            </div>
            <Link
              to="/sellers"
              className="text-green-600 hover:text-green-800 font-medium"
            >
              {t("home.view_all")} →
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {topSellers.map(seller =>
              <SellerCard key={seller.id} seller={seller} />
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
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
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
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
                      />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {t("home.my_specific")}
                  </h3>
                  <p className="mt-2 text-base text-gray-500">
                    {t("home.my_specific_desc")}
                  </p>
                </div>
              </div>

              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white">
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
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
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                      />
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
                    to="/register"
                    className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-green-700 bg-white hover:bg-gray-50"
                  >
                    {t("home.get_started")}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
