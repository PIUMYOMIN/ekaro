import React, { useState } from 'react';

const LocalDeals = () => {
  const [activeRegion, setActiveRegion] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const regions = [
    { id: 'all', name: 'All Myanmar' },
    { id: 'yangon', name: 'Yangon' },
    { id: 'mandalay', name: 'Mandalay' },
    { id: 'naypyidaw', name: 'Naypyidaw' },
    { id: 'ayeyarwady', name: 'Ayeyarwady' },
    { id: 'shan', name: 'Shan State' }
  ];

  const deals = [
    {
      id: 1,
      title: 'Rice Wholesale Discount',
      description: 'Special discount on bulk rice orders from local farms in Ayeyarwady',
      region: 'ayeyarwady',
      discount: '15% OFF',
      expiry: '2023-08-15',
      supplier: 'Golden Grains Co.'
    },
    {
      id: 2,
      title: 'Construction Materials Bundle',
      description: 'Cement, steel and bricks package deal for Yangon projects',
      region: 'yangon',
      discount: '10% OFF',
      expiry: '2023-08-10',
      supplier: 'Building Materials Ltd.'
    },
    {
      id: 3,
      title: 'Local Handicrafts Promotion',
      description: 'Discount on traditional Myanmar handicrafts from Shan State',
      region: 'shan',
      discount: '20% OFF',
      expiry: '2023-08-20',
      supplier: 'Myanmar Handicrafts'
    },
    {
      id: 4,
      title: 'Mandalay Food Suppliers',
      description: 'Special prices for local restaurants on food ingredients',
      region: 'mandalay',
      discount: '12% OFF',
      expiry: '2023-08-05',
      supplier: 'Mandalay Food Distributors'
    }
  ];

  const filteredDeals = deals.filter(deal => {
    const matchesRegion = activeRegion === 'all' || deal.region === activeRegion;
    const matchesSearch = deal.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         deal.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRegion && matchesSearch;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Local Deals</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search deals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border rounded-lg p-3"
            />
          </div>
          <div className="flex space-x-2 overflow-x-auto pb-2 md:pb-0">
            {regions.map(region => (
              <button
                key={region.id}
                onClick={() => setActiveRegion(region.id)}
                className={`whitespace-nowrap px-4 py-2 rounded-lg ${
                  activeRegion === region.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'
                }`}
              >
                {region.name}
              </button>
            ))}
          </div>
        </div>
        
        {filteredDeals.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No deals found matching your criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredDeals.map(deal => (
              <div key={deal.id} className="border rounded-lg overflow-hidden hover:shadow-md">
                <div className="bg-blue-600 text-white p-4">
                  <div className="flex justify-between items-start">
                    <h2 className="text-xl font-bold">{deal.title}</h2>
                    <span className="bg-white text-blue-600 px-3 py-1 rounded-full font-bold">
                      {deal.discount}
                    </span>
                  </div>
                  <p className="text-blue-100">{deal.supplier}</p>
                </div>
                <div className="p-4">
                  <p className="text-gray-700 mb-4">{deal.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                      {regions.find(r => r.id === deal.region)?.name}
                    </span>
                    <span className="text-sm text-gray-600">
                      Expires: {deal.expiry}
                    </span>
                  </div>
                </div>
                <div className="border-t p-4 bg-gray-50">
                  <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                    View Deal
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">About Local Deals</h2>
        <p className="text-gray-700 mb-4">
          Our Local Deals program connects buyers with special offers from suppliers in their region. 
          These deals help you save on transportation costs and support local businesses across Myanmar.
        </p>
        <p className="text-gray-700">
          Check back regularly as we add new deals weekly. Suppliers can create deals through their 
          seller dashboard to promote their products to local buyers.
        </p>
      </div>
    </div>
  );
};

export default LocalDeals;