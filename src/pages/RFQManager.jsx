import React, { useState } from "react";

const RFQManager = () => {
  const [activeTab, setActiveTab] = useState("sent");
  const [newRFQ, setNewRFQ] = useState({
    product: "",
    quantity: "",
    specifications: "",
    deadline: ""
  });

  const sentRFQs = [
    {
      id: "RFQ-001",
      product: "Construction Cement",
      quantity: "500 bags",
      sentDate: "2023-07-20",
      deadline: "2023-07-27",
      responses: 5,
      status: "Open"
    },
    {
      id: "RFQ-002",
      product: "Steel Bars",
      quantity: "10 tons",
      sentDate: "2023-07-15",
      deadline: "2023-07-22",
      responses: 8,
      status: "Closed"
    }
  ];

  const receivedRFQs = [
    {
      id: "RFQ-003",
      product: "Premium Rice",
      quantity: "200 bags",
      buyer: "Restaurant Chain Co.",
      receivedDate: "2023-07-21",
      deadline: "2023-07-28",
      status: "Pending Response"
    }
  ];

  const handleInputChange = e => {
    const { name, value } = e.target;
    setNewRFQ(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    // Handle RFQ submission
    alert("RFQ submitted successfully!");
    setNewRFQ({
      product: "",
      quantity: "",
      specifications: "",
      deadline: ""
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">
        Request for Quotation (RFQ) Manager
      </h1>

      <div className="flex border-b mb-6">
        <button
          onClick={() => setActiveTab("sent")}
          className={`px-6 py-3 font-medium ${activeTab === "sent"
            ? "border-b-2 border-blue-600 text-blue-600"
            : "text-gray-600"}`}
        >
          My Sent RFQs
        </button>
        <button
          onClick={() => setActiveTab("received")}
          className={`px-6 py-3 font-medium ${activeTab === "received"
            ? "border-b-2 border-blue-600 text-blue-600"
            : "text-gray-600"}`}
        >
          Received RFQs
        </button>
        <button
          onClick={() => setActiveTab("new")}
          className={`px-6 py-3 font-medium ${activeTab === "new"
            ? "border-b-2 border-blue-600 text-blue-600"
            : "text-gray-600"}`}
        >
          Create New RFQ
        </button>
      </div>

      {activeTab === "sent" &&
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-4 text-left">RFQ ID</th>
                <th className="p-4 text-left">Product</th>
                <th className="p-4 text-left">Quantity</th>
                <th className="p-4 text-left">Sent Date</th>
                <th className="p-4 text-left">Deadline</th>
                <th className="p-4 text-left">Responses</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {sentRFQs.map(rfq =>
                <tr key={rfq.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    {rfq.id}
                  </td>
                  <td className="p-4">
                    {rfq.product}
                  </td>
                  <td className="p-4">
                    {rfq.quantity}
                  </td>
                  <td className="p-4">
                    {rfq.sentDate}
                  </td>
                  <td className="p-4">
                    {rfq.deadline}
                  </td>
                  <td className="p-4">
                    {rfq.responses}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${rfq.status ===
                      "Open"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"}`}
                    >
                      {rfq.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <button className="text-blue-600 hover:underline">
                      View
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>}

      {activeTab === "received" &&
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-4 text-left">RFQ ID</th>
                <th className="p-4 text-left">Product</th>
                <th className="p-4 text-left">Quantity</th>
                <th className="p-4 text-left">Buyer</th>
                <th className="p-4 text-left">Received Date</th>
                <th className="p-4 text-left">Deadline</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {receivedRFQs.map(rfq =>
                <tr key={rfq.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    {rfq.id}
                  </td>
                  <td className="p-4">
                    {rfq.product}
                  </td>
                  <td className="p-4">
                    {rfq.quantity}
                  </td>
                  <td className="p-4">
                    {rfq.buyer}
                  </td>
                  <td className="p-4">
                    {rfq.receivedDate}
                  </td>
                  <td className="p-4">
                    {rfq.deadline}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${rfq.status ===
                      "Pending Response"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"}`}
                    >
                      {rfq.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <button className="text-blue-600 hover:underline">
                      Respond
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>}

      {activeTab === "new" &&
        <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Create New RFQ</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  name="product"
                  value={newRFQ.product}
                  onChange={handleInputChange}
                  className="w-full border rounded p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity
                </label>
                <input
                  type="text"
                  name="quantity"
                  value={newRFQ.quantity}
                  onChange={handleInputChange}
                  className="w-full border rounded p-2"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Specifications
                </label>
                <textarea
                  name="specifications"
                  value={newRFQ.specifications}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full border rounded p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Response Deadline
                </label>
                <input
                  type="date"
                  name="deadline"
                  value={newRFQ.deadline}
                  onChange={handleInputChange}
                  className="w-full border rounded p-2"
                  required
                />
              </div>
            </div>
            <div className="mt-6">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
              >
                Submit RFQ
              </button>
            </div>
          </form>
        </div>}
    </div>
  );
};

export default RFQManager;
