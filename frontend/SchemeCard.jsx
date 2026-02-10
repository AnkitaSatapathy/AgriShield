import React, { useState, useEffect } from 'react';
import {
  Search, Award, Filter, Loader, AlertCircle, CheckCircle,
  ExternalLink, ChevronDown, ChevronUp, FileText, IndianRupee,
  MapPin, Database, TrendingUp, Info, Building2, Users, Sprout, Leaf, ArrowRight, BookOpen,
  Shield, Wallet, Coins, Recycle, Activity, Layers, Flag, Globe, Landmark, Zap, ChevronLeft, ChevronRight,
  Smartphone, Phone, Layout, MousePointer, CreditCard, Lightbulb
} from 'lucide-react';

// Custom Hook for counting up animation
const useCountUp = (end, duration = 2000) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime = null;
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      // Ease out quart
      const easeProgress = 1 - Math.pow(1 - progress, 4);

      setCount(Math.floor(easeProgress * end));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [end, duration]);

  return count;
};

// Stat Card Component
const StatCard = ({ icon, value, label, suffix = '' }) => {
  const count = useCountUp(value);

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 transform hover:-translate-y-2 transition-all duration-300 hover:bg-white/20">
      {icon}
      <div className="text-3xl font-bold text-white">
        {count}{suffix}
      </div>
      <div className="text-sm text-gray-200">{label}</div>
    </div>
  );
};

const FALLBACK_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
  "Uttarakhand", "West Bengal", "Jammu and Kashmir"
];

const FALLBACK_CROPS = [
  "Rice", "Wheat", "Maize", "Cotton", "Sugarcane", "Pulses", "Oilseeds", "Fruits",
  "Vegetables", "Spices", "Tea", "Coffee", "Rubber", "Coconut", "Tobacco", "Millets"
];

const FALLBACK_TYPES = [
  "Financial Support", "Insurance", "Credit", "Subsidy", "Advisory", "Infrastructure",
  "Production", "Technology", "Organic", "Sustainability", "Livestock", "Development",
  "Integrated", "State", "Central"
];

