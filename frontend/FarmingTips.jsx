import React, { useState, useEffect } from "react";
import image from "../data/images/farmingtipsimage1.jpg";
import  AgriBot  from "../data/images/Agrimascot.mp4";
import Chatbot from "./Chatbot";

const HERO_CONFIG = {
  backgroundImage: image,
};

const WHY_CHATBOT_CONFIG = {
  image: image,
};

// Why Chatbot Section Component
function WhyChatbotSection({ setIsOpen }) {
  return (
    <section className="why-chatbot-section">
      <div className="why-chatbot-container">
        {/* Left Side - Farming Image */}
        {/* Left Side - Farming Image / Video */}
        <div className="why-chatbot-image">
          <div className="farming-image-placeholder">
            <video
              src={AgriBot}
              autoPlay
              loop
              muted
              playsInline
              className="farming-video"
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </div>

        {/* Right Side - Content */}
        <div className="why-chatbot-content">
          <h2 className="why-chatbot-title">Welcome to AgriBot</h2>
          <p className="why-chatbot-subtitle">Why Our Chatbot?</p>
          
          <div className="chatbot-features">
            <div className="chatbot-feature-item">
              <span className="chatbot-feature-emoji">💭</span>
              <div className="chatbot-feature-text">
                <h4>Emotionally Intelligent</h4>
                <p>Understands your farming challenges with empathy and provides supportive guidance.</p>
              </div>
            </div>

            <div className="chatbot-feature-item">
              <span className="chatbot-feature-emoji">🌾</span>
              <div className="chatbot-feature-text">
                <h4>Agriculture Specialist</h4>
                <p>Specialized in crop care, soil management, and agricultural practices tailored to Indian farming.</p>
              </div>
            </div>

            <div className="chatbot-feature-item">
              <span className="chatbot-feature-emoji">🤝</span>
              <div className="chatbot-feature-text">
                <h4>Culturally Sensitive</h4>
                <p>Respects regional farming traditions while providing modern, practical solutions.</p>
              </div>
            </div>

            <div className="chatbot-feature-item">
              <span className="chatbot-feature-emoji">⚡</span>
              <div className="chatbot-feature-text">
                <h4>Instant & Available</h4>
                <p>Get answers 24/7. Immediate guidance for urgent farming decisions.</p>
              </div>
            </div>
          </div>

          <button className="why-chatbot-btn" onClick={() => setIsOpen(true)}>
            <span>🤖</span> Start Chatting Now
          </button>
        </div>
      </div>
    </section>
  );
}

function FarmingTips() {
  const [isOpen, setIsOpen] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTip, setSelectedTip] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      const interval = setInterval(() => {
        setShowPrompt(true);
        setTimeout(() => setShowPrompt(false), 1500);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const farmingTipsData = [
    {
      id: 1,
      crop: "Rice",
      icon: "🌱",
      gradient: "linear-gradient(135deg, #f6d365 0%, #fda085 100%)",
      basicTips: "Requires flooded fields, warm climate, and proper drainage",
      detailedTips: [
        "💧 Maintain water level of 2-4 inches during growing season",
        "📏 Plant in rows 8-12 inches apart for optimal growth",
        "🌱 Apply nitrogen fertilizer in split doses for better yield",
        "🚫 Control weeds during first 40 days after transplanting",
        "✂️ Harvest when 80-85% of grains turn golden yellow",
        "☀️ Ensure proper sun exposure of 6-8 hours daily"
      ],
      recommendedFertilizers: [
        {
          name: "Urea 46% N",
          dosage: "120 kg/ha in split doses",
          timing: "Apply during tillering, panicle initiation, and flowering stages",
          shopProductId: 2
        },
        {
          name: "DAP 18-46-0",
          dosage: "100 kg/ha",
          timing: "Basal application at transplanting",
          shopProductId: 3
        },
        {
          name: "Zinc Sulphate",
          dosage: "25 kg/ha",
          timing: "Apply in deficient soils before transplanting",
          shopProductId: 1
        }
      ]
    },
    {
      id: 2,
      crop: "Wheat",
      icon: "🌾",
      gradient: "linear-gradient(135deg, #f7971e 0%, #ffd200 100%)",
      basicTips: "Cool season crop, needs well-drained soil and moderate rainfall",
      detailedTips: [
        "🌱 Sow seeds at 1-2 inch depth in well-prepared soil",
        "🌡️ Optimal temperature for germination is 12-25°C",
        "⚗️ Apply phosphorus fertilizer at sowing time",
        "💦 Irrigate at critical stages: crown root, tillering, flowering",
        "🔍 Monitor for rust and aphid infestations regularly",
        "📊 Harvest when moisture content drops to 20-25%"
      ],
      recommendedFertilizers: [
        {
          name: "DAP 18-46-0",
          dosage: "100 kg/ha",
          timing: "Basal application at sowing",
          shopProductId: 3
        },
        {
          name: "Urea 46% N",
          dosage: "130 kg/ha in split doses",
          timing: "First irrigation and tillering stage",
          shopProductId: 2
        },
        {
          name: "Muriate of Potash",
          dosage: "40 kg/ha",
          timing: "Basal application",
          shopProductId: 5
        }
      ]
    },
    {
      id: 3,
      crop: "Tomato",
      icon: "🍅",
      gradient: "linear-gradient(135deg, #ff6b6b 0%, #ff8787 100%)",
      basicTips: "Needs warm weather, full sun, and consistent watering",
      detailedTips: [
        "🌱 Transplant seedlings after last frost date",
        "📐 Space plants 24-36 inches apart for air circulation",
        "🎋 Provide support with stakes or cages as plants grow",
        "💧 Water deeply 1-2 times per week, avoid wetting foliage",
        "🍂 Apply mulch to retain moisture and prevent disease",
        "✂️ Pinch off suckers for indeterminate varieties",
        "🎯 Harvest when fruits are fully colored but still firm"
      ],
      recommendedFertilizers: [
        {
          name: "NPK 20-20-0",
          dosage: "200 kg/ha",
          timing: "Split application - basal and flowering stage",
          shopProductId: 4
        },
        {
          name: "Vermicompost",
          dosage: "5 tons/ha",
          timing: "Mix with soil before transplanting",
          shopProductId: 42
        },
        {
          name: "Muriate of Potash",
          dosage: "60 kg/ha",
          timing: "During fruiting stage for better quality",
          shopProductId: 5
        }
      ]
    },
    {
      id: 4,
      crop: "Potato",
      icon: "🥔",
      gradient: "linear-gradient(135deg, #a8733f 0%, #d4a574 100%)",
      basicTips: "Grows best in cool weather with loose, well-drained soil",
      detailedTips: [
        "🌱 Plant seed potatoes 4 inches deep, 12 inches apart",
        "⛰️ Hill soil around plants as they grow to protect tubers",
        "💧 Maintain consistent soil moisture throughout growing season",
        "🚫 Avoid overhead watering to prevent fungal diseases",
        "⏸️ Stop watering 2 weeks before harvest for better storage",
        "🍂 Harvest when foliage dies back naturally",
        "📦 Cure potatoes in dark, humid conditions before storage"
      ],
      recommendedFertilizers: [
        {
          name: "NPK 20-20-0",
          dosage: "250 kg/ha",
          timing: "Basal application at planting",
          shopProductId: 4
        },
        {
          name: "Urea 46% N",
          dosage: "80 kg/ha",
          timing: "30-40 days after planting",
          shopProductId: 2
        },
        {
          name: "Vermicompost",
          dosage: "5 tons/ha",
          timing: "Mix with soil before planting",
          shopProductId: 42
        }
      ]
    },
    {
      id: 5,
      crop: "Cotton",
      icon: "☁️",
      gradient: "linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)",
      basicTips: "Requires long hot summers and moderate rainfall",
      detailedTips: [
        "🌡️ Plant when soil temperature reaches 60°F at 4-inch depth",
        "📊 Maintain plant population of 30,000-50,000 per acre",
        "🌿 Apply pre-emergence herbicides to control weeds",
        "🔍 Scout regularly for bollworms and aphids",
        "💧 Irrigate during flowering and boll development stages",
        "⚖️ Use growth regulators to manage plant height",
        "✂️ Harvest when 60% of bolls are open"
      ],
      recommendedFertilizers: [
        {
          name: "Urea 46% N",
          dosage: "100 kg/ha in split doses",
          timing: "Square formation and flowering",
          shopProductId: 2
        },
        {
          name: "DAP 18-46-0",
          dosage: "125 kg/ha",
          timing: "Basal application",
          shopProductId: 3
        },
        {
          name: "Muriate of Potash",
          dosage: "50 kg/ha",
          timing: "Flowering stage",
          shopProductId: 5
        }
      ]
    },
    {
      id: 6,
      crop: "Maize/Corn",
      icon: "🌽",
      gradient: "linear-gradient(135deg, #ffd89b 0%, #ffeaa7 100%)",
      basicTips: "Needs warm soil, full sun, and adequate nitrogen",
      detailedTips: [
        "🌱 Plant seeds 1-2 inches deep in rows 30 inches apart",
        "🌡️ Ensure soil temperature is above 50°F for germination",
        "⚗️ Side-dress with nitrogen when plants are knee-high",
        "💧 Provide 1-1.5 inches of water per week",
        "🌾 Plant in blocks rather than single rows for pollination",
        "🐛 Watch for corn borers and apply treatment if needed",
        "🌽 Harvest when kernels are plump and milky"
      ],
      recommendedFertilizers: [
        {
          name: "Urea 46% N",
          dosage: "150 kg/ha in split doses",
          timing: "Knee-high stage and tasseling",
          shopProductId: 2
        },
        {
          name: "DAP 18-46-0",
          dosage: "100 kg/ha",
          timing: "Basal application at sowing",
          shopProductId: 3
        },
        {
          name: "Zinc Sulphate",
          dosage: "25 kg/ha",
          timing: "In deficient soils at sowing",
          shopProductId: 1
        }
      ]
    },
    {
      id: 7,
      crop: "Sugarcane",
      icon: "🎋",
      gradient: "linear-gradient(135deg, #96e6a1 0%, #a8e063 100%)",
      basicTips: "Tropical crop requiring abundant water and sunshine",
      detailedTips: [
        "🌱 Plant stem cuttings with 2-3 buds in furrows",
        "⚗️ Maintain soil pH between 6.0-7.5 for optimal growth",
        "🌱 Apply heavy nitrogen fertilization in split doses",
        "💧 Irrigate every 7-10 days during dry periods",
        "🚫 Control weeds during first 90 days after planting",
        "📈 Harvest when sucrose content reaches peak levels",
        "♻️ Ratoon crops can be harvested 2-3 times from same planting"
      ],
      recommendedFertilizers: [
        {
          name: "Urea 46% N",
          dosage: "200 kg/ha in 3-4 split doses",
          timing: "30, 60, 90 days after planting",
          shopProductId: 2
        },
        {
          name: "DAP 18-46-0",
          dosage: "150 kg/ha",
          timing: "Basal application",
          shopProductId: 3
        },
        {
          name: "Muriate of Potash",
          dosage: "80 kg/ha",
          timing: "Tillering stage",
          shopProductId: 5
        }
      ]
    },
    {
      id: 8,
      crop: "Soybean",
      icon: "🫘",
      gradient: "linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)",
      basicTips: "Nitrogen-fixing legume, prefers warm season",
      detailedTips: [
        "🦠 Inoculate seeds with Rhizobium bacteria before planting",
        "🌱 Plant 1-1.5 inches deep when soil reaches 60°F",
        "📏 Maintain row spacing of 7.5-30 inches depending on region",
        "🚫 Avoid excessive nitrogen which reduces nodulation",
        "🔍 Scout for soybean cyst nematode and aphids",
        "💧 Irrigate during pod filling for maximum yield",
        "✂️ Harvest when leaves drop and pods rattle"
      ],
      recommendedFertilizers: [
        {
          name: "DAP 18-46-0",
          dosage: "80 kg/ha",
          timing: "Basal application (minimal nitrogen needed)",
          shopProductId: 3
        },
        {
          name: "Muriate of Potash",
          dosage: "60 kg/ha",
          timing: "Basal application for better pod formation",
          shopProductId: 5
        },
        {
          name: "Zinc Sulphate",
          dosage: "25 kg/ha",
          timing: "In deficient soils",
          shopProductId: 1
        }
      ]
    }
  ];

  // Always show 8 crops by default unless searching
  const displayedTips = searchQuery
    ? farmingTipsData.filter((tip) =>
        tip.crop.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : farmingTipsData.slice(0, 8);

  const filteredTips = displayedTips;

  // Navigate to shop with product highlight
  // productId: the product's id in MarketPlace
  // category: 'fertilizer' | 'organic' | 'seed' | 'pesticide'
  const goToShop = (productId, category = 'fertilizer') => {
    sessionStorage.setItem('highlightProductId', productId);
    sessionStorage.setItem('highlightCategory', category);
    window.location.hash = '#/marketplace';
    window.location.reload();
  };

  return (
    <div className="farming-tips-container">
      {/* Hero Section */}
      <section 
        className="hero-section"
        style={{
          backgroundImage: `url(${HERO_CONFIG.backgroundImage})`
        }}
      >
        <div className="hero-content">
          <h1 className="hero-title">
            <span className="hero-icon">🌱</span>
            Farming Tips Portal
          </h1>
          <p className="hero-subtitle">
            Discover expert agricultural guidance, best practices, and seasonal advice designed for Indian farmers
          </p>
          
          {/* Statistics Cards */}
          <div className="stats-container">
            <div className="stat-card">
              <div className="stat-icon">🌾</div>
              <div className="stat-number">16+</div>
              <div className="stat-label">Crop Varieties</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">🌍</div>
              <div className="stat-number">All</div>
              <div className="stat-label">Regions Covered</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">💡</div>
              <div className="stat-number">100+</div>
              <div className="stat-label">Expert Tips</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">🤖</div>
              <div className="stat-number">AI</div>
              <div className="stat-label">ChatBot Services</div>
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="search-section">
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="🔍 Search for a crop (e.g., Rice, Tomato, Wheat)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className="clear-search"
              onClick={() => setSearchQuery("")}
            >
              ✕
            </button>
          )}
        </div>
      </section>

      {/* Tips Grid Section */}
      <section className="tips-section">
        <div className="tips-header">
          <h2 className="section-title">
            {searchQuery
              ? `Search Results for "${searchQuery}"`
              : "Popular Farming Tips"}
          </h2>
          <p className="section-subtitle">
            {searchQuery
              ? `Found ${filteredTips.length} crop(s)`
              : "Click any card to view detailed tips and fertilizer recommendations"}
          </p>
        </div>

        <div className="tips-grid">
          {filteredTips.map((tip, index) => (
            <div
              key={tip.id}
              className={`tip-card ${selectedTip?.id === tip.id ? "active" : ""}`}
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => setSelectedTip(tip)}
            >
              <div className="tip-icon">{tip.icon}</div>
              <h3 className="tip-crop">{tip.crop}</h3>
              <p className="tip-basic">{tip.basicTips}</p>
              <button className="view-details-btn">
                View Detailed Tips & Fertilizers →
              </button>
            </div>
          ))}
        </div>

        {filteredTips.length === 0 && (
          <div className="no-results">
            <span className="no-results-icon">🔍</span>
            <h3>No crops found</h3>
            <p>Try searching for another crop or ask our chatbot for help</p>
          </div>
        )}
      </section>

      {/* Why Chatbot Section */}
      <WhyChatbotSection setIsOpen={setIsOpen} />

      {/* Recommended Fertilizers Section */}
      <section className="recommended-fertilizers-section">
        <div className="fertilizers-header">
          <h2 className="section-title fertilizers-title">
            <span className="fertilizer-icon">🌿</span>
            Essential Fertilizers
          </h2>
          <p className="section-subtitle">
            Top 3 fertilizers recommended for optimal crop growth
          </p>
        </div>
        
        <div className="fertilizers-showcase-grid">
          {/* Fertilizer 1: Urea */}
          <div className="fertilizer-showcase-card">
            <div className="fertilizer-showcase-icon">💧</div>
            <div>
              <h3 className="fertilizer-showcase-name">Urea 46% N</h3>
              <p className="fertilizer-showcase-desc">
                Essential nitrogen source for leafy growth and protein synthesis
              </p>
              <div className="fertilizer-showcase-details">
                <div className="detail-row">
                  <span className="detail-label">Typical Dosage:</span>
                  <span className="detail-value">100-150 kg/ha</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Application:</span>
                  <span className="detail-value">Split doses during growth stages</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Best For:</span>
                  <span className="detail-value">Rice, Wheat, Maize, Cotton</span>
                </div>
              </div>
              <button 
                className="get-fertilizer-btn"
                onClick={() => goToShop(2, 'fertilizer')}
              >
                🛒 View in Marketplace
              </button>
            </div>
          </div>

          {/* Fertilizer 2: DAP */}
          <div className="fertilizer-showcase-card">
            <div className="fertilizer-showcase-icon">🌟</div>
            <div>
              <h3 className="fertilizer-showcase-name">DAP 18-46-0</h3>
              <p className="fertilizer-showcase-desc">
                Phosphorus-rich fertilizer for strong root development and flowering
              </p>
              <div className="fertilizer-showcase-details">
                <div className="detail-row">
                  <span className="detail-label">Typical Dosage:</span>
                  <span className="detail-value">80-100 kg/ha</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Application:</span>
                  <span className="detail-value">Basal application at sowing</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Best For:</span>
                  <span className="detail-value">All crops, especially at planting</span>
                </div>
              </div>
              <button 
                className="get-fertilizer-btn"
                onClick={() => goToShop(3, 'fertilizer')}
              >
                🛒 View in Marketplace
              </button>
            </div>
          </div>

          {/* Fertilizer 3: Vermicompost */}
          <div className="fertilizer-showcase-card">
            <div className="fertilizer-showcase-icon">🪱</div>
            <div>
              <h3 className="fertilizer-showcase-name">Vermicompost</h3>
              <p className="fertilizer-showcase-desc">
                Organic nutrient-rich compost improving soil health and microbial activity
              </p>
              <div className="fertilizer-showcase-details">
                <div className="detail-row">
                  <span className="detail-label">Typical Dosage:</span>
                  <span className="detail-value">5 tons/ha</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Application:</span>
                  <span className="detail-value">Mix with soil before planting</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Best For:</span>
                  <span className="detail-value">Vegetables, organic farming</span>
                </div>
              </div>
              <button 
                className="get-fertilizer-btn"
                onClick={() => goToShop(42, 'organic')}
              >
                🛒 View in Marketplace
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Modal */}
      {selectedTip && (
        <div className="modal-overlay" onClick={() => setSelectedTip(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setSelectedTip(null)}
            >
              ✕
            </button>
            <div className="modal-header">
              <span className="modal-icon">{selectedTip.icon}</span>
              <h2 className="modal-title">{selectedTip.crop}</h2>
            </div>
            <div className="modal-body">
              <div className="basic-tip-highlight">
                <h3>Quick Overview</h3>
                <p>{selectedTip.basicTips}</p>
              </div>
              
              <h3 className="detailed-tips-heading">Detailed Growing Tips</h3>
              <ul className="detailed-tips-list">
                {selectedTip.detailedTips.map((detail, index) => (
                  <li key={index} className="detailed-tip-item">
                    <span className="tip-number">{index + 1}</span>
                    <span className="tip-text">{detail}</span>
                  </li>
                ))}
              </ul>

              {/* Recommended Fertilizers inside Modal */}
              <h3 className="detailed-tips-heading modal-fertilizers-heading">
                🌿 Recommended Fertilizers
              </h3>
              <div className="modal-fertilizers-grid">
                {selectedTip.recommendedFertilizers.map((fertilizer, index) => (
                  <div key={index} className="modal-fertilizer-card">
                    <div className="modal-fertilizer-top">
                      <span className="modal-fertilizer-index">{index + 1}</span>
                      <h4 className="modal-fertilizer-name">{fertilizer.name}</h4>
                    </div>
                    <div className="modal-fertilizer-details">
                      <div className="modal-detail-row">
                        <span className="modal-detail-label">📦 Dosage:</span>
                        <span className="modal-detail-value">{fertilizer.dosage}</span>
                      </div>
                      <div className="modal-detail-row">
                        <span className="modal-detail-label">⏱️ Timing:</span>
                        <span className="modal-detail-value">{fertilizer.timing}</span>
                      </div>
                    </div>
                    <button
                      className="modal-fertilizer-btn"
                      onClick={() => {
                        // Determine category: Vermicompost (id 42) is organic, rest are fertilizer
                        const category = fertilizer.shopProductId === 42 ? 'organic' : 'fertilizer';
                        goToShop(fertilizer.shopProductId, category);
                      }}
                    >
                      🛒 View in Marketplace
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chatbot Trigger Button */}
      {!isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            display: "flex",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          {showPrompt && (
            <div
              style={{
                backgroundColor: "#1b7d3f",
                color: "white",
                padding: "12px 20px",
                borderRadius: "25px",
                marginRight: "15px",
                boxShadow: "0 6px 18px rgba(27, 125, 63, 0.4)",
                animation: "softNudge 1.5s ease forwards",
                transform: "translateX(-10px)",
                fontSize: "1.1rem",
                fontWeight: "600",
              }}
            >
              Hi, talk to me for farming related ideas! 🌾
            </div>
          )}

          <div
            onClick={() => setIsOpen(true)}
            style={{
              backgroundColor: "#1b7d3f",
              color: "white",
              borderRadius: "50%",
              width: "70px",
              height: "70px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              cursor: "pointer",
              fontSize: "36px",
              boxShadow: "0 8px 24px rgba(27, 125, 63, 0.5)",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.4)";
              e.currentTarget.style.boxShadow = "0 12px 30px rgba(27, 125, 63, 0.6)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "0 8px 24px rgba(27, 125, 63, 0.5)";
            }}
          >
            🤖
          </div>
        </div>
      )}

      {isOpen && <Chatbot onClose={() => setIsOpen(false)} />}

      <style>
        {`
          @keyframes softNudge {
            0% { opacity: 0; transform: translateX(-20px); }
            50% { opacity: 1; transform: translateX(-5px); }
            100% { opacity: 0; transform: translateX(-10px); }
          }
        `}
      </style>
      <style>
        {farmingTipsStyles}
      </style>
    </div>
  );
}

const farmingTipsStyles = `
/* Farming Tips Container */
.farming-tips-container {
  background: #ffffff;
  min-height: 100vh;
  padding-bottom: 80px;
  position: relative;
  overflow-x: hidden;
}

/* Hero Section */
.hero-section {
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  padding: 90px 20px 100px; 
  text-align: center;
  color: white;
  position: relative;
  overflow: visible;
  min-height: 520px;
  animation: slideInPage 0.8s ease-out;
}

.hero-section::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 1;
}

.hero-content {
  max-width: 1400px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
}

.hero-title {
  font-size: 2.8rem;
  font-weight: 700;
  margin: 0 0 15px 0;
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.3);
  letter-spacing: 0.5px;
  animation: fadeInUp 0.8s ease 0.1s both;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 25px;
}

.hero-title .hero-icon {
  font-size: 2.8rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
  background: linear-gradient(135deg, #27ae60 0%, #1b7d3f 100%);
  width: 65px;
  height: 65px;
  border-radius: 15px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 20px rgba(27, 125, 63, 0.4);
  animation: heroPulse 2s ease-in-out infinite;
}

.hero-subtitle {
  font-size: 1.05rem;
  margin: 0 0 25px 0;
  opacity: 0.95;
  font-weight: 400;
  animation: fadeInUp 0.8s ease 0.2s both;
  text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.3);
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.5;
}

/* Statistics Cards */
.stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  max-width: 1000px;
  margin: 0 auto;
  margin-top: 40px; 
  animation: fadeInUp 0.8s ease 0.4s both;
}

.stat-card {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(8px);           
  border: 2px solid rgba(255, 255, 255, 0.5);
  border-radius: 15px;
  padding: 18px 15px;
  transition: all 0.4s ease;
  cursor: default;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.25);
}

.stat-card:hover {
  background: rgba(255, 255, 255, 0.45); 
  transform: translateY(-5px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35);
  border-color: rgba(255, 255, 255, 0.6);
}

.stat-icon {
  font-size: 2rem;
  margin-bottom: 10px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.stat-number {
  font-size: 1.7rem;
  font-weight: 700;
  margin-bottom: 5px;
  color: #fff;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.stat-label {
  font-size: 0.9rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.95);
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

/* Search Section */
.search-section {
  padding: 40px 20px 8px;
  max-width: 600px;
  margin: 0 auto;
  animation: slideInPage 0.8s ease-out 0.1s both;
  background: transparent;
}

.search-container {
  position: relative;
  animation: fadeInUp 0.8s ease 0.6s both;
}

.search-input {
  width: 100%;
  padding: 16px 50px 16px 20px;
  font-size: 0.95rem;
  border: 3px solid transparent;
  border-radius: 50px;
  outline: none;
  transition: all 0.4s ease;
  background: linear-gradient(white, white) padding-box,
              linear-gradient(135deg, #27ae60, #1b7d3f) border-box;
  box-shadow: 
    0 6px 18px rgba(0, 0, 0, 0.12),
    inset 0 2px 4px rgba(0, 0, 0, 0.05);
  font-weight: 500;
}

.search-input:focus {
  background: linear-gradient(white, white) padding-box,
              linear-gradient(135deg, #27ae60, #1b7d3f) border-box;
  box-shadow: 
    0 12px 35px rgba(27, 125, 63, 0.4),
    inset 0 2px 4px rgba(0, 0, 0, 0.05);
  transform: translateY(-3px);
}

.search-input::placeholder {
  color: #999;
  font-weight: 400;
}

.clear-search {
  position: absolute;
  right: 25px;
  top: 50%;
  transform: translateY(-50%);
  background: linear-gradient(135deg, #27ae60 0%, #1b7d3f 100%);
  color: white;
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  cursor: pointer;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(27, 125, 63, 0.4);
}

.clear-search:hover {
  background: linear-gradient(135deg, #1b7d3f 0%, #155c30 100%);
  transform: translateY(-50%) scale(1.15) rotate(90deg);
  box-shadow: 0 6px 18px rgba(27, 125, 63, 0.6);
}

/* Tips Section */
.tips-section {
  max-width: 1400px;
  margin: 0 auto;
  padding: 50px 20px;
  position: relative;
  z-index: 1;
  animation: slideInPage 0.8s ease-out;
  background: transparent;
}

.tips-header {
  text-align: center;
  margin-bottom: 35px;
  animation: slideInPage 0.8s ease-out 0.2s both;
}

.section-title {
  font-size: 2.1rem;
  font-weight: 700;
  background: linear-gradient(135deg, #1b7d3f 0%, #27ae60 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0 0 12px 0;
  text-shadow: 0 2px 8px rgba(39, 174, 96, 0.15);
}

.section-subtitle {
  font-size: 1.3rem;
  color: #1e1e1e;
  margin: 0;
  font-weight: 500;
  opacity: 0.8;
}

/* Tips Grid - 4 COLUMNS */
.tips-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 25px;
}

.tip-card {
  border-radius: 18px;
  padding: 16px;
  backdrop-filter: blur(15px);
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  box-shadow: 0 2px 8px rgba(27, 125, 63, 0.05), 0 1px 3px rgba(0, 0, 0, 0.03);
  border: 2px solid rgba(27, 125, 63, 0.3);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  animation: slideInCard 0.6s ease-out backwards;
}

.tip-card::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg, #27ae60 0%, #1b7d3f 100%);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.4s ease;
}

.tip-card:hover {
  transform: translateY(-8px);
  border: 2px solid #27ae60;
  box-shadow: 0 15px 35px rgba(39, 174, 96, 0.15), 0 4px 12px rgba(0, 0, 0, 0.1);
}

.tip-card:hover::before {
  transform: scaleX(1);
}

.tip-card.active {
  border: 2px solid #27ae60;
  box-shadow: 0 0 0 4px rgba(39, 174, 96, 0.15), 0 12px 28px rgba(39, 174, 96, 0.25);
}

.tip-icon {
  font-size: 3.2rem;
  margin-bottom: 12px;
  text-align: center;
  filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.18));
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
}

.tip-crop {
  font-size: 1.35rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 9px 0;
  text-align: center;
}

.tip-basic {
  font-size: 0.9rem;
  color: #34495e;
  line-height: 1.5;
  margin: 0 0 14px 0;
  text-align: center;
  font-weight: 500;
}

.view-details-btn {
  width: 100%;
  padding: 10px 18px;
  background: linear-gradient(135deg, #1b7d3f 0%, #27ae60 100%);
  color: white;
  border: 2px solid rgba(39, 174, 96, 0.5);
  border-radius: 50px;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 4px 12px rgba(39, 174, 96, 0.3);
}

.view-details-btn:hover {
  background: linear-gradient(135deg, #27ae60 0%, #1b7d3f 100%);
  color: white;
  transform: scale(1.08) translateY(-3px);
  box-shadow: 0 8px 20px rgba(39, 174, 96, 0.5), 0 0 15px rgba(39, 174, 96, 0.3);
  border-color: #27ae60;
}

/* No Results */
.no-results {
  text-align: center;
  padding: 100px 20px;
  animation: fadeIn 0.5s ease;
}

.no-results-icon {
  font-size: 6rem;
  display: block;
  margin-bottom: 25px;
}

.no-results h3 {
  font-size: 2.2rem;
  background: linear-gradient(135deg, #27ae60 0%, #1b7d3f 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0 0 15px 0;
  font-weight: 800;
}

.no-results p {
  font-size: 1.2rem;
  color: #1e1e1e;
  margin: 0;
  opacity: 0.7;
  font-weight: 500;
}

/* Why Chatbot Section */
.why-chatbot-section {
  background: linear-gradient(135deg, #0f2820 0%, #0d1f1a 100%);
  padding: 50px 20px;
  margin: 30px 0;
  border-top: 4px solid #27ae60;
  border-bottom: 4px solid #27ae60;
  box-shadow: 0 4px 20px rgba(27, 125, 63, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.6);
}

.why-chatbot-container {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 28px;
  align-items: center;
  animation: fadeInUp 0.8s ease;
}

.why-chatbot-image {
  position: relative;
  height: 350px;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(27, 125, 63, 0.2), 0 4px 16px rgba(0, 0, 0, 0.12);
  animation: slideInLeft 0.8s ease;
}

.farming-image-placeholder {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  border-radius: 20px;
}

.farming-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.why-chatbot-image:hover .farming-image {
  transform: scale(1.05);
}

.why-chatbot-content {
  padding: 20px;
  animation: slideInRight 0.8s ease;
}

.why-chatbot-title {
  font-size: 2rem;
  font-weight: 600;
  color: #27ae60;
  margin: 0 0 6px 0;
  letter-spacing: -0.5px;
}

.why-chatbot-subtitle {
  font-size: 1rem;
  color: #a8d5a8;
  margin: 0 0 20px 0;
  font-weight: 600;
}

.chatbot-features {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 18px;
}

.chatbot-feature-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 14px;
  background: rgba(39, 174, 96, 0.1);
  border-radius: 12px;
  border-left: 4px solid #27ae60;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.chatbot-feature-item:hover {
  transform: translateX(8px);
  box-shadow: 0 6px 25px rgba(27, 125, 63, 0.15);
}

.chatbot-feature-emoji {
  font-size: 1.5rem;
  flex-shrink: 0;
  filter: drop-shadow(0 2px 4px rgba(27, 125, 63, 0.1));
}

.chatbot-feature-text h4 {
  font-size: 0.95rem;
  font-weight: 700;
  color: #27ae60;
  margin: 0 0 4px 0;
}

.chatbot-feature-text p {
  font-size: 0.8rem;
  color: #c8e6c9;
  margin: 0;
  line-height: 1.4;
}

.why-chatbot-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 14px 35px;
  background: linear-gradient(135deg, #27ae60 0%, #1b7d3f 100%);
  color: white;
  border: 2px solid #27ae60;
  border-radius: 50px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 24px rgba(39, 174, 96, 0.3);
  letter-spacing: 0.3px;
}

.why-chatbot-btn:hover {
  background: linear-gradient(135deg, #1b7d3f 0%, #155c30 100%);
  transform: translateY(-3px);
  box-shadow: 0 12px 35px rgba(39, 174, 96, 0.5);
  border-color: #27ae60;
}

.why-chatbot-btn span {
  font-size: 1.3rem;
  animation: bounce 2s ease infinite;
}

/* Modal Overlay */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(12px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
  padding: 20px;
  animation: fadeIn 0.3s ease;
}

.modal-content {
  background: white;
  border-radius: 30px;
  max-width: 900px;
  width: 100%;
  max-height: 88vh;
  overflow-y: auto;
  position: relative;
  animation: modalSlideUp 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.4), 0 2px 12px rgba(27, 125, 63, 0.15);
}

@keyframes modalSlideUp {
  from {
    opacity: 0;
    transform: translateY(100px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-close {
  position: absolute;
  top: 25px;
  right: 25px;
  width: 45px;
  height: 45px;
  border-radius: 50%;
  background: linear-gradient(135deg, #27ae60 0%, #1b7d3f 100%);
  color: white;
  border: 3px solid rgba(255, 255, 255, 0.5);
  font-size: 1.6rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.4s ease;
  z-index: 10;
  box-shadow: 0 6px 20px rgba(27, 125, 63, 0.5);
  font-weight: 700;
}

.modal-close:hover {
  background: linear-gradient(135deg, #1b7d3f 0%, #155c30 100%);
  transform: rotate(180deg) scale(1.15);
  box-shadow: 0 10px 28px rgba(27, 125, 63, 0.6);
}

.modal-header {
  padding: 50px 40px;
  text-align: center;
  border-radius: 30px 30px 0 0;
  background: linear-gradient(135deg, #27ae60 0%, #1b7d3f 100%);
  color: white;
  position: relative;
  box-shadow: 0 8px 20px rgba(27, 125, 63, 0.2);
}

.modal-icon {
  font-size: 6rem;
  display: block;
  margin-bottom: 20px;
  filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.3));
  animation: bounce 2s ease infinite;
}

.modal-title {
  font-size: 2.8rem;
  font-weight: 900;
  margin: 0;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.modal-body {
  padding: 32px;
}

.basic-tip-highlight {
  background: linear-gradient(135deg, #f0fff0 0%, #e8f7e8 100%);
  padding: 18px 20px;
  border-radius: 16px;
  margin-bottom: 24px;
  border-left: 5px solid #27ae60;
  box-shadow: 0 3px 12px rgba(27, 125, 63, 0.1), 0 1px 4px rgba(0, 0, 0, 0.05);
}

.basic-tip-highlight h3 {
  font-size: 1.15rem;
  color: #27ae60;
  margin: 0 0 8px 0;
  font-weight: 700;
}

.basic-tip-highlight p {
  font-size: 0.95rem;
  color: #2c3e50;
  margin: 0;
  line-height: 1.6;
  font-weight: 500;
}

.detailed-tips-heading {
  font-size: 1.35rem;
  color: #27ae60;
  margin: 0 0 16px 0;
  font-weight: 700;
}

.modal-fertilizers-heading {
  margin-top: 28px;
}

.detailed-tips-list {
  list-style: none;
  padding: 0;
  margin: 0 0 28px 0;
}

.detailed-tip-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
  padding: 14px;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-radius: 12px;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.04), 0 2px 4px rgba(27, 125, 63, 0.05);
}

.detailed-tip-item:hover {
  background: linear-gradient(135deg, #f0fff0 0%, #f8f9fa 100%);
  transform: translateX(8px);
  border-color: rgba(27, 125, 63, 0.3);
  box-shadow: 0 4px 15px rgba(27, 125, 63, 0.15);
}

.tip-number {
  background: linear-gradient(135deg, #27ae60 0%, #1b7d3f 100%);
  color: white;
  min-width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.8rem;
  flex-shrink: 0;
  box-shadow: 0 3px 10px rgba(27, 125, 63, 0.3);
}

.tip-text {
  font-size: 0.9rem;
  color: #2c3e50;
  line-height: 1.5;
  flex: 1;
  font-weight: 500;
}

/* Modal Fertilizers Grid */
.modal-fertilizers-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}

.modal-fertilizer-card {
  background: linear-gradient(135deg, #f0fff0 0%, #f8faf8 100%);
  border: 2px solid rgba(39, 174, 96, 0.25);
  border-radius: 14px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(27, 125, 63, 0.07);
}

.modal-fertilizer-card:hover {
  transform: translateY(-4px);
  border-color: #27ae60;
  box-shadow: 0 10px 25px rgba(39, 174, 96, 0.18);
}

.modal-fertilizer-top {
  display: flex;
  align-items: center;
  gap: 10px;
}

.modal-fertilizer-index {
  background: linear-gradient(135deg, #27ae60 0%, #1b7d3f 100%);
  color: white;
  min-width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.78rem;
  flex-shrink: 0;
  box-shadow: 0 3px 8px rgba(27, 125, 63, 0.3);
}

.modal-fertilizer-name {
  font-size: 0.95rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.modal-fertilizer-details {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

.modal-detail-row {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.modal-detail-label {
  font-size: 0.68rem;
  font-weight: 700;
  color: #27ae60;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.modal-detail-value {
  font-size: 0.78rem;
  color: #374151;
  font-weight: 500;
  line-height: 1.4;
}

.modal-fertilizer-btn {
  width: 100%;
  padding: 9px 12px;
  background: linear-gradient(135deg, #1b7d3f 0%, #27ae60 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 2px 8px rgba(39, 174, 96, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  border: 1px solid rgba(39, 174, 96, 0.4);
  margin-top: auto;
}

.modal-fertilizer-btn:hover {
  background: linear-gradient(135deg, #27ae60 0%, #1b7d3f 100%);
  transform: scale(1.06) translateY(-2px);
  box-shadow: 0 6px 16px rgba(39, 174, 96, 0.5);
}

/* Recommended Fertilizers Section */
.recommended-fertilizers-section {
  max-width: 1400px;
  margin: 0 auto;
  padding: 50px 20px;
  border-radius: 30px;
  background: linear-gradient(135deg, rgba(15, 40, 32, 0.03) 0%, rgba(27, 174, 96, 0.02) 100%);
  box-shadow: 0 4px 15px rgba(27, 125, 63, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.5);
}

.fertilizers-header {
  text-align: center;
  margin-bottom: 35px;
}

.fertilizers-header .section-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
}

.fertilizers-header .fertilizer-icon {
  font-size: 3rem;
  filter: drop-shadow(0 2px 6px rgba(27, 125, 63, 0.4));
}

.fertilizers-showcase-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 20px;
}

.fertilizer-showcase-card {
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 15px;
  padding: 20px;
  transition: all 0.4s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.03);
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 16px;
  align-items: flex-start;
  position: relative;
  overflow: hidden;
}

.fertilizer-showcase-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(135deg, #27ae60 0%, #1b7d3f 100%);
  transition: width 0.4s ease;
}

.fertilizer-showcase-card:hover {
  transform: translateY(-8px) translateX(4px);
  box-shadow: 0 15px 35px rgba(39, 174, 96, 0.15), 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #27ae60;
}

.fertilizer-showcase-card:hover::before {
  width: 100%;
  opacity: 0.08;
}

.fertilizer-showcase-card:hover .fertilizer-showcase-icon {
  transform: scale(1.15) rotate(5deg);
}

.fertilizer-showcase-icon {
  font-size: 3.5rem;
  flex-shrink: 0;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.05));
  transition: transform 0.4s ease;
}

.fertilizer-showcase-name {
  font-size: 1.2rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 8px 0;
  text-align: left;
}

.fertilizer-showcase-desc {
  font-size: 0.85rem;
  color: #4b5563;
  line-height: 1.5;
  margin: 0 0 12px 0;
  text-align: left;
  min-height: auto;
}

.fertilizer-showcase-details {
  margin-bottom: 12px;
  padding: 12px;
  background: linear-gradient(135deg, #f0fff0 0%, #f8faf8 100%);
  border-radius: 10px;
  border-left: 3px solid #27ae60;
  width: 100%;
}

.fertilizer-showcase-details .detail-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 10px;
}

.fertilizer-showcase-details .detail-row:last-child {
  margin-bottom: 0;
}

.fertilizer-showcase-details .detail-label {
  font-weight: 700;
  color: #27ae60;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.fertilizer-showcase-details .detail-value {
  color: #2c3e50;
  font-size: 0.78rem;
  font-weight: 600;
  padding-left: 0;
}

.get-fertilizer-btn {
  width: 100%;
  padding: 10px 14px;
  background: linear-gradient(135deg, #1b7d3f 0%, #27ae60 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 2px 8px rgba(39, 174, 96, 0.3);
  letter-spacing: 0.3px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: 1px solid rgba(39, 174, 96, 0.4);
}

.get-fertilizer-btn:hover {
  background: linear-gradient(135deg, #27ae60 0%, #1b7d3f 100%);
  color: white;
  transform: scale(1.08) translateY(-3px);
  box-shadow: 0 6px 16px rgba(39, 174, 96, 0.5), 0 0 12px rgba(39, 174, 96, 0.3);
  border-color: #27ae60;
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInCard {
  from {
    opacity: 0;
    transform: translateY(40px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes slideInPage {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes heroPulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 8px 20px rgba(27, 125, 63, 0.4);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 12px 30px rgba(27, 125, 63, 0.7);
  }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
}

@keyframes buttonPulse {
  0% { box-shadow: 0 2px 8px rgba(39, 174, 96, 0.3); }
  50% { box-shadow: 0 8px 20px rgba(39, 174, 96, 0.5), 0 0 15px rgba(39, 174, 96, 0.3); }
  100% { box-shadow: 0 2px 8px rgba(39, 174, 96, 0.3); }
}

/* Responsive Design */
@media (max-width: 1200px) {
  .why-chatbot-container {
    gap: 40px;
  }

  .why-chatbot-image {
    height: 400px;
  }

  .fertilizers-showcase-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 1024px) {
  .why-chatbot-container {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .why-chatbot-image {
    height: 250px;
  }

  .why-chatbot-title {
    font-size: 1.6rem;
  }

  .why-chatbot-subtitle {
    font-size: 0.9rem;
  }

  .tips-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .fertilizers-showcase-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .modal-fertilizers-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2.2rem;
  }

  .section-title {
    font-size: 1.8rem;
  }

  .section-subtitle {
    font-size: 1rem;
  }

  .tips-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  .tip-card {
    padding: 15px;
  }

  .why-chatbot-section {
    padding: 35px 20px;
    margin: 12px 0;
  }

  .why-chatbot-image {
    height: 220px;
    border-radius: 15px;
  }

  .why-chatbot-title {
    font-size: 1.4rem;
  }

  .why-chatbot-subtitle {
    font-size: 0.85rem;
  }

  .chatbot-feature-item {
    padding: 12px;
    gap: 10px;
  }

  .chatbot-feature-emoji {
    font-size: 1.3rem;
  }

  .chatbot-feature-text h4 {
    font-size: 0.9rem;
  }

  .chatbot-feature-text p {
    font-size: 0.75rem;
  }

  .recommended-fertilizers-section {
    padding: 30px 20px;
  }

  .fertilizers-showcase-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  .modal-fertilizers-grid {
    grid-template-columns: 1fr;
  }

  .modal-header {
    padding: 30px 20px;
  }

  .modal-title {
    font-size: 2rem;
  }

  .modal-body {
    padding: 20px;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 1.8rem;
  }

  .hero-subtitle {
    font-size: 0.95rem;
  }

  .stats-container {
    grid-template-columns: 1fr;
  }

  .section-title {
    font-size: 1.5rem;
  }

  .tips-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .why-chatbot-section {
    padding: 25px 15px;
    margin: 10px 0;
  }

  .why-chatbot-container {
    gap: 15px;
  }

  .why-chatbot-image {
    height: 180px;
    border-radius: 12px;
  }

  .why-chatbot-title {
    font-size: 1.3rem;
  }

  .why-chatbot-subtitle {
    font-size: 0.8rem;
  }

  .chatbot-feature-item {
    padding: 10px;
    gap: 8px;
  }

  .chatbot-feature-emoji {
    font-size: 1.2rem;
  }

  .why-chatbot-btn {
    width: 100%;
    padding: 10px 18px;
    font-size: 0.9rem;
  }

  .recommended-fertilizers-section {
    padding: 25px 15px;
  }

  .fertilizer-showcase-card {
    padding: 12px;
  }

  .fertilizer-showcase-name {
    font-size: 0.95rem;
  }

  .modal-icon {
    font-size: 4rem;
  }

  .modal-title {
    font-size: 1.6rem;
  }

  .modal-fertilizers-grid {
    grid-template-columns: 1fr;
  }
}
  .farming-video {
  width: 100%;
  height: auto;
  border-radius: 15px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  object-fit: cover;
}

/* Scrollbar Styling */
.modal-content::-webkit-scrollbar {
  width: 10px;
}

.modal-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.modal-content::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #27ae60 0%, #1b7d3f 100%);
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(27, 125, 63, 0.2);
}

.modal-content::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #1b7d3f 0%, #155c30 100%);
}
`;

// ─── MARKETPLACE PATCH NOTE ────────────────────────────────────────────────
// In MarketPlace.jsx, replace the existing useEffect that reads sessionStorage
// with the updated version below. This correctly handles fertilizer/organic
// categories (not just seeds) when navigating from FarmingTips.
//
// REPLACE the block starting with:
//   useEffect(() => {
//     // Inject flash-highlight CSS once
//
// WITH:
//
// useEffect(() => {
//   const styleId = 'flash-highlight-style';
//   if (!document.getElementById(styleId)) {
//     const style = document.createElement('style');
//     style.id = styleId;
//     style.textContent = `
//       @keyframes flashPulse {
//         0%   { box-shadow: 0 0 0 0 rgba(34,197,94,0.8), 0 0 0 0 rgba(34,197,94,0.4); }
//         30%  { box-shadow: 0 0 0 12px rgba(34,197,94,0.5), 0 0 32px 8px rgba(34,197,94,0.3); }
//         60%  { box-shadow: 0 0 0 6px rgba(34,197,94,0.3), 0 0 16px 4px rgba(34,197,94,0.15); }
//         100% { box-shadow: 0 0 0 0 rgba(34,197,94,0), 0 0 0 0 rgba(34,197,94,0); }
//       }
//       .flash-highlight {
//         animation: flashPulse 1s ease-out 3;
//         outline: 3px solid #22c55e !important;
//         outline-offset: 2px;
//       }
//     `;
//     document.head.appendChild(style);
//   }
//
//   const productId = sessionStorage.getItem('highlightProductId');
//   const category  = sessionStorage.getItem('highlightCategory'); // NEW: 'fertilizer' | 'organic' | 'seed' etc.
//   const cropName  = sessionStorage.getItem('highlightCropName');
//
//   if (productId) {
//     const id = parseInt(productId);
//     setHighlightedProductId(id);
//
//     // Set correct category filter so the card is visible
//     if (category) {
//       setSelectedCategory(category);
//     } else {
//       setSelectedCategory('all');
//     }
//
//     // Clear sessionStorage
//     sessionStorage.removeItem('highlightProductId');
//     sessionStorage.removeItem('highlightCategory');
//     sessionStorage.removeItem('highlightCropName');
//
//     // If crop name stored, pre-fill search
//     if (cropName) {
//       const displayName = cropName.charAt(0).toUpperCase() + cropName.slice(1);
//       setSearchQuery(displayName);
//     }
//
//     // Scroll to highlighted product after render
//     setTimeout(() => {
//       const productElement = document.getElementById(`product-${id}`);
//       if (productElement) {
//         productElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
//         productElement.classList.add('flash-highlight');
//         setTimeout(() => {
//           productElement.classList.remove('flash-highlight');
//           setHighlightedProductId(null);
//         }, 3500);
//       }
//     }, 600);
//   }
// }, []);
// ─── END MARKETPLACE PATCH NOTE ─────────────────────────────────────────────

export default FarmingTips;