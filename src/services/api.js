import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach JWT Authorization token if present in localStorage
API.interceptors.request.use(
  (config) => {
    let token;
    if (window.location.pathname.startsWith('/rider')) {
      token = localStorage.getItem('rider_token') || localStorage.getItem('solvix_token');
    } else {
      token = localStorage.getItem('solvix_token') || localStorage.getItem('rider_token');
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercept expired or invalid tokens and force logout
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('solvix_token');
      localStorage.removeItem('solvix_admin');
      localStorage.removeItem('solvix_admin_role');
      localStorage.removeItem('rider_token');
      localStorage.removeItem('rider_info');
      
      // Auto-redirect if in a protected portal and not already on the login page
      if ((window.location.pathname.startsWith('/admin') || window.location.pathname.startsWith('/rider')) && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default API;
