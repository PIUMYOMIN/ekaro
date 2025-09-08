import React, { useState, useEffect } from 'react';
import { Tab } from '@headlessui/react';
import {
  ChartBarIcon,
  UserGroupIcon,
  ShoppingBagIcon,
  CubeIcon,
  CurrencyDollarIcon,
  CogIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import Sidebar from '../../components/layout/Sidebar';

// StatCard Component
const StatCard = ({ title, value, change, icon: Icon, iconColor, bgColor }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <div className="flex items-center">
        <div className={`p-3 ${bgColor} rounded-lg`}>
          <Icon className={`h-8 w-8 ${iconColor}`} />
        </div>
        <div className="ml-4">
          <p className="text-gray-500">{title}</p>
          <h3 className="text-2xl font-bold">{value}</h3>
        </div>
      </div>
      <div className="mt-4 flex items-center text-sm">
        {change > 0 ? (
          <span className="text-green-600 flex items-center">
            <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
            +{change}%
          </span>
        ) : (
          <span className="text-red-600 flex items-center">
            <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
            {change}%
          </span>
        )}
        <span className="ml-2 text-gray-500">from last month</span>
      </div>
    </div>
  );
};

// DataTable Component
const DataTable = ({ 
  columns, 
  data, 
  searchTerm = '', 
  onSearchChange = () => {},
  className = '' 
}) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const processedData = React.useMemo(() => {
    let filteredData = data;
    
    if (searchTerm) {
      filteredData = data.filter(item => 
        columns.some(column => {
          const value = item[column.accessor];
          return value && 
            value.toString().toLowerCase().includes(searchTerm.toLowerCase());
        })
      );
    }
    
    if (sortConfig.key) {
      filteredData = [...filteredData].sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return filteredData;
  }, [data, sortConfig, searchTerm, columns]);

  const totalPages = Math.ceil(processedData.length / itemsPerPage);
  const paginatedData = processedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className={`overflow-x-auto ${className}`}>
      {onSearchChange && (
        <div className="mb-4">
          <div className="relative max-w-xs">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="block w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>
      )}

      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.accessor}
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort(column.accessor)}
              >
                <div className="flex items-center">
                  {column.header}
                  {sortConfig.key === column.accessor && (
                    <span className="ml-1">
                      {sortConfig.direction === 'asc' ? (
                        <ChevronUpIcon className="h-4 w-4" />
                      ) : (
                        <ChevronDownIcon className="h-4 w-4" />
                      )}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {paginatedData.length > 0 ? (
            paginatedData.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((column) => {
                  const cellValue = row[column.accessor];
                  return (
                    <td
                      key={`${rowIndex}-${column.accessor}`}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                    >
                      {column.isImage ? (
                        <img 
                          src={cellValue || '/placeholder-image.jpg'} 
                          alt="" 
                          className="h-10 w-10 rounded-md object-cover"
                        />
                      ) : column.isCurrency ? (
                        new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD'
                        }).format(cellValue || 0)
                      ) : (
                        cellValue
                      )}
                    </td>
                  );
                })}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="px-6 py-4 text-center text-sm text-gray-500">
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
            <span className="font-medium">
              {Math.min(currentPage * itemsPerPage, processedData.length)}
            </span>{' '}
            of <span className="font-medium">{processedData.length}</span> results
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-md border border-gray-300 text-sm font-medium disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded-md border border-gray-300 text-sm font-medium disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// DashboardOverview Component
const DashboardOverview = ({ data, loading, error }) => {
  if (loading) return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div></div>;
  if (error) return <div className="p-4 text-red-500">Error loading dashboard data</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Users" 
          value={data?.user_count || 0} 
          change={5} 
          icon={UserGroupIcon}
          iconColor="text-green-600"
          bgColor="bg-green-100"
        />
        <StatCard 
          title="Total Products" 
          value={data?.product_count || 0} 
          change={12} 
          icon={CubeIcon}
          iconColor="text-blue-600"
          bgColor="bg-blue-100"
        />
        <StatCard 
          title="Total Orders" 
          value={data?.order_count || 0} 
          change={8} 
          icon={ShoppingBagIcon}
          iconColor="text-purple-600"
          bgColor="bg-purple-100"
        />
        <StatCard 
          title="Total Revenue" 
          value={data?.total_revenue?.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0
          }) || '$0'} 
          change={15} 
          icon={CurrencyDollarIcon}
          iconColor="text-yellow-600"
          bgColor="bg-yellow-100"
        />
      </div>
    </div>
  );
};

// UserManagement Component
const UserManagement = ({ users, loading, error, searchTerm, onSearchChange, handleRoleChange }) => {
  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Name', accessor: 'name' },
    { header: 'Email', accessor: 'email' },
    { header: 'Role', accessor: 'role' },
    { header: 'Status', accessor: 'status' },
    { header: 'Created At', accessor: 'created_at' },
    { header: 'Actions', accessor: 'actions' }
  ];

  const userData = users.map(user => ({
    ...user,
    role: user.roles?.[0]?.name || 'buyer',
    status: user.is_active ? 'Active' : 'Inactive',
    created_at: new Date(user.created_at).toLocaleDateString(),
    actions: (
      <div className="flex space-x-2">
        <select 
          value={user.roles?.[0]?.name || 'buyer'} 
          onChange={(e) => handleRoleChange(user.id, e.target.value)}
          className="text-sm border rounded p-1"
        >
          <option value="admin">Admin</option>
          <option value="seller">Seller</option>
          <option value="buyer">Buyer</option>
        </select>
        <button className="text-red-600 hover:text-red-900">Delete</button>
      </div>
    )
  }));

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-gray-900">User Management</h3>
          <p className="mt-1 text-sm text-gray-500">Manage all registered users</p>
        </div>
      </div>
      
      {loading && <div className="p-8 flex justify-center">Loading...</div>}
      {error && <div className="p-4 text-red-500">Error loading users</div>}
      
      {!loading && !error && (
        <DataTable 
          columns={columns} 
          data={userData} 
          searchTerm={searchTerm}
          onSearchChange={onSearchChange}
        />
      )}
    </div>
  );
};

