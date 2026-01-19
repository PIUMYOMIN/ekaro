import React, { useState } from "react";
import { ChevronDownIcon, ChevronRightIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import api from "../../utils/api"; // Assuming you have an API utility for making requests
const CategoryManagement = ({ categories, loading, error, navigate }) => {
  const [expandedCategories, setExpandedCategories] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  const toggleCategory = (categoryId) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const handleDelete = async (categoryId) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await api.delete(`/categories/${categoryId}`);
        // You might want to add a callback to refresh the category list
        alert("Category deleted successfully");
      } catch (error) {
        alert(error.response?.data?.message || "Failed to delete category");
      }
    }
  };

  // Flatten the category tree for display with proper indentation
  const flattenCategories = (categories, level = 0) => {
    let result = [];

    categories.forEach((category) => {
      result.push({
        ...category,
        level,
        hasChildren: category.children && category.children.length > 0,
        isExpanded: expandedCategories[category.id] || false
      });

      // If category is expanded, add its children
      if (expandedCategories[category.id] && category.children) {
        result = result.concat(flattenCategories(category.children, level + 1));
      }
    });

    return result;
  };

  // Filter categories based on search term
  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.name_mm?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const flattenedCategories = flattenCategories(filteredCategories);

  const columns = [
    { header: "Name", accessor: "name" },
    { header: "Myanmar Name", accessor: "name_mm" },
    { header: "Description", accessor: "description" },
    { header: "Commission", accessor: "commission_rate" },
    { header: "Level", accessor: "level" },
    { header: "Actions", accessor: "actions" }
  ];

  const categoryData = flattenedCategories.map((category) => ({
    ...category,
    commission_rate: `${category.commission_rate}%`,
    name: (
      <div
        className="flex items-center"
        style={{ paddingLeft: `${category.level * 24}px` }}
      >
        {category.hasChildren && (
          <button
            onClick={() => toggleCategory(category.id)}
            className="mr-1 text-gray-500 hover:text-gray-700"
          >
            {category.isExpanded ? (
              <ChevronDownIcon className="h-4 w-4" />
            ) : (
              <ChevronRightIcon className="h-4 w-4" />
            )}
          </button>
        )}
        {!category.hasChildren && <span className="ml-5"></span>}
        <span className="ml-1">{category.name}</span>
      </div>
    ),
    actions: (
      <div className="flex space-x-2">
        <button
          className="text-indigo-600 hover:text-indigo-900"
          onClick={() => navigate(`/categories/${category.id}/edit`)}
        >
          Edit
        </button>
        <button
          className="text-red-600 hover:text-red-900"
          onClick={() => handleDelete(category.id)}
        >
          Delete
        </button>
      </div>
    )
  }));

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            Category Management
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Manage product categories and hierarchy
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            onClick={() => navigate("/categories/create")}
          >
            Add New Category
          </button>
        </div>
      </div>

      <div className="p-4 border-b border-gray-200">
        <div className="relative max-w-xs">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search categories..."
            className="block w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading && (
        <div className="p-8 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
        </div>
      )}

      {error && (
        <div className="p-4 text-red-500 bg-red-50">
          Error loading categories: {error.message}
        </div>
      )}

      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.accessor}
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categoryData.length > 0 ? (
                categoryData.map((category, index) => (
                  <tr
                    key={index}
                    className={category.level > 0 ? "bg-gray-50" : ""}
                  >
                    {columns.map((column) => (
                      <td
                        key={column.accessor}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                      >
                        {category[column.accessor]}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    {searchTerm
                      ? "No categories found matching your search"
                      : "No categories available"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CategoryManagement;