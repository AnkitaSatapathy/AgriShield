import os
import requests
from datetime import datetime, timedelta
from dotenv import load_dotenv
from typing import Dict, List, Optional

load_dotenv()

class WeatherService:
    """Service to fetch real-time weather data from OpenWeatherMap API"""
    
    def __init__(self):
        self.api_key = os.getenv("OPENWEATHER_API_KEY")
        self.base_url = os.getenv("OPENWEATHER_BASE_URL", "https://api.openweathermap.org/data/2.5")
        
        if not self.api_key:
            raise ValueError("OPENWEATHER_API_KEY not found in environment variables")
    
    def get_current_weather(self, district: str, state: str) -> Optional[Dict]:
        """
        Fetch current weather data for a given district and state
        
        Args:
            district: District name (e.g., "Ludhiana")
            state: State name (e.g., "Punjab")
        
        Returns:
            Dictionary containing current weather data
        """
        try:
            # Construct location query
            location = f"{district},{state},IN"
            
            # API endpoint for current weather
            url = f"{self.base_url}/weather"
            params = {
                "q": location,
                "appid": self.api_key,
                "units": "metric"  # Celsius
            }
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            
            # Extract and format relevant data
            weather_data = {
                "location": f"{district}, {state}",
                "temperature": round(data["main"]["temp"], 1),
                "feels_like": round(data["main"]["feels_like"], 1),
                "temp_min": round(data["main"]["temp_min"], 1),
                "temp_max": round(data["main"]["temp_max"], 1),
                "humidity": data["main"]["humidity"],
                "pressure": data["main"]["pressure"],
                "wind_speed": round(data["wind"]["speed"] * 3.6, 1),  # Convert m/s to km/h
                "wind_direction": data["wind"].get("deg", 0),
                "cloud_cover": data["clouds"]["all"],
                "condition": data["weather"][0]["main"],
                "description": data["weather"][0]["description"],
                "icon": data["weather"][0]["icon"],
                "visibility": data.get("visibility", 10000) / 1000,  # Convert to km
                "sunrise": datetime.fromtimestamp(data["sys"]["sunrise"]).strftime("%H:%M"),
                "sunset": datetime.fromtimestamp(data["sys"]["sunset"]).strftime("%H:%M"),
                "timestamp": datetime.fromtimestamp(data["dt"]).isoformat(),
                "coordinates": {
                    "lat": data["coord"]["lat"],
                    "lon": data["coord"]["lon"]
                }
            }
            
            # Check if rain data exists (last 1h or 3h)
            rainfall = 0
            if "rain" in data:
                rainfall = data["rain"].get("1h", 0) or data["rain"].get("3h", 0)
            
            weather_data["rainfall"] = round(rainfall, 2)
            
            return weather_data
            
        except requests.exceptions.RequestException as e:
            print(f"Error fetching current weather: {e}")
            return None
        except KeyError as e:
            print(f"Error parsing weather data: {e}")
            return None
    
    def get_forecast(self, district: str, state: str) -> Optional[List[Dict]]:
        """
        Fetch 7-day weather forecast for a given district and state
        
        Args:
            district: District name
            state: State name
        
        Returns:
            List of dictionaries containing daily forecast data
        """
        try:
            # Construct location query
            location = f"{district},{state},IN"
            
            # API endpoint for forecast (5 day / 3 hour)
            url = f"{self.base_url}/forecast"
            params = {
                "q": location,
                "appid": self.api_key,
                "units": "metric"
            }
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            
            # Process forecast data - group by day
            daily_forecasts = {}
            
            for item in data["list"]:
                dt = datetime.fromtimestamp(item["dt"])
                date_key = dt.strftime("%Y-%m-%d")
                day_name = dt.strftime("%a")
                
                if date_key not in daily_forecasts:
                    daily_forecasts[date_key] = {
                        "date": date_key,
                        "day": day_name,
                        "temps": [],
                        "humidity": [],
                        "rainfall": [],
                        "wind_speed": [],
                        "conditions": [],
                        "icons": []
                    }
                
                daily_forecasts[date_key]["temps"].append(item["main"]["temp"])
                daily_forecasts[date_key]["humidity"].append(item["main"]["humidity"])
                daily_forecasts[date_key]["wind_speed"].append(item["wind"]["speed"] * 3.6)
                daily_forecasts[date_key]["conditions"].append(item["weather"][0]["main"])
                daily_forecasts[date_key]["icons"].append(item["weather"][0]["icon"])
                
                # Rainfall
                rain = 0
                if "rain" in item:
                    rain = item["rain"].get("3h", 0)
                daily_forecasts[date_key]["rainfall"].append(rain)
            
            # Calculate daily aggregates
            forecast_list = []
            for date_key in sorted(daily_forecasts.keys())[:7]:  # Limit to 7 days
                day_data = daily_forecasts[date_key]
                
                # Get most common condition and icon
                condition = max(set(day_data["conditions"]), key=day_data["conditions"].count)
                icon = max(set(day_data["icons"]), key=day_data["icons"].count)
                
                # Map icon to emoji
                icon_map = {
                    "01": "☀️",  # Clear
                    "02": "🌤️",  # Few clouds
                    "03": "⛅",  # Scattered clouds
                    "04": "☁️",  # Broken clouds
                    "09": "🌧️",  # Shower rain
                    "10": "🌦️",  # Rain
                    "11": "⛈️",  # Thunderstorm
                    "13": "❄️",  # Snow
                    "50": "🌫️"   # Mist
                }
                
                icon_prefix = icon[:2]
                emoji = icon_map.get(icon_prefix, "🌤️")
                
                forecast_list.append({
                    "date": date_key,
                    "day": day_data["day"],
                    "temp_high": round(max(day_data["temps"]), 1),
                    "temp_low": round(min(day_data["temps"]), 1),
                    "temp_avg": round(sum(day_data["temps"]) / len(day_data["temps"]), 1),
                    "humidity_avg": round(sum(day_data["humidity"]) / len(day_data["humidity"])),
                    "rainfall": round(sum(day_data["rainfall"]), 1),
                    "wind_speed_avg": round(sum(day_data["wind_speed"]) / len(day_data["wind_speed"]), 1),
                    "condition": condition,
                    "icon": emoji
                })
            
            return forecast_list
            
        except requests.exceptions.RequestException as e:
            print(f"Error fetching forecast: {e}")
            return None
        except KeyError as e:
            print(f"Error parsing forecast data: {e}")
            return None
    
    def get_complete_weather(self, district: str, state: str) -> Optional[Dict]:
        """
        Fetch both current weather and forecast in one call
        
        Args:
            district: District name
            state: State name
        
        Returns:
            Dictionary containing both current weather and forecast
        """
        current = self.get_current_weather(district, state)
        forecast = self.get_forecast(district, state)
        
        if current is None:
            return None
        
        return {
            "current": current,
            "forecast": forecast or []
        }