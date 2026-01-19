import React from "react";
import DataTable from "../ui/DataTable";
const OrderManagement = ({ orders, loading, error, updateOrderStatus }) => {
  const columns = [
    { header: "Order #", accessor: "id" },
    { header: "Date", accessor: "date" },
    { header: "Customer", accessor: "customer" },
    { header: "Amount", accessor: "amount", isCurrency: true },
    { header: "Status", accessor: "status" },
    { header: "Actions", accessor: "actions" }
  ];

  const orderData = orders.map((order) => ({
    ...order,
    date: new Date(order.created_at).toLocaleDateString(),
    customer: order.user?.name || order.customer_name || "Unknown",
    amount: order.total_amount || order.total || 0,
    status: order.status || "pending",
    actions: (
      <div className="flex space-x-2">
        <select
          value={order.status || "pending"}
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
          <h3 className="text-lg font-medium text-gray-900">
            Order Management
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Track and manage all orders
          </p>
        </div>
      </div>

      {loading && <div className="p-8 flex justify-center">Loading...</div>}
      {error && <div className="p-4 text-red-500">Error loading orders</div>}

      {!loading && !error && <DataTable columns={columns} data={orderData} />}
    </div>
  );
};

export default OrderManagement;