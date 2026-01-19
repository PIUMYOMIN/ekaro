import React, { useState } from "react";
import {
  BuildingStorefrontIcon,
  UsersIcon,
  BriefcaseIcon,
  TruckIcon,
  CurrencyDollarIcon,
  CubeIcon,
  ShieldCheckIcon,
  ChartBarIcon
} from "@heroicons/react/24/outline";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  XMarkIcon,
  ArrowPathIcon,
  ChevronUpIcon,
  ChevronDownIcon
} from "@heroicons/react/20/solid";

const BusinessTypeManagement = ({
  businessTypes,
  loading,
  error,
  refreshData,
  onDelete,
  onUpdate,
  onCreate
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [formData, setFormData] = useState({
    name_en: "",
    name_mm: "",
    slug_en: "",
    slug_mm: "",
    description_en: "",
    description_mm: "",
    requires_registration: false,
    requires_tax_document: false,
    requires_identity_document: false,
    requires_business_certificate: false,
    additional_requirements: "",
    is_active: true,
    sort_order: 0,
    icon: "BuildingStorefront",
    color: "#3b82f6"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Available icons for selection
  const availableIcons = [
    { value: "UserIcon", label: "Individual", icon: UsersIcon },
    { value: "BuildingStorefrontIcon", label: "Store", icon: BuildingStorefrontIcon },
    { value: "BriefcaseIcon", label: "Business", icon: BriefcaseIcon },
    { value: "TruckIcon", label: "Logistics", icon: TruckIcon },
    { value: "CurrencyDollarIcon", label: "Finance", icon: CurrencyDollarIcon },
    { value: "CubeIcon", label: "Products", icon: CubeIcon },
    { value: "ShieldCheckIcon", label: "Verified", icon: ShieldCheckIcon },
    { value: "ChartBarIcon", label: "Analytics", icon: ChartBarIcon }
  ];

  // Available colors for selection
  const availableColors = [
    { value: "#3b82f6", label: "Blue", bg: "bg-blue-500" },
    { value: "#10b981", label: "Green", bg: "bg-green-500" },
    { value: "#f59e0b", label: "Amber", bg: "bg-yellow-500" },
    { value: "#ef4444", label: "Red", bg: "bg-red-500" },
    { value: "#8b5cf6", label: "Purple", bg: "bg-purple-500" },
    { value: "#ec4899", label: "Pink", bg: "bg-pink-500" },
    { value: "#6366f1", label: "Indigo", bg: "bg-indigo-500" },
    { value: "#06b6d4", label: "Cyan", bg: "bg-cyan-500" }
  ];

  const handleOpenModal = (type = null) => {
    if (type) {
      setEditingType(type);
      setFormData({
        name_en: type.name_en || "",
        name_mm: type.name_mm || "",
        slug_en: type.slug_en || "",
        slug_mm: type.slug_mm || "",
        description_en: type.description_en || "",
        description_mm: type.description_mm || "",
        requires_registration: type.requires_registration || false,
        requires_tax_document: type.requires_tax_document || false,
        requires_identity_document: type.requires_identity_document || false,
        requires_business_certificate: type.requires_business_certificate || false,
        additional_requirements: type.additional_requirements ?
          JSON.stringify(type.additional_requirements, null, 2) : "",
        is_active: type.is_active !== undefined ? type.is_active : true,
        sort_order: type.sort_order || 0,
        icon: type.icon || "BuildingStorefront",
        color: type.color || "#3b82f6"
      });
    } else {
      setEditingType(null);
      setFormData({
        name_en: "",
        name_mm: "",
        slug_en: "",
        slug_mm: "",
        description_en: "",
        description_mm: "",
        requires_registration: false,
        requires_tax_document: false,
        requires_identity_document: false,
        requires_business_certificate: false,
        additional_requirements: "",
        is_active: true,
        sort_order: 0,
        icon: "BuildingStorefront",
        color: "#3b82f6"
      });
    }
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingType(null);
    setFormErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name_en.trim()) {
      errors.name_en = "English name is required";
    }

    if (!formData.slug_en.trim()) {
      errors.slug_en = "English slug is required";
    } else if (!/^[a-z0-9-]+$/.test(formData.slug_en)) {
      errors.slug_en = "Slug can only contain lowercase letters, numbers, and hyphens";
    }

    // Validate JSON if additional_requirements is provided
    if (formData.additional_requirements.trim()) {
      try {
        JSON.parse(formData.additional_requirements);
      } catch (e) {
        errors.additional_requirements = "Must be valid JSON format";
      }
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setFormErrors({});

    try {
      const dataToSubmit = {
        ...formData,
        additional_requirements: formData.additional_requirements.trim()
          ? JSON.parse(formData.additional_requirements)
          : []
      };

      if (editingType) {
        await onUpdate(editingType.id, dataToSubmit);
      } else {
        await onCreate(dataToSubmit);
      }

      handleCloseModal();
      if (refreshData) refreshData();
    } catch (error) {
      console.error("Failed to save business type:", error);
      setFormErrors({ submit: error.response?.data?.message || "Failed to save business type" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this business type?")) {
      try {
        await onDelete(id);
        if (refreshData) refreshData();
      } catch (error) {
        alert(error.response?.data?.message || "Failed to delete business type");
      }
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await onUpdate(id, { is_active: !currentStatus });
      if (refreshData) refreshData();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update status");
    }
  };

  // Filter business types based on search
  const filteredBusinessTypes = businessTypes.filter(type =>
    type.name_en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    type.name_mm?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    type.slug_en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    type.description_en?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sorting function
  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Sort and paginate data
  const processedData = React.useMemo(() => {
    let filteredData = Array.isArray(filteredBusinessTypes) ? filteredBusinessTypes : [];

    if (sortConfig.key) {
      filteredData = [...filteredData].sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    return filteredData;
  }, [filteredBusinessTypes, sortConfig]);

  const totalPages = Math.ceil(processedData.length / itemsPerPage);
  const paginatedData = processedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Table headers
  const tableHeaders = [
    { key: "icon", label: "Icon" },
    { key: "name_en", label: "Name (EN)" },
    { key: "name_mm", label: "Name (MM)" },
    { key: "description_en", label: "Description (EN)" },
    { key: "requirements", label: "Document Requirements" },
    { key: "is_active", label: "Status" },
    { key: "sort_order", label: "Sort Order" },
    { key: "actions", label: "Actions" }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-blue-600">
            {businessTypes.length}
          </div>
          <div className="text-sm text-gray-500">Total Business Types</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-green-600">
            {businessTypes.filter(t => t.is_active).length}
          </div>
          <div className="text-sm text-gray-500">Active Types</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-yellow-600">
            {businessTypes.filter(t => t.requires_tax_document).length}
          </div>
          <div className="text-sm text-gray-500">Require Tax Docs</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-purple-600">
            {businessTypes.filter(t => t.requires_business_certificate).length}
          </div>
          <div className="text-sm text-gray-500">Require Business Cert</div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              Business Type Management
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Manage business types for seller onboarding
            </p>
          </div>
          <div className="flex space-x-3">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search business types..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={refreshData}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <ArrowPathIcon className="h-4 w-4 mr-2" />
              Refresh
            </button>
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Business Type
            </button>
          </div>
        </div>

        {loading && (
          <div className="p-8 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        {error && (
          <div className="p-4 text-red-500 bg-red-50">
            Error: {error.message}
          </div>
        )}

        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {tableHeaders.map((header) => (
                    <th
                      key={header.key}
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => header.key !== "actions" && requestSort(header.key)}
                    >
                      <div className="flex items-center">
                        {header.label}
                        {sortConfig.key === header.key && (
                          <span className="ml-1">
                            {sortConfig.direction === "asc" ? (
                              <ChevronUpIcon className="h-4 w-4" />
                            ) : (
                              <ChevronDownIcon className="h-4 w-4" />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedData.length > 0 ? (
                  paginatedData.map((businessType) => {
                    const iconConfig = availableIcons.find(icon => icon.value === businessType.icon);
                    const IconComponent = iconConfig ? iconConfig.icon : BuildingStorefrontIcon;

                    return (
                      <tr key={businessType.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div
                            className="h-10 w-10 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: `${businessType.color}20` }}
                          >
                            <IconComponent className="h-6 w-6" style={{ color: businessType.color }} />
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="font-medium text-gray-900">{businessType.name_en}</div>
                            <div className="text-sm text-gray-500">{businessType.slug_en}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="font-medium text-gray-900">{businessType.name_mm || "-"}</div>
                            <div className="text-sm text-gray-500">{businessType.slug_mm || "-"}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="max-w-xs truncate">{businessType.description_en || "-"}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1">
                            {businessType.requires_registration && (
                              <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded mr-1">
                                Registration
                              </span>
                            )}
                            {businessType.requires_tax_document && (
                              <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded mr-1">
                                Tax Doc
                              </span>
                            )}
                            {businessType.requires_identity_document && (
                              <span className="inline-block px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded mr-1">
                                ID Doc
                              </span>
                            )}
                            {businessType.requires_business_certificate && (
                              <span className="inline-block px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded mr-1">
                                Business Cert
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleToggleStatus(businessType.id, businessType.is_active)}
                            className={`px-3 py-1 rounded-full text-xs font-medium ${businessType.is_active
                              ? "bg-green-100 text-green-800 hover:bg-green-200"
                              : "bg-red-100 text-red-800 hover:bg-red-200"
                              }`}
                          >
                            {businessType.is_active ? "Active" : "Inactive"}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 bg-gray-100 rounded text-sm">
                            {businessType.sort_order}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleOpenModal(businessType)}
                              className="text-indigo-600 hover:text-indigo-900"
                              title="Edit"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(businessType.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={tableHeaders.length} className="px-6 py-4 text-center text-sm text-gray-500">
                      {businessTypes.length === 0 ? "No business types available" : "No matching records found"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Showing{" "}
                  <span className="font-medium">
                    {(currentPage - 1) * itemsPerPage + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(currentPage * itemsPerPage, processedData.length)}
                  </span>{" "}
                  of <span className="font-medium">{processedData.length}</span>{" "}
                  results
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded-md border border-gray-300 text-sm font-medium disabled:opacity-50 hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded-md border border-gray-300 text-sm font-medium disabled:opacity-50 hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">
                {editingType ? "Edit Business Type" : "Add New Business Type"}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {formErrors.submit && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{formErrors.submit}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* English Information */}
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-700 border-b pb-2">English</h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name (EN) *
                    </label>
                    <input
                      type="text"
                      name="name_en"
                      value={formData.name_en}
                      onChange={handleInputChange}
                      className={`w-full border ${formErrors.name_en ? 'border-red-300' : 'border-gray-300'} rounded-md px-3 py-2`}
                      placeholder="e.g., Individual Seller"
                    />
                    {formErrors.name_en && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.name_en}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Slug (EN) *
                    </label>
                    <input
                      type="text"
                      name="slug_en"
                      value={formData.slug_en}
                      onChange={handleInputChange}
                      className={`w-full border ${formErrors.slug_en ? 'border-red-300' : 'border-gray-300'} rounded-md px-3 py-2`}
                      placeholder="e.g., individual-seller"
                    />
                    {formErrors.slug_en && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.slug_en}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description (EN)
                    </label>
                    <textarea
                      name="description_en"
                      value={formData.description_en}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="English description of this business type..."
                    />
                  </div>
                </div>

                {/* Myanmar Information */}
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-700 border-b pb-2">Myanmar (မြန်မာ)</h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name (MM)
                    </label>
                    <input
                      type="text"
                      name="name_mm"
                      value={formData.name_mm}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="e.g., တစ်ဦးတည်းရောင်းချသူ"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Slug (MM)
                    </label>
                    <input
                      type="text"
                      name="slug_mm"
                      value={formData.slug_mm}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="e.g., တစ်ဦးတည်းရောင်းချသူ"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description (MM)
                    </label>
                    <textarea
                      name="description_mm"
                      value={formData.description_mm}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="မြန်မာဘာသာဖြင့် ဖော်ပြချက်..."
                    />
                  </div>
                </div>
              </div>

              {/* Document Requirements & Other Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Document Requirements */}
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-700 border-b pb-2">Document Requirements</h4>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="requires_registration"
                        checked={formData.requires_registration}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Requires Business Registration</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="requires_tax_document"
                        checked={formData.requires_tax_document}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Requires Tax Document</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="requires_identity_document"
                        checked={formData.requires_identity_document}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Requires Identity Document</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="requires_business_certificate"
                        checked={formData.requires_business_certificate}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Requires Business Certificate</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sort Order
                    </label>
                    <input
                      type="number"
                      name="sort_order"
                      value={formData.sort_order}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      min="0"
                    />
                  </div>
                </div>

                {/* Visual Settings */}
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-700 border-b pb-2">Visual Settings</h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Icon
                    </label>
                    <select
                      name="icon"
                      value={formData.icon}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      {availableIcons.map(icon => (
                        <option key={icon.value} value={icon.value}>
                          {icon.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Color
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {availableColors.map(color => (
                        <button
                          key={color.value}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                          className={`h-8 w-8 rounded-full border-2 ${formData.color === color.value ? 'border-gray-900' : 'border-gray-300'}`}
                          style={{ backgroundColor: color.value }}
                          title={color.label}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="is_active"
                        checked={formData.is_active}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Active</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Additional Requirements (JSON) */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Requirements (JSON)
                </label>
                <textarea
                  name="additional_requirements"
                  value={formData.additional_requirements}
                  onChange={handleInputChange}
                  rows={4}
                  className={`w-full border ${formErrors.additional_requirements ? 'border-red-300' : 'border-gray-300'} rounded-md px-3 py-2 font-mono text-sm`}
                  placeholder='[{"name": "Example Requirement", "description": "Additional requirement description"}]'
                />
                {formErrors.additional_requirements && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.additional_requirements}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Enter additional requirements as a JSON array of objects with "name" and "description" fields
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : editingType ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessTypeManagement;