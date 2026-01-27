// src/components/seller/ShippingSettings.jsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TruckIcon, PlusIcon, PencilIcon, TrashIcon, CheckIcon, XMarkIcon,  } from '@heroicons/react/24/outline';
const ShippingSettings = () => {
  const { t } = useTranslation();
  const [shippingMethods, setShippingMethods] = useState([
    { id: 1, name: 'Standard Delivery', cost: 3000, deliveryTime: '3-5 days', regions: ['Yangon', 'Mandalay'], enabled: true },
    { id: 2, name: 'Express Delivery', cost: 5000, deliveryTime: '1-2 days', regions: ['Yangon'], enabled: true },
    { id: 3, name: 'Free Shipping', cost: 0, deliveryTime: '5-7 days', regions: ['All regions'], enabled: false }
  ]);
  
  const [editingId, setEditingId] = useState(null);
  const [newMethod, setNewMethod] = useState({
    name: '',
    cost: '',
    deliveryTime: '',
    regions: '',
    enabled: true
  });
  const [showAddForm, setShowAddForm] = useState(false);
  
  const handleEdit = (id) => {
    setEditingId(id);
    const method = shippingMethods.find(m => m.id === id);
    setNewMethod({
      name: method.name,
      cost: method.cost,
      deliveryTime: method.deliveryTime,
      regions: method.regions.join(', '),
      enabled: method.enabled
    });
  };
  
  const handleSave = (id) => {
    const updatedMethods = shippingMethods.map(method => {
      if (method.id === id) {
        return {
          ...method,
          name: newMethod.name,
          cost: Number(newMethod.cost),
          deliveryTime: newMethod.deliveryTime,
          regions: newMethod.regions.split(',').map(r => r.trim()),
          enabled: newMethod.enabled
        };
      }
      return method;
    });
    
    setShippingMethods(updatedMethods);
    setEditingId(null);
  };
  
  const handleAdd = () => {
    const newId = Math.max(...shippingMethods.map(m => m.id), 0) + 1;
    const newMethodObj = {
      id: newId,
      name: newMethod.name,
      cost: Number(newMethod.cost),
      deliveryTime: newMethod.deliveryTime,
      regions: newMethod.regions.split(',').map(r => r.trim()),
      enabled: newMethod.enabled
    };
    
    setShippingMethods([...shippingMethods, newMethodObj]);
    setShowAddForm(false);
    setNewMethod({
      name: '',
      cost: '',
      deliveryTime: '',
      regions: '',
      enabled: true
    });
  };
  
  const handleDelete = (id) => {
    setShippingMethods(shippingMethods.filter(method => method.id !== id));
  };
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewMethod(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">{t('seller.shipping_settings')}</h2>
        <button 
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-1" />
          {t('seller.add_method')}
        </button>
      </div>
      
      {/* Add New Method Form */}
      {showAddForm && (
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">{t('seller.add_shipping_method')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('seller.method_name')}
              </label>
              <input
                type="text"
                name="name"
                value={newMethod.name}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('seller.shipping_cost')} (MMK)
              </label>
              <input
                type="number"
                name="cost"
                value={newMethod.cost}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('seller.delivery_time')}
              </label>
              <input
                type="text"
                name="deliveryTime"
                value={newMethod.deliveryTime}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g. 3-5 days"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('seller.available_regions')}
              </label>
              <input
                type="text"
                name="regions"
                value={newMethod.regions}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g. Yangon, Mandalay, Naypyitaw"
              />
              <p className="mt-1 text-sm text-gray-500">
                {t('seller.comma_separated')}
              </p>
            </div>
            
            <div className="flex items-center">
              <input
                id="enabled"
                name="enabled"
                type="checkbox"
                checked={newMethod.enabled}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="enabled" className="ml-2 block text-sm text-gray-700">
                {t('seller.enable_method')}
              </label>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={() => setShowAddForm(false)}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              {t('seller.cancel')}
            </button>
            <button
              onClick={handleAdd}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium"
            >
              {t('seller.save_method')}
            </button>
          </div>
        </div>
      )}
      
      {/* Shipping Methods List */}
      <div className="space-y-6">
        {shippingMethods.map((method) => (
          <div key={method.id} className="border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-start">
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-full">
                  <TruckIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  {editingId === method.id ? (
                    <input
                      type="text"
                      name="name"
                      value={newMethod.name}
                      onChange={handleChange}
                      className="text-xl font-bold text-gray-900 border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <h3 className="text-xl font-bold text-gray-900">{method.name}</h3>
                  )}
                  <div className="mt-1 flex items-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      method.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {method.enabled ? t('seller.enabled') : t('seller.disabled')}
                    </span>
                    <span className="ml-2 text-sm text-gray-500">
                      {method.cost === 0 
                        ? t('seller.free_shipping') 
                        : `${method.cost.toLocaleString()} MMK`}
                    </span>
                  </div>
                </div>
              </div>
              
              {editingId === method.id ? (
                <div className="flex space-x-2">
                  <button
                    onClick={() => setEditingId(null)}
                    className="bg-gray-200 hover:bg-gray-300 p-2 rounded-full"
                  >
                    <XIcon className="h-5 w-5 text-gray-700" />
                  </button>
                  <button
                    onClick={() => handleSave(method.id)}
                    className="bg-green-600 hover:bg-green-700 p-2 rounded-full"
                  >
                    <CheckIcon className="h-5 w-5 text-white" />
                  </button>
                </div>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(method.id)}
                    className="bg-blue-100 hover:bg-blue-200 p-2 rounded-full"
                  >
                    <PencilIcon className="h-5 w-5 text-blue-700" />
                  </button>
                  <button
                    onClick={() => handleDelete(method.id)}
                    className="bg-red-100 hover:bg-red-200 p-2 rounded-full"
                  >
                    <TrashIcon className="h-5 w-5 text-red-700" />
                  </button>
                </div>
              )}
            </div>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {editingId === method.id ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('seller.delivery_time')}
                    </label>
                    <input
                      type="text"
                      name="deliveryTime"
                      value={newMethod.deliveryTime}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('seller.available_regions')}
                    </label>
                    <input
                      type="text"
                      name="regions"
                      value={newMethod.regions}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      id={`enabled-${method.id}`}
                      name="enabled"
                      type="checkbox"
                      checked={newMethod.enabled}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor={`enabled-${method.id}`} className="ml-2 block text-sm text-gray-700">
                      {t('seller.enable_method')}
                    </label>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">{t('seller.delivery_time')}</h4>
                    <p className="mt-1 text-sm text-gray-900">{method.deliveryTime}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">{t('seller.available_regions')}</h4>
                    <div className="mt-1 flex flex-wrap">
                      {method.regions.map((region, idx) => (
                        <span key={idx} className="mr-2 mb-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {region}
                        </span>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShippingSettings;