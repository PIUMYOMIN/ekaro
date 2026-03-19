// components/admin/UserManagement.js
import React, { useState, useEffect } from "react";
import { MagnifyingGlassIcon, FunnelIcon } from "@heroicons/react/24/outline";
import api from "../../utils/api";
import DataTable from "../ui/DataTable";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [bulkAction, setBulkAction] = useState("");

  // Fetch users from API
  const fetchUsers = async (page = currentPage, search = searchTerm, role = roleFilter, status = statusFilter) => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        per_page: 15,
        search: search || undefined,
        ...(role !== "all" && { role }),
        ...(status !== "all" && { status: status === "active" ? 1 : 0 }),
      };
      const response = await api.get("/users", { params });
      // Assuming response structure: { data: { data: [], current_page, last_page, total } }
      const data = response.data.data || response.data;
      setUsers(Array.isArray(data.data) ? data.data : data);
      setPagination({
        current_page: data.current_page,
        last_page: data.last_page,
        total: data.total,
        from: data.from,
        to: data.to,
      });
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setError(err.response?.data?.message || "Failed to load users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchUsers(1, searchTerm, roleFilter, statusFilter);
  }, []);

  // Re‑fetch when filters change
  useEffect(() => {
    fetchUsers(currentPage, searchTerm, roleFilter, statusFilter);
  }, [searchTerm, roleFilter, statusFilter, currentPage]);

  // Handle user role change
  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.post(`/users/${userId}/assign-roles`, { roles: [newRole] });
      setUsers(users.map(user =>
        user.id === userId ? { ...user, roles: [{ name: newRole }] } : user
      ));
    } catch (error) {
      console.error("Failed to update user role:", error);
      alert(error.response?.data?.message || "Failed to update role");
    }
  };

  // Handle user status change (active/inactive)
  const handleUserStatus = async (userId, isActive) => {
    try {
      await api.put(`/users/${userId}`, { is_active: isActive });
      setUsers(users.map(user =>
        user.id === userId ? { ...user, is_active: isActive } : user
      ));
    } catch (error) {
      console.error("Failed to update user status:", error);
      // Fallback attempt via role assignment
      try {
        const role = isActive ? "buyer" : "suspended";
        await api.post(`/users/${userId}/assign-roles`, { roles: [role] });
        setUsers(users.map(user =>
          user.id === userId ? { ...user, is_active: isActive } : user
        ));
      } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError);
        alert("Failed to update user status");
      }
    }
  };

  // Handle user deletion
  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    try {
      await api.delete(`/users/${userId}`);
      setUsers(users.filter(user => user.id !== userId));
    } catch (error) {
      console.error("Failed to delete user:", error);
      alert(error.response?.data?.message || "Failed to delete user");
    }
  };

  // Bulk action handler
  const handleBulkAction = async () => {
    if (selectedUsers.length === 0) {
      alert("Please select users first");
      return;
    }
    if (!bulkAction) {
      alert("Please select an action");
      return;
    }
    if (!window.confirm(`Are you sure you want to ${bulkAction} ${selectedUsers.length} user(s)?`)) return;

    try {
      const promises = selectedUsers.map(userId => {
        if (bulkAction === "delete") {
          return api.delete(`/users/${userId}`);
        } else if (bulkAction === "activate") {
          return api.put(`/users/${userId}`, { is_active: true });
        } else if (bulkAction === "deactivate") {
          return api.put(`/users/${userId}`, { is_active: false });
        }
        // Could add role bulk changes here
      });
      await Promise.all(promises);
      alert(`Successfully performed ${bulkAction} on ${selectedUsers.length} user(s)`);
      fetchUsers(currentPage, searchTerm, roleFilter, statusFilter); // refresh
      setSelectedUsers([]);
      setBulkAction("");
    } catch (error) {
      alert(error.response?.data?.message || `Failed to perform ${bulkAction}`);
    }
  };

  // Toggle selection
  const toggleSelection = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const toggleAllSelection = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(u => u.id));
    }
  };

  // Columns definition for DataTable
  const columns = [
    {
      header: (
        <input
          type="checkbox"
          checked={selectedUsers.length === users.length && users.length > 0}
          onChange={toggleAllSelection}
          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
        />
      ),
      accessor: "selection",
      width: "50px",
    },
    { header: "ID", accessor: "id" },
    { header: "Name", accessor: "name" },
    { header: "Email", accessor: "email" },
    { header: "Phone", accessor: "phone" },
    {
      header: "Role",
      accessor: "role",
      cell: (row) => (
        <select
          value={row.role}
          onChange={(e) => handleRoleChange(row.id, e.target.value)}
          className="text-sm border rounded p-1 focus:ring-2 focus:ring-green-500"
        >
          <option value="admin">Admin</option>
          <option value="seller">Seller</option>
          <option value="buyer">Buyer</option>
        </select>
      )
    },
    {
      header: "Status",
      accessor: "status",
      cell: (row) => (
        <select
          value={row.is_active ? "active" : "inactive"}
          onChange={(e) => handleUserStatus(row.id, e.target.value === "active")}
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            row.is_active
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          } border-0 focus:ring-2 focus:ring-green-500`}
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      )
    },
    { header: "Created At", accessor: "created_at" },
    {
      header: "Actions",
      accessor: "actions",
      cell: (row) => (
        <button
          className="text-red-600 hover:text-red-900"
          onClick={() => handleDeleteUser(row.id)}
          title="Delete User"
        >
          Delete
        </button>
      )
    }
  ];

  // Transform user data for display
  const userData = users.map(user => {
    let userRole = "buyer";
    if (user.roles && Array.isArray(user.roles)) {
      userRole = user.roles[0]?.name || "buyer";
    } else if (user.roles && typeof user.roles === 'string') {
      userRole = user.roles;
    } else if (user.role) {
      userRole = user.role;
    } else if (user.type) {
      userRole = user.type;
    }

    return {
      ...user,
      selection: (
        <input
          type="checkbox"
          checked={selectedUsers.includes(user.id)}
          onChange={() => toggleSelection(user.id)}
          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
        />
      ),
      role: userRole,
      status: user.is_active ? "Active" : "Inactive",
      created_at: new Date(user.created_at).toLocaleDateString(),
      is_active: user.is_active !== undefined ? user.is_active : true,
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="mt-1 text-sm text-gray-600">Manage all registered users</p>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-sm font-medium text-green-800 mr-4">
                {selectedUsers.length} user(s) selected
              </span>
              <div className="flex items-center space-x-2">
                <select
                  value={bulkAction}
                  onChange={(e) => setBulkAction(e.target.value)}
                  className="block w-40 rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                >
                  <option value="">Choose action...</option>
                  <option value="activate">Activate</option>
                  <option value="deactivate">Deactivate</option>
                  <option value="delete">Delete</option>
                </select>
                <button
                  onClick={handleBulkAction}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Apply
                </button>
                <button
                  onClick={() => setSelectedUsers([])}
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search Users</label>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Name, email, or phone..."
                className="block w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 sm:text-sm"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>

          {/* Role Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 sm:text-sm"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="seller">Seller</option>
              <option value="buyer">Buyer</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 sm:text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Reset Filters */}
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm("");
                setRoleFilter("all");
                setStatusFilter("all");
                setCurrentPage(1);
              }}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <FunnelIcon className="h-4 w-4 mr-2" />
              Reset Filters
            </button>
          </div>
        </div>

        {/* Stats */}
        {pagination && (
          <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500">
            <span>Total: {pagination.total}</span>
            <span>•</span>
            <span>Showing {pagination.from}–{pagination.to}</span>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-lg shadow p-8 flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mb-4"></div>
          <p className="text-gray-600">Loading users...</p>
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
              <h3 className="text-sm font-medium text-red-800">Error loading users</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => fetchUsers(currentPage, searchTerm, roleFilter, statusFilter)}
                  className="text-sm font-medium text-red-600 hover:text-red-500"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users Table */}
      {!loading && !error && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {userData.length > 0 ? (
            <DataTable
              columns={columns}
              data={userData}
              // If DataTable supports sorting, we can add sorting handlers
            />
          ) : (
            <div className="p-12 text-center">
              <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || roleFilter !== "all" || statusFilter !== "all"
                  ? "No users found matching your criteria"
                  : "No users yet"}
              </h3>
              <p className="text-gray-500">
                {searchTerm || roleFilter !== "all" || statusFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Users will appear here once they register."}
              </p>
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.last_page > 1 && (
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Page {pagination.current_page} of {pagination.last_page}
              </div>
              <div className="flex space-x-2">
                <button
                  disabled={pagination.current_page === 1}
                  onClick={() => setCurrentPage(pagination.current_page - 1)}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  disabled={pagination.current_page === pagination.last_page}
                  onClick={() => setCurrentPage(pagination.current_page + 1)}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserManagement;