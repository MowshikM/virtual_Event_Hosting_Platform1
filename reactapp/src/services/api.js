import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const API = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor to attach JWT token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor for centralized error normalization
API.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    let customMessage = 'An unexpected error occurred. Please try again.';

    if (error.response) {
      const { status, data } = error.response;

      if (data && typeof data === 'object') {
        if (data.message) {
          customMessage = data.message;
        } else if (data.errors && typeof data.errors === 'object') {
          // Spring validation errors map
          customMessage = Object.values(data.errors).join(', ');
        } else if (data.error) {
          customMessage = data.error;
        }
      }

      if (status === 401) {
        // Unauthorized
        if (!customMessage || customMessage.includes('unexpected')) {
          customMessage = 'Invalid credentials or session expired. Please log in again.';
        }
      } else if (status === 403) {
        // Forbidden
        if (!customMessage || customMessage.includes('unexpected')) {
          customMessage = 'You do not have permission to perform this action.';
        }
      } else if (status === 404) {
        if (!customMessage || customMessage.includes('unexpected')) {
          customMessage = 'The requested resource was not found.';
        }
      } else if (status === 409) {
        if (!customMessage || customMessage.includes('unexpected')) {
          customMessage = 'Conflict: this item or relationship already exists.';
        }
      } else if (status >= 500) {
        if (!customMessage || customMessage.includes('unexpected')) {
          customMessage = 'Server error. Please try again later.';
        }
      }
    } else if (error.request) {
      customMessage = 'Unable to connect to the server. Please check your network connection.';
    }

    const enhancedError = new Error(customMessage);
    enhancedError.status = error.response ? error.response.status : null;
    enhancedError.originalError = error;
    return Promise.reject(enhancedError);
  }
);

export default API;
