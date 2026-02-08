import React from "react";
import { Routes, Route } from "react-router-dom";
import CategoryManagement from "./CategoryManagement";
import CategoryForm from "./CategoryForm";

const Categories = () => {
  return (
    <Routes>
      <Route path="/" element={<CategoryManagement />} />
      <Route path="/create" element={<CategoryForm mode="create" />} />
      <Route path="/:id/edit" element={<CategoryForm mode="edit" />} />
    </Routes>
  );
};

export default Categories;