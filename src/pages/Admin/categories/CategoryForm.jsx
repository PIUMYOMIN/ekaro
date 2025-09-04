// components/categories/CategoryForm.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../utils/api';

const CategoryForm = ({ category = null }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: category?.name || '',
    name_mm: category?.name_mm || '',
    description: category?.description || '',
    commission_rate: category?.commission_rate || '',
    parent_id: category?.parent_id || ''
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [error, setError] = useState('');

  // Fetch categories for parent selection
  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const response = await api.get('/admin/categories?parent_id=null');
        setCategories(response.data.data || []);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'commission_rate' ? value.replace(/[^0-9.]/g, '') : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        ...formData,
        parent_id: formData.parent_id || null,
        commission_rate: parseFloat(formData.commission_rate) || 0
      };

      if (category) {
        // Update existing category
        await api.put(`/admin/categories/${category.id}`, payload);
      } else {
        // Create new category
        await api.post('/admin/categories', payload);
      }
      navigate('/admin/categories');
    } catch (err) {
      // Handle validation errors from backend
      if (err.response?.data?.errors) {
        const errorMessages = Object.values(err.response.data.errors).flat();
        setError(errorMessages.join(', '));
      } else {
        setError(err.response?.data?.message || 'Something went wrong');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-6">
        {category ? 'Edit Category' : 'Create New Category'}
      </h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Category Name (English) *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border"
            placeholder="Enter category name in English"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="name_mm" className="block text-sm font-medium text-gray-700">
            Category Name (Myanmar)
          </label>
          <input
            type="text"
            id="name_mm"
            name="name_mm"
            value={formData.name_mm}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border"
            placeholder="Enter category name in Myanmar"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows="4"
            value={formData.description}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border"
            placeholder="Enter category description"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="commission_rate" className="block text-sm font-medium text-gray-700">
            Commission Rate (%) *
          </label>
          <input
            type="number"
            id="commission_rate"
            name="commission_rate"
            step="0.01"
            min="0"
            max="100"
            required
            value={formData.commission_rate}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border"
            placeholder="e.g. 12.5 for 12.5%"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="parent_id" className="block text-sm font-medium text-gray-700">
            Parent Category
          </label>
          <select
            id="parent_id"
            name="parent_id"
            value={formData.parent_id}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border"
          >
            <option value="">Select Parent Category (Optional)</option>
            {loadingCategories ? (
              <option disabled>Loading categories...</option>
            ) : (
              categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))
            )}
          </select>
          <p className="mt-1 text-sm text-gray-500">
            Leave empty to create a main category
          </p>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/admin')}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : (category ? 'Update Category' : 'Create Category')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CategoryForm;