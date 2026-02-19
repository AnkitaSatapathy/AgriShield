import React, { useState, useEffect } from "react";
import Chatbot from "./Chatbot";


const HERO_CONFIG = {

  backgroundImage: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1920&q=80",
};

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
          shopProductId: 12
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
          shopProductId: 12
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
    },
    {
      id: 9,
      crop: "Peanut",
      icon: "🥜",
      gradient: "linear-gradient(135deg, #d4a574 0%, #e8b866 100%)",
      basicTips: "Warm season legume needing loose, sandy soil",
      detailedTips: [
        "🌱 Plant shelled seeds 1-2 inches deep after last frost",
        "📏 Space plants 6-8 inches apart in rows 24-36 inches wide",
        "⚗️ Calcium is essential during pegging stage",
        "💧 Maintain even moisture but avoid waterlogging",
        "⛰️ Hill soil around plants to cover developing pegs",
        "🔍 Monitor for leaf spot diseases and thrips",
        "✂️ Dig when leaves turn yellow and pods have darkened veins"
      ],
      recommendedFertilizers: [
        {
          name: "DAP 18-46-0",
          dosage: "50 kg/ha",
          timing: "Basal application (minimal nitrogen)",
          shopProductId: 3
        },
        {
          name: "Muriate of Potash",
          dosage: "50 kg/ha",
          timing: "Basal application",
          shopProductId: 5
        },
        {
          name: "Vermicompost",
          dosage: "5 tons/ha",
          timing: "Mix with soil before planting",
          shopProductId: 12
        }
      ]
    },
    {
      id: 10,
      crop: "Sunflower",
      icon: "🌻",
      gradient: "linear-gradient(135deg, #ffd89b 0%, #ffb347 100%)",
      basicTips: "Hardy crop tolerating various soil types",
      detailedTips: [
        "🌱 Direct sow seeds 1-2 inches deep after frost danger",
        "📏 Space plants 6-12 inches apart depending on variety",
        "🎋 Provide support for tall varieties in windy areas",
        "⚗️ Fertilize sparingly as excess nitrogen delays flowering",
        "💧 Water deeply but infrequently to encourage deep roots",
        "🦅 Protect developing heads from birds with netting",
        "✂️ Harvest when back of head turns yellow-brown"
      ],
      recommendedFertilizers: [
        {
          name: "Urea 46% N",
          dosage: "60 kg/ha",
          timing: "Moderate application at vegetative stage",
          shopProductId: 2
        },
        {
          name: "DAP 18-46-0",
          dosage: "100 kg/ha",
          timing: "Basal application",
          shopProductId: 3
        },
        {
          name: "Muriate of Potash",
          dosage: "40 kg/ha",
          timing: "Flowering stage",
          shopProductId: 5
        }
      ]
    },
    {
      id: 11,
      crop: "Carrot",
      icon: "🥕",
      gradient: "linear-gradient(135deg, #ff9a56 0%, #ff6347 100%)",
      basicTips: "Root vegetable requiring loose, deep soil",
      detailedTips: [
        "🌱 Sow seeds directly 1/4 inch deep in fine soil",
        "✂️ Thin seedlings to 2-3 inches apart when 2 inches tall",
        "💧 Keep soil consistently moist for germination",
        "🚫 Avoid fresh manure which causes forked roots",
        "🍂 Mulch to maintain moisture and prevent green shoulders",
        "📏 Pull larger carrots first to give others room to grow",
        "⏱️ Harvest timing varies by variety: 50-80 days"
      ],
      recommendedFertilizers: [
        {
          name: "NPK 20-20-0",
          dosage: "100 kg/ha",
          timing: "Basal application",
          shopProductId: 4
        },
        {
          name: "Vermicompost",
          dosage: "5 tons/ha",
          timing: "Well-decomposed organic matter before sowing",
          shopProductId: 12
        },
        {
          name: "Muriate of Potash",
          dosage: "40 kg/ha",
          timing: "Root development stage",
          shopProductId: 5
        }
      ]
    },
    {
      id: 12,
      crop: "Onion",
      icon: "🧅",
      gradient: "linear-gradient(135deg, #f8e1a5 0%, #e8d4a2 100%)",
      basicTips: "Cool season crop with shallow root system",
      detailedTips: [
        "🌱 Plant sets or transplants in early spring",
        "📏 Space plants 4-6 inches apart in rows 12 inches wide",
        "💧 Keep soil consistently moist but not waterlogged",
        "⚗️ Apply nitrogen fertilizer every 2-3 weeks",
        "⏸️ Stop watering when tops begin to fall over",
        "🌬️ Cure bulbs in warm, dry, ventilated area for 2 weeks",
        "📦 Store in cool, dry place with good air circulation"
      ],
      recommendedFertilizers: [
        {
          name: "Urea 46% N",
          dosage: "100 kg/ha in split doses",
          timing: "Every 2-3 weeks during growing season",
          shopProductId: 2
        },
        {
          name: "DAP 18-46-0",
          dosage: "80 kg/ha",
          timing: "Basal application at transplanting",
          shopProductId: 3
        },
        {
          name: "Muriate of Potash",
          dosage: "50 kg/ha",
          timing: "Bulb formation stage",
          shopProductId: 5
        }
      ]
    },
    {
      id: 13,
      crop: "Cabbage",
      icon: "🥬",
      gradient: "linear-gradient(135deg, #96e6a1 0%, #7dd87d 100%)",
      basicTips: "Cool weather crop, frost tolerant",
      detailedTips: [
        "🌱 Start seeds indoors 6-8 weeks before last frost",
        "📏 Transplant seedlings 12-24 inches apart",
        "💧 Provide consistent moisture for tight head formation",
        "🛡️ Use row covers to protect from cabbage worms",
        "⚗️ Apply balanced fertilizer at transplanting and mid-season",
        "✂️ Harvest when heads are firm and before splitting",
        "🌱 Cut heads leaving stem and roots for potential side shoots"
      ],
      recommendedFertilizers: [
        {
          name: "NPK 20-20-0",
          dosage: "150 kg/ha",
          timing: "Split application - transplanting and head formation",
          shopProductId: 4
        },
        {
          name: "Urea 46% N",
          dosage: "80 kg/ha",
          timing: "During head development",
          shopProductId: 2
        },
        {
          name: "Vermicompost",
          dosage: "5 tons/ha",
          timing: "Mix with soil before transplanting",
          shopProductId: 12
        }
      ]
    },
    {
      id: 14,
      crop: "Pepper",
      icon: "🌶️",
      gradient: "linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)",
      basicTips: "Warm season crop requiring full sun",
      detailedTips: [
        "🌱 Start seeds indoors 8-10 weeks before last frost",
        "🌡️ Transplant when soil temperature reaches 65°F",
        "📏 Space plants 18-24 inches apart for air flow",
        "🍂 Mulch heavily to maintain soil temperature and moisture",
        "⚗️ Fertilize with low nitrogen, high phosphorus blend",
        "🎋 Provide support for heavy-bearing varieties",
        "✂️ Harvest bell peppers when full size, any color stage"
      ],
      recommendedFertilizers: [
        {
          name: "NPK 20-20-0",
          dosage: "120 kg/ha",
          timing: "Transplanting and flowering",
          shopProductId: 4
        },
        {
          name: "Muriate of Potash",
          dosage: "60 kg/ha",
          timing: "Fruiting stage for better quality",
          shopProductId: 5
        },
        {
          name: "Vermicompost",
          dosage: "5 tons/ha",
          timing: "Mix with soil before transplanting",
          shopProductId: 12
        }
      ]
    },
    {
      id: 15,
      crop: "Cucumber",
      icon: "🥒",
      gradient: "linear-gradient(135deg, #8dd893 0%, #6bcf7f 100%)",
      basicTips: "Warm season vine crop, heavy feeder",
      detailedTips: [
        "🌱 Direct sow or transplant after all frost danger passes",
        "📏 Plant in hills or rows with 36-60 inch spacing",
        "🎋 Provide trellis for vertical growing and cleaner fruits",
        "💧 Water deeply and consistently, especially during fruiting",
        "🍂 Apply mulch to conserve moisture and prevent disease",
        "✂️ Pick fruits regularly to encourage continued production",
        "🔍 Monitor for cucumber beetles and powdery mildew"
      ],
      recommendedFertilizers: [
        {
          name: "NPK 20-20-0",
          dosage: "100 kg/ha",
          timing: "Basal and flowering stage",
          shopProductId: 4
        },
        {
          name: "Urea 46% N",
          dosage: "60 kg/ha",
          timing: "Split application during vine growth",
          shopProductId: 2
        },
        {
          name: "Vermicompost",
          dosage: "5 tons/ha",
          timing: "Mix with soil before planting",
          shopProductId: 12
        }
      ]
    },
    {
      id: 16,
      crop: "Lettuce",
      icon: "🥗",
      gradient: "linear-gradient(135deg, #c1f5c5 0%, #a8e6cf 100%)",
      basicTips: "Cool season crop, quick growing",
      detailedTips: [
        "🌱 Sow seeds 1/4 inch deep in cool weather",
        "📏 Thin to 6-12 inches apart depending on variety",
        "🌤️ Provide afternoon shade in warmer climates",
        "💧 Keep soil consistently moist for tender leaves",
        "♻️ Use succession planting for continuous harvest",
        "✂️ Harvest leaf varieties by cutting outer leaves",
        "🎯 Pull head varieties when firm but before bolting"
      ],
      recommendedFertilizers: [
        {
          name: "Urea 46% N",
          dosage: "40 kg/ha",
          timing: "Light application for leafy growth",
          shopProductId: 2
        },
        {
          name: "NPK 20-20-0",
          dosage: "80 kg/ha",
          timing: "Basal application",
          shopProductId: 4
        },
        {
          name: "Vermicompost",
          dosage: "5 tons/ha",
          timing: "Mix with soil before sowing",
          shopProductId: 12
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

  // Navigate to shop with product filter
  const goToShop = (productId) => {
    sessionStorage.setItem('highlightProductId', productId);
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
              className="tip-card"
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

              {/* Fertilizer Recommendations Section */}
              <div className="fertilizer-section">
                <h3 className="fertilizer-heading">
                  <span className="fertilizer-icon">🌿</span>
                  Recommended Fertilizers
                </h3>
                <div className="fertilizer-grid">
                  {selectedTip.recommendedFertilizers.map((fertilizer, index) => (
                    <div key={index} className="fertilizer-card">
                      <div className="fertilizer-header">
                        <h4 className="fertilizer-name">{fertilizer.name}</h4>
                      </div>
                      <div className="fertilizer-details">
                        <div className="fertilizer-detail-row">
                          <span className="detail-label">📊 Dosage:</span>
                          <span className="detail-value">{fertilizer.dosage}</span>
                        </div>
                        <div className="fertilizer-detail-row">
                          <span className="detail-label">⏰ Timing:</span>
                          <span className="detail-value">{fertilizer.timing}</span>
                        </div>
                      </div>
                      <button
                        className="get-fertilizer-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          goToShop(fertilizer.shopProductId);
                        }}
                      >
                        🛒 Get This Product
                      </button>
                    </div>
                  ))}
                </div>
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
                backgroundColor: "#4CAF50",
                color: "white",
                padding: "12px 20px",
                borderRadius: "25px",
                marginRight: "15px",
                boxShadow: "0 6px 18px rgba(76, 175, 80, 0.4)",
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
              backgroundColor: "#4CAF50",
              color: "white",
              borderRadius: "50%",
              width: "70px",
              height: "70px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              cursor: "pointer",
              fontSize: "36px",
              boxShadow: "0 8px 24px rgba(76, 175, 80, 0.5)",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.4)";
              e.currentTarget.style.boxShadow = "0 12px 30px rgba(76, 175, 80, 0.6)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "0 8px 24px rgba(76, 175, 80, 0.5)";
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
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f9e8 0%, #e8f5d1 25%, #d4e89f 50%, #c4d98f 75%, #a8c969 100%);
  background-size: 400% 400%;
  animation: gradientShift 20s ease infinite;
  padding-bottom: 80px;
  position: relative;
  overflow-x: hidden;
}

.farming-tips-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.15) 0%, transparent 50%);
  pointer-events: none;
  animation: floatingOverlay 15s ease-in-out infinite;
}

@keyframes floatingOverlay {
  0%, 100% {
    transform: translateY(0px) translateX(0px);
  }
  50% {
    transform: translateY(-15px) translateX(10px);
  }
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* Hero Section */
.hero-section {
  background: linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)),
    url('https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1920') center/cover;
  padding: 80px 20px 100px;
  text-align: center;
  color: white;
  position: relative;
  overflow: hidden;
  min-height: 550px;
  animation: slideInPage 0.8s ease-out;
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
  margin: 0 0 25px 0;
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
  background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
  width: 65px;
  height: 65px;
  border-radius: 15px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 20px rgba(74, 222, 128, 0.4);
  animation: heroPulse 2s ease-in-out infinite;
}

.hero-subtitle {
  font-size: 1.05rem;
  margin: 0 0 35px 0;
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
  animation: fadeInUp 0.8s ease 0.4s both;
}

.stat-card {
  background: rgba(255, 255, 255, 0.15); /* more visible */
  backdrop-filter: blur(8px);           
  border: 2px solid rgba(255, 255, 255, 0.5); /* brighter border */
  border-radius: 15px;
  padding: 18px 15px;
  transition: all 0.4s ease;
  cursor: default;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.25); /* subtle lift */
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
  padding: 30px 20px;
  max-width: 600px;
  margin: 0 auto;
  animation: slideInPage 0.8s ease-out 0.1s both;
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
              linear-gradient(135deg, #667eea, #764ba2) border-box;
  box-shadow: 
    0 6px 18px rgba(0, 0, 0, 0.12),
    inset 0 2px 4px rgba(0, 0, 0, 0.05);
  font-weight: 500;
}

