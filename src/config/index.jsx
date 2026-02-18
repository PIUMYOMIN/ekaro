// src/config/index.js
export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';
export const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL || '/storage';
export const DEFAULT_PLACEHOLDER = import.meta.env.VITE_DEFAULT_PRODUCT_IMAGE || '/placeholder-product.png';