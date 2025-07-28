// src/pages/ProductDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCart } from "../context/CartContext";
import { StarIcon } from "@heroicons/react/24/solid";

const ProductDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(
    () => {
      // Simulate API call
      const fetchProduct = async () => {
        setLoading(true);
        try {
          // Mock data based on product id
          const mockProduct = {
            id: 1,
            name: "Organic Rice",
            price: 45000,
            category: "Agriculture",
            rating: 4.5,
            reviewCount: 28,
            description:
              "High-quality organic rice grown in Myanmar with sustainable farming practices.",
            seller: "Golden Harvest",
            stock: 100,
            images: [
              "https://via.placeholder.com/600x400?text=Product+Image+1",
              "https://via.placeholder.com/600x400?text=Product+Image+2",
              "https://via.placeholder.com/600x400?text=Product+Image+3",
              "https://via.placeholder.com/600x400?text=Product+Image+4"
            ],
            specifications: {
              weight: "5kg",
              origin: "Mandalay",
              certification: "Organic Certified"
            }
          };

          // Mock reviews
          const mockReviews = [
            {
              id: 1,
              user: "Ko Aung",
              rating: 5,
              date: "2023-05-15",
              comment:
                "Excellent quality rice! Very fragrant and cooks perfectly every time."
            },
            {
              id: 2,
              user: "Ma Hla",
              rating: 4,
              date: "2023-04-22",
              comment: "Good quality for the price. Will buy again."
            },
            {
              id: 3,
              user: "U Myint",
              rating: 3,
              date: "2023-03-10",
              comment: "Decent rice but delivery took longer than expected."
            }
          ];

          setProduct(mockProduct);
          setReviews(mockReviews);
        } catch (error) {
          console.error("Failed to fetch product:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchProduct();
    },
    [id]
  );

  const handleSubmitReview = e => {
    e.preventDefault();
    if (rating === 0) {
      alert("Please select a rating");
      return;
    }

    const newReview = {
      id: reviews.length + 1,
      user: "You",
      rating,
      date: new Date().toISOString().split("T")[0],
      comment: reviewText
    };

    setReviews([newReview, ...reviews]);
    setReviewText("");
    setRating(0);
    setShowReviewForm(false);

    // In a real app, you would send this to your backend
    console.log("Submitted review:", newReview);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900">
          {t("productDetail.not_found")}
        </h2>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Images */}
        <div>
          <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center overflow-hidden">
            <img
              src={product.images[activeImage]}
              alt={product.name}
              className="max-h-full max-w-full object-contain"
            />
          </div>
          <div className="grid grid-cols-4 gap-4 mt-4">
            {product.images.map((img, index) =>
              <button
                key={index}
                onClick={() => setActiveImage(index)}
                className={`bg-gray-100 rounded h-24 flex items-center justify-center overflow-hidden ${activeImage ===
                index
                  ? "ring-2 ring-green-500"
                  : ""}`}
              >
                <img
                  src={img}
                  alt={`Preview ${index}`}
                  className="max-h-full max-w-full object-contain"
                />
              </button>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {product.name}
          </h1>

          {/* Rating Summary */}
          <div className="flex items-center mt-2">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map(star =>
                <StarIcon
                  key={star}
                  className={`h-5 w-5 ${star <= Math.round(product.rating)
                    ? "text-yellow-400"
                    : "text-gray-300"}`}
                />
              )}
            </div>
            <span className="ml-2 text-gray-600">
              {product.rating} ({product.reviewCount}{" "}
              {t("productDetail.reviews")})
            </span>
          </div>

          <div className="mt-6">
            <h2 className="text-2xl font-semibold text-green-600">
              {product.price.toLocaleString("en-MM", {
                style: "currency",
                currency: "MMK",
                minimumFractionDigits: 0
              })}
            </h2>
            <p className="text-gray-500 mt-1">
              {t("productDetail.tax_inclusive")}
            </p>
          </div>

          <div className="mt-6">
            <p className="text-gray-700">
              {product.description}
            </p>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-semibold">
              {t("productDetail.specifications")}
            </h3>
            <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2">
              {Object.entries(product.specifications).map(([key, value]) =>
                <div key={key} className="border-t border-gray-200 pt-2">
                  <dt className="font-medium text-gray-900">
                    {key.charAt(0).toUpperCase() +
                      key.slice(1).replace(/([A-Z])/g, " $1")}
                  </dt>
                  <dd className="text-gray-700">
                    {value}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          <div className="mt-8 flex items-center">
            <label htmlFor="quantity" className="mr-4 font-medium">
              {t("productDetail.quantity")}
            </label>
            <input
              type="number"
              id="quantity"
              min="1"
              max={product.stock}
              value={quantity}
              onChange={e => setQuantity(parseInt(e.target.value) || 1)}
              className="w-20 px-3 py-2 border border-gray-300 rounded-md"
            />
            <span className="ml-4 text-gray-600">
              {t("productDetail.in_stock", { stock: product.stock })}
            </span>
          </div>

          <div className="mt-8 flex gap-4">
            <button
              onClick={() => addToCart(product, quantity)}
              className="flex-1 bg-green-600 text-white py-3 px-6 rounded-md hover:bg-green-700 transition"
            >
              {t("productDetail.add_to_cart")}
            </button>
            <button className="flex-1 bg-gray-800 text-white py-3 px-6 rounded-md hover:bg-gray-900 transition">
              {t("productDetail.buy_now")}
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold">
              {t("productDetail.seller_info")}
            </h3>
            <div className="mt-2 flex items-center">
              <div className="bg-gray-200 border-2 border-dashed rounded-full w-12 h-12" />
              <div className="ml-4">
                <p className="font-medium">
                  {product.seller}
                </p>
                <p className="text-gray-600">
                  4.7 ★ (120 {t("productDetail.ratings")})
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-16">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">
            {t("productDetail.customer_reviews")}
          </h2>
          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            {t("productDetail.write_review")}
          </button>
        </div>

        {/* Review Form */}
        {showReviewForm &&
          <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium mb-4">
              {t("productDetail.write_review")}
            </h3>
            <form onSubmit={handleSubmitReview}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">
                  {t("productDetail.your_rating")}
                </label>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map(star =>
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="focus:outline-none"
                    >
                      <StarIcon
                        className={`h-8 w-8 ${star <= rating
                          ? "text-yellow-400"
                          : "text-gray-300"}`}
                      />
                    </button>
                  )}
                </div>
              </div>
              <div className="mb-4">
                <label htmlFor="review" className="block text-gray-700 mb-2">
                  {t("productDetail.your_review")}
                </label>
                <textarea
                  id="review"
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={reviewText}
                  onChange={e => setReviewText(e.target.value)}
                  required
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  {t("productDetail.cancel")}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  {t("productDetail.submit_review")}
                </button>
              </div>
            </form>
          </div>}

        {/* Reviews List */}
        <div className="mt-8 space-y-8">
          {reviews.length === 0
            ? <p className="text-gray-500">
                {t("productDetail.no_reviews")}
              </p>
            : reviews.map(review =>
                <div key={review.id} className="border-b border-gray-200 pb-6">
                  <div className="flex items-center">
                    <div className="bg-gray-200 border-2 border-dashed rounded-full w-10 h-10" />
                    <div className="ml-4">
                      <h4 className="font-medium">
                        {review.user}
                      </h4>
                      <div className="flex items-center mt-1">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map(star =>
                            <StarIcon
                              key={star}
                              className={`h-4 w-4 ${star <= review.rating
                                ? "text-yellow-400"
                                : "text-gray-300"}`}
                            />
                          )}
                        </div>
                        <span className="ml-2 text-sm text-gray-500">
                          {review.date}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="mt-4 text-gray-700">
                    {review.comment}
                  </p>
                </div>
              )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
