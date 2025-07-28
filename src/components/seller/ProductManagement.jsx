// src/components/seller/ProductManagement.jsx
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from "@heroicons/react/24/solid";

const ProductManagement = () => {
  const { t } = useTranslation();
  const [products, setProducts] = useState([
    {
      id: "PRD-001",
      name: "Organic Rice - Grade A",
      category: "Agriculture",
      price: "24,500 MMK",
      stock: 124,
      status: "active"
    },
    {
      id: "PRD-002",
      name: "Handmade Bamboo Basket",
      category: "Handicrafts",
      price: "12,000 MMK",
      stock: 56,
      status: "active"
    },
    {
      id: "PRD-003",
      name: "Pure Honey - 500ml",
      category: "Food & Beverage",
      price: "8,500 MMK",
      stock: 0,
      status: "out_of_stock"
    },
    {
      id: "PRD-004",
      name: "Teak Wood Coffee Table",
      category: "Furniture",
      price: "245,000 MMK",
      stock: 3,
      status: "active"
    },
    {
      id: "PRD-005",
      name: "Traditional Longyi",
      category: "Textiles",
      price: "15,000 MMK",
      stock: 42,
      status: "draft"
    }
  ]);

  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

  const requestSort = key => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const getSortedProducts = () => {
    if (!sortConfig.key) return products;

    return [...products].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === "ascending" ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === "ascending" ? 1 : -1;
      }
      return 0;
    });
  };

  const sortedProducts = getSortedProducts();

  const getStatusColor = status => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "out_of_stock":
        return "bg-yellow-100 text-yellow-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "archived":
        return "bg-red-100 text-red-800";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {t("product.product_management")}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {t("product.manage_your_products")}
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            {t("product.add_product")}
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {t("product.id")}
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {t("product.name")}
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {t("product.category")}
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("price")}
                >
                  <div className="flex items-center">
                    {t("product.price")}
                    {sortConfig.key === "price" &&
                      (sortConfig.direction === "ascending"
                        ? <ArrowUpIcon className="ml-1 h-3 w-3" />
                        : <ArrowDownIcon className="ml-1 h-3 w-3" />)}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("stock")}
                >
                  <div className="flex items-center">
                    {t("product.stock")}
                    {sortConfig.key === "stock" &&
                      (sortConfig.direction === "ascending"
                        ? <ArrowUpIcon className="ml-1 h-3 w-3" />
                        : <ArrowDownIcon className="ml-1 h-3 w-3" />)}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {t("product.status")}
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {t("product.actions")}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedProducts.map(product =>
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {product.id}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="flex items-center">
                      <div className="bg-gray-200 border-2 border-dashed rounded-md w-10 h-10 mr-3" />
                      {product.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {product.price}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.stock}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        product.status
                      )}`}
                    >
                      {t(`product.${product.status}`)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button className="text-gray-500 hover:text-gray-700">
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      <button className="text-green-600 hover:text-green-900">
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductManagement;
