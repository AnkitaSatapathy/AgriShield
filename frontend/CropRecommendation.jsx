import React, { useState, useEffect } from 'react';
import { Leaf, Droplets, ThermometerSun, Wind, FlaskConical, ArrowLeft, Award, Trophy, Sprout, AlertTriangle, Camera, Activity, Shield, BookOpen, ChevronRight, ChevronLeft, Eye, Microscope } from 'lucide-react';

// Sample images
const Wheat = 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400';
const Potato = 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400';
const cotton = 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400';
const Rice = 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400';
const tomato = 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400';
const soyabean = 'https://images.unsplash.com/photo-1589566732327-b2fb78c5684d?w=400';
const maize = 'https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=400';

// API Service
const API_URL = 'http://localhost:8000';

const cropAPI = {
  async getRecommendation(data) {
    const response = await fetch(`${API_URL}/api/recommend-crop`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to get recommendation');
    return await response.json();
  },
  
  async checkHealth() {
    try {
      const response = await fetch(`${API_URL}/api/model-status`);
      return await response.json();
    } catch {
      return { status: 'offline', model_loaded: false };
    }
  }
};

const sampleData = {
  rice: { 
    N: 90, P: 42, K: 43, 
    temperature: 20.87974371, humidity: 82.00274423, 
    ph: 6.502985292, rainfall: 202.9355362 
  },
  cotton: { 
    N: 108, P: 46, K: 17, 
    temperature: 24.30179980, humidity: 84.14668447, 
    ph: 7.046607434, rainfall: 91.63895650 
  },
  maize: {
    N: 71, P: 54, K: 16,
    temperature: 22.61359953, humidity: 63.69070564,
    ph: 5.749914421, rainfall: 87.75953857
  }
};

// Common crops showcase
const commonCrops = [
  {
    name: "Rice",
    image: Rice,
    shortDesc: "Staple crop thriving in flooded fields",
    description: "Rice is a water-loving cereal grain that forms the basis of diets worldwide. It requires specific soil nutrients and climate conditions for optimal yield.",
    idealConditions: "High humidity (80-90%), moderate temperature (20-25°C), acidic soil (pH 6-7), abundant rainfall (200-300mm).",
    benefits: "High yield potential, drought-resistant varieties available, excellent source of carbohydrates.",
    tips: "Ensure proper water management. Rotate with legumes. Use nitrogen-rich fertilizers."
  },
  {
    name: "Wheat",
    image: Wheat,
    shortDesc: "Versatile grain for bread and more",
    description: "Wheat is a major cereal crop used for flour, bread, and animal feed. It adapts to various climates but prefers temperate conditions.",
    idealConditions: "Cool temperatures (15-20°C), moderate humidity (60-70%), neutral soil (pH 6-7), seasonal rainfall (400-600mm).",
    benefits: "High protein content, versatile uses, good for rotation with other crops.",
    tips: "Plant in well-drained soil. Monitor for rust diseases. Harvest when grains are hard."
  },
  {
    name: "Cotton",
    image: cotton,
    shortDesc: "Fiber crop for textiles",
    description: "Cotton is a soft, fluffy staple fiber that grows in a boll around the seeds of the cotton plant. It's a major cash crop globally.",
    idealConditions: "Warm temperatures (25-30°C), moderate humidity (60-70%), slightly acidic soil (pH 6-7), adequate rainfall (700-900mm).",
    benefits: "High economic value, drought-tolerant varieties, biodegradable fiber.",
    tips: "Control pests like bollworms. Ensure proper spacing. Harvest when bolls open."
  },
  {
    name: "Maize",
    image: maize,
    shortDesc: "High-yield grain for food and feed",
    description: "Maize, also known as corn, is a versatile cereal crop used for human consumption, animal feed, and industrial products.",
    idealConditions: "Warm temperatures (20-30°C), moderate humidity (50-70%), neutral soil (pH 6-7), adequate rainfall (500-800mm).",
    benefits: "High caloric content, drought-tolerant hybrids, supports biodiversity in rotations.",
    tips: "Plant in rows for better airflow. Monitor for corn borers. Harvest when kernels are mature."
  },
  {
    name: "Soybean",
    image: soyabean,
    shortDesc: "Protein-rich legume for diverse uses",
    description: "Soybeans are legumes that fix nitrogen in the soil, making them excellent for sustainable farming and providing high-protein food.",
    idealConditions: "Warm temperatures (20-30°C), moderate humidity (60-80%), slightly acidic soil (pH 6-7), even rainfall (600-1000mm).",
    benefits: "Nitrogen fixation, high protein yield, oil production, improves soil health.",
    tips: "Inoculate seeds with rhizobia. Rotate with cereals. Harvest when pods are dry."
  },
  {
    name: "Potato",
    image: Potato,
    shortDesc: "Tuber crop for global consumption",
    description: "Potatoes are starchy tubers that grow underground and are a staple food in many cultures, adaptable to various climates.",
    idealConditions: "Cool temperatures (15-20°C), high humidity (70-80%), loose soil (pH 5-6), moderate rainfall (500-700mm).",
    benefits: "High caloric density, quick growth cycle, versatile in cooking, disease-resistant varieties.",
    tips: "Hill soil around plants. Avoid waterlogging. Store in cool, dark places post-harvest."
  },
  {
    name: "Tomato",
    image: tomato,
    shortDesc: "Juicy fruit vegetable for fresh and processed use",
    description: "Tomatoes are warm-season crops grown for their edible fruits, used in salads, sauces, and processing industries.",
    idealConditions: "Warm temperatures (20-25°C), moderate humidity (60-70%), well-drained soil (pH 6-7), consistent rainfall (600-800mm).",
    benefits: "Rich in vitamins, high market value, supports pollinators, greenhouse varieties extend season.",
    tips: "Provide support with stakes. Prune suckers. Monitor for blight diseases."
  }
];

const CropRecommendation = ({ onBack }) => {
  const [formData, setFormData] = useState({
    N: '', P: '', K: '', temperature: '', humidity: '', ph: '', rainfall: ''
  });
  
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [backendStatus, setBackendStatus] = useState(null);
  const [selectedCrop, setSelectedCrop] = useState(0);
  const [flippedCards, setFlippedCards] = useState({});
  const [currentSlide, setCurrentSlide] = useState(0);

  const toggleCard = (index) => {
    setFlippedCards(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % commonCrops.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + commonCrops.length) % commonCrops.length);
  };

  useEffect(() => {
    checkBackend();
  }, []);

  const checkBackend = async () => {
    const status = await cropAPI.checkHealth();
    setBackendStatus(status);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const loadSample = (type) => {
    const sample = sampleData[type];
    setFormData({
      N: sample.N.toString(),
      P: sample.P.toString(),
      K: sample.K.toString(),
      temperature: sample.temperature.toString(),
      humidity: sample.humidity.toString(),
      ph: sample.ph.toString(),
      rainfall: sample.rainfall.toString()
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    setSelectedCrop(0);

    try {
      const payload = {
        N: parseFloat(formData.N),
        P: parseFloat(formData.P),
        K: parseFloat(formData.K),
        temperature: parseFloat(formData.temperature),
        humidity: parseFloat(formData.humidity),
        ph: parseFloat(formData.ph),
        rainfall: parseFloat(formData.rainfall)
      };

      if (Object.values(payload).some(val => isNaN(val))) {
        throw new Error('Please fill in all fields with valid numbers');
      }

      const response = await cropAPI.getRecommendation(payload);
      setResult(response);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getTopCrops = () => {
    if (!result) return [];
    
    const topCrops = [
      {
        name: result.recommended_crop,
        confidence: result.confidence,
        rank: 1,
        details: result.crop_details
      }
    ];

    if (result.alternative_crops && result.alternative_crops.length > 0) {
      const alternativeConfidences = [
        result.confidence * 0.75,
        result.confidence * 0.50
      ];

      result.alternative_crops.slice(0, 2).forEach((crop, index) => {
        topCrops.push({
          name: crop,
          confidence: alternativeConfidences[index],
          rank: index + 2,
          details: null
        });
      });
    }

    return topCrops;
  };

  const topCrops = getTopCrops();
  const currentCropDetails = selectedCrop === 0 ? result?.crop_details : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Hero Section */}
      <div 
        className="relative bg-cover bg-center py-20 px-4"
        style={{
          backgroundImage: 'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?w=1200&h=400&fit=crop)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-4 rounded-2xl">
              <Leaf className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white drop-shadow-lg">
              Crop Recommendation
            </h1>
          </div>
          <p className="text-xl text-gray-200 max-w-3xl mx-auto">
            ML-powered crop suggestions based on soil and climate analysis for optimal yield
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
            {[
              { icon: BookOpen, value: "Research", label: "Based" },
              { icon: Activity, value: "94%", label: "Accuracy" },
              { icon: Sprout, value: "Sustainable", label: "Farming" },
              { icon: Shield, value: "Climate", label: "Adaptation" }
            ].map((stat, idx) => (
              <div 
                key={idx} 
                className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 hover:bg-white/20 transition transform hover:scale-105 cursor-pointer"
              >
                <stat.icon className="w-8 h-8 text-white mx-auto mb-2" />
                <div className="text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-gray-200">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Common Crops Carousel */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-3xl shadow-2xl p-10 border border-gray-100">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 flex items-center">
                <div className="bg-gradient-to-br from-green-500 to-emerald-500 p-3 rounded-xl mr-4">
                  <Sprout className="w-8 h-8 text-white" />
                </div>
                Popular Crops Library
              </h2>
              <p className="text-gray-600 mt-1 ml-16 text-sm">Explore common crops with ideal growing conditions</p>
            </div>
          </div>

          <div className="relative px-4">
            <button
              onClick={prevSlide}
              className="absolute -left-2 top-1/2 -translate-y-1/2 z-10 bg-gradient-to-br from-green-600 to-emerald-600 text-white p-3 rounded-full hover:from-green-700 hover:to-emerald-700 transition shadow-lg transform hover:scale-110 duration-300 flex items-center justify-center group"
            >
              <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition" />
            </button>

            <button
              onClick={nextSlide}
              className="absolute -right-2 top-1/2 -translate-y-1/2 z-10 bg-gradient-to-br from-green-600 to-emerald-600 text-white p-3 rounded-full hover:from-green-700 hover:to-emerald-700 transition shadow-lg transform hover:scale-110 duration-300 flex items-center justify-center group"
            >
              <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition" />
            </button>

            <div className="overflow-hidden">
              <div 
                className="flex transition-transform duration-500 ease-in-out gap-6"
                style={{ transform: `translateX(-${currentSlide * (100 / 3)}%)` }}
              >
                {commonCrops.map((crop, idx) => {
                  const isFlipped = flippedCards[idx];

                  return (
                    <div key={idx} className="flex-shrink-0 w-1/3">
                      <div className="h-[480px]">
                        <div 
                          className="relative w-full h-full transition-transform duration-700 cursor-pointer"
                          style={{
                            transformStyle: 'preserve-3d',
                            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                          }}
                          onClick={() => toggleCard(idx)}
                        >
                          <div 
                            className="absolute w-full h-full"
                            style={{ backfaceVisibility: 'hidden' }}
                          >
                            <div className="h-full bg-gradient-to-br from-gray-50 via-white to-gray-50 rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-gray-200 hover:border-green-400 mx-2">
                              <div className="relative h-48 overflow-hidden bg-gradient-to-br from-green-400 to-emerald-500">
                                <img 
                                  src={crop.image} 
                                  alt={crop.name} 
                                  className="w-full h-full object-cover hover:scale-110 transition duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                              </div>
                              
                              <div className="p-5">
                                <h3 className="font-bold text-xl text-gray-900 mb-2">{crop.name}</h3>
                                <p className="text-xs text-gray-600 mb-4 leading-relaxed line-clamp-2">{crop.shortDesc}</p>
                                
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 mb-4 border border-blue-200">
                                  <p className="text-xs font-bold text-blue-900 mb-1 flex items-center">
                                    <Eye className="w-3 h-3 mr-1.5" />
                                    Quick Info
                                  </p>
                                  <p className="text-xs text-blue-800 leading-relaxed line-clamp-2">{crop.description}</p>
                                </div>
                                
                                <button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-2 rounded-lg font-bold text-sm flex items-center justify-center space-x-2 shadow-md transform hover:scale-105 transition duration-300">
                                  <BookOpen className="w-4 h-4" />
                                  <span>Know More</span>
                                </button>
                              </div>
                            </div>
                          </div>

                          <div 
                            className="absolute w-full h-full"
                            style={{ 
                              backfaceVisibility: 'hidden',
                              transform: 'rotateY(180deg)'
                            }}
                          >
                            <div className="h-full bg-gradient-to-br from-indigo-500 via-purple-600 to-purple-700 rounded-3xl p-6 text-white shadow-xl overflow-y-auto mx-2">
                              <div className="flex items-start justify-between mb-4">
                                <h3 className="text-2xl font-bold">{crop.name}</h3>
                                <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-white/30 flex-shrink-0">
                                  <img 
                                    src={crop.image} 
                                    alt={crop.name} 
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              </div>

                              <div className="space-y-3 text-sm">
                                <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 border border-white/20 hover:bg-white/20 transition">
                                  <h4 className="font-bold text-xs mb-2 flex items-center text-white">
                                    <ThermometerSun className="w-4 h-4 mr-2" />
                                    CONDITIONS
                                  </h4>
                                  <p className="text-xs text-indigo-100 leading-relaxed">{crop.idealConditions}</p>
                                </div>

                                <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 border border-white/20 hover:bg-white/20 transition">
                                  <h4 className="font-bold text-xs mb-2 flex items-center text-white">
                                    <Award className="w-4 h-4 mr-2" />
                                    BENEFITS
                                  </h4>
                                  <p className="text-xs text-indigo-100 leading-relaxed">{crop.benefits}</p>
                                </div>

                                <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 border border-white/20 hover:bg-white/20 transition">
                                  <h4 className="font-bold text-xs mb-2 flex items-center text-white">
                                    <Shield className="w-4 h-4 mr-2" />
                                    TIPS
                                  </h4>
                                  <p className="text-xs text-indigo-100 leading-relaxed">{crop.tips}</p>
                                </div>
                              </div>

                              <button className="w-full mt-3 bg-white/20 hover:bg-white/30 text-white py-2 rounded-lg transition font-semibold text-sm flex items-center justify-center space-x-2 border border-white/20">
                                <ArrowLeft className="w-4 h-4" />
                                <span>Flip Back</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Input Form Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900 flex items-center">
              <FlaskConical className="w-8 h-8 mr-3 text-blue-600" />
              Analyze Soil & Climate
            </h2>
            {backendStatus && (
              <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
                backendStatus.status === 'online' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {backendStatus.status === 'online' ? '● Online' : '● Offline'}
              </div>
            )}
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3">
              <AlertTriangle className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-red-900">Error</p>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Droplets className="w-5 h-5 mr-2 text-blue-600" />
                Soil Nutrients (NPK)
              </h3>
              <p className="text-sm text-gray-600 mb-4">Measure nutrient levels from soil test reports</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { name: 'N', label: 'Nitrogen (mg/kg)', icon: '🟢', example: 'e.g., 90' },
                  { name: 'P', label: 'Phosphorus (mg/kg)', icon: '🟡', example: 'e.g., 42' },
                  { name: 'K', label: 'Potassium (mg/kg)', icon: '🔵', example: 'e.g., 43' }
                ].map(field => (
                  <div key={field.name}>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <span className="mr-2">{field.icon}</span>{field.label}
                    </label>
                    <input
                      type="number"
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleChange}
                      placeholder={field.example}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition bg-gray-50 hover:bg-gray-100 placeholder-gray-500"
                      step="0.1"
                    />
                    <p className="text-xs text-gray-500 mt-1">Range: 0-200 mg/kg</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <ThermometerSun className="w-5 h-5 mr-2 text-orange-600" />
                Climate Conditions
              </h3>
              <p className="text-sm text-gray-600 mb-4">Input average weather and soil parameters</p>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { name: 'temperature', label: 'Temperature (°C)', icon: '🌡️', example: 'e.g., 22', range: '5-40°C' },
                  { name: 'humidity', label: 'Humidity (%)', icon: '💧', example: 'e.g., 70', range: '20-100%' },
                  { name: 'ph', label: 'Soil pH', icon: '⚗️', example: 'e.g., 6.5', range: '4-8.5' },
                  { name: 'rainfall', label: 'Rainfall (mm)', icon: '🌧️', example: 'e.g., 200', range: '0-1000mm' }
                ].map(field => (
                  <div key={field.name}>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <span className="mr-2">{field.icon}</span>{field.label}
                    </label>
                    <input
                      type="number"
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleChange}
                      placeholder={field.example}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition bg-gray-50 hover:bg-gray-100 placeholder-gray-500"
                      step="0.1"
                    />
                    <p className="text-xs text-gray-500 mt-1">Range: {field.range}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">⚡ Quick Fill (Sample Data)</h3>
              <div className="flex flex-wrap gap-3">
                {Object.keys(sampleData).map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => loadSample(type)}
                    className="px-6 py-2 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-900 font-semibold rounded-xl hover:from-gray-200 hover:to-gray-300 transition border border-gray-300 transform hover:scale-105"
                  >
                    Load {type.charAt(0).toUpperCase() + type.slice(1)} Data
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-center pt-4">
              <button
                type="submit"
                disabled={loading}
                className={`px-12 py-4 rounded-xl font-bold text-white text-lg flex items-center space-x-3 transition transform ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 hover:scale-105 shadow-xl'
                }`}
              >
                <Activity className="w-6 h-6" />
                <span>{loading ? 'Analyzing...' : 'Get Recommendation'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Results Section */}
      {result && (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900 flex items-center">
                <Trophy className="w-8 h-8 mr-3 text-yellow-600" />
                Recommendation Results
              </h2>
              <button
                onClick={() => setResult(null)}
                className="px-4 py-2 bg-red-100 text-red-700 font-semibold rounded-xl hover:bg-red-200 transition"
              >
                Clear Results
              </button>
            </div>

            <div className="mb-8">
              <div className="flex space-x-2 border-b-2 border-gray-200 mb-6">
                {topCrops.map((crop, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedCrop(idx)}
                    className={`px-6 py-3 font-semibold transition border-b-4 ${
                      selectedCrop === idx
                        ? 'text-green-600 border-green-600'
                        : 'text-gray-600 border-transparent hover:text-gray-900'
                    }`}
                  >
                    {idx === 0 ? `🥇 ${crop.name}` : `Rank ${crop.rank}: ${crop.name}`}
                  </button>
                ))}
              </div>

              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-700">Recommendation Confidence</span>
                  <span className="text-2xl font-bold text-green-600">{(topCrops[selectedCrop]?.confidence * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${topCrops[selectedCrop]?.confidence * 100}%` }}
                  />
                </div>
              </div>

              {selectedCrop === 0 && currentCropDetails ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200 shadow-md hover:shadow-lg transition">
                    <h4 className="font-bold text-blue-900 mb-4 flex items-center text-lg">
                      <Microscope className="w-5 h-5 mr-2" />
                      Description
                    </h4>
                    <p className="text-blue-800 leading-relaxed">{currentCropDetails.description || "This crop is well-suited to your soil and climate conditions based on our analysis."}</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200 shadow-md hover:shadow-lg transition">
                    <h4 className="font-bold text-green-900 mb-4 flex items-center text-lg">
                      <Leaf className="w-5 h-5 mr-2" />
                      Growing Tips
                    </h4>
                    <p className="text-green-800 leading-relaxed">{currentCropDetails.growing_tips || "Follow standard agricultural practices for this crop. Ensure proper irrigation, pest management, and timely harvesting."}</p>
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200 shadow-md">
                  <h4 className="font-bold text-amber-900 mb-3 flex items-center text-lg">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    Alternative Crop
                  </h4>
                  <p className="text-amber-800 leading-relaxed">
                    {topCrops[selectedCrop]?.name} is an alternative recommendation based on your soil and climate data. 
                    While not the top choice, it may still perform well in your conditions. Consider consulting with local 
                    agricultural experts for detailed growing information specific to this crop.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Back Button */}
      <div className="fixed top-2 right-6 z-50">
        <button
          onClick={onBack}
          className="group relative px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 border border-green-500 hover:border-green-400"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition duration-300" />
          <span>Back</span>
          
          <div className="absolute inset-0 bg-gradient-to-r from-green-400/30 to-emerald-400/30 rounded-full opacity-0 group-hover:opacity-100 transition duration-300 blur-lg -z-10"></div>
        </button>
      </div>
    </div>
  );
};

export default CropRecommendation;