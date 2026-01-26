/**
 * Weather API Service
 * Handles all API calls to the AgriShield backend for weather data
 */

import axios from 'axios';

// API Base URL - Change this if your backend runs on a different port
const API_BASE_URL = 'http://localhost:8000';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Request interceptor for debugging
apiClient.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

/**
 * Weather API Service Object
 */
const weatherApi = {
  /**
   * Get complete weather data (current + forecast + advisory)
   * This is the main endpoint used by Weather.jsx
   * 
   * @param {string} state - State name
   * @param {string} district - District name
   * @param {string} crop - Crop name (optional)
   * @returns {Promise} Weather data response
   */
  getCompleteWeather: async (state, district, crop = null) => {
    try {
      const response = await apiClient.post('/api/weather/complete', {
        state,
        district,
        crop,
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get current weather only
   * 
   * @param {string} state - State name
   * @param {string} district - District name
   * @returns {Promise} Current weather data
   */
  getCurrentWeather: async (state, district) => {
    try {
      const response = await apiClient.post('/api/weather', {
        state,
        district,
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get 7-day forecast only
   * 
   * @param {string} state - State name
   * @param {string} district - District name
   * @returns {Promise} Forecast data
   */
  getForecast: async (state, district) => {
    try {
      const response = await apiClient.post('/api/weather/forecast', {
        state,
        district,
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get crop advisory only
   * 
   * @param {string} crop - Crop name
   * @param {object} weatherConditions - Weather conditions object
   * @returns {Promise} Advisory data
   */
  getAdvisory: async (crop, weatherConditions) => {
    try {
      const response = await apiClient.post('/api/advisory', {
        crop,
        weather_conditions: weatherConditions,
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get list of available crops
   * 
   * @returns {Promise} List of crops
   */
  getCrops: async () => {
    try {
      const response = await apiClient.get('/api/crops');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get list of available states
   * 
   * @returns {Promise} List of states
   */
  getStates: async () => {
    try {
      const response = await apiClient.get('/api/states');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Health check
   * 
   * @returns {Promise} Health status
   */
  healthCheck: async () => {
    try {
      const response = await apiClient.get('/api/health');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};

/**
 * Handle API errors and format them consistently
 * 
 * @param {Error} error - Axios error object
 * @returns {Error} Formatted error
 */
const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    const message = error.response.data?.detail || error.response.data?.message || 'Server error occurred';
    const formattedError = new Error(message);
    formattedError.status = error.response.status;
    formattedError.data = error.response.data;
    return formattedError;
  } else if (error.request) {
    // Request made but no response
    const formattedError = new Error('Unable to connect to server. Please check if the backend is running.');
    formattedError.status = 0;
    return formattedError;
  } else {
    // Error in request setup
    return new Error(error.message || 'An unexpected error occurred');
  }
};

export default weatherApi;