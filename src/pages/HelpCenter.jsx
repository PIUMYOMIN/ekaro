import React, { useState } from "react";

const HelpCenter = () => {
  const [activeCategory, setActiveCategory] = useState("buying");
  const [activeQuestion, setActiveQuestion] = useState(null);

  const faqs = {
    buying: [
      {
        id: 1,
        question: "How do I place an order?",
        answer:
          "To place an order, browse our product catalog, add items to your cart, and proceed to checkout. You can choose from various payment methods including MMQR, mobile wallets, and bank transfer."
      },
      {
        id: 2,
        question: "What is the minimum order quantity?",
        answer:
          "Minimum order quantities vary by product and are set by individual sellers. You can find the MOQ listed on each product page."
      },
      {
        id: 3,
        question: "How can I track my order?",
        answer:
          'Once your order is shipped, you will receive a tracking number via email or SMS. You can track your order status in the "My Orders" section of your account.'
      }
    ],
    selling: [
      {
        id: 4,
        question: "How do I become a seller?",
        answer:
          "Register for a seller account, complete your profile, and submit your business documents for verification. Once approved, you can start listing your products."
      },
      {
        id: 5,
        question: "What are the seller fees?",
        answer:
          "We charge a commission fee ranging from 5-10% depending on your subscription plan. There are no upfront fees to join the platform."
      },
      {
        id: 6,
        question: "How do I receive payments?",
        answer:
          "Payments are processed through our secure payment system and transferred to your registered bank account every week, minus our commission fees."
      }
    ],
    payments: [
      {
        id: 7,
        question: "What payment methods do you accept?",
        answer:
          "We accept MMQR payments, mobile wallets (KBZ Pay, Wave Money), bank transfers, and cash on delivery for certain products."
      },
      {
        id: 8,
        question: "Is my payment information secure?",
        answer:
          "Yes, we use industry-standard encryption and never store your full payment details on our servers."
      },
      {
        id: 9,
        question: "How long do refunds take to process?",
        answer:
          "Refunds are typically processed within 3-5 business days after approval, depending on your payment method."
      }
    ]
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Help Center</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <button
            onClick={() => setActiveCategory("buying")}
            className={`px-6 py-3 rounded-lg ${activeCategory === "buying"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-800"}`}
          >
            Buying on MyanmarB2B
          </button>
          <button
            onClick={() => setActiveCategory("selling")}
            className={`px-6 py-3 rounded-lg ${activeCategory === "selling"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-800"}`}
          >
            Selling on MyanmarB2B
          </button>
          <button
            onClick={() => setActiveCategory("payments")}
            className={`px-6 py-3 rounded-lg ${activeCategory === "payments"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-800"}`}
          >
            Payments & Security
          </button>
        </div>

        <div className="space-y-4">
          {faqs[activeCategory].map(item =>
            <div key={item.id} className="border rounded-lg overflow-hidden">
              <button
                onClick={() =>
                  setActiveQuestion(
                    activeQuestion === item.id ? null : item.id
                  )}
                className="w-full text-left p-4 bg-gray-50 hover:bg-gray-100 flex justify-between items-center"
              >
                <span className="font-medium">
                  {item.question}
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-5 w-5 transform transition-transform ${activeQuestion ===
                  item.id
                    ? "rotate-180"
                    : ""}`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {activeQuestion === item.id &&
                <div className="p-4 bg-white">
                  <p className="text-gray-700">
                    {item.answer}
                  </p>
                </div>}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">Still need help?</h2>
        <p className="text-gray-700 mb-6">
          Contact our customer support team for personalized assistance.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Email Support</h3>
            <p className="text-gray-600 mb-3">support@myanmarb2b.com</p>
            <p className="text-sm text-gray-500">
              Typically responds within 24 hours
            </p>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Phone Support</h3>
            <p className="text-gray-600 mb-3">09 123 456 789</p>
            <p className="text-sm text-gray-500">Mon-Fri, 9AM-5PM</p>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Live Chat</h3>
            <p className="text-gray-600 mb-3">Available on the website</p>
            <p className="text-sm text-gray-500">Mon-Sun, 8AM-8PM</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;
