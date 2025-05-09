// src/utilities/setupAxios.js
import axios from 'axios';

// Setup axios interceptor to add auth token to requests
const setupAxiosInterceptors = (getToken) => {
  axios.interceptors.request.use(
    (config) => {
      // Add token to all requests except those explicitly marked
      if (config.skipAuth !== true) {
        const token = getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Handle 401 responses
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        // Handle unauthorized - could trigger refresh token or redirect to login
        console.warn('Authentication error: Unauthorized access');
      }
      return Promise.reject(error);
    }
  );
};

export default setupAxiosInterceptors;