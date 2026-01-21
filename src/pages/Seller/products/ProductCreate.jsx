// pages/seller/ProductCreate.js
import React from "react";
import ProductForm from "./ProductForm";
import { useNavigate } from "react-router-dom";

const SellerProductCreate = () => {
  const navigate = useNavigate();
  
  const handleSuccess = () => {
    navigate("/admin");
  };

  const handleCancel = () => {
    navigate("/admin");
  };

  return <ProductForm onSuccess={handleSuccess} onCancel={handleCancel} />;
};

export default SellerProductCreate;