const FarmerTips = () => {
  const documents = [
    "Aadhaar Card",
    "Bank Account Passbook",
    "Land Records (for land-based schemes)",
    "Mobile Number (linked to Aadhaar)",
    "Passport-size photograph",
    "Caste Certificate (if applicable)",
    "Income Certificate (for some schemes)"
  ];

  const applicationMethods = [
    { mode: "Online", desc: "Through respective portals", icon: <Globe className="w-5 h-5 text-blue-500" /> },
    { mode: "CSC Centers", desc: "Common Service Centers in villages", icon: <Layout className="w-5 h-5 text-orange-500" /> },
    { mode: "Agricultural Offices", desc: "Block/District agriculture offices", icon: <Building2 className="w-5 h-5 text-green-500" /> },
    { mode: "Banks", desc: "For credit-related schemes", icon: <CreditCard className="w-5 h-5 text-purple-500" /> },
    { mode: "Mobile Apps", desc: "State-specific farmer apps", icon: <Smartphone className="w-5 h-5 text-indigo-500" /> }
  ];

  const helplines = [
    { name: "PM-KISAN", number: "155261 / 011-24300606", color: "bg-green-50 text-green-700 border-green-200" },
    { name: "PMFBY (Crop Insurance)", number: "1800-209-5959", color: "bg-blue-50 text-blue-700 border-blue-200" },
    { name: "Kisan Call Center", number: "1800-180-1551", color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
    { name: "e-NAM", number: "1800-270-0224", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
    { name: "mKisan SMS", number: "9000 000 000", color: "bg-gray-50 text-gray-700 border-gray-200" }
  ];



  const successfulTips = [
    { title: "Complete Aadhaar Seeding", desc: "Ensure Aadhaar is linked with bank account" },
    { title: "e-KYC Mandatory", desc: "Complete e-KYC for PM-KISAN and other schemes" },
    { title: "Correct Information", desc: "Provide accurate land records and personal details" },
    { title: "Active Mobile Number", desc: "Keep registered mobile number active for OTPs" },
    { title: "Deadline Awareness", desc: "Be aware of deadlines for seasonal schemes" }
  ];

  return (
    <div className="mt-20 space-y-16 animate-fade-in-up">

      {/* Section Header */}
      <div className="text-center mb-16 relative">
        <div className="absolute inset-0 flex items-center justify-center opacity-5">
          <Sprout className="w-48 h-48 text-green-600" />
        </div>
        <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 relative z-10 tracking-tight">
          Farmer's Guide to <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500">Schemes</span>
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto text-xl leading-relaxed relative z-10">
          Everything you need to know about the application process, documents, and helpful resources to navigate government support.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-10">

        {/* Documents Required */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden transform hover:-translate-y-1 transition-all duration-300 group h-full flex flex-col">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-6 flex items-center justify-between relative overflow-hidden">
            <div className="flex items-center relative z-10">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm mr-4">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white tracking-wide">Documents Required</h3>
            </div>
            <FileText className="w-24 h-24 text-white opacity-10 absolute -right-6 -bottom-6 transform rotate-12 group-hover:scale-110 transition-transform duration-500" />
          </div>
          <div className="p-8 bg-green-50/30 flex-grow">
            <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-4">
              {documents.map((doc, idx) => (
                <li key={idx} className="flex items-start text-gray-700 group/item hover:bg-white hover:shadow-sm p-2 rounded-lg transition-all">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5 group-hover/item:text-green-600 transition-colors" />
                  <span className="text-base font-medium group-hover/item:text-gray-900 transition-colors">{doc}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Success Tips */}
        <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-3xl p-8 border border-white shadow-xl relative overflow-hidden group h-full flex flex-col">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-8 -left-8 w-64 h-64 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

          <div className="flex items-center mb-8 relative z-10">
            <div className="p-4 bg-white rounded-2xl shadow-lg mr-5 text-indigo-600 group-hover:scale-110 transition-transform">
              <Lightbulb className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-3xl font-extrabold text-gray-900">Tips for Success</h3>
              <p className="text-indigo-600 font-medium text-lg">Maximize your approval chances</p>
            </div>
          </div>
          <div className="grid gap-4 relative z-10 flex-grow">
            {successfulTips.map((tip, idx) => (
              <div key={idx} className="flex items-start bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-white/50 hover:bg-white hover:shadow-md transition-all">
                <div className="mt-1 mr-4 flex-shrink-0">
                  <Info className="w-5 h-5 text-indigo-500" />
                </div>
                <div>
                  <h5 className="font-bold text-gray-900 text-base">{tip.title}</h5>
                  <p className="text-sm text-gray-600 mt-1">{tip.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Application Methods */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden transform hover:-translate-y-1 transition-all duration-300 group h-full flex flex-col">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 flex items-center justify-between relative overflow-hidden">
            <div className="flex items-center relative z-10">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm mr-4">
                <MousePointer className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white tracking-wide">How to Apply?</h3>
            </div>
            <MousePointer className="w-24 h-24 text-white opacity-10 absolute -right-6 -bottom-6 transform rotate-12 group-hover:scale-110 transition-transform duration-500" />
          </div>
          <div className="p-8 grid gap-4 bg-blue-50/30 flex-grow">
            {applicationMethods.map((method, idx) => (
              <div key={idx} className="flex items-center p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-300 group/card">
                <div className="p-3 bg-blue-50 rounded-xl mr-5 group-hover/card:bg-blue-100 transition-colors">
                  {method.icon}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg group-hover/card:text-blue-700 transition-colors">{method.mode}</h4>
                  <p className="text-gray-500 text-sm group-hover/card:text-gray-600 transition-colors">{method.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Helplines */}
        <div className="bg-white rounded-3xl shadow-xl border border-amber-100 p-8 transform hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
          <div className="flex items-center mb-8">
            <div className="p-3 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl mr-5 shadow-lg shadow-orange-200">
              <Phone className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Important Helplines</h3>
          </div>
          <div className="grid gap-4 flex-grow content-start">
            {helplines.map((line, idx) => (
              <div key={idx} className={`flex justify-between items-center p-5 rounded-xl border-l-4 shadow-sm hover:shadow-md transition-all ${line.color.replace('bg-', 'hover:bg-opacity-80 bg-opacity-40 ')}`}>
                <div className="flex flex-col">
                  <span className="font-bold text-gray-900">{line.name}</span>
                  <span className="text-xs font-semibold uppercase tracking-wider opacity-70">Toll Free</span>
                </div>
                <span className="font-mono font-bold text-lg">{line.number}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

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
  const [states, setStates] = useState(FALLBACK_STATES);
  const [crops, setCrops] = useState(FALLBACK_CROPS);
  const [schemeTypes, setSchemeTypes] = useState(['All', ...FALLBACK_TYPES]);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedScheme, setExpandedScheme] = useState(null);
  const [showStatesList, setShowStatesList] = useState(false);
  const [showCropsList, setShowCropsList] = useState(false);

  const API_BASE = 'http://127.0.0.1:8000';

  // Scroll to top on mount
  React.useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    fetchFilterOptions();
  }, []);

  const fetchFilterOptions = async () => {
    try {
      // Try to fetch from API with a timeout
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), 5000)
      );

      const [statesRes, cropsRes, typesRes] = await Promise.race([
        Promise.all([
          fetch(`${API_BASE}/schemes/filters/states`),
          fetch(`${API_BASE}/schemes/filters/crops`),
          fetch(`${API_BASE}/schemes/filters/types`)
        ]),
        timeoutPromise
      ]);

      const statesData = await statesRes.json();
      const cropsData = await cropsRes.json();
      const typesData = await typesRes.json();

      setStates((statesData.states && statesData.states.length > 0) ? statesData.states : FALLBACK_STATES);
      setCrops((cropsData.crops && cropsData.crops.length > 0) ? cropsData.crops : FALLBACK_CROPS);

      const paramTypes = (typesData.scheme_types && typesData.scheme_types.length > 0)
        ? typesData.scheme_types
        : FALLBACK_TYPES;
      setSchemeTypes(['All', ...paramTypes]);

    } catch (err) {
      console.warn('Error loading filter options, using fallbacks:', err);
      // Use fallbacks on error
      setStates(FALLBACK_STATES);
      setCrops(FALLBACK_CROPS);
      setSchemeTypes(['All', ...FALLBACK_TYPES]);
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
      console.error('Scheme search error:', err);
      setError(`Error: ${err.message}. (Backend URL: ${API_BASE})`);
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
    'Subsidy': 'from-pink-500 to-rose-600',
    'Advisory': 'from-teal-500 to-cyan-600',
    'Infrastructure': 'from-blue-600 to-blue-800',
    'Production': 'from-green-600 to-green-800',
    'Technology': 'from-indigo-500 to-purple-600',
    'Organic': 'from-emerald-400 to-green-600',
    'Sustainability': 'from-cyan-400 to-teal-600',
    'Livestock': 'from-amber-500 to-orange-600',
    'Development': 'from-rose-400 to-red-600',
    'Integrated': 'from-lime-500 to-green-600',
    'State': 'from-sky-500 to-blue-600',
    'Central': 'from-fuchsia-500 to-purple-600',
  };

  const schemeTypeBadgeColors = {
    'Financial Support': 'bg-green-50 border-green-200 text-green-700',
    'Insurance': 'bg-blue-50 border-blue-200 text-blue-700',
    'Credit': 'bg-purple-50 border-purple-200 text-purple-700',
    'Subsidy': 'bg-pink-50 border-pink-200 text-pink-700',
    'Advisory': 'bg-teal-50 border-teal-200 text-teal-700',
    'Infrastructure': 'bg-blue-50 border-blue-200 text-blue-800',
    'Production': 'bg-green-50 border-green-200 text-green-800',
    'Technology': 'bg-indigo-50 border-indigo-200 text-indigo-700',
    'Organic': 'bg-emerald-50 border-emerald-200 text-emerald-700',
    'Sustainability': 'bg-cyan-50 border-cyan-200 text-cyan-700',
    'Livestock': 'bg-amber-50 border-amber-200 text-amber-700',
    'Development': 'bg-rose-50 border-rose-200 text-rose-700',
    'Integrated': 'bg-lime-50 border-lime-200 text-lime-700',
    'State': 'bg-sky-50 border-sky-200 text-sky-700',
    'Central': 'bg-fuchsia-50 border-fuchsia-200 text-fuchsia-700',
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
            className="relative bg-cover bg-center py-24 px-4 overflow-hidden"
            style={{
              backgroundImage: 'linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url(https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=1770&auto=format&fit=crop)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundAttachment: 'fixed' // Parallax effect
            }}
          >
            {/* Floating Background Elements */}
            <div className="absolute inset-0 pointer-events-none">
              <Sprout className="absolute top-10 left-10 w-12 h-12 text-white/20 animate-bounce delay-1000 duration-3000" />
              <Leaf className="absolute bottom-20 right-20 w-16 h-16 text-white/10 animate-pulse delay-700 duration-5000" />
              <div className="absolute top-1/2 left-1/4 w-4 h-4 bg-yellow-400/30 rounded-full animate-ping" />
              <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-white/40 rounded-full animate-ping delay-500" />
            </div>

            <div className="max-w-6xl mx-auto text-center relative z-10">
              <div className="flex items-center justify-center space-x-3 mb-6 animate-fade-in-down">
                <div className="bg-gradient-to-r from-green-400 to-emerald-500 p-4 rounded-2xl shadow-2xl transform rotate-3 hover:rotate-0 transition-all duration-500">
                  <Award className="w-12 h-12 text-white" />
                </div>
                <h1 className="text-5xl md:text-7xl font-extrabold text-white drop-shadow-lg tracking-tight">
                  AgriShield <span className="text-green-300">Schemes</span>
                </h1>
              </div>
              <p className="text-xl md:text-2xl text-green-50 max-w-3xl mx-auto mb-10 font-light drop-shadow-md animate-fade-in-up">
                Empowering farmers with <span className="font-semibold text-white">financial support</span>, <span className="font-semibold text-white">subsidies</span>, and <span className="font-semibold text-white">security</span>.
              </p>

              {/* Stats Banner with Animation */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 animate-fade-in-up delay-200">
                <StatCard
                  icon={<Award className="w-8 h-8 text-green-300 mx-auto mb-2" />}
                  value={50}
                  label="Active Schemes"
                  suffix="+"
                />
                <StatCard
                  icon={<MapPin className="w-8 h-8 text-blue-300 mx-auto mb-2" />}
                  value={28}
                  label="States Covered"
                />
                <StatCard
                  icon={<Sprout className="w-8 h-8 text-yellow-300 mx-auto mb-2" />}
                  value={crops.length > 0 ? crops.length : 50}
                  label="Crops Covered"
                  suffix="+"
                />
                <StatCard
                  icon={<Database className="w-8 h-8 text-purple-300 mx-auto mb-2" />}
                  value={schemeTypes.length > 0 ? schemeTypes.length - 1 : 10}
                  label="Categories"
                  suffix="+"
                />
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Scheme Types Flip Cards */}
            <div className="mb-16">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-3">
                  <BookOpen className="w-8 h-8 text-green-600" />
                  Understand Scheme Categories
                </h2>
                <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
                  Explore the different types of government support available to help you choose the right scheme for your needs. Hover over cards to learn more.
                </p>
              </div>

              <div className="relative group">
                <button
                  onClick={() => document.getElementById('schemes-container').scrollBy({ left: -300, behavior: 'smooth' })}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 z-10 p-3 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-300 hidden md:block group-hover:opacity-100 opacity-0"
                >
                  <ChevronLeft className="w-6 h-6 text-gray-700" />
                </button>

                <button
                  onClick={() => document.getElementById('schemes-container').scrollBy({ left: 300, behavior: 'smooth' })}
                  className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 z-10 p-3 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-300 hidden md:block group-hover:opacity-100 opacity-0"
                >
                  <ChevronRight className="w-6 h-6 text-gray-700" />
                </button>

                <div
                  id="schemes-container"
                  className="flex overflow-x-auto pb-8 -mx-4 px-4 space-x-6 snap-x snap-mandatory scrollbar-hide scroll-smooth"
                >
                  {[
                    {
                      title: "Infrastructure",
                      icon: <Building2 className="w-10 h-10 text-blue-600" />,
                      frontDesc: "Farm assets & storage",
                      backDesc: "Build a robust foundation for your farm with government-backed infrastructure support. Get substantial subsidies for constructing modern polyhouses, setting up solar-powered cold storage units, and building large-scale warehouses to prevent post-harvest losses. Schemes also cover the cost of digging farm ponds and installing micro-irrigation systems to ensure water security year-round.",
                      color: "from-blue-600 to-blue-800",
                      bg: "bg-blue-50",
                      border: "border-blue-200"
                    },
                    {
                      title: "Production",
                      icon: <Sprout className="w-10 h-10 text-green-600" />,
                      frontDesc: "Yield & quality",
                      backDesc: "Maximize your harvest using advanced production support schemes. Receive financial assistance for purchasing high-yield variety (HYV) seeds, organic fertilizers, and approved pesticides. Programs also offer grants for tissue culture plants and funding to expand your cultivation area, ensuring you get the best possible output from every acre of land.",
                      color: "from-green-600 to-green-800",
                      bg: "bg-green-50",
                      border: "border-green-200"
                    },
                    {
                      title: "Technology",
                      icon: <Database className="w-10 h-10 text-indigo-500" />,
                      frontDesc: "Modern farming",
                      backDesc: "Revolutionize your farming operations by adopting the latest agricultural technologies. Apply for generous grants to purchase modern tractors, agricultural drones for spraying, and automated irrigation systems. Schemes also support the setup of digital soil testing labs and the use of smart farming apps to make data-driven decisions.",
                      color: "from-indigo-500 to-purple-600",
                      bg: "bg-indigo-50",
                      border: "border-indigo-200"
                    },
                    {
                      title: "Financial Support",
                      icon: <IndianRupee className="w-10 h-10 text-green-500" />,
                      frontDesc: "Direct Assistance",
                      backDesc: "Secure your livelihood with direct financial transfers designed to support farmers during critical seasons. Beneficiaries receive annual cash support (like PM-KISAN) to cover input costs for seeds and fertilizers. These schemes ensure you have the necessary working capital before the sowing season begins, reducing reliance on informal loans.",
                      color: "from-green-500 to-emerald-600",
                      bg: "bg-green-50",
                      border: "border-green-200"
                    },
                    {
                      title: "Advisory",
                      icon: <Users className="w-10 h-10 text-teal-500" />,
                      frontDesc: "Expert Knowledge",
                      backDesc: "Gain a competitive edge with expert agricultural knowledge and training. Access free government training programs on modern techniques, connect directly with scientists via Kisan Call Centers for real-time problem solving, and attend field demonstration days. Stay updated on weather forecasts and pest alerts to protect your crops proactively.",
                      color: "from-teal-500 to-cyan-600",
                      bg: "bg-teal-50",
                      border: "border-teal-200"
                    },
                    {
                      title: "Insurance",
                      icon: <Shield className="w-10 h-10 text-blue-500" />,
                      frontDesc: "Risk Protection",
                      backDesc: "Shield your extensive hard work from unpredictable risks with comprehensive crop insurance. The Pradhan Mantri Fasal Bima Yojana (PMFBY) covers losses due to natural calamities like floods, droughts, pests, and diseases. Pay nominal premiums to get full claim settlements, ensuring that a bad season doesn't lead to financial ruin.",
                      color: "from-blue-500 to-indigo-600",
                      bg: "bg-blue-50",
                      border: "border-blue-200"
                    },
                    {
                      title: "Credit",
                      icon: <Wallet className="w-10 h-10 text-purple-500" />,
                      frontDesc: "Easy Loans",
                      backDesc: "Access affordable institutional credit without the hassle of collateral. The Kisan Credit Card (KCC) scheme offers low-interest loans for short-term crop needs, animal husbandry, and fisheries. Benefit from interest subvention schemes where the government pays a part of your interest burden if you repay loans on time, making credit extremely cheap.",
                      color: "from-purple-500 to-violet-600",
                      bg: "bg-purple-50",
                      border: "border-purple-200"
                    },
                    {
                      title: "Subsidy",
                      icon: <Coins className="w-10 h-10 text-pink-500" />,
                      frontDesc: "Govt Grants",
                      backDesc: "Lower your operational costs significantly with government subsidies on key inputs. avail heavy discounts on buying farm machinery, installing solar water pumps (PM-KUSUM), and purchasing micro-nutrients. These grants are designed to make expensive modern farming tools accessible to small and marginal farmers.",
                      color: "from-pink-500 to-rose-600",
                      bg: "bg-pink-50",
                      border: "border-pink-200"
                    },
                    {
                      title: "Organic",
                      icon: <Leaf className="w-10 h-10 text-emerald-500" />,
                      frontDesc: "Chemical Free",
                      backDesc: "Transition to specific eco-friendly farming with schemes like PKVY (Paramparagat Krishi Vikas Yojana). Get financial incentives for adopting organic practices, free organic certification to boost export value, and support for marketing your chemical-free produce at premium prices. Learn to make your own organic inputs like Jeevamrut.",
                      color: "from-emerald-400 to-green-600",
                      bg: "bg-emerald-50",
                      border: "border-emerald-200"
                    },
                    {
                      title: "Sustainability",
                      icon: <Recycle className="w-10 h-10 text-cyan-500" />,
                      frontDesc: "Eco-Friendly",
                      backDesc: "Promote long-term soil health and environmental balance. These schemes support conservation agriculture, watershed management for recharging groundwater, and soil health card missions. Receive guidance and funds to implement sustainable practices that preserve your land's fertility for future generations.",
                      color: "from-cyan-400 to-teal-600",
                      bg: "bg-cyan-50",
                      border: "border-cyan-200"
                    },
                    {
                      title: "Livestock",
                      icon: <Activity className="w-10 h-10 text-amber-500" />,
                      frontDesc: "Animal Husbandry",
                      backDesc: "Diversify your farm income by investing in animal husbandry. Access dedicated schemes for dairy development, poultry farming, sheep/goat rearing, and fisheries. Benefits include subsidies for buying animals, construction of sheds, vaccination drives, and insurance coverage for your livestock assets.",
                      color: "from-amber-500 to-orange-600",
                      bg: "bg-amber-50",
                      border: "border-amber-200"
                    },
                    {
                      title: "Development",
                      icon: <TrendingUp className="w-10 h-10 text-rose-500" />,
                      frontDesc: "Rural Growth",
                      backDesc: "Participate in holistic rural development programs aimed at uplifting entire regions. These schemes focus on tribal areas, hill states, and backward districts, providing special packages for integrated development. They often combine infrastructure, livelihood support, and social security into one comprehensive benefit.",
                      color: "from-rose-400 to-red-600",
                      bg: "bg-rose-50",
                      border: "border-rose-200"
                    },
                    {
                      title: "Integrated",
                      icon: <Layers className="w-10 h-10 text-lime-500" />,
                      frontDesc: "Mixed Systems",
                      backDesc: "Maximize profits and minimize risks by combining different farming systems. Integrated Farming System (IFS) schemes encourage mixing crops with livestock, apiculture, or agroforestry. Get support to design a self-sustaining farm model where waste from one unit becomes input for another, reducing costs.",
                      color: "from-lime-500 to-green-600",
                      bg: "bg-lime-50",
                      border: "border-lime-200"
                    },
                    {
                      title: "State",
                      icon: <MapPin className="w-10 h-10 text-sky-500" />,
                      frontDesc: "State Initiatives",
                      backDesc: "Benefit from exclusive schemes launched and managed by your specific State Government. These are tailored to local climate, crops, and regional needs. They often fill the gaps left by central schemes and provide localized support for state-specific crops and farming challenges.",
                      color: "from-sky-500 to-blue-600",
                      bg: "bg-sky-50",
                      border: "border-sky-200"
                    },
                    {
                      title: "Central",
                      icon: <Flag className="w-10 h-10 text-fuchsia-500" />,
                      frontDesc: "Central Schemes",
                      backDesc: "Access major national flagship programs fully funded by the Government of India. These schemes (like PM-KISAN, PMFBY) have standardized benefits applicable across the country. They usually tackle large-scale issues like income support, insurance, and national food security missions.",
                      color: "from-fuchsia-500 to-purple-600",
                      bg: "bg-fuchsia-50",
                      border: "border-fuchsia-200"
                    }
                  ].map((item, idx) => (
                    <div key={idx} className="flip-card h-80 min-w-[280px] md:min-w-[320px] snap-center">
                      <div className="flip-card-inner cursor-pointer">

                        {/* Front of Card */}
                        <div className={`flip-card-front shadow-lg border-2 ${item.border} ${item.bg} p-4 flex flex-col items-center justify-center text-center`}>
                          <div className={`p-3 rounded-full bg-white shadow-md mb-3`}>
                            {item.icon}
                          </div>
                          <h3 className="text-lg font-bold text-gray-900 mb-1">{item.title}</h3>
                          <p className="text-gray-600 text-xs px-2">{item.frontDesc}</p>
                          <div className="mt-3 text-xs font-semibold text-gray-400 flex items-center">
                            Hover to details <ArrowRight className="w-3 h-3 ml-1" />
                          </div>
                        </div>

                        {/* Back of Card */}
                        <div className={`flip-card-back shadow-xl bg-gradient-to-br ${item.color} p-4 flex flex-col items-center justify-center text-center text-white`}>
                          <h3 className="text-lg font-bold mb-2 border-b border-white/20 pb-2 w-full">{item.title}</h3>
                          <p className="text-xs leading-relaxed">
                            {item.backDesc}
                          </p>
                        </div>

                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* User Guide Scroller */}
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Info className="w-6 h-6 mr-3 text-green-600" />
                  Guide: How to Use This Portal
                </h3>
                <div className="hidden md:flex space-x-2 text-sm text-gray-500">
                  <span>Scroll for more steps</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>

              <div className="flex overflow-x-auto pb-8 -mx-4 px-4 space-x-6 snap-x snap-mandatory scrollbar-hide">
                {[
                  {
                    step: 1,
                    title: "Select Your State",
                    desc: "Start by choosing your state from the dropdown to filter schemes relevant to your region.",
                    icon: <MapPin className="w-8 h-8 text-blue-500" />,
                    color: "border-blue-500 from-blue-50 to-white"
                  },
                  {
                    step: 2,
                    title: "Farmer Category",
                    desc: "Identify as Small, Marginal, or Large farmer to unlock specific eligibility benefits.",
                    icon: <Users className="w-8 h-8 text-green-500" />,
                    color: "border-green-500 from-green-50 to-white"
                  },
                  {
                    step: 3,
                    title: "Choose Your Crop",
                    desc: "Select the specific crop you are cultivating to find targeted subsidies and insurance.",
                    icon: <Sprout className="w-8 h-8 text-emerald-500" />,
                    color: "border-emerald-500 from-emerald-50 to-white"
                  },
                  {
                    step: 4,
                    title: "Search & Explore",
                    desc: "Click 'Find Schemes' to generate a tailored list of government matches for you.",
                    icon: <Search className="w-8 h-8 text-purple-500" />,
                    color: "border-purple-500 from-purple-50 to-white"
                  },
                  {
                    step: 5,
                    title: "Check Benefits",
                    desc: "Expand any scheme card to view detailed financial benefits and document requirements.",
                    icon: <FileText className="w-8 h-8 text-orange-500" />,
                    color: "border-orange-500 from-orange-50 to-white"
                  },
                  {
                    step: 6,
                    title: "Direct Application",
                    desc: "Use the 'Apply Now' button to be redirected to the official government application portal.",
                    icon: <ExternalLink className="w-8 h-8 text-teal-500" />,
                    color: "border-teal-500 from-teal-50 to-white"
                  }
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className={`min-w-[280px] md:min-w-[320px] bg-gradient-to-br ${item.color} rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-l-4 snap-center group`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-white rounded-xl shadow-sm group-hover:scale-110 transition-transform duration-300">
                        {item.icon}
                      </div>
                      <span className="text-4xl font-black text-gray-200 select-none">0{item.step}</span>
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

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
                    <div className="flex items-baseline space-x-2 mb-2">
                      <span className="text-5xl font-extrabold">{states.length}</span>
                      <span className="text-xl font-medium text-blue-100">States Covered</span>
                    </div>
                    <p className="text-white/80 text-sm mb-4">
                      Schemes available across these Indian states:
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
                    <div className="flex items-baseline space-x-2 mb-2">
                      <span className="text-5xl font-extrabold">{crops.length}</span>
                      <span className="text-xl font-medium text-green-100">Crops Supported</span>
                    </div>
                    <p className="text-white/80 text-sm mb-4">
                      Support for different crops including:
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
              <div className="mb-12">
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-3xl font-bold text-gray-900 flex items-center">
                      <Award className="w-10 h-10 mr-4 text-green-600" />
                      Found {schemes.length} Eligible Scheme{schemes.length !== 1 ? 's' : ''}
                    </h2>
                    <button
                      onClick={resetForm}
                      className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition font-semibold text-sm"
                    >
                      Clear Search
                    </button>
                  </div>
                  <div className="flex items-center space-x-4 ml-14">
                    <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium border border-green-200">
                      <MapPin className="w-3 h-3 inline mr-1" />
                      {formData.state}
                    </span>
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-200">
                      <Users className="w-3 h-3 inline mr-1" />
                      {formData.category} Farmer
                    </span>
                    {formData.crop && (
                      <span className="px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-sm font-medium border border-orange-200">
                        <Sprout className="w-3 h-3 inline mr-1" />
                        {formData.crop}
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid gap-8">
                  {schemes.map((scheme) => {
                    const isExpanded = expandedScheme === scheme.scheme_id;
                    const gradientClass = schemeTypeColors[scheme.scheme_type] || 'from-gray-500 to-gray-600';

                    return (
                      <div key={scheme.scheme_id} className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                        {/* Compact Header - Always Visible */}
                        <div className="relative">
                          {/* Color Strip */}
                          <div className={`h-2 w-full bg-gradient-to-r ${gradientClass}`} />

                          <div className="p-6">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                              <div>
                                <div className="flex items-center gap-3 mb-2">
                                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-gradient-to-r ${gradientClass} text-white bg-opacity-90`}>
                                    {scheme.scheme_type}
                                  </span>
                                  {scheme.is_eligible && (
                                    <span className="flex items-center text-green-600 text-xs font-bold bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                                      <CheckCircle className="w-3 h-3 mr-1" />
                                      Eligible
                                    </span>
                                  )}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 leading-tight">
                                  {scheme.scheme_name}
                                </h3>
                              </div>

                              <div className="flex items-center gap-3 w-full md:w-auto">
                                {(() => {
                                  let btnText = 'Apply Now';
                                  let BtnIcon = ExternalLink;
                                  let btnClass = 'bg-blue-600 hover:bg-blue-700';
                                  let isExternal = true;
                                  let href = scheme.application_link;

                                  const linkLower = (scheme.application_link || '').toLowerCase();
                                  const nameLower = (scheme.scheme_name || '').toLowerCase();

                                  // App Logic
                                  // Check for Play Store / App Store links
                                  const isStoreLink = linkLower.includes('play.google.com') || linkLower.includes('apps.apple.com');

                                  // Check for specific keywords in name (avoiding "Apple" matching "app")
                                  // We look for " App" (space before), "Mobile App", or name ending in "App"
                                  const isAppByName =
                                    /\bapp\b/i.test(nameLower) ||
                                    nameLower.includes('mobile app') ||
                                    nameLower.includes('android') ||
                                    nameLower.includes('ios');

                                  if (isStoreLink || isAppByName) {
                                    btnText = 'Download App';
                                    BtnIcon = Smartphone;
                                    btnClass = 'bg-indigo-600 hover:bg-indigo-700';
                                  }
                                  // PDF / Guidelines Logic
                                  else if (linkLower.endsWith('.pdf')) {
                                    btnText = 'Download Guidelines';
                                    BtnIcon = FileText;
                                    btnClass = 'bg-orange-600 hover:bg-orange-700';
                                  }
                                  // Missing Link / Offline Logic
                                  else if (!href || linkLower === 'na' || linkLower === 'none' || linkLower === '#') {
                                    btnText = 'Visit Local Office';
                                    BtnIcon = Building2;
                                    btnClass = 'bg-gray-500 hover:bg-gray-600 cursor-default';
                                    isExternal = false;
                                    href = '#';
                                  }

                                  return (
                                    <a
                                      href={href}
                                      target={isExternal ? "_blank" : undefined}
                                      rel={isExternal ? "noopener noreferrer" : undefined}
                                      onClick={!isExternal ? (e) => e.preventDefault() : undefined}
                                      className={`flex-1 md:flex-none px-4 py-2 ${btnClass} text-white font-semibold rounded-lg transition shadow-md hover:shadow-lg flex items-center justify-center space-x-2 text-sm`}
                                    >
                                      <span>{btnText}</span>
                                      <BtnIcon className="w-4 h-4" />
                                    </a>
                                  );
                                })()}
                                <button
                                  onClick={() => toggleScheme(scheme.scheme_id)}
                                  className={`px-3 py-2 rounded-lg border transition flex items-center justify-center ${isExpanded
                                    ? 'bg-gray-100 border-gray-300 text-gray-800'
                                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                    }`}
                                >
                                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </button>
                              </div>
                            </div>

                            <p className="text-gray-600 mb-4 text-sm leading-relaxed border-l-4 border-gray-200 pl-3 italic">
                              "{scheme.description}"
                            </p>

                            {/* Quick Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-1">
                              <div className="bg-green-50 rounded-lg p-3 border border-green-100 flex items-start space-x-2">
                                <div className="p-1.5 bg-green-100 rounded-md">
                                  <IndianRupee className="w-4 h-4 text-green-700" />
                                </div>
                                <div>
                                  <p className="text-[10px] font-bold text-green-800 uppercase tracking-wide mb-0.5">Benefit</p>
                                  <p className="text-xs text-green-900 font-medium leading-snug">
                                    {scheme.benefits.split(',')[0].trim()}
                                  </p>
                                </div>
                              </div>

                              <div className="bg-blue-50 rounded-lg p-3 border border-blue-100 flex items-start space-x-2">
                                <div className="p-1.5 bg-blue-100 rounded-md">
                                  <Users className="w-4 h-4 text-blue-700" />
                                </div>
                                <div>
                                  <p className="text-[10px] font-bold text-blue-800 uppercase tracking-wide mb-0.5">Eligibility</p>
                                  <p className="text-xs text-blue-900 font-medium leading-snug">
                                    {scheme.eligibility_criteria.split(',')[0].trim()}
                                  </p>
                                </div>
                              </div>

                              <div className="bg-purple-50 rounded-lg p-3 border border-purple-100 flex items-start space-x-2">
                                <div className="p-1.5 bg-purple-100 rounded-md">
                                  <TrendingUp className="w-4 h-4 text-purple-700" />
                                </div>
                                <div>
                                  <p className="text-[10px] font-bold text-purple-800 uppercase tracking-wide mb-0.5">State</p>
                                  <p className="text-xs text-purple-900 font-medium leading-snug">
                                    {scheme.applicable_states || 'All States'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Expanded Details Section */}
                        {isExpanded && (
                          <div className="border-t border-gray-100 bg-gray-50/50 p-8 animate-fadeIn">
                            <div className="grid md:grid-cols-2 gap-8">

                              {/* Detailed Benefits */}
                              <div className="space-y-6">
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                  <div className="flex items-center mb-4">
                                    <div className="p-2 bg-green-100 rounded-lg mr-3">
                                      <IndianRupee className="w-5 h-5 text-green-600" />
                                    </div>
                                    <h4 className="text-lg font-bold text-gray-900">Financial Benefits</h4>
                                  </div>
                                  <ul className="space-y-3">
                                    {scheme.benefits.split(',').map((benefit, idx) => (
                                      <li key={idx} className="flex items-start">
                                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                                        <span className="text-gray-700 text-sm leading-relaxed">{benefit.trim()}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>

                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                  <div className="flex items-center mb-4">
                                    <div className="p-2 bg-orange-100 rounded-lg mr-3">
                                      <FileText className="w-5 h-5 text-orange-600" />
                                    </div>
                                    <h4 className="text-lg font-bold text-gray-900">Required Documents</h4>
                                  </div>
                                  <ul className="space-y-3">
                                    {scheme.documents_required.split(',').map((doc, idx) => (
                                      <li key={idx} className="flex items-start">
                                        <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                                        <span className="text-gray-700 text-sm leading-relaxed">{doc.trim()}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>

                              {/* Process & Eligibility */}
                              <div className="space-y-6">
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                  <div className="flex items-center mb-4">
                                    <div className="p-2 bg-blue-100 rounded-lg mr-3">
                                      <Users className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <h4 className="text-lg font-bold text-gray-900">Who Can Apply?</h4>
                                  </div>
                                  <ul className="space-y-3">
                                    {scheme.eligibility_criteria.split(',').map((criteria, idx) => (
                                      <li key={idx} className="flex items-start">
                                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                                        <span className="text-gray-700 text-sm leading-relaxed">{criteria.trim()}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>

                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                  <div className="flex items-center mb-4">
                                    <div className="p-2 bg-teal-100 rounded-lg mr-3">
                                      <Database className="w-5 h-5 text-teal-600" />
                                    </div>
                                    <h4 className="text-lg font-bold text-gray-900">Application Process</h4>
                                  </div>
                                  <div className="text-gray-700 text-sm leading-relaxed p-4 bg-teal-50 rounded-lg border border-teal-100">
                                    {scheme.application_process || 'Visit the official government portal to apply. Follow the online application instructions carefully.'}
                                  </div>
                                </div>
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
            {!loading && !error && schemes.length === 0 && formData.state && (
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

            {/* Farmer Tips Section */}
            <FarmerTips />

          </div>
        </div>
      </div>
    </div>
  );
};

export default SchemeCard;