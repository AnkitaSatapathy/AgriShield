"""
Historical Weather Service
Fetches 20-year historical weather data using Open-Meteo Archive API (free, no key required)
and supplementary IMD regional baseline knowledge.
"""

import requests
from datetime import datetime, date, timedelta
from typing import Dict, List, Optional, Tuple
import time


# ── Region → approx coordinates for major Indian cities/districts ─────────────
INDIA_COORDS = {
    # Odisha
    "bhubaneswar": (20.2961, 85.8245), "cuttack": (20.4625, 85.8828),
    "berhampur": (19.3150, 84.7941), "sambalpur": (21.4669, 83.9812),
    "puri": (19.8135, 85.8312), "rourkela": (22.2604, 84.8536),
    "balasore": (21.4942, 86.9335), "koraput": (18.8127, 82.7134),
    # Andhra Pradesh
    "visakhapatnam": (17.6868, 83.2185), "vijayawada": (16.5062, 80.6480),
    "guntur": (16.3067, 80.4365), "tirupati": (13.6288, 79.4192),
    "nellore": (14.4426, 79.9865), "kurnool": (15.8281, 78.0373),
    # Maharashtra
    "mumbai": (19.0760, 72.8777), "pune": (18.5204, 73.8567),
    "nagpur": (21.1458, 79.0882), "nashik": (19.9975, 73.7898),
    "aurangabad": (19.8762, 75.3433), "solapur": (17.6599, 75.9064),
    # Punjab
    "ludhiana": (30.9009, 75.8573), "amritsar": (31.6340, 74.8723),
    "jalandhar": (31.3260, 75.5762), "patiala": (30.3398, 76.3869),
    # Haryana
    "karnal": (29.6857, 76.9905), "ambala": (30.3782, 76.7767),
    "hisar": (29.1492, 75.7217),
    # Gujarat
    "ahmedabad": (23.0225, 72.5714), "surat": (21.1702, 72.8311),
    "vadodara": (22.3072, 73.1812), "rajkot": (22.3039, 70.8022),
    # Karnataka
    "bangalore": (12.9716, 77.5946), "bengaluru": (12.9716, 77.5946),
    "mysuru": (12.2958, 76.6394), "hubli": (15.3647, 75.1240),
    "mangaluru": (12.9141, 74.8560),
    # Tamil Nadu
    "chennai": (13.0827, 80.2707), "coimbatore": (11.0168, 76.9558),
    "madurai": (9.9252, 78.1198), "salem": (11.6643, 78.1460),
    # Kerala
    "thiruvananthapuram": (8.5241, 76.9366), "kochi": (9.9312, 76.2673),
    "kozhikode": (11.2588, 75.7804), "thrissur": (10.5276, 76.2144),
    # West Bengal
    "kolkata": (22.5726, 88.3639), "darjeeling": (27.0410, 88.2663),
    "siliguri": (26.7271, 88.3953), "asansol": (23.6835, 86.9718),
    # Madhya Pradesh
    "bhopal": (23.2599, 77.4126), "indore": (22.7196, 75.8577),
    "gwalior": (26.2183, 78.1828), "jabalpur": (23.1815, 79.9864),
    # Uttar Pradesh
    "lucknow": (26.8467, 80.9462), "kanpur": (26.4499, 80.3319),
    "varanasi": (25.3176, 82.9739), "agra": (27.1767, 78.0081),
    # Rajasthan
    "jaipur": (26.9124, 75.7873), "jodhpur": (26.2389, 73.0243),
    "udaipur": (24.5854, 73.7125), "bikaner": (28.0229, 73.3119),
    # Bihar
    "patna": (25.5941, 85.1376), "gaya": (24.7968, 84.9994),
    # Assam
    "guwahati": (26.1445, 91.7362), "dibrugarh": (27.4728, 95.0148),
    # Himachal Pradesh
    "shimla": (31.1048, 77.1734), "dharamsala": (32.2190, 76.3234),
    # Uttarakhand
    "dehradun": (30.3165, 78.0322), "haridwar": (29.9457, 78.1642),
    # Jharkhand
    "ranchi": (23.3441, 85.3096), "jamshedpur": (22.8046, 86.2029),
    # Chhattisgarh
    "raipur": (21.2514, 81.6296), "bilaspur": (22.0796, 82.1391),
    # Telangana
    "hyderabad": (17.3850, 78.4867), "warangal": (17.9784, 79.5941),
    # Goa
    "panaji": (15.4909, 73.8278), "margao": (15.2832, 73.9862),
    # Jammu & Kashmir
    "srinagar": (34.0837, 74.7973), "jammu": (32.7266, 74.8570),
    # Sikkim
    "gangtok": (27.3314, 88.6138),
    # Manipur
    "imphal": (24.8170, 93.9368),
    # Meghalaya
    "shillong": (25.5788, 91.8933),
    # Nagaland
    "kohima": (25.6751, 94.1086),
    # Tripura
    "agartala": (23.8315, 91.2868),
    # Mizoram
    "aizawl": (23.7307, 92.7173),
    # Arunachal Pradesh
    "itanagar": (27.0844, 93.6053),
}

# ── Known recurring disaster patterns ─────────────────────────────────────────
# Format: { "state_lower": [ { month, event_type, years_affected, description } ] }
HISTORICAL_DISASTERS = {
    "odisha": [
        {"months": [10, 11], "event_type": "Cyclone", "frequency": "high",
         "description": "Odisha coast faces cyclones in Oct-Nov (e.g., Fani 2019, Titli 2018, Phailin 2013). Crop damage can be severe.",
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
         "description": "Saurashtra and coastal Gujarat can receive heavy rain bursts.",
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
        {"months": [7, 8], "event_type": "Heavy Rain / Urban Flooding", "frequency": "medium",
         "description": "Konkan coast and Marathwada can face excess or deficit monsoon.",
         "last_occurrences": [2021, 2019, 2017]},
    ],
    "uttarakhand": [
        {"months": [7, 8, 9], "event_type": "Cloudburst / Landslide", "frequency": "medium",
         "description": "Hill districts vulnerable to cloudbursts and landslides during monsoon.",
         "last_occurrences": [2021, 2019, 2013]},
    ],
}

# ── Crop seasonal calendar (sowing window, harvest window, ideal parameters) ──
CROP_SEASONAL_INFO = {
    "Rice": {
        "seasons": ["Kharif"],
        "sowing_months": [6, 7],
        "harvest_months": [10, 11],
        "ideal_temp_range": (22, 35),
        "ideal_rainfall_monthly_mm": (150, 300),
        "ideal_humidity": (70, 90),
        "water_demand": "high",
        "heat_sensitive": False,
        "waterlog_sensitive": False,
    },
    "Wheat": {
        "seasons": ["Rabi"],
        "sowing_months": [10, 11],
        "harvest_months": [3, 4],
        "ideal_temp_range": (10, 25),
        "ideal_rainfall_monthly_mm": (25, 100),
        "ideal_humidity": (40, 70),
        "water_demand": "medium",
        "heat_sensitive": True,
        "waterlog_sensitive": True,
    },
    "Cotton": {
        "seasons": ["Kharif"],
        "sowing_months": [5, 6],
        "harvest_months": [10, 11, 12],
        "ideal_temp_range": (25, 35),
        "ideal_rainfall_monthly_mm": (80, 180),
        "ideal_humidity": (50, 75),
        "water_demand": "medium",
        "heat_sensitive": False,
        "waterlog_sensitive": True,
    },
    "Maize": {
        "seasons": ["Kharif", "Rabi"],
        "sowing_months": [6, 7],
        "harvest_months": [9, 10],
        "ideal_temp_range": (20, 32),
        "ideal_rainfall_monthly_mm": (60, 120),
        "ideal_humidity": (50, 80),
        "water_demand": "medium",
        "heat_sensitive": False,
        "waterlog_sensitive": True,
    },
    "Sugarcane": {
        "seasons": ["Kharif", "Whole Year"],
        "sowing_months": [2, 3, 10, 11],
        "harvest_months": [11, 12, 1, 2],
        "ideal_temp_range": (20, 35),
        "ideal_rainfall_monthly_mm": (100, 250),
        "ideal_humidity": (60, 85),
        "water_demand": "high",
        "heat_sensitive": False,
        "waterlog_sensitive": False,
    },
    "Soybean": {
        "seasons": ["Kharif"],
        "sowing_months": [6, 7],
        "harvest_months": [10, 11],
        "ideal_temp_range": (22, 32),
        "ideal_rainfall_monthly_mm": (80, 150),
        "ideal_humidity": (55, 80),
        "water_demand": "medium",
        "heat_sensitive": False,
        "waterlog_sensitive": True,
    },
    "Groundnut": {
        "seasons": ["Kharif", "Rabi"],
        "sowing_months": [6, 7],
        "harvest_months": [10, 11],
        "ideal_temp_range": (25, 35),
        "ideal_rainfall_monthly_mm": (60, 150),
        "ideal_humidity": (50, 75),
        "water_demand": "medium",
        "heat_sensitive": False,
        "waterlog_sensitive": True,
    },
    "Mustard": {
        "seasons": ["Rabi"],
        "sowing_months": [10, 11],
        "harvest_months": [2, 3],
        "ideal_temp_range": (10, 22),
        "ideal_rainfall_monthly_mm": (20, 80),
        "ideal_humidity": (40, 65),
        "water_demand": "low",
        "heat_sensitive": True,
        "waterlog_sensitive": True,
    },
    "Tomato": {
        "seasons": ["Rabi", "Kharif"],
        "sowing_months": [6, 7, 10, 11],
        "harvest_months": [9, 10, 1, 2],
        "ideal_temp_range": (18, 30),
        "ideal_rainfall_monthly_mm": (40, 100),
        "ideal_humidity": (50, 75),
        "water_demand": "medium",
        "heat_sensitive": True,
        "waterlog_sensitive": True,
    },
    "Potato": {
        "seasons": ["Rabi"],
        "sowing_months": [10, 11],
        "harvest_months": [2, 3],
        "ideal_temp_range": (10, 25),
        "ideal_rainfall_monthly_mm": (40, 100),
        "ideal_humidity": (50, 70),
        "water_demand": "medium",
        "heat_sensitive": True,
        "waterlog_sensitive": True,
    },
    "Onion": {
        "seasons": ["Rabi", "Kharif"],
        "sowing_months": [10, 11, 6, 7],
        "harvest_months": [3, 4, 9, 10],
        "ideal_temp_range": (13, 28),
        "ideal_rainfall_monthly_mm": (30, 90),
        "ideal_humidity": (40, 65),
        "water_demand": "medium",
        "heat_sensitive": False,
        "waterlog_sensitive": True,
    },
    "Pulses": {
        "seasons": ["Rabi", "Kharif"],
        "sowing_months": [6, 7, 10, 11],
        "harvest_months": [9, 10, 2, 3],
        "ideal_temp_range": (18, 30),
        "ideal_rainfall_monthly_mm": (40, 120),
        "ideal_humidity": (40, 70),
        "water_demand": "low",
        "heat_sensitive": False,
        "waterlog_sensitive": True,
    },
    "Mango": {
        "seasons": ["Summer"],
        "sowing_months": [7, 8],
        "harvest_months": [4, 5, 6],
        "ideal_temp_range": (24, 38),
        "ideal_rainfall_monthly_mm": (60, 150),
        "ideal_humidity": (50, 80),
        "water_demand": "medium",
        "heat_sensitive": False,
        "waterlog_sensitive": False,
    },
    "Banana": {
        "seasons": ["Whole Year"],
        "sowing_months": list(range(1, 13)),
        "harvest_months": list(range(1, 13)),
        "ideal_temp_range": (20, 35),
        "ideal_rainfall_monthly_mm": (100, 200),
        "ideal_humidity": (60, 85),
        "water_demand": "high",
        "heat_sensitive": False,
        "waterlog_sensitive": False,
    },
}

MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
               "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]


def get_coordinates(district: str, state: str) -> Optional[Tuple[float, float]]:
    """Get lat/lon for a given district or state capital."""
    key = district.lower().strip()
    if key in INDIA_COORDS:
        return INDIA_COORDS[key]
    # Try state capital fallbacks
    state_capitals = {
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
    capital = state_capitals.get(state.lower().strip())
    if capital:
        return INDIA_COORDS.get(capital)
    return None


class HistoricalWeatherService:
    """
    Fetches and processes historical weather data via Open-Meteo Archive API.
    No API key required.
    """

    OPEN_METEO_ARCHIVE = "https://archive-api.open-meteo.com/v1/archive"
    OPEN_METEO_FORECAST = "https://api.open-meteo.com/v1/forecast"
    OPEN_METEO_CLIMATE = "https://climate-api.open-meteo.com/v1/climate"

    def __init__(self):
        self.session = requests.Session()

    def _get(self, url: str, params: dict, retries: int = 3) -> Optional[dict]:
        for attempt in range(retries):
            try:
                r = self.session.get(url, params=params, timeout=20)
                r.raise_for_status()
                return r.json()
            except Exception as e:
                if attempt == retries - 1:
                    print(f"[HistoricalWeatherService] HTTP error: {e}")
                    return None
                time.sleep(1)
        return None

    # ─────────────────────────────────────────────────────────────────────────
    # 1.  20-year MONTHLY climate normals  (climate model via Open-Meteo)
    # ─────────────────────────────────────────────────────────────────────────
    def get_monthly_climate_normals(
        self, lat: float, lon: float
    ) -> Optional[Dict[str, List[float]]]:
        """
        Pull 20-year (2004-2023) monthly aggregated climate stats
        from Open-Meteo Climate API (ERA5-Land reanalysis).
        Returns dict with keys: month, temp_mean, temp_max, temp_min,
        precipitation_sum, wind_speed_mean, humidity_mean.
        """
        params = {
            "latitude": lat,
            "longitude": lon,
            "start_date": "2004-01-01",
            "end_date": "2023-12-31",
            "models": "EC_Earth3P_HR",
            "monthly": (
                "temperature_2m_mean,temperature_2m_max,temperature_2m_min,"
                "precipitation_sum,wind_speed_10m_mean"
            ),
        }
        data = self._get(self.OPEN_METEO_CLIMATE, params)
        if data and "monthly" in data:
            return data["monthly"]

        # Fallback: use ERA5 archive for 20 years, aggregate manually
        return self._get_archive_monthly_normals(lat, lon)

    def _get_archive_monthly_normals(
        self, lat: float, lon: float
    ) -> Optional[Dict]:
        """
        Use Open-Meteo Archive API to get daily data for 20 years
        and compute monthly averages.
        """
        params = {
            "latitude": lat,
            "longitude": lon,
            "start_date": "2004-01-01",
            "end_date": "2023-12-31",
            "daily": (
                "temperature_2m_max,temperature_2m_min,temperature_2m_mean,"
                "precipitation_sum,wind_speed_10m_max,relative_humidity_2m_mean"
            ),
            "timezone": "Asia/Kolkata",
        }
        data = self._get(self.OPEN_METEO_ARCHIVE, params)
        if not data or "daily" not in data:
            return None

        daily = data["daily"]
        from collections import defaultdict
        monthly = defaultdict(lambda: {
            "temp_max": [], "temp_min": [], "temp_mean": [],
            "precip": [], "wind": [], "humidity": []
        })

        for i, d_str in enumerate(daily.get("time", [])):
            try:
                m = int(d_str[5:7])  # 1-12
                if daily["temperature_2m_max"][i] is not None:
                    monthly[m]["temp_max"].append(daily["temperature_2m_max"][i])
                if daily["temperature_2m_min"][i] is not None:
                    monthly[m]["temp_min"].append(daily["temperature_2m_min"][i])
                if daily["temperature_2m_mean"][i] is not None:
                    monthly[m]["temp_mean"].append(daily["temperature_2m_mean"][i])
                if daily["precipitation_sum"][i] is not None:
                    monthly[m]["precip"].append(daily["precipitation_sum"][i])
                if daily["wind_speed_10m_max"][i] is not None:
                    monthly[m]["wind"].append(daily["wind_speed_10m_max"][i])
                rh = daily.get("relative_humidity_2m_mean", [None] * (i + 1))[i]
                if rh is not None:
                    monthly[m]["humidity"].append(rh)
            except (IndexError, TypeError):
                continue

        result = {}
        def _avg(lst): return round(sum(lst) / len(lst), 1) if lst else None
        def _sum_avg(lst, days=30): return round(sum(lst[-days*20:]) / 20, 1) if lst else None

        for m in range(1, 13):
            d = monthly[m]
            result[m] = {
                "month": m,
                "month_name": MONTH_NAMES[m - 1],
                "temp_mean": _avg(d["temp_mean"]),
                "temp_max": _avg(d["temp_max"]),
                "temp_min": _avg(d["temp_min"]),
                "precipitation_mm": _sum_avg(d["precip"]),
                "wind_speed_kmh": _avg([x * 3.6 for x in d["wind"]]),
                "humidity": _avg(d["humidity"]),
            }
        return result

    # ─────────────────────────────────────────────────────────────────────────
    # 2.  Current-year monthly data (Jan→today) vs. same period historical avg
    # ─────────────────────────────────────────────────────────────────────────
    def get_current_year_monthly(
        self, lat: float, lon: float
    ) -> Optional[Dict[int, Dict]]:
        """Returns monthly aggregates for Jan 1 this year through yesterday."""
        current_year = datetime.now().year
        end = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
        start = f"{current_year}-01-01"

        params = {
            "latitude": lat,
            "longitude": lon,
            "start_date": start,
            "end_date": end,
            "daily": (
                "temperature_2m_max,temperature_2m_min,temperature_2m_mean,"
                "precipitation_sum,wind_speed_10m_max,relative_humidity_2m_mean"
            ),
            "timezone": "Asia/Kolkata",
        }
        data = self._get(self.OPEN_METEO_ARCHIVE, params)
        if not data or "daily" not in data:
            return None

        daily = data["daily"]
        from collections import defaultdict
        monthly = defaultdict(lambda: {
            "temp_max": [], "temp_min": [], "temp_mean": [],
            "precip": [], "wind": [], "humidity": []
        })

        for i, d_str in enumerate(daily.get("time", [])):
            try:
                m = int(d_str[5:7])
                if daily["temperature_2m_max"][i] is not None:
                    monthly[m]["temp_max"].append(daily["temperature_2m_max"][i])
                if daily["temperature_2m_min"][i] is not None:
                    monthly[m]["temp_min"].append(daily["temperature_2m_min"][i])
                if daily["temperature_2m_mean"][i] is not None:
                    monthly[m]["temp_mean"].append(daily["temperature_2m_mean"][i])
                if daily["precipitation_sum"][i] is not None:
                    monthly[m]["precip"].append(daily["precipitation_sum"][i])
                if daily["wind_speed_10m_max"][i] is not None:
                    monthly[m]["wind"].append(daily["wind_speed_10m_max"][i])
                rh = daily.get("relative_humidity_2m_mean", [None] * (i + 1))[i]
                if rh is not None:
                    monthly[m]["humidity"].append(rh)
            except (IndexError, TypeError):
                continue

        def _avg(lst): return round(sum(lst) / len(lst), 1) if lst else None
        def _sum(lst): return round(sum(lst), 1) if lst else 0

        result = {}
        for m, d in monthly.items():
            result[m] = {
                "month": m,
                "month_name": MONTH_NAMES[m - 1],
                "temp_mean": _avg(d["temp_mean"]),
                "temp_max": _avg(d["temp_max"]),
                "temp_min": _avg(d["temp_min"]),
                "precipitation_mm": _sum(d["precip"]),
                "wind_speed_kmh": _avg([x * 3.6 for x in d["wind"]]),
                "humidity": _avg(d["humidity"]),
            }
        return result

    # ─────────────────────────────────────────────────────────────────────────
    # 3.  Short-range extended forecast  (Open-Meteo free, 16 days)
    # ─────────────────────────────────────────────────────────────────────────
    def get_extended_forecast(
        self, lat: float, lon: float
    ) -> Optional[List[Dict]]:
        """Get next 16-day daily forecast."""
        params = {
            "latitude": lat,
            "longitude": lon,
            "daily": (
                "temperature_2m_max,temperature_2m_min,precipitation_sum,"
                "wind_speed_10m_max,relative_humidity_2m_max,weathercode"
            ),
            "timezone": "Asia/Kolkata",
            "forecast_days": 16,
        }
        data = self._get(self.OPEN_METEO_FORECAST, params)
        if not data or "daily" not in data:
            return None

        daily = data["daily"]
        result = []
        for i, d_str in enumerate(daily.get("time", [])):
            try:
                dt = datetime.strptime(d_str, "%Y-%m-%d")
                result.append({
                    "date": d_str,
                    "day": dt.strftime("%a"),
                    "month": dt.month,
                    "temp_max": daily["temperature_2m_max"][i],
                    "temp_min": daily["temperature_2m_min"][i],
                    "temp_avg": round(
                        (daily["temperature_2m_max"][i] + daily["temperature_2m_min"][i]) / 2, 1
                    ) if daily["temperature_2m_max"][i] and daily["temperature_2m_min"][i] else None,
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

    # ─────────────────────────────────────────────────────────────────────────
    # 4.  Year-over-year monsoon / seasonal comparison
    # ─────────────────────────────────────────────────────────────────────────
    def get_yearly_seasonal_data(
        self, lat: float, lon: float, season: str = "kharif"
    ) -> Optional[List[Dict]]:
        """
        Get total monsoon (Jun-Sep) or Rabi (Oct-Feb) rainfall and avg temp
        for each of the past 10 years.
        """
        if season.lower() in ("kharif", "monsoon"):
            season_months = [6, 7, 8, 9]
        elif season.lower() == "rabi":
            season_months = [10, 11, 12, 1, 2]
        else:
            season_months = list(range(1, 13))

        current_year = datetime.now().year
        yearly_data = []

        for yr in range(current_year - 10, current_year):
            # Build date range including all season months
            if season.lower() == "rabi":
                start = f"{yr}-10-01"
                end = f"{yr + 1}-02-28"
            else:
                start = f"{yr}-06-01"
                end = f"{yr}-09-30"

            params = {
                "latitude": lat,
                "longitude": lon,
                "start_date": start,
                "end_date": end,
                "daily": "precipitation_sum,temperature_2m_mean",
                "timezone": "Asia/Kolkata",
            }
            data = self._get(self.OPEN_METEO_ARCHIVE, params)
            if not data or "daily" not in data:
                continue

            daily = data["daily"]
            precip_total = sum(
                x for x in daily.get("precipitation_sum", []) if x is not None
            )
            temps = [x for x in daily.get("temperature_2m_mean", []) if x is not None]
            temp_avg = round(sum(temps) / len(temps), 1) if temps else None

            yearly_data.append({
                "year": yr,
                "season": season,
                "total_rainfall_mm": round(precip_total, 1),
                "avg_temp": temp_avg,
            })
            time.sleep(0.3)  # be polite to free API

        return yearly_data

    # ─────────────────────────────────────────────────────────────────────────
    # 5.  Known disaster patterns for the state
    # ─────────────────────────────────────────────────────────────────────────
    def get_disaster_warnings(
        self, state: str, current_month: int
    ) -> List[Dict]:
        """Return disaster patterns relevant to the given state + next 3 months."""
        warnings = []
        key = state.lower().strip()
        if key not in HISTORICAL_DISASTERS:
            return warnings

        for disaster in HISTORICAL_DISASTERS[key]:
            affected_months = disaster["months"]
            # Warn if any of the next 3 months (including current) overlaps
            check_months = [(current_month + i - 1) % 12 + 1 for i in range(4)]
            overlap = [m for m in check_months if m in affected_months]
            if overlap:
                month_names = [MONTH_NAMES[m - 1] for m in overlap]
                warnings.append({
                    "event_type": disaster["event_type"],
                    "frequency": disaster["frequency"],
                    "affected_months": [MONTH_NAMES[m - 1] for m in affected_months],
                    "upcoming_risk_months": month_names,
                    "description": disaster["description"],
                    "last_occurrences": disaster["last_occurrences"],
                    "severity": "high" if disaster["frequency"] == "high" else "medium",
                })
        return warnings


# ─────────────────────────────────────────────────────────────────────────────
# WMO weather code helpers
# ─────────────────────────────────────────────────────────────────────────────
def _wmo_to_emoji(code: Optional[int]) -> str:
    if code is None:
        return "🌤️"
    if code == 0:
        return "☀️"
    if code in (1, 2):
        return "⛅"
    if code == 3:
        return "☁️"
    if code in (45, 48):
        return "🌫️"
    if code in (51, 53, 55, 56, 57):
        return "🌦️"
    if code in (61, 63, 65, 66, 67):
        return "🌧️"
    if code in (71, 73, 75, 77):
        return "❄️"
    if code in (80, 81, 82):
        return "🌧️"
    if code in (85, 86):
        return "🌨️"
    if code in (95, 96, 99):
        return "⛈️"
    return "🌤️"


def _wmo_to_description(code: Optional[int]) -> str:
    if code is None:
        return "Partly Cloudy"
    if code == 0:
        return "Clear Sky"
    if code in (1, 2):
        return "Partly Cloudy"
    if code == 3:
        return "Overcast"
    if code in (45, 48):
        return "Foggy"
    if code in (51, 53, 55):
        return "Drizzle"
    if code in (61, 63, 65):
        return "Rain"
    if code in (71, 73, 75, 77):
        return "Snow"
    if code in (80, 81, 82):
        return "Rain Showers"
    if code in (95, 96, 99):
        return "Thunderstorm"
    return "Partly Cloudy"


def get_crop_info(crop_name: str) -> Optional[Dict]:
    """Get crop seasonal info, with fuzzy fallback."""
    key = crop_name.strip().title()
    if key in CROP_SEASONAL_INFO:
        return CROP_SEASONAL_INFO[key]
    # Fuzzy match
    for k, v in CROP_SEASONAL_INFO.items():
        if k.lower() in key.lower() or key.lower() in k.lower():
            return v
    return None