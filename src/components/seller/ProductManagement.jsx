import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowPathIcon,
  CubeIcon,
  TagIcon,
  XMarkIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  TicketIcon,
  PhotoIcon,
  StarIcon,
  ArrowTopRightOnSquareIcon,
  CheckCircleIcon
} from "@heroicons/react/24/solid";
import {
  ChevronUpDownIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  AdjustmentsHorizontalIcon
} from "@heroicons/react/24/outline";
import api from "../../utils/api";
import ProductDiscountModal from "./ProductDiscountModal";

const ProductManagement = ({ onAddProduct, onEditProduct: propOnEditProduct }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [categories, setCategories] = useState([]);

  // Modal states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [discountModalOpen, setDiscountModalOpen] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [statusTarget, setStatusTarget] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/seller/products/my-products");
      console.log("Products response:", response.data);

      if (response.data.success) {
        setProducts(response.data.data || []);
      } else {
        setError(response.data.message || "Failed to fetch products");
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch products";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories");
      if (response.data.success) {
        setCategories(response.data.data || []);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  // Enhanced product image handler
  const getProductImage = (product) => {
    if (!product.images || product.images.length === 0) {
      return "/placeholder-product.jpg";
    }

    // Handle different image formats
    const firstImage = product.images[0];
    
    if (typeof firstImage === "string") {
      // If it's a string URL
      return firstImage;
    } else if (firstImage.url) {
      // If it's an object with url property
      return firstImage.url;
    } else if (firstImage.full_url) {
      // If it has full_url property
      return firstImage.full_url;
    } else if (firstImage.path) {
      // If it has path property
      return firstImage.path;
    }
    
    return "/placeholder-product.jpg";
  };

  // Get primary image
  const getPrimaryImage = (product) => {
    if (!product.images || product.images.length === 0) {
      return "/placeholder-product.jpg";
    }

    // Find primary image
    const primaryImage = product.images.find(img => {
      if (typeof img === 'object') {
        return img.is_primary === true;
      }
      return false;
    });

    if (primaryImage) {
      return primaryImage.url || primaryImage.full_url || primaryImage.path || "/placeholder-product.jpg";
    }

    // If no primary, return first image
    return getProductImage(product);
  };

  // Get all images for a product
  const getAllImages = (product) => {
    if (!product.images || product.images.length === 0) {
      return [];
    }

    return product.images.map(img => {
      if (typeof img === "string") {
        return {
          url: img,
          is_primary: false,
          angle: "default"
        };
      }
      return {
        url: img.url || img.full_url || img.path || "",
        is_primary: img.is_primary || false,
        angle: img.angle || "default"
      };
    }).filter(img => img.url); // Filter out empty URLs
  };

  // Open image gallery modal
  const openImageGallery = (product) => {
    setSelectedProduct(product);
    setSelectedImages(getAllImages(product));
    setImageModalOpen(true);
  };

  // Handle image upload for existing product
  const handleImageUpload = async (product, files) => {
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append("images[]", file);
      });

      const response = await api.post(`/products/${product.id}/upload-image`, formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      if (response.data.success) {
        fetchProducts(); // Refresh products
        return { success: true, message: "Images uploaded successfully" };
      }
    } catch (err) {
      console.error("Error uploading images:", err);
      return { success: false, message: err.response?.data?.message || "Failed to upload images" };
    }
  };

  // Set primary image
  const setPrimaryImage = async (product, imageIndex) => {
    try {
      await api.post(`/products/${product.id}/set-primary-image/${imageIndex}`);
      fetchProducts(); // Refresh products
      return { success: true, message: "Primary image updated" };
    } catch (err) {
      console.error("Error setting primary image:", err);
      return { success: false, message: err.response?.data?.message || "Failed to set primary image" };
    }
  };

  // Delete image
  const deleteImage = async (product, imageIndex) => {
    if (!window.confirm("Are you sure you want to delete this image?")) return;
    
    try {
      await api.delete(`/products/${product.id}/images/${imageIndex}`);
      fetchProducts(); // Refresh products
      return { success: true, message: "Image deleted successfully" };
    } catch (err) {
      console.error("Error deleting image:", err);
      return { success: false, message: err.response?.data?.message || "Failed to delete image" };
    }
  };

  const confirmDelete = (product) => {
    setSelectedProduct(product);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;
    try {
      await api.delete(`/products/${selectedProduct.id}`);
      await fetchProducts();
      setDeleteModalOpen(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error("Delete error:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to delete product";
      alert(errorMessage);
    }
  };

  const confirmStatusToggle = (product) => {
    setSelectedProduct(product);
    setStatusTarget(!product.is_active);
    setStatusModalOpen(true);
  };

  const handleProductStatus = async () => {
    if (!selectedProduct) return;
    try {
      await api.put(`/products/${selectedProduct.id}`, {
        is_active: statusTarget
      });
      await fetchProducts();
      setStatusModalOpen(false);
      setSelectedProduct(null);
      setStatusTarget(null);
    } catch (error) {
      console.error("Status update error:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to update product status";
      alert(errorMessage);
    }
  };

  // Open discount modal
  const handleOpenDiscountModal = (product) => {
    setSelectedProduct(product);
    setDiscountModalOpen(true);
  };

  // Close discount modal
  const handleCloseDiscountModal = () => {
    setDiscountModalOpen(false);
    setSelectedProduct(null);
  };

  // Handle discount success
  const handleDiscountSuccess = () => {
    fetchProducts(); // Refresh products to show updated discount
    setDiscountModalOpen(false);
  };

  // Complete the onEditProduct function
  const handleEditProduct = (product) => {
    console.log("Editing product:", product);
    
    if (typeof propOnEditProduct === 'function') {
      propOnEditProduct(product);
    } else {
      navigate(`/seller/products/${product.id}/edit`);
    }
  };

  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  // Filter products based on search and filters
  const getFilteredProducts = () => {
    let filtered = [...products];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(term) ||
        (product.description && product.description.toLowerCase().includes(term)) ||
        (product.sku && product.sku.toLowerCase().includes(term)) ||
        (product.brand && product.brand.toLowerCase().includes(term))
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(product => 
        statusFilter === "active" ? product.is_active : !product.is_active
      );
    }

    // Apply category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter(product => 
        product.category_id == categoryFilter
      );
    }

    return filtered;
  };

  const filteredProducts = getFilteredProducts();

  // Sort filtered products
  const getSortedProducts = () => {
    if (!sortConfig.key) return filteredProducts;

    return [...filteredProducts].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      if (sortConfig.key === "category" && a.category && b.category) {
        aValue = a.category.name_en;
        bValue = b.category.name_en;
      }

      if (sortConfig.key === "name") {
        aValue = aValue?.toLowerCase() || "";
        bValue = bValue?.toLowerCase() || "";
      }

      if (aValue < bValue) {
        return sortConfig.direction === "ascending" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "ascending" ? 1 : -1;
      }
      return 0;
    });
  };

  const sortedProducts = getSortedProducts();

  const getStatusColor = (status) =>
    status ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800";

  const getStatusText = (isActive) => (isActive ? "active" : "inactive");

  const formatPrice = (price) => {
    if (!price) return "$0.00";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(price);
  };

  // Check if product is on sale
  const isProductOnSale = (product) => {
    return product.is_on_sale || product.discount_price || product.discount_percentage;
  };

  // Get sale badge
  const getSaleBadge = (product) => {
    if (product.discount_percentage) {
      return `-${product.discount_percentage}%`;
    } else if (product.discount_price) {
      const discount = product.price - product.discount_price;
      const discountPercent = Math.round((discount / product.price) * 100);
      return `-${discountPercent}%`;
    }
    return "Sale";
  };

  // Get current price
  const getCurrentPrice = (product) => {
    if (isProductOnSale(product)) {
      if (product.discount_price) {
        return product.discount_price;
      } else if (product.discount_percentage) {
        const discount = product.price * (product.discount_percentage / 100);
        return product.price - discount;
      }
    }
    return product.price;
  };

  // Stock status
  const getStockStatus = (quantity) => {
    if (quantity <= 0) return { text: "Out of Stock", color: "bg-red-100 text-red-800" };
    if (quantity <= 10) return { text: "Low Stock", color: "bg-yellow-100 text-yellow-800" };
    return { text: "In Stock", color: "bg-green-100 text-green-800" };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-red-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">{error}</h3>
            <div className="mt-2">
              <button
                onClick={fetchProducts}
                className="text-sm text-red-700 underline hover:text-red-600"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {t("seller.product_management")}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {t("seller.manage_your_products")}
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <button
            onClick={fetchProducts}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowPathIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            {t("seller.product.refresh")}
          </button>
          <button
            onClick={() => navigate("/products/create")}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            {t("seller.product.add_product")}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Products
            </label>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, SKU, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name_en}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters */}
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setCategoryFilter("all");
              }}
              className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <XMarkIcon className="mr-2 h-4 w-4" />
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Products Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-lg mr-4">
              <CubeIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">{products.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-lg mr-4">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Products</p>
              <p className="text-2xl font-bold text-gray-900">
                {products.filter(p => p.is_active).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="bg-yellow-100 p-3 rounded-lg mr-4">
              <TagIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">On Sale</p>
              <p className="text-2xl font-bold text-gray-900">
                {products.filter(p => isProductOnSale(p)).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="bg-red-100 p-3 rounded-lg mr-4">
              <CubeIcon className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Out of Stock</p>
              <p className="text-2xl font-bold text-gray-900">
                {products.filter(p => p.quantity <= 0).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("category")}
                >
                  <div className="flex items-center">
                    Category
                    <ChevronUpDownIcon className="ml-1 h-4 w-4" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("price")}
                >
                  <div className="flex items-center">
                    Price
                    <ChevronUpDownIcon className="ml-1 h-4 w-4" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("quantity")}
                >
                  <div className="flex items-center">
                    Stock
                    <ChevronUpDownIcon className="ml-1 h-4 w-4" />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedProducts.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-12 text-center text-sm text-gray-500"
                  >
                    <div className="flex flex-col items-center">
                      <CubeIcon className="h-16 w-16 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No products found
                      </h3>
                      <p className="text-gray-600 mb-4 max-w-md mx-auto">
                        {searchTerm || statusFilter !== "all" || categoryFilter !== "all" 
                          ? "No products match your filters. Try adjusting your search criteria."
                          : "You haven't added any products yet. Start by creating your first product listing."}
                      </p>
                      {(!searchTerm && statusFilter === "all" && categoryFilter === "all") && (
                        <button
                          onClick={() => navigate("/products/create")}
                          className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700"
                        >
                          Add Your First Product
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                sortedProducts.map((product) => {
                  const stockStatus = getStockStatus(product.quantity);

                  return (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-12 w-12 flex-shrink-0 relative group">
                            <img
                              className="h-12 w-12 rounded-lg object-cover cursor-pointer"
                              src={getPrimaryImage(product)}
                              alt={product.name}
                              onClick={() => openImageGallery(product)}
                              onError={(e) => {
                                e.target.src = "/placeholder-product.jpg";
                              }}
                            />
                            {isProductOnSale(product) && (
                              <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                                {getSaleBadge(product)}
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
                              <PhotoIcon className="h-5 w-5 text-white" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {product.name_en || product.name_mm || "Unnamed Product"}
                            </div>
                            <div className="flex items-center space-x-2">
                              {isProductOnSale(product) ? (
                                <>
                                  <span className="text-sm font-bold text-red-600">
                                    {formatPrice(getCurrentPrice(product))}
                                  </span>
                                  <span className="text-sm text-gray-400 line-through">
                                    {formatPrice(product.price)}
                                  </span>
                                </>
                              ) : (
                                <span className="text-sm font-medium text-gray-900">
                                  {formatPrice(product.price)}
                                </span>
                              )}
                            </div>
                            {product.sku && (
                              <div className="text-xs text-gray-500 mt-1">
                                SKU: {product.sku}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {product.category?.name_en || "Uncategorized"}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {isProductOnSale(product) ? (
                          <div className="space-y-1">
                            <div className="text-red-600 font-bold">
                              {formatPrice(getCurrentPrice(product))}
                            </div>
                            <div className="text-xs text-gray-500 line-through">
                              {formatPrice(product.price)}
                            </div>
                          </div>
                        ) : (
                          formatPrice(product.price)
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stockStatus.color}`}>
                          {stockStatus.text} ({product.quantity})
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => confirmStatusToggle(product)}
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            product.is_active
                          )}`}
                        >
                          {getStatusText(product.is_active)}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => navigate(`/products/${product.id}`)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                            title="View Product"
                          >
                            <ArrowTopRightOnSquareIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleOpenDiscountModal(product)}
                            className={`p-1 rounded ${isProductOnSale(product) ? 'text-yellow-600 hover:text-yellow-900 hover:bg-yellow-50' : 'text-blue-600 hover:text-blue-900 hover:bg-blue-50'}`}
                            title={isProductOnSale(product) ? "Edit Discount" : "Add Discount"}
                          >
                            <TagIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                            title="Edit Product"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => confirmDelete(product)}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                            title="Delete Product"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Info */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
        <div className="flex-1 flex justify-between sm:hidden">
          <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            Previous
          </button>
          <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            Next
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">1</span> to <span className="font-medium">{sortedProducts.length}</span> of{' '}
              <span className="font-medium">{sortedProducts.length}</span> results
            </p>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Confirm Delete
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete "{selectedProduct?.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Toggle Modal */}
      {statusModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Confirm Status Change
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              {statusTarget
                ? `Are you sure you want to activate "${selectedProduct?.name}"? The product will be visible to customers.`
                : `Are you sure you want to deactivate "${selectedProduct?.name}"? The product will be hidden from customers.`}
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setStatusModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleProductStatus}
                className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
                  statusTarget 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-yellow-600 hover:bg-yellow-700'
                }`}
              >
                {statusTarget ? 'Activate' : 'Deactivate'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Discount Modal */}
      {discountModalOpen && selectedProduct && (
        <ProductDiscountModal
          product={selectedProduct}
          onClose={handleCloseDiscountModal}
          onSuccess={handleDiscountSuccess}
        />
      )}

      {/* Image Gallery Modal */}
      {imageModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedProduct.name} - Images
              </h3>
              <button
                onClick={() => setImageModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="p-4">
              {selectedImages.length === 0 ? (
                <div className="text-center py-8">
                  <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No images available for this product.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {selectedImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image.url}
                        alt={`Product image ${index + 1}`}
                        className="w-full h-48 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.src = "/placeholder-product.jpg";
                        }}
                      />
                      {image.is_primary && (
                        <div className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                          Primary
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
                        <div className="flex space-x-2">
                          {!image.is_primary && (
                            <button
                              onClick={() => setPrimaryImage(selectedProduct, index)}
                              className="bg-white text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-100"
                            >
                              Set Primary
                            </button>
                          )}
                          <button
                            onClick={() => deleteImage(selectedProduct, index)}
                            className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-4 border-t bg-gray-50">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500">
                  {selectedImages.length} image(s)
                </p>
                <div className="flex space-x-2">
                  <label className="cursor-pointer bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700">
                    Add Images
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(selectedProduct, Array.from(e.target.files))}
                    />
                  </label>
                  <button
                    onClick={() => setImageModalOpen(false)}
                    className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;