// src/pages/BuyerDashboard.jsx
import React, { useEffect, useState } from "react";
import api from "../utils/api";

const BuyerDashboard = () => {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Get user profile
        const userResponse = await api.get("/auth/me");
        setUser(userResponse.data.data);

        // Get user orders
        const ordersResponse = await api.get("/orders");
        setOrders(ordersResponse.data.data);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Profile</h2>
            {user &&
              <div>
                <div className="mb-4">
                  <h3 className="font-semibold">Name</h3>
                  <p>
                    {user.name}
                  </p>
                </div>
                <div className="mb-4">
                  <h3 className="font-semibold">Email</h3>
                  <p>
                    {user.email}
                  </p>
                </div>
                <div className="mb-4">
                  <h3 className="font-semibold">Phone</h3>
                  <p>
                    {user.phone}
                  </p>
                </div>
                <div className="mb-4">
                  <h3 className="font-semibold">Account Number</h3>
                  <p>
                    {user.account_number}
                  </p>
                </div>
              </div>}
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Recent Orders</h2>
            {orders.length === 0
              ? <p>No orders found</p>
              : <div className="space-y-4">
                  {orders.map(order =>
                    <div key={order.id} className="border-b pb-4">
                      <div className="flex justify-between">
                        <span className="font-semibold">
                          Order #{order.id}
                        </span>
                        <span
                          className={`px-2 py-1 rounded text-sm ${order.status ===
                          "completed"
                            ? "bg-green-100 text-green-800"
                            : order.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"}`}
                        >
                          {order.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {new Date(order.created_at).toLocaleDateString()}
                      </div>
                      <div className="mt-2">
                        Total: ${order.total_amount}
                      </div>
                    </div>
                  )}
                </div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerDashboard;
