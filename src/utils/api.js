import axios from "axios";

const api = axios.create({
  baseURL: "https://api.pyonea.com/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
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
  response => {
    // Log successful responses for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log(`API Success [${response.config.method.toUpperCase()}] ${response.config.url}:`, response.data);
    }
    return response;
  },
  error => {
    // Log errors for debugging
    if (process.env.NODE_ENV === 'development') {
      console.error(`API Error [${error.config?.method?.toUpperCase() || 'GET'}] ${error.config?.url || 'unknown'}:`, {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
    }

    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      
      // Check if we're already on login page to avoid redirect loops
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/login') && !currentPath.includes('/register')) {
        // Use window.location.pathname for client-side routing compatible redirect
        window.location.pathname = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;