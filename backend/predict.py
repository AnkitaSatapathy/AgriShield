"""
AgriShield - Prediction Module
Contains the prediction logic for crop failure risk assessment
"""

import pickle
import numpy as np
import pandas as pd
import os

print("Loading models and encoders...")

# ============================================================================
# LOAD ALL MODELS AND DATA
# ============================================================================

try:
    with open('../models/crop_failure_model.pkl', 'rb') as f:
        model = pickle.load(f)
    
    with open('../models/scaler.pkl', 'rb') as f:
        scaler = pickle.load(f)
    
    with open('../models/crop_encoder.pkl', 'rb') as f:
        crop_encoder = pickle.load(f)
    
    with open('../models/state_encoder.pkl', 'rb') as f:
        state_encoder = pickle.load(f)
    
    with open('../models/district_info.pkl', 'rb') as f:
        district_info = pickle.load(f)
    
    with open('../models/crop_list.pkl', 'rb') as f:
        crop_list = pickle.load(f)
    
    with open('../models/state_list.pkl', 'rb') as f:
        state_list = pickle.load(f)
    
    with open('../models/district_list.pkl', 'rb') as f:
        district_list = pickle.load(f)
    
    print("✅ All models loaded successfully!")

except FileNotFoundError as e:
    print(f"❌ Error loading models: {e}")
    print("Please run train_model.ipynb first!")
    # Create empty lists to prevent errors
    crop_list = []
    state_list = []
    district_list = []

# ============================================================================
# PREDICTION FUNCTION
# ============================================================================

def predict_crop_failure(
    crop: str,
    state: str,
    district: str,
    season: str,
    temperature: float,
    rainfall: float,
    humidity: float,
    disaster_occurred: int = 0
):
    """
    Predict crop failure risk based on input parameters
    
    Args:
        crop (str): Crop name
        state (str): State name
        district (str): District name
        season (str): Season (Kharif, Rabi, Summer, Whole Year)
        temperature (float): Average temperature in Celsius
        rainfall (float): Total expected rainfall in mm
        humidity (float): Average humidity percentage
        disaster_occurred (int): 0 = No disaster, 1 = Disaster occurred
    
    Returns:
        dict: Prediction results with risk score, level, explanation, and recommendations
    """
    
    try:
        # Encode crop
        crop_encoded = crop_encoder.transform([crop])[0]
    except:
        return {
            'error': f'Crop "{crop}" not found in training data',
            'available_crops': crop_list[:20]
        }
    
    try:
        # Encode state
        state_encoded = state_encoder.transform([state])[0]
    except:
        return {
            'error': f'State "{state}" not found in training data',
            'available_states': state_list
        }
    
    # Get district soil information
    district_key = f"{district}, {state}"
    if district_key in district_info:
        soil_quality = district_info[district_key]['soil_quality']
        soil_type = district_info[district_key]['soil_type']
    else:
        # Use default values if district not found
        soil_quality = 0.70
        soil_type = 'Alluvial'
    
    # Season encoding
    season_map = {
        'Kharif': 1, 'Rabi': 2, 'Summer': 3, 'Zaid': 3,
        'Whole Year': 4, 'Autumn': 5, 'Winter': 6
    }
    season_encoded = season_map.get(season, 4)
    
    # Calculate rainfall deviation from seasonal average
    season_rainfall_avg = {
        'Kharif': 1200, 'Rabi': 60, 'Summer': 100, 'Whole Year': 800
    }
    avg_rainfall = season_rainfall_avg.get(season, 600)
    rainfall_deviation = ((rainfall - avg_rainfall) / (avg_rainfall + 1)) * 100
    
    # Calculate temperature deviation from seasonal average
    season_temp_avg = {
        'Kharif': 28, 'Rabi': 20, 'Summer': 35, 'Whole Year': 27
    }
    avg_temp = season_temp_avg.get(season, 27)
    temperature_deviation = ((temperature - avg_temp) / (avg_temp + 1)) * 100
    
    # Calculate severity score
    severity_score = disaster_occurred * 2
    
    # Create feature vector (must match training feature order)
    feature_data = {
        'Crop_Encoded': crop_encoded,
        'State_Encoded': state_encoded,
        'Season_Encoded': season_encoded,
        'Avg_Temperature': temperature,
        'Total_Rainfall': rainfall,
        'Avg_Humidity': humidity,
        'Soil_Quality_Score': soil_quality,
        'Rainfall_Deviation': rainfall_deviation,
        'Temperature_Deviation': temperature_deviation,
        'Disaster_Occurred': disaster_occurred,
        'Severity_Score': severity_score
    }
    
    features = pd.DataFrame([feature_data])
    
    # Scale features
    features_scaled = scaler.transform(features)
    
    # Predict probability
    failure_probability = model.predict_proba(features_scaled)[0][1]
    risk_score = round(failure_probability * 100, 2)
    
    # Determine risk level
    if risk_score < 30:
        risk_level = "Low"
        color = "green"
    elif risk_score < 60:
        risk_level = "Medium"
        color = "orange"
    else:
        risk_level = "High"
        color = "red"
    
    # Generate explanation
    explanation = generate_explanation(
        risk_score, rainfall_deviation, temperature_deviation,
        soil_quality, disaster_occurred
    )
    
    # Get recommendations
    recommendations = get_recommendations(risk_level, crop, season)
    
    return {
        'risk_score': risk_score,
        'risk_level': risk_level,
        'color': color,
        'explanation': explanation,
        'recommendations': recommendations,
        'district_info': {
            'soil_type': soil_type,
            'soil_quality': soil_quality,
            'state': state,
            'district': district
        }
    }

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def generate_explanation(risk_score, rainfall_dev, temp_dev, soil_quality, disaster):
    """Generate human-readable explanation of risk factors"""
    
    factors = []
    
    # Check rainfall deviation
    if abs(rainfall_dev) > 25:
        if rainfall_dev > 0:
            factors.append("⚠️  Rainfall is significantly higher than seasonal average for this region")
        else:
            factors.append("⚠️  Rainfall deficit detected - below seasonal average for this region")
    
    # Check temperature deviation
    if abs(temp_dev) > 15:
        if temp_dev > 0:
            factors.append("🌡️ Temperature is higher than seasonal average")
        else:
            factors.append("❄️  Temperature is lower than seasonal average")
    
    # Check soil quality
    if soil_quality < 0.65:
        factors.append("🌱 Soil quality is below optimal for this region")
    
    # Check disaster
    if disaster == 1:
        factors.append("🌪️  Recent disaster event reported in this region")
    
    if not factors:
        return "✅ Weather and soil conditions appear favorable for crop growth in this region."
    
    return "Risk factors identified:\n• " + "\n• ".join(factors)


