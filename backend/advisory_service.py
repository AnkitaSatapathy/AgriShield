"""
Advisory Service - Provides crop-specific weather-based advisories
"""

import pandas as pd
import os

class AdvisoryService:
    def __init__(self, csv_path="data/processed/advisory.csv"):
        """Initialize the advisory service with the CSV data"""
        self.csv_path = csv_path
        self.advisory_data = None
        self.load_advisory_data()
    
    def load_advisory_data(self):
        """Load advisory data from CSV"""
        try:
            if not os.path.exists(self.csv_path):
                print(f"Warning: Advisory CSV not found at {self.csv_path}")
                self.advisory_data = pd.DataFrame()
                return
            
            self.advisory_data = pd.read_csv(self.csv_path)
            print(f"✅ Loaded {len(self.advisory_data)} advisory records from CSV")
            
            # Normalize column names
            self.advisory_data.columns = self.advisory_data.columns.str.lower().str.strip()
            
            # Normalize crop names for matching
            if 'crop_name' in self.advisory_data.columns:
                self.advisory_data['crop_name'] = self.advisory_data['crop_name'].str.strip().str.title()
            
            print(f"Available crops in CSV: {self.advisory_data['crop_name'].unique()[:10]}")
            
        except Exception as e:
            print(f"Error loading advisory data: {str(e)}")
            self.advisory_data = pd.DataFrame()
    
    def match_parameter(self, csv_parameter, weather_conditions):
        """
        Match CSV parameter names to weather condition values
        Handles multiple parameter name variations
        """
        param_lower = csv_parameter.lower().strip()
        
        # Temperature variations
        if param_lower in ['temperature', 'temp', 'temp_max', 'temp_min', 'avg_temp']:
            return weather_conditions.get('temperature', 0)
        
        # Rainfall variations
        elif param_lower in ['rainfall', 'rain', 'rain_24h', 'precipitation', 'precip']:
            return weather_conditions.get('rainfall', 0)
        
        # Humidity variations
        elif param_lower in ['humidity', 'rh', 'relative_humidity', 'avg_humidity']:
            return weather_conditions.get('humidity', 0)
        
        # Wind speed variations
        elif param_lower in ['wind_speed', 'wind', 'windspeed', 'avg_wind']:
            return weather_conditions.get('wind_speed', 0)
        
        # Soil moisture variations
        elif param_lower in ['soil_moisture', 'moisture', 'soil_water', 'sm']:
            return weather_conditions.get('soil_moisture', 0)
        
        return None
    
    def get_advisories(self, crop_name, weather_conditions):
        """
        Get weather-based advisories for a specific crop
        
        Args:
            crop_name: Name of the crop
            weather_conditions: Dict with keys: temperature, humidity, rainfall, wind_speed, soil_moisture
        
        Returns:
            List of advisory objects
        """
        if self.advisory_data.empty:
            print("Advisory data is empty")
            return []
        
        # Normalize crop name for matching
        crop_name_normalized = crop_name.strip().title()
        
        # Filter for the specific crop (case-insensitive)
        crop_advisories = self.advisory_data[
            self.advisory_data['crop_name'].str.lower() == crop_name_normalized.lower()
        ].copy()
        
        if crop_advisories.empty:
            print(f"No advisories found for crop: {crop_name}")
            print(f"Available crops: {self.advisory_data['crop_name'].unique()[:20]}")
            return []
        
        print(f"Found {len(crop_advisories)} total advisories for {crop_name}")
        
        triggered_advisories = []
        
        # Check each advisory against weather conditions
        for _, advisory in crop_advisories.iterrows():
            try:
                parameter = advisory.get('parameter', '')
                threshold_min = float(advisory.get('threshold_min', 0))
                threshold_max = float(advisory.get('threshold_max', 999999))
                
                # Get the corresponding weather parameter value
                param_value = self.match_parameter(parameter, weather_conditions)
                
                if param_value is None:
                    continue
                
                # Check if condition is triggered
                if threshold_min <= param_value <= threshold_max:
                    triggered_advisories.append({
                        'crop': crop_name,
                        'condition_type': advisory.get('condition_type', ''),
                        'parameter': parameter,
                        'current_value': param_value,
                        'threshold_min': threshold_min,
                        'threshold_max': threshold_max,
                        'advisory_message': advisory.get('advisory_message', 'No advisory available'),
                        'priority': advisory.get('priority', 'medium'),
                        'action_type': advisory.get('action_type', 'general')
                    })
            except Exception as e:
                print(f"Error processing advisory: {str(e)}")
                continue
        
        # Remove duplicate messages
        unique_advisories = []
        seen_messages = set()
        
        for adv in triggered_advisories:
            message = adv['advisory_message']
            if message and message not in seen_messages:
                seen_messages.add(message)
                unique_advisories.append(adv)
        
        print(f"Triggered {len(unique_advisories)} unique advisories for {crop_name}")
        return unique_advisories
    
    def calculate_risk_level(self, advisories):
        """Calculate overall risk level based on advisories"""
        if not advisories:
            return "Low"
        
        high_priority_count = sum(1 for adv in advisories if adv.get('priority', '').lower() == 'high')
        medium_priority_count = sum(1 for adv in advisories if adv.get('priority', '').lower() == 'medium')
        
        if high_priority_count >= 2:
            return "High"
        elif high_priority_count >= 1 or medium_priority_count >= 3:
            return "Medium"
        else:
            return "Low"
    
    def get_available_crops(self):
        """Get list of all crops available in the advisory database"""
        if self.advisory_data.empty:
            return []
        
        if 'crop_name' in self.advisory_data.columns:
            return sorted(self.advisory_data['crop_name'].unique().tolist())
        return []
    
    def get_crop_specific_guidance(self, crop_name, weather_conditions):
        """
        Get comprehensive crop-specific guidance organized by activity
        Returns minimum 5 points per category
        """
        advisories = self.get_advisories(crop_name, weather_conditions)
        
        guidance = {
            'irrigation': [],
            'sowing': [],
            'spraying': [],
            'harvesting': [],
            'general': []
        }
        
        # Group advisories by action type
        for adv in advisories:
            action_type = adv.get('action_type', 'general').lower()
            message = adv.get('advisory_message', '')
            
            if not message:
                continue
            
            if 'irrigation' in action_type or 'water' in action_type:
                guidance['irrigation'].append(message)
            elif 'sowing' in action_type or 'planting' in action_type or 'seed' in action_type:
                guidance['sowing'].append(message)
            elif 'spray' in action_type or 'pesticide' in action_type or 'disease' in action_type:
                guidance['spraying'].append(message)
            elif 'harvest' in action_type:
                guidance['harvesting'].append(message)
            elif 'drainage' in action_type:
                guidance['irrigation'].append(message)  # Add drainage to irrigation
            else:
                guidance['general'].append(message)
        
        # Remove duplicates from each category
        for key in guidance:
            guidance[key] = list(set(guidance[key]))
        
        # Add generic advice if we don't have enough specific points (minimum 3 per category)
        if len(guidance['irrigation']) < 3:
            guidance['irrigation'].extend([
                f"Monitor soil moisture levels regularly for {crop_name}.",
                f"Adjust irrigation schedule based on crop growth stage and weather conditions.",
                f"Use drip or sprinkler irrigation for water efficiency in {crop_name} cultivation."
            ])
        
        if len(guidance['sowing']) < 3:
            guidance['sowing'].extend([
                f"Choose disease-resistant {crop_name} varieties for your region.",
                f"Ensure proper seed treatment before sowing {crop_name}.",
                f"Maintain optimal plant spacing for {crop_name} as per recommended practices."
            ])
        
        if len(guidance['spraying']) < 3:
            guidance['spraying'].extend([
                f"Monitor {crop_name} for early signs of pest infestation.",
                f"Use integrated pest management practices for {crop_name}.",
                f"Apply pesticides during early morning or late evening for {crop_name}."
            ])
        
        if len(guidance['harvesting']) < 3:
            guidance['harvesting'].extend([
                f"Harvest {crop_name} during dry weather conditions for better quality.",
                f"Check moisture content before harvesting {crop_name}.",
                f"Ensure proper post-harvest handling of {crop_name} to minimize losses."
            ])
        
        if len(guidance['general']) < 2:
            guidance['general'].extend([
                f"Conduct regular field inspections for {crop_name}.",
                f"Maintain proper farm hygiene and remove diseased plant material from {crop_name} fields."
            ])
        
        # Remove duplicates again after adding generic advice
        for key in guidance:
            guidance[key] = list(set(guidance[key]))
        
        return guidance