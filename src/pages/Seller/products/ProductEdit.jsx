// pages/seller/ProductEdit.jsx
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import ProductForm from "./ProductForm";

const ProductEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate("/seller/dashboard");
  };

  const handleCancel = () => {
    navigate("/seller/dashboard");
  };

  return (
    <ProductForm
      product={{ id: parseInt(id, 10) }}
      onSuccess={handleSuccess}
      onCancel={handleCancel}
    />
  );
};

export default ProductEdit;