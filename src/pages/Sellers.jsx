import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { StarIcon, ChevronDownIcon, FunnelIcon, MagnifyingGlassIcon } from "@heroicons/react/24/solid";

import SellerCard from "../components/ui/SellerCard";
import Pagination from "../components/ui/Pagination";

const Sellers = () => {
  const { t } = useTranslation();
  const [sellers, setSellers] = useState([]);
  const [filteredSellers, setFilteredSellers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortOption, setSortOption] = useState("rating");
  const [currentPage, setCurrentPage] = useState(1);
  const [sellersPerPage] = useState(12);
  const [showFilters, setShowFilters] = useState(false);

  // Mock data for sellers
  useEffect(() => {
    // In a real app, this would be an API call
    const mockSellers = [
      { id: 1, name: "Golden Harvest", category: "Agriculture", rating: 4.7, reviewCount: 245, joined: "2020-05-12", products: 42, verified: true },
      { id: 2, name: "Yangon Crafts", category: "Handicrafts", rating: 4.5, reviewCount: 187, joined: "2021-02-28", products: 38, verified: true },
      { id: 3, name: "Mandalay Woodworks", category: "Furniture", rating: 4.9, reviewCount: 312, joined: "2019-11-15", products: 57, verified: true },
      { id: 4, name: "Shan Coffee Co.", category: "Food & Beverage", rating: 4.6, reviewCount: 198, joined: "2020-08-05", products: 24, verified: true },
      { id: 5, name: "Irrawaddy Fisheries", category: "Seafood", rating: 4.3, reviewCount: 124, joined: "2021-06-18", products: 19, verified: false },
      { id: 6, name: "Bagan Textiles", category: "Textiles", rating: 4.8, reviewCount: 267, joined: "2020-03-22", products: 48, verified: true },
      { id: 7, name: "Inle Silverworks", category: "Jewelry", rating: 4.9, reviewCount: 189, joined: "2021-01-10", products: 31, verified: true },
      { id: 8, name: "Kachin Tea Traders", category: "Food & Beverage", rating: 4.4, reviewCount: 156, joined: "2020-09-30", products: 22, verified: true },
      { id: 9, name: "Rakhine Pottery", category: "Handicrafts", rating: 4.2, reviewCount: 98, joined: "2021-07-12", products: 16, verified: false },
      { id: 10, name: "Mon Fruits", category: "Agriculture", rating: 4.5, reviewCount: 143, joined: "2020-04-25", products: 29, verified: true },
      { id: 11, name: "Chin Handwoven", category: "Textiles", rating: 4.7, reviewCount: 176, joined: "2021-03-17", products: 34, verified: true },
      { id: 12, name: "Ayeyarwady Rice Mill", category: "Agriculture", rating: 4.6, reviewCount: 201, joined: "2019-12-08", products: 41, verified: true },
      { id: 13, name: "Tanintharyi Spices", category: "Food & Beverage", rating: 4.3, reviewCount: 112, joined: "2021-05-19", products: 18, verified: false },
      { id: 14, name: "Sagaing Woodcraft", category: "Furniture", rating: 4.8, reviewCount: 234, joined: "2020-07-14", products: 52, verified: true },
      { id: 15, name: "Magway Stone Carvings", category: "Handicrafts", rating: 4.1, reviewCount: 87, joined: "2021-08-23", products: 14, verified: false },
      { id: 16, name: "Kayin Honey Farms", category: "Agriculture", rating: 4.9, reviewCount: 278, joined: "2020-01-30", products: 27, verified: true },
      { id: 17, name: "Kayah Bamboo Crafts", category: "Handicrafts", rating: 4.4, reviewCount: 132, joined: "2021-04-11", products: 21, verified: true },
      { id: 18, name: "Yangon Metalworks", category: "Handicrafts", rating: 4.0, reviewCount: 101, joined: "2021-09-05", products: 17, verified: false },
      { id: 19, name: "Mandalay Silk", category: "Textiles", rating: 4.7, reviewCount: 243, joined: "2019-10-12", products: 45, verified: true },
      { id: 20, name: "Bago Organic Farms", category: "Agriculture", rating: 4.6, reviewCount: 192, joined: "2020-06-27", products: 33, verified: true },
    ];

    setSellers(mockSellers);
    setFilteredSellers(mockSellers);
  }, []);

  // Categories for filtering
  const categories = [
    { id: "all", name: t("sellers.all_categories") },
    { id: "Agriculture", name: t("sellers.agriculture") },
    { id: "Handicrafts", name: t("sellers.handicrafts") },
    { id: "Textiles", name: t("sellers.textiles") },
    { id: "Furniture", name: t("sellers.furniture") },
    { id: "Food & Beverage", name: t("sellers.food_beverage") },
    { id: "Jewelry", name: t("sellers.jewelry") },
    { id: "Seafood", name: t("sellers.seafood") },
  ];

  // Sort options
  const sortOptions = [
    { id: "rating", name: t("sellers.highest_rating") },
    { id: "reviewCount", name: t("sellers.most_reviews") },
    { id: "joined", name: t("sellers.newest") },
    { id: "name", name: t("sellers.alphabetical") },
  ];

  // Filter and sort sellers
  useEffect(() => {
    let result = [...sellers];

    // Apply search filter
    if (searchTerm) {
      result = result.filter(seller =>
        seller.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        seller.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory !== "all") {
      result = result.filter(seller => seller.category === selectedCategory);
    }

    // Apply sorting
    result.sort((a, b) => {
      if (sortOption === "rating") {
        return b.rating - a.rating;
      } else if (sortOption === "reviewCount") {
        return b.reviewCount - a.reviewCount;
      } else if (sortOption === "joined") {
        return new Date(b.joined) - new Date(a.joined);
      } else if (sortOption === "name") {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });

    setFilteredSellers(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, selectedCategory, sortOption, sellers]);

  // Get current sellers
  const indexOfLastSeller = currentPage * sellersPerPage;
  const indexOfFirstSeller = indexOfLastSeller - sellersPerPage;
  const currentSellers = filteredSellers.slice(indexOfFirstSeller, indexOfLastSeller);

  // Change page
  const paginate = pageNumber => setCurrentPage(pageNumber);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-green-600 to-emerald-700">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gray-900 opacity-40" />
        </div>
        <div className="relative max-w-7xl mx-auto py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl"
            >
              {t("sellers.title")}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mt-6 text-xl text-green-100 max-w-3xl mx-auto"
            >
              {t("sellers.subtitle")}
            </motion.p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            {/* Search Input */}
            <div className="flex-1">
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  placeholder={t("sellers.search_placeholder")}
                />
              </div>
            </div>

            {/* Mobile Filters Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <FunnelIcon className="h-5 w-5 mr-2" />
              {t("sellers.filters")}
            </button>

            {/* Category Filter - Desktop */}
            <div className="hidden md:block">
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="appearance-none block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <ChevronDownIcon className="h-4 w-4" />
                </div>
              </div>
            </div>

            {/* Sort Filter - Desktop */}
            <div className="hidden md:block">
              <div className="relative">
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="appearance-none block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                >
                  {sortOptions.map(option => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <ChevronDownIcon className="h-4 w-4" />
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Filters */}
          {showFilters && (
            <div className="mt-4 grid grid-cols-1 gap-4 md:hidden">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("sellers.category")}
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("sellers.sort_by")}
                </label>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                >
                  {sortOptions.map(option => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sellers Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {t("sellers.all_sellers")} <span className="text-green-600">({filteredSellers.length})</span>
          </h2>
          <p className="text-sm text-gray-500 hidden md:block">
            {t("sellers.showing")} {Math.min(indexOfFirstSeller + 1, filteredSellers.length)} - {Math.min(indexOfLastSeller, filteredSellers.length)} {t("sellers.of")} {filteredSellers.length}
          </p>
        </div>

        {currentSellers.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100">
              <MagnifyingGlassIcon className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="mt-2 text-lg font-medium text-gray-900">{t("sellers.no_results_title")}</h3>
            <p className="mt-1 text-sm text-gray-500">
              {t("sellers.no_results_description")}
            </p>
            <div className="mt-6">
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
              >
                {t("sellers.reset_filters")}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {currentSellers.map(seller => (
                <SellerCard key={seller.id} seller={seller} />
              ))}
            </div>

            <Pagination
              itemsPerPage={sellersPerPage}
              totalItems={filteredSellers.length}
              currentPage={currentPage}
              paginate={paginate}
            />
          </>
        )}
      </div>

      {/* Become a Seller CTA */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-700">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
          <div className="lg:flex lg:items-center lg:justify-between">
            <div className="lg:w-0 lg:flex-1">
              <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                {t("sellers.become_seller_title")}
              </h2>
              <p className="mt-3 max-w-3xl text-lg text-green-100">
                {t("sellers.become_seller_description")}
              </p>
            </div>
            <div className="mt-8 lg:mt-0 lg:ml-8">
              <div className="inline-flex rounded-md shadow">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-green-700 bg-white hover:bg-gray-50"
                >
                  {t("sellers.join_now")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sellers;