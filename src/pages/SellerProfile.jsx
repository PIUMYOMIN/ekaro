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

  // Mock data for seller
  useEffect(() => {
    // In a real app, this would be API calls
    const mockSeller = {
      id: 1,
      name: "Golden Harvest",
      category: "Agriculture",
      description: "Golden Harvest is a leading agricultural producer in Myanmar, specializing in organic rice and seasonal fruits. We've been serving customers since 2010 with high-quality, sustainably grown products.",
      rating: 4.7,
      reviewCount: 245,
      joined: "2020-05-12",
      products: 42,
      verified: true,
      address: "123 Farm Road, Bago, Myanmar",
      phone: "+959123456789",
      email: "contact@goldenharvest.com",
      website: "www.goldenharvest.com",
      socialMedia: {
        facebook: "goldenharvestmm",
        instagram: "goldenharvestmm"
      },
      businessHours: "Mon-Fri: 8AM - 5PM, Sat: 8AM - 1PM",
      paymentMethods: ["KBZ Pay", "Wave Money", "Cash on Delivery"],
      shippingOptions: ["Standard Delivery (3-5 days)", "Express Delivery (1-2 days)"]
    };

    const mockProducts = [
      { id: 1, name: "Organic Jasmine Rice", price: 45000, category: "Rice", rating: 4.8, stock: 120 },
      { id: 2, name: "Organic Brown Rice", price: 42000, category: "Rice", rating: 4.6, stock: 85 },
      { id: 3, name: "Mangoes (Seasonal)", price: 8000, category: "Fruits", rating: 4.9, stock: 45 },
      { id: 4, name: "Bananas (Bunch)", price: 5000, category: "Fruits", rating: 4.5, stock: 62 },
      { id: 5, name: "Organic Peanuts", price: 12000, category: "Nuts", rating: 4.7, stock: 38 },
      { id: 6, name: "Sesame Seeds", price: 15000, category: "Seeds", rating: 4.4, stock: 27 }
    ];

    const mockReviews = [
      { id: 1, user: "Ko Aung", rating: 5, date: "2023-06-15", comment: "Excellent quality rice, will definitely order again!", product: "Organic Jasmine Rice" },
      { id: 2, user: "Ma Hla", rating: 4, date: "2023-06-10", comment: "Fast delivery and good packaging. The rice was fresh and aromatic.", product: "Organic Brown Rice" },
      { id: 3, user: "U Myint", rating: 5, date: "2023-05-28", comment: "Best mangoes I've had this season! Sweet and juicy.", product: "Mangoes (Seasonal)" },
      { id: 4, user: "Daw Khin", rating: 4, date: "2023-05-20", comment: "Good quality products overall. The delivery took a bit longer than expected.", product: "Organic Peanuts" },
      { id: 5, user: "Ko Zaw", rating: 5, date: "2023-05-15", comment: "Consistently great products from this seller. Highly recommended!", product: "Sesame Seeds" },
      { id: 6, user: "Ma Su", rating: 3, date: "2023-05-10", comment: "The bananas were good but some were overripe when they arrived.", product: "Bananas (Bunch)" },
      { id: 7, user: "U Ba", rating: 5, date: "2023-05-05", comment: "Excellent service and products. Will be a returning customer.", product: "Organic Jasmine Rice" }
    ];

    setSeller(mockSeller);
    setProducts(mockProducts);
    setReviews(mockReviews);
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

  if (!seller) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-700">Loading seller information...</p>
        </div>
      </div>
    );
  }

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
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-32 h-32" />
              </div>
              <div className="flex-1">
                <div className="flex items-center">
                  <h1 className="text-2xl font-bold text-gray-900">{seller.name}</h1>
                  {seller.verified && (
                    <CheckCircleIcon className="ml-2 h-6 w-6 text-green-500" />
                  )}
                </div>
                <p className="text-sm text-gray-500">{seller.category}</p>
                
                <div className="mt-2 flex items-center">
                  {renderStars(seller.rating)}
                  <span className="ml-2 text-sm font-medium text-gray-900">{seller.rating}</span>
                  <span className="mx-1 text-gray-300">•</span>
                  <span className="text-sm text-gray-500">{seller.reviewCount} {t("seller.reviews")}</span>
                </div>
                
                <p className="mt-4 text-gray-600">{seller.description}</p>
                
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {t("seller.member_since")} {new Date(seller.joined).getFullYear()}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {seller.products} {t("seller.products")}
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
                {t("seller.products")} ({products.length})
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
                {t("seller.reviews")} ({reviews.length})
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
              {products.length === 0 ? (
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
                        {renderStars(seller.rating)}
                        <span className="ml-2 text-sm font-medium text-gray-900">{seller.rating} {t("seller.out_of_5")}</span>
                      </div>
                    </div>
                    <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700">
                      {t("seller.write_review")}
                    </button>
                  </div>

                  {currentReviews.length === 0 ? (
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
                      
                      <h4 className="mt-6 text-md font-medium text-gray-900">{t("seller.business_hours")}</h4>
                      <p className="mt-2 text-gray-600">{seller.businessHours}</p>
                      
                      <h4 className="mt-6 text-md font-medium text-gray-900">{t("seller.payment_methods")}</h4>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {seller.paymentMethods.map((method, index) => (
                          <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {method}
                          </span>
                        ))}
                      </div>
                      
                      <h4 className="mt-6 text-md font-medium text-gray-900">{t("seller.shipping_options")}</h4>
                      <ul className="mt-2 list-disc list-inside text-gray-600">
                        {seller.shippingOptions.map((option, index) => (
                          <li key={index}>{option}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="p-6">
                      <h3 className="text-lg font-medium text-gray-900">{t("seller.contact_info")}</h3>
                      
                      <div className="mt-4 space-y-4">
                        <div className="flex">
                          <MapPinIcon className="h-5 w-5 text-gray-500 flex-shrink-0" />
                          <p className="ml-3 text-gray-600">{seller.address}</p>
                        </div>
                        
                        <div className="flex">
                          <PhoneIcon className="h-5 w-5 text-gray-500 flex-shrink-0" />
                          <p className="ml-3 text-gray-600">{seller.phone}</p>
                        </div>
                        
                        <div className="flex">
                          <EnvelopeIcon className="h-5 w-5 text-gray-500 flex-shrink-0" />
                          <p className="ml-3 text-gray-600">{seller.email}</p>
                        </div>
                        
                        {seller.website && (
                          <div className="flex">
                            <GlobeAltIcon className="h-5 w-5 text-gray-500 flex-shrink-0" />
                            <a href={`https://${seller.website}`} target="_blank" rel="noopener noreferrer" className="ml-3 text-green-600 hover:text-green-800">
                              {seller.website}
                            </a>
                          </div>
                        )}
                      </div>
                      
                      <h4 className="mt-6 text-md font-medium text-gray-900">{t("seller.social_media")}</h4>
                      <div className="mt-2 flex space-x-4">
                        {seller.socialMedia.facebook && (
                          <a href={`https://facebook.com/${seller.socialMedia.facebook}`} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-700">
                            <span className="sr-only">Facebook</span>
                            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                              <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                            </svg>
                          </a>
                        )}
                        {seller.socialMedia.instagram && (
                          <a href={`https://instagram.com/${seller.socialMedia.instagram}`} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-700">
                            <span className="sr-only">Instagram</span>
                            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                              <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                            </svg>
                          </a>
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