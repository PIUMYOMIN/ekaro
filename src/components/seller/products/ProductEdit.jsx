// pages/seller/ProductEdit.js
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../utils/api";
import ProductForm from "./ProductForm";

const ProductEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(
    () => {
      const fetchProduct = async () => {
        try {
          const response = await api.get(`/products/${id}`);
          const productData = response.data.data.product;

          // Parse images and specifications if they're stored as JSON strings
          let formattedImages = [];
          if (productData.images) {
            if (Array.isArray(productData.images)) {
              formattedImages = productData.images;
            } else if (typeof productData.images === "string") {
              try {
                formattedImages = JSON.parse(productData.images);
              } catch (e) {
                console.warn("Failed to parse images JSON:", e);
                formattedImages = [
                  { url: productData.images, angle: "front", is_primary: true }
                ];
              }
            }
          }

          let formattedSpecifications = {};
          if (productData.specifications) {
            if (typeof productData.specifications === "string") {
              try {
                formattedSpecifications = JSON.parse(
                  productData.specifications
                );
              } catch (e) {
                console.warn("Failed to parse specifications JSON:", e);
                formattedSpecifications = {};
              }
            } else if (typeof productData.specifications === "object") {
              formattedSpecifications = productData.specifications;
            }
          }

          setProduct({
            ...productData,
            images: formattedImages,
            specifications: formattedSpecifications
          });
        } catch (err) {
          setError("Failed to load product");
          console.error("Error fetching product:", err);
        } finally {
          setLoading(false);
        }
      };

      fetchProduct();
    },
    [id]
  );

  const handleSuccess = () => {
    setSuccess(true);
    setTimeout(() => {
      navigate("/seller");
    }, 1500); // Redirect after 1.5s
  };

  if (loading) return <div className="flex justify-center p-8">Loading...</div>;
  if (error)
    return (
      <div className="p-4 text-red-500">
        {error}
      </div>
    );
  if (!product)
    return <div className="p-4 text-red-500">Product not found</div>;

  return (
    <div>
      {success && (
        <div className="p-4 mb-4 bg-green-100 text-green-700 rounded">
          Product updated successfully!
        </div>
      )}
      <ProductForm product={product} isSeller={true} onSuccess={handleSuccess} />
    </div>
  );
};

export default ProductEdit;
