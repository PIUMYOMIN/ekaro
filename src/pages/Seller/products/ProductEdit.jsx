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

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/seller/products/${id}/edit`);
        setProduct(response.data.data);
      } catch (err) {
        setError("Failed to load product");
        console.error("Error fetching product:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleSuccess = () => {
    setSuccess(true);
    setTimeout(() => {
      navigate("/seller");
    }, 1500);
  };

  if (loading) return <div className="flex justify-center p-8">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!product) return <div className="p-4 text-red-500">Product not found</div>;

  return (
    <div>
      {success && (
        <div className="p-4 mb-4 bg-green-100 text-green-700 rounded">
          Product updated successfully!
        </div>
      )}
      <ProductForm product={product} onSuccess={handleSuccess} />
    </div>
  );
};

export default ProductEdit;