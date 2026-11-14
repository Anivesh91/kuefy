import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('kuefy_token') || localStorage.getItem('queueless_token');
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';

    // If 401 occurs on an authenticated route (and not on normal login / register attempts)
    if (status === 401 && !url.includes('/auth/login') && !url.includes('/auth/register')) {
      try {
        localStorage.removeItem('kuefy_token');
        localStorage.removeItem('queueless_token');
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('kuefy:unauthorized'));

          // Auto-redirect if user is currently inside the owner portal
          const currentPath = window.location.pathname;
          if (
            currentPath.startsWith('/organization/') &&
            !currentPath.includes('/login') &&
            !currentPath.includes('/register')
          ) {
            window.location.href = '/organization/login?expired=true';
          }
        }
      } catch (storageErr) {
        console.warn('Session clearance warning:', storageErr);
      }
    }

    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred. Please try again.';
    const customError = new Error(message);
    customError.status = error.response?.status || 500;
    customError.errors = error.response?.data?.errors || [];
    return Promise.reject(customError);
  }
);

export default apiClient;
