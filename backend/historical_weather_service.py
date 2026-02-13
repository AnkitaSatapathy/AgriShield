"""
Historical Weather Service  (v2 – fixed)
Key fixes:
  • Monthly outlook uses per-month 20-yr normals — no cross-month anomaly bleed
  • Season comparison is season-window-aware (Kharif=Jun-Sep, Rabi=Oct-Feb)
  • Full 60+ crop database
"""

import requests
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
import time

MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
               "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

# ── Indian city coordinates ────────────────────────────────────────────────────
INDIA_COORDS = {
    "bhubaneswar": (20.2961, 85.8245), "cuttack": (20.4625, 85.8828),
    "berhampur": (19.3150, 84.7941), "sambalpur": (21.4669, 83.9812),
    "puri": (19.8135, 85.8312), "rourkela": (22.2604, 84.8536),
    "balasore": (21.4942, 86.9335), "koraput": (18.8127, 82.7134),
    "kendrapara": (20.5015, 86.4212), "ganjam": (19.3784, 84.9944),
    "visakhapatnam": (17.6868, 83.2185), "vijayawada": (16.5062, 80.6480),
    "guntur": (16.3067, 80.4365), "tirupati": (13.6288, 79.4192),
    "nellore": (14.4426, 79.9865), "kurnool": (15.8281, 78.0373),
    "rajahmundry": (17.0005, 81.8040), "kadapa": (14.4673, 78.8242),
    "mumbai": (19.0760, 72.8777), "pune": (18.5204, 73.8567),
    "nagpur": (21.1458, 79.0882), "nashik": (19.9975, 73.7898),
    "aurangabad": (19.8762, 75.3433), "solapur": (17.6599, 75.9064),
    "kolhapur": (16.7050, 74.2433), "amravati": (20.9333, 77.7500),
    "ludhiana": (30.9009, 75.8573), "amritsar": (31.6340, 74.8723),
    "jalandhar": (31.3260, 75.5762), "patiala": (30.3398, 76.3869),
    "bathinda": (30.2110, 74.9455), "mohali": (30.7046, 76.7179),
    "karnal": (29.6857, 76.9905), "ambala": (30.3782, 76.7767),
    "hisar": (29.1492, 75.7217), "rohtak": (28.8955, 76.6066),
    "gurugram": (28.4595, 77.0266), "faridabad": (28.4089, 77.3178),
    "ahmedabad": (23.0225, 72.5714), "surat": (21.1702, 72.8311),
    "vadodara": (22.3072, 73.1812), "rajkot": (22.3039, 70.8022),
    "bhavnagar": (21.7645, 72.1519), "jamnagar": (22.4707, 70.0577),
    "anand": (22.5645, 72.9289), "gandhinagar": (23.2156, 72.6369),
    "bangalore": (12.9716, 77.5946), "bengaluru": (12.9716, 77.5946),
    "mysuru": (12.2958, 76.6394), "hubli": (15.3647, 75.1240),
    "mangaluru": (12.9141, 74.8560), "belgaum": (15.8497, 74.4977),
    "davangere": (14.4644, 75.9218), "shimoga": (13.9299, 75.5681),
    "chennai": (13.0827, 80.2707), "coimbatore": (11.0168, 76.9558),
    "madurai": (9.9252, 78.1198), "salem": (11.6643, 78.1460),
    "trichy": (10.7905, 78.7047), "tirunelveli": (8.7139, 77.7567),
    "erode": (11.3410, 77.7172), "vellore": (12.9165, 79.1325),
    "thiruvananthapuram": (8.5241, 76.9366), "kochi": (9.9312, 76.2673),
    "kozhikode": (11.2588, 75.7804), "thrissur": (10.5276, 76.2144),
    "palakkad": (10.7867, 76.6548), "kollam": (8.8932, 76.6141),
    "kolkata": (22.5726, 88.3639), "darjeeling": (27.0410, 88.2663),
    "siliguri": (26.7271, 88.3953), "asansol": (23.6835, 86.9718),
    "durgapur": (23.5204, 87.3119), "malda": (25.0108, 88.1417),
    "bhopal": (23.2599, 77.4126), "indore": (22.7196, 75.8577),
    "gwalior": (26.2183, 78.1828), "jabalpur": (23.1815, 79.9864),
    "ujjain": (23.1765, 75.7885), "sagar": (23.8388, 78.7378),
    "lucknow": (26.8467, 80.9462), "kanpur": (26.4499, 80.3319),
    "varanasi": (25.3176, 82.9739), "agra": (27.1767, 78.0081),
    "allahabad": (25.4358, 81.8463), "prayagraj": (25.4358, 81.8463),
    "gorakhpur": (26.7606, 83.3732), "bareilly": (28.3670, 79.4304),
    "meerut": (28.9845, 77.7064), "aligarh": (27.8974, 78.0880),
    "jaipur": (26.9124, 75.7873), "jodhpur": (26.2389, 73.0243),
    "udaipur": (24.5854, 73.7125), "bikaner": (28.0229, 73.3119),
    "kota": (25.2138, 75.8648), "ajmer": (26.4499, 74.6399),
    "patna": (25.5941, 85.1376), "gaya": (24.7968, 84.9994),
    "bhagalpur": (25.2425, 86.9842), "muzaffarpur": (26.1209, 85.3647),
    "guwahati": (26.1445, 91.7362), "dibrugarh": (27.4728, 95.0148),
    "silchar": (24.8333, 92.7789), "jorhat": (26.7509, 94.2037),
    "shimla": (31.1048, 77.1734), "dharamsala": (32.2190, 76.3234),
    "mandi": (31.7090, 76.9318), "solan": (30.9045, 77.0967),
    "dehradun": (30.3165, 78.0322), "haridwar": (29.9457, 78.1642),
    "nainital": (29.3803, 79.4636), "haldwani": (29.2183, 79.5130),
    "ranchi": (23.3441, 85.3096), "jamshedpur": (22.8046, 86.2029),
    "dhanbad": (23.7957, 86.4304), "bokaro": (23.6693, 86.1511),
    "raipur": (21.2514, 81.6296), "bilaspur": (22.0796, 82.1391),
    "durg": (21.1904, 81.2849), "korba": (22.3595, 82.7501),
    "hyderabad": (17.3850, 78.4867), "warangal": (17.9784, 79.5941),
    "nizamabad": (18.6725, 78.0940), "karimnagar": (18.4386, 79.1288),
    "panaji": (15.4909, 73.8278), "margao": (15.2832, 73.9862),
    "vasco": (15.3960, 73.8140),
    "srinagar": (34.0837, 74.7973), "jammu": (32.7266, 74.8570),
    "anantnag": (33.7311, 75.1487),
    "gangtok": (27.3314, 88.6138), "imphal": (24.8170, 93.9368),
    "shillong": (25.5788, 91.8933), "kohima": (25.6751, 94.1086),
    "agartala": (23.8315, 91.2868), "aizawl": (23.7307, 92.7173),
    "itanagar": (27.0844, 93.6053),
}

# State capital fallback mapping
_STATE_CAPITALS = {
    "andhra pradesh": "visakhapatnam", "arunachal pradesh": "itanagar",
    "assam": "guwahati", "bihar": "patna", "chhattisgarh": "raipur",
    "goa": "panaji", "gujarat": "ahmedabad", "haryana": "karnal",
    "himachal pradesh": "shimla", "jharkhand": "ranchi",
    "karnataka": "bangalore", "kerala": "thiruvananthapuram",
    "madhya pradesh": "bhopal", "maharashtra": "mumbai",
    "manipur": "imphal", "meghalaya": "shillong", "mizoram": "aizawl",
    "nagaland": "kohima", "odisha": "bhubaneswar", "punjab": "ludhiana",
    "rajasthan": "jaipur", "sikkim": "gangtok", "tamil nadu": "chennai",
    "telangana": "hyderabad", "tripura": "agartala",
    "uttar pradesh": "lucknow", "uttarakhand": "dehradun",
    "west bengal": "kolkata", "jammu and kashmir": "srinagar",
}

# ── Full 60+ crop database ─────────────────────────────────────────────────────
CROP_SEASONAL_INFO: Dict = {
    # CEREALS
    "Rice": {
        "seasons": ["Kharif"], "season_label": "Kharif (Jun–Nov)",
        "primary_season": "kharif",
        "sowing_months": [6, 7], "harvest_months": [10, 11],
        "ideal_temp_range": (22, 35), "ideal_rainfall_monthly_mm": (150, 300),
        "ideal_humidity": (70, 90), "water_demand": "high",
        "heat_sensitive": False, "waterlog_sensitive": False,
    },
    "Wheat": {
        "seasons": ["Rabi"], "season_label": "Rabi (Oct–Apr)",
        "primary_season": "rabi",
        "sowing_months": [10, 11], "harvest_months": [3, 4],
        "ideal_temp_range": (10, 25), "ideal_rainfall_monthly_mm": (25, 100),
        "ideal_humidity": (40, 70), "water_demand": "medium",
        "heat_sensitive": True, "waterlog_sensitive": True,
    },
    "Maize": {
        "seasons": ["Kharif", "Rabi"], "season_label": "Kharif (Jun–Oct) / Rabi (Oct–Feb)",
        "primary_season": "kharif",
        "sowing_months": [6, 7, 10, 11], "harvest_months": [9, 10, 2, 3],
        "ideal_temp_range": (20, 32), "ideal_rainfall_monthly_mm": (60, 120),
        "ideal_humidity": (50, 80), "water_demand": "medium",
        "heat_sensitive": False, "waterlog_sensitive": True,
    },
    "Barley": {
        "seasons": ["Rabi"], "season_label": "Rabi (Oct–Mar)",
        "primary_season": "rabi",
        "sowing_months": [10, 11], "harvest_months": [3, 4],
        "ideal_temp_range": (8, 22), "ideal_rainfall_monthly_mm": (20, 80),
        "ideal_humidity": (35, 65), "water_demand": "low",
        "heat_sensitive": True, "waterlog_sensitive": True,
    },
    "Oats": {
        "seasons": ["Rabi"], "season_label": "Rabi (Oct–Mar)",
        "primary_season": "rabi",
        "sowing_months": [10, 11], "harvest_months": [3, 4],
        "ideal_temp_range": (7, 22), "ideal_rainfall_monthly_mm": (25, 90),
        "ideal_humidity": (40, 65), "water_demand": "medium",
        "heat_sensitive": True, "waterlog_sensitive": True,
    },
    "Sorghum": {
        "seasons": ["Kharif", "Rabi"], "season_label": "Kharif (Jun–Oct) / Rabi",
        "primary_season": "kharif",
        "sowing_months": [6, 7, 10], "harvest_months": [9, 10, 1],
        "ideal_temp_range": (25, 38), "ideal_rainfall_monthly_mm": (50, 150),
        "ideal_humidity": (40, 75), "water_demand": "low",
        "heat_sensitive": False, "waterlog_sensitive": True,
    },
    # MILLETS
    "Pearl Millet": {
        "seasons": ["Kharif"], "season_label": "Kharif (Jun–Sep)",
        "primary_season": "kharif",
        "sowing_months": [6, 7], "harvest_months": [9, 10],
        "ideal_temp_range": (25, 40), "ideal_rainfall_monthly_mm": (40, 120),
        "ideal_humidity": (35, 70), "water_demand": "low",
        "heat_sensitive": False, "waterlog_sensitive": True,
    },
    "Finger Millet": {
        "seasons": ["Kharif"], "season_label": "Kharif (Jun–Oct)",
        "primary_season": "kharif",
        "sowing_months": [6, 7], "harvest_months": [10, 11],
        "ideal_temp_range": (20, 35), "ideal_rainfall_monthly_mm": (50, 120),
        "ideal_humidity": (40, 75), "water_demand": "low",
        "heat_sensitive": False, "waterlog_sensitive": True,
    },
    "Foxtail Millet": {
        "seasons": ["Kharif"], "season_label": "Kharif (Jun–Sep)",
        "primary_season": "kharif",
        "sowing_months": [6, 7], "harvest_months": [9, 10],
        "ideal_temp_range": (20, 35), "ideal_rainfall_monthly_mm": (40, 100),
        "ideal_humidity": (35, 70), "water_demand": "low",
        "heat_sensitive": False, "waterlog_sensitive": True,
    },
    "Little Millet": {
        "seasons": ["Kharif"], "season_label": "Kharif (Jun–Sep)",
        "primary_season": "kharif",
        "sowing_months": [6, 7], "harvest_months": [9, 10],
        "ideal_temp_range": (20, 35), "ideal_rainfall_monthly_mm": (40, 100),
        "ideal_humidity": (35, 70), "water_demand": "low",
        "heat_sensitive": False, "waterlog_sensitive": True,
    },
    "Kodo Millet": {
        "seasons": ["Kharif"], "season_label": "Kharif (Jun–Oct)",
        "primary_season": "kharif",
        "sowing_months": [6, 7], "harvest_months": [9, 10],
        "ideal_temp_range": (20, 35), "ideal_rainfall_monthly_mm": (50, 120),
        "ideal_humidity": (40, 75), "water_demand": "low",
        "heat_sensitive": False, "waterlog_sensitive": True,
    },
    "Barnyard Millet": {
        "seasons": ["Kharif"], "season_label": "Kharif (Jun–Sep)",
        "primary_season": "kharif",
        "sowing_months": [6, 7], "harvest_months": [9, 10],
        "ideal_temp_range": (18, 32), "ideal_rainfall_monthly_mm": (40, 100),
        "ideal_humidity": (40, 75), "water_demand": "low",
        "heat_sensitive": False, "waterlog_sensitive": True,
    },
    # CASH CROPS
    "Cotton": {
        "seasons": ["Kharif"], "season_label": "Kharif (May–Dec)",
        "primary_season": "kharif",
        "sowing_months": [5, 6], "harvest_months": [10, 11, 12],
        "ideal_temp_range": (25, 35), "ideal_rainfall_monthly_mm": (80, 180),
        "ideal_humidity": (50, 75), "water_demand": "medium",
        "heat_sensitive": False, "waterlog_sensitive": True,
    },
    "Sugarcane": {
        "seasons": ["Kharif", "Whole Year"], "season_label": "Year-round (sow Feb–Mar / Oct–Nov)",
        "primary_season": "kharif",
        "sowing_months": [2, 3, 10, 11], "harvest_months": [11, 12, 1, 2],
        "ideal_temp_range": (20, 35), "ideal_rainfall_monthly_mm": (100, 250),
        "ideal_humidity": (60, 85), "water_demand": "high",
        "heat_sensitive": False, "waterlog_sensitive": False,
    },
    "Jute": {
        "seasons": ["Kharif"], "season_label": "Kharif (Mar–Sep)",
        "primary_season": "kharif",
        "sowing_months": [3, 4, 5], "harvest_months": [8, 9],
        "ideal_temp_range": (24, 38), "ideal_rainfall_monthly_mm": (150, 300),
        "ideal_humidity": (70, 90), "water_demand": "high",
        "heat_sensitive": False, "waterlog_sensitive": False,
    },
    # OILSEEDS
    "Groundnut": {
        "seasons": ["Kharif", "Rabi"], "season_label": "Kharif (Jun–Oct) / Rabi (Nov–Mar)",
        "primary_season": "kharif",
        "sowing_months": [6, 7, 11, 12], "harvest_months": [10, 11, 3, 4],
        "ideal_temp_range": (25, 35), "ideal_rainfall_monthly_mm": (60, 150),
        "ideal_humidity": (50, 75), "water_demand": "medium",
        "heat_sensitive": False, "waterlog_sensitive": True,
    },
    "Soybean": {
        "seasons": ["Kharif"], "season_label": "Kharif (Jun–Oct)",
        "primary_season": "kharif",
        "sowing_months": [6, 7], "harvest_months": [10, 11],
        "ideal_temp_range": (22, 32), "ideal_rainfall_monthly_mm": (80, 150),
        "ideal_humidity": (55, 80), "water_demand": "medium",
        "heat_sensitive": False, "waterlog_sensitive": True,
    },
    "Sunflower": {
        "seasons": ["Kharif", "Rabi"], "season_label": "Kharif (Jun–Sep) / Rabi (Oct–Feb)",
        "primary_season": "kharif",
        "sowing_months": [6, 7, 10, 11], "harvest_months": [9, 10, 2, 3],
        "ideal_temp_range": (18, 35), "ideal_rainfall_monthly_mm": (40, 100),
        "ideal_humidity": (40, 70), "water_demand": "medium",
        "heat_sensitive": False, "waterlog_sensitive": True,
    },
    "Mustard": {
        "seasons": ["Rabi"], "season_label": "Rabi (Oct–Mar)",
        "primary_season": "rabi",
        "sowing_months": [10, 11], "harvest_months": [2, 3],
        "ideal_temp_range": (10, 22), "ideal_rainfall_monthly_mm": (20, 80),
        "ideal_humidity": (40, 65), "water_demand": "low",
        "heat_sensitive": True, "waterlog_sensitive": True,
    },
    "Sesame": {
        "seasons": ["Kharif", "Zaid"], "season_label": "Kharif (Jun–Sep) / Zaid (Mar–Jun)",
        "primary_season": "kharif",
        "sowing_months": [6, 7, 3, 4], "harvest_months": [9, 10, 6, 7],
        "ideal_temp_range": (25, 38), "ideal_rainfall_monthly_mm": (50, 120),
        "ideal_humidity": (40, 70), "water_demand": "low",
        "heat_sensitive": False, "waterlog_sensitive": True,
    },
    "Linseed": {
        "seasons": ["Rabi"], "season_label": "Rabi (Oct–Mar)",
        "primary_season": "rabi",
        "sowing_months": [10, 11], "harvest_months": [3, 4],
        "ideal_temp_range": (10, 22), "ideal_rainfall_monthly_mm": (20, 80),
        "ideal_humidity": (35, 65), "water_demand": "low",
        "heat_sensitive": True, "waterlog_sensitive": True,
    },
    "Castor": {
        "seasons": ["Kharif"], "season_label": "Kharif (Jun–Jan)",
        "primary_season": "kharif",
        "sowing_months": [6, 7], "harvest_months": [12, 1],
        "ideal_temp_range": (20, 38), "ideal_rainfall_monthly_mm": (60, 150),
        "ideal_humidity": (40, 75), "water_demand": "low",
        "heat_sensitive": False, "waterlog_sensitive": True,
    },
    # PULSES
    "Chickpea": {
        "seasons": ["Rabi"], "season_label": "Rabi (Oct–Mar)",
        "primary_season": "rabi",
        "sowing_months": [10, 11], "harvest_months": [2, 3],
        "ideal_temp_range": (10, 25), "ideal_rainfall_monthly_mm": (20, 80),
        "ideal_humidity": (35, 60), "water_demand": "low",
        "heat_sensitive": True, "waterlog_sensitive": True,
    },
    "Pigeon Pea": {
        "seasons": ["Kharif"], "season_label": "Kharif (Jun–Jan)",
        "primary_season": "kharif",
        "sowing_months": [6, 7], "harvest_months": [12, 1],
        "ideal_temp_range": (22, 35), "ideal_rainfall_monthly_mm": (60, 150),
        "ideal_humidity": (40, 70), "water_demand": "low",
        "heat_sensitive": False, "waterlog_sensitive": True,
    },
    "Green Gram": {
        "seasons": ["Kharif", "Zaid"], "season_label": "Kharif (Jun–Sep) / Zaid (Mar–Jun)",
        "primary_season": "kharif",
        "sowing_months": [6, 7, 3, 4], "harvest_months": [9, 10, 6, 7],
        "ideal_temp_range": (22, 35), "ideal_rainfall_monthly_mm": (50, 120),
        "ideal_humidity": (45, 75), "water_demand": "low",
        "heat_sensitive": False, "waterlog_sensitive": True,
    },
    "Black Gram": {
        "seasons": ["Kharif", "Rabi"], "season_label": "Kharif (Jun–Sep) / Rabi (Oct–Feb)",
        "primary_season": "kharif",
        "sowing_months": [6, 7, 10, 11], "harvest_months": [9, 10, 1, 2],
        "ideal_temp_range": (20, 35), "ideal_rainfall_monthly_mm": (50, 120),
        "ideal_humidity": (45, 75), "water_demand": "low",
        "heat_sensitive": False, "waterlog_sensitive": True,
    },
    "Lentil": {
        "seasons": ["Rabi"], "season_label": "Rabi (Oct–Mar)",
        "primary_season": "rabi",
        "sowing_months": [10, 11], "harvest_months": [3, 4],
        "ideal_temp_range": (8, 22), "ideal_rainfall_monthly_mm": (15, 70),
        "ideal_humidity": (35, 60), "water_demand": "low",
        "heat_sensitive": True, "waterlog_sensitive": True,
    },
    "Field Pea": {
        "seasons": ["Rabi"], "season_label": "Rabi (Oct–Mar)",
        "primary_season": "rabi",
        "sowing_months": [10, 11], "harvest_months": [2, 3],
        "ideal_temp_range": (8, 22), "ideal_rainfall_monthly_mm": (20, 80),
        "ideal_humidity": (40, 65), "water_demand": "low",
        "heat_sensitive": True, "waterlog_sensitive": True,
    },
    # VEGETABLES
    "Potato": {
        "seasons": ["Rabi"], "season_label": "Rabi (Sep–Mar)",
        "primary_season": "rabi",
        "sowing_months": [9, 10, 11], "harvest_months": [1, 2, 3],
        "ideal_temp_range": (10, 24), "ideal_rainfall_monthly_mm": (40, 100),
        "ideal_humidity": (50, 70), "water_demand": "medium",
        "heat_sensitive": True, "waterlog_sensitive": True,
    },
    "Onion": {
        "seasons": ["Rabi", "Kharif"], "season_label": "Rabi (Oct–Mar) / Kharif (Jun–Oct)",
        "primary_season": "rabi",
        "sowing_months": [10, 11, 6, 7], "harvest_months": [3, 4, 9, 10],
        "ideal_temp_range": (13, 28), "ideal_rainfall_monthly_mm": (30, 90),
        "ideal_humidity": (40, 65), "water_demand": "medium",
        "heat_sensitive": False, "waterlog_sensitive": True,
    },
    "Tomato": {
        "seasons": ["Rabi", "Kharif"], "season_label": "Rabi (Oct–Feb) / Kharif (Jun–Sep)",
        "primary_season": "rabi",
        "sowing_months": [6, 7, 10, 11], "harvest_months": [9, 10, 1, 2],
        "ideal_temp_range": (18, 30), "ideal_rainfall_monthly_mm": (40, 100),
        "ideal_humidity": (50, 75), "water_demand": "medium",
        "heat_sensitive": True, "waterlog_sensitive": True,
    },
    "Brinjal": {
        "seasons": ["Kharif", "Rabi"], "season_label": "Kharif (Jun–Oct) / Rabi (Oct–Feb)",
        "primary_season": "kharif",
        "sowing_months": [6, 7, 10, 11], "harvest_months": [9, 10, 1, 2],
        "ideal_temp_range": (20, 35), "ideal_rainfall_monthly_mm": (50, 120),
        "ideal_humidity": (50, 75), "water_demand": "medium",
        "heat_sensitive": False, "waterlog_sensitive": True,
    },
    "Chilli": {
        "seasons": ["Kharif", "Rabi"], "season_label": "Kharif (Jun–Oct) / Rabi",
        "primary_season": "kharif",
        "sowing_months": [6, 7, 10, 11], "harvest_months": [9, 10, 1, 2],
        "ideal_temp_range": (20, 32), "ideal_rainfall_monthly_mm": (50, 120),
        "ideal_humidity": (50, 75), "water_demand": "medium",
        "heat_sensitive": False, "waterlog_sensitive": True,
    },
    "Capsicum": {
        "seasons": ["Rabi"], "season_label": "Rabi (Sep–Jan)",
        "primary_season": "rabi",
        "sowing_months": [9, 10], "harvest_months": [12, 1, 2],
        "ideal_temp_range": (15, 28), "ideal_rainfall_monthly_mm": (40, 100),
        "ideal_humidity": (50, 75), "water_demand": "medium",
        "heat_sensitive": True, "waterlog_sensitive": True,
    },
    "Cabbage": {
        "seasons": ["Rabi"], "season_label": "Rabi (Sep–Feb)",
        "primary_season": "rabi",
        "sowing_months": [9, 10, 11], "harvest_months": [1, 2, 3],
        "ideal_temp_range": (8, 22), "ideal_rainfall_monthly_mm": (40, 100),
        "ideal_humidity": (50, 75), "water_demand": "medium",
        "heat_sensitive": True, "waterlog_sensitive": True,
    },
    "Cauliflower": {
        "seasons": ["Rabi"], "season_label": "Rabi (Sep–Feb)",
        "primary_season": "rabi",
        "sowing_months": [9, 10, 11], "harvest_months": [12, 1, 2],
        "ideal_temp_range": (8, 22), "ideal_rainfall_monthly_mm": (40, 100),
        "ideal_humidity": (50, 75), "water_demand": "medium",
        "heat_sensitive": True, "waterlog_sensitive": True,
    },
    "Okra": {
        "seasons": ["Kharif", "Zaid"], "season_label": "Kharif (Jun–Sep) / Zaid (Feb–May)",
        "primary_season": "kharif",
        "sowing_months": [6, 7, 2, 3], "harvest_months": [9, 10, 5, 6],
        "ideal_temp_range": (22, 38), "ideal_rainfall_monthly_mm": (60, 150),
        "ideal_humidity": (50, 80), "water_demand": "medium",
        "heat_sensitive": False, "waterlog_sensitive": True,
    },
    "Carrot": {
        "seasons": ["Rabi"], "season_label": "Rabi (Sep–Feb)",
        "primary_season": "rabi",
        "sowing_months": [9, 10, 11], "harvest_months": [1, 2, 3],
        "ideal_temp_range": (8, 22), "ideal_rainfall_monthly_mm": (40, 80),
        "ideal_humidity": (40, 70), "water_demand": "medium",
        "heat_sensitive": True, "waterlog_sensitive": True,
    },
    "Radish": {
        "seasons": ["Rabi"], "season_label": "Rabi (Sep–Feb)",
        "primary_season": "rabi",
        "sowing_months": [9, 10, 11], "harvest_months": [11, 12, 1],
        "ideal_temp_range": (8, 20), "ideal_rainfall_monthly_mm": (30, 80),
        "ideal_humidity": (40, 70), "water_demand": "medium",
        "heat_sensitive": True, "waterlog_sensitive": True,
    },
    "Spinach": {
        "seasons": ["Rabi"], "season_label": "Rabi (Sep–Feb)",
        "primary_season": "rabi",
        "sowing_months": [9, 10, 11], "harvest_months": [11, 12, 1],
        "ideal_temp_range": (5, 22), "ideal_rainfall_monthly_mm": (30, 80),
        "ideal_humidity": (40, 70), "water_demand": "medium",
        "heat_sensitive": True, "waterlog_sensitive": True,
    },
    # FRUITS
    "Banana": {
        "seasons": ["Whole Year"], "season_label": "Year-round",
        "primary_season": "whole_year",
        "sowing_months": list(range(1, 13)), "harvest_months": list(range(1, 13)),
        "ideal_temp_range": (20, 35), "ideal_rainfall_monthly_mm": (100, 200),
        "ideal_humidity": (60, 85), "water_demand": "high",
        "heat_sensitive": False, "waterlog_sensitive": False,
    },
    "Mango": {
        "seasons": ["Summer"], "season_label": "Summer crop (harvest Apr–Jul)",
        "primary_season": "zaid",
        "sowing_months": [7, 8], "harvest_months": [4, 5, 6, 7],
        "ideal_temp_range": (24, 38), "ideal_rainfall_monthly_mm": (60, 150),
        "ideal_humidity": (50, 80), "water_demand": "medium",
        "heat_sensitive": False, "waterlog_sensitive": False,
    },
    "Apple": {
        "seasons": ["Rabi"], "season_label": "Hill crop (harvest Jul–Oct)",
        "primary_season": "rabi",
        "sowing_months": [1, 2], "harvest_months": [7, 8, 9, 10],
        "ideal_temp_range": (5, 22), "ideal_rainfall_monthly_mm": (40, 120),
        "ideal_humidity": (40, 70), "water_demand": "medium",
        "heat_sensitive": True, "waterlog_sensitive": True,
    },
    "Grapes": {
        "seasons": ["Rabi"], "season_label": "Rabi (Oct–Mar harvest)",
        "primary_season": "rabi",
        "sowing_months": [10, 11], "harvest_months": [2, 3, 4],
        "ideal_temp_range": (15, 35), "ideal_rainfall_monthly_mm": (20, 80),
        "ideal_humidity": (40, 70), "water_demand": "medium",
        "heat_sensitive": False, "waterlog_sensitive": True,
    },
    "Orange": {
        "seasons": ["Whole Year"], "season_label": "Year-round (harvest Nov–Jan)",
        "primary_season": "whole_year",
        "sowing_months": [6, 7], "harvest_months": [11, 12, 1],
        "ideal_temp_range": (15, 30), "ideal_rainfall_monthly_mm": (75, 180),
        "ideal_humidity": (50, 75), "water_demand": "medium",
        "heat_sensitive": False, "waterlog_sensitive": False,
    },
    "Papaya": {
        "seasons": ["Whole Year"], "season_label": "Year-round",
        "primary_season": "whole_year",
        "sowing_months": list(range(1, 13)), "harvest_months": list(range(1, 13)),
        "ideal_temp_range": (22, 38), "ideal_rainfall_monthly_mm": (100, 200),
        "ideal_humidity": (55, 85), "water_demand": "medium",
        "heat_sensitive": False, "waterlog_sensitive": True,
    },
    "Pineapple": {
        "seasons": ["Whole Year"], "season_label": "Year-round (Kharif sowing)",
        "primary_season": "kharif",
        "sowing_months": [5, 6, 7], "harvest_months": [3, 4, 5],
        "ideal_temp_range": (22, 32), "ideal_rainfall_monthly_mm": (100, 200),
        "ideal_humidity": (60, 85), "water_demand": "medium",
        "heat_sensitive": False, "waterlog_sensitive": False,
    },
    "Coconut": {
        "seasons": ["Whole Year"], "season_label": "Year-round (coastal/tropical)",
        "primary_season": "whole_year",
        "sowing_months": list(range(1, 13)), "harvest_months": list(range(1, 13)),
        "ideal_temp_range": (25, 38), "ideal_rainfall_monthly_mm": (100, 250),
        "ideal_humidity": (60, 90), "water_demand": "high",
        "heat_sensitive": False, "waterlog_sensitive": False,
    },
    # BEVERAGES
    "Tea": {
        "seasons": ["Whole Year"], "season_label": "Year-round (best Mar–May flush)",
        "primary_season": "whole_year",
        "sowing_months": [3, 4, 5], "harvest_months": list(range(3, 12)),
        "ideal_temp_range": (13, 28), "ideal_rainfall_monthly_mm": (150, 300),
        "ideal_humidity": (65, 90), "water_demand": "high",
        "heat_sensitive": True, "waterlog_sensitive": False,
    },
    "Coffee": {
        "seasons": ["Whole Year"], "season_label": "Year-round (harvest Nov–Feb)",
        "primary_season": "whole_year",
        "sowing_months": [5, 6], "harvest_months": [11, 12, 1],
        "ideal_temp_range": (15, 28), "ideal_rainfall_monthly_mm": (150, 250),
        "ideal_humidity": (65, 85), "water_demand": "high",
        "heat_sensitive": True, "waterlog_sensitive": False,
    },
    "Rubber": {
        "seasons": ["Whole Year"], "season_label": "Year-round (tropical perennial)",
        "primary_season": "whole_year",
        "sowing_months": [4, 5, 6], "harvest_months": list(range(1, 13)),
        "ideal_temp_range": (24, 35), "ideal_rainfall_monthly_mm": (150, 300),
        "ideal_humidity": (70, 90), "water_demand": "high",
        "heat_sensitive": False, "waterlog_sensitive": False,
    },
    # SPICES
    "Turmeric": {
        "seasons": ["Kharif"], "season_label": "Kharif (Apr–Jan)",
        "primary_season": "kharif",
        "sowing_months": [4, 5, 6], "harvest_months": [12, 1, 2],
        "ideal_temp_range": (20, 35), "ideal_rainfall_monthly_mm": (100, 250),
        "ideal_humidity": (65, 85), "water_demand": "medium",
        "heat_sensitive": False, "waterlog_sensitive": False,
    },
    "Ginger": {
        "seasons": ["Kharif"], "season_label": "Kharif (Apr–Dec)",
        "primary_season": "kharif",
        "sowing_months": [4, 5, 6], "harvest_months": [12, 1],
        "ideal_temp_range": (20, 32), "ideal_rainfall_monthly_mm": (100, 200),
        "ideal_humidity": (65, 85), "water_demand": "medium",
        "heat_sensitive": False, "waterlog_sensitive": False,
    },
    "Garlic": {
        "seasons": ["Rabi"], "season_label": "Rabi (Oct–Feb)",
        "primary_season": "rabi",
        "sowing_months": [10, 11], "harvest_months": [2, 3],
        "ideal_temp_range": (12, 24), "ideal_rainfall_monthly_mm": (25, 80),
        "ideal_humidity": (40, 65), "water_demand": "medium",
        "heat_sensitive": True, "waterlog_sensitive": True,
    },
    "Coriander": {
        "seasons": ["Rabi", "Kharif"], "season_label": "Rabi (Oct–Feb) / Kharif",
        "primary_season": "rabi",
        "sowing_months": [10, 11, 6, 7], "harvest_months": [1, 2, 9, 10],
        "ideal_temp_range": (15, 28), "ideal_rainfall_monthly_mm": (25, 80),
        "ideal_humidity": (40, 70), "water_demand": "low",
        "heat_sensitive": True, "waterlog_sensitive": True,
    },
    "Cumin": {
        "seasons": ["Rabi"], "season_label": "Rabi (Oct–Feb)",
        "primary_season": "rabi",
        "sowing_months": [10, 11], "harvest_months": [2, 3],
        "ideal_temp_range": (10, 24), "ideal_rainfall_monthly_mm": (15, 60),
        "ideal_humidity": (30, 55), "water_demand": "low",
        "heat_sensitive": True, "waterlog_sensitive": True,
    },
    "Fenugreek": {
        "seasons": ["Rabi"], "season_label": "Rabi (Oct–Feb)",
        "primary_season": "rabi",
        "sowing_months": [10, 11], "harvest_months": [2, 3],
        "ideal_temp_range": (10, 25), "ideal_rainfall_monthly_mm": (20, 80),
        "ideal_humidity": (35, 65), "water_demand": "low",
        "heat_sensitive": True, "waterlog_sensitive": True,
    },
    "Clove": {
        "seasons": ["Whole Year"], "season_label": "Tropical perennial (harvest Jul–Aug)",
        "primary_season": "whole_year",
        "sowing_months": [6, 7], "harvest_months": [7, 8],
        "ideal_temp_range": (20, 35), "ideal_rainfall_monthly_mm": (150, 300),
        "ideal_humidity": (70, 90), "water_demand": "high",
        "heat_sensitive": False, "waterlog_sensitive": False,
    },
    "Cardamom": {
        "seasons": ["Whole Year"], "season_label": "Tropical perennial (harvest Oct–Feb)",
        "primary_season": "whole_year",
        "sowing_months": [5, 6], "harvest_months": [10, 11, 12],
        "ideal_temp_range": (18, 30), "ideal_rainfall_monthly_mm": (150, 300),
        "ideal_humidity": (65, 90), "water_demand": "high",
        "heat_sensitive": True, "waterlog_sensitive": False,
    },
    "Arecanut": {
        "seasons": ["Whole Year"], "season_label": "Tropical perennial (harvest Dec–Mar)",
        "primary_season": "whole_year",
        "sowing_months": [4, 5, 6], "harvest_months": [12, 1, 2],
        "ideal_temp_range": (22, 35), "ideal_rainfall_monthly_mm": (100, 250),
        "ideal_humidity": (65, 90), "water_demand": "high",
        "heat_sensitive": False, "waterlog_sensitive": False,
    },
}

