import pandas as pd
import os
from typing import List, Dict, Optional
from pathlib import Path

class AdvisoryService:
    """Service to load and match crop advisories based on weather conditions"""
    
    def __init__(self, csv_path: str = None):
        """
        Initialize the advisory service
        
        Args:
            csv_path: Path to advisory.csv file. If None, uses default path.
        """
        if csv_path is None:
            # Default path relative to backend directory
            base_dir = Path(__file__).parent.parent
            csv_path = base_dir / "data" / "processed" / "advisory.csv"
        
        self.csv_path = csv_path
        self.advisories_df = None
        self.load_advisories()
    
    def load_advisories(self):
        """Load advisory data from CSV file"""
        try:
            if not os.path.exists(self.csv_path):
                raise FileNotFoundError(f"Advisory CSV not found at: {self.csv_path}")
            
            self.advisories_df = pd.read_csv(self.csv_path)
            
            # Validate required columns
            required_columns = [
                'crop_name', 'condition_type', 'threshold_min', 
                'threshold_max', 'parameter', 'advisory_message', 
                'priority', 'action_type'
            ]
            
            missing_columns = [col for col in required_columns if col not in self.advisories_df.columns]
            if missing_columns:
                raise ValueError(f"Missing required columns in CSV: {missing_columns}")
            
            # Clean data
            self.advisories_df['crop_name'] = self.advisories_df['crop_name'].str.strip()
            self.advisories_df['parameter'] = self.advisories_df['parameter'].str.strip()
            
            print(f"✅ Loaded {len(self.advisories_df)} advisories from CSV")
            
        except Exception as e:
            print(f"❌ Error loading advisory CSV: {e}")
            # Create empty dataframe as fallback
            self.advisories_df = pd.DataFrame(columns=[
                'crop_name', 'condition_type', 'threshold_min', 
                'threshold_max', 'parameter', 'advisory_message', 
                'priority', 'action_type'
            ])
    
    def get_advisories_for_crop(self, crop_name: str, weather_data: Dict) -> List[Dict]:
        """
        Get advisories for a specific crop based on current weather conditions
        
        Args:
            crop_name: Name of the crop (e.g., "Rice", "Wheat")
            weather_data: Dictionary containing current weather parameters
                Expected keys: temperature, humidity, rainfall, wind_speed
        
        Returns:
            List of matching advisories sorted by priority
        """
        if self.advisories_df is None or len(self.advisories_df) == 0:
            return []
        
        try:
            # Filter advisories for the specific crop
            crop_advisories = self.advisories_df[
                self.advisories_df['crop_name'].str.lower() == crop_name.lower()
            ].copy()
            
            if len(crop_advisories) == 0:
                return []
            
            matching_advisories = []
            
            # Map parameter names to weather data keys
            parameter_mapping = {
                'temperature': 'temperature',
                'temp': 'temperature',
                'humidity': 'humidity',
                'rain_24h': 'rainfall',
                'rainfall': 'rainfall',
                'wind_speed': 'wind_speed',
                'windspeed': 'wind_speed',
                'soil_moisture': 'humidity'  # Approximate with humidity if not available
            }
            
            # Check each advisory against weather conditions
            for _, advisory in crop_advisories.iterrows():
                parameter = advisory['parameter'].lower()
                threshold_min = float(advisory['threshold_min'])
                threshold_max = float(advisory['threshold_max'])
                
                # Get the weather value for this parameter
                weather_key = parameter_mapping.get(parameter)
                if not weather_key or weather_key not in weather_data:
                    continue
                
                weather_value = float(weather_data[weather_key])
                
                # Check if weather value is within threshold range
                if threshold_min <= weather_value <= threshold_max:
                    matching_advisories.append({
                        'crop_name': advisory['crop_name'],
                        'condition_type': advisory['condition_type'],
                        'parameter': advisory['parameter'],
                        'current_value': weather_value,
                        'threshold_min': threshold_min,
                        'threshold_max': threshold_max,
                        'advisory_message': advisory['advisory_message'],
                        'priority': advisory['priority'],
                        'action_type': advisory['action_type']
                    })
            
            # Sort by priority (high > medium > low)
            priority_order = {'high': 0, 'medium': 1, 'low': 2}
            matching_advisories.sort(
                key=lambda x: priority_order.get(x['priority'].lower(), 3)
            )
            
            return matching_advisories
            
        except Exception as e:
            print(f"Error getting advisories: {e}")
            return []
    
    def get_crop_specific_guidance(self, crop_name: str, weather_data: Dict) -> Dict:
        """
        Get comprehensive crop-specific guidance based on weather
        
        Args:
            crop_name: Name of the crop
            weather_data: Current weather data
        
        Returns:
            Dictionary with categorized guidance (irrigation, spraying, etc.)
        """
        advisories = self.get_advisories_for_crop(crop_name, weather_data)
        
        # Categorize advisories by action type
        guidance = {
            'irrigation': [],
            'spraying': [],
            'disease_warning': [],
            'general': [],
            'risk_level': 'Low'
        }
        
        high_priority_count = 0
        
        for advisory in advisories:
            action_type = advisory['action_type'].lower()
            message = advisory['advisory_message']
            
            if advisory['priority'].lower() == 'high':
                high_priority_count += 1
            
            if 'irrigation' in action_type:
                guidance['irrigation'].append(message)
            elif 'spray' in action_type:
                guidance['spraying'].append(message)
            elif 'disease' in action_type or 'warning' in action_type:
                guidance['disease_warning'].append(message)
            else:
                guidance['general'].append(message)
        
        # Determine overall risk level
        if high_priority_count >= 2:
            guidance['risk_level'] = 'High'
        elif high_priority_count == 1:
            guidance['risk_level'] = 'Medium'
        else:
            guidance['risk_level'] = 'Low'
        
        return guidance
    
    def get_all_crops(self) -> List[str]:
        """Get list of all crops available in advisory database"""
        if self.advisories_df is None or len(self.advisories_df) == 0:
            return []
        
        return sorted(self.advisories_df['crop_name'].unique().tolist())
    
    def get_weather_alerts(self, weather_data: Dict) -> List[Dict]:
        """
        Generate weather alerts based on current conditions
        
        Args:
            weather_data: Current weather data
        
        Returns:
            List of weather alerts
        """
        alerts = []
        
        # Temperature alerts
        temp = weather_data.get('temperature', 0)
        if temp > 35:
            alerts.append({
                'type': 'heat',
                'title': 'Heat Stress Alert',
                'description': f'High temperature detected ({temp}°C). Increase irrigation frequency and provide shade if needed.',
                'severity': 'high' if temp > 40 else 'medium',
                'icon': 'thermometer',
                'color': 'orange'
            })
        elif temp < 10:
            alerts.append({
                'type': 'cold',
                'title': 'Cold Weather Alert',
                'description': f'Low temperature detected ({temp}°C). Protect sensitive crops from frost damage.',
                'severity': 'medium',
                'icon': 'thermometer',
                'color': 'blue'
            })
        
        # Rainfall alerts
        rainfall = weather_data.get('rainfall', 0)
        if rainfall > 50:
            alerts.append({
                'type': 'rainfall',
                'title': 'Heavy Rain Warning',
                'description': f'Heavy rainfall detected ({rainfall}mm). Delay pesticide spraying and ensure proper drainage.',
                'severity': 'high',
                'icon': 'droplets',
                'color': 'red'
            })
        
        # Humidity alerts
        humidity = weather_data.get('humidity', 0)
        if humidity > 85:
            alerts.append({
                'type': 'humidity',
                'title': 'High Humidity Alert',
                'description': f'High humidity detected ({humidity}%). Ideal conditions for fungal diseases. Apply preventive fungicide treatment.',
                'severity': 'high' if humidity > 90 else 'medium',
                'icon': 'cloud',
                'color': 'yellow'
            })
        
        # Wind speed alerts
        wind_speed = weather_data.get('wind_speed', 0)
        if wind_speed > 15:
            alerts.append({
                'type': 'wind',
                'title': 'Strong Wind Alert',
                'description': f'Strong winds detected ({wind_speed} km/h). Do not conduct spraying operations. Avoid mechanical operations.',
                'severity': 'high' if wind_speed > 25 else 'medium',
                'icon': 'wind',
                'color': 'blue'
            })
        
        # If no alerts, add favorable condition message
        if len(alerts) == 0:
            alerts.append({
                'type': 'favorable',
                'title': 'Favorable Conditions',
                'description': 'Current weather conditions are suitable for farming operations.',
                'severity': 'info',
                'icon': 'check-circle',
                'color': 'green'
            })
        
        return alerts