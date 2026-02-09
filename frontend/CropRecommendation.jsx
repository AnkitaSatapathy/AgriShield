import React, { useState } from 'react';
import {
  Leaf, Droplets, Sun, Activity, CheckCircle, XCircle, 
  TrendingUp, Sprout, FlaskConical, RotateCcw, Loader2,
  Lightbulb, Target, AlertCircle, Star, Thermometer,
  ArrowLeft, Info, Zap, Award, AlertTriangle, Shield,
  ThumbsUp, ThumbsDown, Beaker, BookOpen, TrendingDown,
  Heart, ChevronRight, ChevronLeft, Scissors
} from 'lucide-react';

// ─── CROP IMAGES ───────────────────────────────────────────────────────────
const Wheat = 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400';
const Potato = 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400';
const cotton = 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400';
const Rice = 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400';
const tomato = 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400';
const soyabean = 'https://images.unsplash.com/photo-1589566732327-b2fb78c5684d?w=400';
const maize = 'https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=400';

const cropImages = {
  wheat: Wheat,
  potato: Potato,
  cotton: cotton,
  rice: Rice,
  tomato: tomato,
  soyabean: soyabean,
  soybean: soyabean,
  maize: maize,
  apple: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400',
  banana: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400',
  blackgram: 'https://images.unsplash.com/photo-1583484963886-cfe2bff2945f?w=400',
  chickpea: 'https://images.unsplash.com/photo-1589621316382-008455b857cd?w=400',
  coconut: 'https://images.unsplash.com/photo-1598181261555-e2155fc14c44?w=400',
  coffee: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400',
  grapes: 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=400',
  jute: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400',
  kidneybeans: 'https://images.unsplash.com/photo-1607197644537-0e62c8f5d097?w=400',
  lentil: 'https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?w=400',
  mango: 'https://images.unsplash.com/photo-1605027990121-cbae9d3ce9f3?w=400',
  mothbeans: 'https://images.unsplash.com/photo-1556909212-d5b604d0c90d?w=400',
  mungbean: 'https://images.unsplash.com/photo-1587735243615-c03f25aaff15?w=400',
  muskmelon: 'https://images.unsplash.com/photo-1621583832251-e1ed83bac618?w=400',
  orange: 'https://images.unsplash.com/photo-1580052614034-c55d20bfee3b?w=400',
  papaya: 'https://images.unsplash.com/photo-1617112848923-cc2234396a8d?w=400',
  pigeonpeas: 'https://images.unsplash.com/photo-1589621316382-008455b857cd?w=400',
  pomegranate: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400',
  watermelon: 'https://images.unsplash.com/photo-1587049352846-4a222e784422?w=400'
};

// ─── CROP LIBRARY DATA ───────────────────────────────────────────────────
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

// ─── API CONFIGURATION ─────────────────────────────────────────────────────
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const MIN_CONFIDENCE_THRESHOLD = 30; // Filter out recommendations below 30%

// ─── CROP KNOWLEDGE BASE ───────────────────────────────────────────────────
const cropKnowledge = {
  rice: {
    why: [
      "Thrives in waterlogged conditions your soil supports",
      "Ideal for humid climates with abundant rainfall",
      "Your soil pH perfectly matches rice requirements"
    ],
    soilHealth: [
      "Add organic compost before planting to improve soil structure",
      "Maintain water levels 2-5 inches during growing season",
      "Practice crop rotation with legumes to restore nitrogen"
    ],
    successTips: [
      "Plant during monsoon season for best water availability",
      "Use disease-resistant varieties like IR64 or Swarna",
      "Apply split doses of nitrogen fertilizer for better yield"
    ],
    pros: [
      "High yield potential (4-6 tons/hectare)",
      "Strong market demand and stable prices",
      "Multiple varieties for different seasons"
    ],
    cons: [
      "Requires consistent water management",
      "Susceptible to pests like stem borers",
      "High labor intensity during harvesting"
    ]
  },
  wheat: {
    why: [
      "Your moderate temperature is perfect for wheat",
      "Soil conditions match wheat's nutrient needs",
      "Rainfall levels support rain-fed wheat cultivation"
    ],
    soilHealth: [
      "Deep plowing improves root penetration",
      "Apply farmyard manure before sowing",
      "Test soil for zinc and iron deficiencies"
    ],
    successTips: [
      "Sow in November-December for optimal growth",
      "Use certified seeds with 85%+ germination rate",
      "Irrigate at critical stages: crown root, flowering, grain filling"
    ],
    pros: [
      "Good protein content (10-12%)",
      "Drought-tolerant varieties available",
      "Shorter crop duration (110-130 days)"
    ],
    cons: [
      "Sensitive to heat stress during flowering",
      "Requires multiple irrigations in dry regions",
      "Storage requires pest control measures"
    ]
  },
  maize: {
    why: [
      "Your warm climate is ideal for maize growth",
      "Good soil nutrient balance supports high yields",
      "Flexible crop suitable for various farming systems"
    ],
    soilHealth: [
      "Add potassium-rich fertilizers for strong stalks",
      "Ensure good drainage to prevent root rot",
      "Mulching helps retain moisture and control weeds"
    ],
    successTips: [
      "Plant after last frost with soil temp above 10°C",
      "Maintain plant spacing of 20-25cm for air circulation",
      "Apply herbicides within 3 days of sowing"
    ],
    pros: [
      "High biomass production for fodder",
      "Suitable for mechanized farming",
      "Good market for grain and silage"
    ],
    cons: [
      "Vulnerable to Fall Armyworm attacks",
      "Requires timely nitrogen application",
      "Sensitive to waterlogging"
    ]
  },
  cotton: {
    why: [
      "Your warm climate extends the growing season",
      "Soil drainage supports cotton's deep roots",
      "High-value cash crop with good returns"
    ],
    soilHealth: [
      "Deep tillage to 6-8 inches improves root growth",
      "Apply gypsum in alkaline soils to improve structure",
      "Green manuring with dhaincha enhances organic matter"
    ],
    successTips: [
      "Sow when soil temperature exceeds 15°C",
      "Monitor for bollworm and whitefly regularly",
      "Picking at physiological maturity ensures quality"
    ],
    pros: [
      "Premium prices for quality fiber",
      "By-products (seeds, oil) add value",
      "Long market season for staggered harvest"
    ],
    cons: [
      "High pest and disease pressure",
      "Requires significant pesticide investment",
      "Labor-intensive harvesting process"
    ]
  },
  coffee: {
    why: [
      "Your acidic soil is perfect for coffee cultivation",
      "High rainfall supports arabica varieties",
      "Temperature range ideal for quality beans"
    ],
    soilHealth: [
      "Shade management with silver oak trees",
      "Mulch with coffee pulp to retain moisture",
      "Apply organic manure rich in potassium"
    ],
    successTips: [
      "Plant at 1000-1500m elevation for arabica",
      "Prune annually to maintain bush shape",
      "Harvest only ripe cherries for premium quality"
    ],
    pros: [
      "High export value and premium pricing",
      "Perennial crop with 30-40 year lifespan",
      "Supports shade-grown biodiversity"
    ],
    cons: [
      "Requires 3-4 years for first harvest",
      "Sensitive to coffee rust disease",
      "Price volatility in global markets"
    ]
  },
  potato: {
    why: [
      "Cool temperatures favor tuber development",
      "Your soil structure supports underground growth",
      "High demand in both fresh and processing markets"
    ],
    soilHealth: [
      "Apply well-decomposed FYM at 20-25 tons/ha",
      "Earthing up protects tubers from greening",
      "Rotate with cereals to break pest cycles"
    ],
    successTips: [
      "Use certified seed potatoes for disease-free crop",
      "Plant 5-7cm deep with 20cm spacing",
      "Harvest when leaves turn yellow"
    ],
    pros: [
      "Short crop duration (90-120 days)",
      "Multiple cropping seasons possible",
      "High nutritional value and market demand"
    ],
    cons: [
      "Susceptible to late blight disease",
      "Requires cold storage for long-term keeping",
      "Heavy feeder requiring intensive fertilization"
    ]
  },
  // Default for crops not in knowledge base
  default: {
    why: [
      "Your soil and climate conditions support this crop",
      "Good agronomic fit based on available nutrients",
      "Suitable for your region's farming practices"
    ],
    soilHealth: [
      "Test soil pH and adjust as needed",
      "Add organic matter to improve soil structure",
      "Practice crop rotation for soil health"
    ],
    successTips: [
      "Use quality seeds from certified sources",
      "Follow recommended sowing time for your region",
      "Monitor for pests and diseases regularly"
    ],
    pros: [
      "Adaptable to local conditions",
      "Market availability for produce",
      "Suitable for mixed farming systems"
    ],
    cons: [
      "May require specific inputs",
      "Consult local agricultural experts",
      "Consider market demand before large-scale planting"
    ]
  }
};

// ─── HELPER FUNCTIONS ──────────────────────────────────────────────────────
const getDisplayConfidence = (rawConfidence, hasWarnings) => {
  const confidence = Number(rawConfidence) || 0;
  let displayValue = Math.min(Math.round(confidence), 95);
  if (hasWarnings) {
    displayValue = Math.min(displayValue, 85);
  }
  return displayValue;
};

const getCropKnowledge = (cropName) => {
  const key = cropName.toLowerCase().replace(/\s+/g, '');
  return cropKnowledge[key] || cropKnowledge.default;
};

// ─── ANIMATED SECTION HEADER ──────────────────────────────────────────────
const AnimatedSectionHeader = ({ icon: Icon, title, subtitle, gradient = "from-green-600 to-emerald-600" }) => {
  return (
    <div className="relative mb-8 overflow-hidden group">
      <div className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-5 rounded-2xl transform group-hover:scale-105 transition-transform duration-500`}></div>
      <div className="relative flex items-center p-6 bg-white rounded-2xl border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
        <div className={`bg-gradient-to-br ${gradient} p-4 rounded-xl mr-4 transform group-hover:rotate-6 transition-transform duration-300`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
        <div className="flex-1">
          <h2 className="text-3xl font-bold text-gray-900 mb-1 group-hover:text-green-600 transition-colors duration-300">
            {title}
          </h2>
          {subtitle && (
            <p className="text-gray-600">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── CROP LIBRARY CAROUSEL ───────────────────────────────────────────────
const CropLibraryCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [flippedCards, setFlippedCards] = useState({});

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

  // Show 3 crops at a time
  const visibleCrops = [
    commonCrops[currentSlide],
    commonCrops[(currentSlide + 1) % commonCrops.length],
    commonCrops[(currentSlide + 2) % commonCrops.length]
  ];

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="bg-green-600 p-3 rounded-xl mr-3">
            <Sprout className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Popular Crops Library</h2>
            <p className="text-gray-600 text-sm">Explore common crops with ideal growing conditions</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={prevSlide}
            className="p-2 rounded-lg bg-white hover:bg-green-100 border-2 border-green-200 transition-all duration-300 transform hover:scale-110"
          >
            <ChevronLeft className="w-5 h-5 text-green-600" />
          </button>
          <button
            onClick={nextSlide}
            className="p-2 rounded-lg bg-white hover:bg-green-100 border-2 border-green-200 transition-all duration-300 transform hover:scale-110"
          >
            <ChevronRight className="w-5 h-5 text-green-600" />
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {visibleCrops.map((crop, index) => (
          <div
            key={currentSlide + index}
            className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 animate-slideIn"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="relative h-48 overflow-hidden group">
              <img
                src={crop.image}
                alt={crop.name}
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <h3 className="absolute bottom-4 left-4 text-2xl font-bold text-white">{crop.name}</h3>
            </div>
            
            <div className="p-5">
              <div className="flex items-start mb-3">
                <Info className="w-4 h-4 text-green-600 mr-2 flex-shrink-0 mt-1" />
                <p className="text-sm text-gray-700">{crop.shortDesc}</p>
              </div>
              
              {!flippedCards[currentSlide + index] ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 line-clamp-3">{crop.description}</p>
                  <button
                    onClick={() => toggleCard(currentSlide + index)}
                    className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-all duration-300 transform hover:scale-105"
                  >
                    <BookOpen className="w-4 h-4" />
                    Know More
                  </button>
                </div>
              ) : (
                <div className="space-y-3 animate-fadeIn">
                  <div>
                    <h4 className="text-xs font-semibold text-green-700 mb-1 flex items-center">
                      <Target className="w-3 h-3 mr-1" />
                      Ideal Conditions
                    </h4>
                    <p className="text-xs text-gray-600">{crop.idealConditions}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-blue-700 mb-1 flex items-center">
                      <Star className="w-3 h-3 mr-1" />
                      Benefits
                    </h4>
                    <p className="text-xs text-gray-600">{crop.benefits}</p>
                  </div>
                  <button
                    onClick={() => toggleCard(currentSlide + index)}
                    className="w-full flex items-center justify-center gap-2 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-all duration-300"
                  >
                    <XCircle className="w-4 h-4" />
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────
const CropRecommendation = () => {
  const [formData, setFormData] = useState({
    N: '', P: '', K: '', 
    temperature: '', humidity: '', 
    ph: '', rainfall: ''
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({ 
      N: '', P: '', K: '', 
      temperature: '', humidity: '', 
      ph: '', rainfall: ''
    });
    setResult(null);
    setError('');
  };

  const handleSubmit = async () => {
    setError('');
    setResult(null);

    // Validation
    const required = { 
      N: 'Nitrogen', P: 'Phosphorus', K: 'Potassium', 
      temperature: 'Temperature', humidity: 'Humidity',
      ph: 'pH', rainfall: 'Rainfall'
    };
    
    const missing = Object.entries(required)
      .filter(([k]) => !formData[k] || formData[k].toString().trim() === '')
      .map(([, v]) => v);
    
    if (missing.length) { 
      setError(`Please fill in: ${missing.join(', ')}`); 
      return; 
    }

    const nums = { 
      N: parseFloat(formData.N), 
      P: parseFloat(formData.P), 
      K: parseFloat(formData.K), 
      temperature: parseFloat(formData.temperature),
      humidity: parseFloat(formData.humidity),
      ph: parseFloat(formData.ph), 
      rainfall: parseFloat(formData.rainfall) 
    };
    
    if (Object.values(nums).some(isNaN)) { 
      setError('All fields must be valid numbers.'); 
      return; 
    }
    
    // Range validations
    if (nums.ph < 0 || nums.ph > 14) { setError('pH must be between 0-14'); return; }
    if (nums.N < 0 || nums.N > 200) { setError('Nitrogen must be between 0-200 kg/ha'); return; }
    if (nums.P < 0 || nums.P > 200) { setError('Phosphorus must be between 0-200 kg/ha'); return; }
    if (nums.K < 0 || nums.K > 200) { setError('Potassium must be between 0-200 kg/ha'); return; }
    if (nums.rainfall < 0 || nums.rainfall > 5000) { setError('Rainfall must be between 0-5000 mm'); return; }
    if (nums.temperature < -10 || nums.temperature > 50) { setError('Temperature must be between -10 to 50°C'); return; }
    if (nums.humidity < 0 || nums.humidity > 100) { setError('Humidity must be between 0-100%'); return; }

    setLoading(true);

    try {
      const body = {
        N: nums.N, P: nums.P, K: nums.K,
        temperature: nums.temperature,
        humidity: nums.humidity,
        ph: nums.ph, 
        rainfall: nums.rainfall
      };

      const res = await fetch(`${API_BASE_URL}/api/crop/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      
      if (!res.ok) {
        if (data.detail && typeof data.detail === 'object') {
          const { error, violations, suggestion } = data.detail;
          const violationsList = violations?.join('; ') || '';
          const errorMsg = [error, violationsList, suggestion].filter(Boolean).join('. ');
          throw new Error(errorMsg || 'Prediction failed');
        }
        throw new Error(data.detail || data.message || 'Prediction failed');
      }

      // Filter out recommendations below 30% confidence
      const filterLowConfidence = (recommendations) => {
        return recommendations.filter(rec => {
          const confidence = rec.display_confidence || rec.confidence || 0;
          return confidence >= MIN_CONFIDENCE_THRESHOLD;
        });
      };

      // Process and filter results
      let processedData = data;
      
      if (data.alternative_recommendations) {
        processedData.alternative_recommendations = filterLowConfidence(
          data.alternative_recommendations
        );
      }

      // Also check primary recommendation
      const primaryConf = data.primary_recommendation?.display_confidence || 
                         data.primary_recommendation?.confidence || 0;
      
      if (primaryConf < MIN_CONFIDENCE_THRESHOLD) {
        throw new Error('No suitable crops found with sufficient confidence. Please verify your input parameters.');
      }

      setResult(processedData);
      
      setTimeout(() => {
        document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      
    } catch (err) {
      console.error('Request failed:', err);
      setError(err.message || 'Failed to get recommendation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ─── RENDER DETAILED CROP CARD ──────────────────────────────────────────
  const renderDetailedCropCard = (rec, isPrimary = false) => {
    const hasWarnings = Array.isArray(rec.warnings) && rec.warnings.length > 0;
    const confidence = rec.display_confidence || rec.confidence || 0;
    const displayConf = getDisplayConfidence(confidence, hasWarnings);
    const knowledge = getCropKnowledge(rec.crop);
    const cropImage = cropImages[rec.crop.toLowerCase().replace(/\s+/g, '')] || cropImages.wheat;

    if (isPrimary) {
      return (
        <div className="bg-gradient-to-br from-green-600 via-green-700 to-emerald-700 rounded-2xl shadow-2xl p-8 text-white animate-slideUp mb-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div className="flex items-center">
              <div className="bg-yellow-400 p-3 rounded-xl mr-4 animate-bounce">
                <Award className="w-10 h-10 text-green-900" />
              </div>
              <div>
                <h2 className="text-3xl font-bold capitalize">{rec.crop}</h2>
                <p className="text-green-100 text-sm">Top Recommendation • Rank #1</p>
              </div>
            </div>
            <div className="text-right bg-white/10 backdrop-blur px-6 py-4 rounded-xl">
              <div className="text-4xl font-bold text-yellow-300">{displayConf}%</div>
              <div className="text-green-100 text-sm">Confidence Score</div>
            </div>
          </div>

          {/* Crop Image */}
          <div className="mb-6 rounded-xl overflow-hidden shadow-lg">
            <img 
              src={cropImage} 
              alt={rec.crop}
              className="w-full h-64 object-cover"
            />
          </div>

          {/* Why This Crop */}
          <div className="bg-white/10 backdrop-blur rounded-xl p-6 mb-4">
            <h3 className="font-bold text-xl mb-3 flex items-center">
              <Lightbulb className="w-6 h-6 mr-2 text-yellow-300" />
              Why {rec.crop}?
            </h3>
            <ul className="space-y-2">
              {knowledge.why.map((reason, i) => (
                <li key={i} className="flex items-start text-sm">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-300 flex-shrink-0 mt-0.5" />
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Soil Health Tips */}
          <div className="bg-amber-50 text-gray-800 rounded-xl p-6 mb-4">
            <h3 className="font-bold text-lg mb-3 flex items-center">
              <Beaker className="w-5 h-5 mr-2 text-amber-600" />
              Soil Health Tips
            </h3>
            <ul className="space-y-2">
              {knowledge.soilHealth.map((tip, i) => (
                <li key={i} className="flex items-start text-sm">
                  <Heart className="w-4 h-4 mr-2 text-amber-600 flex-shrink-0 mt-0.5" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Success Tips */}
          <div className="bg-blue-50 text-gray-800 rounded-xl p-6 mb-4">
            <h3 className="font-bold text-lg mb-3 flex items-center">
              <Target className="w-5 h-5 mr-2 text-blue-600" />
              Success Tips
            </h3>
            <ul className="space-y-2">
              {knowledge.successTips.map((tip, i) => (
                <li key={i} className="flex items-start text-sm">
                  <Zap className="w-4 h-4 mr-2 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pros & Cons */}
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="bg-green-50 text-gray-800 rounded-xl p-5">
              <h3 className="font-bold text-base mb-3 flex items-center text-green-700">
                <ThumbsUp className="w-5 h-5 mr-2" />
                Pros
              </h3>
              <ul className="space-y-2">
                {knowledge.pros.map((pro, i) => (
                  <li key={i} className="flex items-start text-sm">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>{pro}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-red-50 text-gray-800 rounded-xl p-5">
              <h3 className="font-bold text-base mb-3 flex items-center text-red-700">
                <ThumbsDown className="w-5 h-5 mr-2" />
                Cons
              </h3>
              <ul className="space-y-2">
                {knowledge.cons.map((con, i) => (
                  <li key={i} className="flex items-start text-sm">
                    <AlertCircle className="w-4 h-4 mr-2 text-red-600 flex-shrink-0 mt-0.5" />
                    <span>{con}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Warnings */}
          {hasWarnings && (
            <div className="bg-yellow-50 text-gray-800 rounded-xl p-5">
              <h3 className="font-bold text-base mb-3 flex items-center text-yellow-700">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Important Considerations
              </h3>
              <ul className="space-y-2">
                {rec.warnings.map((warning, i) => (
                  <li key={i} className="flex items-start text-sm">
                    <AlertCircle className="w-4 h-4 mr-2 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <span>{warning}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      );
    }

    // Alternative recommendation (simplified)
    return (
      <div className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-green-300 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <span className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center text-lg font-bold mr-3">
              {rec.rank}
            </span>
            <div>
              <h3 className="text-xl font-bold text-gray-900 capitalize">{rec.crop}</h3>
              <p className="text-sm text-gray-500">{displayConf}% Confidence</p>
            </div>
          </div>
          <img 
            src={cropImage} 
            alt={rec.crop}
            className="w-16 h-16 rounded-lg object-cover"
          />
        </div>

        <div className="space-y-3">
          <div className="bg-green-50 rounded-lg p-3">
            <h4 className="text-xs font-semibold text-green-700 mb-2 flex items-center">
              <Lightbulb className="w-3 h-3 mr-1" />
              Quick Benefits
            </h4>
            <ul className="space-y-1">
              {knowledge.pros.slice(0, 2).map((pro, i) => (
                <li key={i} className="text-xs text-gray-700 flex items-start">
                  <CheckCircle className="w-3 h-3 mr-1 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>{pro}</span>
                </li>
              ))}
            </ul>
          </div>

          {hasWarnings && (
            <div className="bg-yellow-50 rounded-lg p-2">
              <p className="text-xs text-gray-600 flex items-start">
                <AlertCircle className="w-3 h-3 mr-1 text-yellow-600 flex-shrink-0 mt-0.5" />
                {rec.warnings[0]}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Hero Header */}
      <div 
        className="relative bg-cover bg-center py-20 px-4"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=1200)',
          backgroundBlendMode: 'overlay',
          backgroundColor: 'rgba(0, 0, 0, 0.4)'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/30"></div>
        
        <div className="max-w-7xl mx-auto relative z-10 mb-6">
          <button
            onClick={() => window.history.back()}
            className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-lg border border-white/20 transition-all duration-300 hover:scale-105"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-semibold">Back to Home</span>
          </button>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-green-600 p-4 rounded-2xl shadow-lg animate-pulse">
              <Leaf className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">Crop Recommendation System</h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto mb-4">
            AI-powered crop suggestions with detailed farming insights
          </p>
          <div className="flex items-center justify-center space-x-4 text-sm text-white/80 flex-wrap gap-2">
            <div className="flex items-center bg-white/10 backdrop-blur px-3 py-1 rounded-full">
              <Shield className="w-4 h-4 mr-1" />
              <span>Smart Filtering</span>
            </div>
            <div className="flex items-center bg-white/10 backdrop-blur px-3 py-1 rounded-full">
              <Activity className="w-4 h-4 mr-1" />
              <span>Soil Health Tips</span>
            </div>
            <div className="flex items-center bg-white/10 backdrop-blur px-3 py-1 rounded-full">
              <Award className="w-4 h-4 mr-1" />
              <span>Success Strategies</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Crop Library Carousel */}
        <CropLibraryCarousel />

        {/* Input Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <AnimatedSectionHeader
            icon={FlaskConical}
            title="Enter Your Farm Data"
            subtitle="Input soil nutrients and climate parameters for personalized recommendations"
            gradient="from-blue-600 to-indigo-600"
          />
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* NPK Inputs */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                <FlaskConical className="w-5 h-5 mr-2 text-green-600" />
                Soil Nutrients (NPK Analysis)
              </h3>
            </div>

            <div className="transform hover:scale-105 transition-transform duration-300">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nitrogen (N) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Activity className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  name="N"
                  value={formData.N}
                  onChange={handleChange}
                  placeholder="e.g., 90"
                  className="w-full p-3 pl-10 pr-16 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                />
                <span className="absolute right-3 top-3.5 text-sm text-gray-400 font-medium">kg/ha</span>
              </div>
            </div>

            <div className="transform hover:scale-105 transition-transform duration-300">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phosphorus (P) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Activity className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  name="P"
                  value={formData.P}
                  onChange={handleChange}
                  placeholder="e.g., 42"
                  className="w-full p-3 pl-10 pr-16 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                />
                <span className="absolute right-3 top-3.5 text-sm text-gray-400 font-medium">kg/ha</span>
              </div>
            </div>

            <div className="transform hover:scale-105 transition-transform duration-300">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Potassium (K) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Activity className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  name="K"
                  value={formData.K}
                  onChange={handleChange}
                  placeholder="e.g., 43"
                  className="w-full p-3 pl-10 pr-16 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                />
                <span className="absolute right-3 top-3.5 text-sm text-gray-400 font-medium">kg/ha</span>
              </div>
            </div>

            <div className="transform hover:scale-105 transition-transform duration-300">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Soil pH <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FlaskConical className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  name="ph"
                  value={formData.ph}
                  onChange={handleChange}
                  step="0.1"
                  placeholder="e.g., 6.5"
                  className="w-full p-3 pl-10 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                />
              </div>
            </div>

            {/* Climate Inputs */}
            <div className="md:col-span-2 mt-4">
              <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                <Sun className="w-5 h-5 mr-2 text-orange-600" />
                Climate Conditions
              </h3>
            </div>

            <div className="transform hover:scale-105 transition-transform duration-300">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Temperature <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Thermometer className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  name="temperature"
                  value={formData.temperature}
                  onChange={handleChange}
                  placeholder="e.g., 25"
                  className="w-full p-3 pl-10 pr-10 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                />
                <span className="absolute right-3 top-3.5 text-sm text-gray-400 font-medium">°C</span>
              </div>
            </div>

            <div className="transform hover:scale-105 transition-transform duration-300">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Humidity <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Droplets className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  name="humidity"
                  value={formData.humidity}
                  onChange={handleChange}
                  placeholder="e.g., 80"
                  className="w-full p-3 pl-10 pr-10 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                />
                <span className="absolute right-3 top-3.5 text-sm text-gray-400 font-medium">%</span>
              </div>
            </div>

            <div className="transform hover:scale-105 transition-transform duration-300">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rainfall <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Droplets className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  name="rainfall"
                  value={formData.rainfall}
                  onChange={handleChange}
                  placeholder="e.g., 2000"
                  className="w-full p-3 pl-10 pr-10 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                />
                <span className="absolute right-3 top-3.5 text-sm text-gray-400 font-medium">mm</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-6 bg-red-50 border-2 border-red-200 rounded-lg p-4 flex items-start animate-shake">
              <XCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
              <p className="text-red-800">{error}</p>
            </div>
          )}

          <div className="mt-8 flex gap-4">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-6 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sprout className="w-5 h-5 mr-2" />
                  Get Recommendations
                </>
              )}
            </button>

            <button
              onClick={resetForm}
              className="px-6 py-4 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-all duration-300 flex items-center hover:border-gray-400 transform hover:scale-105"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Reset
            </button>
          </div>
        </div>

        {/* Results Section */}
        {result && result.primary_recommendation && (
          <div id="results-section" className="space-y-6">
            {/* Primary Recommendation */}
            {renderDetailedCropCard(result.primary_recommendation, true)}

            {/* Alternative Recommendations (Top 2 only) */}
            {result.alternative_recommendations && result.alternative_recommendations.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-8 animate-slideUp">
                <h3 className="font-bold text-2xl mb-6 flex items-center text-gray-900">
                  <TrendingUp className="w-7 h-7 mr-2 text-blue-600" />
                  Alternative Options
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {result.alternative_recommendations.slice(0, 2).map((rec) => 
                    renderDetailedCropCard(rec, false)
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .animate-slideUp {
          animation: slideUp 0.6s ease-out;
        }
        .animate-slideIn {
          animation: slideIn 0.5s ease-out;
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }
        .animate-shake {
          animation: shake 0.5s ease-out;
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default CropRecommendation;