def get_recommendations(risk_level, crop, season):
    """Get actionable recommendations based on risk level"""
    
    if risk_level == "Low":
        return [
            f"✅ Conditions are favorable for {crop} cultivation in {season} season",
            "Continue with planned cultivation practices",
            "Monitor weather forecasts regularly",
            "Maintain proper irrigation schedule based on rainfall",
            "Follow standard fertilizer application guidelines",
            "Keep pest and disease control measures ready"
        ]
    
    elif risk_level == "Medium":
        return [
            f"⚠️  Moderate risk detected for {crop} in {season} season",
            "Consider purchasing crop insurance for financial protection",
            "Prepare for potential adverse weather conditions",
            "Ensure adequate water storage and drainage systems are in place",
            "Monitor crop health closely and take preventive measures",
            "Consult local agricultural extension officer for guidance",
            "Consider intercropping or mixed cropping strategies to reduce risk",
            "Keep emergency funds ready for contingencies"
        ]
    
    else:  # High risk
        return [
            f"🚨 High risk for {crop} cultivation detected in {season} season",
            "Strongly consider alternative crops suitable for current conditions",
            "If proceeding with cultivation, MUST invest in comprehensive crop insurance",
            "Implement advanced risk mitigation strategies immediately",
            "Consider delaying planting if weather forecast shows improvement",
            "Consult agricultural experts and extension officers before making decisions",
            "Prepare detailed financial contingency plans",
            "Explore government assistance and subsidy programs",
            "Document all farming activities thoroughly for insurance claims"
        ]


# ============================================================================
# TEST FUNCTION (for direct script execution)
# ============================================================================

if __name__ == "__main__":
    print("\n" + "="*80)
    print(" "*25 + "TESTING PREDICTION MODULE")
    print("="*80 + "\n")
    
    # Test with sample data
    print("🧪 Test Prediction:")
    print("-"*80)
    
    # Use first available crop and state
    test_crop = crop_list[0] if len(crop_list) > 0 else "Rice"
    test_state = state_list[0] if len(state_list) > 0 else "Punjab"
    
    print(f"Crop: {test_crop}")
    print(f"State: {test_state}")
    print(f"Season: Kharif")
    print(f"Temperature: 28°C")
    print(f"Rainfall: 1200mm")
    print(f"Humidity: 75%")
    print(f"Disaster: No\n")
    
    result = predict_crop_failure(
        crop=test_crop,
        state=test_state,
        district=test_state,
        season="Kharif",
        temperature=28,
        rainfall=1200,
        humidity=75,
        disaster_occurred=0
    )
    
    if 'error' not in result:
        print("="*80)
        print("📊 PREDICTION RESULTS")
        print("="*80)
        print(f"\n🎯 Risk Score: {result['risk_score']}%")
        print(f"🚦 Risk Level: {result['risk_level']}")
        print(f"🌍 Soil Type: {result['district_info']['soil_type']}")
        print(f"\n💡 Explanation:\n{result['explanation']}")
        print(f"\n📋 Recommendations:")
        for i, rec in enumerate(result['recommendations'][:3], 1):
            print(f"   {i}. {rec}")
    else:
        print(f"❌ Error: {result['error']}")
    
    print("\n" + "="*80)
    print("✅ Prediction module is working correctly!")
    print("="*80 + "\n")