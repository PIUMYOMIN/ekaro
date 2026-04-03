import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  MagnifyingGlassIcon, FunnelIcon, TrashIcon, ShieldCheckIcon,
  CheckCircleIcon, XCircleIcon, ArrowPathIcon, UserCircleIcon,
} from "@heroicons/react/24/outline";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";

// ── Helpers ───────────────────────────────────────────────────────────────────
const ROLE_COLORS = {
  admin:  "bg-purple-100 text-purple-800",
  seller: "bg-blue-100 text-blue-800",
  buyer:  "bg-green-100 text-green-800",
};

const RoleBadge = ({ role }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold capitalize
                    ${ROLE_COLORS[role] || "bg-gray-100 text-gray-600"}`}>
    {role || "—"}
  </span>
);

const StatusBadge = ({ active }) => (
  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold
                    ${active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-700"}`}>
    {active
      ? <><CheckCircleIcon className="h-3 w-3" />Active</>
      : <><XCircleIcon className="h-3 w-3" />Inactive</>}
  </span>
);

// ── Inline toast ──────────────────────────────────────────────────────────────
const Toast = ({ toast }) => toast ? (
  <div className={`flex items-center gap-2 p-3 rounded-xl text-sm font-medium
    ${toast.type === "success"
      ? "bg-green-50 border border-green-200 text-green-800"
      : "bg-red-50 border border-red-200 text-red-700"}`}>
    {toast.type === "success"
      ? <CheckCircleIcon className="h-4 w-4 flex-shrink-0" />
      : <XCircleIcon className="h-4 w-4 flex-shrink-0" />}
    {toast.msg}
  </div>
) : null;

// ── Delete confirm modal ──────────────────────────────────────────────────────
const DeleteModal = ({ user, onConfirm, onClose }) => user ? (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
    <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
          <TrashIcon className="h-5 w-5 text-red-600" />
        </div>
        <h3 className="font-bold text-gray-900">Delete User</h3>
      </div>
      <p className="text-sm text-gray-600 mb-6">
        Delete <strong>{user.name}</strong>? This cannot be undone and will remove all their data.
      </p>
      <div className="flex justify-end gap-3">
        <button onClick={onClose}
          className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-xl hover:bg-gray-50">
          Cancel
        </button>
        <button onClick={onConfirm}
          className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700">
          Delete
        </button>
      </div>
    </div>
  </div>
) : null;

// ── Bulk confirm modal ────────────────────────────────────────────────────────
const BulkModal = ({ action, count, onConfirm, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
    <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4">
      <h3 className="font-bold text-gray-900 mb-2">Confirm Bulk Action</h3>
      <p className="text-sm text-gray-600 mb-6">
        Are you sure you want to <strong>{action}</strong> {count} user(s)?
      </p>
      <div className="flex justify-end gap-3">
        <button onClick={onClose}
          className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-xl hover:bg-gray-50">
          Cancel
        </button>
        <button onClick={onConfirm}
          className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700">
          Confirm
        </button>
      </div>
    </div>
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────
const UserManagement = () => {
  const { user: adminUser } = useAuth();
  const [users, setUsers]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [toast, setToast]           = useState(null);
  const [searchTerm, setSearch]     = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatus]   = useState("all");
  const [page, setPage]             = useState(1);
  const [pagination, setPagination] = useState(null);
  const [selectedUsers, setSelected] = useState([]);
  const [bulkAction, setBulkAction] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);  // user object
  const [showBulkModal, setBulkModal]   = useState(false);
  const toastTimer = useRef(null);

  const flash = (msg, type = "success") => {
    clearTimeout(toastTimer.current);
    setToast({ msg, type });
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  };

  // ── Fetch users ────────────────────────────────────────────────────────────
  const fetchUsers = useCallback(async (pg = page) => {
    setLoading(true);
    setError("");
    try {
      const params = {
        page: pg,
        per_page: 15,
        ...(searchTerm && { search: searchTerm }),
        ...(roleFilter !== "all" && { role: roleFilter }),
        ...(statusFilter !== "all" && { status: statusFilter }),
      };
      const res = await api.get("/users", { params });

      // UserResource::collection($paginator) → response.data = {success, data:{data:[...], ...}, meta:{...}}
      // OR direct paginator wrap: data = [{...}] with links/meta at root
      const payload = res.data.data;
      const items   = Array.isArray(payload?.data) ? payload.data
                    : Array.isArray(payload)        ? payload
                    : [];
      setUsers(items);

      // Pagination from meta (separate key in controller response)
      const meta = res.data.meta || payload;
      setPagination({
        current_page: meta?.current_page ?? pg,
        last_page:    meta?.last_page    ?? 1,
        total:        meta?.total        ?? items.length,
        from:         meta?.from         ?? 1,
        to:           meta?.to           ?? items.length,
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  }, [searchTerm, roleFilter, statusFilter, page]);

  useEffect(() => { fetchUsers(page); }, [searchTerm, roleFilter, statusFilter, page]);

  // ── Derive real role from user object ──────────────────────────────────────
  // UserResource returns:
  //   type:  "buyer" | "seller" | "admin"  ← most reliable (user.type column)
  //   roles: ["buyer"] | ["seller"] | []   ← Spatie roles as string array
  const deriveRole = (user) =>
    user.type ||
    (Array.isArray(user.roles) && user.roles.length > 0
      ? (typeof user.roles[0] === "string" ? user.roles[0] : user.roles[0]?.name)
      : null) ||
    "buyer";

  // ── Role change ────────────────────────────────────────────────────────────
  const handleRoleChange = async (targetUser, newRole) => {
    // Prevent admin demoting themselves
    if (targetUser.id === adminUser?.id && newRole !== "admin") {
      flash("You cannot change your own role.", "error");
      return;
    }
    try {
      await api.post(`/users/${targetUser.id}/assign-roles`, { roles: [newRole] });
      setUsers(prev => prev.map(u =>
        u.id === targetUser.id ? { ...u, type: newRole, roles: [newRole] } : u
      ));
      flash(`Role updated to ${newRole}.`);
    } catch (err) {
      flash(err.response?.data?.message || "Failed to update role.", "error");
    }
  };

  // ── Status change ──────────────────────────────────────────────────────────
  const handleStatusChange = async (userId, isActive) => {
    try {
      await api.put(`/users/${userId}`, { is_active: isActive });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_active: isActive } : u));
      flash(`User ${isActive ? "activated" : "deactivated"}.`);
    } catch (err) {
      flash(err.response?.data?.message || "Failed to update status.", "error");
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/users/${deleteTarget.id}`);
      setUsers(prev => prev.filter(u => u.id !== deleteTarget.id));
      setSelected(prev => prev.filter(id => id !== deleteTarget.id));
      flash(`${deleteTarget.name} deleted.`);
    } catch (err) {
      flash(err.response?.data?.message || "Failed to delete user.", "error");
    } finally {
      setDeleteTarget(null);
    }
  };

  // ── Bulk actions ───────────────────────────────────────────────────────────
  const executeBulk = async () => {
    setBulkModal(false);
    try {
      await Promise.all(selectedUsers.map(id => {
        if (bulkAction === "delete")     return api.delete(`/users/${id}`);
        if (bulkAction === "activate")   return api.put(`/users/${id}`, { is_active: true });
        if (bulkAction === "deactivate") return api.put(`/users/${id}`, { is_active: false });
        return Promise.resolve();
      }));
      flash(`${bulkAction} applied to ${selectedUsers.length} user(s).`);
      setSelected([]);
      setBulkAction("");
      fetchUsers(page);
    } catch (err) {
      flash(err.response?.data?.message || `Bulk ${bulkAction} failed.`, "error");
    }
  };

  // ── Selection ──────────────────────────────────────────────────────────────
  const toggleAll = () =>
    setSelected(prev => prev.length === users.length ? [] : users.map(u => u.id));

  const PER_PAGE = pagination?.last_page ?? 1;

  return (
    <div className="space-y-4">
      <Toast toast={toast} />
      <DeleteModal user={deleteTarget} onConfirm={handleDelete} onClose={() => setDeleteTarget(null)} />
      {showBulkModal && (
        <BulkModal
          action={bulkAction}
          count={selectedUsers.length}
          onConfirm={executeBulk}
          onClose={() => setBulkModal(false)}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">User Management</h2>
          <p className="text-sm text-gray-500">
            {pagination?.total ? `${pagination.total} total users` : "Manage registered users"}
          </p>
        </div>
        <button onClick={() => fetchUsers(page)}
          className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowPathIcon className="h-4 w-4" />
        </button>
      </div>

      {/* Bulk action bar */}
      {selectedUsers.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
          <span className="text-sm font-medium text-green-800">
            {selectedUsers.length} selected
          </span>
          <select value={bulkAction} onChange={e => setBulkAction(e.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-2 py-1 focus:ring-1 focus:ring-green-500">
            <option value="">Choose action…</option>
            <option value="activate">Activate</option>
            <option value="deactivate">Deactivate</option>
            <option value="delete">Delete</option>
          </select>
          <button onClick={() => {
            if (!bulkAction) { flash("Please select an action.", "error"); return; }
            setBulkModal(true);
          }}
            className="px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700">
            Apply
          </button>
          <button onClick={() => setSelected([])}
            className="px-3 py-1.5 border border-gray-300 text-gray-600 text-sm rounded-lg hover:bg-gray-50">
            Clear
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative sm:col-span-2">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input value={searchTerm}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Name, email or phone…"
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-xl
                         focus:ring-2 focus:ring-green-500 focus:border-transparent" />
          </div>
          {/* Role */}
          <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500">
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="seller">Seller</option>
            <option value="buyer">Buyer</option>
          </select>
          {/* Status */}
          <select value={statusFilter} onChange={e => { setStatus(e.target.value); setPage(1); }}
            className="px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {pagination && (
          <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
            <span>{pagination.total} users</span>
            {pagination.from && <><span>·</span><span>Showing {pagination.from}–{pagination.to}</span></>}
            <button onClick={() => { setSearch(""); setRoleFilter("all"); setStatus("all"); setPage(1); }}
              className="ml-auto flex items-center gap-1 text-gray-500 hover:text-gray-700 text-xs">
              <FunnelIcon className="h-3.5 w-3.5" /> Reset
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-14">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-green-500" />
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-600 text-sm">
            {error}
            <button onClick={() => fetchUsers(page)} className="ml-2 underline">Retry</button>
          </div>
        ) : users.length === 0 ? (
          <div className="py-14 text-center text-gray-400 text-sm">
            <UserCircleIcon className="h-10 w-10 mx-auto mb-3 opacity-40" />
            {searchTerm || roleFilter !== "all" || statusFilter !== "all"
              ? "No users match your filters."
              : "No users yet."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 w-10">
                    <input type="checkbox"
                      checked={selectedUsers.length === users.length && users.length > 0}
                      onChange={toggleAll}
                      className="h-4 w-4 text-green-600 rounded border-gray-300 focus:ring-green-500" />
                  </th>
                  {["Name", "Email / Phone", "Role", "Status", "Joined", "Actions"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map(u => {
                  const role    = deriveRole(u);
                  const isMe    = u.id === adminUser?.id;
                  return (
                    <tr key={u.id} className={`transition-colors ${isMe ? "bg-green-50/40" : "hover:bg-gray-50"}`}>
                      <td className="px-4 py-3">
                        <input type="checkbox"
                          checked={selectedUsers.includes(u.id)}
                          onChange={() => setSelected(prev =>
                            prev.includes(u.id) ? prev.filter(id => id !== u.id) : [...prev, u.id]
                          )}
                          className="h-4 w-4 text-green-600 rounded border-gray-300 focus:ring-green-500" />
                      </td>

                      {/* Name + avatar */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                            {u.profile_photo
                              ? <img src={u.profile_photo} alt="" className="w-full h-full object-cover" />
                              : <span className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-500">
                                  {u.name?.[0]?.toUpperCase() || "?"}
                                </span>
                            }
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 flex items-center gap-1">
                              {u.name}
                              {isMe && <ShieldCheckIcon className="h-3.5 w-3.5 text-green-600" title="You" />}
                            </p>
                            <p className="text-[11px] text-gray-400">{u.user_id || `#${u.id}`}</p>
                          </div>
                        </div>
                      </td>

                      {/* Email / Phone */}
                      <td className="px-4 py-3 text-gray-600">
                        <p className="truncate max-w-[180px]">{u.email || "—"}</p>
                        <p className="text-[11px] text-gray-400">{u.phone || "—"}</p>
                      </td>

                      {/* Role — select to change, with self-protection */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <RoleBadge role={role} />
                          <select
                            value={role}
                            onChange={e => handleRoleChange(u, e.target.value)}
                            disabled={isMe}
                            title={isMe ? "Cannot change your own role" : "Change role"}
                            className="text-xs border border-gray-200 rounded-lg px-1.5 py-0.5
                                       focus:ring-1 focus:ring-green-400 disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <option value="admin">Admin</option>
                            <option value="seller">Seller</option>
                            <option value="buyer">Buyer</option>
                          </select>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <StatusBadge active={u.is_active} />
                          <button
                            onClick={() => handleStatusChange(u.id, !u.is_active)}
                            className="text-[11px] text-gray-400 hover:text-gray-600 underline"
                          >
                            {u.is_active ? "Deactivate" : "Activate"}
                          </button>
                        </div>
                      </td>

                      {/* Joined */}
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>

                      {/* Delete */}
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setDeleteTarget(u)}
                          disabled={isMe}
                          title={isMe ? "Cannot delete yourself" : "Delete user"}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg
                                     transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && pagination && pagination.last_page > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-sm">
            <span className="text-gray-400 text-xs">
              Page {pagination.current_page} of {pagination.last_page}
            </span>
            <div className="flex gap-1">
              <button disabled={pagination.current_page === 1}
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1 border border-gray-200 rounded-lg text-xs disabled:opacity-40 hover:bg-gray-50">
                Previous
              </button>
              <button disabled={pagination.current_page === pagination.last_page}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1 border border-gray-200 rounded-lg text-xs disabled:opacity-40 hover:bg-gray-50">
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;