import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CubeIcon, CurrencyDollarIcon } from "@heroicons/react/24/outline";

// Utility functions
function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

function formatMMK(amount) {
  return amount.toLocaleString("en-MM", {
    style: "currency",
    currency: "MMK",
    minimumFractionDigits: 0
  });
}

// Dummy data for demonstration
const cartItems = [
  {
    id: 1,
    name: "Mobile Legends Diamonds",
    price: 25000,
    quantity: 1,
    icon: CubeIcon
  },
  {
    id: 2,
    name: "PUBG UC",
    price: 50000,
    quantity: 2,
    icon: CurrencyDollarIcon
  }
];

export default function Checkout() {
  const [items, setItems] = useState(cartItems);
  const navigate = useNavigate();

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleConfirmOrder = () => {
    // In a real app, you might want to save the order details first
    // Then navigate to payment selection
    navigate("/payment");
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Checkout</h1>

      <div className="bg-white shadow rounded-lg p-4 space-y-4">
        {items.map(item =>
          <div
            key={item.id}
            className="flex items-center justify-between border-b pb-3"
          >
            <div className="flex items-center space-x-4">
              <item.icon className="h-6 w-6 text-gray-500" />
              <span className="text-gray-700">
                {item.name}
              </span>
            </div>
            <div className="text-right">
              <div>
                {formatMMK(item.price)}
              </div>
              <div className="text-sm text-gray-500">
                x {item.quantity}
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between text-lg font-semibold pt-2">
          <span>Total</span>
          <span>
            {formatMMK(total)}
          </span>
        </div>
      </div>

      <button
        onClick={handleConfirmOrder}
        className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium"
      >
        Confirm Order
      </button>
    </div>
  );
}
