// src/utils/api.js - Simpler alternative
import axios from "axios";

const api = axios.create({
  baseURL: "https://b2bdb.piueducation.org/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request interceptor for auth token
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      
      // Check if we're already on login page to avoid redirect loops
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/login')) {
        // Use window.location.pathname for client-side routing compatible redirect
        window.location.pathname = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;