.search-input:focus {
  background: linear-gradient(white, white) padding-box,
              linear-gradient(135deg, #f093fb, #f5576c) border-box;
  box-shadow: 
    0 12px 35px rgba(102, 126, 234, 0.4),
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
  background: linear-gradient(135deg, #f5576c 0%, #f093fb 100%);
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
  box-shadow: 0 4px 12px rgba(245, 87, 108, 0.4);
}

.clear-search:hover {
  background: linear-gradient(135deg, #c92a2a 0%, #f5576c 100%);
  transform: translateY(-50%) scale(1.15) rotate(90deg);
  box-shadow: 0 6px 18px rgba(245, 87, 108, 0.6);
}

/* Tips Section */
.tips-section {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  position: relative;
  z-index: 1;
  animation: slideInPage 0.8s ease-out;
}

.tips-header {
  text-align: center;
  margin-bottom: 35px;
  animation: slideInPage 0.8s ease-out 0.2s both;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 50%, #764ba2 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0 0 12px 0;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
}

.section-subtitle {
  font-size: 1.3rem;
  color: #1e1e1e;
  margin: 0;
  font-weight: 500;
  opacity: 0.8;
}

/* Tips Grid - 4 COLUMNS (4 cards in first row, 4 in second row if available) */
.tips-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-bottom: 35px;
}

.tip-card {
  border-radius: 18px;
  padding: 20px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.3) 100%) !important;
  backdrop-filter: blur(15px);
  box-shadow: 
    0 10px 30px rgba(0, 0, 0, 0.12),
    0 0 0 1px rgba(255, 255, 255, 0.6) inset;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  cursor: pointer;
  border: 2px solid rgba(255, 255, 255, 0.5);
  position: relative;
  overflow: hidden;
  animation: slideInCard 0.6s ease-out backwards;
}

.tip-card::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.4) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.4s ease;
}

.tip-card:hover::before {
  opacity: 1;
}

.tip-card:hover {
  transform: translateY(-12px) scale(1.02);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.65) 0%, rgba(255, 255, 255, 0.45) 100%) !important;
  box-shadow: 
    0 20px 50px rgba(0, 0, 0, 0.2),
    0 0 0 3px rgba(255, 255, 255, 0.7) inset;
  border-color: rgba(255, 255, 255, 0.7);
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
  text-shadow: 0 2px 4px rgba(255, 255, 255, 0.8);
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50px;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 3px 10px rgba(102, 126, 234, 0.3);
  letter-spacing: 0.3px;
}

.view-details-btn:hover {
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
  border-color: rgba(255, 255, 255, 0.5);
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
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.2));
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.no-results h3 {
  font-size: 2.2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
  box-shadow: 
    0 30px 80px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.1);
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
  background: linear-gradient(135deg, #f5576c 0%, #f093fb 100%);
  color: white;
  border: 3px solid rgba(255, 255, 255, 0.5);
  font-size: 1.6rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.4s ease;
  z-index: 10;
  box-shadow: 0 6px 20px rgba(245, 87, 108, 0.5);
  font-weight: 700;
}

.modal-close:hover {
  background: linear-gradient(135deg, #c92a2a 0%, #f5576c 100%);
  transform: rotate(180deg) scale(1.15);
  box-shadow: 0 8px 25px rgba(245, 87, 108, 0.7);
  border-color: rgba(255, 255, 255, 0.8);
}

.modal-header {
  padding: 50px 40px;
  text-align: center;
  border-radius: 30px 30px 0 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  position: relative;
  overflow: hidden;
}

.modal-header::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, transparent 70%);
  animation: rotateGradient 10s linear infinite;
}

@keyframes rotateGradient {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.modal-icon {
  font-size: 6rem;
  display: block;
  margin-bottom: 20px;
  filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.3));
  animation: bounce 2s ease infinite;
  position: relative;
  z-index: 1;
}

.modal-title {
  font-size: 2.8rem;
  font-weight: 900;
  margin: 0;
  text-shadow: 
    0 4px 8px rgba(0, 0, 0, 0.3),
    0 0 30px rgba(255, 255, 255, 0.3);
  position: relative;
  z-index: 1;
  letter-spacing: 1px;
}

.modal-body {
  padding: 32px;
}

.basic-tip-highlight {
  background: linear-gradient(135deg, #e8f5ff 0%, #fff5e8 100%);
  padding: 18px 20px;
  border-radius: 16px;
  margin-bottom: 24px;
  border-left: 5px solid;
  border-image: linear-gradient(135deg, #667eea 0%, #764ba2 100%) 1;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.06);
  position: relative;
  overflow: hidden;
}

.basic-tip-highlight h3 {
  font-size: 1.15rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0 0 16px 0;
  font-weight: 700;
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
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.04);
}

.detailed-tip-item:hover {
  background: linear-gradient(135deg, #e8f5ff 0%, #f8f9fa 100%);
  transform: translateX(8px);
  border-color: rgba(102, 126, 234, 0.3);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.15);
}

.tip-number {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
  box-shadow: 0 3px 10px rgba(102, 126, 234, 0.3);
}

.tip-text {
  font-size: 0.9rem;
  color: #2c3e50;
  line-height: 1.5;
  flex: 1;
  font-weight: 500;
}

/* Fertilizer Section Styles */
.fertilizer-section {
  margin-top: 28px;
  padding-top: 28px;
  border-top: 3px dashed rgba(102, 126, 234, 0.3);
}

.fertilizer-heading {
  font-size: 1.5rem;
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0 0 18px 0;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 10px;
}

.fertilizer-icon {
  font-size: 2.2rem;
  filter: drop-shadow(0 2px 4px rgba(34, 197, 94, 0.3));
}

.fertilizer-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 12px;
}

