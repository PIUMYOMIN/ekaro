import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PhotoIcon,
  CloudArrowUpIcon,
  XMarkIcon,
  ArrowLeftIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import api from '../../../utils/api';

const CategoryForm = ({ category = null }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: category?.name || '',
    name_mm: category?.name_mm || '',
    image: category?.image || '',
    description: category?.description || '',
    commission_rate: category?.commission_rate || '',
    parent_id: category?.parent_id || ''
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  // Fetch categories for parent selection
  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const response = await api.get('/categories');
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type and size
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file (JPEG, PNG, GIF, SVG)');
        return;
      }
      
      if (file.size > 2 * 1024 * 1024) { // 2MB limit (matches Laravel validation)
        setError('Image size must be less than 2MB');
        return;
      }
      
      setError('');
      setImageFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          image: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      image: ''
    }));
    setImageFile(null);
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageChange({ target: { files: e.dataTransfer.files } });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();
      
      // Append all form fields
      formDataToSend.append('name', formData.name);
      formDataToSend.append('name_mm', formData.name_mm);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('commission_rate', parseFloat(formData.commission_rate) || 0);
      formDataToSend.append('parent_id', formData.parent_id || '');
      
      // Append image file if selected
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      } else if (formData.image && formData.image.startsWith('data:image')) {
        // If it's a base64 image from editing, send it as a string
        formDataToSend.append('image', formData.image);
      } else if (!formData.image) {
        // If image was removed, send empty string
        formDataToSend.append('image', '');
      }

      let response;
      if (category) {
        // Update existing category - use multipart form data
        response = await api.put(`/categories/${category.id}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        setSuccess('Category updated successfully!');
      } else {
        // Create new category - use multipart form data
        response = await api.post('/categories', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        setSuccess('Category created successfully!');
      }
      
      // Redirect after a short delay to show success message
      setTimeout(() => {
        navigate('/admin');
      }, 1500);
    } catch (err) {
      console.error('API Error:', err);
      
      // Handle validation errors from backend
      if (err.response?.data?.errors) {
        const errorMessages = Object.values(err.response.data.errors).flat();
        setError(errorMessages.join(', '));
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Function to render hierarchical category options
  const renderCategoryOptions = (categories, level = 0) => {
    return categories.map((cat) => (
      <React.Fragment key={cat.id}>
        <option 
          value={cat.id} 
          disabled={category && (cat.id === category.id || isDescendant(cat, category.id))}
          style={{ paddingLeft: `${level * 20}px` }}
        >
          {level > 0 ? '↳ ' : ''}{cat.name}
        </option>
        {cat.children && renderCategoryOptions(cat.children, level + 1)}
      </React.Fragment>
    ));
  };

  // Check if a category is a descendant of another
  const isDescendant = (category, targetId) => {
    if (!category.children) return false;
    if (category.children.some(child => child.id === targetId)) return true;
    return category.children.some(child => isDescendant(child, targetId));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate('/admin')}
          className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-1" />
          Back
        </button>
        <h2 className="text-2xl font-bold text-gray-900">
          {category ? 'Edit Category' : 'Create New Category'}
        </h2>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
            <div className="flex items-center">
              <XMarkIcon className="h-5 w-5 mr-2" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg border border-green-200">
            <div className="flex items-center">
              <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>{success}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Category Name (English) *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="e.g. Electronics"
              />
            </div>

            <div>
              <label htmlFor="name_mm" className="block text-sm font-medium text-gray-700 mb-2">
                Category Name (Myanmar)
              </label>
              <input
                type="text"
                id="name_mm"
                name="name_mm"
                value={formData.name_mm}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="e.g. အီလက်ထရောနစ်"
              />
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows="3"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Describe this category..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="commission_rate" className="block text-sm font-medium text-gray-700 mb-2">
                Commission Rate (%) *
              </label>
              <div className="relative">
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="e.g. 12.5"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <span className="text-gray-500">%</span>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="parent_id" className="block text-sm font-medium text-gray-700 mb-2">
                Parent Category
              </label>
              <select
                id="parent_id"
                name="parent_id"
                value={formData.parent_id}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Select Parent Category (Optional)</option>
                {loadingCategories ? (
                  <option disabled>Loading categories...</option>
                ) : (
                  renderCategoryOptions(categories)
                )}
              </select>
              <p className="mt-2 text-sm text-gray-500">
                Leave empty to create a main category
              </p>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category Image
            </label>
            <div
              className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragActive 
                  ? 'border-green-500 bg-green-50' 
                  : formData.image 
                    ? 'border-gray-300' 
                    : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {formData.image ? (
                <>
                  <div className="relative inline-block">
                    <img
                      src={formData.image}
                      alt="Category preview"
                      className="h-40 w-40 object-cover rounded-lg mx-auto"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    Click the image to change or drag a new one
                  </p>
                </>
              ) : (
                <>
                  <div className="flex flex-col items-center justify-center">
                    <CloudArrowUpIcon className="h-12 w-12 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">
                      <span className="font-medium text-green-600">Upload an image</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      PNG, JPG, GIF up to 2MB
                    </p>
                  </div>
                </>
              )}
              
              <input
                type="file"
                id="image-input"
                name="image"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {category ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                category ? 'Update Category' : 'Create Category'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryForm;