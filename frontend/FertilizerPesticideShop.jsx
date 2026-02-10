import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, Package, Leaf, Droplets, Shield, 
  Search, Filter, Star, TrendingUp, CheckCircle,
  XCircle, Plus, Minus, ShoppingBag, AlertCircle,
  Sprout, Users, Award, Truck
} from 'lucide-react';

const FertilizerPesticideShop = () => {
  // Product categories and data
  const [products] = useState([
    {
      id: 1,
      name: "Zinc Sulphate",
      category: "fertilizer",
      type: "Micronutrient",
      description: "Essential micronutrient for deficient soils. Promotes healthy plant growth and increases yield.",
      dosage: "25 kg/ha",
      price: 850,
      unit: "25 kg bag",
      rating: 4.8,
      reviews: 493,
      inStock: true,
      usage: "Apply in deficient alkaline soils",
      benefits: ["Corrects zinc deficiency", "Improves crop quality", "Enhances yield"],
      icon: "🌾"
    },
    {
      id: 2,
      name: "Urea 46% N",
      category: "fertilizer",
      type: "Nitrogen Fertilizer",
      description: "High nitrogen content fertilizer. Ideal for split dose application during crop growth.",
      dosage: "120 kg/ha",
      price: 1200,
      unit: "50 kg bag",
      rating: 4.7,
      reviews: 372,
      inStock: true,
      usage: "Split application recommended",
      benefits: ["Quick nitrogen supply", "Promotes vegetative growth", "Water soluble"],
      icon: "💧"
    },
    {
      id: 3,
      name: "DAP 18-46-0",
      category: "fertilizer",
      type: "Phosphate Fertilizer",
      description: "Di-Ammonium Phosphate for strong root development. Perfect for basal application.",
      dosage: "100 kg/ha",
      price: 1450,
      unit: "50 kg bag",
      rating: 4.9,
      reviews: 370,
      inStock: true,
      usage: "Basal application at planting",
      benefits: ["Strong root system", "Early plant vigor", "High phosphorus content"],
      icon: "🌱"
    },
    {
      id: 4,
      name: "NPK 20-20-0",
      category: "fertilizer",
      type: "Complex Fertilizer",
      description: "Complete nutrition complex mixture for balanced plant growth and development.",
      dosage: "As per crop",
      price: 1600,
      unit: "50 kg bag",
      rating: 4.6,
      reviews: 355,
      inStock: true,
      usage: "All-purpose fertilizer",
      benefits: ["Balanced nutrition", "Suitable for all crops", "Easy application"],
      icon: "⚗️"
    },
    {
      id: 5,
      name: "Muriate of Potash",
      category: "fertilizer",
      type: "Potassium Fertilizer",
      description: "Premium potassium fertilizer (0-0-60) for enhanced grain quality and disease resistance.",
      dosage: "60 kg/ha",
      price: 950,
      unit: "50 kg bag",
      rating: 4.7,
      reviews: 340,
      inStock: true,
      usage: "Flowering and fruiting stage",
      benefits: ["Better grain quality", "Disease resistance", "Improved shelf life"],
      icon: "🌾"
    },
    {
      id: 6,
      name: "Imidacloprid 17.8 SL",
      category: "pesticide",
      type: "Insecticide",
      description: "Systemic insecticide for effective control of sucking pests and soil insects.",
      dosage: "0.5 ml/L",
      price: 680,
      unit: "500 ml bottle",
      rating: 4.8,
      reviews: 377,
      inStock: true,
      usage: "Spray or soil drench",
      benefits: ["Long-lasting protection", "Systemic action", "Controls aphids, whiteflies"],
      icon: "🛡️"
    },
    {
      id: 7,
      name: "Carbofuran 3G",
      category: "pesticide",
      type: "Insecticide",
      description: "Granular insecticide for gall midge control. Long-lasting soil application.",
      dosage: "10 kg/ha",
      price: 720,
      unit: "5 kg pack",
      rating: 4.7,
      reviews: 374,
      inStock: true,
      usage: "Apply in root zone",
      benefits: ["Soil pest control", "Extended protection", "Easy application"],
      icon: "🐛"
    },
    {
      id: 8,
      name: "Chlorpyrifos 20 EC",
      category: "pesticide",
      type: "Insecticide",
      description: "Broad-spectrum insecticide for stem borer and leaf folder control in rice.",
      dosage: "2 ml/L",
      price: 590,
      unit: "1 liter bottle",
      rating: 4.6,
      reviews: 366,
      inStock: true,
      usage: "Foliar spray",
      benefits: ["Wide spectrum control", "Economical", "Effective on borers"],
      icon: "🦗"
    },
    {
      id: 9,
      name: "Neem Oil",
      category: "organic",
      type: "Organic Pesticide",
      description: "100% organic pest control solution. Safe for environment and beneficial insects.",
      dosage: "3% spray",
      price: 450,
      unit: "1 liter bottle",
      rating: 4.9,
      reviews: 354,
      inStock: true,
      usage: "Dilute and spray",
      benefits: ["100% organic", "Safe for pollinators", "Multiple pest control"],
      icon: "🍃"
    },
    {
      id: 10,
      name: "Cartap Hydrochloride 50SP",
      category: "pesticide",
      type: "Insecticide",
      description: "Effective against Brown Plant Hopper (BPH) and White Backed Plant Hopper (WBPH).",
      dosage: "1 g/L",
      price: 780,
      unit: "500 g pack",
      rating: 4.7,
      reviews: 353,
      inStock: true,
      usage: "Spray application",
      benefits: ["Controls hoppers", "Fast acting", "Residual effect"],
      icon: "🦟"
    },
    {
      id: 11,
      name: "Tricyclazole 75 WP",
      category: "pesticide",
      type: "Fungicide",
      description: "Specialized fungicide for blast disease control in rice and other crops.",
      dosage: "0.6 g/L",
      price: 820,
      unit: "250 g pack",
      rating: 4.8,
      reviews: 324,
      inStock: true,
      usage: "Preventive spray",
      benefits: ["Blast disease control", "Preventive action", "Safe for crops"],
      icon: "🍄"
    },
    {
      id: 12,
      name: "Vermicompost",
      category: "organic",
      type: "Organic Fertilizer",
      description: "Rich organic compost for soil health improvement and nutrient supply.",
      dosage: "5 tons/ha",
      price: 2800,
      unit: "50 kg bag",
      rating: 4.9,
      reviews: 200,
      inStock: true,
      usage: "Mix with soil",
      benefits: ["Improves soil structure", "Rich in nutrients", "Increases water retention"],
      icon: "🪱"
    }
  ]);

  // State management
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showCart, setShowCart] = useState(false);
  const [notification, setNotification] = useState(null);
  const [highlightedProductId, setHighlightedProductId] = useState(null);

  // Check for highlighted product from FarmingTips page
  useEffect(() => {
    const productId = sessionStorage.getItem('highlightProductId');
    if (productId) {
      const id = parseInt(productId);
      setHighlightedProductId(id);
      // Clear the sessionStorage
      sessionStorage.removeItem('highlightProductId');
      // Scroll to the product after a short delay to ensure rendering
      setTimeout(() => {
        const productElement = document.getElementById(`product-${id}`);
        if (productElement) {
          productElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Flash the product to draw attention
          productElement.classList.add('flash-highlight');
          setTimeout(() => {
            productElement.classList.remove('flash-highlight');
            setHighlightedProductId(null);
          }, 3000);
        }
      }, 500);
    }
  }, []);

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Add to cart
  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    showNotification(`${product.name} added to cart!`, 'success');
  };

  // Update quantity
  const updateQuantity = (productId, change) => {
    setCart(cart.map(item => {
      if (item.id === productId) {
        const newQuantity = Math.max(0, item.quantity + change);
        return newQuantity === 0 ? null : { ...item, quantity: newQuantity };
      }
      return item;
    }).filter(Boolean));
  };

  // Remove from cart
  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
    showNotification('Item removed from cart', 'info');
  };

  // Calculate total
  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
        } text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 animate-slide-in`}>
          <CheckCircle className="w-5 h-5" />
          <span>{notification.message}</span>
        </div>
      )}

      {/* Hero Section */}
      <div 
        className="relative bg-cover bg-center py-16 px-4"
        style={{
          backgroundImage: 'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=1200&h=400&fit=crop)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-4 rounded-2xl">
              <ShoppingBag className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white">
              AgriMart
            </h1>
          </div>
          <p className="text-xl text-gray-200 max-w-3xl mx-auto mb-8">
            Premium Fertilizers & Pesticides for Indian Farmers
          </p>
          
          {/* Stats Banner */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <Package className="w-8 h-8 text-green-300 mx-auto mb-2" />
              <div className="text-3xl font-bold text-white">{products.length}</div>
              <div className="text-sm text-gray-200">Products</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <Users className="w-8 h-8 text-blue-300 mx-auto mb-2" />
              <div className="text-3xl font-bold text-white">50K+</div>
              <div className="text-sm text-gray-200">Happy Farmers</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <Award className="w-8 h-8 text-yellow-300 mx-auto mb-2" />
              <div className="text-3xl font-bold text-white">100%</div>
              <div className="text-sm text-gray-200">Authentic</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <Truck className="w-8 h-8 text-purple-300 mx-auto mb-2" />
              <div className="text-3xl font-bold text-white">Free</div>
              <div className="text-sm text-gray-200">Delivery</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search and Filter Bar */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
              />
            </div>

            {/* Category Filter */}
            <div className="flex space-x-2 overflow-x-auto">
              {[
                { id: 'all', label: 'All Products', icon: Package },
                { id: 'fertilizer', label: 'Fertilizers', icon: Leaf },
                { id: 'pesticide', label: 'Pesticides', icon: Shield },
                { id: 'organic', label: 'Organic', icon: Sprout }
              ].map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold transition whitespace-nowrap ${
                    selectedCategory === category.id
                      ? 'bg-green-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <category.icon className="w-4 h-4" />
                  <span>{category.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredProducts.map((product, index) => (
            <div
              key={product.id}
              id={`product-${product.id}`}
              className={`bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2 ${
                highlightedProductId === product.id ? 'ring-4 ring-green-500' : ''
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Product Badge */}
              <div className="relative">
                <div className={`absolute top-4 right-4 ${
                  product.category === 'fertilizer' ? 'bg-green-600' :
                  product.category === 'pesticide' ? 'bg-orange-600' :
                  'bg-emerald-600'
                } text-white px-3 py-1 rounded-full text-xs font-bold uppercase z-10`}>
                  {product.type}
                </div>
                
                {/* Product Image Area */}
                <div className={`h-48 flex items-center justify-center text-7xl ${
                  product.category === 'fertilizer' ? 'bg-gradient-to-br from-green-400 to-green-600' :
                  product.category === 'pesticide' ? 'bg-gradient-to-br from-orange-400 to-orange-600' :
                  'bg-gradient-to-br from-emerald-400 to-emerald-600'
                }`}>
                  {product.icon}
                </div>
              </div>

              {/* Product Info */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-bold text-gray-900 flex-1">{product.name}</h3>
                  <div className="flex items-center space-x-1 bg-yellow-50 px-2 py-1 rounded-lg">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-semibold text-gray-700">{product.rating}</span>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>

                {/* Dosage */}
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 font-medium">Dosage:</span>
                    <span className="text-gray-900 font-semibold">{product.dosage}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-gray-600 font-medium">Pack Size:</span>
                    <span className="text-gray-900 font-semibold">{product.unit}</span>
                  </div>
                </div>

                {/* Benefits */}
                <div className="mb-4">
                  {product.benefits.slice(0, 2).map((benefit, idx) => (
                    <div key={idx} className="flex items-start space-x-2 text-xs text-gray-600 mb-1">
                      <CheckCircle className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>

                {/* Price and Action */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div>
                    <div className="text-3xl font-bold text-gray-900">₹{product.price}</div>
                    <div className="text-xs text-gray-500">{product.reviews} reviews</div>
                  </div>
                  <button
                    onClick={() => addToCart(product)}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition flex items-center space-x-2"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    <span>Add</span>
                  </button>
                </div>

                {/* View Details Button */}
                <button
                  onClick={() => setSelectedProduct(product)}
                  className="w-full mt-3 text-green-600 font-semibold text-sm hover:text-green-700 transition"
                >
                  View Details →
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Products Found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>

      {/* Floating Cart Button */}
      <button
        onClick={() => setShowCart(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white w-16 h-16 rounded-full shadow-2xl hover:shadow-3xl transition flex items-center justify-center group"
      >
        <ShoppingCart className="w-7 h-7 group-hover:scale-110 transition" />
        {cart.length > 0 && (
          <div className="absolute -top-2 -right-2 bg-orange-500 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold animate-bounce">
            {cart.length}
          </div>
        )}
      </button>

      {/* Cart Modal */}
      {showCart && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Cart Header */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <ShoppingCart className="w-8 h-8" />
                  <div>
                    <h2 className="text-2xl font-bold">Your Cart</h2>
                    <p className="text-green-100">{cart.length} items</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCart(false)}
                  className="text-white hover:bg-white/20 p-2 rounded-lg transition"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">Your cart is empty</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} className="bg-gray-50 rounded-xl p-4 flex items-center space-x-4">
                      <div className={`w-16 h-16 rounded-lg flex items-center justify-center text-3xl ${
                        item.category === 'fertilizer' ? 'bg-green-200' :
                        item.category === 'pesticide' ? 'bg-orange-200' :
                        'bg-emerald-200'
                      }`}>
                        {item.icon}
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900">{item.name}</h4>
                        <p className="text-sm text-gray-600">{item.unit}</p>
                        <p className="text-lg font-bold text-green-600">₹{item.price}</p>
                      </div>

                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="bg-gray-200 hover:bg-gray-300 p-2 rounded-lg transition"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-bold text-lg w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cart Footer */}
            {cart.length > 0 && (
              <div className="border-t border-gray-200 p-6 bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-semibold text-gray-700">Total Amount:</span>
                  <span className="text-3xl font-bold text-green-600">₹{calculateTotal()}</span>
                </div>
                <button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-lg font-bold text-lg hover:shadow-xl transition">
                  Proceed to Checkout
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Product Details</h2>
              <button
                onClick={() => setSelectedProduct(null)}
                className="text-gray-500 hover:bg-gray-100 p-2 rounded-lg transition"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {/* Product Header */}
              <div className="flex items-start space-x-6 mb-6">
                <div className={`w-32 h-32 rounded-2xl flex items-center justify-center text-6xl ${
                  selectedProduct.category === 'fertilizer' ? 'bg-gradient-to-br from-green-400 to-green-600' :
                  selectedProduct.category === 'pesticide' ? 'bg-gradient-to-br from-orange-400 to-orange-600' :
                  'bg-gradient-to-br from-emerald-400 to-emerald-600'
                }`}>
                  {selectedProduct.icon}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-3xl font-bold text-gray-900">{selectedProduct.name}</h3>
                    <div className="flex items-center space-x-1 bg-yellow-50 px-3 py-1 rounded-lg">
                      <Star className="w-5 h-5 text-yellow-500 fill-current" />
                      <span className="font-semibold text-gray-700">{selectedProduct.rating}</span>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-3">{selectedProduct.description}</p>
                  <div className="text-4xl font-bold text-green-600">₹{selectedProduct.price}</div>
                  <p className="text-sm text-gray-500">{selectedProduct.reviews} customer reviews</p>
                </div>
              </div>

              {/* Product Details Grid */}
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
                  <p className="text-sm font-medium text-gray-600 mb-1">Category</p>
                  <p className="text-lg font-bold text-gray-900 capitalize">{selectedProduct.category}</p>
                </div>
                <div className="bg-green-50 rounded-xl p-4 border-2 border-green-200">
                  <p className="text-sm font-medium text-gray-600 mb-1">Type</p>
                  <p className="text-lg font-bold text-gray-900">{selectedProduct.type}</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-4 border-2 border-purple-200">
                  <p className="text-sm font-medium text-gray-600 mb-1">Recommended Dosage</p>
                  <p className="text-lg font-bold text-gray-900">{selectedProduct.dosage}</p>
                </div>
                <div className="bg-orange-50 rounded-xl p-4 border-2 border-orange-200">
                  <p className="text-sm font-medium text-gray-600 mb-1">Package Size</p>
                  <p className="text-lg font-bold text-gray-900">{selectedProduct.unit}</p>
                </div>
              </div>

              {/* Benefits */}
              <div className="bg-green-50 rounded-xl p-6 mb-6 border-2 border-green-200">
                <h4 className="font-bold text-xl mb-4 flex items-center text-green-900">
                  <CheckCircle className="w-6 h-6 mr-2 text-green-600" />
                  Key Benefits
                </h4>
                <ul className="space-y-2">
                  {selectedProduct.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start space-x-3">
                      <div className="bg-green-200 rounded-full p-1 mt-0.5">
                        <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      </div>
                      <span className="text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Usage Instructions */}
              <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200">
                <h4 className="font-bold text-xl mb-3 flex items-center text-blue-900">
                  <AlertCircle className="w-6 h-6 mr-2 text-blue-600" />
                  Usage Instructions
                </h4>
                <p className="text-gray-700">{selectedProduct.usage}</p>
              </div>

              {/* Action Button */}
              <button
                onClick={() => {
                  addToCart(selectedProduct);
                  setSelectedProduct(null);
                }}
                className="w-full mt-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-lg font-bold text-lg hover:shadow-xl transition flex items-center justify-center space-x-2"
              >
                <ShoppingCart className="w-6 h-6" />
                <span>Add to Cart</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        @keyframes flash-highlight {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
          }
          50% {
            box-shadow: 0 0 0 20px rgba(34, 197, 94, 0.3);
          }
        }

        .flash-highlight {
          animation: flash-highlight 1s ease-in-out 3;
        }
      `}</style>
    </div>
  );
};

export default FertilizerPesticideShop;