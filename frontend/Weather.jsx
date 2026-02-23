import React, { useState, useEffect } from "react";
import { Cloud, Leaf, AlertTriangle, Droplets, Thermometer, Wind, MapPin, Search, AlertCircle, CheckCircle, Info, Eye, BookOpen, ChevronRight, Sprout, Shield, Activity, Loader2, TrendingUp, TrendingDown, BarChart2, Calendar, History, Zap } from "lucide-react";
import weatherApi from "./services/weatherApi";
import { INDIAN_STATES, CROPS_LIST, DISTRICTS_BY_STATE, WEATHER_THRESHOLDS, RISK_LEVELS, ALERT_TYPES, WEATHER_ICONS, DAYS_OF_WEEK, API_CONFIG, ERROR_MESSAGES, SUCCESS_MESSAGES } from "./utils/weatherConstants";

const Weather = () => {
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [crop, setCrop] = useState("");
  const [weatherFetched, setWeatherFetched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("weather"); // "weather" | "seasonal"

  // State for current weather API data
  const [currentWeather, setCurrentWeather] = useState(null);
  const [weeklyForecast, setWeeklyForecast] = useState([]);
  const [cropAdvisory, setCropAdvisory] = useState(null);

  // State for seasonal analysis data
  const [seasonalData, setSeasonalData] = useState(null);
  const [seasonalLoading, setSeasonalLoading] = useState(false);
  const [seasonalError, setSeasonalError] = useState(null);

  const handleSearch = async () => {
    if (!state || !district) {
      alert("Please select both State and District");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await weatherApi.getCompleteWeather(state, district, crop || null);
      
      if (response.success) {
        setCurrentWeather(response.data?.current_weather || null);
        setWeeklyForecast(response.data?.forecast || []);
        if (crop && response.data?.advisory) {
          setCropAdvisory(response.data.advisory);
        } else {
          setCropAdvisory(null);
        }
        setWeatherFetched(true);
        setActiveTab("weather");
      } else {
        setError("Failed to fetch weather data. Please try again.");
      }
    } catch (err) {
      console.error("Weather fetch error:", err);
      const errorMessage = err?.message || err?.response?.data?.detail || "Unable to fetch weather data. Please check if backend is running.";
      setError(errorMessage);
      setWeatherFetched(false);
      setCurrentWeather(null);
      setWeeklyForecast([]);
      setCropAdvisory(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSeasonalAnalysis = async () => {
    if (!state || !district || !crop) {
      alert("Please select State, District, AND Crop to run Seasonal Analysis.");
      return;
    }
    setSeasonalLoading(true);
    setSeasonalError(null);
    setSeasonalData(null);
    setActiveTab("seasonal");

    try {
      const response = await fetch("http://localhost:8000/api/seasonal-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state, district, crop }),
      });
      const json = await response.json();
      if (json.success) {
        setSeasonalData(json.data);
      } else {
        setSeasonalError(json.detail || json.error || "Seasonal analysis failed.");
      }
    } catch (err) {
      console.error("Seasonal analysis error:", err);
      setSeasonalError("Could not connect to backend. Ensure the server is running on http://localhost:8000");
    } finally {
      setSeasonalLoading(false);
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

            {/* Action Buttons */}
            <div className="flex items-end gap-2">
              <button 
                onClick={handleSearch}
                disabled={loading}
                className="w-40 bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 px-3 rounded-xl hover:from-blue-700 hover:to-cyan-700 transition font-semibold shadow-lg transform hover:scale-105 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Loading...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Weather</span>
                  </>
                )}
              </button>
              <button
                onClick={handleSeasonalAnalysis}
                disabled={seasonalLoading}
                title="Get seasonal suitability analysis using 20-year historical data"
                className="flex-grow bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 px-3 rounded-xl hover:from-emerald-700 hover:to-teal-700 transition font-semibold shadow-lg transform hover:scale-105 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:scursor-not-allowed min-w-[12rem]"
              >
                {seasonalLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Analysing...</span>
                  </>
                ) : (
                  <>
                    <History className="w-4 h-4" />
                    <span>Season Analysis</span>
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

        {/* ── TAB SWITCHER ─────────────────────────────────────────── */}
        {(weatherFetched || seasonalData || seasonalLoading || seasonalError) && (
          <div className="flex gap-3 mb-8">
            <button
              onClick={() => setActiveTab("weather")}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold transition shadow-md ${activeTab === "weather" ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-blue-50"}`}
            >
              <Cloud className="w-5 h-5" /> Current Weather & Advisory
            </button>
            <button
              onClick={() => setActiveTab("seasonal")}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold transition shadow-md ${activeTab === "seasonal" ? "bg-emerald-600 text-white" : "bg-white text-gray-700 hover:bg-emerald-50"}`}
            >
              <History className="w-5 h-5" /> Seasonal Suitability Analysis
              {seasonalData && <span className="ml-1 bg-emerald-400 text-white text-xs px-2 py-0.5 rounded-full">NEW</span>}
            </button>
          </div>
        )}

        {/* ── SEASONAL ANALYSIS PANEL ──────────────────────────────── */}
        {activeTab === "seasonal" && (
          <div>
            {/* Loading */}
            {seasonalLoading && (
              <div className="bg-white rounded-3xl shadow-2xl p-12 text-center border border-gray-100 mb-8">
                <Loader2 className="w-16 h-16 animate-spin text-emerald-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Analysing 20 Years of Weather Data…</h3>
                <p className="text-gray-600">Fetching historical climate records, computing season averages, and scoring crop suitability. This may take 15–30 seconds.</p>
              </div>
            )}

            {/* Error */}
            {seasonalError && !seasonalLoading && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-8">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-red-800">Seasonal Analysis Error</h4>
                    <p className="text-sm text-red-700">{seasonalError}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Data */}
            {seasonalData && !seasonalLoading && (
              <>
                {/* ── SUITABILITY VERDICT CARD ── */}
                {seasonalData.crop_suitability && (
                  <div className={`rounded-3xl shadow-2xl p-8 mb-8 border-2 ${
                    seasonalData.crop_suitability.overall_score >= 75
                      ? "bg-gradient-to-br from-emerald-50 to-green-100 border-emerald-400"
                      : seasonalData.crop_suitability.overall_score >= 55
                      ? "bg-gradient-to-br from-yellow-50 to-amber-100 border-yellow-400"
                      : seasonalData.crop_suitability.overall_score >= 35
                      ? "bg-gradient-to-br from-orange-50 to-orange-100 border-orange-400"
                      : "bg-gradient-to-br from-red-50 to-red-100 border-red-400"
                  }`}>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <Shield className={`w-8 h-8 ${seasonalData.crop_suitability.overall_score >= 55 ? "text-emerald-600" : "text-red-600"}`} />
                          <div>
                            <h2 className="text-2xl font-bold text-gray-900">Is it suitable to grow <em>{crop}</em> RIGHT NOW?</h2>
                            <p className="text-sm text-gray-500 mt-0.5">
                              📍 {state} &nbsp;|&nbsp; 📅 Current conditions vs. historical baseline
                              {seasonalData.crop_suitability.season_label && (
                                <span> | 🌾 Normal season: <strong>{seasonalData.crop_suitability.season_label}</strong></span>
                              )}
                            </p>
                          </div>
                        </div>
                        <p className="text-3xl font-black mb-2" style={{color: seasonalData.crop_suitability.overall_score >= 75 ? "#059669" : seasonalData.crop_suitability.overall_score >= 55 ? "#d97706" : "#dc2626"}}>
                          {seasonalData.crop_suitability.verdict}
                        </p>
                        <p className="text-gray-700 leading-relaxed">{seasonalData.crop_suitability.summary}</p>
                        {seasonalData.crop_suitability.multi_cycle_possible && (
                          <div className="mt-3 inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl font-semibold text-sm">
                            <Zap className="w-4 h-4" /> Multiple Cultivation Cycles Recommended This Year!
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-center justify-center bg-white rounded-2xl p-6 shadow-inner min-w-[140px]">
                        <div className="text-6xl font-black mb-1" style={{color: seasonalData.crop_suitability.overall_score >= 75 ? "#059669" : seasonalData.crop_suitability.overall_score >= 55 ? "#d97706" : "#dc2626"}}>
                          {seasonalData.crop_suitability.overall_score}
                        </div>
                        <div className="text-gray-500 font-semibold text-sm">/ 100</div>
                        <div className="text-xs text-gray-400 mt-1">Suitability Score</div>
                        <div className="text-xs text-gray-400 mt-3 text-center leading-tight">
                          Based on<br/>current conditions
                        </div>
                      </div>
                    </div>
                    {/* Score legend */}
                    <div className="mt-4 grid grid-cols-4 gap-2 text-xs text-center">
                      {[
                        { range: "75–100", label: "Highly Suitable", color: "bg-emerald-100 text-emerald-800" },
                        { range: "55–74", label: "Proceed with Care", color: "bg-yellow-100 text-yellow-800" },
                        { range: "35–54", label: "Conditions Challenging", color: "bg-orange-100 text-orange-800" },
                        { range: "0–34", label: "Not Suitable Now", color: "bg-red-100 text-red-800" },
                      ].map((s, i) => (
                        <div key={i} className={`rounded-lg p-1.5 ${s.color}`}>
                          <div className="font-bold">{s.range}</div>
                          <div className="text-xs opacity-80">{s.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── DISASTER WARNINGS ── */}
                {seasonalData.disaster_warnings && seasonalData.disaster_warnings.length > 0 && (
                  <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8 border-l-8 border-red-500">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                      <AlertTriangle className="w-7 h-7 text-red-600" />
                      ⚠️ Historical Disaster & Hazard Warnings
                    </h2>
                    <p className="text-gray-600 mb-5 text-sm">Based on past 10+ years of data, the following recurring events have been detected for <strong>{state}</strong>:</p>
                    <div className="space-y-4">
                      {seasonalData.disaster_warnings.map((w, i) => (
                        <div key={i} className={`rounded-2xl p-5 border-2 ${w.severity === "high" ? "bg-red-50 border-red-300" : "bg-orange-50 border-orange-300"}`}>
                          <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-full flex-shrink-0 ${w.severity === "high" ? "bg-red-500" : "bg-orange-400"}`}>
                              <AlertTriangle className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="font-bold text-gray-900 text-lg">{w.event_type}</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${w.severity === "high" ? "bg-red-200 text-red-800" : "bg-orange-200 text-orange-800"}`}>{w.frequency.toUpperCase()} FREQUENCY</span>
                              </div>
                              <p className="text-gray-700 text-sm mb-2">{w.description}</p>
                              <div className="flex flex-wrap gap-3 text-xs">
                                <span className="bg-white rounded-lg px-3 py-1 border border-gray-200">
                                  📅 <strong>Risk months:</strong> {w.upcoming_risk_months.join(", ")}
                                </span>
                                <span className="bg-white rounded-lg px-3 py-1 border border-gray-200">
                                  📜 <strong>Recent hits:</strong> {w.last_occurrences.slice(0,4).join(", ")}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── KEY FACTORS ── */}
                {seasonalData.crop_suitability?.key_factors?.length > 0 && (
                  <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8 border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                      <Activity className="w-6 h-6 text-blue-600" />
                      Suitability Factor Breakdown
                    </h2>
                    <div className="grid md:grid-cols-2 gap-4">
                      {seasonalData.crop_suitability.key_factors.map((f, i) => (
                        <div key={i} className={`rounded-2xl p-5 border-2 ${
                          f.score_impact > 15 ? "bg-emerald-50 border-emerald-200" :
                          f.score_impact > 0  ? "bg-blue-50 border-blue-200" :
                          f.score_impact < 0  ? "bg-red-50 border-red-200" :
                          "bg-gray-50 border-gray-200"
                        }`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-gray-900 text-sm">{f.label}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                              f.score_impact > 0 ? "bg-green-100 text-green-800" :
                              f.score_impact < 0 ? "bg-red-100 text-red-800" :
                              "bg-gray-100 text-gray-600"
                            }`}>
                              {f.score_impact > 0 ? `+${f.score_impact} pts` : f.score_impact === 0 ? "neutral" : `${f.score_impact} pts`}
                            </span>
                          </div>
                          <div className="text-sm font-semibold mb-1">{f.status}</div>
                          {f.current_value && f.ideal_range && (
                            <div className="flex gap-3 mb-2 text-xs">
                              <span className="bg-white rounded-lg px-2 py-1 border border-gray-200">
                                <span className="text-gray-400">Now: </span>
                                <span className="font-semibold text-gray-800">{f.current_value}</span>
                              </span>
                              <span className="bg-white rounded-lg px-2 py-1 border border-gray-200">
                                <span className="text-gray-400">Ideal: </span>
                                <span className="font-semibold text-emerald-700">{f.ideal_range}</span>
                              </span>
                            </div>
                          )}
                          <p className="text-xs text-gray-600 leading-relaxed">{f.detail}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── SEASON vs HISTORY COMPARISON ── */}
                {seasonalData.season_comparison && !seasonalData.season_comparison.error && (
                  <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8 border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                      <BarChart2 className="w-6 h-6 text-indigo-600" />
                      Season vs. Historical Comparison
                    </h2>
                    <p className="text-gray-500 text-sm mb-6">
                      How does this year's <strong>{seasonalData.season_comparison.season_display || seasonalData.season_comparison.season_type}</strong> season 
                      ({seasonalData.season_comparison.season_window}) compare to the last decade?
                    </p>

                    {/* Summary stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      {[
                        { label: "This Season (so far)", value: `${seasonalData.season_comparison.current_year_rainfall_mm} mm`, icon: "🌧️", highlight: true },
                        { label: `${seasonalData.season_comparison.season_window} Avg (10yr)`, value: `${seasonalData.season_comparison.historical_avg_rainfall_mm} mm`, icon: "📊" },
                        { label: "10-yr High", value: `${seasonalData.season_comparison.historical_max_rainfall_mm} mm`, icon: "⬆️" },
                        { label: "10-yr Low", value: `${seasonalData.season_comparison.historical_min_rainfall_mm} mm`, icon: "⬇️" },
                      ].map((s, i) => (
                        <div key={i} className={`rounded-2xl p-4 text-center ${s.highlight ? "bg-indigo-600 text-white" : "bg-indigo-50 text-gray-900"}`}>
                          <div className="text-2xl mb-1">{s.icon}</div>
                          <div className={`text-xl font-bold ${s.highlight ? "text-white" : "text-indigo-700"}`}>{s.value}</div>
                          <div className={`text-xs ${s.highlight ? "text-indigo-200" : "text-gray-500"}`}>{s.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Verdict text */}
                    <div className={`rounded-xl p-4 border-l-4 mb-6 ${
                      seasonalData.season_comparison.rainfall_comparison === "above_average"
                        ? "bg-blue-50 border-blue-500"
                        : seasonalData.season_comparison.rainfall_comparison === "below_average"
                        ? "bg-orange-50 border-orange-500"
                        : "bg-green-50 border-green-500"
                    }`}>
                      <div className="flex items-center gap-2 mb-1">
                        {seasonalData.season_comparison.rainfall_comparison === "above_average"
                          ? <TrendingUp className="w-5 h-5 text-blue-600" />
                          : seasonalData.season_comparison.rainfall_comparison === "below_average"
                          ? <TrendingDown className="w-5 h-5 text-orange-600" />
                          : <CheckCircle className="w-5 h-5 text-green-600" />
                        }
                        <span className="font-bold text-gray-900 capitalize">
                          {seasonalData.season_comparison.rainfall_comparison.replace("_", " ")}
                        </span>
                        <span className="text-xs bg-white border border-gray-200 rounded-full px-2 py-0.5">
                          {seasonalData.season_comparison.percentile_rank}th percentile
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{seasonalData.season_comparison.verdict_text}</p>
                    </div>

                    {/* Bar chart - year over year */}
                    {seasonalData.season_comparison.yearly_data?.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-gray-700 mb-3 text-sm">Year-by-Year Seasonal Rainfall (mm)</h3>
                        <div className="flex items-end gap-1.5 h-40 bg-gray-50 rounded-xl p-3 overflow-x-auto">
                          {seasonalData.season_comparison.yearly_data.map((yr, i) => {
                            const maxRf = Math.max(...seasonalData.season_comparison.yearly_data.map(y => y.total_rainfall_mm || 0));
                            const pct = maxRf > 0 ? ((yr.total_rainfall_mm / maxRf) * 100) : 0;
                            const isCurrent = yr.is_current_year;
                            return (
                              <div key={i} className="flex flex-col items-center min-w-[38px]">
                                <div className="text-[9px] text-gray-600 mb-1 font-semibold">{yr.total_rainfall_mm}mm</div>
                                <div
                                  className={`w-7 rounded-t-md transition-all ${isCurrent ? "bg-indigo-600" : "bg-sky-300 hover:bg-sky-400"}`}
                                  style={{ height: `${Math.max(6, pct)}%`, minHeight: "6px" }}
                                  title={`${yr.year}: ${yr.total_rainfall_mm}mm`}
                                />
                                <div className={`text-[9px] mt-1 font-bold ${isCurrent ? "text-indigo-700" : "text-gray-500"}`}>
                                  {isCurrent ? "NOW" : yr.year}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ── 12-MONTH FORECAST TABLE ── */}
                {seasonalData.monthly_forecast?.length > 0 && (
                  <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8 border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                      <Calendar className="w-6 h-6 text-teal-600" />
                      12-Month Weather Outlook
                    </h2>
                    <p className="text-gray-500 text-sm mb-6">Projected monthly conditions based on 16-day forecast + 20-year climate normals with current-season anomaly adjustment.</p>

                    <div className="overflow-x-auto">
                      <table className="w-full text-sm border-collapse">
                        <thead>
                          <tr className="bg-teal-50">
                            <th className="text-left p-3 rounded-tl-xl font-semibold text-teal-900">Month</th>
                            <th className="text-right p-3 font-semibold text-teal-900">Avg Temp (°C)</th>
                            <th className="text-right p-3 font-semibold text-teal-900">Rainfall (mm)</th>
                            <th className="text-right p-3 font-semibold text-teal-900">Hist. Avg Rain</th>
                            <th className="text-right p-3 font-semibold text-teal-900">Humidity (%)</th>
                            <th className="text-center p-3 rounded-tr-xl font-semibold text-teal-900">Source</th>
                          </tr>
                        </thead>
                        <tbody>
                          {seasonalData.monthly_forecast.map((m, i) => {
                            const isHighRain = m.precipitation_mm > (m.historical_avg_precip || 0) * 1.2;
                            const isLowRain = m.precipitation_mm < (m.historical_avg_precip || 0) * 0.8;
                            const isCropSowMonth = (seasonalData.crop_suitability?.sowing_window_months || []).includes(m.month_name);
                            return (
                              <tr key={i} className={`border-t border-gray-100 transition ${isCropSowMonth ? "bg-emerald-50 font-semibold" : "hover:bg-gray-50"}`}>
                                <td className="p-3 font-medium">
                                  {m.month_name}
                                  {isCropSowMonth && <span className="ml-2 text-xs bg-emerald-500 text-white px-1.5 py-0.5 rounded-full">Sow</span>}
                                </td>
                                <td className="text-right p-3">{m.temp_mean ?? "–"}</td>
                                <td className={`text-right p-3 font-semibold ${isHighRain ? "text-blue-700" : isLowRain ? "text-orange-600" : "text-gray-800"}`}>
                                  {m.precipitation_mm ?? "–"}
                                  {isHighRain && " 🌧️"}
                                  {isLowRain && " 🏜️"}
                                </td>
                                <td className="text-right p-3 text-gray-400">{m.historical_avg_precip ?? "–"}</td>
                                <td className="text-right p-3">{m.humidity ?? "–"}</td>
                                <td className="text-center p-3">
                                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                                    m.data_source === "forecast" ? "bg-blue-100 text-blue-800" :
                                    m.data_source === "projected_from_normals" ? "bg-gray-100 text-gray-600" :
                                    "bg-green-100 text-green-700"
                                  }`}>
                                    {m.data_source === "forecast" ? "🔵 Forecast" :
                                     m.data_source === "projected_from_normals" ? "⚫ Projected" :
                                     "🟢 Actual"}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    <p className="text-xs text-gray-400 mt-3">
                      🔵 Based on 16-day meteorological forecast &nbsp;|&nbsp; ⚫ Projected from 20-yr climate normals with seasonal anomaly &nbsp;|&nbsp; 🟢 Actual observed data
                    </p>
                  </div>
                )}

                {/* ── RECOMMENDATIONS ── */}
                {seasonalData.crop_suitability?.recommendations?.length > 0 && (
                  <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8 border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                      <Sprout className="w-6 h-6 text-green-600" />
                      Crop-Specific Recommendations
                    </h2>
                    <div className="space-y-3">
                      {seasonalData.crop_suitability.recommendations.map((r, i) => (
                        <div key={i} className="flex items-start gap-3 bg-green-50 rounded-xl p-4 border border-green-200">
                          <ChevronRight className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <p className="text-gray-800 text-sm leading-relaxed">{r}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </>
            )}
          </div>
        )}

        {/* ── CURRENT WEATHER PANEL ────────────────────────────────── */}
        {activeTab === "weather" && weatherFetched && currentWeather && (
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