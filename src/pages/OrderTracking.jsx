import React, { useState } from "react";
import { useParams } from "react-router-dom";

const OrderTracking = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState({
    id: orderId || "ORD-20230723-001",
    status: "shipped",
    items: [
      {
        id: 1,
        name: "Premium Rice",
        price: 12000,
        quantity: 50,
        total: 600000
      },
      {
        id: 2,
        name: "Construction Cement",
        price: 8500,
        quantity: 20,
        total: 170000
      }
    ],
    total: 770000,
    shipping: 15000,
    grandTotal: 785000,
    customer: {
      name: "Min Min",
      email: "minmin@example.com",
      phone: "09 123 456 789",
      address: "123 Business Street, Yangon"
    },
    paymentMethod: "KBZ Pay",
    tracking: [
      {
        status: "ordered",
        date: "2023-07-23 10:30",
        description: "Order placed"
      },
      {
        status: "confirmed",
        date: "2023-07-23 11:15",
        description: "Order confirmed by seller"
      },
      {
        status: "shipped",
        date: "2023-07-24 09:20",
        description: "Package shipped with ABC Express"
      },
      {
        status: "delivered",
        date: null,
        description: "Estimated delivery by Jul 26"
      }
    ]
  });

  const getStatusClass = status => {
    switch (status) {
      case "ordered":
        return "bg-blue-100 text-blue-800";
      case "confirmed":
        return "bg-purple-100 text-purple-800";
      case "shipped":
        return "bg-yellow-100 text-yellow-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = status => {
    switch (status) {
      case "ordered":
        return "Order Placed";
      case "confirmed":
        return "Order Confirmed";
      case "shipped":
        return "Shipped";
      case "delivered":
        return "Delivered";
      default:
        return status;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Order Tracking</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold">
              Order #{order.id}
            </h2>
            <p className="text-gray-600">
              Placed on {order.tracking[0].date.split(" ")[0]}
            </p>
          </div>
          <div>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusClass(
                order.status
              )}`}
            >
              {getStatusText(order.status)}
            </span>
          </div>
        </div>

        {/* Tracking Progress */}
        <div className="mb-8">
          <div className="relative">
            <div className="absolute top-4 left-0 h-0.5 bg-gray-300 w-full" />
            <div className="flex justify-between">
              {order.tracking.map((step, index) =>
                <div key={index} className="relative z-10">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${step.date
                      ? "bg-blue-600 text-white"
                      : "bg-gray-300 text-gray-600"}`}
                  >
                    {index + 1}
                  </div>
                  <div className="mt-2 text-center">
                    <p className="text-sm font-medium">
                      {getStatusText(step.status)}
                    </p>
                    {step.date &&
                      <p className="text-xs text-gray-600">
                        {step.date.split(" ")[0]}
                      </p>}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Order Details</h3>
            <div className="border rounded-lg">
              {order.items.map(item =>
                <div
                  key={item.id}
                  className="p-4 border-b flex justify-between"
                >
                  <div>
                    <p className="font-medium">
                      {item.name}
                    </p>
                    <p className="text-gray-600">
                      {item.quantity} x {item.price} MMK
                    </p>
                  </div>
                  <p className="font-medium">
                    {item.total} MMK
                  </p>
                </div>
              )}
              <div className="p-4">
                <div className="flex justify-between mb-2">
                  <span>Subtotal</span>
                  <span>
                    {order.total} MMK
                  </span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Shipping</span>
                  <span>
                    {order.shipping} MMK
                  </span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span>
                    {order.grandTotal} MMK
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Delivery Information</h3>
            <div className="border rounded-lg p-4">
              <div className="mb-4">
                <p className="font-medium">
                  {order.customer.name}
                </p>
                <p className="text-gray-600">
                  {order.customer.address}
                </p>
                <p className="text-gray-600">
                  {order.customer.phone}
                </p>
                <p className="text-gray-600">
                  {order.customer.email}
                </p>
              </div>

              <div>
                <p className="font-medium">Shipping Method</p>
                <p className="text-gray-600">ABC Express - Standard Delivery</p>
                <p className="text-gray-600 mt-1">
                  Tracking Number: MY-B2B-{order.id}
                </p>
              </div>
            </div>

            <h3 className="text-lg font-semibold mt-6 mb-4">
              Payment Information
            </h3>
            <div className="border rounded-lg p-4">
              <div>
                <p className="font-medium">Payment Method</p>
                <p className="text-gray-600">
                  {order.paymentMethod}
                </p>
              </div>
              <div className="mt-2">
                <p className="font-medium">Payment Status</p>
                <p className="text-green-600">Paid</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Tracking Updates</h3>
        <div className="space-y-4">
          {order.tracking.filter(step => step.date).map((step, index) =>
            <div key={index} className="flex">
              <div className="mr-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <div className="w-2 h-2 bg-blue-600 rounded-full" />
                </div>
                {index !== order.tracking.filter(s => s.date).length - 1 &&
                  <div className="h-12 w-px bg-gray-300 ml-4" />}
              </div>
              <div className="pb-6">
                <p className="font-medium">
                  {getStatusText(step.status)}
                </p>
                <p className="text-gray-600 text-sm">
                  {step.date}
                </p>
                <p className="text-gray-600 mt-1">
                  {step.description}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
