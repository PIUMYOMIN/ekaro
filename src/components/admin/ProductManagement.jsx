import React, { useState, useEffect } from "react";
import { 
  MagnifyingGlassIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  FunnelIcon,
  ArrowsUpDownIcon
} from "@heroicons/react/24/outline";
import api from "../../utils/api";
import { useNavigate } from "react-router-dom";
import DataTable from "../ui/DataTable";

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // active/inactive
  const [approvalFilter, setApprovalFilter] = useState("all"); // pending, approved, rejected
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [categories, setCategories] = useState([]);
  const [sortField, setSortField] = useState("created_at");
  const [sortDirection, setSortDirection] = useState("desc");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [bulkAction, setBulkAction] = useState("");
  const navigate = useNavigate();

  // Fetch products (admin endpoint)
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        per_page: 100,
        include: "category,seller",
        ...(approvalFilter !== "all" && { status: approvalFilter }),
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== "all" && { is_active: statusFilter === "active" }),
        ...(categoryFilter !== "all" && { category_id: categoryFilter }),
      };

      const response = await api.get("/admin/products", { params });
      
      if (response.data.success) {
        setProducts(response.data.data || []);
      } else {
        setProducts(response.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setError(err.response?.data?.message || "Failed to load products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories for filter
  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories?per_page=50");
      if (response.data.success) {
        setCategories(response.data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // Re-fetch when filters change
  useEffect(() => {
    fetchProducts();
  }, [searchTerm, statusFilter, approvalFilter, categoryFilter]);

  // Handle product status change (active/inactive)
  const handleProductStatus = async (productId, isActive) => {
    try {
      await api.put(`/products/${productId}`, {
        is_active: isActive
      });
      
      // Update local state
      setProducts(prev => prev.map(product => 
        product.id === productId 
          ? { ...product, is_active: isActive }
          : product
      ));
      
      alert(`Product ${isActive ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error("Failed to update product status:", error);
      alert(error.response?.data?.message || "Failed to update product status");
    }
  };

  // Approve product
  const handleApprove = async (productId) => {
    if (!window.confirm("Are you sure you want to approve this product?")) return;
    try {
      await api.post(`/admin/products/${productId}/approve`);
      await fetchProducts(); // refresh
      alert("Product approved successfully");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to approve product");
    }
  };

  // Reject product
  const handleReject = async (productId) => {
    const reason = window.prompt("Please enter rejection reason (optional):");
    if (reason === null) return;
    try {
      await api.post(`/admin/products/${productId}/reject`, { reason });
      await fetchProducts();
      alert("Product rejected");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to reject product");
    }
  };

  // Handle product deletion
  const handleDelete = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
      try {
        await api.delete(`/products/${productId}`);
        alert("Product deleted successfully");
        fetchProducts(); // Refresh the list
      } catch (error) {
        alert(error.response?.data?.message || "Failed to delete product");
      }
    }
  };

  // Handle bulk actions
  const handleBulkAction = async () => {
    if (selectedProducts.length === 0) {
      alert("Please select products first");
      return;
    }

    if (!bulkAction) {
      alert("Please select an action");
      return;
    }

    if (window.confirm(`Are you sure you want to ${bulkAction} ${selectedProducts.length} product(s)?`)) {
      try {
        const promises = selectedProducts.map(productId => {
          if (bulkAction === "delete") {
            return api.delete(`/products/${productId}`);
          } else if (bulkAction === "activate") {
            return api.put(`/products/${productId}`, { is_active: true });
          } else if (bulkAction === "deactivate") {
            return api.put(`/products/${productId}`, { is_active: false });
          } else if (bulkAction === "approve") {
            return api.post(`/admin/products/${productId}/approve`);
          } else if (bulkAction === "reject") {
            return api.post(`/admin/products/${productId}/reject`);
          }
        });

        await Promise.all(promises);
        alert(`Successfully performed ${bulkAction} on ${selectedProducts.length} product(s)`);
        fetchProducts(); // Refresh the list
        setSelectedProducts([]);
        setBulkAction("");
      } catch (error) {
        alert(error.response?.data?.message || `Failed to perform ${bulkAction} operation`);
      }
    }
  };

  // Toggle product selection
  const toggleProductSelection = (productId) => {
    setSelectedProducts(prev => 
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  // Toggle all products selection
  const toggleAllProductsSelection = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map(p => p.id));
    }
  };

  // Handle sort
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Filter and sort products (client-side as backup, but server-side is preferred)
  // We'll rely on server-side filtering but keep client-side sort for now
  const filteredProducts = products
    .filter(product => {
      // Client-side filtering for fields not supported by API? We'll skip for simplicity.
      return true;
    })
    .sort((a, b) => {
      const aValue = a[sortField] || "";
      const bValue = b[sortField] || "";
      
      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Format price in MMK
  const formatMMK = (amount) => {
    return new Intl.NumberFormat("my-MM", {
      style: "currency",
      currency: "MMK",
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  // Get product image
  const getProductImage = (product) => {
    if (!product.images) return '/placeholder-product.jpg';
    
    let images = product.images;
    if (typeof images === 'string') {
      try {
        images = JSON.parse(images);
      } catch (e) {
        return images;
      }
    }
    
    if (Array.isArray(images) && images.length > 0) {
      const image = images[0];
      if (typeof image === 'object') {
        return image.url || image.path || '/placeholder-product.jpg';
      }
      return image;
    }
    
    return '/placeholder-product.jpg';
  };

  // Get approval status badge
  const getApprovalBadge = (status) => {
    switch (status) {
      case 'approved':
        return { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircleIcon, label: 'Approved' };
      case 'pending':
        return { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: ClockIcon, label: 'Pending' };
      case 'rejected':
        return { bg: 'bg-red-100', text: 'text-red-800', icon: XCircleIcon, label: 'Rejected' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800', icon: null, label: status || 'Unknown' };
    }
  };

  // DataTable columns
  const columns = [
    { 
      header: (
        <input
          type="checkbox"
          checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
          onChange={toggleAllProductsSelection}
          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
        />
      ), 
      accessor: "selection", 
      width: "50px" 
    },
    { 
      header: "Image", 
      accessor: "image", 
      isImage: true,
      width: "80px"
    },
    { 
      header: (
        <button
          onClick={() => handleSort("name_en")}
          className="flex items-center hover:text-gray-900"
        >
          Name
          {sortField === "name_en" && (
            <ArrowsUpDownIcon className="h-4 w-4 ml-1" />
          )}
        </button>
      ), 
      accessor: "name" 
    },
    { header: "SKU", accessor: "sku" },
    { 
      header: (
        <button
          onClick={() => handleSort("category.name_en")}
          className="flex items-center hover:text-gray-900"
        >
          Category
          {sortField === "category.name_en" && (
            <ArrowsUpDownIcon className="h-4 w-4 ml-1" />
          )}
        </button>
      ), 
      accessor: "category" 
    },
    { 
      header: (
        <button
          onClick={() => handleSort("price")}
          className="flex items-center hover:text-gray-900"
        >
          Price
          {sortField === "price" && (
            <ArrowsUpDownIcon className="h-4 w-4 ml-1" />
          )}
        </button>
      ), 
      accessor: "price", 
      isCurrency: true 
    },
    { 
      header: (
        <button
          onClick={() => handleSort("quantity")}
          className="flex items-center hover:text-gray-900"
        >
          Stock
          {sortField === "quantity" && (
            <ArrowsUpDownIcon className="h-4 w-4 ml-1" />
          )}
        </button>
      ), 
      accessor: "stock" 
    },
    { header: "MOQ", accessor: "min_order" },
    { 
      header: (
        <button
          onClick={() => handleSort("status")}
          className="flex items-center hover:text-gray-900"
        >
          Approval Status
          {sortField === "status" && (
            <ArrowsUpDownIcon className="h-4 w-4 ml-1" />
          )}
        </button>
      ), 
      accessor: "approvalStatus" 
    },
    { 
      header: (
        <button
          onClick={() => handleSort("is_active")}
          className="flex items-center hover:text-gray-900"
        >
          Active/Inactive
          {sortField === "is_active" && (
            <ArrowsUpDownIcon className="h-4 w-4 ml-1" />
          )}
        </button>
      ), 
      accessor: "status" 
    },
    { 
      header: (
        <button
          onClick={() => handleSort("created_at")}
          className="flex items-center hover:text-gray-900"
        >
          Created
          {sortField === "created_at" && (
            <ArrowsUpDownIcon className="h-4 w-4 ml-1" />
          )}
        </button>
      ), 
      accessor: "created_at" 
    },
    { header: "Actions", accessor: "actions", width: "200px" }
  ];

  // Prepare data for DataTable
  const productData = filteredProducts.map((product) => {
    const approvalBadge = getApprovalBadge(product.status);
    const ApprovalIcon = approvalBadge.icon;

    return {
      ...product,
      selection: (
        <input
          type="checkbox"
          checked={selectedProducts.includes(product.id)}
          onChange={() => toggleProductSelection(product.id)}
          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
        />
      ),
      image: (
        <div className="w-12 h-12 rounded overflow-hidden border border-gray-200">
          <img
            src={getProductImage(product.images)}
            alt={product.name_en}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = '/placeholder-product.jpg';
            }}
          />
        </div>
      ),
      name: (
        <div>
          <div className="font-medium text-gray-900">{product.name_en}</div>
          {product.name_mm && (
            <div className="text-sm text-gray-500">{product.name_mm}</div>
          )}
        </div>
      ),
      sku: (
        <span className="font-mono text-sm text-gray-600">
          {product.sku || "N/A"}
        </span>
      ),
      category: (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {product.category?.name_en || "Uncategorized"}
        </span>
      ),
      price: formatMMK(product.price),
      stock: (
        <div className="flex items-center">
          <span className={`font-medium ${product.quantity <= 0 ? 'text-red-600' : 'text-gray-900'}`}>
            {product.quantity || 0}
          </span>
          {product.quantity <= 0 && (
            <span className="ml-2 text-xs text-red-500">Out of stock</span>
          )}
        </div>
      ),
      min_order: (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          {product.min_order || product.moq || 1}
        </span>
      ),
      approvalStatus: (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${approvalBadge.bg} ${approvalBadge.text}`}>
          {ApprovalIcon && <ApprovalIcon className="h-3 w-3 mr-1" />}
          {approvalBadge.label}
          {product.approved_at && (
            <span className="ml-1 text-xs opacity-75">
              ({new Date(product.approved_at).toLocaleDateString()})
            </span>
          )}
        </span>
      ),
      status: (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          product.is_active 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {product.is_active ? (
            <>
              <CheckCircleIcon className="h-3 w-3 mr-1" />
              Active
            </>
          ) : (
            <>
              <XCircleIcon className="h-3 w-3 mr-1" />
              Inactive
            </>
          )}
        </span>
      ),
      created_at: new Date(product.created_at).toLocaleDateString(),
      actions: (
        <div className="flex space-x-2 items-center">
          <button
            className="inline-flex items-center p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded"
            onClick={() => navigate(`/products/${product.id}`)}
            title="View Product"
          >
            <EyeIcon className="h-4 w-4" />
          </button>
          <button
            className="inline-flex items-center p-1.5 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded"
            onClick={() => navigate(`/products/${product.id}/edit`)}
            title="Edit Product"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            className="inline-flex items-center p-1.5 text-red-600 hover:text-red-900 hover:bg-red-50 rounded"
            onClick={() => handleDelete(product.id)}
            title="Delete Product"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
          
          {/* Approval actions for pending products */}
          {product.status === 'pending' && (
            <>
              <button
                onClick={() => handleApprove(product.id)}
                className="inline-flex items-center p-1.5 text-green-600 hover:text-green-900 hover:bg-green-50 rounded"
                title="Approve"
              >
                <CheckCircleIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleReject(product.id)}
                className="inline-flex items-center p-1.5 text-red-600 hover:text-red-900 hover:bg-red-50 rounded"
                title="Reject"
              >
                <XCircleIcon className="h-4 w-4" />
              </button>
            </>
          )}

          {/* Active/Inactive toggle only for approved products */}
          {product.status === 'approved' && (
            <select
              value={product.is_active ? "active" : "inactive"}
              onChange={(e) => handleProductStatus(product.id, e.target.value === "active")}
              className="text-xs border border-gray-300 rounded px-2 py-1 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-green-500"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          )}
        </div>
      )
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage all products in your marketplace
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            onClick={() => navigate("/products/create")}
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Product
          </button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedProducts.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-sm font-medium text-green-800 mr-4">
                {selectedProducts.length} product(s) selected
              </span>
              <div className="flex items-center space-x-2">
                <select
                  value={bulkAction}
                  onChange={(e) => setBulkAction(e.target.value)}
                  className="block w-40 rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                >
                  <option value="">Choose action...</option>
                  <option value="activate">Activate Selected</option>
                  <option value="deactivate">Deactivate Selected</option>
                  <option value="approve">Approve Selected</option>
                  <option value="reject">Reject Selected</option>
                  <option value="delete">Delete Selected</option>
                </select>
                <button
                  onClick={handleBulkAction}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Apply
                </button>
                <button
                  onClick={() => setSelectedProducts([])}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Products
            </label>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, SKU..."
                className="block w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 sm:text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Approval Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Approval Status
            </label>
            <select
              value={approvalFilter}
              onChange={(e) => setApprovalFilter(e.target.value)}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 sm:text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Active/Inactive Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Active/Inactive
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 sm:text-sm"
            >
              <option value="all">All</option>
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
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 sm:text-sm"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name_en}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Filters */}
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setApprovalFilter("all");
                setCategoryFilter("all");
              }}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 w-full justify-center"
            >
              <FunnelIcon className="h-4 w-4 mr-2" />
              Reset Filters
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500">
          <span>Total: {products.length}</span>
          <span>•</span>
          <span>Showing: {filteredProducts.length}</span>
          <span>•</span>
          <span>Pending: {products.filter(p => p.status === 'pending').length}</span>
          <span>•</span>
          <span>Approved: {products.filter(p => p.status === 'approved').length}</span>
          <span>•</span>
          <span>Rejected: {products.filter(p => p.status === 'rejected').length}</span>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-lg shadow p-8 flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
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
              <h3 className="text-sm font-medium text-red-800">Error loading products</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={fetchProducts}
                  className="text-sm font-medium text-red-600 hover:text-red-500"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Products Table */}
      {!loading && !error && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {filteredProducts.length > 0 ? (
            <DataTable 
              columns={columns} 
              data={productData}
              striped={true}
              hoverable={true}
            />
          ) : (
            <div className="p-12 text-center">
              <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || statusFilter !== "all" || approvalFilter !== "all" || categoryFilter !== "all"
                  ? "No products found matching your criteria"
                  : "No products yet"
                }
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || statusFilter !== "all" || approvalFilter !== "all" || categoryFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Get started by adding your first product"
                }
              </p>
              {(!searchTerm && statusFilter === "all" && approvalFilter === "all" && categoryFilter === "all") && (
                <button
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  onClick={() => navigate("/products/create")}
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Your First Product
                </button>
              )}
            </div>
          )}

          {/* Table Footer */}
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing <span className="font-medium">{filteredProducts.length}</span> of{" "}
                <span className="font-medium">{products.length}</span> products
              </div>
              <div className="text-sm text-gray-500">
                {selectedProducts.length > 0 && (
                  <span className="text-green-600 font-medium">
                    {selectedProducts.length} selected
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;