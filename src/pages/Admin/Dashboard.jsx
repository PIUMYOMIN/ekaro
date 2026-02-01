import React, { useState, useEffect } from "react";
import { Tab } from "@headlessui/react";
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
  ChevronRightIcon,
  StarIcon,
  CheckIcon,
  XMarkIcon,
  TruckIcon,
  BuildingStorefrontIcon,
  UsersIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlusIcon,
  BriefcaseIcon,
  BuildingOfficeIcon,
  BanknotesIcon
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";
import Sidebar from "../../components/layout/Sidebar";
import PlatformLogistics from "../../components/admin/PlatformLogistics";
import BusinessTypeManagement from "../../components/admin/BusinessTypeManagement";
import UserManagement from "../../components/admin/UserManagement";
import SellersManagement from "../../components/admin/SellersManagement";
import DashboardOverview from "../../components/admin/DashboardOverview";
import ProductManagement from "../../components/admin/ProductManagement";
import ReviewManagement from "../../components/admin/ReviewManagement";
import OrderManagement from "../../components/admin/OrderManagement";
import AnalyticsManagement from "../../components/admin/AnalyticsManagement";
import CategoryManagement from "../../components/admin/CategoryManagement";
import SellerVerificationManagement from "../../components/admin/SellerVerificationManagement";
import Settings from "../../components/admin/Settings";


const AdminDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState({
    search: "",
    status: "",
    page: 1
  });
  const [activeTab, setActiveTab] = useState(0);

  // State for all data
  const [dashboardData, setDashboardData] = useState(null);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [sellersPagination, setSellersPagination] = useState(null);
  const [mainSearchTerm, setMainSearchTerm] = useState(""); // For main search
  const [sellerSearchTerm, setSellerSearchTerm] = useState("");
  const [sellerSearchPage, setSellerSearchPage] = useState(1); // For seller pagination
  const [pendingSellers, setPendingSellers] = useState([]);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [verificationData, setVerificationData] = useState({
    verification_level: "basic",
    verification_badge: "verified",
    notes: ""
  });

  const [isVerificationLoading, setIsVerificationLoading] = useState(false);
  const [verificationError, setVerificationError] = useState(null);
  const [verificationSearchTerm, setVerificationSearchTerm] = useState("");

  // ADD BUSINESS TYPES STATE
  const [businessTypes, setBusinessTypes] = useState([]);
  const [isBusinessTypesLoading, setIsBusinessTypesLoading] = useState(false);
  const [businessTypesError, setBusinessTypesError] = useState(null);

  // Loading states - ADD BUSINESS TYPES LOADING
  const [isDashboardLoading, setIsDashboardLoading] = useState(false);
  const [isUsersLoading, setIsUsersLoading] = useState(false);
  const [isProductsLoading, setIsProductsLoading] = useState(false);
  const [isReviewsLoading, setIsReviewsLoading] = useState(false);
  const [isOrdersLoading, setIsOrdersLoading] = useState(false);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isSellersLoading, setIsSellersLoading] = useState(false);

  // Error states
  const [dashboardError, setDashboardError] = useState(null);
  const [usersError, setUsersError] = useState(null);
  const [productsError, setProductsError] = useState(null);
  const [reviewsError, setReviewsError] = useState(null);
  const [ordersError, setOrdersError] = useState(null);
  const [categoriesError, setCategoriesError] = useState(null);
  const [sellersError, setSellersError] = useState(null);

  // Separate function for verification actions
  const handleSellerVerification = async (sellerId, action, data = {}) => {
    try {
      let endpoint = '';
      let method = 'POST';
      let requestData = {};

      if (action === 'approve') {
        endpoint = `/admin/seller/${sellerId}/verify`;
        method = 'POST';
        requestData = {
          verification_level: data.verification_level || 'verified',
          badge_type: data.badge_type || 'verified',
          notes: data.notes || `Approved by admin on ${new Date().toLocaleDateString()}`,
        };
      } else if (action === 'reject') {
        endpoint = `/admin/seller/${sellerId}/reject`;
        method = 'POST';
        requestData = {
          reason: data.reason || 'Rejected by administrator'
        };
      } else if (action === 'update_status') {
        endpoint = `/admin/seller/${sellerId}/verification-status`;
        method = 'PUT';
        requestData = {
          verification_status: data.status || 'pending',
          notes: data.notes || ''
        };
      }

      const response = await api({
        method,
        url: endpoint,
        data: requestData
      });

      if (response.data.success) {
        // Refresh all seller-related data
        await Promise.all([
          fetchPendingSellers(),
          fetchSellers()
        ]);

        return {
          success: true,
          data: response.data.data,
          message: response.data.message || `Seller ${action}ed successfully`
        };
      }
    } catch (error) {
      console.error(`Error in seller verification (${action}):`, error);
      const errorMessage = error.response?.data?.message || error.message || `Failed to ${action} seller`;
      throw new Error(errorMessage);
    }
  };

  //Refresh verification data
  const refreshVerificationData = async () => {
    try {
      setIsVerificationLoading(true);
      await fetchPendingSellers();

      // Also refresh sellers list to get updated status
      const response = await api.get("/admin/sellers");
      if (response.data.data && response.data.data.data) {
        setSellers(response.data.data.data);
      }
    } catch (error) {
      console.error('Error refreshing verification data:', error);
    } finally {
      setIsVerificationLoading(false);
    }
  };

  // Separate function for status management
  const handleSellerStatusUpdate = async (sellerId, status, reason = '') => {
    try {
      const response = await api.put(`/admin/seller/${sellerId}/status`, {
        status,
        reason
      });

      if (response.data.success) {
        alert(`Seller status updated to ${status} successfully`);
        // Update local state for SellerManagement
        setSellers(prevSellers =>
          prevSellers.map(seller =>
            seller.id === sellerId ? { ...seller, status } : seller
          )
        );
        return response.data;
      }
    } catch (error) {
      console.error('Error updating seller status:', error);
      throw error;
    }
  };

  // Fetch pending sellers
  const fetchPendingSellers = async () => {
    setIsVerificationLoading(true);
    setVerificationError(null);
    try {
      // Use the new verification review endpoint
      const response = await api.get('/admin/seller/verification-review');
      setPendingSellers(response.data);
    } catch (error) {
      setVerificationError(error);
      console.error('Error fetching sellers for verification:', error);
    } finally {
      setIsVerificationLoading(false);
    }
  };

  const handleVerificationSubmit = async () => {
    if (!selectedSeller) return;
    setIsVerificationLoading(true);
    setVerificationError(null);
    try {
      await api.post(`/admin/seller/${selectedSeller.id}/verify`, verificationData);
      alert("Seller verified successfully");
      setSelectedSeller(null);
      // Refresh pending sellers
      fetchPendingSellers();
    } catch (error) {
      setVerificationError(error);
      console.error("Error verifying seller:", error);
    } finally {
      setIsVerificationLoading(false);
    }
  };

  // Fetch verification data (alias for fetchPendingSellers)
  const fetchVerificationData = fetchPendingSellers;

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
  }, [navigate]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsDashboardLoading(true);
      setDashboardError(null);
      try {
        const response = await api.get("/admin");
        setDashboardData(response.data);
      } catch (error) {
        setDashboardError(error);
        console.error("Error fetching dashboard data:", error);
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
        const response = await api.get("/users");

        // Handle different API response structures
        const usersData = response.data.data || response.data;

        setUsers(Array.isArray(usersData) ? usersData : []);
      } catch (error) {
        setUsersError(error);
        console.error("Error fetching users:", error);
      } finally {
        setIsUsersLoading(false);
      }
    };

    fetchUsers();
  }, [activeTab, searchTerm]);

  //Fetch sellers for analytics
  useEffect(() => {
    if (activeTab !== 2) return;

    const fetchSellers = async () => {
      setIsSellersLoading(true);
      setSellersError(null);
      try {
        const params = {
          search: sellerSearchTerm || undefined,
          page: sellerSearchPage || 1
        };

        const response = await api.get("/admin/sellers", { params });

        // Handle response
        if (response.data.data && response.data.data.data) {
          setSellers(response.data.data.data);
          setSellersPagination({
            current_page: response.data.data.current_page,
            per_page: response.data.data.per_page,
            total: response.data.data.total,
            last_page: response.data.data.last_page,
            from: response.data.data.from,
            to: response.data.data.to
          });
        } else {
          setSellers(response.data.data || []);
          setSellersPagination(null);
        }
      } catch (error) {
        setSellersError(error);
        console.error("Error fetching sellers:", error);
      } finally {
        setIsSellersLoading(false);
      }
    };

    fetchSellers();
  }, [activeTab, sellerSearchTerm, sellerSearchPage]);

  useEffect(() => {
    if (activeTab !== 3) return;

    const fetchProducts = async () => {
      setIsProductsLoading(true);
      setProductsError(null);
      try {
        const response = await api.get("/products");

        const productsData = response.data.data || response.data;
        setProducts(Array.isArray(productsData) ? productsData : []);
      } catch (error) {
        setProductsError(error);
        console.error("Error fetching products:", error);
      } finally {
        setIsProductsLoading(false);
      }
    };

    fetchProducts();
  }, [activeTab]);

  // Add this function to your AdminDashboard component
  const fetchSellers = async () => {
    setIsSellersLoading(true);
    setSellersError(null);
    try {
      const params = {
        search: sellerSearchTerm || undefined,
        page: sellerSearchPage || 1
      };

      const response = await api.get("/admin/sellers", { params });

      if (response.data.data && response.data.data.data) {
        setSellers(response.data.data.data);
        setSellersPagination({
          current_page: response.data.data.current_page,
          per_page: response.data.data.per_page,
          total: response.data.data.total,
          last_page: response.data.data.last_page,
          from: response.data.data.from,
          to: response.data.data.to
        });
      } else {
        setSellers(response.data.data || []);
        setSellersPagination(null);
      }
    } catch (error) {
      setSellersError(error);
      console.error("Error fetching sellers:", error);
    } finally {
      setIsSellersLoading(false);
    }
  };

  // Fetch reviews when reviews tab is active
  useEffect(() => {
    if (activeTab !== 4) return;

    const fetchReviews = async () => {
      setIsReviewsLoading(true);
      setReviewsError(null);
      try {
        const response = await api.get("/reviews");

        const reviewsData = response.data.data || response.data;
        setReviews(Array.isArray(reviewsData) ? reviewsData : []);
      } catch (error) {
        setReviewsError(error);
        console.error("Error fetching reviews:", error);
      } finally {
        setIsReviewsLoading(false);
      }
    };

    fetchReviews();
  }, [activeTab]);

  // Fetch orders when orders tab is active
  useEffect(() => {
    if (activeTab !== 5) return;

    const fetchOrders = async () => {
      setIsOrdersLoading(true);
      setOrdersError(null);
      try {
        const response = await api.get("/orders");

        const ordersData = response.data.data || response.data;
        setOrders(Array.isArray(ordersData) ? ordersData : []);
      } catch (error) {
        setOrdersError(error);
        console.error("Error fetching orders:", error);
      } finally {
        setIsOrdersLoading(false);
      }
    };

    fetchOrders();
  }, [activeTab]);

  // Fetch categories when category tab is active
  useEffect(() => {
    if (activeTab !== 6) return;

    const fetchCategories = async () => {
      setIsCategoriesLoading(true);
      setCategoriesError(null);
      try {
        const response = await api.get("/categories");
        const categoriesData = response.data.data || response.data;
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      } catch (error) {
        setCategoriesError(error);
        console.error("Error fetching categories:", error);
      } finally {
        setIsCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, [activeTab]);


  // Refresh handler for all tabs
  const handleRefresh = async () => {
    switch (activeTab) {
      case 0:
        setIsDashboardLoading(true);
        try {
          const response = await api.get("/admin");
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
          const response = await api.get("/users");
          const usersData = response.data.data || response.data;
          setUsers(Array.isArray(usersData) ? usersData : []);
        } catch (error) {
          setUsersError(error);
        } finally {
          setIsUsersLoading(false);
        }
        break;
      case 2:
        try {
          const response = await api.get("/admin/seller", {
            params: sellerSearchTerm
          });
          // Handle response as in useEffect
          if (response.data.data && response.data.data.data) {
            setSellers(response.data.data.data);
            setSellersPagination({
              current_page: response.data.data.current_page,
              per_page: response.data.data.per_page,
              total: response.data.data.total,
              last_page: response.data.data.last_page,
              from: response.data.data.from,
              to: response.data.data.to
            });
          } else {
            setSellers(response.data.data || []);
            setSellersPagination(null);
          }
        } catch (error) {
          setSellersError(error);
        } finally {
          setIsSellersLoading(false);
        }
        break;
      case 3:
        setIsProductsLoading(true);
        try {
          const response = await api.get("/products");
          const productsData = response.data.data || response.data;
          setProducts(Array.isArray(productsData) ? productsData : []);
        } catch (error) {
          setProductsError(error);
        } finally {
          setIsProductsLoading(false);
        }
        break;
      case 4:
        setIsReviewsLoading(true);
        try {
          const response = await api.get("/admin/reviews");
          const reviewsData = response.data.data || response.data;
          setReviews(Array.isArray(reviewsData) ? reviewsData : []);
        } catch (error) {
          setReviewsError(error);
        } finally {
          setIsReviewsLoading(false);
        }
        break;
      case 5:
        setIsOrdersLoading(true);
        try {
          const response = await api.get("/orders");
          const ordersData = response.data.data || response.data;
          setOrders(Array.isArray(ordersData) ? ordersData : []);
        } catch (error) {
          setOrdersError(error);
        } finally {
          setIsOrdersLoading(false);
        }
        break;
      case 6:
        setIsCategoriesLoading(true);
        try {
          const response = await api.get("/categories");
          const categoriesData = response.data.data || response.data;
          setCategories(Array.isArray(categoriesData) ? categoriesData : []);
        } catch (error) {
          setCategoriesError(error);
        } finally {
          setIsCategoriesLoading(false);
        }
        break;
      case 7:
        fetchPendingSellers();
        break;
      case 8:
        // Business types tab
        refreshBusinessTypes();
        break;
      default:
        break;
    }
  };

  // Fetch business types when business types tab is active
  useEffect(() => {
    if (activeTab !== 8) return;

    const fetchBusinessTypes = async () => {
      setIsBusinessTypesLoading(true);
      setBusinessTypesError(null);
      try {
        const response = await api.get("/business-types");
        const businessTypesData = response.data.data || response.data;
        setBusinessTypes(Array.isArray(businessTypesData) ? businessTypesData : []);
      } catch (error) {
        setBusinessTypesError(error);
        console.error("Error fetching business types:", error);
      } finally {
        setIsBusinessTypesLoading(false);
      }
    };

    fetchBusinessTypes();
  }, [activeTab]);


  // Handlers for business types
  const handleCreateBusinessType = async (data) => {
    try {
      const response = await api.post("/admin/business-types", data);
      alert("Business type created successfully");
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const handleUpdateBusinessType = async (id, data) => {
    try {
      const response = await api.put(`/admin/business-types/${id}`, data);
      alert("Business type updated successfully");
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const handleDeleteBusinessType = async (id) => {
    try {
      await api.delete(`/admin/business-types/${id}`);
      alert("Business type deleted successfully");
    } catch (error) {
      throw error;
    }
  };

  // Refresh business types
  const refreshBusinessTypes = async () => {
    setIsBusinessTypesLoading(true);
    try {
      const response = await api.get("/business-types");
      const businessTypesData = response.data.data || response.data;
      setBusinessTypes(Array.isArray(businessTypesData) ? businessTypesData : []);
    } catch (error) {
      setBusinessTypesError(error);
    } finally {
      setIsBusinessTypesLoading(false);
    }
  };

  //Handle user status
  const handleUserStatus = async (userId, isActive) => {
    try {
      // Try the new endpoint first
      await api.put(`/users/${userId}`, { is_active: isActive });

      // Update local state
      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, is_active: isActive } : user
        )
      );

      alert(
        `User status updated to ${isActive ? "active" : "inactive"
        } successfully`
      );
    } catch (error) {
      console.error("Failed to update user status:", error);


      try {
        const role = isActive ? "buyer" : "suspended";
        await api.post(`/users/${userId}/assign-roles`, { roles: [role] });

        // Update local state
        setUsers(
          users.map((user) =>
            user.id === userId ? { ...user, is_active: isActive } : user
          )
        );

        alert(
          `User status updated to ${isActive ? "active" : "inactive"
          } successfully`
        );
      } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError);
        alert("Failed to update user status");
      }
    }
  };

  // Handle user deletion
  const handleDeleteUser = async (userId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    ) {
      try {
        await api.delete(`/users/${userId}`);
        setUsers(users.filter((user) => user.id !== userId));
        alert("User deleted successfully");
      } catch (error) {
        console.error("Failed to delete user:", error);
        alert(error.response?.data?.message || "Failed to delete user");
      }
    }
  };

  // Handle user role change
  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.post(`/users/${userId}/assign-roles`, { roles: [newRole] });
      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, roles: [{ name: newRole }] } : user
        )
      );
    } catch (error) {
      console.error("Failed to update user role:", error);
    }
  };

  // Handle product status change
  const handleProductStatus = async (productId, isActive) => {
    try {
      await api.put(`/products/${productId}`, { is_active: isActive });
      setProducts(
        products.map((product) =>
          product.id === productId
            ? { ...product, is_active: isActive }
            : product
        )
      );
    } catch (error) {
      console.error("Failed to update product status:", error);
    }
  };

  const handleSellerStatus = async (sellerId, status, reason = "") => {
    try {
      let data = { status };

      // Add reason if provided
      if (reason) {
        data.reason = reason;
      }

      // Use Post request to update seller status
      const response = await api.post(`/admin/seller/${sellerId}/approve`, data);
      // OR use the seller endpoint: `/sellers/${sellerId}`

      if (response.data.success) {
        // Update the local state
        setSellers(
          sellers.map((seller) =>
            seller.id === sellerId ? { ...seller, status } : seller
          )
        );

        // Show success message
        alert(`Seller status updated to ${status} successfully`);
      }
    } catch (error) {
      console.error("Failed to update seller status:", error);
      alert(error.response?.data?.message || "Failed to update seller status");
    }
  };

  // Handle search for sellers
  const handleSellerSearch = (value, type = "search") => {
    if (type === "status" && value === "") {

      setSellerSearchTerm((prev) => ({ ...prev, status: "", page: 1 }));
    } else {
      setSellerSearchTerm((prev) => ({ ...prev, [type]: value, page: 1 }));
    }
  };

  // Handle page change
  const handleSellerPageChange = (page) => {
    setSellerSearchTerm((prev) => ({ ...prev, page }));
  };

  // Handle review status update
  const handleReviewStatus = async (reviewId, status) => {
    try {
      let endpoint = "";
      let method = "POST";

      if (status === "approved") {
        endpoint = `/reviews/${reviewId}/approve`;
      } else if (status === "rejected") {
        endpoint = `/reviews/${reviewId}/reject`;
      } else {
        endpoint = `/reviews/${reviewId}/status`;
        method = "PUT";
      }

      const response = await api({
        method,
        url: endpoint,
        data: status !== "approved" && status !== "rejected" ? { status } : {}
      });

      if (response.data.success) {
        // Update the local state
        setReviews(
          reviews.map((review) =>
            review.id === reviewId ? { ...review, status } : review
          )
        );

        // Show success message
        alert(`Review ${status} successfully`);
      }
    } catch (error) {
      console.error("Failed to update review status:", error);
      alert(error.response?.data?.message || "Failed to update review status");
    }
  };

  // Handle order status update
  const updateOrderStatus = async (orderId, status) => {
    try {

      let endpoint = "";
      if (status === "confirmed") endpoint = "confirm";
      else if (status === "shipped") endpoint = "ship";
      else if (status === "cancelled") endpoint = "cancel";

      if (endpoint) {
        await api.post(`/orders/${orderId}/${endpoint}`);
      } else {

        await api.put(`/orders/${orderId}`, { status });
      }

      setOrders(
        orders.map((order) =>
          order.id === orderId ? { ...order, status } : order
        )
      );
    } catch (error) {
      console.error("Failed to update order status:", error);
    }
  };

  const navigation = [
    {
      name: t("dashboard"),
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
      name: t("users"),
      icon: UserGroupIcon,
      component: (
        <UserManagement
          users={users}
          loading={isUsersLoading}
          error={usersError}
          searchTerm={mainSearchTerm}
          onSearchChange={setMainSearchTerm}
          handleRoleChange={handleRoleChange}
          handleUserStatus={handleUserStatus}
          handleDeleteUser={handleDeleteUser}
        />
      )
    },
    {
      name: "Sellers",
      icon: UserGroupIcon,
      component: (
        <SellersManagement
          sellers={sellers}
          loading={isSellersLoading}
          error={sellersError}
          handleSellerStatus={handleSellerStatus} // This is passed as prop
          searchTerm={sellerSearchTerm}
          onSearchChange={setSellerSearchTerm}
          pagination={sellersPagination}
          onPageChange={setSellerSearchPage}
        />
      )
    },
    {
      name: "Seller Verification",
      icon: ShieldCheckIcon,
      component: (
        <SellerVerificationManagement
          pendingSellers={pendingSellers}
          loading={isVerificationLoading}
          error={verificationError}
          handleVerifySeller={handleSellerVerification}
          searchTerm={verificationSearchTerm}
          onSearchChange={setVerificationSearchTerm}
          refreshData={refreshVerificationData}
        />
      )
    },
    {
      name: t("seller.product.title"),
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
      name: t("reviews"),
      icon: StarIcon,
      component: (
        <ReviewManagement
          reviews={reviews}
          loading={isReviewsLoading}
          error={reviewsError}
          handleReviewStatus={handleReviewStatus}
        />
      )
    },
    {
      name: t("orders"),
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
      name: "Platform Logistics",
      icon: TruckIcon,
      component: <PlatformLogistics />
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
      name: "Business Types",
      icon: BriefcaseIcon,
      component: (
        <BusinessTypeManagement
          businessTypes={businessTypes}
          loading={isBusinessTypesLoading}
          error={businessTypesError}
          refreshData={refreshBusinessTypes}
          onCreate={handleCreateBusinessType}
          onUpdate={handleUpdateBusinessType}
          onDelete={handleDeleteBusinessType}
        />
      )
    },
    {
      name: t("analytics"),
      icon: CurrencyDollarIcon,
      component: <AnalyticsManagement products={products} />
    },
    {
      name: t("settings"),
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
            <span className="sr-only">{t("sidebar.open")}</span>
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
              onClick={(e) => e.stopPropagation()}
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
                  {t("app.name")}
                </span>
              </div>
              <nav className="mt-5 flex-1 px-2 space-y-1">
                <Tab.List className="space-y-1">
                  {navigation.map((item, idx) => (
                    <Tab
                      key={item.name}
                      className={({ selected }) =>
                        `group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full text-left ${selected
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
                    {t("admin.user")}
                  </p>
                  <p className="text-xs font-medium text-gray-500">
                    {t("admin.role")}
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
                  placeholder={t("search.placeholder")}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  value={mainSearchTerm}
                  onChange={(e) => setMainSearchTerm(e.target.value)}
                />
              </div>
              <button
                className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                onClick={handleRefresh}
              >
                <ArrowPathIcon className="h-4 w-4 mr-2" />
                {t("refresh")}
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="max-w-7xl mx-auto">
              {/* Mobile Tabs */}
              <div className="md:hidden mb-6">
                <Tab.List className="flex space-x-1 rounded-xl bg-green-100 p-1 overflow-x-auto">
                  {navigation.map((item) => (
                    <Tab
                      key={item.name}
                      className={({ selected }) =>
                        `w-full rounded-lg py-2.5 text-sm font-medium leading-5 focus:outline-none focus:ring-2 ring-offset-2 ring-offset-green-400 ring-white ring-opacity-60 ${selected
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
                  <Tab.Panel key={idx}>{item.component}</Tab.Panel>
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
