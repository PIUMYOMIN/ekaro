import React from "react";

const Pricing = () => {
  const plans = [
    {
      name: "Basic",
      price: "0 MMK",
      description: "For small businesses getting started",
      features: [
        "List up to 20 products",
        "5% transaction fee",
        "Basic storefront",
        "Email support"
      ],
      popular: false
    },
    {
      name: "Professional",
      price: "50,000 MMK/month",
      description: "For growing businesses",
      features: [
        "List up to 100 products",
        "3% transaction fee",
        "Enhanced storefront",
        "Priority support",
        "Basic analytics"
      ],
      popular: true
    },
    {
      name: "Enterprise",
      price: "150,000 MMK/month",
      description: "For large businesses and wholesalers",
      features: [
        "Unlimited products",
        "1% transaction fee",
        "Custom storefront",
        "24/7 dedicated support",
        "Advanced analytics",
        "Bulk import/export"
      ],
      popular: false
    }
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Pricing Plans</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Choose the perfect plan for your business needs. No hidden fees,
          cancel anytime.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {plans.map((plan, index) =>
          <div
            key={index}
            className={`relative rounded-lg shadow-md overflow-hidden ${plan.popular
              ? "ring-2 ring-blue-500"
              : "border border-gray-200"}`}
          >
            {plan.popular &&
              <div className="absolute top-0 right-0 bg-blue-500 text-white px-4 py-1 text-sm font-medium rounded-bl-lg">
                Most Popular
              </div>}
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-2">
                {plan.name}
              </h2>
              <p className="text-gray-600 mb-4">
                {plan.description}
              </p>
              <div className="mb-6">
                <span className="text-3xl font-bold">
                  {plan.price}
                </span>
                {plan.price !== "0 MMK" &&
                  <span className="text-gray-600">/month</span>}
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) =>
                  <li key={i} className="flex items-start">
                    <svg
                      className="h-5 w-5 text-green-500 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>
                      {feature}
                    </span>
                  </li>
                )}
              </ul>
              <button
                className={`w-full py-3 px-4 rounded-lg font-medium ${plan.popular
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"}`}
              >
                Get Started
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-16 bg-white rounded-lg shadow-md p-8 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Frequently Asked Questions
        </h2>
        <div className="space-y-6">
          <div>
            <h3 className="font-medium mb-2">Are there any setup fees?</h3>
            <p className="text-gray-600">
              No, there are no setup fees for any of our plans. You only pay the
              monthly subscription fee if you choose a paid plan.
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-2">Can I change plans later?</h3>
            <p className="text-gray-600">
              Yes, you can upgrade or downgrade your plan at any time. Changes
              will take effect at the start of your next billing cycle.
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-2">
              What payment methods do you accept?
            </h3>
            <p className="text-gray-600">
              We accept all major payment methods in Myanmar including MMQR,
              mobile wallets (KBZ Pay, Wave Money), and bank transfers.
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-2">
              Is there a contract or long-term commitment?
            </h3>
            <p className="text-gray-600">
              No, all plans are month-to-month with no long-term commitment. You
              can cancel anytime.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
