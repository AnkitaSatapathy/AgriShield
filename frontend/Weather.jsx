import React, { useState, useEffect } from "react";
import { Cloud, Leaf, AlertTriangle, Droplets, Thermometer, Wind, MapPin, Search, AlertCircle, CheckCircle, Info, Eye, BookOpen, ChevronRight, Sprout, Shield, Activity, Loader2 } from "lucide-react";
import weatherApi from "./services/weatherApi";
import { INDIAN_STATES, CROPS_LIST, DISTRICTS_BY_STATE, WEATHER_THRESHOLDS, RISK_LEVELS, ALERT_TYPES, WEATHER_ICONS, DAYS_OF_WEEK, API_CONFIG, ERROR_MESSAGES, SUCCESS_MESSAGES } from "./utils/weatherConstants";

const Weather = () => {
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [crop, setCrop] = useState("");
  const [weatherFetched, setWeatherFetched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // State for API data
  const [currentWeather, setCurrentWeather] = useState(null);
  const [weeklyForecast, setWeeklyForecast] = useState([]);
  const [cropAdvisory, setCropAdvisory] = useState(null);

  const handleSearch = async () => {
    if (!state || !district) {
      alert("Please select both State and District");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Call the complete weather API
      const response = await weatherApi.getCompleteWeather(state, district, crop || null);
      
      if (response.success) {
        // Set current weather
        setCurrentWeather(response.data?.current_weather || null);
        
        // Set forecast
        setWeeklyForecast(response.data?.forecast || []);
        
        // Set advisory if crop is selected
        if (crop && response.data?.advisory) {
          setCropAdvisory(response.data.advisory);
        } else {
          setCropAdvisory(null);
        }
        
        setWeatherFetched(true);
      } else {
        setError("Failed to fetch weather data. Please try again.");
      }
    } catch (err) {
      console.error("Weather fetch error:", err);
      const errorMessage = err?.message || err?.response?.data?.detail || "Unable to fetch weather data. Please check if backend is running.";
      setError(errorMessage);
      setWeatherFetched(false);
      // Reset data on error
      setCurrentWeather(null);
      setWeeklyForecast([]);
      setCropAdvisory(null);
    } finally {
      setLoading(false);
    }
  };

  // Generate weather alerts based on current conditions
  const generateAlerts = () => {
    if (!currentWeather) return [];
    
    const alerts = [];
    
    if (currentWeather.rainfall > 60) {
      alerts.push({
        type: "warning",
        title: "Heavy Rain Warning",
        description: "Delay pesticide spraying and ensure proper drainage. Risk of waterlogging.",
        icon: AlertTriangle,
        color: "red"
      });
    }
    
    if (currentWeather.temperature > 35) {
      alerts.push({
        type: "heat",
        title: "Heat Stress Alert",
        description: "High temperature detected. Increase irrigation frequency and provide shade if needed.",
        icon: Thermometer,
        color: "orange"
      });
    }

    if (currentWeather.humidity > 85) {
      alerts.push({
        type: "humidity",
        title: "High Humidity Alert",
        description: "Ideal conditions for fungal diseases. Apply preventive fungicide treatment.",
        icon: AlertCircle,
        color: "yellow"
      });
    }

    if (currentWeather.wind_speed > 15) {
      alerts.push({
        type: "wind",
        title: "Strong Wind Alert",
        description: "Do not conduct any spraying operations. Avoid mechanical operations.",
        icon: Wind,
        color: "blue"
      });
    }

    return alerts.length > 0 ? alerts : [
      {
        type: "info",
        title: "Favorable Conditions",
        description: "Current weather conditions are suitable for farming operations.",
        icon: CheckCircle,
        color: "green"
      }
    ];
  };

  const weatherAlerts = currentWeather ? generateAlerts() : [];

// Format advisory data from API
const formatAdvisoryData = () => {
  if (!cropAdvisory || !cropAdvisory.guidance) {
    // Fallback: Process advisories list
    const advisories = cropAdvisory.advisories;
    const riskLevel = cropAdvisory.risk_level || "Low";

    const grouped = {
      irrigation: new Set(),
      sowing: new Set(),
      spraying: new Set(),
      harvesting: new Set(),
      general: new Set()
    };

    advisories.forEach(adv => {
      const actionType = adv.action_type || 'general';
      const message = adv.advisory_message || adv.message || '';
      
      if (!message) return; // Skip empty messages
      
      if (actionType.includes('irrigation') || actionType.includes('water')) {
        grouped.irrigation.add(message);
      } else if (actionType.includes('sowing') || actionType.includes('planting')) {
        grouped.sowing.add(message);
      } else if (actionType.includes('spray') || actionType.includes('pesticide')) {
        grouped.spraying.add(message);
      } else if (actionType.includes('harvest')) {
        grouped.harvesting.add(message);
      } else {
        grouped.general.add(message);
      }
    });

    return {
      risk: riskLevel,
      advisory: Array.from(grouped.general).join(' ') || `Monitor ${crop} regularly for weather-related stress.`,
      irrigation: Array.from(grouped.irrigation).join(' ') || `Adjust irrigation schedule for ${crop} based on rainfall and soil moisture.`,
      sowing: Array.from(grouped.sowing).join(' ') || `Follow optimal planting time for ${crop} in your region.`,
      spraying: Array.from(grouped.spraying).join(' ') || `Apply crop protection chemicals during favorable weather conditions.`,
      harvesting: Array.from(grouped.harvesting).join(' ') || `Harvest ${crop} at proper maturity stage.`
    };
  }

  const guidance = cropAdvisory.guidance;
  
  return {
    risk: cropAdvisory.risk_level || "Low",
    advisory: guidance.general || [],
    irrigation: guidance.irrigation || [],
    sowing: guidance.sowing || [],
    spraying: guidance.spraying || [],
    harvesting: guidance.harvesting || []
  };
};

  const formattedAdvisory = cropAdvisory ? formatAdvisoryData() : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-50">
      {/* Hero Section */}
      <div 
        className="relative bg-cover bg-center py-6 px-4"
        style={{
          backgroundImage: 'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(https://tribe.article-14.com/uploads/2024/08-August/01-Thu/lg/farm_66aafafdc4b60.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-4 rounded-2xl animate-pulse">
              <Cloud className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white drop-shadow-lg">
              Weather Forecast & Crop Advisory
            </h1>
          </div>
          <p className="text-xl text-gray-200 max-w-3xl mx-auto">
            Real-time weather updates and crop-specific agricultural advisories to help you plan irrigation, sowing, spraying, and harvesting decisions
          </p>

          {/* Feature Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 hover:bg-white/20 transition transform hover:scale-105 text-center">
              <Thermometer className="w-8 h-8 text-red-300 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">Real-time</div>
              <div className="text-sm text-gray-200">Weather Data</div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 hover:bg-white/20 transition transform hover:scale-105 text-center">
              <Sprout className="w-8 h-8 text-green-300 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">60+</div>
              <div className="text-sm text-gray-200">Crop Types</div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 hover:bg-white/20 transition transform hover:scale-105 text-center">
              <AlertCircle className="w-8 h-8 text-yellow-300 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">Smart</div>
              <div className="text-sm text-gray-200">Alerts</div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 hover:bg-white/20 transition transform hover:scale-105 text-center">
              <Activity className="w-8 h-8 text-blue-300 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">7-Day</div>
              <div className="text-sm text-gray-200">Forecast</div>
            </div>

          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        
        {/* Understanding Weather Patterns Section */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl shadow-2xl p-8 mb-12 text-white">
          <h2 className="text-3xl font-bold mb-6 flex items-center">
            <Eye className="w-8 h-8 mr-3" />
            Understanding Weather Patterns for Agriculture
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Temperature Impact",
                desc: "Affects crop growth rate, pest activity, and disease spread. Each crop has optimal temperature range (15-35°C for most crops).",
                icon: "🌡️"
              },
              {
                title: "Rainfall & Irrigation",
                desc: "Critical for crop development. Heavy rainfall (>60mm) may cause waterlogging. Monitor to optimize irrigation scheduling.",
                icon: "💧"
              },
              {
                title: "Humidity & Diseases",
                desc: "High humidity (>85%) creates favorable conditions for fungal diseases. Early morning spraying recommended when humidity is lower.",
                icon: "🌫️"
              },
              {
                title: "Wind Conditions",
                desc: "Strong winds (>15 km/h) affect pesticide application, pollination, and can cause physical damage to crops.",
                icon: "💨"
              }
            ].map((item, idx) => (
              <div key={idx} className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:border-white/40 transition">
                <div className="text-4xl mb-3">{item.icon}</div>
                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-gray-100 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Input Section */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-12 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Search className="w-6 h-6 mr-3 text-blue-600" />
            Get Weather & Advisory Information
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* State Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                <MapPin className="w-4 h-4 inline mr-2" />
                Select State
              </label>
              <select
                value={state}
                onChange={(e) => {
                  setState(e.target.value);
                  setDistrict(""); // Reset district when state changes
                }}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none transition bg-gray-50 hover:bg-white"
              >
                <option value="">Choose State...</option>
                {INDIAN_STATES.map((stateName) => (
                  <option key={stateName} value={stateName}>{stateName}</option>
                ))}
              </select>
            </div>

            {/* District Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                <MapPin className="w-4 h-4 inline mr-2" />
                Select City
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                disabled={!state}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none transition bg-gray-50 hover:bg-white disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500"
              >
                <option value="">
                  {!state ? "Select State First..." : "Choose City..."}
                </option>
                {state && DISTRICTS_BY_STATE[state] && DISTRICTS_BY_STATE[state].map((districtName) => (
                  <option key={districtName} value={districtName}>{districtName}</option>
                ))}
              </select>
            </div>

            {/* Crop Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                <Leaf className="w-4 h-4 inline mr-2" />
                Select Crop
              </label>
              <select
                value={crop}
                onChange={(e) => setCrop(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none transition bg-gray-50 hover:bg-white"
              >
                <option value="">Choose a crop...</option>
                {CROPS_LIST.map((cropName) => (
                  <option key={cropName} value={cropName}>{cropName}</option>
                ))}
              </select>
            </div>

            {/* Search Button */}
            <div className="flex items-end">
              <button 
                onClick={handleSearch}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 px-4 rounded-xl hover:from-blue-700 hover:to-cyan-700 transition font-semibold shadow-lg transform hover:scale-105 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Loading...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    <span>Get Weather</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-red-800">Error</h4>
                  <p className="text-sm text-red-700">{error}</p>
                  <p className="text-xs text-red-600 mt-1">Make sure the backend server is running on http://localhost:8000</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Output Section - Current Weather */}
        {weatherFetched && currentWeather && (
          <>
            <div className="bg-white rounded-3xl shadow-2xl p-8 mb-12 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Thermometer className="w-6 h-6 mr-3 text-red-600" />
                Current Weather Conditions
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
                {[
                  { icon: Thermometer, label: "Temperature", value: `${currentWeather?.temperature || 'N/A'}°C`, unit: "Feels like " + (currentWeather?.feels_like || currentWeather?.temperature || 'N/A') + "°C", gradient: "from-red-500 to-orange-500" },
                  { icon: Droplets, label: "Rainfall", value: `${currentWeather?.rainfall || 0} mm`, unit: "Last 24 hours", gradient: "from-blue-500 to-cyan-500" },
                  { icon: Cloud, label: "Humidity", value: `${currentWeather?.humidity || 'N/A'}%`, unit: "Relative", gradient: "from-indigo-500 to-blue-500" },
                  { icon: Wind, label: "Wind Speed", value: `${currentWeather?.wind_speed || 'N/A'} km/h`, unit: "Current", gradient: "from-teal-500 to-green-500" },
                  { icon: Cloud, label: "Cloud Cover", value: `${currentWeather?.cloud_cover || 0}%`, unit: "Sky coverage", gradient: "from-gray-500 to-slate-500" },
                ].map((card, idx) => (
                  <div key={idx} className={`bg-gradient-to-br ${card.gradient} rounded-2xl p-4 text-white shadow-lg hover:shadow-xl transition transform hover:-translate-y-1`}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-xs opacity-90 mb-1">{card.label}</p>
                        <p className="text-2xl font-bold">{card.value}</p>
                      </div>
                      <card.icon className="w-8 h-8 opacity-30" />
                    </div>
                    <p className="text-xs opacity-75">{card.unit}</p>
                  </div>
                ))}
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-4 border border-blue-200">
                <p className="text-gray-800 flex items-start space-x-3">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Location:</strong> {district}, {state} | <strong>Condition:</strong> {currentWeather?.condition || 'N/A'}</span>
                </p>
              </div>
            </div>

            {/* 7-Day Forecast */}
            {weeklyForecast && weeklyForecast.length > 0 && (
              <div className="bg-white rounded-3xl shadow-2xl p-8 mb-12 border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <Cloud className="w-6 h-6 mr-3 text-blue-600" />
                  7-Day Weather Forecast
                </h2>
                
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                  {weeklyForecast.map((day, idx) => (
                    <div key={idx} className="bg-gradient-to-br from-sky-50 to-blue-50 border-2 border-sky-200 rounded-2xl p-4 text-center hover:shadow-lg transition transform hover:scale-105">
                      <h4 className="font-bold text-gray-900 mb-2">{day?.day || 'N/A'}</h4>
                      <div className="text-3xl mb-3">{day?.icon || '🌤️'}</div>
                      <p className="text-xs text-gray-600 font-semibold mb-2">{day?.condition || 'N/A'}</p>
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-gray-600">High</p>
                          <p className="font-bold text-lg text-gray-900">{day?.temp_high || 'N/A'}°</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Low</p>
                          <p className="font-semibold text-gray-700">{day?.temp_low || 'N/A'}°</p>
                        </div>
                        <div className="bg-blue-100 rounded-lg px-2 py-1">
                          <p className="text-xs text-blue-900 font-semibold">💧 {day?.rainfall || 0}mm</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Active Weather Alerts */}
            <div className="bg-white rounded-3xl shadow-2xl p-8 mb-12 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <AlertTriangle className="w-6 h-6 mr-3 text-orange-600" />
                Active Weather Alerts & Warnings
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                {weatherAlerts.map((alert, idx) => (
                  <div key={idx} className={`border-l-4 bg-gradient-to-br rounded-xl p-6 hover:shadow-lg transition`}
                    style={{
                      borderLeftColor: alert.color === 'red' ? '#ef4444' : alert.color === 'yellow' ? '#eab308' : alert.color === 'orange' ? '#f97316' : alert.color === 'blue' ? '#3b82f6' : '#22c55e',
                      background: alert.color === 'red' ? 'linear-gradient(to right, rgb(254, 242, 242), rgb(254, 226, 226))' : 
                                 alert.color === 'yellow' ? 'linear-gradient(to right, rgb(254, 252, 231), rgb(254, 248, 199))' :
                                 alert.color === 'orange' ? 'linear-gradient(to right, rgb(254, 245, 235), rgb(254, 231, 197))' :
                                 alert.color === 'blue' ? 'linear-gradient(to right, rgb(239, 246, 255), rgb(219, 234, 254))' :
                                 'linear-gradient(to right, rgb(240, 253, 244), rgb(220, 252, 231))'
                    }}>
                    <div className="flex items-start space-x-4">
                      <div style={{backgroundColor: alert.color === 'red' ? '#ef4444' : alert.color === 'yellow' ? '#eab308' : alert.color === 'orange' ? '#f97316' : alert.color === 'blue' ? '#3b82f6' : '#22c55e'}} className="p-3 rounded-full flex-shrink-0">
                        <alert.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-lg">{alert.title}</h3>
                        <p className="text-sm text-gray-700 mt-2">{alert.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Crop-Specific Advisory */}
            {crop && formattedAdvisory && (
              <div className="bg-white rounded-3xl shadow-2xl p-8 mb-12 border border-gray-100 animate-fade-in">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <BookOpen className="w-6 h-6 mr-3 text-green-600" />
                  {crop} - Weather-Based Advisory
                </h2>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  {/* Risk Level */}
                  <div className={`bg-gradient-to-br rounded-2xl p-6 border-2 ${formattedAdvisory.risk === 'High' ? 'from-red-50 to-red-100 border-red-300' : formattedAdvisory.risk === 'Medium' ? 'from-yellow-50 to-yellow-100 border-yellow-300' : 'from-green-50 to-green-100 border-green-300'}`}>
                    <div className="flex items-center space-x-4">
                      <AlertTriangle className={`w-10 h-10 ${formattedAdvisory.risk === 'High' ? 'text-red-600' : formattedAdvisory.risk === 'Medium' ? 'text-yellow-600' : 'text-green-600'}`} />
                      <div>
                        <h3 className="font-bold text-gray-900">Current Risk Level</h3>
                        <p className={`text-lg font-bold ${formattedAdvisory.risk === 'High' ? 'text-red-600' : formattedAdvisory.risk === 'Medium' ? 'text-yellow-600' : 'text-green-600'}`}>{formattedAdvisory.risk}</p>
                      </div>
                    </div>
                  </div>

                  {/* General Advisory */}
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border-2 border-blue-300">
                    <div className="flex items-start space-x-4">
                      <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="font-bold text-gray-900 mb-2">General Advisory</h3>
                        <p className="text-gray-700 text-sm">{formattedAdvisory.advisory}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Advisory Cards */}
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                {[
                  { title: "💧 Irrigation", content: formattedAdvisory.irrigation, color: "blue" },
                  { title: "🌱 Sowing", content: formattedAdvisory.sowing, color: "green" },
                  { title: "🚜 Spraying", content: formattedAdvisory.spraying, color: "yellow" },
                  { title: "🎯 Harvesting", content: formattedAdvisory.harvesting, color: "purple" }
                ].map((adv, idx) => (
                  <div key={idx} className={`bg-gradient-to-br rounded-2xl p-5 border-2`}
                    style={{
                      background: adv.color === 'blue' ? 'linear-gradient(to right, rgb(239, 246, 255), rgb(224, 242, 254))' :
                                adv.color === 'green' ? 'linear-gradient(to right, rgb(240, 253, 244), rgb(220, 252, 231))' :
                                adv.color === 'yellow' ? 'linear-gradient(to right, rgb(254, 252, 231), rgb(254, 248, 199))' :
                                'linear-gradient(to right, rgb(243, 232, 255), rgb(233, 213, 255))',
                      borderColor: adv.color === 'blue' ? '#3b82f6' : adv.color === 'green' ? '#22c55e' : adv.color === 'yellow' ? '#eab308' : '#a855f7'
                    }}>
                    <h4 className="font-bold text-gray-900 mb-3 text-lg">{adv.title}</h4>
                    {Array.isArray(adv.content) ? (
                      <ul className="space-y-2">
                        {adv.content.map((point, i) => (
                          <li key={i} className="flex items-start space-x-2">
                            <span className="text-gray-600 mt-1">•</span>
                            <span className="text-sm text-gray-700 leading-relaxed flex-1">{point}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-700 leading-relaxed">{adv.content}</p>
                    )}
                  </div>
                ))}
              </div>

                {/* Recommended Actions */}
                <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl p-6 border-l-4 border-green-600">
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                    Recommended Actions for Today
                  </h3>
                  <ul className="space-y-2 text-gray-800">
                    {formattedAdvisory.risk === 'High' ? (
                      <>
                        <li className="flex items-center space-x-3">
                          <span className="text-green-600 font-bold">✓</span>
                          <span>Monitor field conditions closely due to unfavorable weather</span>
                        </li>
                        <li className="flex items-center space-x-3">
                          <span className="text-green-600 font-bold">✓</span>
                          <span>Postpone any planned pesticide spraying</span>
                        </li>
                        <li className="flex items-center space-x-3">
                          <span className="text-green-600 font-bold">✓</span>
                          <span>Check drainage systems and clear if necessary</span>
                        </li>
                      </>
                    ) : (
                      <>
                        <li className="flex items-center space-x-3">
                          <span className="text-green-600 font-bold">✓</span>
                          <span>Weather conditions are favorable for operations</span>
                        </li>
                        <li className="flex items-center space-x-3">
                          <span className="text-green-600 font-bold">✓</span>
                          <span>Ideal time for irrigation or pesticide application</span>
                        </li>
                        <li className="flex items-center space-x-3">
                          <span className="text-green-600 font-bold">✓</span>
                          <span>Continue regular monitoring for pest and disease</span>
                        </li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            )}

          </>
        )}
      </div>
    </div>
  );
};

export default Weather;