// ProductManagement Component
const ProductManagement = ({ products, loading, error, navigate, handleProductStatus }) => {
  const columns = [
    { header: 'Image', accessor: 'image', isImage: true },
    { header: 'Name', accessor: 'name' },
    { header: 'Myanmar Name', accessor: 'name_mm' },
    { header: 'Category', accessor: 'category' },
    { header: 'Price', accessor: 'price', isCurrency: true },
    { header: 'Stock', accessor: 'stock' },
    { header: 'Min Order', accessor: 'min_order' },
    { header: 'Status', accessor: 'status' },
    { header: 'Created At', accessor: 'created_at' },
    { header: 'Actions', accessor: 'actions' }
  ];

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/products/${productId}`);
        // You might want to add a callback to refresh the product list
        alert('Product deleted successfully');
      } catch (error) {
        alert('Failed to delete product');
      }
    }
  };

  const productData = products.map(product => ({
    ...product,
    image: product.images?.[0]?.url || '/placeholder-product.jpg',
    category: product.category?.name || 'Uncategorized',
    price: product.price || 0,
    stock: product.quantity || 0,
    min_order: product.min_order || 1,
    status: product.is_active ? 'Active' : 'Inactive',
    created_at: new Date(product.created_at).toLocaleDateString(),
    actions: (
      <div className="flex space-x-2">
        <button 
          className="text-indigo-600 hover:text-indigo-900"
          onClick={() => navigate(`/products/${product.id}/edit`)}
        >
          Edit
        </button>
        <select 
          value={product.is_active ? 'active' : 'inactive'} 
          onChange={(e) => handleProductStatus(product.id, e.target.value === 'active')}
          className="text-sm border rounded p-1"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <button 
          className="text-red-600 hover:text-red-900"
          onClick={() => handleDelete(product.id)}
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
          <h3 className="text-lg font-medium text-gray-900">Product Management</h3>
          <p className="mt-1 text-sm text-gray-500">Manage all products</p>
        </div>
        <div className="flex space-x-3">
          <button 
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            onClick={() => navigate('/products/new')}
          >
            Add New Product
          </button>
        </div>
      </div>
      
      {loading && <div className="p-8 flex justify-center">Loading...</div>}
      {error && <div className="p-4 text-red-500">Error loading products</div>}
      
      {!loading && !error && (
        <DataTable 
          columns={columns} 
          data={productData} 
        />
      )}
    </div>
  );
};

// OrderManagement Component
const OrderManagement = ({ orders, loading, error, updateOrderStatus }) => {
  const columns = [
    { header: 'Order #', accessor: 'id' },
    { header: 'Date', accessor: 'date' },
    { header: 'Customer', accessor: 'customer' },
    { header: 'Amount', accessor: 'amount', isCurrency: true },
    { header: 'Status', accessor: 'status' },
    { header: 'Actions', accessor: 'actions' }
  ];

  const orderData = orders.map(order => ({
    ...order,
    date: new Date(order.created_at).toLocaleDateString(),
    customer: order.user?.name || order.customer_name || 'Unknown',
    amount: order.total_amount || order.total || 0,
    status: order.status || 'pending',
    actions: (
      <div className="flex space-x-2">
        <select 
          value={order.status || 'pending'} 
          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
          className="text-sm border rounded p-1"
        >
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <button className="text-indigo-600 hover:text-indigo-900">
          View Details
        </button>
      </div>
    )
  }));

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Order Management</h3>
          <p className="mt-1 text-sm text-gray-500">Track and manage all orders</p>
        </div>
      </div>
      
      {loading && <div className="p-8 flex justify-center">Loading...</div>}
      {error && <div className="p-4 text-red-500">Error loading orders</div>}
      
      {!loading && !error && (
        <DataTable 
          columns={columns} 
          data={orderData} 
        />
      )}
    </div>
  );
};

// Analytics Component
const Analytics = ({ products }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-6">Sales Analytics</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-50 p-6 rounded-xl">
          <h4 className="text-md font-medium text-gray-700 mb-4">Revenue Overview</h4>
          <div className="bg-white p-4 rounded-lg h-64 flex items-center justify-center">
            <div className="text-gray-500">Revenue chart visualization</div>
          </div>
        </div>
        
        <div className="bg-gray-50 p-6 rounded-xl">
          <h4 className="text-md font-medium text-gray-700 mb-4">Top Selling Products</h4>
          <div className="space-y-4">
            {products.slice(0, 5).map((product, index) => (
              <div key={product.id} className="flex items-center">
                <div className="text-gray-500 font-medium mr-4">{index + 1}</div>
                <div className="flex-shrink-0 h-10 w-10">
                  <img 
                    className="h-10 w-10 rounded-md object-cover" 
                    src={product.images?.[0]?.url || product.image || '/placeholder-product.jpg'} 
                    alt={product.name} 
                  />
                </div>
                <div className="ml-3">
                  <div className="text-sm font-medium text-gray-900">{product.name}</div>
                  <div className="text-sm text-gray-500">
                    Sold: {product.sold_count || 0}
                  </div>
                </div>
                <div className="ml-auto text-sm font-medium">
                  {product.price.toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    minimumFractionDigits: 0
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Settings Component
const Settings = () => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-6">System Settings</h3>
      <div className="space-y-6">
        <div className="bg-gray-50 p-6 rounded-xl">
          <h4 className="text-md font-medium text-gray-700 mb-4">General Settings</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">Maintenance Mode</label>
              <button className="bg-gray-200 relative inline-flex h-6 w-11 items-center rounded-full">
                <span className="sr-only">Enable maintenance mode</span>
                <span className="translate-x-1 inline-block h-4 w-4 transform rounded-full bg-white"></span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// CategoryManagement Component
const CategoryManagement = ({ categories, loading, error, navigate }) => {
  const [expandedCategories, setExpandedCategories] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const handleDelete = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await api.delete(`/categories/${categoryId}`);
        // You might want to add a callback to refresh the category list
        alert('Category deleted successfully');
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to delete category');
      }
    }
  };

  // Flatten the category tree for display with proper indentation
  const flattenCategories = (categories, level = 0) => {
    let result = [];
    
    categories.forEach(category => {
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
  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.name_mm?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const flattenedCategories = flattenCategories(filteredCategories);

  const columns = [
    { header: 'Name', accessor: 'name' },
    { header: 'Myanmar Name', accessor: 'name_mm' },
    { header: 'Description', accessor: 'description' },
    { header: 'Commission', accessor: 'commission_rate' },
    { header: 'Level', accessor: 'level' },
    { header: 'Actions', accessor: 'actions' }
  ];

  const categoryData = flattenedCategories.map(category => ({
    ...category,
    commission_rate: `${category.commission_rate}%`,
    name: (
      <div className="flex items-center" style={{ paddingLeft: `${category.level * 24}px` }}>
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
          <h3 className="text-lg font-medium text-gray-900">Category Management</h3>
          <p className="mt-1 text-sm text-gray-500">Manage product categories and hierarchy</p>
        </div>
        <div className="flex space-x-3">
          <button
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            onClick={() => navigate('/categories/create')}
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
                  <tr key={index} className={category.level > 0 ? "bg-gray-50" : ""}>
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
                  <td colSpan={columns.length} className="px-6 py-4 text-center text-sm text-gray-500">
                    {searchTerm ? 'No categories found matching your search' : 'No categories available'}
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

const AdminDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  
  // State for all data
  const [dashboardData, setDashboardData] = useState(null);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // Loading states
  const [isDashboardLoading, setIsDashboardLoading] = useState(false);
  const [isUsersLoading, setIsUsersLoading] = useState(false);
  const [isProductsLoading, setIsProductsLoading] = useState(false);
  const [isOrdersLoading, setIsOrdersLoading] = useState(false);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(false);
  
  // Error states
  const [dashboardError, setDashboardError] = useState(null);
  const [usersError, setUsersError] = useState(null);
  const [productsError, setProductsError] = useState(null);
  const [ordersError, setOrdersError] = useState(null);
  const [categoriesError, setCategoriesError] = useState(null);

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
  }, [navigate]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsDashboardLoading(true);
      setDashboardError(null);
      try {
        const response = await api.get('/dashboard');
        setDashboardData(response.data);
      } catch (error) {
        setDashboardError(error);
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsDashboardLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  // Fetch users when users tab is active
  useEffect(() => {
    if (activeTab !== 1) return;
    
    const fetchUsers = async () => {
      setIsUsersLoading(true);
      setUsersError(null);
      try {
        const response = await api.get('/users');
        // Handle different API response structures
        const usersData = response.data.data || response.data;
        setUsers(Array.isArray(usersData) ? usersData : []);
      } catch (error) {
        setUsersError(error);
        console.error('Error fetching users:', error);
      } finally {
        setIsUsersLoading(false);
      }
    };
    
    fetchUsers();
  }, [activeTab, searchTerm]);

  // Fetch products when products tab is active
  useEffect(() => {
    if (activeTab !== 2) return;
    
    const fetchProducts = async () => {
      setIsProductsLoading(true);
      setProductsError(null);
      try {
        const response = await api.get('/products');
        // Handle different API response structures
        const productsData = response.data.data || response.data;
        setProducts(Array.isArray(productsData) ? productsData : []);
      } catch (error) {
        setProductsError(error);
        console.error('Error fetching products:', error);
      } finally {
        setIsProductsLoading(false);
      }
    };
    
    fetchProducts();
  }, [activeTab]);

  // Fetch orders when orders tab is active
  useEffect(() => {
    if (activeTab !== 3) return;
    
    const fetchOrders = async () => {
      setIsOrdersLoading(true);
      setOrdersError(null);
      try {
        const response = await api.get('/orders');
        // Handle different API response structures
        const ordersData = response.data.data || response.data;
        setOrders(Array.isArray(ordersData) ? ordersData : []);
      } catch (error) {
        setOrdersError(error);
        console.error('Error fetching orders:', error);
      } finally {
        setIsOrdersLoading(false);
      }
    };
    
    fetchOrders();
  }, [activeTab]);

  // Fetch categories when category tab is active
  useEffect(() => {
    if (activeTab !== 4) return;
    const fetchCategories = async () => {
      setIsCategoriesLoading(true);
      setCategoriesError(null);
      try {
        const response = await api.get('/categories');
        const categoriesData = response.data.data || response.data;
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      } catch (error) {
        setCategoriesError(error);
        console.error('Error fetching categories:', error);
      } finally {
        setIsCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, [activeTab]);

  const handleRefresh = async () => {
    switch (activeTab) {
      case 0:
        setIsDashboardLoading(true);
        try {
          const response = await api.get('/dashboard');
          setDashboardData(response.data);
        } catch (error) {
          setDashboardError(error);
        } finally {
          setIsDashboardLoading(false);
        }
        break;
      case 1:
        setIsUsersLoading(true);
        try {
          const response = await api.get('/users');
          const usersData = response.data.data || response.data;
          setUsers(Array.isArray(usersData) ? usersData : []);
        } catch (error) {
          setUsersError(error);
        } finally {
          setIsUsersLoading(false);
        }
        break;
      case 2:
        setIsProductsLoading(true);
        try {
          const response = await api.get('/products');
          const productsData = response.data.data || response.data;
          setProducts(Array.isArray(productsData) ? productsData : []);
        } catch (error) {
          setProductsError(error);
        } finally {
          setIsProductsLoading(false);
        }
        break;
      case 3:
        setIsOrdersLoading(true);
        try {
          const response = await api.get('/orders');
          const ordersData = response.data.data || response.data;
          setOrders(Array.isArray(ordersData) ? ordersData : []);
        } catch (error) {
          setOrdersError(error);
        } finally {
          setIsOrdersLoading(false);
        }
        break;
      case 4:
        setIsCategoriesLoading(true);
        try {
          const response = await api.get('/categories');
          const categoriesData = response.data.data || response.data;
          setCategories(Array.isArray(categoriesData) ? categoriesData : []);
        } catch (error) {
          setCategoriesError(error);
        } finally {
          setIsCategoriesLoading(false);
        }
        break;
      default:
        break;
    }
  };

  // Handle user role change
  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.post(`/users/${userId}/assign-roles`, { roles: [newRole] });
      setUsers(users.map(user => 
        user.id === userId ? { ...user, roles: [{ name: newRole }] } : user
      ));
    } catch (error) {
      console.error('Failed to update user role:', error);
    }
  };

  // Handle product status change
  const handleProductStatus = async (productId, isActive) => {
    try {
      await api.put(`/products/${productId}`, { is_active: isActive });
      setProducts(products.map(product => 
        product.id === productId ? { ...product, is_active: isActive } : product
      ));
    } catch (error) {
      console.error('Failed to update product status:', error);
    }
  };

  // Handle order status update
  const updateOrderStatus = async (orderId, status) => {
    try {
      // Use appropriate endpoint based on status
      let endpoint = '';
      if (status === 'confirmed') endpoint = 'confirm';
      else if (status === 'shipped') endpoint = 'ship';
      else if (status === 'cancelled') endpoint = 'cancel';
      
      if (endpoint) {
        await api.post(`/orders/${orderId}/${endpoint}`);
      } else {
        // For other status updates, use a generic update
        await api.put(`/orders/${orderId}`, { status });
      }
      
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status } : order
      ));
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

  const navigation = [
    {
      name: t('dashboard.title'),
      icon: ChartBarIcon,
      component: (
        <DashboardOverview 
          data={dashboardData} 
          loading={isDashboardLoading}
          error={dashboardError}
        />
      )
    },
    {
      name: t('users.title'),
      icon: UserGroupIcon,
      component: (
        <UserManagement 
          users={users}
          loading={isUsersLoading}
          error={usersError}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          handleRoleChange={handleRoleChange}
        />
      )
    },
    {
      name: t('products.title'),
      icon: CubeIcon,
      component: (
        <ProductManagement 
          products={products}
          loading={isProductsLoading}
          error={productsError}
          navigate={navigate}
          handleProductStatus={handleProductStatus}
        />
      )
    },
    {
      name: t('orders.title'),
      icon: ShoppingBagIcon,
      component: (
        <OrderManagement 
          orders={orders}
          loading={isOrdersLoading}
          error={ordersError}
          updateOrderStatus={updateOrderStatus}
        />
      )
    },
    {
      name: "Categories",
      icon: CubeIcon,
      component: (
        <CategoryManagement
          categories={categories}
          loading={isCategoriesLoading}
          error={categoriesError}
          navigate={navigate}
        />
      )
    },
    {
      name: t('analytics.title'),
      icon: CurrencyDollarIcon,
      component: <Analytics products={products} />
    },
    {
      name: t('settings.title'),
      icon: CogIcon,
      component: <Settings />
    }
  ];

  return (
    <Tab.Group selectedIndex={activeTab} onChange={setActiveTab}>
      <div className="flex h-screen bg-gray-50">
        {/* Mobile sidebar toggle */}
        <div className="md:hidden fixed top-4 left-4 z-10">
          <button
            type="button"
            className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <span className="sr-only">{t('sidebar.open')}</span>
            <svg
              className="h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="md:hidden fixed inset-0 z-20 bg-black bg-opacity-50"
            onClick={() => setSidebarOpen(false)}
          >
            <div
              className="fixed inset-y-0 left-0 max-w-xs w-full bg-white shadow-lg"
              onClick={e => e.stopPropagation()}
            >
              <Sidebar navigation={navigation} />
            </div>
          </div>
        )}

        {/* Desktop sidebar */}
        <div className="hidden md:flex md:flex-shrink-0">
          <div className="flex flex-col w-64 border-r border-gray-200 bg-white">
            <div className="h-0 flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10" />
                <span className="ml-2 text-lg font-bold text-green-600">
                  {t('app.name')}
                </span>
              </div>
              <nav className="mt-5 flex-1 px-2 space-y-1">
                <Tab.List className="space-y-1">
                  {navigation.map((item, idx) => (
                    <Tab
                      key={item.name}
                      className={({ selected }) =>
                        `group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full text-left ${
                          selected
                            ? "bg-green-50 text-green-700"
                            : "text-gray-600 hover:text-green-700 hover:bg-green-50"
                        }`
                      }
                    >
                      <item.icon className="mr-3 h-6 w-6" aria-hidden="true" />
                      {item.name}
                    </Tab>
                  ))}
                </Tab.List>
              </nav>
            </div>
            <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
              <div className="flex items-center">
                <div className="bg-gray-200 border-2 border-dashed rounded-full w-9 h-9" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">
                    {t('admin.user')}
                  </p>
                  <p className="text-xs font-medium text-gray-500">
                    {t('admin.role')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top search bar */}
          <div className="bg-white shadow-sm">
            <div className="px-4 py-4 sm:px-6 flex justify-between items-center">
              <div className="relative w-full max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder={t('search.placeholder')}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button 
                className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                onClick={handleRefresh}
              >
                <ArrowPathIcon className="h-4 w-4 mr-2" />
                {t('actions.refresh')}
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="max-w-7xl mx-auto">
              {/* Mobile Tabs */}
              <div className="md:hidden mb-6">
                <Tab.List className="flex space-x-1 rounded-xl bg-green-100 p-1 overflow-x-auto">
                  {navigation.map(item => (
                    <Tab
                      key={item.name}
                      className={({ selected }) =>
                        `w-full rounded-lg py-2.5 text-sm font-medium leading-5 focus:outline-none focus:ring-2 ring-offset-2 ring-offset-green-400 ring-white ring-opacity-60 ${
                          selected
                            ? "bg-white shadow text-green-700"
                            : "text-gray-600 hover:bg-white/[0.12] hover:text-green-700"
                        }`
                      }
                    >
                      <div className="flex items-center justify-center">
                        <item.icon className="h-5 w-5 mr-2" />
                        <span>{item.name}</span>
                      </div>
                    </Tab>
                  ))}
                </Tab.List>
              </div>

              {/* Tab Content */}
              <Tab.Panels className="mt-4">
                {navigation.map((item, idx) => (
                  <Tab.Panel key={idx}>
                    {item.component}
                  </Tab.Panel>
                ))}
              </Tab.Panels>
            </div>
          </div>
        </div>
      </div>
    </Tab.Group>
  );
};

export default AdminDashboard;