# ── Disaster patterns ──────────────────────────────────────────────────────────
HISTORICAL_DISASTERS = {
    "odisha": [
        {"months": [10, 11], "event_type": "Cyclone", "frequency": "high",
         "description": "Odisha coast faces cyclones in Oct-Nov (Fani 2019, Titli 2018, Phailin 2013). Standing Kharif crops can be severely damaged.",
         "last_occurrences": [2019, 2018, 2016, 2013]},
        {"months": [7, 8, 9], "event_type": "Flood", "frequency": "medium",
         "description": "Mahanadi basin floods during heavy monsoon, affecting Kharif crops.",
         "last_occurrences": [2022, 2020, 2018, 2014]},
    ],
    "andhra pradesh": [
        {"months": [10, 11, 12], "event_type": "Cyclone", "frequency": "high",
         "description": "Bay of Bengal cyclones frequently hit Andhra coast in Oct-Dec.",
         "last_occurrences": [2021, 2020, 2019, 2016]},
    ],
    "west bengal": [
        {"months": [5, 10, 11], "event_type": "Cyclone", "frequency": "medium",
         "description": "Cyclones in pre-monsoon (May) and post-monsoon (Oct-Nov) seasons.",
         "last_occurrences": [2021, 2020, 2009]},
    ],
    "kerala": [
        {"months": [6, 7, 8], "event_type": "Flood / Landslide", "frequency": "medium",
         "description": "Intense monsoon causes floods & landslides in mid-Kerala.",
         "last_occurrences": [2022, 2021, 2020, 2018]},
    ],
    "gujarat": [
        {"months": [6, 7, 8, 9], "event_type": "Flood / Heavy Rain", "frequency": "medium",
         "description": "Saurashtra and coastal Gujarat receive heavy rain bursts causing crop damage.",
         "last_occurrences": [2023, 2021, 2017]},
    ],
    "bihar": [
        {"months": [7, 8, 9], "event_type": "Flood", "frequency": "high",
         "description": "Kosi and Gandak rivers cause regular floods damaging Kharif crops.",
         "last_occurrences": [2022, 2020, 2019, 2017]},
    ],
    "assam": [
        {"months": [6, 7, 8, 9], "event_type": "Flood", "frequency": "high",
         "description": "Brahmaputra river flooding annually disrupts agriculture.",
         "last_occurrences": [2022, 2021, 2020, 2019]},
    ],
    "rajasthan": [
        {"months": [5, 6], "event_type": "Heatwave", "frequency": "high",
         "description": "Severe heatwaves (45°C+) affect crop sowing decisions.",
         "last_occurrences": [2023, 2022, 2021, 2019]},
    ],
    "tamil nadu": [
        {"months": [10, 11, 12], "event_type": "Northeast Monsoon Flooding", "frequency": "medium",
         "description": "Northeast monsoon brings heavy rains; Chennai and delta districts prone to flooding.",
         "last_occurrences": [2023, 2021, 2015]},
    ],
    "maharashtra": [
        {"months": [7, 8], "event_type": "Heavy Rain / Flooding", "frequency": "medium",
         "description": "Konkan coast and Marathwada can face excess or deficit monsoon.",
         "last_occurrences": [2021, 2019, 2017]},
    ],
    "uttarakhand": [
        {"months": [7, 8, 9], "event_type": "Cloudburst / Landslide", "frequency": "medium",
         "description": "Hill districts vulnerable to cloudbursts and landslides during monsoon.",
         "last_occurrences": [2021, 2019, 2013]},
    ],
    "himachal pradesh": [
        {"months": [7, 8, 9], "event_type": "Flash Flood / Landslide", "frequency": "medium",
         "description": "Heavy monsoon causes flash floods and landslides in hill districts.",
         "last_occurrences": [2023, 2021, 2019]},
    ],
}


