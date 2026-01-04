import React, { useState, useEffect } from 'react';
import { Cloud, Leaf, AlertTriangle, Camera, BookOpen, ShoppingCart, Building2, User, Menu, X, ArrowRight } from 'lucide-react';

const App = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToFeatures = () => {
    const el = document.getElementById('features');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const features = [
    {
      icon: <AlertTriangle className="w-10 h-10" />,
      title: "Risk Prediction",
      description: "AI-powered crop failure risk analysis using weather, soil, and historical data",
      gradient: "from-red-500 to-orange-500",
      link: "/risk-prediction"
    },
    {
      icon: <Leaf className="w-10 h-10" />,
      title: "Crop Recommendation",
      description: "Get personalized crop suggestions based on soil conditions and climate",
      gradient: "from-green-500 to-emerald-500",
      link: "/crop-recommendation"
    },
    {
      icon: <Camera className="w-10 h-10" />,
      title: "Disease Detection",
      description: "Upload plant images for instant disease identification and treatment",
      gradient: "from-purple-500 to-pink-500",
      link: "/disease-detection"
    },
    {
      icon: <Cloud className="w-10 h-10" />,
      title: "Weather Forecast",
      description: "Real-time weather updates and agricultural advisories for your region",
      gradient: "from-blue-500 to-cyan-500",
      link: "/weather-forecast"
    },
    {
      icon: <BookOpen className="w-10 h-10" />,
      title: "Farming Tips",
      description: "Expert advice and best practices for sustainable agriculture",
      gradient: "from-yellow-500 to-amber-500",
      link: "/farming-tips"
    },
    {
      icon: <ShoppingCart className="w-10 h-10" />,
      title: "Marketplace",
      description: "Buy and sell agricultural products directly with other farmers",
      gradient: "from-indigo-500 to-blue-500",
      link: "/marketplace"
    },
    {
      icon: <Building2 className="w-10 h-10" />,
      title: "Govt Schemes",
      description: "Access information about government schemes and subsidies",
      gradient: "from-teal-500 to-green-500",
      link: "/govt-schemes"
    },
    {
      icon: <User className="w-10 h-10" />,
      title: "My Profile",
      description: "Manage your farm details, crops, and personalized recommendations",
      gradient: "from-gray-600 to-gray-800",
      link: "/profile"
    }
  ];

  const handleFeatureClick = (link) => {
    console.log(`Navigating to: ${link}`);
    alert(`This will navigate to: ${link}\n(Individual pages not implemented yet)`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50">
      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-lg' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-2 rounded-lg">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                AgriShield
              </span>
            </div>
            
            <div className="hidden md:flex space-x-8">
              <a href="#home" className="text-gray-700 hover:text-green-600 transition">Home</a>
              <a href="#about" className="text-gray-700 hover:text-green-600 transition">About</a>
              <a href="#features" className="text-gray-700 hover:text-green-600 transition">Features</a>
              <a href="#contact" className="text-gray-700 hover:text-green-600 transition">Contact</a>
            </div>

            <div className="hidden md:flex space-x-4">
              <button className="px-4 py-2 text-green-600 hover:bg-green-50 rounded-lg transition">
                Login
              </button>
              <button className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:shadow-lg transition">
                Sign Up
              </button>
            </div>

            <button 
              className="md:hidden"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-4 py-3 space-y-3">
              <a href="#home" className="block text-gray-700 hover:text-green-600">Home</a>
              <a href="#about" className="block text-gray-700 hover:text-green-600">About</a>
              <a href="#features" className="block text-gray-700 hover:text-green-600">Features</a>
              <a href="#contact" className="block text-gray-700 hover:text-green-600">Contact</a>
              <button className="w-full px-4 py-2 text-green-600 border border-green-600 rounded-lg">
                Login
              </button>
              <button className="w-full px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg">
                Sign Up
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="home" className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-block px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                🌾 Smart Farming Solutions
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
                Protect Your Crops with
                <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent"> AI Intelligence</span>
              </h1>
              <p className="text-xl text-gray-600">
                Predict crop failures, detect diseases, get weather alerts, and make data-driven farming decisions with AgriShield's intelligent platform.
              </p>
              <div className="flex flex-wrap gap-4">
                <button onClick={scrollToFeatures} className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:shadow-xl transition flex items-center space-x-2 group">
                  <span>Get Started</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
                </button>
              </div>
            </div>

            <div className="relative hidden md:block">
              <div className="relative z-10">
                <img 
                  src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&h=600&fit=crop" 
                  alt="Smart Farming" 
                  className="rounded-2xl shadow-2xl"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 rounded-2xl transform rotate-6 opacity-20"></div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
                About <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">AgriShield</span>
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                AgriShield is an intelligent agriculture platform designed to revolutionize farming through the power of artificial intelligence and data-driven insights. We empower farmers with cutting-edge technology to predict crop failures, detect diseases early, and make informed decisions that protect their livelihoods.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Our platform combines weather data, soil analysis, historical patterns, and machine learning to provide accurate risk assessments and actionable recommendations. From small-scale farmers to large agricultural enterprises, AgriShield helps reduce losses, optimize yields, and promote sustainable farming practices.
              </p>
              <div className="grid grid-cols-2 gap-6 pt-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-green-600">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    <span className="font-semibold">AI-Powered Predictions</span>
                  </div>
                  <div className="flex items-center space-x-2 text-green-600">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    <span className="font-semibold">Real-Time Monitoring</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-green-600">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    <span className="font-semibold">Expert Guidance</span>
                  </div>
                  <div className="flex items-center space-x-2 text-green-600">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    <span className="font-semibold">Community Marketplace</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=600&h=400&fit=crop" 
                alt="Agriculture Technology" 
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-gradient-to-r from-green-600 to-emerald-600 p-6 rounded-xl text-white shadow-xl">
                <div className="text-sm opacity-90">Protecting crops, empowering farmers</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Powerful Features for Modern Farming
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to protect your crops and maximize your yield in one intelligent platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                onClick={() => handleFeatureClick(feature.link)}
                className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2"
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${feature.gradient} text-white rounded-xl mb-4 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 mb-4">{feature.description}</p>
                <div className="flex items-center text-green-600 font-semibold group-hover:translate-x-2 transition-transform">
                  Learn More <ArrowRight className="w-4 h-4 ml-2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-green-600 to-emerald-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Transform Your Farming?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of farmers who are already using AgriShield to protect their crops and increase their yields.
          </p>
          <button onClick={scrollToFeatures} className="px-8 py-4 bg-white text-green-600 rounded-lg hover:shadow-xl transition font-semibold">
            Start Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-2 rounded-lg">
                  <Leaf className="w-5 h-5" />
                </div>
                <span className="text-xl font-bold">AgriShield</span>
              </div>
              <p className="text-gray-400 mb-4">
                Empowering farmers with AI-driven insights for better crop management and sustainable agriculture.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-xl">Contact Us</h4>
              <div className="space-y-3 text-gray-400">
                <div className="flex items-start space-x-3">
                  <span className="text-green-500 mt-1">📧</span>
                  <div>
                    <p className="font-semibold text-white">Email</p>
                    <a href="mailto:support@agrishield.com" className="hover:text-green-500 transition">
                      support@agrishield.com
                    </a>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-green-500 mt-1">📞</span>
                  <div>
                    <p className="font-semibold text-white">Phone</p>
                    <a href="tel:+917241234569" className="hover:text-green-500 transition">
                      +91 724-123-4569
                    </a>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-green-500 mt-1">💬</span>
                  <div>
                    <p className="font-semibold text-white">Support Hours</p>
                    <p>Monday - Saturday: 9:00 AM - 6:00 PM IST</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>© 2026 AgriShield. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;