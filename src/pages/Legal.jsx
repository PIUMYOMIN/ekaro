import React from "react";

const Legal = () => {
  const legalSections = [
    {
      title: "Terms of Service",
      content: `By accessing and using MyanmarB2B, you accept and agree to be bound by the terms and provisions of this agreement. All transactions conducted through the platform are subject to these terms.`
    },
    {
      title: "Privacy Policy",
      content: `We collect personal information to provide and improve our services. Your data is protected and will not be shared with third parties without your consent, except as required by law.`
    },
    {
      title: "Refund Policy",
      content: `Refunds are processed within 7-10 business days for eligible returns. Products must be returned in original condition. Shipping costs are non-refundable.`
    },
    {
      title: "Seller Agreement",
      content: `Sellers are responsible for accurate product listings, timely fulfillment, and customer service. MyanmarB2B charges a commission fee as outlined in the pricing plan.`
    },
    {
      title: "Dispute Resolution",
      content: `Any disputes arising from transactions should first attempt to be resolved between buyer and seller. MyanmarB2B may mediate unresolved disputes at our discretion.`
    }
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">
          Legal Information
        </h1>

        <div className="bg-white rounded-lg shadow-md p-8">
          {legalSections.map((section, index) =>
            <div key={index} className="mb-8 last:mb-0">
              <h2 className="text-2xl font-bold mb-4">
                {section.title}
              </h2>
              <p className="text-gray-700 mb-6">
                {section.content}
              </p>
              {index < legalSections.length - 1 && <hr className="my-6" />}
            </div>
          )}
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Contact Our Legal Team</h2>
          <p className="text-gray-700 mb-4">
            For any legal inquiries or questions about our policies, please
            contact:
          </p>
          <p className="text-gray-700">
            <strong>Email:</strong> legal@myanmarb2b.com<br />
            <strong>Address:</strong> 123 Business Street, Yangon, Myanmar
          </p>
        </div>
      </div>
    </div>
  );
};

export default Legal;