# ── Public helpers ─────────────────────────────────────────────────────────────
def get_coordinates(district: str, state: str) -> Optional[Tuple[float, float]]:
    key = district.lower().strip()
    if key in INDIA_COORDS:
        return INDIA_COORDS[key]
    capital = _STATE_CAPITALS.get(state.lower().strip())
    if capital:
        return INDIA_COORDS.get(capital)
    return None


def get_crop_info(crop_name: str) -> Optional[Dict]:
    key = crop_name.strip().title()
    if key in CROP_SEASONAL_INFO:
        return CROP_SEASONAL_INFO[key]
    for k, v in CROP_SEASONAL_INFO.items():
        if k.lower() in key.lower() or key.lower() in k.lower():
            return v
    return None


def get_primary_season(crop_info: Dict) -> str:
    """Return 'kharif', 'rabi', 'zaid', or 'whole_year'."""
    return crop_info.get("primary_season", "kharif")


# ── WMO helpers ────────────────────────────────────────────────────────────────
def _wmo_to_emoji(code):
    if code is None: return "🌤️"
    if code == 0: return "☀️"
    if code in (1, 2): return "⛅"
    if code == 3: return "☁️"
    if code in (45, 48): return "🌫️"
    if code in (51, 53, 55, 56, 57): return "🌦️"
    if code in (61, 63, 65, 66, 67): return "🌧️"
    if code in (71, 73, 75, 77): return "❄️"
    if code in (80, 81, 82): return "🌧️"
    if code in (85, 86): return "🌨️"
    if code in (95, 96, 99): return "⛈️"
    return "🌤️"


def _wmo_to_description(code):
    if code is None: return "Partly Cloudy"
    if code == 0: return "Clear Sky"
    if code in (1, 2): return "Partly Cloudy"
    if code == 3: return "Overcast"
    if code in (45, 48): return "Foggy"
    if code in (51, 53, 55): return "Drizzle"
    if code in (61, 63, 65): return "Rain"
    if code in (71, 73, 75, 77): return "Snow"
    if code in (80, 81, 82): return "Rain Showers"
    if code in (95, 96, 99): return "Thunderstorm"
    return "Partly Cloudy"


# ── Module-level micro-helpers ─────────────────────────────────────────────────
def _append(target: list, src, i: int):
    if src and i < len(src) and src[i] is not None:
        target.append(src[i])


def _avg(lst):
    return round(sum(lst) / len(lst), 1) if lst else None


# ── Main service ──────────────────────────────────────────────────────────────
class HistoricalWeatherService:
    OPEN_METEO_ARCHIVE  = "https://archive-api.open-meteo.com/v1/archive"
    OPEN_METEO_FORECAST = "https://api.open-meteo.com/v1/forecast"

    def __init__(self):
        self.session = requests.Session()

    def _get(self, url, params, retries=3):
        for attempt in range(retries):
            try:
                r = self.session.get(url, params=params, timeout=25)
                r.raise_for_status()
                return r.json()
            except Exception as e:
                if attempt == retries - 1:
                    print(f"[HistoricalWeather] Error: {e}")
                    return None
                time.sleep(1.5)
        return None

    def get_monthly_climate_normals(self, lat: float, lon: float) -> Optional[Dict[int, Dict]]:
        """20-year (2004-2023) monthly averages via ERA5 archive."""
        params = {
            "latitude": lat, "longitude": lon,
            "start_date": "2004-01-01", "end_date": "2023-12-31",
            "daily": ("temperature_2m_max,temperature_2m_min,temperature_2m_mean,"
                      "precipitation_sum,wind_speed_10m_max,relative_humidity_2m_mean"),
            "timezone": "Asia/Kolkata",
        }
        data = self._get(self.OPEN_METEO_ARCHIVE, params)
        if not data or "daily" not in data:
            return None
        return self._aggregate_monthly_20yr(data["daily"])

    def _aggregate_monthly_20yr(self, daily: Dict) -> Dict[int, Dict]:
        from collections import defaultdict
        monthly = defaultdict(lambda: {
            "temp_max": [], "temp_min": [], "temp_mean": [],
            "precip": [], "wind": [], "humidity": []
        })
        for i, d_str in enumerate(daily.get("time", [])):
            try:
                m = int(d_str[5:7])
                _append(monthly[m]["temp_max"],  daily.get("temperature_2m_max"), i)
                _append(monthly[m]["temp_min"],  daily.get("temperature_2m_min"), i)
                _append(monthly[m]["temp_mean"], daily.get("temperature_2m_mean"), i)
                _append(monthly[m]["precip"],    daily.get("precipitation_sum"), i)
                _append(monthly[m]["wind"],      daily.get("wind_speed_10m_max"), i)
                _append(monthly[m]["humidity"],  daily.get("relative_humidity_2m_mean"), i)
            except (IndexError, TypeError):
                continue
        result = {}
        for m in range(1, 13):
            d = monthly[m]
            result[m] = {
                "month": m, "month_name": MONTH_NAMES[m - 1],
                "temp_mean":  _avg(d["temp_mean"]),
                "temp_max":   _avg(d["temp_max"]),
                "temp_min":   _avg(d["temp_min"]),
                # Total monthly precipitation averaged over 20 years
                "precipitation_mm": round(sum(d["precip"]) / 20, 1) if d["precip"] else 0,
                "wind_speed_kmh": _avg([x * 3.6 for x in d["wind"]]),
                "humidity": _avg(d["humidity"]),
            }
        return result

    def get_current_year_monthly(self, lat: float, lon: float) -> Optional[Dict[int, Dict]]:
        """Current year Jan→yesterday actuals."""
        current_year = datetime.now().year
        end = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
        start = f"{current_year}-01-01"
        params = {
            "latitude": lat, "longitude": lon,
            "start_date": start, "end_date": end,
            "daily": ("temperature_2m_max,temperature_2m_min,temperature_2m_mean,"
                      "precipitation_sum,wind_speed_10m_max,relative_humidity_2m_mean"),
            "timezone": "Asia/Kolkata",
        }
        data = self._get(self.OPEN_METEO_ARCHIVE, params)
        if not data or "daily" not in data:
            return None
        from collections import defaultdict
        monthly = defaultdict(lambda: {
            "temp_max": [], "temp_min": [], "temp_mean": [],
            "precip": [], "wind": [], "humidity": []
        })
        for i, d_str in enumerate(data["daily"].get("time", [])):
            try:
                m = int(d_str[5:7])
                _append(monthly[m]["temp_max"],  data["daily"].get("temperature_2m_max"), i)
                _append(monthly[m]["temp_min"],  data["daily"].get("temperature_2m_min"), i)
                _append(monthly[m]["temp_mean"], data["daily"].get("temperature_2m_mean"), i)
                _append(monthly[m]["precip"],    data["daily"].get("precipitation_sum"), i)
                _append(monthly[m]["wind"],      data["daily"].get("wind_speed_10m_max"), i)
                _append(monthly[m]["humidity"],  data["daily"].get("relative_humidity_2m_mean"), i)
            except (IndexError, TypeError):
                continue
        result = {}
        for m, d in monthly.items():
            result[m] = {
                "month": m, "month_name": MONTH_NAMES[m - 1],
                "temp_mean":  _avg(d["temp_mean"]),
                "temp_max":   _avg(d["temp_max"]),
                "temp_min":   _avg(d["temp_min"]),
                "precipitation_mm": round(sum(d["precip"]), 1),
                "wind_speed_kmh": _avg([x * 3.6 for x in d["wind"]]),
                "humidity": _avg(d["humidity"]),
            }
        return result

    def get_extended_forecast(self, lat: float, lon: float) -> Optional[List[Dict]]:
        """16-day daily forecast."""
        params = {
            "latitude": lat, "longitude": lon,
            "daily": ("temperature_2m_max,temperature_2m_min,precipitation_sum,"
                      "wind_speed_10m_max,relative_humidity_2m_max,weathercode"),
            "timezone": "Asia/Kolkata", "forecast_days": 16,
        }
        data = self._get(self.OPEN_METEO_FORECAST, params)
        if not data or "daily" not in data:
            return None
        daily = data["daily"]
        result = []
        for i, d_str in enumerate(daily.get("time", [])):
            try:
                dt = datetime.strptime(d_str, "%Y-%m-%d")
                tmax = daily["temperature_2m_max"][i]
                tmin = daily["temperature_2m_min"][i]
                result.append({
                    "date": d_str, "day": dt.strftime("%a"), "month": dt.month,
                    "temp_max": tmax, "temp_min": tmin,
                    "temp_avg": round((tmax + tmin) / 2, 1) if tmax and tmin else None,
                    "precipitation_mm": daily["precipitation_sum"][i] or 0,
                    "wind_speed_kmh": round(daily["wind_speed_10m_max"][i] * 3.6, 1)
                                       if daily["wind_speed_10m_max"][i] else 0,
                    "humidity": daily["relative_humidity_2m_max"][i],
                    "weather_code": daily["weathercode"][i],
                    "icon": _wmo_to_emoji(daily["weathercode"][i]),
                    "condition": _wmo_to_description(daily["weathercode"][i]),
                })
            except (IndexError, TypeError, KeyError):
                continue
        return result

    def get_yearly_seasonal_data(
        self, lat: float, lon: float, season: str
    ) -> Optional[List[Dict]]:
        """
        Rainfall + avg temp for the season window for each of the past 10 years.
        season: 'kharif'(Jun-Sep) | 'rabi'(Oct-Feb) | 'zaid'(Mar-May) | 'whole_year'
        """
        current_year = datetime.now().year
        yearly_data = []
        for yr in range(current_year - 10, current_year):
            start, end = _season_date_range(season, yr)
            params = {
                "latitude": lat, "longitude": lon,
                "start_date": start, "end_date": end,
                "daily": "precipitation_sum,temperature_2m_mean",
                "timezone": "Asia/Kolkata",
            }
            data = self._get(self.OPEN_METEO_ARCHIVE, params)
            if not data or "daily" not in data:
                continue
            daily = data["daily"]
            precip_total = sum(x for x in daily.get("precipitation_sum", []) if x is not None)
            temps = [x for x in daily.get("temperature_2m_mean", []) if x is not None]
            temp_avg = _avg(temps)
            yearly_data.append({
                "year": yr, "season": season,
                "total_rainfall_mm": round(precip_total, 1),
                "avg_temp": temp_avg,
            })
            time.sleep(0.3)
        return yearly_data

    def get_current_season_so_far(
        self, lat: float, lon: float, season: str,
        current_year: int, current_month: int
    ) -> float:
        """Actual rainfall for the current season's window up to today."""
        start, _ = _season_date_range(season, current_year)
        end = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
        # If season hasn't started yet this year, return 0
        if datetime.strptime(start, "%Y-%m-%d") > datetime.now():
            return 0.0
        params = {
            "latitude": lat, "longitude": lon,
            "start_date": start, "end_date": end,
            "daily": "precipitation_sum", "timezone": "Asia/Kolkata",
        }
        data = self._get(self.OPEN_METEO_ARCHIVE, params)
        if not data or "daily" not in data:
            return 0.0
        return round(
            sum(x for x in data["daily"].get("precipitation_sum", []) if x is not None), 1
        )

    def get_disaster_warnings(self, state: str, current_month: int) -> List[Dict]:
        warnings = []
        key = state.lower().strip()
        if key not in HISTORICAL_DISASTERS:
            return warnings
        for disaster in HISTORICAL_DISASTERS[key]:
            check_months = [(current_month + i - 1) % 12 + 1 for i in range(4)]
            overlap = [m for m in check_months if m in disaster["months"]]
            if overlap:
                warnings.append({
                    "event_type": disaster["event_type"],
                    "frequency": disaster["frequency"],
                    "affected_months": [MONTH_NAMES[m - 1] for m in disaster["months"]],
                    "upcoming_risk_months": [MONTH_NAMES[m - 1] for m in overlap],
                    "description": disaster["description"],
                    "last_occurrences": disaster["last_occurrences"],
                    "severity": "high" if disaster["frequency"] == "high" else "medium",
                })
        return warnings


def _season_date_range(season: str, year: int) -> Tuple[str, str]:
    """Return (start_date, end_date) strings for a given season in a given year."""
    s = season.lower()
    if s == "kharif":
        return (f"{year}-06-01", f"{year}-09-30")
    elif s == "rabi":
        # Rabi: Oct of `year` → Feb of `year+1`
        return (f"{year}-10-01", f"{year + 1}-02-28")
    elif s == "zaid":
        return (f"{year}-03-01", f"{year}-05-31")
    else:  # whole_year
        return (f"{year}-01-01", f"{year}-12-31")