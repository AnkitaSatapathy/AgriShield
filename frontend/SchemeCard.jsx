import React, { useState, useEffect } from 'react';
import { 
  Search, Award, Filter, Loader, AlertCircle, CheckCircle, 
  ExternalLink, ChevronDown, ChevronUp, FileText, IndianRupee,
  MapPin, Database, TrendingUp, Info, Building2, Users, Sprout, Leaf, ArrowRight
} from 'lucide-react';

const SchemeCard = ({ onBack }) => {
  // Form state
  const [formData, setFormData] = useState({
    state: '',
    category: '',
    crop: '',
    schemeType: 'All'
  });

  // Data from API
  const [schemes, setSchemes] = useState([]);
  const [states, setStates] = useState([]);
  const [crops, setCrops] = useState([]);
  const [schemeTypes, setSchemeTypes] = useState([]);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedScheme, setExpandedScheme] = useState(null);
  const [showStatesList, setShowStatesList] = useState(false);
  const [showCropsList, setShowCropsList] = useState(false);

  const API_BASE = 'http://localhost:8000';

  // Fetch filter options on mount
  useEffect(() => {
    fetchFilterOptions();
  }, []);

  const fetchFilterOptions = async () => {
    try {
      const [statesRes, cropsRes, typesRes] = await Promise.all([
        fetch(`${API_BASE}/schemes/filters/states`),
        fetch(`${API_BASE}/schemes/filters/crops`),
        fetch(`${API_BASE}/schemes/filters/types`)
      ]);
      
      const statesData = await statesRes.json();
      const cropsData = await cropsRes.json();
      const typesData = await typesRes.json();
      
      setStates(statesData.states || []);
      setCrops(cropsData.crops || []);
      setSchemeTypes(['All', ...(typesData.scheme_types || [])]);
    } catch (err) {
      console.error('Error loading filter options:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.state || !formData.category) {
      setError('Please select both State and Farmer Category');
      return;
    }

    setLoading(true);
    setError('');
    setSchemes([]);

    try {
      const params = new URLSearchParams({
        state: formData.state,
        farmer_category: formData.category,
      });
      
      if (formData.crop) {
        params.append('crop_type', formData.crop);
      }

      const response = await fetch(`${API_BASE}/schemes/eligible?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch schemes');
      }

      const data = await response.json();
      let filteredSchemes = data.schemes || [];
      
      // Apply scheme type filter
      if (formData.schemeType !== 'All') {
        filteredSchemes = filteredSchemes.filter(
          scheme => scheme.scheme_type === formData.schemeType
        );
      }
      
      setSchemes(filteredSchemes);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      state: '',
      category: '',
      crop: '',
      schemeType: 'All'
    });
    setSchemes([]);
    setError('');
    setExpandedScheme(null);
  };

  const toggleScheme = (schemeId) => {
    setExpandedScheme(expandedScheme === schemeId ? null : schemeId);
  };

  // Color coding by scheme type
  const schemeTypeColors = {
    'Financial Support': 'from-green-500 to-emerald-600',
    'Insurance': 'from-blue-500 to-indigo-600',
    'Credit': 'from-purple-500 to-violet-600',
    'Subsidy': 'from-orange-500 to-red-600',
    'Advisory': 'from-teal-500 to-cyan-600',
  };

  const schemeTypeBadgeColors = {
    'Financial Support': 'bg-green-50 border-green-200 text-green-700',
    'Insurance': 'bg-blue-50 border-blue-200 text-blue-700',
    'Credit': 'bg-purple-50 border-purple-200 text-purple-700',
    'Subsidy': 'bg-orange-50 border-orange-200 text-orange-700',
    'Advisory': 'bg-teal-50 border-teal-200 text-teal-700',
  };

  return (
    <div>
      {/* Navigation Bar */}
      <nav className="fixed w-full z-50 bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button 
              onClick={onBack}
              className="flex items-center space-x-2 cursor-pointer"
            >
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-2 rounded-lg">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                AgriShield
              </span>
            </button>
            
            <button
              onClick={onBack}
              className="px-4 py-2 text-green-600 hover:bg-green-50 rounded-lg transition flex items-center space-x-2"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              <span>Back to Home</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="pt-20">
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-emerald-50">
      {/* Hero Section */}
      <div 
        className="relative bg-cover bg-center py-20 px-4"
        style={{
          backgroundImage: 'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(https://images.unsplash.com/photo-1560493676-04071c5f467b?w=1200&h=400&fit=crop)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-4 rounded-2xl">
              <Award className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white">
              Government Schemes Portal
            </h1>
          </div>
          <p className="text-xl text-gray-200 max-w-3xl mx-auto">
            Discover financial support, insurance, subsidies, and benefits designed for Indian farmers
          </p>
          
          {/* Stats Banner */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <Award className="w-8 h-8 text-green-300 mx-auto mb-2" />
              <div className="text-3xl font-bold text-white">50+</div>
              <div className="text-sm text-gray-200">Active Schemes</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <MapPin className="w-8 h-8 text-blue-300 mx-auto mb-2" />
              <div className="text-3xl font-bold text-white">{states.length}</div>
              <div className="text-sm text-gray-200">States Covered</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <IndianRupee className="w-8 h-8 text-yellow-300 mx-auto mb-2" />
              <div className="text-3xl font-bold text-white">₹1000Cr+</div>
              <div className="text-sm text-gray-200">Benefits Disbursed</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <Users className="w-8 h-8 text-purple-300 mx-auto mb-2" />
              <div className="text-3xl font-bold text-white">10M+</div>
              <div className="text-sm text-gray-200">Farmers Helped</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Info Banners */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Available States Card */}
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <MapPin className="w-8 h-8" />
                <h3 className="text-2xl font-bold">Coverage Areas</h3>
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
                  Schemes available across {states.length} Indian states:
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

          {/* Available Crops Card */}
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Sprout className="w-8 h-8" />
                <h3 className="text-2xl font-bold">Crop Types</h3>
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
                  Support for {crops.length} different crops:
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
        </div>

        {/* How It Works Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Info className="w-6 h-6 mr-3 text-blue-600" />
            How To Find Your Schemes
          </h3>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Enter Your Details</h4>
              <p className="text-sm text-gray-600">Select your state, farmer category, and crop type</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Find Matches</h4>
              <p className="text-sm text-gray-600">Our system finds all schemes you're eligible for</p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-orange-600">3</span>
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Review Details</h4>
              <p className="text-sm text-gray-600">Check benefits, eligibility, and required documents</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-purple-600">4</span>
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Apply Online</h4>
              <p className="text-sm text-gray-600">Click to apply directly on government portals</p>
            </div>
          </div>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
            <Filter className="w-8 h-8 mr-3 text-green-600" />
            Find Your Eligible Schemes
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="grid md:grid-cols-2 gap-6">
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
                    <option value="">Choose your state</option>
                    {states.map((state, idx) => (
                      <option key={idx} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Farmer Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Farmer Category *
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full p-3 pl-10 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                    required
                  >
                    <option value="">Select your category</option>
                    <option value="Small">Small Farmer (1-2 hectares)</option>
                    <option value="Marginal">Marginal Farmer (less than 1 hectare)</option>
                    <option value="Large">Large Farmer (more than 2 hectares)</option>
                  </select>
                </div>
              </div>

              {/* Crop Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Crop Type (Optional)
                </label>
                <div className="relative">
                  <Sprout className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  <select
                    name="crop"
                    value={formData.crop}
                    onChange={handleChange}
                    className="w-full p-3 pl-10 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                  >
                    <option value="">All crops</option>
                    {crops.map((crop, idx) => (
                      <option key={idx} value={crop}>{crop}</option>
                    ))}
                  </select>
                </div>
                <p className="text-xs text-gray-500 mt-1">Leave blank to see all schemes</p>
              </div>

              {/* Scheme Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Scheme Type
                </label>
                <div className="relative">
                  <Award className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  <select
                    name="schemeType"
                    value={formData.schemeType}
                    onChange={handleChange}
                    className="w-full p-3 pl-10 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                  >
                    {schemeTypes.map((type, idx) => (
                      <option key={idx} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-6 bg-red-50 border-2 border-red-200 rounded-lg p-4 flex items-start space-x-3">
                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-900">Error</p>
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            )}

            {/* Submit Buttons */}
            <div className="mt-8 flex space-x-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-lg hover:shadow-xl transition font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <Loader className="w-6 h-6 animate-spin" />
                    <span>Searching Schemes...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-6 h-6" />
                    <span>Find Schemes</span>
                  </>
                )}
              </button>

              {schemes.length > 0 && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-8 py-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
                >
                  Reset
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Results Section */}
        {schemes.length > 0 && (
          <div className="mb-8">
            <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
              <h2 className="text-3xl font-bold text-gray-900 flex items-center">
                <Award className="w-8 h-8 mr-3 text-green-600" />
                Found {schemes.length} Eligible Scheme{schemes.length !== 1 ? 's' : ''}
              </h2>
              <p className="text-gray-600 mt-2">
                Based on: {formData.state} • {formData.category} Farmer {formData.crop && `• ${formData.crop}`}
              </p>
            </div>

            <div className="space-y-6">
              {schemes.map((scheme) => {
                const isExpanded = expandedScheme === scheme.scheme_id;
                const gradientClass = schemeTypeColors[scheme.scheme_type] || 'from-gray-500 to-gray-600';
                const badgeClass = schemeTypeBadgeColors[scheme.scheme_type] || 'bg-gray-50 border-gray-200 text-gray-700';

                return (
                  <div key={scheme.scheme_id} className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden hover:shadow-xl transition">
                    {/* Scheme Header */}
                    <div className={`bg-gradient-to-r ${gradientClass} p-6 text-white`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-2xl font-bold">{scheme.scheme_name}</h3>
                            {scheme.is_eligible && (
                              <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full flex items-center space-x-1">
                                <CheckCircle className="w-4 h-4" />
                                <span className="text-sm font-medium">You're Eligible</span>
                              </div>
                            )}
                          </div>
                          <span className={`inline-block px-4 py-1.5 text-sm font-medium rounded-full border-2 border-white/30 bg-white/10 backdrop-blur-sm`}>
                            {scheme.scheme_type}
                          </span>
                        </div>
                        <Building2 className="w-12 h-12 opacity-30" />
                      </div>
                    </div>

                    {/* Scheme Body */}
                    <div className="p-6">
                      <p className="text-gray-700 mb-6 leading-relaxed">
                        {scheme.description}
                      </p>

                      {/* Key Benefits Preview */}
                      <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-6">
                        <div className="flex items-start space-x-3">
                          <IndianRupee className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                          <div className="flex-1">
                            <p className="font-semibold text-green-900 mb-2">Key Benefits</p>
                            <p className="text-gray-700">
                              {scheme.benefits.split(',')[0].trim()}
                              {scheme.benefits.split(',').length > 1 && ' and more...'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Eligibility Status */}
                      {scheme.is_eligible && scheme.eligibility_reason && (
                        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
                          <div className="flex items-start space-x-3">
                            <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                            <div className="flex-1">
                              <p className="font-semibold text-blue-900 mb-1">Why You're Eligible</p>
                              <p className="text-gray-700">{scheme.eligibility_reason}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-4">
                        <button
                          onClick={() => toggleScheme(scheme.scheme_id)}
                          className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition flex items-center justify-center space-x-2"
                        >
                          <span>{isExpanded ? 'Hide Details' : 'View Full Details'}</span>
                          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </button>
                        
                        <a
                          href={scheme.application_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg transition flex items-center justify-center space-x-2"
                        >
                          <span>Apply Now</span>
                          <ExternalLink className="w-5 h-5" />
                        </a>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="border-t-2 border-gray-200 bg-gray-50 p-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          {/* Complete Benefits */}
                          <div className="bg-white rounded-xl p-5 border-2 border-green-100">
                            <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                              <IndianRupee className="w-5 h-5 mr-2 text-green-600" />
                              Complete Benefits
                            </h4>
                            <ul className="space-y-2">
                              {scheme.benefits.split(',').map((benefit, idx) => (
                                <li key={idx} className="flex items-start space-x-2 text-gray-700">
                                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                  <span>{benefit.trim()}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Eligibility Criteria */}
                          <div className="bg-white rounded-xl p-5 border-2 border-blue-100">
                            <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                              <Users className="w-5 h-5 mr-2 text-blue-600" />
                              Eligibility Criteria
                            </h4>
                            <ul className="space-y-2">
                              {scheme.eligibility_criteria.split(',').map((criteria, idx) => (
                                <li key={idx} className="flex items-start space-x-2 text-gray-700">
                                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                                  <span>{criteria.trim()}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Required Documents */}
                          <div className="bg-white rounded-xl p-5 border-2 border-orange-100">
                            <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                              <FileText className="w-5 h-5 mr-2 text-orange-600" />
                              Required Documents
                            </h4>
                            <ul className="space-y-2">
                              {scheme.documents_required.split(',').map((doc, idx) => (
                                <li key={idx} className="flex items-start space-x-2 text-gray-700">
                                  <FileText className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                                  <span>{doc.trim()}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Applicability Info */}
                          <div className="bg-white rounded-xl p-5 border-2 border-purple-100">
                            <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                              <TrendingUp className="w-5 h-5 mr-2 text-purple-600" />
                              Applicability
                            </h4>
                            <div className="space-y-2 text-gray-700">
                              <p>
                                <span className="font-semibold text-gray-900">States:</span> {scheme.applicable_states || 'All States'}
                              </p>
                              <p>
                                <span className="font-semibold text-gray-900">Crops:</span> {scheme.applicable_crops || 'All Crops'}
                              </p>
                              <p>
                                <span className="font-semibold text-gray-900">Launch Date:</span> {scheme.launch_date || 'N/A'}
                              </p>
                            </div>
                          </div>

                          {/* Application Process */}
                          <div className="bg-white rounded-xl p-5 border-2 border-teal-100">
                            <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                              <Database className="w-5 h-5 mr-2 text-teal-600" />
                              Application Process
                            </h4>
                            <p className="text-gray-700 leading-relaxed">
                              {scheme.application_process || 'Visit the official government portal to apply. Follow the online application process with required documents.'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* No Results State */}
        {!loading && schemes.length === 0 && formData.state && (
          <div className="text-center py-16 bg-white rounded-2xl shadow-xl">
            <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Schemes Found</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              We couldn't find any eligible schemes matching your criteria. Try adjusting your filters or contact your nearest agricultural office.
            </p>
            <button
              onClick={resetForm}
              className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
            >
              Try Different Criteria
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && schemes.length === 0 && !formData.state && (
          <div className="text-center py-16 bg-white rounded-2xl shadow-xl">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Start Your Search</h3>
            <p className="text-gray-600">
              Fill in the form above and click "Find Schemes" to discover government benefits available for you.
            </p>
          </div>
        )}
      </div>
    </div>
      </div>
    </div>
  );
};

export default SchemeCard;