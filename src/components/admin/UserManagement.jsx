import React,{useEffect} from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import DataTable from "../ui/DataTable";
const UserManagement = ({
  users,
  loading,
  error,
  searchTerm,
  onSearchChange,
  handleRoleChange,
  handleUserStatus,
  handleDeleteUser
}) => {
  const columns = [
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
      isStatus: true,
      cell: (row) => (
        <select
          value={row.is_active ? "active" : "inactive"}
          onChange={(e) =>
            handleUserStatus(row.id, e.target.value === "active")
          }
          className={`px-2 py-1 text-xs font-medium rounded-full ${row.is_active
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
        <div className="flex space-x-2">
          <button
            className="text-red-600 hover:text-red-900"
            onClick={() => handleDeleteUser(row.id)}
            title="Delete User"
          >
            Delete
          </button>
        </div>
      )
    }
  ];

  // In UserManagement component, fix the role extraction:
  const userData = users.map((user) => {

    // Extract role properly - try different possible structures
    let userRole = "buyer";

    if (user.roles && Array.isArray(user.roles)) {
      // If roles is an array of objects with 'name' property
      userRole = user.roles[0]?.name || "buyer";
    } else if (user.roles && typeof user.roles === 'string') {
      // If roles is a string
      userRole = user.roles;
    } else if (user.role) {
      // If there's a direct 'role' property
      userRole = user.role;
    } else if (user.type) {
      // Fallback to user type
      userRole = user.type;
    }

    return {
      ...user,
      role: userRole,
      status: user.is_active ? "Active" : "Inactive",
      created_at: new Date(user.created_at).toLocaleDateString(),
      is_active: user.is_active !== undefined ? user.is_active : true
    };
  });

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-gray-900">User Management</h3>
          <p className="mt-1 text-sm text-gray-500">
            Manage all registered users
          </p>
        </div>
        <div className="relative max-w-xs">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search users by name, email, or phone..."
            className="block w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      {loading && (
        <div className="p-8 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
        </div>
      )}
      {error && (
        <div className="p-4 text-red-500">
          Error loading users: {error.message}
        </div>
      )}

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

export default UserManagement;