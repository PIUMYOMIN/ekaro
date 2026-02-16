import React, { useState, useEffect } from "react";
import { 
  ChevronDownIcon, 
  ChevronRightIcon, 
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon
} from "@heroicons/react/24/outline";
import api from "../../utils/api";
import { useNavigate } from "react-router-dom";

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get("/categories");
      if (response.data.success) {
        setCategories(response.data.data);
      } else {
        setCategories(response.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      setError(err.response?.data?.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const toggleCategory = (categoryId) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const handleDelete = async (categoryId) => {
    if (window.confirm("Are you sure you want to delete this category? This action cannot be undone.")) {
      try {
        await api.delete(`/categories/${categoryId}`);
        alert("Category deleted successfully");
        fetchCategories(); // Refresh the list
      } catch (error) {
        alert(error.response?.data?.message || "Failed to delete category");
      }
    }
  };

  // Helper function to flatten the nested category tree
  const flattenCategories = (categories, level = 0) => {
    let result = [];

    categories.forEach((category) => {
      result.push({
        ...category,
        level,
        hasChildren: (category.children && category.children.length > 0) || false,
        isExpanded: expandedCategories[category.id] || false
      });

      // If category is expanded and has children, recursively add them
      if (expandedCategories[category.id] && category.children) {
        result = result.concat(flattenCategories(category.children, level + 1));
      }
    });

    return result;
  };

  // Filter categories based on search term
  const filterCategories = (categories, term) => {
    if (!term) return categories;

    return categories.filter(category => {
      const matches = 
        (category.name_en && category.name_en.toLowerCase().includes(term.toLowerCase())) ||
        (category.name_mm && category.name_mm.toLowerCase().includes(term.toLowerCase())) ||
        (category.description_en && category.description_en.toLowerCase().includes(term.toLowerCase()));

      // Also check children
      if (category.children && category.children.length > 0) {
        const childrenMatches = filterCategories(category.children, term);
        return matches || childrenMatches.length > 0;
      }

      return matches;
    });
  };

  const filteredCategories = filterCategories(categories, searchTerm);
  const flattenedCategories = flattenCategories(filteredCategories);

  const columns = [
    { header: "Category Name", accessor: "name" },
    { header: "Myanmar Name", accessor: "name_mm" },
    { header: "Slug", accessor: "slug_en" },
    { header: "Commission Rate", accessor: "commission_rate" },
    { header: "Status", accessor: "status" },
    { header: "Actions", accessor: "actions" }
  ];

  const categoryData = flattenedCategories.map((category) => ({
    ...category,
    name: (
      <div
        className="flex items-center min-w-[300px]"
        style={{ paddingLeft: `${category.level * 24}px` }}
      >
        {category.hasChildren && (
          <button
            onClick={() => toggleCategory(category.id)}
            className="mr-2 text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-100"
          >
            {category.isExpanded ? (
              <ChevronDownIcon className="h-4 w-4" />
            ) : (
              <ChevronRightIcon className="h-4 w-4" />
            )}
          </button>
        )}
        {!category.hasChildren && <span className="ml-6"></span>}
        <div className="flex items-center">
          {category.image && (
            <img 
              src={category.image.startsWith('http') 
                ? category.image 
                : `${process.env.REACT_APP_API_URL || 'https://api.pyonea.com/api/v1'}/storage/${category.image.replace('public/', '')}`
              }
              alt={category.name_en}
              className="w-8 h-8 rounded-full object-cover mr-3"
              onError={(e) => {
                e.target.src = '/placeholder-category.jpg';
                e.target.className = 'w-8 h-8 rounded-full bg-gray-200 mr-3';
              }}
            />
          )}
          <div>
            <div className="font-medium text-gray-900">{category.name_en}</div>
            {category.description_en && (
              <div className="text-xs text-gray-500 truncate max-w-xs">
                {category.description_en}
              </div>
            )}
          </div>
        </div>
      </div>
    ),
    name_mm: (
      <span className="text-gray-600">
        {category.name_mm || "-"}
      </span>
    ),
    slug_en: (
      <span className="font-mono text-sm text-gray-500">
        /{category.slug_en}
      </span>
    ),
    commission_rate: (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        {category.commission_rate || 0}%
      </span>
    ),
    status: (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        category.is_active 
          ? 'bg-green-100 text-green-800' 
          : 'bg-red-100 text-red-800'
      }`}>
        {category.is_active ? 'Active' : 'Inactive'}
      </span>
    ),
    actions: (
      <div className="flex space-x-2">
        <button
          className="inline-flex items-center p-1.5 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded"
          onClick={() => navigate(`/admin/categories/${category.id}/edit`)}
          title="Edit Category"
        >
          <PencilIcon className="h-4 w-4" />
        </button>
        <button
          className="inline-flex items-center p-1.5 text-red-600 hover:text-red-900 hover:bg-red-50 rounded"
          onClick={() => handleDelete(category.id)}
          title="Delete Category"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
        <button
          className="inline-flex items-center p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded"
          onClick={() => navigate(`/admin/categories/create?parent=${category.id}`)}
          title="Add Subcategory"
        >
          <PlusIcon className="h-4 w-4" />
        </button>
      </div>
    )
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Category Management</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage product categories and their hierarchy
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            onClick={() => navigate("/admin/categories/create")}
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Category
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search categories by name or description..."
              className="block w-full rounded-md border-0 py-2 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span>Total: {categories.length}</span>
            <span>•</span>
            <span>Showing: {filteredCategories.length}</span>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-lg shadow p-8 flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mb-4"></div>
          <p className="text-gray-600">Loading categories...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading categories</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={fetchCategories}
                  className="text-sm font-medium text-red-600 hover:text-red-500"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Categories Table */}
      {!loading && !error && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
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
                      key={`${category.id}-${index}`}
                      className={`hover:bg-gray-50 ${
                        category.level > 0 ? 'bg-gray-50/50' : ''
                      }`}
                    >
                      {columns.map((column) => (
                        <td
                          key={column.accessor}
                          className="px-6 py-4 whitespace-nowrap text-sm"
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
                      className="px-6 py-12 text-center"
                    >
                      <div className="flex flex-col items-center">
                        <svg className="h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">
                          {searchTerm 
                            ? "No categories found" 
                            : "No categories yet"
                          }
                        </h3>
                        <p className="text-gray-500 mb-4">
                          {searchTerm 
                            ? "Try adjusting your search or filter"
                            : "Get started by creating your first category"
                          }
                        </p>
                        {!searchTerm && (
                          <button
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            onClick={() => navigate("/admin/categories/create")}
                          >
                            <PlusIcon className="h-4 w-4 mr-2" />
                            Create Category
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer Stats */}
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing <span className="font-medium">{flattenedCategories.length}</span> of{" "}
                <span className="font-medium">{categories.length}</span> categories
              </div>
              <div className="text-sm text-gray-500">
                {expandedCategories && (
                  <button
                    onClick={() => setExpandedCategories({})}
                    className="text-green-600 hover:text-green-900"
                  >
                    Collapse All
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManagement;