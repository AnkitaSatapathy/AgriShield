/**
 * Application Constants
 * Contains all static data like states, crops, etc.
 */

// All 29 Indian States + Union Territories
export const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Jammu and Kashmir"
];

// States supported for risk prediction (24 states from model training)
export const RISK_PREDICTION_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Jammu And Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Punjab",
  "Sikkim",
  "Tamil Nadu",
  "Tripura",
  "Uttar Pradesh",
  "West Bengal"
];

// Comprehensive crop list (matches your Weather.jsx)
export const CROPS_LIST = [
  // Cereals
  "Rice", "Wheat", "Maize", "Barley", "Oats", "Sorghum",
  // Millets
  "Pearl Millet", "Finger Millet", "Foxtail Millet", "Little Millet", "Kodo Millet", "Barnyard Millet",
  // Cash Crops
  "Cotton", "Sugarcane", "Jute",
  // Oilseeds
  "Groundnut", "Soybean", "Sunflower", "Mustard", "Sesame", "Linseed", "Castor",
  // Pulses
  "Chickpea", "Pigeon Pea", "Green Gram", "Black Gram", "Lentil", "Field Pea",
  // Vegetables
  "Potato", "Onion", "Tomato", "Brinjal", "Chilli", "Capsicum", "Cabbage", 
  "Cauliflower", "Okra", "Carrot", "Radish", "Spinach",
  // Fruits
  "Banana", "Mango", "Apple", "Grapes", "Orange", "Papaya", "Pineapple", "Coconut",
  // Beverages & Others
  "Tea", "Coffee", "Rubber",
  // Spices
  "Turmeric", "Ginger", "Garlic", "Coriander", "Cumin", "Fenugreek", "Clove", 
  "Cardamom", "Arecanut"
];

// Weather condition thresholds
export const WEATHER_THRESHOLDS = {
  HEAVY_RAIN: 60,        // mm
  HIGH_TEMPERATURE: 35,  // °C
  HIGH_HUMIDITY: 85,     // %
  STRONG_WIND: 15,       // km/h
  LOW_TEMPERATURE: 10,   // °C
  EXTREME_HEAT: 40,      // °C
};

// Risk levels
export const RISK_LEVELS = {
  LOW: {
    label: "Low",
    color: "green",
    bgClass: "bg-green-100",
    textClass: "text-green-800",
    borderClass: "border-green-300"
  },
  MEDIUM: {
    label: "Medium",
    color: "yellow",
    bgClass: "bg-yellow-100",
    textClass: "text-yellow-800",
    borderClass: "border-yellow-300"
  },
  HIGH: {
    label: "High",
    color: "red",
    bgClass: "bg-red-100",
    textClass: "text-red-800",
    borderClass: "border-red-300"
  }
};

// Alert types
export const ALERT_TYPES = {
  WARNING: "warning",
  HEAT: "heat",
  HUMIDITY: "humidity",
  WIND: "wind",
  INFO: "info",
  FROST: "frost",
  DROUGHT: "drought"
};

// Weather icons mapping
export const WEATHER_ICONS = {
  "clear sky": "☀️",
  "few clouds": "🌤️",
  "scattered clouds": "⛅",
  "broken clouds": "☁️",
  "overcast clouds": "☁️",
  "shower rain": "🌧️",
  "rain": "🌧️",
  "light rain": "🌦️",
  "moderate rain": "🌧️",
  "heavy intensity rain": "⛈️",
  "thunderstorm": "⛈️",
  "snow": "❄️",
  "mist": "🌫️",
  "fog": "🌫️",
  "haze": "🌫️",
  "default": "🌤️"
};

// Day names
export const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000
};

// Error messages
export const ERROR_MESSAGES = {
  NO_WEATHER_DATA: "Unable to fetch weather data. Please check your location details.",
  NO_ADVISORY_DATA: "Unable to fetch advisory data. Please try again.",
  NETWORK_ERROR: "Network error. Please check your internet connection.",
  SERVER_ERROR: "Server error. Please try again later.",
  VALIDATION_ERROR: "Please fill in all required fields.",
  LOCATION_NOT_FOUND: "Location not found. Please check state and district names."
};

// Success messages
export const SUCCESS_MESSAGES = {
  WEATHER_FETCHED: "Weather data loaded successfully!",
  ADVISORY_FETCHED: "Advisory data loaded successfully!"
};

export default {
  INDIAN_STATES,
  CROPS_LIST,
  WEATHER_THRESHOLDS,
  RISK_LEVELS,
  ALERT_TYPES,
  WEATHER_ICONS,
  DAYS_OF_WEEK,
  API_CONFIG,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES
};