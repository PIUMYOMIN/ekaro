// src/utils/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api/v1/", // Make sure this matches your Laravel server
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json"
  }
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
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;