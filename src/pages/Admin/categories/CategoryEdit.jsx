// pages/categories/CategoryEdit.js
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../utils/api";
import CategoryForm from "./CategoryForm";

const CategoryEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(
    () => {
      const fetchCategory = async () => {
        try {
          const response = await api.get(`/categories/${id}`);
          setCategory(response.data.data);
        } catch (err) {
          setError("Failed to load category");
          console.error("Error fetching category:", err);
        } finally {
          setLoading(false);
        }
      };

      fetchCategory();
    },
    [id]
  );

  if (loading) return <div className="flex justify-center p-8">Loading...</div>;
  if (error)
    return (
      <div className="p-4 text-red-500">
        {error}
      </div>
    );
  if (!category && !error && !loading)
    return <div className="p-4 text-red-500">Category not found</div>;

  return <CategoryForm category={category} />;
};

export default CategoryEdit;
