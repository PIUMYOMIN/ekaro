import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Tab } from "@headlessui/react";
import {
  StarIcon,
  CheckCircleIcon,
  ShoppingBagIcon,
  CalendarIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  ChatBubbleLeftIcon,
  ChevronLeftIcon
} from "@heroicons/react/24/outline";

import ProductCard from "../components/ui/ProductCard";
import ReviewCard from "../components/ui/ReviewCard";
import Pagination from "../components/ui/Pagination";
import api from "../utils/api";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const SellerProfile = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [reviewsPerPage] = useState(5);
  const [activeTab, setActiveTab] = useState("products");
  const [loading, setLoading] = useState({
    seller: true,
    products: true,
    reviews: true
  });

  // Fallback data in case API returns empty results
  const fallbackSeller = {
    id: 1,
    store_name: "Golden Harvest",
    business_type: "Agriculture",
    description: "Golden Harvest is a leading agricultural producer in Myanmar, specializing in organic rice and seasonal fruits. We've been serving customers since 2010 with high-quality, sustainably grown products.",
    reviews_avg_rating: 4.7,
    reviews_count: 245,
    created_at: "2020-05-12",
    address: "123 Farm Road, Bago, Myanmar",
    contact_phone: "+959123456789",
    contact_email: "contact@goldenharvest.com",
    website: "www.goldenharvest.com",
    status: "approved",
    verified: true
  };

  const fallbackProducts = [
    { id: 1, name: "Organic Jasmine Rice", price: 45000, category: "Rice", rating: 4.8, stock: 120 },
    { id: 2, name: "Organic Brown Rice", price: 42000, category: "Rice", rating: 4.6, stock: 85 },
    { id: 3, name: "Mangoes (Seasonal)", price: 8000, category: "Fruits", rating: 4.9, stock: 45 },
    { id: 4, name: "Bananas (Bunch)", price: 5000, category: "Fruits", rating: 4.5, stock: 62 },
    { id: 5, name: "Organic Peanuts", price: 12000, category: "Nuts", rating: 4.7, stock: 38 },
    { id: 6, name: "Sesame Seeds", price: 15000, category: "Seeds", rating: 4.4, stock: 27 }
  ];

  const fallbackReviews = [
    { id: 1, user: { name: "Ko Aung" }, rating: 5, created_at: "2023-06-15", comment: "Excellent quality rice, will definitely order again!", product: "Organic Jasmine Rice" },
    { id: 2, user: { name: "Ma Hla" }, rating: 4, created_at: "2023-06-10", comment: "Fast delivery and good packaging. The rice was fresh and aromatic.", product: "Organic Brown Rice" },
    { id: 3, user: { name: "U Myint" }, rating: 5, created_at: "2023-05-28", comment: "Best mangoes I've had this season! Sweet and juicy.", product: "Mangoes (Seasonal)" },
    { id: 4, user: { name: "Daw Khin" }, rating: 4, created_at: "2023-05-20", comment: "Good quality products overall. The delivery took a bit longer than expected.", product: "Organic Peanuts" },
    { id: 5, user: { name: "Ko Zaw" }, rating: 5, created_at: "2023-05-15", comment: "Consistently great products from this seller. Highly recommended!", product: "Sesame Seeds" }
  ];

  useEffect(() => {
    const fetchSellerData = async () => {
      try {
        setLoading({ seller: true, products: true, reviews: true });
        
        // Fetch seller details
        try {
          const sellerRes = await api.get(`/sellers/${id}`);
          if (sellerRes.data.success && sellerRes.data.data) {
            setSeller(sellerRes.data.data);
          } else {
            setSeller(fallbackSeller);
          }
        } catch (err) {
          console.error("Failed to fetch seller:", err);
          setSeller(fallbackSeller);
        } finally {
          setLoading(prev => ({ ...prev, seller: false }));
        }

        // Fetch seller products
        try {
          const productsRes = await api.get(`/sellers/${id}/products`);
          if (productsRes.data.success && productsRes.data.data && productsRes.data.data.products) {
            setProducts(productsRes.data.data.products.data || productsRes.data.data.products);
          } else {
            setProducts(fallbackProducts);
          }
        } catch (err) {
          console.error("Failed to fetch seller products:", err);
          setProducts(fallbackProducts);
        } finally {
          setLoading(prev => ({ ...prev, products: false }));
        }

        // Fetch seller reviews
        try {
          const reviewsRes = await api.get(`/sellers/${id}/reviews`);
          if (reviewsRes.data.success && reviewsRes.data.data && reviewsRes.data.data.reviews) {
            setReviews(reviewsRes.data.data.reviews.data || reviewsRes.data.data.reviews);
          } else {
            setReviews(fallbackReviews);
          }
        } catch (err) {
          console.error("Failed to fetch seller reviews:", err);
          setReviews(fallbackReviews);
        } finally {
          setLoading(prev => ({ ...prev, reviews: false }));
        }
      } catch (error) {
        console.error("Error fetching seller data:", error);
        setSeller(fallbackSeller);
        setProducts(fallbackProducts);
        setReviews(fallbackReviews);
        setLoading({ seller: false, products: false, reviews: false });
      }
    };

    fetchSellerData();
  }, [id]);

  // Get current reviews for pagination
  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = reviews.slice(indexOfFirstReview, indexOfLastReview);

  // Change page
  const paginate = pageNumber => setCurrentPage(pageNumber);

  // Render star ratings
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<StarIcon key={i} className="h-5 w-5 text-yellow-400" fill="currentColor" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<StarIcon key={i} className="h-5 w-5 text-yellow-400" fill="currentColor" />);
      } else {
        stars.push(<StarIcon key={i} className="h-5 w-5 text-gray-300" fill="currentColor" />);
      }
    }
    
    return stars;
  };

  if (loading.seller) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-700">Loading seller information...</p>
        </div>
      </div>
    );
  }

  // Calculate average rating from API data or use fallback
  const rating = seller.reviews_avg_rating || (seller.rating || 4.5);
  const reviewCount = seller.reviews_count || (seller.reviewCount || 0);
  const productCount = products.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Link to="/sellers" className="flex items-center text-green-600 hover:text-green-800">
          <ChevronLeftIcon className="h-5 w-5 mr-1" />
          {t("seller.back_to_sellers")}
        </Link>
      </div>

      {/* Seller Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row">
              <div className="flex-shrink-0 mb-4 sm:mb-0 sm:mr-6">
                {seller.store_logo ? (
                  <img 
                    src={seller.store_logo} 
                    alt={seller.store_name || seller.name}
                    className="rounded-xl w-32 h-32 object-cover"
                  />
                ) : (
                  <div className="bg-gray-200 border-2 border-dashed rounded-xl w-32 h-32 flex items-center justify-center">
                    <span className="text-gray-500 text-sm">No Logo</span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center">
                  <h1 className="text-2xl font-bold text-gray-900">{seller.store_name || seller.name}</h1>
                  {seller.status === "approved" && (
                    <CheckCircleIcon className="ml-2 h-6 w-6 text-green-500" />
                  )}
                </div>
                <p className="text-sm text-gray-500">{seller.business_type || seller.category}</p>
                
                <div className="mt-2 flex items-center">
                  {renderStars(rating)}
                  <span className="ml-2 text-sm font-medium text-gray-900">{rating.toFixed(1)}</span>
                  <span className="mx-1 text-gray-300">•</span>
                  <span className="text-sm text-gray-500">{reviewCount} {t("seller.reviews")}</span>
                </div>
                
                <p className="mt-4 text-gray-600">{seller.description}</p>
                
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {t("seller.member_since")} {new Date(seller.created_at).getFullYear()}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {productCount} {t("seller.products")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <Tab.Group>
          <div className="border-b border-gray-200">
            <Tab.List className="-mb-px flex space-x-8">
              <Tab
                className={({ selected }) =>
                  classNames(
                    selected
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                    'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
                  )
                }
                onClick={() => setActiveTab("products")}
              >
                {t("seller.products")} ({productCount})
              </Tab>
              <Tab
                className={({ selected }) =>
                  classNames(
                    selected
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                    'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
                  )
                }
                onClick={() => setActiveTab("reviews")}
              >
                {t("seller.reviews")} ({reviewCount})
              </Tab>
              <Tab
                className={({ selected }) =>
                  classNames(
                    selected
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                    'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
                  )
                }
                onClick={() => setActiveTab("about")}
              >
                {t("seller.about")}
              </Tab>
            </Tab.List>
          </div>

          <Tab.Panels className="mt-6">
            {/* Products Tab */}
            <Tab.Panel>
              {loading.products ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="animate-pulse bg-gray-200 rounded-lg h-80"></div>
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                  <ShoppingBagIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900">{t("seller.no_products_title")}</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {t("seller.no_products_description")}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </Tab.Panel>

            {/* Reviews Tab */}
            <Tab.Panel>
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{t("seller.customer_reviews")}</h3>
                      <div className="mt-1 flex items-center">
                        {renderStars(rating)}
                        <span className="ml-2 text-sm font-medium text-gray-900">{rating.toFixed(1)} {t("seller.out_of_5")}</span>
                      </div>
                    </div>
                    <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700">
                      {t("seller.write_review")}
                    </button>
                  </div>

                  {loading.reviews ? (
                    <div className="mt-6 space-y-8">
                      {Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className="animate-pulse bg-gray-200 rounded-lg h-32"></div>
                      ))}
                    </div>
                  ) : currentReviews.length === 0 ? (
                    <div className="mt-8 text-center py-12">
                      <ChatBubbleLeftIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-lg font-medium text-gray-900">{t("seller.no_reviews_title")}</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {t("seller.no_reviews_description")}
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="mt-6 space-y-8">
                        {currentReviews.map(review => (
                          <ReviewCard key={review.id} review={review} />
                        ))}
                      </div>

                      <Pagination
                        itemsPerPage={reviewsPerPage}
                        totalItems={reviews.length}
                        currentPage={currentPage}
                        paginate={paginate}
                      />
                    </>
                  )}
                </div>
              </div>
            </Tab.Panel>

            {/* About Tab */}
            <Tab.Panel>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="p-6">
                      <h3 className="text-lg font-medium text-gray-900">{t("seller.about_seller")}</h3>
                      <p className="mt-4 text-gray-600">{seller.description}</p>
                      
                      <h4 className="mt-6 text-md font-medium text-gray-900">{t("seller.business_info")}</h4>
                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">{t("seller.business_type")}</p>
                          <p className="mt-1 text-gray-900">{seller.business_type || "Not specified"}</p>
                        </div>
                        {seller.business_registration_number && (
                          <div>
                            <p className="text-sm font-medium text-gray-500">{t("seller.registration_number")}</p>
                            <p className="mt-1 text-gray-900">{seller.business_registration_number}</p>
                          </div>
                        )}
                        {seller.tax_id && (
                          <div>
                            <p className="text-sm font-medium text-gray-500">{t("seller.tax_id")}</p>
                            <p className="mt-1 text-gray-900">{seller.tax_id}</p>
                          </div>
                        )}
                        {seller.year_established && (
                          <div>
                            <p className="text-sm font-medium text-gray-500">{t("seller.year_established")}</p>
                            <p className="mt-1 text-gray-900">{seller.year_established}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="p-6">
                      <h3 className="text-lg font-medium text-gray-900">{t("seller.contact_info")}</h3>
                      
                      <div className="mt-4 space-y-4">
                        {seller.address && (
                          <div className="flex">
                            <MapPinIcon className="h-5 w-5 text-gray-500 flex-shrink-0" />
                            <p className="ml-3 text-gray-600">{seller.address}</p>
                          </div>
                        )}
                        
                        {seller.contact_phone && (
                          <div className="flex">
                            <PhoneIcon className="h-5 w-5 text-gray-500 flex-shrink-0" />
                            <p className="ml-3 text-gray-600">{seller.contact_phone}</p>
                          </div>
                        )}
                        
                        {seller.contact_email && (
                          <div className="flex">
                            <EnvelopeIcon className="h-5 w-5 text-gray-500 flex-shrink-0" />
                            <p className="ml-3 text-gray-600">{seller.contact_email}</p>
                          </div>
                        )}
                        
                        {seller.website && (
                          <div className="flex">
                            <GlobeAltIcon className="h-5 w-5 text-gray-500 flex-shrink-0" />
                            <a href={`https://${seller.website}`} target="_blank" rel="noopener noreferrer" className="ml-3 text-green-600 hover:text-green-800">
                              {seller.website}
                            </a>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-6">
                        <button className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700">
                          <ChatBubbleLeftIcon className="h-5 w-5 mr-2" />
                          {t("seller.contact_seller")}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
};

export default SellerProfile;