.fertilizer-card {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border: 2px solid #86efac;
  border-radius: 14px;
  padding: 16px;
  transition: all 0.3s ease;
  box-shadow: 0 3px 10px rgba(34, 197, 94, 0.08);
}

.fertilizer-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(34, 197, 94, 0.2);
  border-color: #4ade80;
}

.fertilizer-header {
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 2px solid rgba(34, 197, 94, 0.2);
}

.fertilizer-name {
  font-size: 1.05rem;
  font-weight: 700;
  color: #166534;
  margin: 0;
}

.fertilizer-details {
  margin-bottom: 12px;
}

.fertilizer-detail-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 0.8rem;
}

.detail-label {
  font-weight: 700;
  color: #15803d;
  min-width: 70px;
  flex-shrink: 0;
}

.detail-value {
  color: #166534;
  line-height: 1.4;
  font-weight: 500;
}

.get-fertilizer-btn {
  width: 100%;
  padding: 9px 14px;
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 3px 10px rgba(34, 197, 94, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.get-fertilizer-btn:hover {
  background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
  transform: scale(1.05);
  box-shadow: 0 6px 18px rgba(34, 197, 94, 0.5);
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
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
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes cardGlow {
  0%, 100% {
    box-shadow: 0 0 10px rgba(168, 201, 105, 0.3);
  }
  50% {
    box-shadow: 0 0 20px rgba(168, 201, 105, 0.6);
  }
}

@keyframes floatingOverlay {
  0%, 100% {
    transform: translateY(0px) translateX(0px);
  }
  50% {
    transform: translateY(-15px) translateX(10px);
  }
}

@keyframes heroPulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 8px 20px rgba(74, 222, 128, 0.4);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 12px 30px rgba(74, 222, 128, 0.7);
  }
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-15px);
  }
}

/* Responsive Design */
@media (max-width: 1400px) {
  .tips-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 1200px) {
  .tips-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
    flex-direction: column;
    gap: 15px;
  }

  .hero-title .hero-icon {
    width: 70px;
    height: 70px;
    font-size: 3rem;
  }

  .hero-subtitle {
    font-size: 1.1rem;
    margin-bottom: 35px;
  }

  .stats-container {
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
  }

  .stat-card {
    padding: 20px 15px;
  }

  .stat-number {
    font-size: 2rem;
  }

  .stat-label {
    font-size: 0.95rem;
  }

  .section-title {
    font-size: 2rem;
  }

  .tips-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .fertilizer-grid {
    grid-template-columns: 1fr;
  }

  .modal-content {
    max-height: 90vh;
  }

  .modal-header {
    padding: 30px 20px;
  }

  .modal-title {
    font-size: 2rem;
  }

  .modal-body {
    padding: 25px 20px;
  }

  .search-input {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 2rem;
  }

  .hero-title .hero-icon {
    width: 60px;
    height: 60px;
    font-size: 2.5rem;
  }

  .stats-container {
    grid-template-columns: 1fr;
  }

  .stat-icon {
    font-size: 2rem;
  }

  .modal-icon {
    font-size: 4rem;
  }
}

/* Scrollbar Styling for Modal */
.modal-content::-webkit-scrollbar {
  width: 10px;
}

.modal-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.modal-content::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #4CAF50 0%, #2e7d32 100%);
  border-radius: 10px;
}

.modal-content::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%);
}
`;

export default FarmingTips;