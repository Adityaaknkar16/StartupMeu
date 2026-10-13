import axios from 'axios';
import { MESSAGES } from '../constants/messages';

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';

const axiosClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 15000
});

// Request Interceptor: Attach JWT Bearer token
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('flowdeck_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Standardize error format and handle session expiration
axiosClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (!error.response) {
      // Network failure / server offline
      const networkError = {
        success: false,
        message: MESSAGES.SYSTEM.SERVER_ERROR,
        code: 'NETWORK_ERROR',
        errors: []
      };
      return Promise.reject(networkError);
    }

    const { status, data } = error.response;

    // Check if session expired or unauthorized
    if (status === 401) {
      const isExpired = data?.code === 'TOKEN_EXPIRED';
      const eventName = isExpired ? 'flowdeck:session-expired' : 'flowdeck:unauthorized';
      window.dispatchEvent(new CustomEvent(eventName, { detail: data }));
    }

    // Return backend error payload structure
    const formattedError = {
      success: false,
      status,
      message: data?.message || MESSAGES.SYSTEM.INTERNAL_ERROR,
      code: data?.code || 'UNKNOWN_ERROR',
      errors: data?.errors || []
    };

    return Promise.reject(formattedError);
  }
);

export default axiosClient;
