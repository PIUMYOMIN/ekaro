import React from "react";

const AboutUs = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">
          About MyanmarB2B
        </h1>

        <div className="bg-white rounded-lg shadow-md p-8 mb-12">
          <h2 className="text-2xl font-bold mb-6">Our Mission</h2>
          <p className="text-gray-700 mb-6">
            MyanmarB2B was founded in 2020 with a simple mission: to connect
            businesses across Myanmar with a reliable, efficient, and
            trustworthy B2B marketplace platform. We aim to bridge the gap
            between suppliers and buyers, fostering economic growth and creating
            new opportunities for businesses of all sizes.
          </p>
          <p className="text-gray-700">
            In a market where business connections are often made through
            personal networks, we provide a digital platform that expands
            opportunities and creates transparency in commercial transactions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4">For Buyers</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">✓</span>
                <span>Access to verified suppliers across Myanmar</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">✓</span>
                <span>Competitive pricing and bulk order discounts</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">✓</span>
                <span>
                  Secure payment options including MMQR and mobile wallets
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">✓</span>
                <span>Order tracking and logistics support</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4">For Sellers</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">✓</span>
                <span>Reach new customers across Myanmar</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">✓</span>
                <span>Digital storefront to showcase your products</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">✓</span>
                <span>Secure and timely payments</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">✓</span>
                <span>Business analytics and sales reports</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold mb-6">Our Team</h2>
          <p className="text-gray-700 mb-6">
            MyanmarB2B is built by a team of local entrepreneurs and
            technologists who understand the unique challenges of doing business
            in Myanmar. We combine deep local knowledge with international best
            practices to create a platform that works for Myanmar businesses.
          </p>
          <p className="text-gray-700">
            With backgrounds in e-commerce, logistics, and financial technology,
            our team is committed to building tools that make B2B commerce
            easier, more transparent, and more accessible for everyone.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
