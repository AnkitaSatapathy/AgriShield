import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, Cloud, Droplets, ThermometerSun, Leaf, 
  MapPin, Calendar, Activity, Info, CheckCircle, XCircle,
  TrendingUp, Database, Sprout, Sun
} from 'lucide-react';

const RiskPrediction = () => {
  // Form state
  const [formData, setFormData] = useState({
    crop: '',
    state: '',
    district: '',
    season: '',
    temperature: '',
    rainfall: '',
    humidity: '',
    disaster_occurred: '0'
  });

  // Data from API
  const [crops, setCrops] = useState([]);
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);

  // UI state
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCropsList, setShowCropsList] = useState(false);
  const [showStatesList, setShowStatesList] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    fetchAvailableData();
  }, []);

  const fetchAvailableData = async () => {
    try {
      // Fetch crops
      const cropsRes = await fetch('http://localhost:8000/api/crops');
      const cropsData = await cropsRes.json();
      setCrops(cropsData.crops || []);

      // Fetch states
      const statesRes = await fetch('http://localhost:8000/api/states');
      const statesData = await statesRes.json();
      setStates(statesData.states || []);

      // Fetch districts
      const districtsRes = await fetch('http://localhost:8000/api/districts');
      const districtsData = await districtsRes.json();
      setDistricts(districtsData.districts || []);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    // Validation check
    const requiredFields = {
      crop: 'Crop',
      state: 'State',
      district: 'District',
      season: 'Season',
      temperature: 'Temperature',
      rainfall: 'Rainfall',
      humidity: 'Humidity'
    };

    const missingFields = [];
    for (const [key, label] of Object.entries(requiredFields)) {
      if (!formData[key] || formData[key].toString().trim() === '') {
        missingFields.push(label);
      }
    }

    if (missingFields.length > 0) {
      setError(`Please fill in the following required fields: ${missingFields.join(', ')}`);
      return;
    }

    // Validate numeric fields
    const temperature = parseFloat(formData.temperature);
    const rainfall = parseFloat(formData.rainfall);
    const humidity = parseFloat(formData.humidity);

    if (isNaN(temperature)) {
      setError('Please enter a valid temperature value');
      return;
    }
    if (isNaN(rainfall)) {
      setError('Please enter a valid rainfall value');
      return;
    }
    if (isNaN(humidity)) {
      setError('Please enter a valid humidity value');
      return;
    }

    if (humidity < 0 || humidity > 100) {
      setError('Humidity must be between 0 and 100 percent');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/predict-risk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          temperature: temperature,
          rainfall: rainfall,
          humidity: humidity,
          disaster_occurred: parseInt(formData.disaster_occurred)
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail?.error || data.detail || 'Prediction failed');
      }

      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      crop: '',
      state: '',
      district: '',
      season: '',
      temperature: '',
      rainfall: '',
      humidity: '',
      disaster_occurred: '0'
    });
    setResult(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50">
      {/* Hero Section with Background Image */}
      <div 
        className="relative bg-cover bg-center py-20 px-4"
        style={{
          backgroundImage: 'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1200&h=400&fit=crop)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="bg-gradient-to-r from-red-500 to-orange-500 p-4 rounded-2xl animate-pulse">
              <AlertTriangle className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white">
              Crop Failure Risk Prediction
            </h1>
          </div>
          <p className="text-xl text-gray-200 max-w-3xl mx-auto">
            AI-powered risk analysis using real government data, weather patterns, and soil information
          </p>
          
          {/* Stats Banner */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <Sprout className="w-8 h-8 text-green-300 mx-auto mb-2" />
              <div className="text-3xl font-bold text-white">{crops.length}</div>
              <div className="text-sm text-gray-200">Crops Supported</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <MapPin className="w-8 h-8 text-blue-300 mx-auto mb-2" />
              <div className="text-3xl font-bold text-white">{states.length}</div>
              <div className="text-sm text-gray-200">States Covered</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <Database className="w-8 h-8 text-purple-300 mx-auto mb-2" />
              <div className="text-3xl font-bold text-white">20K+</div>
              <div className="text-sm text-gray-200">Data Records</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <TrendingUp className="w-8 h-8 text-yellow-300 mx-auto mb-2" />
              <div className="text-3xl font-bold text-white">95%</div>
              <div className="text-sm text-gray-200">Accuracy</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Info Banners */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Available Crops Card */}
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Sprout className="w-8 h-8" />
                <h3 className="text-2xl font-bold">Available Crops</h3>
              </div>
              <button
                onClick={() => setShowCropsList(!showCropsList)}
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition flex items-center space-x-2"
              >
                <span>{showCropsList ? 'Hide' : 'View All'}</span>
                <Info className="w-4 h-4" />
              </button>
            </div>
            
            {showCropsList ? (
              <div className="bg-white/10 rounded-xl p-4 max-h-60 overflow-y-auto">
                <div className="grid grid-cols-2 gap-2">
                  {crops.map((crop, idx) => (
                    <div key={idx} className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{crop}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <p className="text-white/90 mb-3">
                  We support {crops.length} different crops including:
                </p>
                <div className="flex flex-wrap gap-2">
                  {crops.slice(0, 8).map((crop, idx) => (
                    <span key={idx} className="bg-white/20 px-3 py-1 rounded-full text-sm">
                      {crop}
                    </span>
                  ))}
                  {crops.length > 8 && (
                    <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                      +{crops.length - 8} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Available States Card */}
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <MapPin className="w-8 h-8" />
                <h3 className="text-2xl font-bold">Covered States</h3>
              </div>
              <button
                onClick={() => setShowStatesList(!showStatesList)}
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition flex items-center space-x-2"
              >
                <span>{showStatesList ? 'Hide' : 'View All'}</span>
                <Info className="w-4 h-4" />
              </button>
            </div>
            
            {showStatesList ? (
              <div className="bg-white/10 rounded-xl p-4 max-h-60 overflow-y-auto">
                <div className="grid grid-cols-2 gap-2">
                  {states.map((state, idx) => (
                    <div key={idx} className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{state}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <p className="text-white/90 mb-3">
                  Predictions available for {states.length} Indian states:
                </p>
                <div className="flex flex-wrap gap-2">
                  {states.slice(0, 6).map((state, idx) => (
                    <span key={idx} className="bg-white/20 px-3 py-1 rounded-full text-sm">
                      {state}
                    </span>
                  ))}
                  {states.length > 6 && (
                    <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                      +{states.length - 6} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* How It Works Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Info className="w-6 h-6 mr-3 text-blue-600" />
            How It Works
          </h3>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Enter Details</h4>
              <p className="text-sm text-gray-600">Provide crop, location, and expected weather conditions</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h4 className="font-bold text-gray-900 mb-2">AI Analysis</h4>
              <p className="text-sm text-gray-600">Our ML model analyzes 20+ years of agricultural data</p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-orange-600">3</span>
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Risk Assessment</h4>
              <p className="text-sm text-gray-600">Get precise risk score and detailed explanation</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-purple-600">4</span>
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Take Action</h4>
              <p className="text-sm text-gray-600">Follow expert recommendations to minimize risk</p>
            </div>
          </div>
        </div>

        {/* Prediction Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
            <Leaf className="w-8 h-8 mr-3 text-green-600" />
            Enter Crop & Weather Information
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Crop Information Section */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                <Sprout className="w-5 h-5 mr-2 text-green-600" />
                Crop Information
              </h3>
            </div>

            {/* Crop */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Crop *
              </label>
              <select
                name="crop"
                value={formData.crop}
                onChange={handleChange}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                required
              >
                <option value="">Choose a crop</option>
                {crops.map((crop, idx) => (
                  <option key={idx} value={crop}>{crop}</option>
                ))}
              </select>
            </div>

            {/* State */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select State *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full p-3 pl-10 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                  required
                >
                  <option value="">Choose a state</option>
                  {states.map((state, idx) => (
                    <option key={idx} value={state}>{state}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* District */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                District *
              </label>
              <input
                type="text"
                name="district"
                value={formData.district}
                onChange={handleChange}
                placeholder="Enter district name"
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Tip: Use the same name as state if unsure</p>
            </div>

            {/* Season */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Growing Season *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <select
                  name="season"
                  value={formData.season}
                  onChange={handleChange}
                  className="w-full p-3 pl-10 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                  required
                >
                  <option value="">Choose season</option>
                  <option value="Kharif">Kharif (Monsoon: June-Oct)</option>
                  <option value="Rabi">Rabi (Winter: Nov-March)</option>
                  <option value="Summer">Summer (April-June)</option>
                  <option value="Whole Year">Whole Year</option>
                </select>
              </div>
            </div>

            {/* Weather Section */}
            <div className="md:col-span-2 mt-4">
              <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                <Cloud className="w-5 h-5 mr-2 text-blue-600" />
                Expected Weather Conditions
              </h3>
            </div>

            {/* Temperature */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Average Temperature (°C) *
              </label>
              <div className="relative">
                <ThermometerSun className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  name="temperature"
                  value={formData.temperature}
                  onChange={handleChange}
                  step="0.1"
                  placeholder="e.g., 28"
                  className="w-full p-3 pl-10 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Expected average temperature for the season</p>
            </div>

            {/* Rainfall */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expected Rainfall (mm) *
              </label>
              <div className="relative">
                <Droplets className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  name="rainfall"
                  value={formData.rainfall}
                  onChange={handleChange}
                  step="0.1"
                  placeholder="e.g., 1200"
                  className="w-full p-3 pl-10 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Total expected rainfall for the season</p>
            </div>

            {/* Humidity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Average Humidity (%) *
              </label>
              <div className="relative">
                <Activity className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  name="humidity"
                  value={formData.humidity}
                  onChange={handleChange}
                  step="0.1"
                  placeholder="e.g., 75"
                  className="w-full p-3 pl-10 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Expected average humidity for the season</p>
            </div>

            {/* Disaster */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recent Disaster Event? *
              </label>
              <select
                name="disaster_occurred"
                value={formData.disaster_occurred}
                onChange={handleChange}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
              >
                <option value="0">No Disaster</option>
                <option value="1">Yes (Flood/Drought/Cyclone)</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">Any disaster in past 6 months?</p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-6 bg-red-50 border-2 border-red-200 rounded-lg p-4 flex items-start space-x-3">
              <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-900">Error</p>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="mt-8 flex space-x-4">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-lg hover:shadow-xl transition font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  <span>Analyzing Data...</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-6 h-6" />
                  <span>Predict Risk</span>
                </>
              )}
            </button>

            {result && (
              <button
                onClick={resetForm}
                className="px-8 py-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Results Section */}
        {result && (
          <div className="bg-white rounded-2xl shadow-xl p-8 animate-fade-in">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
              <Activity className="w-8 h-8 mr-3 text-green-600" />
              Risk Assessment Results
            </h2>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {/* Risk Score Card */}
              <div className={`col-span-2 bg-gradient-to-br ${
                result.color === 'green' ? 'from-green-50 to-green-100 border-green-300' :
                result.color === 'orange' ? 'from-orange-50 to-orange-100 border-orange-300' :
                'from-red-50 to-red-100 border-red-300'
              } rounded-2xl p-8 border-2 relative overflow-hidden`}>
                
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 opacity-10">
                  <Sun className="w-64 h-64" />
                </div>

                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Risk Assessment Score</p>
                    <div className={`text-8xl font-bold ${
                      result.color === 'green' ? 'text-green-600' :
                      result.color === 'orange' ? 'text-orange-600' :
                      'text-red-600'
                    }`}>
                      {result.risk_score}%
                    </div>
                    <p className={`text-3xl font-semibold mt-3 ${
                      result.color === 'green' ? 'text-green-700' :
                      result.color === 'orange' ? 'text-orange-700' :
                      'text-red-700'
                    }`}>
                      {result.risk_level} Risk
                    </p>
                  </div>
                  
                  <div className={`${
                    result.color === 'green' ? 'bg-green-200' :
                    result.color === 'orange' ? 'bg-orange-200' :
                    'bg-red-200'
                  } p-8 rounded-full`}>
                    <AlertTriangle className={`w-24 h-24 ${
                      result.color === 'green' ? 'text-green-600' :
                      result.color === 'orange' ? 'text-orange-600' :
                      'text-red-600'
                    }`} />
                  </div>
                </div>
              </div>

              {/* Crop Details Card */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border-2 border-blue-200">
                <p className="text-sm font-medium text-gray-600 mb-3">Crop Details</p>
                <div className="space-y-3">
                  <div>
                    <p className="text-3xl font-bold text-blue-700">{formData.crop}</p>
                  </div>
                  <div className="pt-3 border-t border-blue-200">
                    <p className="text-sm text-gray-600 flex items-center mb-2">
                      <MapPin className="w-4 h-4 mr-2" />
                      {formData.district}, {formData.state}
                    </p>
                    <p className="text-sm text-gray-600 flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      {formData.season} Season
                    </p>
                  </div>
                  <div className="pt-3 border-t border-blue-200">
                    <p className="text-xs text-gray-600">Soil Type</p>
                    <p className="font-semibold text-gray-800">{result.district_info.soil_type}</p>
                    <p className="text-xs text-gray-600 mt-2">Soil Quality</p>
                    <p className="font-semibold text-gray-800">{(result.district_info.soil_quality * 100).toFixed(0)}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Analysis Summary */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 mb-6 border border-gray-200">
              <h3 className="font-bold text-xl mb-3 flex items-center text-gray-900">
                <Cloud className="w-6 h-6 mr-2 text-blue-600" />
                Detailed Analysis
              </h3>
              <div className="text-gray-700 leading-relaxed whitespace-pre-line bg-white p-4 rounded-lg">
                {result.explanation}
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
              <h3 className="font-bold text-xl mb-4 flex items-center text-green-900">
                <CheckCircle className="w-6 h-6 mr-2 text-green-600" />
                Expert Recommendations
              </h3>
              <ul className="space-y-3">
                {result.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start space-x-3 bg-white p-3 rounded-lg">
                    <div className="bg-green-200 rounded-full p-1.5 mt-0.5 flex-shrink-0">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    </div>
                    <span className="text-gray-700 flex-1">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RiskPrediction;